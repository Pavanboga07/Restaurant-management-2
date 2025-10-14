"""
Force seed menu items - Add demo menu items to existing restaurant
"""
from app.core.database import SessionLocal
from app.models.models import MenuItem, Restaurant

db = SessionLocal()

# Get the first restaurant
restaurant = db.query(Restaurant).first()
if not restaurant:
    print("ERROR: No restaurant found! Run seed_db.py first.")
    exit(1)

print(f"Adding menu items to: {restaurant.name}")

# Check if menu items already exist
existing_count = db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant.id).count()
if existing_count > 0:
    print(f"Found {existing_count} existing menu items. Clearing them first...")
    db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant.id).delete()
    db.commit()

# Create menu items
menu_items = [
    MenuItem(
        restaurant_id=restaurant.id,
        name="Margherita Pizza",
        description="Classic Italian pizza with fresh mozzarella and basil",
        category="Pizza",
        price=12.99,
        is_vegetarian=True,
        spice_level=0,
        prep_time_minutes=20,
        calories=800,
        allergens=["gluten", "dairy"],
        tags=["italian", "classic"],
        popularity_score=4.5
    ),
    MenuItem(
        restaurant_id=restaurant.id,
        name="Chicken Alfredo Pasta",
        description="Creamy pasta with grilled chicken and parmesan",
        category="Pasta",
        price=15.99,
        is_vegetarian=False,
        spice_level=0,
        prep_time_minutes=25,
        calories=950,
        allergens=["gluten", "dairy"],
        tags=["italian", "creamy"],
        popularity_score=4.7
    ),
    MenuItem(
        restaurant_id=restaurant.id,
        name="Caesar Salad",
        description="Fresh romaine lettuce with caesar dressing and croutons",
        category="Salads",
        price=8.99,
        is_vegetarian=True,
        spice_level=0,
        prep_time_minutes=10,
        calories=350,
        allergens=["dairy", "eggs"],
        tags=["healthy", "fresh"],
        popularity_score=4.2
    ),
    MenuItem(
        restaurant_id=restaurant.id,
        name="Spicy Thai Curry",
        description="Authentic Thai red curry with vegetables and rice",
        category="Asian",
        price=13.99,
        is_vegetarian=True,
        spice_level=3,
        prep_time_minutes=30,
        calories=650,
        allergens=["nuts"],
        tags=["spicy", "thai", "vegan-option"],
        popularity_score=4.6
    ),
    MenuItem(
        restaurant_id=restaurant.id,
        name="Chocolate Lava Cake",
        description="Warm chocolate cake with molten center, served with vanilla ice cream",
        category="Desserts",
        price=6.99,
        is_vegetarian=True,
        spice_level=0,
        prep_time_minutes=15,
        calories=450,
        allergens=["gluten", "dairy", "eggs"],
        tags=["dessert", "chocolate"],
        popularity_score=4.8
    ),
]

# Add menu items
for item in menu_items:
    db.add(item)

db.commit()

# Verify
final_count = db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant.id).count()
print(f"SUCCESS: Added {final_count} menu items to {restaurant.name}")

# Show items
items = db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant.id).all()
print("\nMenu Items:")
for item in items:
    print(f"  - {item.name}: ${item.price} ({item.category})")

db.close()
