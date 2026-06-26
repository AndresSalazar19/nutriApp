import os
import shutil
import uuid

from fastapi import UploadFile
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.db.models.user import Person, User, UserRole
from app.schemas.user import UserCreate

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
    def upload_avatar(db: Session, user_id: uuid.UUID, file: UploadFile) -> str:
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise ValueError("Usuario no encontrado")

        if not file.content_type or not file.content_type.startswith("image/"):
            raise ValueError("Solo se permiten imágenes JPG/PNG/GIF")

        if user.avatar_url:
            if os.path.exists(user.avatar_url):
                try:
                    os.remove(user.avatar_url)
                except Exception as e:
                    print(f"Error al eliminar archivo físico antiguo: {e}")

        upload_dir = "uploads/avatars"
        os.makedirs(upload_dir, exist_ok=True)

        _, file_extension = os.path.splitext(file.filename)
        if not file_extension:
            extension_by_content_type = {
                "image/jpeg": ".jpg",
                "image/jpg": ".jpg",
                "image/png": ".png",
                "image/gif": ".gif",
                "image/webp": ".webp",
                "image/bmp": ".bmp",
                "image/svg+xml": ".svg",
            }
            file_extension = extension_by_content_type.get(file.content_type)

        if not file_extension:
            raise ValueError("Tipo de imagen no soportado")

        file_id = str(uuid.uuid4())
        avatar_filename = f"{file_id}{file_extension}"
        avatar_path = os.path.join(upload_dir, avatar_filename)

        file.file.seek(0)
        with open(avatar_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        avatar_url = f"uploads/avatars/{avatar_filename}"
        user.avatar_url = avatar_url

        db.commit()
        db.refresh(user)

        return avatar_url

    @staticmethod
    def create(db: Session, data: UserCreate) -> User:
        user = User(
            email=data.email,
            password_hash=UserService.hash_password(data.password),
            role=data.role,
        )

        db.add(user)
        db.flush()

        person = Person(
            user_id=user.id,
            first_name=data.first_name,
            last_name=data.last_name,
            date_of_birth=data.date_of_birth,
            phone=data.phone,
            cedula=data.cedula,
            gender=data.gender,
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
