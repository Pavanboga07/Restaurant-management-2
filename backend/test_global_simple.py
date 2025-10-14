"""
Simple Test Script for Global Dish Library System
Tests search, fuzzy matching, and dish details
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import SessionLocal
from app.models.models import (
    GlobalDish, GlobalIngredient, MenuItem, Ingredient,
    Restaurant, User, UserRole, GlobalDishIngredient
)
from sqlalchemy import func
from difflib import SequenceMatcher


def test_statistics():
    """Show database statistics"""
    print("\n" + "="*60)
    print("DATABASE STATISTICS")
    print("="*60)
    
    db = SessionLocal()
    try:
        # Count dishes
        dish_count = db.query(func.count(GlobalDish.id)).scalar()
        
        # Count ingredients
        ingredient_count = db.query(func.count(GlobalIngredient.id)).scalar()
        
        # Count by category
        categories = db.query(
            GlobalDish.category, 
            func.count(GlobalDish.id)
        ).group_by(GlobalDish.category).all()
        
        print(f"\n   📊 Total Dishes: {dish_count}")
        print(f"   📊 Total Ingredients: {ingredient_count}")
        print(f"\n   📂 Dishes by Category:")
        for cat, count in categories:
            print(f"      - {cat}: {count}")
        
        # Sample dishes
        popular = db.query(GlobalDish).order_by(
            GlobalDish.popularity_score.desc()
        ).limit(5).all()
        
        print(f"\n   🔥 Sample Dishes:")
        for dish in popular:
            veg = "🌱" if dish.is_vegetarian else "🍖"
            print(f"      - {veg} {dish.name} ({dish.category}) - ₹{dish.default_price}")
    finally:
        db.close()


def test_search():
    """Test search functionality"""
    print("\n" + "="*60)
    print("TEST 1: Search & Browse")
    print("="*60)
    
    db = SessionLocal()
    try:
        # Test 1: Search paneer dishes
        print("\n1. Searching for 'paneer' dishes...")
        dishes = db.query(GlobalDish).filter(
            GlobalDish.name.ilike('%paneer%')
        ).all()
        print(f"   ✅ Found {len(dishes)} dishes")
        for dish in dishes[:3]:
            print(f"      - {dish.name} ({dish.category}) - ₹{dish.default_price}")
        
        # Test 2: Search chicken dishes
        print("\n2. Searching for 'chicken' dishes...")
        dishes = db.query(GlobalDish).filter(
            GlobalDish.name.ilike('%chicken%')
        ).all()
        print(f"   ✅ Found {len(dishes)} dishes")
        for dish in dishes[:3]:
            print(f"      - {dish.name} ({dish.category}) - ₹{dish.default_price}")
        
        # Test 3: Category filter
        print("\n3. Searching Main Course dishes...")
        dishes = db.query(GlobalDish).filter(
            GlobalDish.category == 'Main Course'
        ).all()
        print(f"   ✅ Found {len(dishes)} main course dishes")
        
        # Test 4: Vegetarian filter
        print("\n4. Searching Vegetarian dishes...")
        dishes = db.query(GlobalDish).filter(
            GlobalDish.is_vegetarian == True
        ).limit(5).all()
        print(f"   ✅ Sample vegetarian dishes:")
        for dish in dishes:
            print(f"      - 🌱 {dish.name} ({dish.cuisine})")
    finally:
        db.close()


def test_dish_details():
    """Test getting dish with ingredients"""
    print("\n" + "="*60)
    print("TEST 2: Dish Details & Ingredients")
    print("="*60)
    
    db = SessionLocal()
    try:
        # Get Paneer Tikka
        dish = db.query(GlobalDish).filter(
            GlobalDish.name == 'Paneer Tikka'
        ).first()
        
        if not dish:
            print("   ⚠️  Paneer Tikka not found - run populate_global_dishes.py first")
            return
        
        print(f"\n   📋 {dish.name}")
        print(f"      Category: {dish.category}")
        print(f"      Cuisine: {dish.cuisine}")
        print(f"      Price: ₹{dish.default_price}")
        print(f"      Veg: {'Yes' if dish.is_vegetarian else 'No'}")
        print(f"      Spice Level: {dish.spice_level}/5")
        print(f"      Prep Time: {dish.prep_time_minutes} min")
        print(f"      Calories: {dish.calories}")
        
        # Get ingredients
        ingredients_data = db.query(GlobalDishIngredient, GlobalIngredient).join(
            GlobalIngredient, 
            GlobalDishIngredient.ingredient_id == GlobalIngredient.id
        ).filter(GlobalDishIngredient.dish_id == dish.id).all()
        
        print(f"\n   📦 Ingredients ({len(ingredients_data)}):")
        for dish_ing, global_ing in ingredients_data:
            optional = " (optional)" if dish_ing.is_optional else ""
            print(f"      - {global_ing.name}: {dish_ing.quantity_per_serving}{dish_ing.unit}{optional}")
    finally:
        db.close()


def test_ingredient_matching():
    """Test ingredient fuzzy matching"""
    print("\n" + "="*60)
    print("TEST 3: Ingredient Fuzzy Matching")
    print("="*60)
    
    db = SessionLocal()
    try:
        # Get a global ingredient
        global_paneer = db.query(GlobalIngredient).filter(
            GlobalIngredient.name == 'Paneer'
        ).first()
        
        if not global_paneer:
            print("   ⚠️  Paneer not found in global ingredients")
            return
        
        print(f"\n   Testing matches for: {global_paneer.name}")
        
        # Test variations
        test_names = [
            "Paneer",  # Exact
            "paneer",  # Case insensitive
            "Cottage Cheese",  # Alternate name
            "Fresh Paneer",  # Substring
            "Panner",  # Typo
            "Panir",  # Typo
        ]
        
        print(f"   Alternate names: {global_paneer.alternate_names}")
        print(f"\n   Testing similarity:")
        
        for test_name in test_names:
            # Calculate similarity
            similarity = SequenceMatcher(None, global_paneer.name.lower(), test_name.lower()).ratio()
            
            # Check alternate names
            in_alternates = (global_paneer.alternate_names and 
                           test_name in global_paneer.alternate_names)
            
            confidence = similarity * 100
            match_type = "Exact" if similarity == 1.0 else \
                        "Alternate" if in_alternates else \
                        "Fuzzy" if similarity >= 0.4 else \
                        "No Match"
            
            icon = "✅" if confidence >= 60 or in_alternates else "❌"
            print(f"      {icon} '{test_name}' → {confidence:.0f}% ({match_type})")
    finally:
        db.close()


def test_cuisines_and_categories():
    """Test cuisines and categories"""
    print("\n" + "="*60)
    print("TEST 4: Cuisines & Categories")
    print("="*60)
    
    db = SessionLocal()
    try:
        # Get categories
        categories = db.query(
            GlobalDish.category,
            func.count(GlobalDish.id)
        ).group_by(GlobalDish.category).all()
        
        print(f"\n   📂 Categories:")
        for cat, count in categories:
            print(f"      - {cat}: {count} dishes")
        
        # Get cuisines
        cuisines = db.query(
            GlobalDish.cuisine,
            func.count(GlobalDish.id)
        ).group_by(GlobalDish.cuisine).all()
        
        print(f"\n   🌍 Cuisines:")
        for cuisine, count in cuisines:
            print(f"      - {cuisine}: {count} dishes")
    finally:
        db.close()


def main():
    """Run all tests"""
    print("\n" + "="*70)
    print("  🧪 GLOBAL DISH LIBRARY SYSTEM - TEST SUITE")
    print("="*70)
    
    try:
        test_statistics()
        test_search()
        test_dish_details()
        test_ingredient_matching()
        test_cuisines_and_categories()
        
        print("\n" + "="*70)
        print("  ✅ ALL TESTS COMPLETED!")
        print("="*70)
        print("\n  📝 Next Steps:")
        print("     1. Start the backend: python main.py")
        print("     2. Open Swagger UI: http://localhost:8000/docs")
        print("     3. Test the APIs:")
        print("        - GET /api/v1/global-dishes/search?q=paneer")
        print("        - GET /api/v1/global-dishes/{id}")
        print("        - GET /api/v1/restaurants/{id}/preview-mapping/{dish_id}")
        print("        - POST /api/v1/restaurants/{id}/add-from-global/{dish_id}")
        print("\n  🎯 To populate data:")
        print("     python populate_global_dishes.py")
        print()
        
    except Exception as e:
        print(f"\n  ❌ TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
