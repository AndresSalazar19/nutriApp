import os
import uuid
from datetime import date
from typing import Optional

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.db.models.anthropometric_measurement import AnthropometricMeasurement

_UPLOAD_DIR = "uploads/bioimpedance"
_MAX_FILE_BYTES = 8 * 1024 * 1024
_EXTENSION_BY_CONTENT_TYPE = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


class AnthropometricMeasurementService:
    @staticmethod
    def _save_bio_file(file: UploadFile) -> str:
        content_type = file.content_type or ""
        is_allowed = content_type == "application/pdf" or content_type.startswith("image/")
        if not is_allowed:
            raise ValueError("Solo se permiten archivos PDF o imágenes (JPG/PNG/WEBP)")

        raw = file.file.read()
        if not raw:
            raise ValueError("El archivo está vacío")
        if len(raw) > _MAX_FILE_BYTES:
            raise ValueError("El archivo supera el tamaño máximo permitido (8MB)")

        _, extension = os.path.splitext(file.filename or "")
        if not extension:
            extension = _EXTENSION_BY_CONTENT_TYPE.get(content_type, "")
        if not extension:
            raise ValueError("Tipo de archivo no soportado")

        os.makedirs(_UPLOAD_DIR, exist_ok=True)
        file_path = f"{_UPLOAD_DIR}/{uuid.uuid4()}{extension}"
        with open(file_path, "wb") as f:
            f.write(raw)

        return file_path

    @classmethod
    def create(
        cls,
        db: Session,
        user_id: uuid.UUID,
        log_date: date,
        fat_percent: Optional[float],
        muscle_mass_kg: Optional[float],
        skinfolds: dict,
        circumferences: dict,
        notes: Optional[str],
        created_by: uuid.UUID,
        file: Optional[UploadFile] = None,
    ) -> AnthropometricMeasurement:
        bio_file_path = cls._save_bio_file(file) if file is not None else None

        measurement = AnthropometricMeasurement(
            user_id=user_id,
            log_date=log_date,
            fat_percent=fat_percent,
            muscle_mass_kg=muscle_mass_kg,
            bioimpedance_file_path=bio_file_path,
            skinfold_triceps_mm=skinfolds.get("triceps"),
            skinfold_subscapular_mm=skinfolds.get("subscapular"),
            skinfold_suprailiac_mm=skinfolds.get("suprailiac"),
            skinfold_abdominal_mm=skinfolds.get("abdominal"),
            skinfold_thigh_mm=skinfolds.get("thigh"),
            circumference_waist_cm=circumferences.get("waist"),
            circumference_hip_cm=circumferences.get("hip"),
            circumference_arm_cm=circumferences.get("arm"),
            circumference_thigh_cm=circumferences.get("thigh"),
            circumference_calf_cm=circumferences.get("calf"),
            circumference_neck_cm=circumferences.get("neck"),
            notes=notes,
            created_by=created_by,
        )
        db.add(measurement)
        db.commit()
        db.refresh(measurement)
        return measurement

    @staticmethod
    def get_latest(db: Session, user_id: uuid.UUID) -> Optional[AnthropometricMeasurement]:
        return (
            db.query(AnthropometricMeasurement)
            .filter(AnthropometricMeasurement.user_id == user_id)
            .order_by(
                AnthropometricMeasurement.log_date.desc(),
                AnthropometricMeasurement.created_at.desc(),
            )
            .first()
        )

    @staticmethod
    def get_history(
        db: Session, user_id: uuid.UUID, limit: int = 50
    ) -> list[AnthropometricMeasurement]:
        return (
            db.query(AnthropometricMeasurement)
            .filter(AnthropometricMeasurement.user_id == user_id)
            .order_by(AnthropometricMeasurement.log_date.desc())
            .limit(limit)
            .all()
        )
