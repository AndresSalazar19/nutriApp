import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db.models.patient_nutritionist import PatientNutritionist
from app.schemas.patient_nutritionist import (
    PatientNutritionistQueryParams,
    PatientNutritionistRequest,
    PatientNutritionistResponse,
)
from app.services.user_service import UserRole, UserService


class PatientNutritionistService:

    @staticmethod
    def get_all(
        db: Session, q: PatientNutritionistQueryParams | None = None
    ) -> list[PatientNutritionistResponse]:

        query = db.query(PatientNutritionist)

        if q:
            if q.status == "active":
                query = query.filter(PatientNutritionist.is_active == True)
            elif q.status == "inactive":
                query = query.filter(PatientNutritionist.is_active == False)
            if q.patient_id:
                query = query.filter(PatientNutritionist.patient_id == q.patient_id)

            if q.nutritionist_id:
                query = query.filter(PatientNutritionist.nutritionist_id == q.nutritionist_id)

        results = query.all()
        return [PatientNutritionistResponse.model_validate(p) for p in results]

    @staticmethod
    def get_by_id(db: Session, profile_id: uuid.UUID):
        return db.query(PatientNutritionist).filter(PatientNutritionist.id == profile_id).first()

    @staticmethod
    def create(db: Session, data: PatientNutritionistRequest):

        patient = UserService.get_by_id(db, data.patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Paciente no existe")

        nutritionist = UserService.get_by_id(db, data.nutritionist_id)
        if not nutritionist:
            raise HTTPException(status_code=404, detail="Nutricionista no existe")

        if patient.role != UserRole.patient:
            raise HTTPException(status_code=400, detail="El user_id no es un paciente")

        if nutritionist.role != UserRole.nutritionist:
            raise HTTPException(status_code=400, detail="El user_id no es un nutricionista")

        existing = (
            db.query(PatientNutritionist)
            .filter(
                PatientNutritionist.patient_id == data.patient_id,
                PatientNutritionist.nutritionist_id == data.nutritionist_id,
                PatientNutritionist.is_active == True,
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=409, detail="El paciente ya está asignado a este nutricionista"
            )

        profile = PatientNutritionist(
            patient_id=data.patient_id,
            nutritionist_id=data.nutritionist_id,
            assigned_at=datetime.now(timezone.utc),
            is_active=True,
        )

        db.add(profile)
        db.commit()
        db.refresh(profile)

        return profile
