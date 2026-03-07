from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.schemas import MenuItemInsights
from services.revenue_engine import get_menu_insights, get_combo_recommendations

router = APIRouter(
    prefix="/api/revenue",
    tags=["revenue"]
)

@router.get("/insights", response_model=List[MenuItemInsights])
def read_revenue_insights(db: Session = Depends(get_db)):
    """
    Returns item-level profitability analysis, margins, and volume.
    """
    return get_menu_insights(db)

@router.get("/combos")
def read_combo_recommendations(db: Session = Depends(get_db)):
    """
    Returns AI-suggested intelligent combos based on association logic.
    """
    return get_combo_recommendations(db)
