import uuid

from sqlalchemy.orm import Session

from app.db.models.subscription import Subscription, SubscriptionPlanEnum, SubscriptionStatusEnum


class SubscriptionService:
    @staticmethod
    def get_current(db: Session, user_id: uuid.UUID) -> Subscription | None:
        return (
            db.query(Subscription)
            .filter(Subscription.user_id == user_id)
            .order_by(Subscription.created_at.desc())
            .first()
        )

    @staticmethod
    def subscribe(db: Session, user_id: uuid.UUID, plan: SubscriptionPlanEnum) -> Subscription:
        """
        Crea o actualiza la suscripcion del usuario. No se insertan filas
        nuevas por cada cambio de plan (evita duplicados de 'suscripcion
        activa'): si ya existe una, se actualiza el plan y se reactiva.
        """
        subscription = db.query(Subscription).filter(Subscription.user_id == user_id).first()

        if subscription:
            subscription.plan = plan
            subscription.status = SubscriptionStatusEnum.active
            subscription.auto_renew = True
        else:
            subscription = Subscription(
                user_id=user_id,
                plan=plan,
                status=SubscriptionStatusEnum.active,
            )
            db.add(subscription)

        db.commit()
        db.refresh(subscription)
        return subscription

    @staticmethod
    def cancel(db: Session, subscription_id: uuid.UUID) -> Subscription | None:
        subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
        if not subscription:
            return None

        subscription.status = SubscriptionStatusEnum.cancelled
        subscription.auto_renew = False

        db.commit()
        db.refresh(subscription)
        return subscription

    @staticmethod
    def update_status(
        db: Session, subscription_id: uuid.UUID, status: SubscriptionStatusEnum
    ) -> Subscription | None:
        """Cambio administrativo de estado (nutricionista/admin), sin pasar
        por las reglas de subscribe()/cancel() pensadas para el paciente."""
        subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
        if not subscription:
            return None

        subscription.status = status
        db.commit()
        db.refresh(subscription)
        return subscription
