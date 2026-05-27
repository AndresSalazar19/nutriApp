from sqlalchemy.orm import Session
from app.db.models.content import EducationalContent, ContentMedia
from app.schemas.educational_content import EducationalContentRequest
import uuid

class EducationalContentService:

    @staticmethod
    def create(db: Session, data: EducationalContentRequest, author_id: uuid.UUID) -> EducationalContent:
        new_content = EducationalContent(
            title=data.title,
            body=data.body,
            category=data.category,      
            content_type=data.content_type, 
            is_premium=data.is_premium,
            is_published=data.is_published,
            published_at=data.published_at,
            tags=data.tags,
            author_id=author_id
        )

        db.add(new_content)
        db.flush()

        if data.media:
            for m in data.media:
                media_item = ContentMedia(
                    content_id=new_content.id,
                    media_type=m.media_type,
                    media_url=str(m.media_url),
                    thumbnail_url=str(m.thumbnail_url) if m.thumbnail_url else None,
                    duration=m.duration
                )
                db.add(media_item)

        db.commit()
        db.refresh(new_content)
        return new_content

    @staticmethod
    def get_all(db: Session):
        return db.query(EducationalContent).all()

    @staticmethod
    def get_published(db: Session): #Retona solo el contenido que ya está publicado y aprobado
        from datetime import datetime
        return db.query(EducationalContent).filter(
            EducationalContent.is_published == True,
            EducationalContent.is_approved == True,
        ).all()