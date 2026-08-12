import uuid
from datetime import datetime

from pydantic import BaseModel

from app.db.models.subscription import SubscriptionPlanEnum, SubscriptionStatusEnum


class SubscriptionCreate(BaseModel):
    # `plan` ya viene mapeado al enum de BD ('free' | 'basic' | 'premium')
    # desde el frontend (ver toSubscriptionPlanCode en subscriptionService.ts).
    # No es el code visual del catalogo ('basic' | 'standard' | 'premium').
    plan: SubscriptionPlanEnum


class SubscriptionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    plan: SubscriptionPlanEnum
    status: SubscriptionStatusEnum
    started_at: datetime
    expires_at: datetime | None = None
    auto_renew: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
