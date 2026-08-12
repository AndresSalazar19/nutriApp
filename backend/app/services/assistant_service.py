import uuid

from sqlalchemy.orm import Session

from app.ai.prompts import Prompts
from app.db.models.conversations import Conversation, ConversationType
from app.db.models.message import Message, MessageSenderRole
from app.db.models.user import User
from app.services.ai.base_provider import BaseAIProvider


class AssistantService:
    """
    Servicio encargado de administrar el asistente virtual.

    Responsabilidades:
    - Obtener o crear la conversación con IA.
    - Guardar mensajes.
    - Construir el historial.
    - Llamar a OpenAI.
    """

    @classmethod
    async def send_message(
        cls,
        *,
        db: Session,
        user: User,
        message: str,
        ai_provider: BaseAIProvider,
        premium: bool = False,
    ) -> Message:
        """
        Procesa un mensaje enviado al asistente.
        """

        conversation = cls._get_or_create_conversation(db=db, patient_id=user.id)
        cls._save_user_message(
            db=db, conversation_id=conversation.id, user_id=user.id, content=message
        )
        history = cls._build_history(db=db, conversation_id=conversation.id)

        prompt = Prompts.PREMIUM if premium else Prompts.BASIC

        prompt_data = {"prompt": prompt, "history": history, "message": message}

        assistant_response = await ai_provider.generate_meal_plan(prompt_data)

        # support providers that return either a dict with 'content' or a plain string
        if isinstance(assistant_response, dict):
            assistant_text = assistant_response.get("content", "")
        else:
            assistant_text = str(assistant_response)
        assistant_message = cls._save_assistant_message(
            db=db, conversation_id=conversation.id, content=assistant_text
        )

        return assistant_message

    @staticmethod
    def _get_or_create_conversation(*, db: Session, patient_id: uuid.UUID) -> Conversation:
        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.patient_id == patient_id,
                Conversation.conversation_type == ConversationType.ai,
            )
            .first()
        )

        if conversation:
            return conversation

        conversation = Conversation(
            patient_id=patient_id, nutritionist_id=None, conversation_type=ConversationType.ai
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return conversation

    @staticmethod
    def _save_user_message(
        *, db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID, content: str
    ) -> Message:
        message = Message(
            conversation_id=conversation_id,
            sender_id=user_id,
            sender_role=MessageSenderRole.patient,
            content=content,
        )

        db.add(message)
        db.commit()
        db.refresh(message)

        return message

    @staticmethod
    def _save_assistant_message(
        *, db: Session, conversation_id: uuid.UUID, content: str
    ) -> Message:
        message = Message(
            conversation_id=conversation_id,
            sender_id=None,
            sender_role=MessageSenderRole.assistant,
            content=content,
        )
        db.add(message)
        db.commit()
        db.refresh(message)

        return message

    @staticmethod
    def _build_history(*, db: Session, conversation_id: uuid.UUID, limit: int = 20) -> list[dict]:
        messages = (
            db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.sent_at.desc())
            .limit(limit)
            .all()
        )

        messages.reverse()
        history = []

        for msg in messages:
            role = "assistant" if msg.sender_role == MessageSenderRole.assistant else "user"

            history.append(
                {
                    "role": role,
                    "content": msg.content,
                }
            )

        return history

    @classmethod
    def get_messages(cls, *, db: Session, user: User) -> list[Message]:
        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.patient_id == user.id,
                Conversation.conversation_type == ConversationType.ai,
            )
            .first()
        )

        if not conversation:
            return []

        return (
            db.query(Message)
            .filter(Message.conversation_id == conversation.id)
            .order_by(Message.sent_at.asc())
            .all()
        )
