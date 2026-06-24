from sqlalchemy.orm import Session

from app.db.models.alimento_intercambio import AlimentoIntercambio
from app.schemas.alimento_intercambio import AlimentoIntercambioUpdate


class AlimentoIntercambioService:

    @staticmethod
    def get_all(db: Session) -> list[AlimentoIntercambio]:
        return db.query(AlimentoIntercambio).order_by(AlimentoIntercambio.id).all()

    @staticmethod
    def get_by_id(db: Session, alimento_id: int) -> AlimentoIntercambio | None:
        return db.query(AlimentoIntercambio).filter(AlimentoIntercambio.id == alimento_id).first()

    @staticmethod
    def update(
        db: Session, alimento: AlimentoIntercambio, data: AlimentoIntercambioUpdate
    ) -> AlimentoIntercambio:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(alimento, field, value)

        db.commit()
        db.refresh(alimento)
        return alimento
