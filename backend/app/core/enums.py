import enum


class UserRole(str, enum.Enum):
    patient = "patient"
    nutritionist = "nutritionist"
    admin = "admin"
