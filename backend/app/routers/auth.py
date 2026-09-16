from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
)
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/register", response_model=UserResponse)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    if len(data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters"
        )

    existing = (
        db.query(User)
        .filter(
            (User.username == data.username)
            | (User.email == data.email)
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Username or email already exists"
        )

    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.username == data.username)
        .first()
    )

    if not user or not verify_password(
        data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    token = create_access_token({
        "sub": user.username,
        "role": user.role,
    })

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
def me(
    current_user: User = Depends(get_current_user)
):
    return current_user
