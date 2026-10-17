from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
import asyncio
from agent import run_startup_validator, generate_pdf_report

app = FastAPI(
    title="Startup Validator Agent API",
    description="Single Agent Market Research & Validation System powered by Groq & DuckDuckGo",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PitchRequest(BaseModel):
    pitch: str

@app.post("/api/v1/validate", response_model=dict)
async def validate_pitch(request: PitchRequest):
    if len(request.pitch.strip()) < 10:
        raise HTTPException(status_code=400, detail="Pitch is too short. Please provide more details.")
    
    try:
        result = await asyncio.to_thread(run_startup_validator, request.pitch)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validator agent error: {str(e)}")

@app.post("/api/v1/download-pdf")
async def download_pdf(request: PitchRequest):
    """Generates and streams the PDF report directly."""
    try:
        result = await asyncio.to_thread(run_startup_validator, request.pitch)
        pdf_bytes = await asyncio.to_thread(generate_pdf_report, result)
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=Startup_Validation_Report.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)