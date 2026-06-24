from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class StatusSchema(BaseModel):
    isSuccessfully: bool
    messages: list[str] = Field(default_factory=list)


class ApiResponse(BaseModel, Generic[T]):
    operation: int
    status: StatusSchema
    statusCode: int
    count: int
    data: T | None = None
    listData: list[T] | None = None
