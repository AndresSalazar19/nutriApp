from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.base import get_db
from app.db.models.user import User
from app.services.user_service import UserService

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    user = UserService.get_by_id(db, payload["sub"])

    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Usuario inactivo")

    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not UserService.is_admin(current_user):
        raise HTTPException(status_code=403, detail="Se requiere rol admin")
    return current_user


def require_nutritionist_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if not (UserService.is_admin(current_user) or current_user.role == "nutritionist"):
        raise HTTPException(status_code=403, detail="Se requiere rol admin o nutricionista")
    return current_user
