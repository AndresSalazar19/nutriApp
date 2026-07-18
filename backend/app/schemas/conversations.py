import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from app.db.models.conversations import ConversationType
from app.db.models.message import MessageSenderRole


class ConversationCreate(BaseModel):
    participant_id: uuid.UUID


class ConversationResponse(BaseModel):
    id: uuid.UUID
    conversation_type: ConversationType
    patient_id: uuid.UUID
    nutritionist_id: Optional[uuid.UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: uuid.UUID
    conversation_id: uuid.UUID
    sender_id: Optional[uuid.UUID] = None
    sender_role: MessageSenderRole
    content: str
    media_url: Optional[str] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    intent: Optional[str] = None
    flagged_clinical: bool
    sent_at: datetime

    class Config:
        from_attributes = True


class ConversationMessagesResponse(BaseModel):
    conversation_id: uuid.UUID
    messages: List[MessageResponse]

    class Config:
        from_attributes = True


class ConversationListResponse(BaseModel):
    id: uuid.UUID
    conversation_type: ConversationType
    patient_id: uuid.UUID
    nutritionist_id: Optional[uuid.UUID]
    participant_id: uuid.UUID
    participant_name: str
    participant_avatar: Optional[str]
    last_message: Optional[str]
    last_message_time: Optional[datetime]
    unread_count: int

    class Config:
        from_attributes = True
