from sqlalchemy import text

from app.db.base import Base, engine
from app.db.models.weight_log import WeightLog

conn = engine.connect()
conn.execute(text("DROP TABLE IF EXISTS weight_logs"))
conn.commit()
conn.close()

Base.metadata.create_all(bind=engine, tables=[WeightLog.__table__])
print("Tabla weight_logs recreada con log_date")
