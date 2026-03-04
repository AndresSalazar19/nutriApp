from pydantic import BaseModel
from typing import Any, Generic, TypeVar, List

T = TypeVar("T")

class StatusSchema(BaseModel):
    isSuccessfully: bool
    messages: List[str] = []

class ApiResponse(BaseModel, Generic[T]):
    operation: int
    status: StatusSchema
    statusCode: int
    count: int
    data: T | None = None
    listData: List[T] | None = None