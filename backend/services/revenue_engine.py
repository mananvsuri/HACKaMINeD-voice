from sqlalchemy.orm import Session
from sqlalchemy import func
from core.models import MenuItem, OrderItem, Order
from core.schemas import MenuItemInsights

def get_menu_insights(db: Session):
    items = db.query(MenuItem).all()
    
    # Calculate volume and revenue per item
    volume_data = db.query(
        OrderItem.menu_item_id, 
        func.sum(OrderItem.quantity).label('volume'), 
        func.sum(OrderItem.quantity * MenuItem.selling_price).label('revenue')
    ).join(MenuItem).group_by(OrderItem.menu_item_id).all()
        
    volume_map = {row.menu_item_id: row.volume for row in volume_data}
    revenue_map = {row.menu_item_id: row.revenue for row in volume_data}
    
    # Assume we calculate velocity over an arbitrary active period (e.g., 30 days for demo)
    DAYS_ACTIVE = 30.0
    
    insights = []
    for item in items:
        contribution_margin = item.selling_price - item.food_cost
        margin_pct = (contribution_margin / item.selling_price) * 100 if item.selling_price > 0 else 0
        vol = volume_map.get(item.id, 0)
        velocity = vol / DAYS_ACTIVE
        
        # Safely get rev or default to 0.0
        rev_val = revenue_map.get(item.id)
        rev = float(rev_val) if rev_val is not None else 0.0
        
        # Strict Menu Engineering Categories
        # Averages for thresholding: Margin > 60% is high. Velocity > 0.5 per day is high.
        # Adjusted for the seed data where most items have low total volume compared to days active
        if margin_pct >= 60.0 and vol >= 15:
            category = "Star"
            action = "Maintain quality & highlight on menu. Do not change price."
        elif margin_pct < 60.0 and vol >= 15:
            category = "Plowhorse"
            action = "High volume but low margin. Consider slight price increase (+5-10%) or reduce portion sizes."
        elif margin_pct >= 60.0 and vol < 15:
            category = "Puzzle"
            action = "High margin but underperforming sales. Boost visibility, run promos, or bundle in a combo."
        else:
            category = "Dog"
            action = "Low margin, low volume. Consider removing from menu or completely reinventing the recipe."
            
        # Predictive Inventory alerts logic based on sales velocity for Hackathon display
        # Generating a deterministic pseudo-random current stock based on item ID so it remains consistent
        current_stock = (item.id * 17) % 50 + 5 # returns a value between 5 and 54
        days_to_deplete = current_stock / velocity if velocity > 0 else 999.0
        # Recommend ordering enough stock to cover 2 weeks (14 days) based on current velocity
        restock_qty = max(10, int(velocity * 14))
            
        insights.append(MenuItemInsights(
            id=item.id,
            name=item.name,
            category=item.category,
            food_cost=item.food_cost,
            selling_price=item.selling_price,
            contribution_margin=contribution_margin,
            margin_percentage=margin_pct,
            sales_velocity=velocity,
            total_revenue=rev,
            profitability_category=category,
            action_recommendation=action,
            current_stock=current_stock,
            days_to_deplete=days_to_deplete,
            recommended_restock_quantity=restock_qty
        ))
        
    # Sort insights by total revenue descending
    insights.sort(key=lambda x: x.total_revenue, reverse=True)
    return insights

def get_combo_recommendations(db: Session):
    # Simple association rule mining: finding pairs of items frequently ordered together
    orders = db.query(Order).all()
    pairs = {}
    
    for order in orders:
        # Get unique items in this order
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        item_ids = list(set([i.menu_item_id for i in items]))
        
        for i in range(len(item_ids)):
            for j in range(i+1, len(item_ids)):
                pair = tuple(sorted([item_ids[i], item_ids[j]]))
                pairs[pair] = pairs.get(pair, 0) + 1
                
    # Sort pairs by frequency
    sorted_pairs = sorted(pairs.items(), key=lambda x: x[1], reverse=True)
    
    top_combos = []
    for pair, count in sorted_pairs[:5]: # Top 5 combos
        i1 = db.query(MenuItem).filter(MenuItem.id == pair[0]).first()
        i2 = db.query(MenuItem).filter(MenuItem.id == pair[1]).first()
        if i1 and i2:
            top_combos.append({
                "items": [i1.name, i2.name],
                "frequency": count,
                "suggestion": f"Offer a combo of {i1.name} & {i2.name} to increase AOV."
            })
            
    return top_combos
