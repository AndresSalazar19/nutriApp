import enum
import uuid
from datetime import datetime

from sqlalchemy import ARRAY, Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class ContentCategory(str, enum.Enum):
    nutrition = "nutrition"
    hypertension = "hypertension"
    recipes = "recipes"
    exercise = "exercise"
    lifestyle = "lifestyle"
    tips = "tips"


class ContentType(str, enum.Enum):
    article = "article"
    video = "video"
    infographic = "infographic"
    recipe = "recipe"
    tip = "tip"


class EducationalContent(Base):
    __tablename__ = "educational_content"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    category = Column(SQLEnum(ContentCategory), nullable=False)
    content_type = Column(SQLEnum(ContentType), nullable=False)
    is_approved = Column(Boolean, default=False, nullable=False)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)
    published_at = Column(DateTime, nullable=True)
    archived_at = Column(DateTime, nullable=True)
    view_count = Column(Integer, default=0)
    tags = Column(ARRAY(String), nullable=True)
    is_premium = Column(Boolean, default=False, nullable=False)
    media_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author = relationship("User", foreign_keys=[author_id])
    approver = relationship("User", foreign_keys=[approved_by])
    media = relationship("ContentMedia", back_populates="content", cascade="all, delete-orphan")


class ContentMedia(Base):
    __tablename__ = "content_media"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_id = Column(
        UUID(as_uuid=True), ForeignKey("educational_content.id", ondelete="CASCADE"), nullable=False
    )
    media_type = Column(String(50), nullable=True)
    media_url = Column(Text, nullable=False)
    thumbnail_url = Column(Text, nullable=True)
    duration = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    content = relationship("EducationalContent", back_populates="media")
