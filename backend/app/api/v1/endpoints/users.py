from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.schemas.user import UserCreate, UserResponse, UserRequest, ChangePasswordRequest
from app.core.response import success_response, error_response
from app.services.user_service import UserService
from app.core.security import create_access_token

import uuid

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=None)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    if UserService.email_exists(db, user_data.email):
        resp = error_response(["El email ya está registrado"], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())

    user = UserService.create(db, user_data)
    resp = success_response(
        data=UserResponse.model_validate(user).model_dump(mode="json")
    )
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.get("/{user_id}", response_model=None)
def read_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    user = UserService.get_by_id(db, user_id)

    if not user:
        resp = error_response(["Usuario no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    resp = success_response(
        data=UserResponse.model_validate(user).model_dump(mode="json")
    )
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.post("/login", response_model=None)
def login(obj: UserRequest, db: Session = Depends(get_db)):
    user = UserService.authenticate(db, obj.email, obj.password)

    if not user:
        resp = error_response(["Credenciales incorrectas"], status_code=401)
        return JSONResponse(status_code=401, content=resp.model_dump())

    token = create_access_token(user.id, user.role)

    resp = success_response(data={
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user).model_dump(mode="json")
    })
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.post("/change-password", response_model=None)
def change_password(obj: ChangePasswordRequest, db: Session = Depends(get_db)):
    user = UserService.get_by_email(db, obj.email)

    if not user:
        resp = error_response(["Usuario no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    UserService.change_password(db, user, obj.new_password)

    resp = success_response(data={"message": "Contraseña actualizada correctamente"})
    return JSONResponse(status_code=200, content=resp.model_dump())

@router.delete("/{user_id}", response_model=None)
def delete_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    user = UserService.get_by_id(db, user_id)

    if not user:
        resp = error_response(["Usuario no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    UserService.delete(db, user)

    resp = success_response(data={"message": "Usuario eliminado correctamente"})
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.get("/{user_id}/is-admin", response_model=None)
def check_is_admin(user_id: uuid.UUID, db: Session = Depends(get_db)):
    user = UserService.get_by_id(db, user_id)

    if not user:
        resp = error_response(["Usuario no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    resp = success_response(data={"is_admin": UserService.is_admin(user)})
    return JSONResponse(status_code=200, content=resp.model_dump())