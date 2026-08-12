import uuid

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.response import error_response, success_response
from app.core.security import create_access_token
from app.db.base import get_db
from app.schemas.user import ChangePasswordRequest, UserCreate, UserRequest, UserResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


def _field_error(message: str, field: str, status_code: int = 400) -> JSONResponse:
    """Arma una respuesta de error indicando explícitamente qué campo falló,
    para que el frontend pueda resaltar el input correcto."""
    resp = error_response([message], status_code=status_code)
    content = resp.model_dump()
    content["field"] = field
    return JSONResponse(status_code=status_code, content=content)


@router.post("/", response_model=None)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    if UserService.email_exists(db, user_data.email):
        return _field_error("El correo ya está registrado", "email")

    if UserService.cedula_exists(db, user_data.cedula):
        return _field_error("La cédula ya está registrada", "identification")

    if UserService.phone_exists(db, user_data.phone):
        return _field_error("El teléfono ya está registrado", "phone")

    try:
        user = UserService.create(db, user_data)
    except IntegrityError:
        # Defensa en profundidad: si dos requests llegan casi simultáneas y
        # ambas pasan las validaciones de arriba, el constraint UNIQUE de la
        # BDD es la última barrera. Evita un 500 sin mensaje claro.
        db.rollback()
        resp = error_response(
            ["Alguno de los datos ingresados ya está registrado (correo, cédula o teléfono)"],
            status_code=409,
        )
        return JSONResponse(status_code=409, content=resp.model_dump())

    # El registro ahora deja al usuario autenticado de inmediato, igual que
    # /login, para que el resto del onboarding (salud, plan, pago) tenga
    # token disponible sin necesitar un login manual intermedio.
    token = create_access_token(user.id, user.role)

    resp = success_response(
        data={
            "access_token": token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user).model_dump(mode="json"),
        }
    )
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.get("/{user_id}", response_model=None)
def read_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    user = UserService.get_by_id(db, user_id)

    if not user:
        resp = error_response(["Usuario no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    resp = success_response(data=UserResponse.model_validate(user).model_dump(mode="json"))
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.post("/login", response_model=None)
def login(obj: UserRequest, db: Session = Depends(get_db)):
    user = UserService.authenticate(db, obj.email, obj.password)

    if not user:
        resp = error_response(["Credenciales incorrectas"], status_code=401)
        return JSONResponse(status_code=401, content=resp.model_dump())

    token = create_access_token(user.id, user.role)

    resp = success_response(
        data={
            "access_token": token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user).model_dump(mode="json"),
        }
    )
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


@router.post("/{user_id}/avatar", response_model=None)
def upload_avatar(user_id: uuid.UUID, file: UploadFile = File(...), db: Session = Depends(get_db)):
    user = UserService.get_by_id(db, user_id)

    if not user:
        resp = error_response(["Usuario no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    if not file.content_type or not file.content_type.startswith("image/"):
        resp = error_response(["Solo se permiten imágenes JPG/PNG/GIF"], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())

    try:
        avatar_url = UserService.upload_avatar(db, user_id, file)
    except Exception as exc:
        resp = error_response([str(exc)], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())

    resp = success_response(data={"avatar_url": avatar_url})
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.get("/{user_id}/is-admin", response_model=None)
def check_is_admin(user_id: uuid.UUID, db: Session = Depends(get_db)):
    user = UserService.get_by_id(db, user_id)

    if not user:
        resp = error_response(["Usuario no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    resp = success_response(data={"is_admin": UserService.is_admin(user)})
    return JSONResponse(status_code=200, content=resp.model_dump())