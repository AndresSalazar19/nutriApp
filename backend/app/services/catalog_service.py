from sqlalchemy.orm import Session

from app.db.models.nutritionist import Specialty


class CatalogService:
    @staticmethod
    def get_specialists(db: Session) -> list[Specialty]:
        return db.query(Specialty).all()

    @staticmethod
    def get_by_id(db: Session, speciality_id: int):
        return db.query(Specialty).filter(Specialty.id == speciality_id).first()
