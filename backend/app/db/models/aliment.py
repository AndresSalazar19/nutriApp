from sqlalchemy import Column, String, Integer, Numeric, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class Aliment(Base):
    __tablename__ = "alimentos"

    id = Column(Integer, primary_key=True, index=True)

    nombre = Column(String(255), nullable=False)
    categoria = Column(String(100), nullable=True)

    kcal = Column(Numeric(10, 2), nullable=True)
    carbohidratos = Column(Numeric(10, 2), nullable=True)
    proteinas = Column(Numeric(10, 2), nullable=True)
    grasas = Column(Numeric(10, 2), nullable=True)

    calcio_mg = Column(Numeric(10, 2), nullable=True)
    potasio_mg = Column(Numeric(10, 2), nullable=True)
    sodio_mg = Column(Numeric(10, 2), nullable=True)
    zinc_mg = Column(Numeric(10, 2), nullable=True)

    vit_c_mg = Column(Numeric(10, 2), nullable=True)
    vit_a_ug = Column(Numeric(10, 2), nullable=True)
    folatos_ug = Column(Numeric(10, 2), nullable=True)

    porcion_taza = Column(Numeric(10, 2), nullable=True)
    porcion_cda = Column(Numeric(10, 2), nullable=True)
    porcion_unidad = Column(Numeric(10, 2), nullable=True)

    fecha_creacion = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=True
    )