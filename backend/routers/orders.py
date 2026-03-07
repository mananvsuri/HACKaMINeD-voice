from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from core.models import Order
from core.schemas import Order as OrderSchema
from typing import List

router = APIRouter(
    prefix="/api/orders",
    tags=["orders"]
)

@router.get("/", response_model=List[OrderSchema])
def get_orders(db: Session = Depends(get_db)):
    """Fetches all orders sorted by newest first."""
    # The schemas.py OrderItem schema requires menu_item to be populated, so we need to eager load it or lazy load will handle it if joined.
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return orders
