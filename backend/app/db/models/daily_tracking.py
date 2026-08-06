import uuid
from datetime import datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class DailyTrackingLog(Base):
    __tablename__ = "daily_tracking_logs"
    __table_args__ = (
        Index("ix_daily_tracking_user_date_metric", "user_id", "log_date", "metric_type"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    metric_type = Column(String(20), nullable=False)
    amount = Column(Integer, nullable=False)
    log_date = Column(Date, nullable=False)
    logged_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, server_default=func.now())

    user = relationship("User")
