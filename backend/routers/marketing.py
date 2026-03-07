from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
import os

router = APIRouter(prefix="/api/marketing", tags=["Marketing"])

class PromoRequest(BaseModel):
    item_name: str
    discount_percentage: int
    target_audience: str = "general"

class PromoResponse(BaseModel):
    campaign_text: str

@router.post("/generate", response_model=PromoResponse)
def generate_campaign(request: PromoRequest):
    """Generates an AI promotional SMS/WhatsApp campaign for underperforming items."""
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    
    prompt = (
        f"You are an expert restaurant marketing manager for a popular North Indian restaurant called SpicePilot. "
        f"Write a short, highly engaging SMS/WhatsApp promotional message offering a {request.discount_percentage}% discount "
        f"on '{request.item_name}'. "
        f"Include emojis. Keep it punchy and under 250 characters. "
        f"Use simple English with a tiny touch of Hinglish flavor if appropriate (like 'Craving some chatpata flavor?'). "
        f"Do NOT include hashtags or placeholder brackets, just the raw message they can copy-paste."
    )
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=150
    )
    
    generated_text = response.choices[0].message.content.strip().strip('"').strip("'")
    
    return PromoResponse(campaign_text=generated_text)
