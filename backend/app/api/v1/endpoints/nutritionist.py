import uuid
import shutil
import os

from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.schemas.nutritionist import NutritionistProfileResponse, NutritionistStatusUpdate, NutritionistCreateRequest, NutritionistDocumentCreate
from app.db.models.nutritionist import NutritionistStatus, DocumentType
from app.db.models.user import GenderEnum
from app.core.response import success_response, error_response
from app.services.nutritionist_service import NutritionistService
from app.services.user_service import UserService

router = APIRouter(prefix="/nutritionists", tags=["nutritionists"])


@router.get("", response_model=list[NutritionistProfileResponse])
def get_nutritionists(status: NutritionistStatus | None = None, db: Session = Depends(get_db)):
    return NutritionistService.get_all(db, status=status)


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

    updated = NutritionistService.review_profile(db, profile_id, payload.status, payload.verified_by )

    resp = success_response(data=NutritionistProfileResponse.model_validate(updated).model_dump(mode="json")
    )

    return JSONResponse(status_code=200, content=resp.model_dump())

def save_pdf(file: UploadFile) -> dict:
    """Helper para validar y guardar archivos PDF en disco"""
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF")
    
    # Crear directorio si no existe
    upload_dir = "uploads/nutritionists"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generar nombre único
    file_id = str(uuid.uuid4())
    file_extension = ".pdf"
    unique_filename = f"{file_id}{file_extension}"
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
        "mime_type": file.content_type
    }


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
    db: Session = Depends(get_db),
):
    if UserService.email_exists(db, email):
        resp = error_response(["El email ya esta registrado"], status_code=400)
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
    
    try:
        # Crear perfil de nutricionista
        profile = NutritionistService.create(db, payload)
        
        # Guardar archivos PDF
        cv_data = save_pdf(cv_file)
        senescyt_data = save_pdf(senescyt_file)
        
        # Crear documentos asociados usando el servicio
        try:
            NutritionistService.add_document(
                db, profile.id, DocumentType.cv,
                cv_data["file_path"], cv_data["file_name"],
                cv_data["file_size"], cv_data["mime_type"]
            )
            
            NutritionistService.add_document(
                db, profile.id, DocumentType.senescyt,
                senescyt_data["file_path"], senescyt_data["file_name"],
                senescyt_data["file_size"], senescyt_data["mime_type"]
            )
        except Exception as e:
            resp = error_response([f"Error al guardar documentos: {str(e)}"], status_code=500)
            return JSONResponse(status_code=500, content=resp.model_dump())
        
    except HTTPException:
        raise
    except Exception as e:
        resp = error_response([f"Error al crear nutricionista: {str(e)}"], status_code=500)
        return JSONResponse(status_code=500, content=resp.model_dump())
    
    resp = success_response(
        data=NutritionistProfileResponse.model_validate(profile).model_dump(mode="json")
    )
    return JSONResponse(status_code=201, content=resp.model_dump())
