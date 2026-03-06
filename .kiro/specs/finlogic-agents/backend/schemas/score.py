from pydantic import BaseModel, Field
from typing import List, Dict


class ScoreBreakdown(BaseModel):
    credit_consistency: int = Field(
        ..., ge=0, le=200, description="Score for credit consistency (0-200)"
    )
    purchase_regularity: int = Field(
        ..., ge=0, le=200, description="Score for purchase regularity (0-200)"
    )
    invoice_match: int = Field(
        ..., ge=0, le=200, description="Score for invoice matching (0-200)"
    )
    balance_health: int = Field(
        ..., ge=0, le=200, description="Score for balance health (0-200)"
    )
    business_cycle: int = Field(
        ..., ge=0, le=100, description="Score for business cycle (0-100)"
    )


class GenerateScoreRequest(BaseModel):
    kirana_id: str = Field(..., description="Unique identifier for the kirana store")


class GenerateScoreResponse(BaseModel):
    kirana_id: str
    credit_score: int = Field(
        ..., ge=300, le=900, description="Overall credit score (300-900)"
    )
    score_breakdown: ScoreBreakdown
    risk_level: str = Field(..., description="Risk level: Low, Medium, or High")
    loan_eligible_amount: float = Field(
        ..., ge=0, description="Maximum loan amount eligible"
    )
    recommendations: List[str] = Field(..., description="List of recommendations")
    message: str = Field(default="Score generated")
