"""
Populate Global Dish Library - Synchronous Version
Inserts seed data into the database
"""
from app.core.database import SessionLocal, engine
from app.models.models import GlobalDish, GlobalIngredient, GlobalDishIngredient, Base
from seed_global_dishes import GLOBAL_INGREDIENTS, GLOBAL_DISHES


def clear_global_data():
    """Clear existing global dish data"""
    db = SessionLocal()
    try:
        # Delete in correct order due to foreign keys
        db.query(GlobalDishIngredient).delete()
        db.query(GlobalDish).delete()
        db.query(GlobalIngredient).delete()
        db.commit()
        print("✅ Cleared existing global dish data")
    finally:
        db.close()


def populate_ingredients():
    """Populate global ingredients"""
    db = SessionLocal()
    try:
        ingredient_map = {}
        
        for ing_data in GLOBAL_INGREDIENTS:
            ingredient = GlobalIngredient(
                name=ing_data["name"],
                category=ing_data["category"],
                standard_unit=ing_data["standard_unit"],
                alternate_names=ing_data.get("alternate_names", []),
                avg_cost_per_unit=ing_data.get("avg_cost_per_unit", 0.0),
                is_perishable=ing_data.get("is_perishable", False),
                avg_shelf_life_days=ing_data.get("avg_shelf_life_days")
            )
            db.add(ingredient)
            db.flush()  # Get the ID
            ingredient_map[ing_data["name"]] = ingredient.id
        
        db.commit()
        print(f"✅ Inserted {len(GLOBAL_INGREDIENTS)} global ingredients")
        return ingredient_map
    finally:
        db.close()


def populate_dishes(ingredient_map):
    """Populate global dishes and link ingredients"""
    db = SessionLocal()
    try:
        dishes_created = 0
        ingredients_linked = 0
        
        for dish_data in GLOBAL_DISHES:
            # Create dish
            dish = GlobalDish(
                name=dish_data["name"],
                description=dish_data.get("description"),
                category=dish_data["category"],
                cuisine=dish_data.get("cuisine"),
                default_price=dish_data["default_price"],
                image_url=dish_data.get("image_url"),
                is_vegetarian=dish_data.get("is_vegetarian", False),
                spice_level=dish_data.get("spice_level", 0),
                prep_time_minutes=dish_data.get("prep_time_minutes", 15),
                calories=dish_data.get("calories"),
                allergens=dish_data.get("allergens", []),
                tags=dish_data.get("tags", []),
                popularity_score=0.0,
                is_active=True
            )
            db.add(dish)
            db.flush()  # Get the dish ID
            dishes_created += 1
            
            # Link ingredients
            for ing_data in dish_data.get("ingredients", []):
                ing_name = ing_data["name"]
                if ing_name in ingredient_map:
                    dish_ingredient = GlobalDishIngredient(
                        dish_id=dish.id,
                        ingredient_id=ingredient_map[ing_name],
                        quantity_per_serving=ing_data["quantity"],
                        unit=ing_data["unit"],
                        is_optional=False
                    )
                    db.add(dish_ingredient)
                    ingredients_linked += 1
                else:
                    print(f"⚠️  Ingredient '{ing_name}' not found for dish '{dish_data['name']}'")
        
        db.commit()
        print(f"✅ Inserted {dishes_created} global dishes")
        print(f"✅ Linked {ingredients_linked} dish-ingredient mappings")
    finally:
        db.close()


def verify_data():
    """Verify the populated data"""
    db = SessionLocal()
    try:
        # Count dishes
        dishes = db.query(GlobalDish).all()
        
        # Count ingredients
        ingredients = db.query(GlobalIngredient).all()
        
        # Count mappings
        mappings = db.query(GlobalDishIngredient).all()
        
        print(f"\n📊 Database Summary:")
        print(f"   - {len(dishes)} Dishes")
        print(f"   - {len(ingredients)} Ingredients")
        print(f"   - {len(mappings)} Dish-Ingredient Mappings")
        
        # Show categories
        categories = {}
        for dish in dishes:
            categories[dish.category] = categories.get(dish.category, 0) + 1
        
        print(f"\n📂 Dishes by Category:")
        for cat, count in sorted(categories.items()):
            print(f"   - {cat}: {count} dishes")
        
        # Show sample dishes
        print(f"\n🍽️  Sample Dishes:")
        for dish in dishes[:5]:
            veg = "🌱" if dish.is_vegetarian else "🍖"
            print(f"   - {veg} {dish.name} ({dish.category}) - ₹{dish.default_price}")
    finally:
        db.close()


def create_tables():
    """Create tables if they don't exist"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created/verified")
    except Exception as e:
        print(f"⚠️  Table creation error: {e}")


def main():
    """Main execution"""
    try:
        print("🚀 Starting Global Dish Library Population...")
        print("=" * 60)
        
        # Step 0: Create tables
        print("\n📦 Step 0: Creating tables...")
        create_tables()
        
        # Step 1: Clear existing data
        print("\n📦 Step 1: Clearing existing data...")
        clear_global_data()
        
        # Step 2: Populate ingredients
        print("\n📦 Step 2: Populating ingredients...")
        ingredient_map = populate_ingredients()
        
        # Step 3: Populate dishes
        print("\n📦 Step 3: Populating dishes...")
        populate_dishes(ingredient_map)
        
        # Step 4: Verify
        print("\n📦 Step 4: Verifying data...")
        verify_data()
        
        print("\n" + "=" * 60)
        print("✅ Global Dish Library populated successfully!")
        print("\n🎉 You can now:")
        print("   1. Test the system: python test_global_simple.py")
        print("   2. Start the backend: python main.py")
        print("   3. Open Swagger UI: http://localhost:8000/docs")
        print("   4. Search for dishes: GET /api/v1/global-dishes/search?q=paneer")
        print("   5. Add dishes to restaurant menu from global library")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
