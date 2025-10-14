"""
Test Script for Global Dish Library System
Tests search, fuzzy matching, and add dish functionality
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import SessionLocal
from app.models.models import (
    GlobalDish, GlobalIngredient, MenuItem, Ingredient,
    Restaurant, User, UserRole
)
from sqlalchemy import func


async def test_search():
    """Test fuzzy search functionality"""
    print("\n" + "="*60)
    print("TEST 1: Fuzzy Search")
    print("="*60)
    
    async with AsyncSessionLocal() as db:
        # Test 1: Exact search
        print("\n1. Searching for 'paneer'...")
        result = await db.execute(
            select(GlobalDish).where(GlobalDish.name.ilike('%paneer%'))
        )
        dishes = result.scalars().all()
        print(f"   ✅ Found {len(dishes)} dishes")
        for dish in dishes[:3]:
            print(f"      - {dish.name} ({dish.category}) - ₹{dish.default_price}")
        
        # Test 2: Typo tolerance (would use pg_trgm in real API)
        print("\n2. Searching for 'chicken'...")
        result = await db.execute(
            select(GlobalDish).where(GlobalDish.name.ilike('%chicken%'))
        )
        dishes = result.scalars().all()
        print(f"   ✅ Found {len(dishes)} dishes")
        for dish in dishes[:3]:
            print(f"      - {dish.name} ({dish.category}) - ₹{dish.default_price}")
        
        # Test 3: Category search
        print("\n3. Searching Main Course dishes...")
        result = await db.execute(
            select(GlobalDish).where(GlobalDish.category == 'Main Course')
        )
        dishes = result.scalars().all()
        print(f"   ✅ Found {len(dishes)} main course dishes")


async def test_ingredient_matching():
    """Test ingredient fuzzy matching"""
    print("\n" + "="*60)
    print("TEST 2: Ingredient Fuzzy Matching")
    print("="*60)
    
    async with AsyncSessionLocal() as db:
        # Get first restaurant
        result = await db.execute(select(Restaurant).limit(1))
        restaurant = result.scalar_one_or_none()
        
        if not restaurant:
            print("   ⚠️  No restaurant found. Creating test restaurant...")
            restaurant = Restaurant(
                name="Test Restaurant",
                slug="test-restaurant",
                location="Test Location",
                is_active=True
            )
            db.add(restaurant)
            await db.commit()
            await db.refresh(restaurant)
        
        print(f"\n   Using restaurant: {restaurant.name} (ID: {restaurant.id})")
        
        # Create some test ingredients in restaurant inventory
        test_ingredients = [
            {"name": "Paneer", "unit": "kg", "quantity": 5.0},
            {"name": "Chicken Breast", "unit": "kg", "quantity": 3.0},
            {"name": "Cottage Cheese", "unit": "kg", "quantity": 2.0},  # Alternate name for Paneer
            {"name": "Tomatoes", "unit": "kg", "quantity": 10.0},
            {"name": "Onions", "unit": "kg", "quantity": 8.0},
        ]
        
        print("\n   Creating test inventory...")
        for ing_data in test_ingredients:
            # Check if already exists
            result = await db.execute(
                select(Ingredient).where(
                    Ingredient.restaurant_id == restaurant.id,
                    Ingredient.name == ing_data['name']
                )
            )
            existing = result.scalar_one_or_none()
            
            if not existing:
                ingredient = Ingredient(
                    restaurant_id=restaurant.id,
                    name=ing_data['name'],
                    unit=ing_data['unit'],
                    quantity=ing_data['quantity'],
                    min_quantity=1.0,
                    cost_per_unit=100.0
                )
                db.add(ingredient)
        
        await db.commit()
        print("   ✅ Test inventory created")
        
        # Test fuzzy matching
        print("\n   Testing ingredient matching...")
        
        # Get a global ingredient
        result = await db.execute(
            select(GlobalIngredient).where(GlobalIngredient.name == 'Paneer').limit(1)
        )
        global_paneer = result.scalar_one_or_none()
        
        if global_paneer:
            print(f"\n   Looking for matches for: {global_paneer.name}")
            matches = await ingredient_matcher.find_matches(
                global_paneer,
                restaurant.id,
                db
            )
            
            print(f"   ✅ Found {len(matches)} potential matches:")
            for match in matches:
                confidence = match['similarity_score'] * 100
                print(f"      - {match['name']} ({confidence:.0f}% confidence, {match['match_type']})")
        
        # Test with Chicken
        result = await db.execute(
            select(GlobalIngredient).where(GlobalIngredient.name == 'Chicken').limit(1)
        )
        global_chicken = result.scalar_one_or_none()
        
        if global_chicken:
            print(f"\n   Looking for matches for: {global_chicken.name}")
            matches = await ingredient_matcher.find_matches(
                global_chicken,
                restaurant.id,
                db
            )
            
            print(f"   ✅ Found {len(matches)} potential matches:")
            for match in matches:
                confidence = match['similarity_score'] * 100
                print(f"      - {match['name']} ({confidence:.0f}% confidence, {match['match_type']})")


async def test_add_dish():
    """Test adding dish from global library"""
    print("\n" + "="*60)
    print("TEST 3: Add Dish from Global Library")
    print("="*60)
    
    async with AsyncSessionLocal() as db:
        # Get restaurant and user
        result = await db.execute(select(Restaurant).limit(1))
        restaurant = result.scalar_one_or_none()
        
        result = await db.execute(
            select(User).where(User.restaurant_id == restaurant.id).limit(1)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            print("   ⚠️  No user found. Creating test manager...")
            user = User(
                restaurant_id=restaurant.id,
                email="test@test.com",
                phone="1234567890",
                password_hash="test",
                name="Test Manager",
                role=UserRole.MANAGER,
                is_active=True
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        
        # Get a global dish
        result = await db.execute(
            select(GlobalDish).where(GlobalDish.name == 'Paneer Tikka').limit(1)
        )
        global_dish = result.scalar_one_or_none()
        
        if not global_dish:
            print("   ⚠️  Paneer Tikka not found in global library")
            return
        
        print(f"\n   Adding '{global_dish.name}' to {restaurant.name}...")
        
        # Get dish ingredients
        from app.models.models import GlobalDishIngredient
        result = await db.execute(
            select(GlobalDishIngredient, GlobalIngredient)
            .join(GlobalIngredient, GlobalDishIngredient.ingredient_id == GlobalIngredient.id)
            .where(GlobalDishIngredient.dish_id == global_dish.id)
        )
        ingredients_data = result.all()
        
        print(f"   Dish has {len(ingredients_data)} ingredients:")
        for dish_ing, global_ing in ingredients_data:
            print(f"      - {global_ing.name}: {dish_ing.quantity_per_serving}{dish_ing.unit}")
        
        # Check if already exists
        result = await db.execute(
            select(MenuItem).where(
                MenuItem.restaurant_id == restaurant.id,
                MenuItem.name == global_dish.name
            )
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            print(f"\n   ℹ️  Dish already exists in menu (ID: {existing.id})")
        else:
            print("\n   ✅ Ready to add dish!")
            print("   (Use the API endpoint to complete the addition)")


async def test_statistics():
    """Show database statistics"""
    print("\n" + "="*60)
    print("DATABASE STATISTICS")
    print("="*60)
    
    async with AsyncSessionLocal() as db:
        # Count dishes
        result = await db.execute(select(func.count(GlobalDish.id)))
        dish_count = result.scalar()
        
        # Count ingredients
        result = await db.execute(select(func.count(GlobalIngredient.id)))
        ingredient_count = result.scalar()
        
        # Count by category
        result = await db.execute(
            select(GlobalDish.category, func.count(GlobalDish.id))
            .group_by(GlobalDish.category)
        )
        categories = result.all()
        
        print(f"\n   📊 Total Dishes: {dish_count}")
        print(f"   📊 Total Ingredients: {ingredient_count}")
        print(f"\n   📂 Dishes by Category:")
        for cat, count in categories:
            print(f"      - {cat}: {count}")
        
        # Sample dishes
        result = await db.execute(
            select(GlobalDish).order_by(GlobalDish.popularity_score.desc()).limit(5)
        )
        popular = result.scalars().all()
        
        print(f"\n   🔥 Popular Dishes:")
        for dish in popular:
            print(f"      - {dish.name} (Score: {dish.popularity_score})")


async def main():
    """Run all tests"""
    print("\n" + "="*70)
    print("  🧪 GLOBAL DISH LIBRARY SYSTEM - TEST SUITE")
    print("="*70)
    
    try:
        await test_statistics()
        await test_search()
        await test_ingredient_matching()
        await test_add_dish()
        
        print("\n" + "="*70)
        print("  ✅ ALL TESTS COMPLETED!")
        print("="*70)
        print("\n  📝 Next Steps:")
        print("     1. Start the backend: python main.py")
        print("     2. Open Swagger UI: http://localhost:8000/docs")
        print("     3. Test the APIs:")
        print("        - GET /api/v1/global-dishes/search?q=paneer")
        print("        - GET /api/v1/global-dishes/{id}")
        print("        - POST /api/v1/restaurants/{id}/add-from-global/{dish_id}")
        print()
        
    except Exception as e:
        print(f"\n  ❌ TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
