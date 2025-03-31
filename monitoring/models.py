from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./monitoring.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Parser(Base):
    __tablename__ = "parsers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    version = Column(String)
    total_recipes = Column(Integer, default=0)
    accuracy_score = Column(Float, default=0.0)
    error_count = Column(Integer, default=0)
    last_run = Column(DateTime, default=datetime.utcnow)
    last_run_recipes = Column(Integer, default=0)
    avg_parse_time = Column(Float, default=0.0)
    errors = relationship("ParseError", back_populates="parser")

class ParseError(Base):
    __tablename__ = "parse_errors"

    id = Column(Integer, primary_key=True, index=True)
    parser_id = Column(Integer, ForeignKey("parsers.id"))
    url = Column(String)
    error_message = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    parser = relationship("Parser", back_populates="errors")

class WeeklyReport(Base):
    __tablename__ = "weekly_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_date = Column(DateTime, default=datetime.utcnow)
    total_recipes = Column(Integer)
    success_rate = Column(Float)
    avg_accuracy = Column(Float)
    error_count = Column(Integer)
    report_data = Column(String)  # JSON string of detailed report data

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 