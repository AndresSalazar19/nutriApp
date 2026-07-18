import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class WebSocketEventType(str, Enum):
    MESSAGE = "message"
    TYPING = "typing"
    STOP_TYPING = "stop_typing"
    READ = "read"
    USER_CONNECTED = "user_connected"
    USER_DISCONNECTED = "user_disconnected"


class BaseWebSocketEvent(BaseModel):
    type: WebSocketEventType


class MessageEvent(BaseWebSocketEvent):
    type: WebSocketEventType = WebSocketEventType.MESSAGE
    content: str


class TypingEvent(BaseWebSocketEvent):
    type: WebSocketEventType = WebSocketEventType.TYPING


class StopTypingEvent(BaseWebSocketEvent):
    type: WebSocketEventType = WebSocketEventType.STOP_TYPING


class ReadEvent(BaseWebSocketEvent):
    type: WebSocketEventType = WebSocketEventType.READ
    message_id: uuid.UUID


class OutgoingMessageEvent(BaseWebSocketEvent):
    type: WebSocketEventType = WebSocketEventType.MESSAGE
    id: uuid.UUID
    conversation_id: uuid.UUID
    sender_id: uuid.UUID
    sender_role: str
    content: str
    sent_at: datetime


class UserConnectedEvent(BaseWebSocketEvent):
    type: WebSocketEventType = WebSocketEventType.USER_CONNECTED
    user_id: uuid.UUID


class UserDisconnectedEvent(BaseWebSocketEvent):
    type: WebSocketEventType = WebSocketEventType.USER_DISCONNECTED
    user_id: uuid.UUID


class TypingResponseEvent(BaseWebSocketEvent):
    type: WebSocketEventType = WebSocketEventType.TYPING
    user_id: uuid.UUID


class StopTypingResponseEvent(BaseWebSocketEvent):
    type: WebSocketEventType = WebSocketEventType.STOP_TYPING
    user_id: uuid.UUID


class ReadResponseEvent(BaseWebSocketEvent):
    type: WebSocketEventType = WebSocketEventType.READ
    message_id: uuid.UUID
    read_at: datetime
