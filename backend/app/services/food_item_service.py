from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List, Optional
import uuid
from app.db.models.food_item import FoodItem
from app.schemas.food_item import (FoodItemRequest, FoodItemResponse)


class FoodItemService:

    @staticmethod
    def create(db: Session, data: FoodItemRequest) -> FoodItemResponse:

        existing_food = db.query(FoodItem).filter(FoodItem.name.ilike(data.name.strip()), FoodItem.is_active == True).first()

        if existing_food:
            raise HTTPException(
                status_code=400,
                detail="Ya existe un alimento con ese nombre"
            )

        alimento = FoodItem(
            name=data.name.strip(),
            category=data.category,

            calories_kcal=data.calories_kcal,
            carbs_g=data.carbs_g,
            protein_g=data.protein_g,
            fat_g=data.fat_g,

            calcium_mg=data.calcium_mg,
            potassium_mg=data.potassium_mg,
            sodium_mg=data.sodium_mg,
            zinc_mg=data.zinc_mg,

            vitamin_c_mg=data.vitamin_c_mg,
            vitamin_a_ug=data.vitamin_a_ug,
            folate_ug=data.folate_ug,

            serving_per_cup_g=data.serving_per_cup_g,
            serving_per_tbsp_g=data.serving_per_tbsp_g,
            serving_per_unit_g=data.serving_per_unit_g
        )

        db.add(alimento)
        db.commit()
        db.refresh(alimento)

        return alimento

    @staticmethod
    def update(db: Session, id: uuid.UUID, data: FoodItemRequest) -> FoodItemResponse:

        alimento = db.query(FoodItem).filter(FoodItem.id == id, FoodItem.is_active == True).first()

        if not alimento:
            raise HTTPException(
                status_code=404,
                detail="Alimento no encontrado"
            )

        existing_food = db.query(FoodItem).filter(FoodItem.name.ilike(data.name.strip()), FoodItem.id != id, FoodItem.is_active == True).first()

        if existing_food:
            raise HTTPException(
                status_code=400,
                detail="Ya existe otro alimento con ese nombre"
            )

        alimento.name = data.name.strip()
        alimento.category = data.category

        alimento.calories_kcal = data.calories_kcal
        alimento.carbs_g = data.carbs_g
        alimento.protein_g = data.protein_g
        alimento.fat_g = data.fat_g

        alimento.calcium_mg = data.calcium_mg
        alimento.potassium_mg = data.potassium_mg
        alimento.sodium_mg = data.sodium_mg
        alimento.zinc_mg = data.zinc_mg

        alimento.vitamin_c_mg = data.vitamin_c_mg
        alimento.vitamin_a_ug = data.vitamin_a_ug
        alimento.folate_ug = data.folate_ug

        alimento.serving_per_cup_g = data.serving_per_cup_g
        alimento.serving_per_tbsp_g = data.serving_per_tbsp_g
        alimento.serving_per_unit_g = data.serving_per_unit_g

        db.commit()
        db.refresh(alimento)

        return alimento

    @staticmethod
    def get_by_id(db: Session, id: uuid.UUID) -> FoodItemResponse:

        alimento = db.query(FoodItem).filter(FoodItem.id == id, FoodItem.is_active == True).first()

        if not alimento:
            raise HTTPException(
                status_code=404,
                detail="Alimento no encontrado"
            )

        return alimento

    @staticmethod
    def list(db: Session, category: Optional[str] = None, search: Optional[str] = None) -> List[FoodItemResponse]:

        query = db.query(FoodItem).filter(FoodItem.is_active == True)
        if category:
            query = query.filter(FoodItem.category.ilike(f"%{category}%"))

        if search:
            query = query.filter(FoodItem.name.ilike(f"%{search}%"))

        return query.order_by(FoodItem.name.asc()).all()

    @staticmethod
    def delete(db: Session, id: uuid.UUID):

        alimento = db.query(FoodItem).filter(FoodItem.id == id).first()

        if alimento and not alimento.is_active:
            raise HTTPException(
                status_code=400,
                detail="El alimento ya ha sido eliminado"
            )

        if not alimento:
            raise HTTPException(
                status_code=404,
                detail="Alimento no encontrado"
            )

        alimento.is_active = False
        db.commit()
        db.refresh(alimento)

        return {
            "message": "Alimento eliminado correctamente"
        }