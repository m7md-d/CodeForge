import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# The database will be stored in the data directory one level up
DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
os.makedirs(DB_DIR, exist_ok=True)
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(DB_DIR, 'ccenter.db')}"

# connect_args={"check_same_thread": False} is required for SQLite in FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency for FastAPI to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
