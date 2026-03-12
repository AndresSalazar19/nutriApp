from sqlalchemy.orm import Session
from app.db.models.user import User, Person
from app.schemas.user import UserCreate, UserResponse
import uuid

class UserService:
    @staticmethod
    def email_exists(db: Session, email: str) -> bool:
        return db.query(User).filter(User.email == email).first() is not None

    @staticmethod
    def get_by_id(db: Session, user_id: uuid.UUID):
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def create(db: Session, data: UserCreate) -> User:
        user = User(email=data.email, password_hash=data.password + "_hash_seguro")
        db.add(user)
        db.flush()
        person = Person(
            user_id=user.id,
            first_name=data.first_name,
            last_name=data.last_name,
            date_of_birth=data.date_of_birth,
        )
        db.add(person)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def authenticate(db: Session, email: str, password: str):
        user_db = db.query(User).filter(User.email == email).first()
        if user_db and user_db.password_hash == password + "_hash_seguro":
            return UserResponse.model_validate(user_db)
        return None