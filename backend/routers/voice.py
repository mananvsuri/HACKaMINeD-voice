from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import uuid
import json

from core.database import get_db
from core.models import MenuItem, Order, OrderItem
from core.schemas import ParsedVoiceOrder, Order as OrderSchema
from services.ai_service import transcribe_audio, parse_order_intent

router = APIRouter(
    prefix="/api/voice",
    tags=["voice"]
)

@router.post("/order", response_model=ParsedVoiceOrder)
async def process_voice_order(audio: UploadFile = File(...), current_cart: str = Form("[]"), db: Session = Depends(get_db)):
    """Handles audio upload, transcribes, and extracts structured items."""
    temp_id = str(uuid.uuid4())
    temp_path = f"/tmp/{temp_id}_{audio.filename}"
    
    with open(temp_path, "wb") as f:
        f.write(await audio.read())
        
    try:
        transcript = transcribe_audio(temp_path)
        
        menu_items = db.query(MenuItem).all()
        menu_context = "\n".join([f"ID: {item.id} - Name: {item.name} - Category: {item.category} - Price: ₹{item.selling_price}" for item in menu_items])
        
        json_str = parse_order_intent(transcript, menu_context, current_cart)
        
        if json_str.startswith("```json"):
            json_str = json_str.replace("```json", "").replace("```", "").strip()
            
        parsed_data = json.loads(json_str)
        
        # Calculate estimated_total out of items before returning
        estimated_total = 0.0
        if "items" in parsed_data:
            item_map = {item.id: item for item in menu_items}
            for item in parsed_data["items"]:
                menu_id = item.get("menu_item_id")
                qty = item.get("quantity", 1)
                if menu_id in item_map:
                    item["name"] = item_map[menu_id].name
                    estimated_total += item_map[menu_id].selling_price * qty
        parsed_data["estimated_total"] = estimated_total
        
        return ParsedVoiceOrder(**parsed_data)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.post("/conversation")
async def process_conversation(audio: UploadFile = File(...), chat_history: str = Form("[]"), current_cart: str = Form("[]"), db: Session = Depends(get_db)):
    """Handles an ongoing conversational turn with Llama 3 context memory."""
    from core.schemas import ConversationalVoiceOrder
    from fastapi import Form
    import json
    
    temp_id = str(uuid.uuid4())
    temp_path = f"/tmp/{temp_id}_{audio.filename}"
    
    with open(temp_path, "wb") as f:
        f.write(await audio.read())
        
    try:
        transcript = transcribe_audio(temp_path)
        history = json.loads(chat_history)
        
        menu_items = db.query(MenuItem).all()
        menu_context = "\n".join([f"ID: {item.id} - Name: {item.name} - Category: {item.category} - Price: ₹{item.selling_price}" for item in menu_items])
        
        from services.ai_service import process_conversation_turn
        json_str = process_conversation_turn(transcript, history, menu_context, current_cart)
        
        if json_str.startswith("```json"):
            json_str = json_str.replace("```json", "").replace("```", "").strip()
            
        parsed_data = json.loads(json_str)
        
        # Calculate estimated total
        estimated_total = 0.0
        if "items" in parsed_data:
            item_map = {item.id: item for item in menu_items}
            for item in parsed_data["items"]:
                menu_id = item.get("menu_item_id")
                qty = item.get("quantity", 1)
                if menu_id in item_map:
                    item["name"] = item_map[menu_id].name
                    estimated_total += item_map[menu_id].selling_price * qty
        parsed_data["estimated_total"] = estimated_total
        
        # We also want to return the user's transcript so the frontend can display it in the chat
        parsed_data["user_transcript"] = transcript
        
        return parsed_data
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
@router.post("/text-order", response_model=ParsedVoiceOrder)
async def process_text_order(payload: dict, db: Session = Depends(get_db)):
    """Fallback if user types the text instead of voice."""
    try:
        text = payload.get("text", "")
        current_cart = payload.get("current_cart", "[]")
        
        menu_items = db.query(MenuItem).all()
        menu_context = "\n".join([f"ID: {item.id} - Name: {item.name} - Category: {item.category} - Price: ₹{item.selling_price}" for item in menu_items])
        
        json_str = parse_order_intent(text, menu_context, current_cart)
        if json_str.startswith("```json"):
            json_str = json_str.replace("```json", "").replace("```", "").strip()
            
            json_str = json_str.replace("```json", "").replace("```", "").strip()
            
        parsed_data = json.loads(json_str)
        
        # Calculate estimated_total out of items before returning
        estimated_total = 0.0
        if "items" in parsed_data:
            item_map = {item.id: item for item in menu_items}
            for item in parsed_data["items"]:
                menu_id = item.get("menu_item_id")
                qty = item.get("quantity", 1)
                if menu_id in item_map:
                    item["name"] = item_map[menu_id].name
                    estimated_total += item_map[menu_id].selling_price * qty
        parsed_data["estimated_total"] = estimated_total
        
        return ParsedVoiceOrder(**parsed_data)
    except Exception as e:
        import traceback
        traceback.print_exc()
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/confirm", response_model=OrderSchema)
def confirm_order(payload: ParsedVoiceOrder, db: Session = Depends(get_db)):
    """Saves the final parsed order into the database."""
    try:
        total_amount = 0.0
        
        # Calculate total
        for item in payload.items:
            db_item = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id).first()
            if db_item:
                total_amount += (db_item.selling_price * item.quantity)
                
        # Create Order
        db_order = Order(total_amount=total_amount)
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        
        # Add Order Items
        for item in payload.items:
            db_item = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id).first()
            if db_item:
                order_item = OrderItem(
                    order_id=db_order.id,
                    menu_item_id=item.menu_item_id,
                    quantity=item.quantity,
                    modifiers=item.modifiers
                )
                db.add(order_item)
                
        db.commit()
        db.refresh(db_order)
        return db_order
    except Exception as e:
        import traceback
        traceback.print_exc()
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))
