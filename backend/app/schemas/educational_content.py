import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.db.models.content import ContentCategory, ContentType


class ContentMediaBase(BaseModel):
    media_type: str = Field(..., example="video/mp4")
    media_url: str
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None


class ContentMediaResponse(ContentMediaBase):
    id: uuid.UUID

    class Config:
        from_attributes = True


class EducationalContentRequest(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    body: str
    category: ContentCategory
    content_type: ContentType
    is_premium: bool = False
    tags: Optional[List[str]] = []
    published_at: Optional[datetime] = None
    is_published: bool = False

    media: Optional[List[ContentMediaBase]] = []


class EducationalContentResponse(BaseModel):
    id: uuid.UUID
    title: str
    body: str
    category: ContentCategory
    content_type: ContentType
    is_published: bool
    is_approved: bool
    is_premium: bool
    author_id: uuid.UUID
    author_name: Optional[str] = None
    approved_by_id: Optional[uuid.UUID] = None
    media: List[ContentMediaResponse] = []

    class Config:
        from_attributes = True

    @classmethod
    def model_validate(cls, obj, **kwargs):
        if (
            hasattr(obj, "author")
            and obj.author
            and hasattr(obj.author, "person")
            and obj.author.person
        ):
            person = obj.author.person
            obj.__dict__["author_name"] = f"{person.first_name} {person.last_name}"
        else:
            obj.__dict__["author_name"] = None
        return super().model_validate(obj, **kwargs)
