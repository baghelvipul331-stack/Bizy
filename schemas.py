from pydantic import BaseModel, Field
from typing import List, Optional

class CompetitorInfo(BaseModel):
    name: str = Field(description="Name of the competitor")
    description: str = Field(description="Brief overview of what they do")
    valuation_or_funding: str = Field(description="Estimated valuation, funding raised, or revenue stage (e.g., '$50M Series B', 'Public ($2B cap)', or 'Bootstrapped / Pre-revenue')")
    market_position: str = Field(description="Market stance (e.g., 'Market Leader', 'Niche Challenger', 'Emerging Competitor')")
    strengths: List[str] = Field(description="Key strengths of this competitor")
    weaknesses: List[str] = Field(description="Gaps or weaknesses in their product")
    strategic_insight: str = Field(description="Valuable key takeaway or unfair advantage of this competitor")

class MarketAnalysis(BaseModel):
    tam_sam_som_overview: str = Field(description="Estimated market size, SAM, SOM, and trajectory")
    industry_trends: List[str] = Field(description="Key growth drivers")

class SWOTAnalysis(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    opportunities: List[str]
    threats: List[str]

class MarketShareData(BaseModel):
    name: str = Field(description="TAM, SAM, or SOM")
    value: float = Field(description="Value in Billion USD")

class ScoreBreakdownData(BaseModel):
    category: str
    score: int
class StartupValidationReport(BaseModel):
    feasibility_score: int
    score_breakdown_text: str
    refined_pitch_summary: str
    market_analysis_text: str
    market_share_breakdown: List[MarketShareData]
    score_metrics: List[ScoreBreakdownData]
    key_industry_trends: List[str]
    competitors: List[str]