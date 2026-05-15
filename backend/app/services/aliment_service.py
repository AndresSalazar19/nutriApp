from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List, Optional

from app.db.models.aliment import Aliment
from app.schemas.aliment import (
    AlimentRequest,
    AlimentResponse
)


class AlimentService:

    @staticmethod
    def create(db: Session, data: AlimentRequest) -> AlimentResponse:

        existing_food = db.query(Aliment).filter(
            Aliment.nombre.ilike(data.nombre.strip())
        ).first()

        if existing_food:
            raise HTTPException(
                status_code=400,
                detail="Ya existe un alimento con ese nombre"
            )

        alimento = Aliment(
            nombre=data.nombre.strip(),
            categoria=data.categoria,

            kcal=data.kcal,
            carbohidratos=data.carbohidratos,
            proteinas=data.proteinas,
            grasas=data.grasas,

            calcio_mg=data.calcio_mg,
            potasio_mg=data.potasio_mg,
            sodio_mg=data.sodio_mg,
            zinc_mg=data.zinc_mg,

            vit_c_mg=data.vit_c_mg,
            vit_a_ug=data.vit_a_ug,
            folatos_ug=data.folatos_ug,

            porcion_taza=data.porcion_taza,
            porcion_cda=data.porcion_cda,
            porcion_unidad=data.porcion_unidad
        )

        db.add(alimento)
        db.commit()
        db.refresh(alimento)

        return alimento

    @staticmethod
    def update(
        db: Session,
        alimento_id: int,
        data: AlimentRequest
    ) -> AlimentResponse:

        alimento = db.query(Aliment).filter(
            Aliment.id == alimento_id
        ).first()

        if not alimento:
            raise HTTPException(
                status_code=404,
                detail="Alimento no encontrado"
            )

        existing_food = db.query(Aliment).filter(
            Aliment.nombre.ilike(data.nombre.strip()),
            Aliment.id != alimento_id
        ).first()

        if existing_food:
            raise HTTPException(
                status_code=400,
                detail="Ya existe otro alimento con ese nombre"
            )

        alimento.nombre = data.nombre.strip()
        alimento.categoria = data.categoria

        alimento.kcal = data.kcal
        alimento.carbohidratos = data.carbohidratos
        alimento.proteinas = data.proteinas
        alimento.grasas = data.grasas

        alimento.calcio_mg = data.calcio_mg
        alimento.potasio_mg = data.potasio_mg
        alimento.sodio_mg = data.sodio_mg
        alimento.zinc_mg = data.zinc_mg

        alimento.vit_c_mg = data.vit_c_mg
        alimento.vit_a_ug = data.vit_a_ug
        alimento.folatos_ug = data.folatos_ug

        alimento.porcion_taza = data.porcion_taza
        alimento.porcion_cda = data.porcion_cda
        alimento.porcion_unidad = data.porcion_unidad

        db.commit()
        db.refresh(alimento)

        return alimento

    @staticmethod
    def get_by_id(db: Session, alimento_id: int) -> AlimentResponse:

        alimento = db.query(Aliment).filter(
            Aliment.id == alimento_id
        ).first()

        if not alimento:
            raise HTTPException(
                status_code=404,
                detail="Alimento no encontrado"
            )

        return alimento

    @staticmethod
    def list(
        db: Session,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[AlimentResponse]:

        query = db.query(Aliment)

        if category:
            query = query.filter(
                Aliment.categoria.ilike(f"%{category}%")
            )

        if search:
            query = query.filter(
                Aliment.nombre.ilike(f"%{search}%")
            )

        return query.order_by(Aliment.nombre.asc()).all()

    @staticmethod
    def delete(db: Session, alimento_id: int):

        alimento = db.query(Aliment).filter(
            Aliment.id == alimento_id
        ).first()

        if not alimento:
            raise HTTPException(
                status_code=404,
                detail="Alimento no encontrado"
            )

        db.delete(alimento)
        db.commit()

        return {
            "message": "Alimento eliminado correctamente"
        }