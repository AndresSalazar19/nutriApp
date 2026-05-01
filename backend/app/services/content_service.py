from sqlalchemy.orm import Session
from app.db.models.content import EducationalContent, ContentType, ContentCategory
from app.schemas.content import ContentCreate, ContentUpdate
from datetime import datetime
from uuid import UUID


class ContentService:

    @staticmethod
    def get_published(
        db: Session,
        content_type: ContentType | None = None,
        category: ContentCategory | None = None,
        q: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> list[EducationalContent]:
        query = db.query(EducationalContent).filter(
            EducationalContent.is_published == True,
            EducationalContent.archived_at == None,
        )
        if content_type:
            query = query.filter(EducationalContent.content_type == content_type)
        if category:
            query = query.filter(EducationalContent.category == category)
        if q:
            query = query.filter(EducationalContent.title.ilike(f"%{q}%"))

        return query.order_by(EducationalContent.published_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, content_id: UUID) -> EducationalContent | None:
        return db.query(EducationalContent).filter(
            EducationalContent.id == content_id,
            EducationalContent.is_published == True,
            EducationalContent.archived_at == None,
        ).first()

    @staticmethod
    def increment_views(db: Session, content: EducationalContent):
        content.view_count += 1
        db.commit()

    @staticmethod
    def create(db: Session, data: ContentCreate, author_id: UUID) -> EducationalContent:
        content = EducationalContent(**data.model_dump(), author_id=author_id)
        db.add(content)
        db.commit()
        db.refresh(content)
        return content

    @staticmethod
    def update(db: Session, content: EducationalContent, data: ContentUpdate) -> EducationalContent:
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(content, field, value)
        db.commit()
        db.refresh(content)
        return content

    @staticmethod
    def publish(db: Session, content: EducationalContent, reviewer_id: UUID) -> EducationalContent:
        content.is_approved = True
        content.approved_by = reviewer_id
        content.is_published = True
        content.published_at = datetime.utcnow()
        db.commit()
        db.refresh(content)
        return content

    @staticmethod
    def archive(db: Session, content: EducationalContent) -> EducationalContent:
        content.archived_at = datetime.utcnow()
        content.is_published = False
        db.commit()
        db.refresh(content)
        return content

    @staticmethod
    def get_any_by_id(db: Session, content_id: UUID) -> EducationalContent | None:
        return db.query(EducationalContent).filter(EducationalContent.id == content_id).first()

    @staticmethod
    def get_all_for_admin(
        db: Session,
        q: str | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> list[EducationalContent]:
        query = db.query(EducationalContent).filter(
            EducationalContent.archived_at == None,
        )
        if q:
            query = query.filter(EducationalContent.title.ilike(f"%{q}%"))
        return query.order_by(EducationalContent.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_author(
        db: Session,
        author_id: UUID,
        skip: int = 0,
        limit: int = 50,
    ) -> list[EducationalContent]:
        return (
            db.query(EducationalContent)
            .filter(EducationalContent.author_id == author_id, EducationalContent.archived_at == None)
            .order_by(EducationalContent.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def reject(db: Session, content: EducationalContent) -> EducationalContent:
        content.is_approved = False
        content.is_published = False
        content.published_at = None
        db.commit()
        db.refresh(content)
        return content