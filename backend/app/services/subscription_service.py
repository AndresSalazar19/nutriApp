import uuid
from typing import Optional

from sqlalchemy.orm import Session

from app.db.models.subscription import Subscription, SubscriptionStatus
from app.schemas.subscription import SubscriptionCreate


class SubscriptionService:

    @staticmethod
    def create(db: Session, user_id: uuid.UUID, data: SubscriptionCreate) -> Subscription:
        subscription = Subscription(
            user_id=user_id,
            plan=data.plan,
            auto_renew=data.auto_renew,
        )
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
        return subscription

    @staticmethod
    def get_current(db: Session, user_id: uuid.UUID) -> Optional[Subscription]:
        return (
            db.query(Subscription)
            .filter(Subscription.user_id == user_id)
            .order_by(Subscription.created_at.desc())
            .first()
        )

    @staticmethod
    def update_status(
        db: Session, subscription_id: uuid.UUID, status: SubscriptionStatus
    ) -> Optional[Subscription]:
        subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
        if not subscription:
            return None

        subscription.status = status
        db.commit()
        db.refresh(subscription)
        return subscription
