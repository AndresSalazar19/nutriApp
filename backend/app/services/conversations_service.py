import uuid
from datetime import datetime, timezone

from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.db.models.conversations import Conversation, ConversationType
from app.db.models.message import Message, MessageSenderRole
from app.schemas.conversations import MessageCreate


class ChatsService:
    @staticmethod
    def create_or_get_conversation(
        db: Session,
        patient_id: uuid.UUID,
        nutritionist_id: uuid.UUID,
    ) -> Conversation:
        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.conversation_type == ConversationType.human,
                Conversation.patient_id == patient_id,
                Conversation.nutritionist_id == nutritionist_id,
            )
            .first()
        )

        if conversation:
            return conversation

        conversation = Conversation(
            conversation_type=ConversationType.human,
            patient_id=patient_id,
            nutritionist_id=nutritionist_id,
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return conversation

    @staticmethod
    def get_conversations(
        db: Session,
        user_id: uuid.UUID,
    ):
        conversations = (
            db.query(Conversation)
            .options(
                joinedload(Conversation.patient),
                joinedload(Conversation.nutritionist),
                joinedload(Conversation.messages),
            )
            .filter(
                Conversation.conversation_type == ConversationType.human,
                or_(
                    Conversation.patient_id == user_id,
                    Conversation.nutritionist_id == user_id,
                ),
            )
            .all()
        )

        min_dt = datetime.min.replace(tzinfo=timezone.utc)

        response = []

        for conversation in conversations:
            participant = (
                conversation.nutritionist
                if conversation.patient_id == user_id
                else conversation.patient
            )

            if participant is None or participant.person is None:
                continue

            real_messages = [
                m for m in conversation.messages if m.sender_role != MessageSenderRole.assistant
            ]

            last_message = (
                max(real_messages, key=lambda x: x.sent_at or min_dt) if real_messages else None
            )

            unread = sum(
                1
                for message in real_messages
                if (
                    message.sender_id is not None
                    and message.sender_id != user_id
                    and message.read_at is None
                )
            )

            response.append(
                {
                    "id": conversation.id,
                    "conversation_type": conversation.conversation_type,
                    "patient_id": conversation.patient_id,
                    "nutritionist_id": conversation.nutritionist_id,
                    "participant_id": participant.id,
                    "participant_name": f"{participant.person.first_name} {participant.person.last_name}",
                    "participant_avatar": participant.person.avatar_url,
                    "last_message": last_message.content if last_message else None,
                    "last_message_time": last_message.sent_at if last_message else None,
                    "unread_count": unread,
                }
            )

        response.sort(
            key=lambda x: x["last_message_time"] or min_dt,
            reverse=True,
        )

        return response

    @staticmethod
    def get_messages(
        db: Session,
        conversation_id: uuid.UUID,
    ):
        return (
            db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.sent_at.asc())
            .all()
        )

    @staticmethod
    def send_message(
        db: Session,
        conversation_id: uuid.UUID,
        sender_id: uuid.UUID,
        sender_role: MessageSenderRole,
        data: MessageCreate,
    ) -> Message:
        message = Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            sender_role=sender_role,
            content=data.content,
            sent_at=datetime.now(timezone.utc),
        )

        db.add(message)
        db.commit()
        db.refresh(message)

        return message

    @staticmethod
    def get_conversation_by_id(
        db: Session,
        conversation_id: uuid.UUID,
    ) -> Conversation | None:
        return db.query(Conversation).filter(Conversation.id == conversation_id).first()

    @staticmethod
    def validate_access(
        conversation: Conversation,
        user_id: uuid.UUID,
    ) -> bool:
        return conversation.patient_id == user_id or conversation.nutritionist_id == user_id

    @staticmethod
    def mark_message_as_read(
        db: Session,
        message_id: uuid.UUID,
    ):
        message = db.query(Message).filter(Message.id == message_id).first()

        if not message:
            return None

        message.read_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(message)
        return message

    @staticmethod
    def mark_conversation_as_read(
        db: Session,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
    ):
        (
            db.query(Message)
            .filter(
                Message.conversation_id == conversation_id,
                Message.sender_id != user_id,
                Message.read_at.is_(None),
            )
            .update(
                {Message.read_at: datetime.now(timezone.utc)},
                synchronize_session=False,
            )
        )

        db.commit()

    @staticmethod
    def get_last_message(
        db: Session,
        conversation_id: uuid.UUID,
    ) -> Message | None:
        return (
            db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.sent_at.desc())
            .first()
        )
