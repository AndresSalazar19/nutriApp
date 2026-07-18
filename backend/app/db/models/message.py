import enum
import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class MessageSenderRole(str, enum.Enum):
    patient = "patient"
    nutritionist = "nutritionist"
    assistant = "assistant"


class Message(Base):
    __tablename__ = "messages"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    conversation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
    )
    sender_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )
    sender_role = Column(
        SQLEnum(MessageSenderRole),
        nullable=False,
    )
    content = Column(
        Text,
        nullable=False,
    )
    media_url = Column(String)
    delivered_at = Column(DateTime(timezone=True))
    read_at = Column(DateTime(timezone=True))
    intent = Column(String(100))
    flagged_clinical = Column(
        Boolean,
        default=False,
    )
    sent_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    conversation = relationship(
        "Conversation",
        back_populates="messages",
    )
    sender = relationship(
        "User",
    )
