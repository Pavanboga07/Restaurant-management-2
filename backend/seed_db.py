"""
Seed database with sample data
"""
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.models import Restaurant, User, UserRole, MenuItem
from datetime import datetime

def seed_database():
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_restaurant = db.query(Restaurant).first()
        if existing_restaurant:
            print("⚠️  Database already has data. Skipping seed.")
            return
        
        # Create sample restaurant
        restaurant = Restaurant(
            name="Demo Restaurant",
            slug="demo-restaurant",
            location="123 Main St, New York, NY 10001",
            contact="+1-555-0123",
            email="demo@restaurant.com",
            is_active=True,
            settings={
                "currency": "USD",
                "tax_rate": 0.18,
                "timezone": "America/New_York"
            }
        )
        db.add(restaurant)
        db.flush()
        
        print(f"✅ Created restaurant: {restaurant.name} (ID: {restaurant.id})")
        
        # Create manager user
        manager = User(
            restaurant_id=restaurant.id,
            email="manager@demo.com",
            phone="+1-555-0100",
            password_hash=get_password_hash("manager123"),
            name="Demo Manager",
            role=UserRole.MANAGER,
            is_active=True,
            is_verified=True
        )
        db.add(manager)
        
        # Create staff user
        staff = User(
            restaurant_id=restaurant.id,
            email="staff@demo.com",
            phone="+1-555-0101",
            password_hash=get_password_hash("staff123"),
            name="Demo Staff",
            role=UserRole.STAFF,
            is_active=True,
            is_verified=True
        )
        db.add(staff)
        
        # Create chef user
        chef = User(
            restaurant_id=restaurant.id,
            email="chef@demo.com",
            phone="+1-555-0102",
            password_hash=get_password_hash("chef123"),
            name="Demo Chef",
            role=UserRole.CHEF,
            is_active=True,
            is_verified=True
        )
        db.add(chef)
        
        # Create customer user
        customer = User(
            restaurant_id=restaurant.id,
            email="customer@demo.com",
            phone="+1-555-0103",
            password_hash=get_password_hash("customer123"),
            name="Demo Customer",
            role=UserRole.CUSTOMER,
            is_active=True,
            is_verified=True
        )
        db.add(customer)
        
        print(f"✅ Created users:")
        print(f"   - Manager: manager@demo.com / manager123")
        print(f"   - Staff: staff@demo.com / staff123")
        print(f"   - Chef: chef@demo.com / chef123")
        print(f"   - Customer: customer@demo.com / customer123")
        
        # Create sample menu items
        menu_items = [
            MenuItem(
                restaurant_id=restaurant.id,
                name="Margherita Pizza",
                description="Classic pizza with tomato, mozzarella, and basil",
                category="Pizza",
                price=12.99,
                is_vegetarian=True,
                spice_level=0,
                prep_time_minutes=20,
                calories=800,
                tags=["popular", "italian"],
                is_available=True
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                name="Chicken Alfredo Pasta",
                description="Creamy pasta with grilled chicken",
                category="Pasta",
                price=15.99,
                is_vegetarian=False,
                spice_level=1,
                prep_time_minutes=25,
                calories=950,
                tags=["popular"],
                is_available=True
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                name="Caesar Salad",
                description="Fresh romaine lettuce with Caesar dressing",
                category="Salads",
                price=8.99,
                is_vegetarian=True,
                spice_level=0,
                prep_time_minutes=10,
                calories=350,
                tags=["healthy"],
                is_available=True
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                name="Spicy Thai Curry",
                description="Authentic Thai red curry with vegetables",
                category="Asian",
                price=13.99,
                is_vegetarian=True,
                spice_level=4,
                prep_time_minutes=30,
                calories=600,
                tags=["spicy", "asian"],
                is_available=True
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                name="Chocolate Lava Cake",
                description="Warm chocolate cake with molten center",
                category="Desserts",
                price=6.99,
                is_vegetarian=True,
                spice_level=0,
                prep_time_minutes=15,
                calories=450,
                tags=["dessert", "popular"],
                is_available=True
            ),
        ]
        
        for item in menu_items:
            db.add(item)
        
        print(f"✅ Created {len(menu_items)} sample menu items")
        
        db.commit()
        print("\n🎉 Database seeded successfully!")
        print(f"\n📝 You can now login with any of the demo accounts")
        print(f"🌐 Restaurant ID: {restaurant.id}")
        print(f"🔑 Restaurant Slug: {restaurant.slug}")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
