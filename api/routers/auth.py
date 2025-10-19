from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from datetime import timedelta

from database import get_db
from models import User
from schemas import UserCreate, UserResponse, UserLogin, Token
from crud import create_user
from auth import authenticate_user, create_access_token, get_current_active_user, ACCESS_TOKEN_EXPIRE_MINUTES, get_user_by_email
from config import settings

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Yeni kullanıcı kaydı"""
    # Email zaten var mı kontrol et
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    return create_user(db=db, user=user)

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Kullanıcı girişi - JWT token döner"""
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Mevcut kullanıcı bilgilerini getir. Auth kapalıysa guest döndür."""
    if settings.DISABLE_AUTH:
        now = datetime.now(timezone.utc)
        return User(
            id=0,
            email="guest@example.com",
            username="guest",
            full_name="Guest",
            hashed_password="",
            is_active=True,
            is_superuser=True,
            created_at=now,
            updated_at=now,
        )
    return current_user

@router.post("/logout")
async def logout():
    """İstemci tarafı token sildiği için server tarafında yapılacak işlem yok."""
    return {"status": "ok"}
