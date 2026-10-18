from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Float,
    DateTime, Text, ForeignKey, Boolean,
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

from app.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ─── Dependency ───
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── Users ───
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    claims = relationship("Claim", back_populates="user")


# ─── Claims ───
class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    claim_text = Column(Text, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="claims")
    prediction = relationship("Prediction", back_populates="claim", uselist=False)


# ─── Predictions ───
class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False)
    final_label = Column(Integer, nullable=False)           # 0=Fake, 1=Real
    final_prediction = Column(String(10), nullable=False)   # "Fake" / "Real"
    final_confidence = Column(Float, nullable=False)
    decided_by = Column(String(20), nullable=False)         # "baseline" / "bert" / "groq"

    # Individual model outputs
    baseline_label = Column(Integer, nullable=True)
    baseline_confidence = Column(Float, nullable=True)
    bert_label = Column(Integer, nullable=True)
    bert_confidence = Column(Float, nullable=True)
    groq_label = Column(Integer, nullable=True)
    groq_confidence = Column(Float, nullable=True)
    groq_explanation = Column(Text, nullable=True)

    explanation = Column(Text, nullable=True)
    predicted_at = Column(DateTime, default=datetime.utcnow)

    claim = relationship("Claim", back_populates="prediction")


# Trusted Sources
class TrustedSource(Base):
    __tablename__ = "trusted_sources"

    source_id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(255), nullable=False)
    article_title = Column(String(500), nullable=False, default="Unknown Article")
    category = Column(String(120), nullable=True)
    added_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ClaimTrustedSource(Base):
    __tablename__ = "claim_trusted_sources"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=False, index=True)
    source_id = Column(Integer, ForeignKey("trusted_sources.source_id"), nullable=False, index=True)
    article_name = Column(String(500), nullable=True)
    linked_at = Column(DateTime, default=datetime.utcnow)


# ─── Create all tables ───
def create_tables():
    Base.metadata.create_all(bind=engine)
