import uuid
from typing import Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session, aliased

from app.db.models.patient import PatientHistory, PatientProfile, PatientStatus
from app.db.models.patient_nutritionist import PatientNutritionist
from app.db.models.user import Person, User, UserRole


class PatientService:

    @staticmethod
    def _get_or_create_profile(db: Session, user_id: uuid.UUID) -> PatientProfile:
        profile = db.query(PatientProfile).filter(PatientProfile.user_id == user_id).first()
        if not profile:
            profile = PatientProfile(user_id=user_id)
            db.add(profile)
            db.commit()
            db.refresh(profile)
        return profile

    @staticmethod
    def get_patients(
        db: Session,
        name: Optional[str] = None,
        status: Optional[str] = None,
        priority: Optional[bool] = None,
    ):
        nutri_person = aliased(Person)

        query = (
            db.query(User, Person, PatientProfile, PatientNutritionist, nutri_person)
            .join(Person, Person.user_id == User.id)
            .outerjoin(
                PatientNutritionist,
                (PatientNutritionist.patient_id == User.id)
                & (PatientNutritionist.is_active == True),
            )
            .outerjoin(nutri_person, nutri_person.user_id == PatientNutritionist.nutritionist_id)
            .outerjoin(PatientProfile, PatientProfile.user_id == User.id)
            .filter(User.role == UserRole.patient)
        )

        if name:
            search = f"%{name}%"
            query = query.filter(
                or_(
                    Person.first_name.ilike(search),
                    Person.last_name.ilike(search),
                )
            )

        records = query.all()

        results = []
        for user, person, profile, _relation, nutri_person_data in records:
            patient_status = profile.status if profile else "active"
            patient_flag = profile.priority_flag if profile else False

            if status and patient_status != status:
                continue
            if priority is not None and patient_flag != priority:
                continue

            results.append(
                {
                    "user_id": str(user.id),
                    "email": user.email,
                    "first_name": person.first_name if person else "",
                    "last_name": person.last_name if person else "",
                    "phone": person.phone if person else None,
                    "avatar_url": user.avatar_url,
                    "nutritionist_name": (
                        f"{nutri_person_data.first_name} {nutri_person_data.last_name}"
                        if nutri_person_data
                        else None
                    ),
                    "nutritionist_initials": (
                        f"{nutri_person_data.first_name[0]}{nutri_person_data.last_name[0]}"
                        if nutri_person_data
                        else None
                    ),
                    "status": patient_status,
                    "priority_flag": patient_flag,
                    "registered_at": user.created_at.isoformat() if user.created_at else None,
                }
            )

        return results

    @staticmethod
    def search_patients(db: Session, q: str):
        search = f"%{q}%"
        query = (
            db.query(User, Person, PatientProfile)
            .join(Person, Person.user_id == User.id)
            .outerjoin(PatientProfile, PatientProfile.user_id == User.id)
            .filter(User.role == UserRole.patient)
            .filter(
                or_(
                    Person.first_name.ilike(search),
                    Person.last_name.ilike(search),
                    User.email.ilike(search),
                )
            )
        )

        records = query.all()

        results = []
        for user, person, profile in records:
            results.append(
                {
                    "user_id": str(user.id),
                    "email": user.email,
                    "first_name": person.first_name if person else "",
                    "last_name": person.last_name if person else "",
                    "phone": person.phone if person else None,
                    "status": profile.status if profile else "active",
                    "priority_flag": profile.priority_flag if profile else False,
                }
            )
        return results

    @staticmethod
    def get_patient_detail(db: Session, user_id: uuid.UUID):
        user = db.query(User).filter(User.id == user_id, User.role == UserRole.patient).first()
        if not user:
            return None

        profile = db.query(PatientProfile).filter(PatientProfile.user_id == user_id).first()

        return {
            "user_id": str(user.id),
            "email": user.email,
            "person": user.person,
            "status": profile.status if profile else "active",
            "priority_flag": profile.priority_flag if profile else False,
            "clinical_notes": profile.clinical_notes if profile else None,
        }

    @staticmethod
    def get_history(db: Session, user_id: uuid.UUID):
        profile = db.query(PatientProfile).filter(PatientProfile.user_id == user_id).first()
        if not profile:
            return []
        return (
            db.query(PatientHistory)
            .filter(PatientHistory.patient_profile_id == profile.id)
            .order_by(PatientHistory.created_at.desc())
            .all()
        )

    @staticmethod
    def update_notes(db: Session, user_id: uuid.UUID, notes: str):
        profile = PatientService._get_or_create_profile(db, user_id)
        profile.clinical_notes = notes
        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def update_flag(db: Session, user_id: uuid.UUID, flag: bool):
        profile = PatientService._get_or_create_profile(db, user_id)
        profile.priority_flag = flag
        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def update_status(db: Session, user_id: uuid.UUID, new_status: str):
        profile = PatientService._get_or_create_profile(db, user_id)
        profile.status = PatientStatus(new_status)
        db.commit()
        db.refresh(profile)
        return profile
