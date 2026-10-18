import re

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db, User
from app.schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
STRONG_PASSWORD_PATTERN = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$")


def _normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def _validate_email(email: str) -> str:
    normalized = _normalize_email(email)
    if not normalized or not EMAIL_PATTERN.match(normalized):
        raise HTTPException(status_code=400, detail="Please provide a valid email address")
    return normalized


def _validate_password_strength(password: str) -> None:
    if not STRONG_PASSWORD_PATTERN.match(password or ""):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
        )


def _serialize_user(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=_normalize_email(user.email),
        full_name=user.full_name,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@router.post("/signup", response_model=TokenResponse, status_code=201)
def signup(req: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account."""
    email = _validate_email(req.email)
    _validate_password_strength(req.password)

    # Check if email already taken
    existing = db.query(User).filter(func.lower(User.email) == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=email,
        full_name=req.full_name,
        hashed_password=hash_password(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id})

    return TokenResponse(
        access_token=token,
        user=_serialize_user(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin, db: Session = Depends(get_db)):
    """Log in with email and password."""
    email = _validate_email(req.email)

    user = db.query(User).filter(func.lower(User.email) == email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.id})

    return TokenResponse(
        access_token=token,
        user=_serialize_user(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(__import__("app.auth", fromlist=["get_current_user"]).get_current_user)):
    """Get the currently logged-in user's profile."""
    return _serialize_user(current_user)
