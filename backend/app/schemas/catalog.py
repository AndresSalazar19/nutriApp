from pydantic import BaseModel

class SpecialistResponse(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True