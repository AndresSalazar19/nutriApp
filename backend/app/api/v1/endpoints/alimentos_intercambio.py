from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.schemas.alimento_intercambio import AlimentoIntercambioUpdate, AlimentoIntercambioResponse
from app.services.alimento_intercambio_service import AlimentoIntercambioService
from app.core.response import success_response, error_response
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/alimentos-intercambio", tags=["alimentos-intercambio"])


@router.get("/", response_model=None)
def get_all(db: Session = Depends(get_db), _=Depends(get_current_user)):
    alimentos = AlimentoIntercambioService.get_all(db)
    data = [AlimentoIntercambioResponse.model_validate(a).model_dump(mode="json") for a in alimentos]
    return JSONResponse(status_code=200, content=success_response(data=data).model_dump())


@router.put("/{alimento_id}", response_model=None)
def update(alimento_id: int, body: AlimentoIntercambioUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    alimento = AlimentoIntercambioService.get_by_id(db, alimento_id)

    if not alimento:
        return JSONResponse(status_code=404, content=error_response(["Alimento no encontrado"], status_code=404).model_dump())

    updated = AlimentoIntercambioService.update(db, alimento, body)
    return JSONResponse(status_code=200, content=success_response(
        data=AlimentoIntercambioResponse.model_validate(updated).model_dump(mode="json")
    ).model_dump())