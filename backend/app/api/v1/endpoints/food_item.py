import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.response import error_response, success_response
from app.db.base import get_db
from app.schemas.food_item import FoodItemRequest, FoodItemResponse
from app.services.food_item_service import FoodItemService

router = APIRouter(prefix="/food-items", tags=["Food Items"])


@router.post("", response_model=FoodItemResponse)
def create_food_item(data: FoodItemRequest, db: Session = Depends(get_db)):
    try:
        alimento = FoodItemService.create(db, data)
        return alimento

    except Exception as e:
        resp = error_response([str(e)], status_code=400)

        return JSONResponse(status_code=400, content=resp.model_dump())


@router.get("", response_model=list[FoodItemResponse])
def list_food_items(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    try:
        alimentos = FoodItemService.list(db, category, search)

        return alimentos

    except Exception as e:
        resp = error_response([str(e)], status_code=400)

        return JSONResponse(status_code=400, content=resp.model_dump())


@router.get("/{id}", response_model=FoodItemResponse)
def get_food_item(id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        alimento = FoodItemService.get_by_id(db, id)

        return alimento

    except Exception as e:
        resp = error_response([str(e)], status_code=404)

        return JSONResponse(status_code=404, content=resp.model_dump())


@router.put("/{id}", response_model=FoodItemResponse)
def update_food_item(id: uuid.UUID, data: FoodItemRequest, db: Session = Depends(get_db)):
    try:
        alimento = FoodItemService.update(db, id, data)

        return alimento

    except Exception as e:
        resp = error_response([str(e)], status_code=400)

        return JSONResponse(status_code=400, content=resp.model_dump())


@router.delete("/{id}")
def delete_food_item(id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        FoodItemService.delete(db, id)

        resp = success_response(messages=["Alimento eliminado correctamente"])

        return JSONResponse(status_code=200, content=resp.model_dump())

    except Exception as e:
        resp = error_response([str(e)], status_code=400)

        return JSONResponse(status_code=400, content=resp.model_dump())
