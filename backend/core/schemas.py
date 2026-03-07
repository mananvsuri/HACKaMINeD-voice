from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class MenuItemBase(BaseModel):
    name: str
    category: str
    food_cost: float
    selling_price: float

class MenuItemCreate(MenuItemBase):
    pass

class MenuItem(MenuItemBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class MenuItemInsights(BaseModel):
    id: int
    name: str
    category: str
    food_cost: float
    selling_price: float
    contribution_margin: float      # Selling Price - Food Cost
    margin_percentage: float        # (Margin / Selling Price) * 100
    sales_velocity: float           # volume / days
    total_revenue: float
    profitability_category: str     # Star, Plowhorse, Puzzle, Dog
    action_recommendation: str      # Keep, Reprice, Promote, Drop
    current_stock: int              # Mock current inventory count
    days_to_deplete: float          # Predictive inventory
    recommended_restock_quantity: int
    
class OrderItemBase(BaseModel):
    menu_item_id: int
    quantity: int = 1
    modifiers: Optional[str] = None
    name: Optional[str] = None

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    menu_item: Optional[MenuItem] = None
    model_config = ConfigDict(from_attributes=True)

class OrderBase(BaseModel):
    total_amount: float

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class Order(OrderBase):
    id: int
    created_at: datetime
    items: List[OrderItem]
    model_config = ConfigDict(from_attributes=True)

# For AI Intent Return
class ParsedVoiceOrder(BaseModel):
    intent: str
    items: List[OrderItemBase]
    order_summary_text: str
    estimated_total: float = 0.0

class ConversationMessage(BaseModel):
    role: str
    content: str
    
class ConversationRequest(BaseModel):
    audio: bytes # We'll handle via form-data in route, so this might be skipped, but for typed input
    chat_history: List[ConversationMessage] = []
    
class ConversationalVoiceOrder(BaseModel):
    ai_spoken_response: str
    intent: str
    items: List[OrderItemBase]
    estimated_total: float = 0.0
