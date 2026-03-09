from typing import Any, List
from app.schemas.response import ApiResponse, StatusSchema


def success_response(
    data: Any = None,
    list_data: List[Any] | None = None,
    operation: int = 1,
    messages: List[str] = [],
) -> ApiResponse:
    count = len(list_data) if list_data else (1 if data else 0)
    return ApiResponse(
        operation=operation,
        status=StatusSchema(isSuccessfully=True, messages=messages),
        statusCode=200,
        count=count,
        data=data,
        listData=list_data,
    )


def error_response(
    messages: List[str],
    status_code: int = 500,
    operation: int = 0,
) -> ApiResponse:
    return ApiResponse(
        operation=operation,
        status=StatusSchema(isSuccessfully=False, messages=messages),
        statusCode=status_code,
        count=0,
        data=None,
        listData=None,
    )