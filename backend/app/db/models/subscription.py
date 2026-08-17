import enum
import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, func
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class SubscriptionPlanEnum(str, enum.Enum):
    free = "free"
    basic = "basic"
    premium = "premium"


class SubscriptionStatusEnum(str, enum.Enum):
    active = "active"
    cancelled = "cancelled"
    expired = "expired"
    pending = "pending"


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # name/create_type=False: el tipo enum ya existe en la BD (confirmado via
    # `SELECT enum_range(NULL::subscription_plan)`), no queremos que
    # SQLAlchemy intente recrearlo.
    plan = Column(
        SQLEnum(SubscriptionPlanEnum, name="subscription_plan", create_type=False),
        nullable=False,
        default=SubscriptionPlanEnum.free,
    )
    status = Column(
        SQLEnum(SubscriptionStatusEnum, name="subscription_status", create_type=False),
        nullable=False,
        default=SubscriptionStatusEnum.active,
    )

    started_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    auto_renew = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User")
