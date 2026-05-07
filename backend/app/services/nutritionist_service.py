from sqlalchemy.orm import Session
from app.db.models.user import User, Person
from app.schemas.user import UserResponse, UserCreate
from app.services.user_service import UserService
from app.db.models.user import UserRole
from app.db.models.nutritionist import NutritionistProfile, NutritionistStatus, Specialty
from datetime import datetime
from app.schemas.nutritionist import NutritionistProfileResponse
import uuid
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class NutritionistService:

    @staticmethod
    def get_all(db: Session):
        return db.query(NutritionistProfile).filter(NutritionistProfile.status != "rejected" 
                                                    or NutritionistProfile.status != "suspended").all()
    @staticmethod
    def get_by_user_id(db: Session, user_id: uuid.UUID):
        return db.query(NutritionistProfile).filter(NutritionistProfile.user_id == user_id).first()

    @staticmethod
    def get_by_id(db: Session, profile_id: uuid.UUID):
        return db.query(NutritionistProfile).filter(NutritionistProfile.id == profile_id).first()

    @staticmethod
    def update_status(db: Session, profile: NutritionistProfile, new_status: str, admin_id: uuid.UUID) -> NutritionistProfile:
        profile.status = NutritionistStatus(new_status)
        profile.verified_by = admin_id
        profile.verified_at = datetime.utcnow()
        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def create(db: Session, data) -> NutritionistProfile:

        user_data = UserCreate(
            email=data.email,
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

    
