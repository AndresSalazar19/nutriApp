from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.response import error_response, success_response
from app.db.base import get_db
from app.schemas.educational_content import EducationalContentRequest, EducationalContentResponse
from app.services.educational_content_service import EducationalContentService

router = APIRouter(prefix="/educational_contents", tags=["educational_contents"])


@router.post("/", response_model=None)
def create_educational_content(
    educational_content: EducationalContentRequest, db: Session = Depends(get_db)
):
    created_content = EducationalContentService.create(
        db, educational_content, "5712dd83-17d5-484c-8b6a-00cf570b4564"
    )
    if not created_content:
        resp = error_response(["Error al crear el contenido educativo"], status_code=500)
        return JSONResponse(status_code=500, content=resp.model_dump())
    resp = success_response(
        data=EducationalContentResponse.model_validate(created_content).model_dump(mode="json")
    )
    return JSONResponse(status_code=201, content=resp.model_dump())


@router.get("", response_model=None)
def get_educational_contents(db: Session = Depends(get_db)):
    educationalContentList = EducationalContentService.get_all(db)
    if not educationalContentList:
        resp = error_response(["Contenido educativo no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    validated_data = [
        EducationalContentResponse.model_validate(item).model_dump(mode="json")
        for item in educationalContentList
    ]

    resp = success_response(data=validated_data)
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.get("/published", response_model=list[EducationalContentResponse])
def get_published_educational_contents(db: Session = Depends(get_db)):
    educationalContentList = EducationalContentService.get_published(db)
    if not educationalContentList:
        resp = error_response(["Contenido educativo publicado no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    validated_data = [
        EducationalContentResponse.model_validate(item).model_dump(mode="json")
        for item in educationalContentList
    ]

    resp = success_response(data=validated_data)
    return JSONResponse(status_code=200, content=resp.model_dump())
