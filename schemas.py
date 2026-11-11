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

class StartupValidationReport(BaseModel):
    validation_score: int = Field(description="Overall feasibility score out of 100")
    score_justification: str = Field(description="Justification for the validation score")
    idea_summary: str = Field(description="Refined summary of the startup idea")
    market_analysis: MarketAnalysis = Field(description="Market analysis including TAM/SAM/SOM and trends")
    competitors: List[CompetitorInfo] = Field(description="List of top competitors with deep intelligence")
    recommended_mvp_features: List[str] = Field(description="List of recommended MVP features")