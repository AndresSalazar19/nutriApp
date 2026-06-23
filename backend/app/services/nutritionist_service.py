from sqlalchemy.orm import Session
from app.db.models.user import User, Person
from app.schemas.user import UserResponse, UserCreate
from app.services.user_service import UserService
from app.db.models.user import UserRole
from app.db.models.nutritionist import NutritionistProfile, NutritionistStatus, Specialty, NutritionistDocument, DocumentType
from datetime import datetime, timezone
from fastapi import HTTPException
from app.schemas.nutritionist import NutritionistProfileResponse
import uuid
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class NutritionistService:

    @staticmethod
    def get_all(db: Session, status: NutritionistStatus | None = None):
        query = db.query(NutritionistProfile)

        if status:
            query = query.filter(
                NutritionistProfile.status == status.value
            )
        else:
            query = query.filter(
                NutritionistProfile.status.notin_([
                    NutritionistStatus.rejected.value,
                    NutritionistStatus.suspended.value
                ])
            )

        return query.all()
    
    @staticmethod
    def get_by_user_id(db: Session, user_id: uuid.UUID):
        return db.query(NutritionistProfile).filter(NutritionistProfile.user_id == user_id).first()

    @staticmethod
    def get_by_id(db: Session, profile_id: uuid.UUID):
        return db.query(NutritionistProfile).filter(NutritionistProfile.id == profile_id).first()

    @staticmethod
    def review_profile(
        db: Session, profile_id: uuid.UUID, status: NutritionistStatus, admin_id: uuid.UUID
    ) -> NutritionistProfile:

        profile = NutritionistService.get_by_id(db, profile_id)

        if not profile:
            raise HTTPException(status_code=400, detail="Perfil de nutricionista no encontrado")

        if profile.status != NutritionistStatus.pending:
            raise HTTPException(status_code=400, detail=f"Solo se pueden revisar perfiles pendientes. Estado actual: {profile.status}" )

        profile.status = status
        profile.verified_by = admin_id
        profile.verified_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(profile)

        return profile

    @staticmethod
    def create(db: Session, data) -> NutritionistProfile:

        user_data = UserCreate(
            email=data.email,
            cedula=data.cedula,
            password=data.password,
            first_name=data.first_name,
            last_name=data.last_name,
            date_of_birth=data.date_of_birth,
            phone=data.phone,
            role=UserRole.nutritionist,
        )
        user = UserService.create(db, user_data)

        if user.person:
            if data.cedula:
                user.person.cedula = data.cedula
            if data.gender:
                user.person.gender = data.gender
            db.flush()

        profile = NutritionistProfile(
            user_id=user.id,
            license_number=data.license_number or data.cedula or "",
            specialty_id=data.specialty_id,
            years_experience=data.years_experience,
            status=NutritionistStatus.pending,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def add_document(
        db: Session,
        nutritionist_id: uuid.UUID,
        document_type: DocumentType,
        file_path: str,
        file_name: str,
        file_size: int,
        mime_type: str = "application/pdf",
    ) -> NutritionistDocument:
        document = NutritionistDocument(
            nutritionist_id=nutritionist_id,
            document_type=document_type,
            file_path=file_path,
            file_name=file_name,
            file_size=file_size,
            mime_type=mime_type,
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        return document
