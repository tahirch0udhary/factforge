from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# ─── Auth ───
class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Verify Claim ───
class ClaimRequest(BaseModel):
    claim_text: str
    speaker: Optional[str] = None
    subject: Optional[str] = None
    context: Optional[str] = None


class ModelResult(BaseModel):
    label: int
    prediction: str
    confidence: float


class TrustedSourceItem(BaseModel):
    source_id: int
    source_name: str
    category: Optional[str] = None
    added_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class HistorySourceItem(BaseModel):
    source_id: int
    source_name: str
    article_name: Optional[str] = None
    category: Optional[str] = None


class VerifyResponse(BaseModel):
    claim_id: int
    claim_text: str
    final_label: int
    final_prediction: str
    final_confidence: float
    decided_by: str
    explanation: Optional[str] = None
    groq_reasoning: Optional[str] = None
    baseline_result: Optional[ModelResult] = None
    bert_result: Optional[ModelResult] = None
    groq_result: Optional[ModelResult] = None
    trusted_sources: list[HistorySourceItem] = Field(default_factory=list)


# ─── History ───
class HistoryItem(BaseModel):
    claim_id: int
    claim_text: str
    final_prediction: str
    final_confidence: float
    decided_by: str
    explanation: Optional[str] = None
    groq_reasoning: Optional[str] = None
    submitted_at: datetime
    trusted_sources: list[HistorySourceItem] = Field(default_factory=list)

    class Config:
        from_attributes = True


# ─── Stats ───
class StatsResponse(BaseModel):
    total_claims: int
    fake_count: int
    real_count: int
    avg_confidence: float
    decided_by_baseline: int
    decided_by_bert: int
    decided_by_groq: int
    baseline_model_info: dict
    bert_model_info: dict
