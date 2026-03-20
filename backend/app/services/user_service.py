from sqlalchemy.orm import Session
from app.db.models.user import User, Person, UserRole
from app.schemas.user import UserCreate, UserResponse
import uuid
from passlib.context import CryptContext
from fastapi import HTTPException

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:

    @staticmethod
    def hash_password(plain_password: str) -> str:
        return pwd_context.hash(plain_password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def email_exists(db: Session, email: str) -> bool:
        return db.query(User).filter(User.email == email).first() is not None

    @staticmethod
    def get_by_id(db: Session, user_id: uuid.UUID):
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str):
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def create(db: Session, data: UserCreate) -> User:
        user = User(
            email=data.email,
            password_hash=UserService.hash_password(data.password)
        )

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

        if not user_db:
            return None

        if not UserService.verify_password(password, user_db.password_hash):
            return None

        return user_db

    @staticmethod
    def change_password(db: Session, user: User, new_password: str):
        hashed_password = UserService.hash_password(new_password)

        user.password_hash = hashed_password

        db.commit()
        db.refresh(user)

        return user
        
    @staticmethod
    def is_admin(user: User) -> bool:
        return user.role == UserRole.admin

    @staticmethod
    def delete(db: Session, user: User) -> None:
        db.delete(user)
        db.commit()