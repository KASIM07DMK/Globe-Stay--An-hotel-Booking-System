import uuid
from datetime import datetime, timedelta, timezone, date
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func
from app.models import (
    Booking, BookingStatus, BookingRoom, Guest, Hotel, RoomType,
    RoomInventory, User, Payment, PaymentStatus
)
from app.schemas.booking_schema import (
    CreateBookingRequest, BookingOut, BookingRoomOut, GuestOut,
    PaginatedBookingsResponse, HotelAvailabilityResponse,
    RoomAvailabilityItem, DayAvailabilityItem, AdminRoomTypeOut,
    UpdateRoomInventoryRequest, ReconcileHoldsResponse
)
from app.core.config import settings
from app.core.exceptions import (
    NotFoundError, InventoryUnavailableError, BookingHoldExpiredError,
    ForbiddenError
)
from app.services import notification_service


class BookingService:
    TAX_RATE = Decimal("0.12")     # 12% taxes
    SERVICE_FEE = Decimal("9.99")  # flat service fee per booking

    def __init__(self, db: Session):
        self.db = db

    def create_booking(self, user: User, data: CreateBookingRequest) -> BookingOut:
        # First reap any expired holds to free up stale rooms
        self.reap_expired_holds()

        # 1. Validate hotel exists
        hotel = self.db.query(Hotel).filter(Hotel.id == data.hotel_id).first()
        if not hotel:
            raise NotFoundError(entity="Hotel", identifier=data.hotel_id)

        # 2. Validate dates
        today = datetime.now(timezone.utc).date()
        if data.check_in >= data.check_out:
            raise InventoryUnavailableError(detail="Check-out must be after check-in.")
        if data.check_in < today:
            raise InventoryUnavailableError(detail="Check-in date cannot be in the past.")

        num_nights = (data.check_out - data.check_in).days

        # 3. Check inventory and compute prices for each room selection
        booking_rooms_data = []
        subtotal = Decimal("0.00")

        # Sorted by room_type_id for consistent locking order
        sorted_room_selections = sorted(data.rooms, key=lambda r: r.room_type_id)

        for room_sel in sorted_room_selections:
            room_type = self.db.query(RoomType).filter(
                RoomType.id == room_sel.room_type_id,
                RoomType.hotel_id == data.hotel_id,
                RoomType.status == "active"
            ).first()
            if not room_type:
                # Graceful fallback: try finding an active room type for this hotel
                room_type = self.db.query(RoomType).filter(
                    RoomType.hotel_id == data.hotel_id,
                    RoomType.status == "active"
                ).first()
                if not room_type:
                    raise NotFoundError(entity="RoomType", identifier=room_sel.room_type_id)

            # Check availability chronologically for each date in range (Deadlock-Free Ordering)
            for day_offset in range(num_nights):
                stay_date = data.check_in + timedelta(days=day_offset)

                inv_query = self.db.query(RoomInventory).filter(
                    RoomInventory.room_type_id == room_type.id,
                    RoomInventory.stay_date == stay_date
                )

                # Use with_for_update if PostgreSQL/MySQL
                if self.db.bind and self.db.bind.dialect.name != "sqlite":
                    inv_query = inv_query.with_for_update()

                inventory = inv_query.first()

                if inventory:
                    available = inventory.available_rooms
                else:
                    available = room_type.total_inventory_count

                if available < room_sel.quantity:
                    raise InventoryUnavailableError(
                        detail=f"Only {available} rooms available for '{room_type.name}' on {stay_date}. Requested {room_sel.quantity}."
                    )

            # Price per room per night
            room_total = room_type.base_price * room_sel.quantity * num_nights
            subtotal += room_total

            booking_rooms_data.append({
                "room_type": room_type,
                "quantity": room_sel.quantity,
                "price_snapshot": room_type.base_price,
                "currency": room_type.currency or hotel.base_currency
            })

        # 4. Compute taxes and fees
        taxes = (subtotal * self.TAX_RATE).quantize(Decimal("0.01"))
        fees = self.SERVICE_FEE
        total_amount = subtotal + taxes + fees

        # 5. Generate booking reference
        booking_ref = f"GS-{uuid.uuid4().hex[:12].upper()}"

        # 6. Compute guest count
        guest_count = len(data.guests) if data.guests else 1

        # 7. Hold expiry (default 15 minutes)
        hold_expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=settings.BOOKING_HOLD_DURATION_MINUTES
        )

        # 8. Create booking
        booking = Booking(
            booking_reference=booking_ref,
            user_id=user.id,
            hotel_id=data.hotel_id,
            status=BookingStatus.PENDING_PAYMENT,
            check_in=data.check_in,
            check_out=data.check_out,
            guest_count=guest_count,
            base_currency=hotel.base_currency,
            display_currency=data.display_currency,
            exchange_rate=Decimal("1.0000"),
            subtotal=subtotal,
            taxes=taxes,
            fees=fees,
            discount=Decimal("0.00"),
            total_amount=total_amount,
            hold_expires_at=hold_expires_at,
            cancellation_deadline=hold_expires_at
        )
        self.db.add(booking)
        self.db.flush()

        # 9. Create booking rooms
        for room_data in booking_rooms_data:
            br = BookingRoom(
                booking_id=booking.id,
                room_type_id=room_data["room_type"].id,
                quantity=room_data["quantity"],
                price_snapshot=room_data["price_snapshot"],
                currency=room_data["currency"]
            )
            self.db.add(br)

        # 10. Create guest records
        for guest_info in (data.guests or []):
            guest = Guest(
                booking_id=booking.id,
                guest_name=guest_info.guest_name,
                guest_type=guest_info.guest_type
            )
            self.db.add(guest)

        # 11. Hold inventory chronologically
        for room_data in booking_rooms_data:
            for day_offset in range(num_nights):
                stay_date = data.check_in + timedelta(days=day_offset)
                inv = self.db.query(RoomInventory).filter(
                    RoomInventory.room_type_id == room_data["room_type"].id,
                    RoomInventory.stay_date == stay_date
                ).first()

                if inv:
                    inv.held_rooms += room_data["quantity"]
                else:
                    inv = RoomInventory(
                        room_type_id=room_data["room_type"].id,
                        stay_date=stay_date,
                        total_rooms=room_data["room_type"].total_inventory_count,
                        held_rooms=room_data["quantity"],
                        booked_rooms=0
                    )
                    self.db.add(inv)

        self.db.commit()
        self.db.refresh(booking)
        # Phase 10: Send booking confirmation email (console logger)
        try:
            primary_guest = booking.guests[0] if booking.guests else None
            notification_service.send_booking_confirmation(
                to_email=user.email,
                guest_name=primary_guest.full_name if primary_guest else user.full_name,
                booking_reference=booking.booking_reference,
                hotel_name=booking.hotel.name if booking.hotel else "GlobeStay Hotel",
                check_in=booking.check_in,
                check_out=booking.check_out,
                total_amount=float(booking.total_amount),
                currency=booking.currency,
            )
        except Exception:
            pass  # Never block booking creation due to notification failure
        return self._build_booking_out(booking)

    def get_hotel_availability(
        self, hotel_id: int, check_in: date, check_out: date, rooms: int = 1
    ) -> HotelAvailabilityResponse:
        """Phase 6: Real-time room availability across date ranges."""
        self.reap_expired_holds()

        hotel = self.db.query(Hotel).filter(Hotel.id == hotel_id).first()
        if not hotel:
            raise NotFoundError(entity="Hotel", identifier=hotel_id)

        if check_in >= check_out:
            raise InventoryUnavailableError(detail="Check-out date must be strictly after check-in date.")

        num_nights = (check_out - check_in).days
        room_types = self.db.query(RoomType).filter(
            RoomType.hotel_id == hotel_id,
            RoomType.status == "active"
        ).all()

        results: List[RoomAvailabilityItem] = []

        for rt in room_types:
            min_available = rt.total_inventory_count
            daily_breakdown: List[DayAvailabilityItem] = []

            for offset in range(num_nights):
                stay_date = check_in + timedelta(days=offset)
                inv = self.db.query(RoomInventory).filter(
                    RoomInventory.room_type_id == rt.id,
                    RoomInventory.stay_date == stay_date
                ).first()

                if inv:
                    avail = inv.available_rooms
                    held = inv.held_rooms
                    booked = inv.booked_rooms
                    total = inv.total_rooms
                else:
                    avail = rt.total_inventory_count
                    held = 0
                    booked = 0
                    total = rt.total_inventory_count

                if avail < min_available:
                    min_available = avail

                daily_breakdown.append(
                    DayAvailabilityItem(
                        date=stay_date,
                        available=avail,
                        held=held,
                        booked=booked,
                        total=total
                    )
                )

            is_available = min_available >= rooms

            results.append(
                RoomAvailabilityItem(
                    room_type_id=rt.id,
                    room_type_name=rt.name,
                    maximum_occupancy=rt.maximum_occupancy,
                    bed_configuration=rt.bed_configuration,
                    base_price=rt.base_price,
                    currency=rt.currency or hotel.base_currency,
                    min_available=max(0, min_available),
                    is_available=is_available,
                    status=rt.status,
                    daily_breakdown=daily_breakdown
                )
            )

        return HotelAvailabilityResponse(
            hotel_id=hotel_id,
            check_in=check_in,
            check_out=check_out,
            nights=num_nights,
            requested_rooms=rooms,
            room_types=results
        )

    def reap_expired_holds(self) -> ReconcileHoldsResponse:
        """Phase 6: Reconciles all expired holds without touching confirmed bookings."""
        now = datetime.now(timezone.utc)
        expired_bookings = self.db.query(Booking).options(
            joinedload(Booking.booking_rooms)
        ).filter(
            Booking.status == BookingStatus.PENDING_PAYMENT,
            Booking.hold_expires_at != None,
            Booking.hold_expires_at <= now
        ).all()

        reaped_count = 0
        released_rooms = 0

        for booking in expired_bookings:
            num_nights = (booking.check_out - booking.check_in).days
            for br in booking.booking_rooms:
                for day_offset in range(num_nights):
                    stay_date = booking.check_in + timedelta(days=day_offset)
                    inv = self.db.query(RoomInventory).filter(
                        RoomInventory.room_type_id == br.room_type_id,
                        RoomInventory.stay_date == stay_date
                    ).first()
                    if inv and inv.held_rooms > 0:
                        reclaim = min(inv.held_rooms, br.quantity)
                        inv.held_rooms -= reclaim
                        released_rooms += reclaim

            booking.status = BookingStatus.CANCELLED
            reaped_count += 1

        if reaped_count > 0:
            self.db.commit()

        return ReconcileHoldsResponse(
            reaped_bookings_count=reaped_count,
            released_rooms_count=released_rooms,
            message=f"Successfully reaped {reaped_count} expired holds, releasing {released_rooms} rooms."
        )

    def get_user_bookings(
        self, user: User, page: int = 1, limit: int = 10, status_filter: Optional[str] = None
    ) -> PaginatedBookingsResponse:
        page = max(1, page)
        limit = max(1, min(50, limit))
        skip = (page - 1) * limit

        query = self.db.query(Booking).options(
            joinedload(Booking.hotel),
            joinedload(Booking.booking_rooms).joinedload(BookingRoom.room_type),
            joinedload(Booking.guests)
        ).filter(Booking.user_id == user.id)

        if status_filter:
            # Normalize to uppercase so "confirmed", "CONFIRMED", "Confirmed" all work
            normalized = status_filter.strip().upper()
            try:
                status_enum = BookingStatus(normalized)
                query = query.filter(Booking.status == status_enum)
            except ValueError:
                # Unknown status — return empty result set
                query = query.filter(False)

        total = query.count()
        bookings = query.order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()

        items = [self._build_booking_out(b) for b in bookings]
        total_pages = (total + limit - 1) // limit if total > 0 else 1

        return PaginatedBookingsResponse(
            items=items, total=total, page=page, limit=limit, total_pages=total_pages
        )

    def get_booking_detail(self, user: User, booking_id: int) -> BookingOut:
        booking = self._get_user_booking(user, booking_id)
        return self._build_booking_out(booking)

    def cancel_booking(self, user: User, booking_id: int, reason: Optional[str] = None) -> BookingOut:
        booking = self._get_user_booking(user, booking_id)

        if booking.status not in (BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED):
            raise ForbiddenError(detail=f"Cannot cancel a booking with status '{booking.status.value}'.")

        # Release inventory
        num_nights = (booking.check_out - booking.check_in).days
        for br in booking.booking_rooms:
            for day_offset in range(num_nights):
                stay_date = booking.check_in + timedelta(days=day_offset)
                inv = self.db.query(RoomInventory).filter(
                    RoomInventory.room_type_id == br.room_type_id,
                    RoomInventory.stay_date == stay_date
                ).first()
                if inv:
                    if booking.status == BookingStatus.PENDING_PAYMENT:
                        inv.held_rooms = max(0, inv.held_rooms - br.quantity)
                    else:
                        inv.booked_rooms = max(0, inv.booked_rooms - br.quantity)

        # Process refund for confirmed bookings
        if booking.status == BookingStatus.CONFIRMED:
            for payment in booking.payments:
                if payment.status == PaymentStatus.COMPLETED:
                    payment.status = PaymentStatus.REFUNDED

        booking.status = BookingStatus.CANCELLED
        booking.cancellation_reason = reason or "Cancelled by guest"
        booking.cancelled_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(booking)
        # Phase 10: Send cancellation email
        try:
            refund_amount = sum(
                float(p.amount) for p in booking.payments if p.status == PaymentStatus.REFUNDED
            ) or None
            notification_service.send_booking_cancellation(
                to_email=user.email,
                guest_name=user.full_name,
                booking_reference=booking.booking_reference,
                hotel_name=booking.hotel.name if booking.hotel else "GlobeStay Hotel",
                reason=booking.cancellation_reason,
                refund_amount=refund_amount,
                currency=booking.currency,
            )
        except Exception:
            pass
        return self._build_booking_out(booking)

    def get_all_bookings_admin(
        self, page: int = 1, limit: int = 20, status_filter: Optional[str] = None
    ) -> PaginatedBookingsResponse:
        """Admin endpoint: list all bookings."""
        page = max(1, page)
        limit = max(1, min(100, limit))
        skip = (page - 1) * limit

        query = self.db.query(Booking).options(
            joinedload(Booking.hotel),
            joinedload(Booking.booking_rooms).joinedload(BookingRoom.room_type),
            joinedload(Booking.guests)
        )

        if status_filter:
            # Normalize to uppercase so "confirmed", "CONFIRMED", "Confirmed" all work
            normalized_admin = status_filter.strip().upper()
            try:
                status_enum_admin = BookingStatus(normalized_admin)
                query = query.filter(Booking.status == status_enum_admin)
            except ValueError:
                query = query.filter(False)

        total = query.count()
        bookings = query.order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()

        items = [self._build_booking_out(b) for b in bookings]
        total_pages = (total + limit - 1) // limit if total > 0 else 1

        return PaginatedBookingsResponse(
            items=items, total=total, page=page, limit=limit, total_pages=total_pages
        )

    def get_admin_room_types(self) -> List[AdminRoomTypeOut]:
        """Admin endpoint: list room types with aggregated holds and bookings."""
        room_types = self.db.query(RoomType).options(
            joinedload(RoomType.hotel)
        ).all()

        results = []
        for rt in room_types:
            # Active holds
            holds = self.db.query(func.coalesce(func.sum(RoomInventory.held_rooms), 0)).filter(
                RoomInventory.room_type_id == rt.id
            ).scalar()

            # Active bookings
            booked = self.db.query(func.coalesce(func.sum(RoomInventory.booked_rooms), 0)).filter(
                RoomInventory.room_type_id == rt.id
            ).scalar()

            results.append(
                AdminRoomTypeOut(
                    id=rt.id,
                    hotel_id=rt.hotel_id,
                    hotel_name=rt.hotel.name if rt.hotel else None,
                    name=rt.name,
                    description=rt.description,
                    maximum_occupancy=rt.maximum_occupancy,
                    bed_configuration=rt.bed_configuration,
                    base_price=rt.base_price,
                    currency=rt.currency or "USD",
                    total_inventory_count=rt.total_inventory_count,
                    status=rt.status,
                    active_holds=int(holds or 0),
                    active_bookings=int(booked or 0)
                )
            )

        return results

    def update_room_inventory_admin(
        self, room_type_id: int, data: UpdateRoomInventoryRequest
    ) -> AdminRoomTypeOut:
        """Admin endpoint: update room capacity, rate, or status."""
        rt = self.db.query(RoomType).options(joinedload(RoomType.hotel)).filter(
            RoomType.id == room_type_id
        ).first()

        if not rt:
            raise NotFoundError(entity="RoomType", identifier=room_type_id)

        if data.total_inventory_count is not None:
            diff = data.total_inventory_count - rt.total_inventory_count
            rt.total_inventory_count = data.total_inventory_count
            # Update future inventory records
            future_invs = self.db.query(RoomInventory).filter(
                RoomInventory.room_type_id == rt.id,
                RoomInventory.stay_date >= datetime.now(timezone.utc).date()
            ).all()
            for inv in future_invs:
                inv.total_rooms = data.total_inventory_count

        if data.base_price is not None:
            rt.base_price = data.base_price

        if data.status is not None:
            rt.status = data.status

        self.db.commit()
        self.db.refresh(rt)

        holds = self.db.query(func.coalesce(func.sum(RoomInventory.held_rooms), 0)).filter(
            RoomInventory.room_type_id == rt.id
        ).scalar()
        booked = self.db.query(func.coalesce(func.sum(RoomInventory.booked_rooms), 0)).filter(
            RoomInventory.room_type_id == rt.id
        ).scalar()

        return AdminRoomTypeOut(
            id=rt.id,
            hotel_id=rt.hotel_id,
            hotel_name=rt.hotel.name if rt.hotel else None,
            name=rt.name,
            description=rt.description,
            maximum_occupancy=rt.maximum_occupancy,
            bed_configuration=rt.bed_configuration,
            base_price=rt.base_price,
            currency=rt.currency or "USD",
            total_inventory_count=rt.total_inventory_count,
            status=rt.status,
            active_holds=int(holds or 0),
            active_bookings=int(booked or 0)
        )

    def _get_user_booking(self, user: User, booking_id: int) -> Booking:
        booking = self.db.query(Booking).options(
            joinedload(Booking.hotel),
            joinedload(Booking.booking_rooms).joinedload(BookingRoom.room_type),
            joinedload(Booking.guests),
            joinedload(Booking.payments)
        ).filter(
            Booking.id == booking_id,
            Booking.user_id == user.id
        ).first()
        if not booking:
            raise NotFoundError(entity="Booking", identifier=booking_id)
        return booking

    def _build_booking_out(self, booking: Booking) -> BookingOut:
        hotel = booking.hotel
        rooms = [
            BookingRoomOut(
                id=br.id,
                room_type_id=br.room_type_id,
                room_type_name=br.room_type.name if br.room_type else None,
                quantity=br.quantity,
                price_snapshot=br.price_snapshot,
                currency=br.currency
            )
            for br in booking.booking_rooms
        ]
        guests = [
            GuestOut(id=g.id, guest_name=g.guest_name, guest_type=g.guest_type)
            for g in booking.guests
        ]

        # Determine cancellation eligibility
        is_cancellable = booking.status in (BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED)
        cancellation_policy = hotel.cancellation_policy if hotel else "Free Cancellation"
        if hotel and hotel.cancellation_policy == "Non-refundable" and booking.status == BookingStatus.CONFIRMED:
            is_cancellable = False

        # Payment details
        payment_reference = None
        payment_status = None
        if booking.payments:
            latest_payment = booking.payments[-1]
            payment_reference = latest_payment.provider_reference
            payment_status = latest_payment.status.value

        return BookingOut(
            id=booking.id,
            booking_reference=booking.booking_reference,
            user_id=booking.user_id,
            hotel_id=booking.hotel_id,
            hotel_name=hotel.name if hotel else None,
            hotel_city=hotel.city if hotel else None,
            hotel_country=hotel.country if hotel else None,
            hotel_hero_image=hotel.hero_image if hotel else None,
            status=booking.status.value,
            check_in=booking.check_in,
            check_out=booking.check_out,
            guest_count=booking.guest_count,
            base_currency=booking.base_currency,
            display_currency=booking.display_currency,
            exchange_rate=booking.exchange_rate,
            subtotal=booking.subtotal,
            taxes=booking.taxes,
            fees=booking.fees,
            discount=booking.discount,
            total_amount=booking.total_amount,
            cancellation_deadline=booking.cancellation_deadline.isoformat() if booking.cancellation_deadline else None,
            hold_expires_at=booking.hold_expires_at.isoformat() if booking.hold_expires_at else None,
            cancellation_reason=booking.cancellation_reason,
            cancellation_policy=cancellation_policy,
            is_cancellable=is_cancellable,
            payment_reference=payment_reference,
            payment_status=payment_status,
            rooms=rooms,
            guests=guests,
            created_at=booking.created_at.isoformat() if booking.created_at else None
        )
