from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.base import get_db
from app.db.models.content import ContentType, ContentCategory
from app.db.models.user import User
from app.schemas.content import ContentCreate, ContentUpdate, ContentDetailResponse, ContentListResponse
from app.core.dependencies import get_current_user, require_admin, require_nutritionist_or_admin
from app.core.response import success_response, error_response
from app.services.content_service import ContentService

router = APIRouter(prefix="/content", tags=["content"])


# ── Rutas con segmento fijo — deben ir ANTES de /{content_id} ───────────────

@router.get("/admin/all", response_model=None)
def list_all_content_admin(
    q: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    items = ContentService.get_all_for_admin(db, q, skip, limit)
    data = [ContentListResponse.model_validate(i).model_dump(mode="json") for i in items]
    return JSONResponse(status_code=200, content=success_response(data=data).model_dump())


@router.get("/my", response_model=None)
def list_my_content(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_nutritionist_or_admin),
):
    items = ContentService.get_by_author(db, current_user.id, skip, limit)
    data = [ContentListResponse.model_validate(i).model_dump(mode="json") for i in items]
    return JSONResponse(status_code=200, content=success_response(data=data).model_dump())


# ── Pacientes / público autenticado ─────────────────────────────────────────

@router.get("", response_model=None)
def list_content(
    content_type: ContentType | None = Query(None),
    category: ContentCategory | None = Query(None),
    q: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = ContentService.get_published(db, content_type, category, q, skip, limit)
    data = [ContentListResponse.model_validate(i).model_dump(mode="json") for i in items]
    return JSONResponse(status_code=200, content=success_response(data=data).model_dump())


@router.get("/{content_id}", response_model=None)
def get_content(
    content_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = ContentService.get_by_id(db, content_id)
    if not content:
        return JSONResponse(status_code=404, content=error_response(["Contenido no encontrado"], 404).model_dump())

    ContentService.increment_views(db, content)
    data = ContentDetailResponse.model_validate(content).model_dump(mode="json")
    return JSONResponse(status_code=200, content=success_response(data=data).model_dump())


# ── Admin / Nutricionista ────────────────────────────────────────────────────

@router.post("", response_model=None)
def create_content(
    body: ContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_nutritionist_or_admin),
):
    content = ContentService.create(db, body, current_user.id)
    data = ContentDetailResponse.model_validate(content).model_dump(mode="json")
    return JSONResponse(status_code=201, content=success_response(data=data).model_dump())


@router.put("/{content_id}", response_model=None)
def update_content(
    content_id: UUID,
    body: ContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    content = ContentService.get_any_by_id(db, content_id)
    if not content:
        return JSONResponse(status_code=404, content=error_response(["Contenido no encontrado"], 404).model_dump())

    content = ContentService.update(db, content, body)
    data = ContentDetailResponse.model_validate(content).model_dump(mode="json")
    return JSONResponse(status_code=200, content=success_response(data=data).model_dump())


@router.patch("/{content_id}/publish", response_model=None)
def publish_content(
    content_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    content = ContentService.get_any_by_id(db, content_id)
    if not content:
        return JSONResponse(status_code=404, content=error_response(["Contenido no encontrado"], 404).model_dump())

    content = ContentService.publish(db, content, current_user.id)
    data = ContentDetailResponse.model_validate(content).model_dump(mode="json")
    return JSONResponse(status_code=200, content=success_response(data=data).model_dump())


@router.patch("/{content_id}/reject", response_model=None)
def reject_content(
    content_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    content = ContentService.get_any_by_id(db, content_id)
    if not content:
        return JSONResponse(status_code=404, content=error_response(["Contenido no encontrado"], 404).model_dump())

    content = ContentService.reject(db, content)
    data = ContentDetailResponse.model_validate(content).model_dump(mode="json")
    return JSONResponse(status_code=200, content=success_response(data=data).model_dump())


@router.patch("/{content_id}/archive", response_model=None)
def archive_content(
    content_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    content = ContentService.get_any_by_id(db, content_id)
    if not content:
        return JSONResponse(status_code=404, content=error_response(["Contenido no encontrado"], 404).model_dump())

    content = ContentService.archive(db, content)
    data = ContentDetailResponse.model_validate(content).model_dump(mode="json")
    return JSONResponse(status_code=200, content=success_response(data=data).model_dump())
