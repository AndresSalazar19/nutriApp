import logging
import os
import shutil
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.response import error_response, success_response
from app.db.base import get_db
from app.db.models.nutritionist import DocumentType, NutritionistStatus
from app.db.models.user import GenderEnum, User
from app.schemas.nutritionist import (
    NutritionistCreateRequest,
    NutritionistDocumentsResponse,
    NutritionistProfileDetailResponse,
    NutritionistProfileResponse,
    NutritionistStatusUpdate,
)
from app.services.nutritionist_dashboard_service import NutritionistDashboardService
from app.services.nutritionist_service import NutritionistService
from app.services.user_service import UserService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/nutritionists", tags=["nutritionists"])


@router.get("", response_model=list[NutritionistProfileResponse])
def get_nutritionists(status: NutritionistStatus | None = None, db: Session = Depends(get_db)):
    return NutritionistService.get_all(db, status=status)


@router.get("/dashboard", response_model=None)
def get_nutritionist_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = NutritionistDashboardService.get_dashboard(db, current_user.id)
    return JSONResponse(status_code=200, content=success_response(data=data).model_dump())


@router.get("/unread-messages", response_model=None)
def get_unread_messages_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = NutritionistDashboardService.get_unread_messages_count(db, current_user.id)
    return JSONResponse(
        status_code=200, content=success_response(data={"count": count}).model_dump()
    )


@router.get("/patients", response_model=None)
def get_my_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = NutritionistDashboardService.get_patients_list(db, current_user.id)
    return JSONResponse(status_code=200, content=success_response(data=data).model_dump())


@router.get("/status/{user_id}", response_model=None)
def get_nutritionist_status(user_id: uuid.UUID, db: Session = Depends(get_db)):
    profile = NutritionistService.get_by_user_id(db, user_id)
    if not profile:
        # Sin perfil aún → tratado como pendiente
        resp = success_response(data={"status": "pending"})
        return JSONResponse(status_code=200, content=resp.model_dump())

    resp = success_response(data={"status": profile.status})
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.patch("/{profile_id}/review", response_model=None)
def approval_nutritionist(
    profile_id: uuid.UUID,
    payload: NutritionistStatusUpdate,
    db: Session = Depends(get_db),
):
    updated = NutritionistService.review_profile(
        db, profile_id, payload.status, payload.verified_by
    )

    resp = success_response(
        data=NutritionistProfileResponse.model_validate(updated).model_dump(mode="json")
    )

    return JSONResponse(status_code=200, content=resp.model_dump())


@router.get("/{nutritionist_id}/documents", response_model=NutritionistDocumentsResponse)
def get_nutritionist_documents(nutritionist_id: uuid.UUID, db: Session = Depends(get_db)):
    profile = NutritionistService.get_by_id(db, nutritionist_id)

    if not profile:
        raise HTTPException(status_code=404, detail="Nutricionista no encontrado")

    cv_url: str | None = None
    senescyt_url: str | None = None

    for document in profile.documents:
        if document.document_type == DocumentType.cv:
            cv_url = document.file_path
        elif document.document_type == DocumentType.senescyt:
            senescyt_url = document.file_path

    return NutritionistDocumentsResponse(cv_url=cv_url, senescyt_url=senescyt_url)


CV_TYPES: dict[str, str] = {
    "application/pdf": ".pdf",
}
# El Senescyt puede entregarse como captura del portal, no solo como PDF; el
# formulario de registro ya acepta PDF/JPG/PNG, asi que el backend acepta lo
# mismo (antes rechazaba cualquier imagen con "Solo se permiten archivos PDF").
SENESCYT_TYPES: dict[str, str] = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
}


def save_document(file: UploadFile, allowed: dict[str, str], label: str) -> dict:
    """Valida el tipo del archivo y lo guarda en disco."""
    extension = allowed.get(file.content_type)
    if extension is None:
        formatos = ", ".join(sorted({e.lstrip(".").upper() for e in allowed.values()}))
        raise HTTPException(
            status_code=400,
            detail=f"El {label} debe ser un archivo {formatos}",
        )

    # Crear directorio si no existe
    upload_dir = "uploads/nutritionists"
    os.makedirs(upload_dir, exist_ok=True)

    # Generar nombre único
    unique_filename = f"{uuid.uuid4()}{extension}"
    file_path = os.path.join(upload_dir, unique_filename)

    # Obtener tamaño del archivo
    file.file.seek(0, 2)  # Ir al final
    file_size = file.file.tell()  # Obtener posición
    file.file.seek(0)  # Volver al inicio

    # Guardar archivo
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "file_path": file_path,
        "file_name": file.filename,
        "file_size": file_size,
        "mime_type": file.content_type,
    }


def _discard_files(*documentos: dict) -> None:
    """Borra los archivos ya escritos cuando el registro no llego a completarse."""
    for doc in documentos:
        try:
            os.remove(doc["file_path"])
        except OSError:
            pass


@router.post("", response_model=None)
def create_nutritionist(
    email: str = Form(...),
    password: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    cedula: str | None = Form(None),
    date_of_birth: str | None = Form(None),
    gender: GenderEnum | None = Form(None),
    phone: str | None = Form(None),
    specialty_id: int = Form(...),
    years_experience: int | None = Form(None),
    license_number: str | None = Form(None),
    cv_file: UploadFile = File(...),
    senescyt_file: UploadFile = File(...),
    avatar_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    if UserService.email_exists(db, email):
        resp = error_response(["El email ya esta registrado"], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())

    # persons.cedula tiene UNIQUE en la BD. Sin este chequeo el INSERT reventaba
    # con un UniqueViolation de psycopg2 que terminaba mostrandose crudo (con el
    # SQL y los datos del usuario) en el alert del navegador.
    if UserService.cedula_exists(db, cedula):
        resp = error_response(["La cedula ya esta registrada"], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())

    # Reconstruir objeto NutritionistCreateRequest
    payload = NutritionistCreateRequest(
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        cedula=cedula,
        date_of_birth=date_of_birth,
        gender=gender,
        phone=phone,
        specialty_id=specialty_id,
        years_experience=years_experience,
        license_number=license_number,
    )

    # Los archivos se validan y guardan ANTES de tocar la base. Antes se creaba
    # el usuario primero y, si el archivo era rechazado, quedaba una cuenta
    # huerfana sin documentos que ademas dejaba el email ocupado: el segundo
    # intento fallaba con "El email ya esta registrado".
    cv_data = save_document(cv_file, CV_TYPES, "Curriculum Vitae")
    senescyt_data = save_document(senescyt_file, SENESCYT_TYPES, "Registro Senescyt")

    try:
        # Crear perfil de nutricionista
        profile = NutritionistService.create(db, payload)

        if avatar_file:
            UserService.upload_avatar(db, profile.user_id, avatar_file)

        # Crear documentos asociados usando el servicio
        NutritionistService.add_document(
            db,
            profile.id,
            DocumentType.cv,
            cv_data["file_path"],
            cv_data["file_name"],
            cv_data["file_size"],
            cv_data["mime_type"],
        )

        NutritionistService.add_document(
            db,
            profile.id,
            DocumentType.senescyt,
            senescyt_data["file_path"],
            senescyt_data["file_name"],
            senescyt_data["file_size"],
            senescyt_data["mime_type"],
        )
    except HTTPException:
        db.rollback()
        _discard_files(cv_data, senescyt_data)
        raise
    except IntegrityError:
        # Carrera contra los chequeos de arriba, o algun otro UNIQUE que no
        # validamos antes. El detalle real va al log del servidor, nunca al
        # navegador: traia el SQL completo con los datos personales dentro.
        db.rollback()
        _discard_files(cv_data, senescyt_data)
        logger.exception("IntegrityError al registrar nutricionista")
        resp = error_response(
            ["Ya existe una cuenta con esos datos. Revisa el correo y la cedula."],
            status_code=400,
        )
        return JSONResponse(status_code=400, content=resp.model_dump())
    except Exception:
        db.rollback()
        _discard_files(cv_data, senescyt_data)
        logger.exception("Error inesperado al registrar nutricionista")
        resp = error_response(
            ["No se pudo completar el registro. Intenta nuevamente."], status_code=500
        )
        return JSONResponse(status_code=500, content=resp.model_dump())

    resp = success_response(
        data=NutritionistProfileResponse.model_validate(profile).model_dump(mode="json")
    )
    return JSONResponse(status_code=201, content=resp.model_dump())


@router.get("/profile/{user_id}", response_model=NutritionistProfileDetailResponse)
def get_profile(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return NutritionistService.get_nutritionist_profile(
        db,
        user_id,
    )
