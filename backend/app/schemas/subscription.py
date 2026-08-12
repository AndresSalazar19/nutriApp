import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.db.models.subscription import SubscriptionPlan, SubscriptionStatus


class SubscriptionCreate(BaseModel):
    plan: SubscriptionPlan
    auto_renew: bool = True


class SubscriptionStatusUpdate(BaseModel):
    status: SubscriptionStatus


class SubscriptionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    plan: SubscriptionPlan
    status: SubscriptionStatus
    auto_renew: bool
    started_at: datetime
    expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
