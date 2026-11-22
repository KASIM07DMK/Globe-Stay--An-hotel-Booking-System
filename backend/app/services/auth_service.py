from sqlalchemy.orm import Session
from app.models import User, UserRole
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.config import settings
from app.core.exceptions import UnauthorizedError
from app.schemas.auth_schema import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserOut,
    ProfileUpdateRequest,
    PasswordChangeRequest
)
from fastapi import HTTPException, status


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register(self, data: RegisterRequest) -> TokenResponse:
        # Check existing email
        existing = self.db.query(User).filter(User.email == data.email.lower().strip()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"message": "An account with this email already exists.", "code": "EMAIL_EXISTS"}
            )

        user = User(
            full_name=data.full_name.strip(),
            email=data.email.lower().strip(),
            password_hash=hash_password(data.password),
            role=UserRole.CUSTOMER,
            is_active=True
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return self._generate_tokens(user)

    def login(self, data: LoginRequest) -> TokenResponse:
        user = self.db.query(User).filter(
            User.email == data.email.lower().strip()
        ).first()

        if not user or not verify_password(data.password, user.password_hash):
            raise UnauthorizedError(detail="Invalid email or password.")

        if not user.is_active:
            raise UnauthorizedError(detail="Account has been deactivated.")

        return self._generate_tokens(user)

    def refresh_token(self, refresh_token_str: str) -> TokenResponse:
        payload = decode_token(refresh_token_str)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedError(detail="Invalid or expired refresh token.")

        user = self.db.query(User).filter(
            User.id == int(payload["sub"]),
            User.is_active == True
        ).first()
        if not user:
            raise UnauthorizedError(detail="User not found.")

        return self._generate_tokens(user)

    def get_profile(self, user: User) -> UserOut:
        return UserOut.model_validate(user)

    def update_profile(self, user: User, data: ProfileUpdateRequest) -> UserOut:
        if data.full_name is not None:
            user.full_name = data.full_name.strip()
        self.db.commit()
        self.db.refresh(user)
        return UserOut.model_validate(user)

    def change_password(self, user: User, data: PasswordChangeRequest) -> dict:
        if not verify_password(data.current_password, user.password_hash):
            raise UnauthorizedError(detail="Current password is incorrect.")
        user.password_hash = hash_password(data.new_password)
        self.db.commit()
        return {"message": "Password updated successfully."}

    def _generate_tokens(self, user: User) -> TokenResponse:
        access_token = create_access_token(subject=user.id, role=user.role.value)
        refresh_token = create_refresh_token(subject=user.id)
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
