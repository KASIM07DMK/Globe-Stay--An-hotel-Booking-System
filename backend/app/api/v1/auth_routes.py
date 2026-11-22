from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.auth_service import AuthService
from app.core.deps import get_current_user
from app.models import User
from app.schemas.auth_schema import (
    RegisterRequest, LoginRequest, TokenResponse, RefreshRequest,
    UserOut, ProfileUpdateRequest, PasswordChangeRequest
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201,
             summary="Register a new customer account")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.register(data)


@router.post("/login", response_model=TokenResponse, summary="Login with email and password")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.login(data)


@router.post("/refresh", response_model=TokenResponse, summary="Refresh access token")
def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.refresh_token(data.refresh_token)


@router.get("/me", response_model=UserOut, summary="Get current user profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.patch("/me", response_model=UserOut, summary="Update profile")
def update_profile(
    data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = AuthService(db)
    return service.update_profile(current_user, data)


@router.post("/change-password", summary="Change password")
def change_password(
    data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = AuthService(db)
    return service.change_password(current_user, data)
