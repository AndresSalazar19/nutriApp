from sqlalchemy.orm import Session
from app.db.models.user import User, Person
from app.schemas.user import UserResponse
from app.db.models.nutritionist import NutritionistProfile, Specialty
from app.schemas.nutritionist import NutritionistProfileResponse
import uuid
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class NutritionistService:

    @staticmethod
    def get_all(db: Session):
        return db.query(NutritionistProfile).filter(NutritionistProfile.status != "rejected" 
                                                    or NutritionistProfile.status != "suspended").all()

    
