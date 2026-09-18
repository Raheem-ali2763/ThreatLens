import os
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User


SECRET_KEY = os.getenv("JWT_SECRET_KEY", "CHANGE_THIS_SECRET_IN_ENV")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        raise ValueError("Password must be 72 bytes or less")

    return bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        return False

    return bcrypt.checkpw(
        password_bytes,
        hashed_password.encode("utf-8")
    )


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    ThreatLens demo mode:
    - If a valid JWT is provided, use that user.
    - If no/invalid JWT is provided, use an active database user.
    This allows the dashboard to work without showing a login page.
    """

    if token:
        try:
            payload = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=[ALGORITHM]
            )

            username = payload.get("sub")

            if username:
                user = db.query(User).filter(
                    User.username == username
                ).first()

                if user and user.is_active:
                    return user

        except JWTError:
            pass

    # Demo/direct-access fallback
    user = db.query(User).filter(
        User.is_active == True
    ).first()

    # If production database has no user yet, create a demo analyst.
    if user is None:
        user = User(
            username="demo",
            email="demo@threatlens.local",
            hashed_password=hash_password("ThreatLensDemo2026!"),
            role="analyst",
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


def require_roles(*allowed_roles):
    def role_checker(current_user=Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user

    return role_checker
