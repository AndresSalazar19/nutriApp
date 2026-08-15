from __future__ import annotations

from datetime import date, datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.enums import UserRole
from app.db.models.content import EducationalContent
from app.db.models.nutritionist import NutritionistProfile
from app.db.models.subscription import Subscription, SubscriptionStatusEnum
from app.db.models.user import Person, User


class AdminService:
    @staticmethod
    def get_dashboard_stats(db: Session) -> dict:
        today = date.today()
        month_start = today.replace(day=1)
        week_start_dt = datetime.combine(today - timedelta(days=7), datetime.min.time())

        nutritionists_total, nutritionists_new_this_month = (
            db.query(
                func.count(NutritionistProfile.id),
                func.count(NutritionistProfile.id).filter(User.created_at >= month_start),
            )
            .join(User, NutritionistProfile.user_id == User.id)
            .one()
        )

        patients_total, patients_new_this_month = (
            db.query(
                func.count(User.id),
                func.count(User.id).filter(User.created_at >= month_start),
            )
            .filter(User.role == UserRole.patient)
            .one()
        )

        subscriptions_active = (
            db.query(Subscription)
            .filter(Subscription.status == SubscriptionStatusEnum.active)
            .count()
        )
        subscription_rate = (
            round(subscriptions_active / patients_total * 100) if patients_total else 0
        )

        content_published_total, content_published_this_week = (
            db.query(
                func.count(EducationalContent.id),
                func.count(EducationalContent.id).filter(
                    EducationalContent.published_at >= week_start_dt
                ),
            )
            .filter(
                EducationalContent.is_published.is_(True),
                EducationalContent.archived_at.is_(None),
            )
            .one()
        )

        return {
            "nutritionists_total": nutritionists_total,
            "nutritionists_new_this_month": nutritionists_new_this_month,
            "patients_total": patients_total,
            "patients_new_this_month": patients_new_this_month,
            "subscriptions_active": subscriptions_active,
            "subscription_rate": subscription_rate,
            "content_published_total": content_published_total,
            "content_published_this_week": content_published_this_week,
        }

    @staticmethod
    def get_recent_activity(db: Session, limit: int = 6) -> list[dict]:
        events: list[dict] = []

        recent_nutritionists = (
            db.query(User, Person)
            .join(NutritionistProfile, NutritionistProfile.user_id == User.id)
            .join(Person, Person.user_id == User.id)
            .order_by(User.created_at.desc())
            .limit(limit)
            .all()
        )
        for user, person in recent_nutritionists:
            events.append(
                {
                    "text": f"Nuevo nutricionista registrado: {person.first_name} {person.last_name}",
                    "timestamp": datetime.combine(user.created_at, datetime.min.time()),
                }
            )

        recent_patients = (
            db.query(User, Person)
            .join(Person, Person.user_id == User.id)
            .filter(User.role == UserRole.patient)
            .order_by(User.created_at.desc())
            .limit(limit)
            .all()
        )
        for user, person in recent_patients:
            events.append(
                {
                    "text": f"Nuevo paciente registrado: {person.first_name} {person.last_name}",
                    "timestamp": datetime.combine(user.created_at, datetime.min.time()),
                }
            )

        recent_content = (
            db.query(EducationalContent)
            .filter(
                EducationalContent.is_published.is_(True),
                EducationalContent.archived_at.is_(None),
                EducationalContent.published_at.isnot(None),
            )
            .order_by(EducationalContent.published_at.desc())
            .limit(limit)
            .all()
        )
        for item in recent_content:
            events.append(
                {
                    "text": f"Contenido publicado: {item.title}",
                    "timestamp": item.published_at,
                }
            )

        def sort_key(event: dict) -> datetime:
            ts = event["timestamp"]
            return ts.replace(tzinfo=None) if ts.tzinfo else ts

        events.sort(key=sort_key, reverse=True)

        return [{"text": e["text"], "time": e["timestamp"].isoformat()} for e in events[:limit]]
