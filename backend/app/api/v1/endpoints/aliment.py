from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional

from app.db.base import get_db
from app.schemas.aliment import (
    AlimentRequest,
    AlimentResponse
)
from app.services.aliment_service import AlimentService
from app.core.response import success_response, error_response

router = APIRouter(prefix="/aliment", tags=["Alimentos"]
)


@router.post("", response_model=AlimentResponse)
def create_aliment(data: AlimentRequest, db: Session = Depends(get_db)
):
    try:
        alimento = AlimentService.create(db, data)
        return alimento

    except Exception as e:
        resp = error_response([str(e)], status_code=400)

        return JSONResponse(
            status_code=400,
            content=resp.model_dump()
        )


@router.get("", response_model=list[AlimentResponse])
def list_alimentos(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        alimentos = AlimentService.list(db, category, search )

        return alimentos

    except Exception as e:
        resp = error_response([str(e)], status_code=400)

        return JSONResponse(
            status_code=400,
            content=resp.model_dump()
        )


@router.get("/{alimento_id}", response_model=AlimentResponse)
def get_aliment(
    alimento_id: int,
    db: Session = Depends(get_db)
):
    try:
        alimento = AlimentService.get_by_id(db, alimento_id )

        return alimento

    except Exception as e:
        resp = error_response([str(e)], status_code=404)

        return JSONResponse(
            status_code=404,
            content=resp.model_dump()
        )


@router.put("/{alimento_id}", response_model=AlimentResponse)
def update_aliment(
    alimento_id: int,
    data: AlimentRequest,
    db: Session = Depends(get_db)
):
    try:
        alimento = AlimentService.update(
            db,
            alimento_id,
            data
        )

        return alimento

    except Exception as e:
        resp = error_response([str(e)], status_code=400)

        return JSONResponse(
            status_code=400,
            content=resp.model_dump()
        )


@router.delete("/{alimento_id}")
def delete_alimento(alimento_id: int, db: Session = Depends(get_db)):
    try:
        AlimentService.delete(
            db,
            alimento_id
        )

        resp = success_response(
            messages=["Alimento eliminado correctamente"]
        )

        return JSONResponse(
            status_code=200,
            content=resp.model_dump()
        )

    except Exception as e:
        resp = error_response([str(e)], status_code=400)

        return JSONResponse(
            status_code=400,
            content=resp.model_dump()
        )