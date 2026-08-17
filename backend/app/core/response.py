from typing import Any

from app.schemas.response import ApiResponse, StatusSchema


def success_response(
    data: Any = None,
    list_data: list[Any] | None = None,
    operation: int = 1,
    messages: list[str] | None = None,
) -> ApiResponse:
    """Build the standard successful API response envelope."""
    messages = messages or []
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
    messages: list[str],
    status_code: int = 500,
    operation: int = 0,
) -> ApiResponse:
    """Build the standard unsuccessful API response envelope."""
    return ApiResponse(
        operation=operation,
        status=StatusSchema(isSuccessfully=False, messages=messages),
        statusCode=status_code,
        count=0,
        data=None,
        listData=None,
    )
