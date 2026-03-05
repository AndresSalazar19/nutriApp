from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, String, Boolean, Enum as SQLEnum, ForeignKey, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import sessionmaker, declarative_base, Session, relationship
from pydantic import BaseModel, EmailStr
from datetime import date
import uuid
import enum


SQLALCHEMY_DATABASE_URL = "postgresql://admin:admin@localhost:5433/nutria_dev"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class UserRole(str, enum.Enum):
    patient = 'patient'
    nutritionist = 'nutritionist'
    admin = 'admin'

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.patient, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)

    person = relationship("Person", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Person(Base):
    __tablename__ = "persons"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=True)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(Text, nullable=True)

    user = relationship("User", back_populates="person")


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    date_of_birth: date | None = None

class PersonResponse(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date | None
    phone: str | None

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    role: UserRole
    is_active: bool
    person: PersonResponse | None 

    class Config:
        from_attributes = True


app = FastAPI(title="NutrIA API")

@app.post("/users/", response_model=UserResponse)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    fake_hashed_password = user_data.password + "_hash_seguro"
    
    new_user = User(email=user_data.email, password_hash=fake_hashed_password)
    db.add(new_user)
    db.flush() 
    
    new_person = Person(
        user_id=new_user.id,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        date_of_birth=user_data.date_of_birth
    )
    db.add(new_person)
    
    # 5. Confirmar todo en la base de datos
    db.commit()
    db.refresh(new_user)
    
    return new_user

@app.get("/users/{user_id}", response_model=UserResponse)
def read_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user