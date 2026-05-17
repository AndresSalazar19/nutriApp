from sqlalchemy import Column, Integer, String, Numeric, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class AlimentoIntercambio(Base):
    __tablename__ = "alimentos_intercambio"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(255), nullable=False)
    categoria = Column(String(100), nullable=True)
    subcategoria = Column(String(150), nullable=True)
    peso_neto_g = Column(Numeric(10, 2), nullable=True)
    medida_casera = Column(String(255), nullable=True)
    kcal = Column(Numeric(10, 2), nullable=True)
    carbohidratos = Column(Numeric(10, 2), nullable=True)
    proteinas = Column(Numeric(10, 2), nullable=True)
    grasas = Column(Numeric(10, 2), nullable=True)
    fecha_creacion = Column(DateTime, server_default=func.now(), nullable=True)