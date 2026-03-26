from sqlalchemy.orm import Session
from app.db.models.user import User, Person
from app.schemas.user import UserResponse
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
    def get_by_id(db: Session, profile_id: uuid.UUID):
        return db.query(NutritionistProfile).filter(NutritionistProfile.id == profile_id).first()

    @staticmethod
    def update_status(db: Session, profile: NutritionistProfile, new_status: str, admin_id: uuid.UUID) -> NutritionistProfile:
        """Acepta o rechaza un nutricionista. Solo aplica a perfiles en estado 'pending'."""
        profile.status = NutritionistStatus(new_status)
        profile.verified_by = admin_id
        profile.verified_at = datetime.utcnow()
        db.commit()
        db.refresh(profile)
        return profile

    
