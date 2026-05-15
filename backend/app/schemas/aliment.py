from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AlimentRequest(BaseModel):
    nombre: str
    categoria: Optional[str] = None

    kcal: Optional[float] = None
    carbohidratos: Optional[float] = None
    proteinas: Optional[float] = None
    grasas: Optional[float] = None

    calcio_mg: Optional[float] = None
    potasio_mg: Optional[float] = None
    sodio_mg: Optional[float] = None
    zinc_mg: Optional[float] = None

    vit_c_mg: Optional[float] = None
    vit_a_ug: Optional[float] = None
    folatos_ug: Optional[float] = None

    porcion_taza: Optional[float] = None
    porcion_cda: Optional[float] = None
    porcion_unidad: Optional[float] = None


class AlimentResponse(BaseModel):
    id: int

    nombre: str
    categoria: Optional[str] = None

    kcal: Optional[float] = None
    carbohidratos: Optional[float] = None
    proteinas: Optional[float] = None
    grasas: Optional[float] = None

    calcio_mg: Optional[float] = None
    potasio_mg: Optional[float] = None
    sodio_mg: Optional[float] = None
    zinc_mg: Optional[float] = None

    vit_c_mg: Optional[float] = None
    vit_a_ug: Optional[float] = None
    folatos_ug: Optional[float] = None

    porcion_taza: Optional[float] = None
    porcion_cda: Optional[float] = None
    porcion_unidad: Optional[float] = None

    fecha_creacion: Optional[datetime] = None

    class Config:
        from_attributes = True