from fastapi import APIRouter
from app.core.config import settings
from app.api.v1.hotel_routes import router as hotel_router
from app.api.v1.auth_routes import router as auth_router
from app.api.v1.booking_routes import router as booking_router
from app.api.v1.payment_routes import router as payment_router
from app.api.v1.review_routes import router as review_router
from app.api.v1.admin_routes import router as admin_router
from app.api.v1.currency_routes import router as currency_router

api_router = APIRouter()

@api_router.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "env": settings.APP_ENV,
        "version": "1.0.0"
    }

# Mount sub-routers
api_router.include_router(auth_router)
api_router.include_router(hotel_router)
api_router.include_router(booking_router)
api_router.include_router(payment_router)
api_router.include_router(review_router)
api_router.include_router(admin_router)
api_router.include_router(currency_router)
