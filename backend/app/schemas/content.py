from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.db.models.content import ContentCategory, ContentType


class ContentMediaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    media_type: Optional[str]
    media_url: str
    thumbnail_url: Optional[str]
    duration: Optional[int]


class ContentListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    body: str
    category: ContentCategory
    content_type: ContentType
    tags: Optional[list[str]]
    media_url: Optional[str]
    is_premium: bool
    is_approved: bool
    is_published: bool
    published_at: Optional[datetime]
    created_at: Optional[datetime]
    view_count: int
    author_id: UUID


class ContentDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    body: str
    category: ContentCategory
    content_type: ContentType
    tags: Optional[list[str]]
    media_url: Optional[str]
    is_premium: bool
    is_approved: bool
    is_published: bool
    published_at: Optional[datetime]
    created_at: Optional[datetime]
    view_count: int
    author_id: UUID
    media: list[ContentMediaResponse] = []


class ContentCreate(BaseModel):
    title: str
    body: str
    category: ContentCategory
    content_type: ContentType
    tags: Optional[list[str]] = None
    media_url: Optional[str] = None
    is_premium: bool = False


class ContentUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    category: Optional[ContentCategory] = None
    content_type: Optional[ContentType] = None
    tags: Optional[list[str]] = None
    media_url: Optional[str] = None
    is_premium: Optional[bool] = None
