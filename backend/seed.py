from core.database import engine, SessionLocal, Base
from core.models import MenuItem, Order, OrderItem
import random
import datetime

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Seed Menu Items if empty
if db.query(MenuItem).count() == 0:
    items = [
        {"name": "Butter Chicken", "category": "Main Course", "food_cost": 120.0, "selling_price": 280.0},
        {"name": "Chicken Tikka Masala", "category": "Main Course", "food_cost": 110.0, "selling_price": 270.0},
        {"name": "Paneer Butter Masala", "category": "Main Course", "food_cost": 100.0, "selling_price": 250.0},
        {"name": "Mutton Biryani", "category": "Main Course", "food_cost": 150.0, "selling_price": 350.0},
        {"name": "Chicken Biryani", "category": "Main Course", "food_cost": 130.0, "selling_price": 300.0},
        {"name": "Dal Makhani", "category": "Main Course", "food_cost": 60.0, "selling_price": 180.0},
        {"name": "Palak Paneer", "category": "Main Course", "food_cost": 80.0, "selling_price": 220.0},
        {"name": "Chole Bhature", "category": "Main Course", "food_cost": 50.0, "selling_price": 150.0},
        
        {"name": "Tandoori Roti", "category": "Breads", "food_cost": 5.0, "selling_price": 15.0},
        {"name": "Garlic Naan", "category": "Breads", "food_cost": 15.0, "selling_price": 50.0},
        {"name": "Butter Naan", "category": "Breads", "food_cost": 12.0, "selling_price": 40.0},
        {"name": "Laccha Paratha", "category": "Breads", "food_cost": 10.0, "selling_price": 35.0},
        {"name": "Truffle Cheese Naan", "category": "Breads", "food_cost": 30.0, "selling_price": 150.0},
        {"name": "Pudina Paratha", "category": "Breads", "food_cost": 12.0, "selling_price": 40.0},

        {"name": "Masala Papad", "category": "Starters", "food_cost": 10.0, "selling_price": 30.0},
        {"name": "Roasted Papad", "category": "Starters", "food_cost": 5.0, "selling_price": 20.0},
        {"name": "Chicken Tikka", "category": "Starters", "food_cost": 90.0, "selling_price": 220.0},
        {"name": "Paneer Tikka", "category": "Starters", "food_cost": 80.0, "selling_price": 200.0},
        {"name": "Samosa", "category": "Starters", "food_cost": 15.0, "selling_price": 40.0},
        {"name": "Onion Bhaji", "category": "Starters", "food_cost": 20.0, "selling_price": 60.0},
        {"name": "Hara Bhara Kebab", "category": "Starters", "food_cost": 50.0, "selling_price": 150.0},

        {"name": "Mango Lassi", "category": "Beverages", "food_cost": 25.0, "selling_price": 90.0},
        {"name": "Sweet Lassi", "category": "Beverages", "food_cost": 20.0, "selling_price": 70.0},
        {"name": "Masala Chai", "category": "Beverages", "food_cost": 10.0, "selling_price": 30.0},
        {"name": "Fresh Lime Soda", "category": "Beverages", "food_cost": 15.0, "selling_price": 50.0},
        {"name": "Thums Up", "category": "Beverages", "food_cost": 20.0, "selling_price": 40.0},

        {"name": "Gulab Jamun", "category": "Desserts", "food_cost": 15.0, "selling_price": 60.0},
        {"name": "Rasmalai", "category": "Desserts", "food_cost": 25.0, "selling_price": 80.0},
        {"name": "Gajar Ka Halwa", "category": "Desserts", "food_cost": 30.0, "selling_price": 100.0},
        {"name": "Saffron Pista Kulfi", "category": "Desserts", "food_cost": 40.0, "selling_price": 180.0},
    ]
    
    for item_data in items:
        item = MenuItem(**item_data)
        db.add(item)
    db.commit()

    # Seed Orders to create history for association/margin logic
    menu_items = db.query(MenuItem).all()
    
    mains = [i for i in menu_items if i.category == "Main Course"]
    breads = [i for i in menu_items if i.category == "Breads"]
    starters = [i for i in menu_items if i.category == "Starters"]
    bevs = [i for i in menu_items if i.category == "Beverages"]
    desserts = [i for i in menu_items if i.category == "Desserts"]
    
    for i in range(250): # Generate 250 orders for better stats
        order = Order(created_at=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(0, 60)))
        db.add(order)
        db.commit() # commit to get ID
        
        total = 0
        
        # Every order gets 1 or 2 mains
        num_mains = random.randint(1, 2)
        chosen_mains = random.sample(mains, num_mains)
        for main in chosen_mains:
            qty = random.randint(1, 2)
            db.add(OrderItem(order_id=order.id, menu_item_id=main.id, quantity=qty))
            total += main.selling_price * qty
            
        # Every order gets 1 or 2 types of breads
        num_breads = random.randint(1, 2)
        chosen_breads = random.sample(breads, num_breads)
        for bread in chosen_breads:
            qty = random.randint(2, 5)
            db.add(OrderItem(order_id=order.id, menu_item_id=bread.id, quantity=qty))
            total += bread.selling_price * qty
            
        # 60% chance for a starter
        if random.random() < 0.6:
            starter = random.choice(starters)
            qty = random.randint(1, 2)
            db.add(OrderItem(order_id=order.id, menu_item_id=starter.id, quantity=qty))
            total += starter.selling_price * qty
            
        # 40% chance for a beverage
        if random.random() < 0.4:
            bev = random.choice(bevs)
            qty = random.randint(1, 3)
            db.add(OrderItem(order_id=order.id, menu_item_id=bev.id, quantity=qty))
            total += bev.selling_price * qty
            
        # 30% chance for a dessert
        if random.random() < 0.3:
            dessert = random.choice(desserts)
            qty = random.randint(1, 2)
            db.add(OrderItem(order_id=order.id, menu_item_id=dessert.id, quantity=qty))
            total += dessert.selling_price * qty
            
        order.total_amount = total
        db.commit()

db.close()
print("Database seeded with mock items and transactions!")
