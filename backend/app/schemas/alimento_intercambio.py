from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime


class AlimentoIntercambioResponse(BaseModel):
    id: int
    nombre: str
    categoria: str | None = None
    subcategoria: str | None = None
    peso_neto_g: Decimal | None = None
    medida_casera: str | None = None
    kcal: Decimal | None = None
    carbohidratos: Decimal | None = None
    proteinas: Decimal | None = None
    grasas: Decimal | None = None
    fecha_creacion: datetime | None = None

    class Config:
        from_attributes = True


class AlimentoIntercambioUpdate(BaseModel):
    nombre: str | None = None
    categoria: str | None = None
    subcategoria: str | None = None
    peso_neto_g: Decimal | None = None
    medida_casera: str | None = None
    kcal: Decimal | None = None
    carbohidratos: Decimal | None = None
    proteinas: Decimal | None = None
    grasas: Decimal | None = None