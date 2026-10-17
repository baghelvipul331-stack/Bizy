import os
import io
import json
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_community.tools import DuckDuckGoSearchRun
from schemas import StartupValidationReport

# ReportLab imports for PDF generation
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

load_dotenv()

llm = ChatGroq(model_name="openai/gpt-oss-20b", temperature=0.2,max_tokens=4096)
search_tool = DuckDuckGoSearchRun()

def run_startup_validator(pitch: str) -> dict:
    """Runs single agent logic: searches web for market info using free DuckDuckGo and validates pitch."""
    search_query = f"market size competitors valuation funding market position trends for {pitch}"
    try:
        search_result = search_tool.invoke(search_query)
        formatted_research = f"Search Results:\n{search_result}"
    except Exception as e:
        formatted_research = f"Web search failed: {str(e)}"

    # Get JSON schema for strict compliance
    json_schema = StartupValidationReport.model_json_schema()
    
    prompt = f"""
    You are an expert VC Investor and Startup Analyst. Validate this startup idea based on ground truth web research.

    Startup Idea Pitch: "{pitch}"
    
    Live Web Research & Market Data:
    {formatted_research}
    
    Perform a deep competitor and market research evaluation.
    For each key competitor, you MUST analyze and derive:
    1. Valuation / Funding Stage (e.g., $100M Series B, Bootstrapped, Public)
    2. Market Position (e.g., Market Leader, Niche Player, Fast-growing Disruptor)
    3. Detailed Strengths and Weaknesses
    4. Strategic Insight (Unfair advantage or core strategy to watch out for)

    You MUST output valid JSON matching this exact schema:
    {json_schema}
    
    Return ONLY the raw JSON object, no markdown formatting or extra text.
    """
    
    response = llm.invoke(prompt)
    content = response.content.strip()
    
    # Clean markdown wrappers if any
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    content = content.strip()
    
    parsed_data = json.loads(content)
    report = StartupValidationReport(**parsed_data)
    return report.model_dump()

def generate_pdf_report(data: dict) -> bytes:
    """Generates a professional PDF report bytes from the validation dictionary."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle', parent=styles['Heading1'], fontSize=20, textColor=colors.HexColor('#4f46e5'), spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#64748b'), spaceAfter=15
    )
    heading_style = ParagraphStyle(
        'SectionHeading', parent=styles['Heading2'], fontSize=13, textColor=colors.HexColor('#1e293b'), spaceBefore=12, spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyDark', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#334155'), spaceAfter=4, leading=13
    )

    story.append(Paragraph("🚀 Startup Validation & Market Intelligence Report", title_style))
    story.append(Paragraph("Generated autonomously by AI Agent & Real-time Web Intelligence", subtitle_style))
    
    # Score Box
    score_text = f"<b>Feasibility Score: {data.get('validation_score', 0)} / 100</b>"
    justification = data.get('score_justification', '')
    score_table = Table([[Paragraph(score_text, body_style), Paragraph(justification, body_style)]], colWidths=[150, 390])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 8))

    # Idea Summary
    story.append(Paragraph("💡 Refined Pitch Summary", heading_style))
    story.append(Paragraph(data.get('idea_summary', ''), body_style))
    story.append(Spacer(1, 6))

    # Market Analysis
    story.append(Paragraph("📊 Market Analysis (TAM/SAM/SOM)", heading_style))
    market = data.get('market_analysis', {})
    story.append(Paragraph(market.get('tam_sam_som_overview', ''), body_style))
    
    story.append(Paragraph("<b>Key Industry Trends:</b>", body_style))
    for trend in market.get('industry_trends', []):
        story.append(Paragraph(f"• {trend}", body_style))
    story.append(Spacer(1, 6))

    # Detailed Competitors Section
    story.append(Paragraph("🥊 Deep Competitor Landscape & Valuations", heading_style))
    for comp in data.get('competitors', []):
        comp_header = f"<b>{comp.get('name')}</b> <font color='#6366f1'>[{comp.get('market_position', 'Competitor')}]</font>"
        val_info = f"<b>Valuation / Funding:</b> {comp.get('valuation_or_funding', 'N/A')}"
        desc = f"<b>Overview:</b> {comp.get('description', '')}"
        strengths = f"<font color='#059669'><b>Strengths:</b> {', '.join(comp.get('strengths', []))}</font>"
        weaknesses = f"<font color='#dc2626'><b>Weaknesses:</b> {', '.join(comp.get('weaknesses', []))}</font>"
        insight = f"<b>💡 Strategic Insight:</b> {comp.get('strategic_insight', '')}"

        comp_box = [[Paragraph(f"{comp_header}<br/>{val_info}<br/>{desc}<br/>{strengths}<br/>{weaknesses}<br/>{insight}", body_style)]]
        comp_table = Table(comp_box, colWidths=[540])
        comp_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
            ('PADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(comp_table)
        story.append(Spacer(1, 6))

    # Recommended MVP Features
    story.append(Paragraph("🛠️ Recommended MVP Features", heading_style))
    for feature in data.get('recommended_mvp_features', []):
        story.append(Paragraph(f"✅ {feature}", body_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()