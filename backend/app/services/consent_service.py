from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.core.enums import UserRole
from app.db.models.consent import ConsentType, UserConsent
from app.db.models.user import User

# Bumping this forces every user of that role to accept again on next login —
# e.g. if the terms/privacy-policy text changes materially.
CURRENT_VERSION = "1.0"

REQUIRED_ITEMS: dict[ConsentType, list[str]] = {
    ConsentType.nutritionist_platform_terms: [
        "terms_and_conditions",
        "privacy_policy",
        "responsible_clinical_data_use",
        "professional_confidentiality_agreement",
    ],
    ConsentType.patient_informed_consent: [
        "data_use",
        "nutritional_care",
        "clinical_followup",
        "messages_and_reminders",
    ],
}


def consent_type_for_role(role: UserRole) -> Optional[ConsentType]:
    if role == UserRole.nutritionist:
        return ConsentType.nutritionist_platform_terms
    if role == UserRole.patient:
        return ConsentType.patient_informed_consent
    return None  # admins aren't gated by this


class ConsentService:
    @staticmethod
    def get_status(db: Session, user: User) -> dict:
        consent_type = consent_type_for_role(user.role)
        if consent_type is None:
            return {
                "required": False,
                "accepted": True,
                "consent_type": None,
                "version": None,
                "required_items": [],
                "accepted_at": None,
            }

        record = (
            db.query(UserConsent)
            .filter(
                UserConsent.user_id == user.id,
                UserConsent.consent_type == consent_type,
                UserConsent.version == CURRENT_VERSION,
            )
            .order_by(UserConsent.accepted_at.desc())
            .first()
        )

        return {
            "required": True,
            "accepted": record is not None,
            "consent_type": consent_type.value,
            "version": CURRENT_VERSION,
            "required_items": REQUIRED_ITEMS[consent_type],
            "accepted_at": record.accepted_at.isoformat() if record else None,
        }

    @staticmethod
    def record_acceptance(db: Session, user: User, signature_name: str) -> UserConsent:
        consent_type = consent_type_for_role(user.role)
        if consent_type is None:
            raise ValueError("Este rol no requiere consentimiento")

        if not signature_name or not signature_name.strip():
            raise ValueError("La firma (nombre completo) es obligatoria")

        record = UserConsent(
            user_id=user.id,
            consent_type=consent_type,
            version=CURRENT_VERSION,
            accepted_items=REQUIRED_ITEMS[consent_type],
            signature_name=signature_name.strip(),
            accepted_at=datetime.utcnow(),
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record
