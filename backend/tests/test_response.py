from app.core.response import error_response, success_response


def test_success_response_with_single_item() -> None:
    response = success_response(data={"id": 1}, messages=["Created"])

    assert response.operation == 1
    assert response.status.isSuccessfully is True
    assert response.status.messages == ["Created"]
    assert response.statusCode == 200
    assert response.count == 1
    assert response.data == {"id": 1}


def test_success_response_with_list() -> None:
    response = success_response(list_data=[{"id": 1}, {"id": 2}])

    assert response.count == 2
    assert response.listData == [{"id": 1}, {"id": 2}]


def test_error_response() -> None:
    response = error_response(["Not found"], status_code=404)

    assert response.operation == 0
    assert response.status.isSuccessfully is False
    assert response.status.messages == ["Not found"]
    assert response.statusCode == 404
    assert response.count == 0
