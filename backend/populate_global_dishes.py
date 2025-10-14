"""
Populate Global Dish Library
Inserts seed data into the database
"""
from app.core.database import SessionLocal
from app.models.models import GlobalDish, GlobalIngredient, GlobalDishIngredient
from seed_global_dishes import GLOBAL_INGREDIENTS, GLOBAL_DISHES


async def clear_global_data():
    """Clear existing global dish data"""
    async with AsyncSessionLocal() as db:
        # Delete in correct order due to foreign keys
        await db.execute("DELETE FROM global_dish_ingredients")
        await db.execute("DELETE FROM global_dishes")
        await db.execute("DELETE FROM global_ingredients")
        await db.commit()
        print("✅ Cleared existing global dish data")


async def populate_ingredients():
    """Populate global ingredients"""
    async with AsyncSessionLocal() as db:
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
            await db.flush()  # Get the ID
            ingredient_map[ing_data["name"]] = ingredient.id
        
        await db.commit()
        print(f"✅ Inserted {len(GLOBAL_INGREDIENTS)} global ingredients")
        return ingredient_map


async def populate_dishes(ingredient_map):
    """Populate global dishes and link ingredients"""
    async with AsyncSessionLocal() as db:
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
            await db.flush()  # Get the dish ID
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
        
        await db.commit()
        print(f"✅ Inserted {dishes_created} global dishes")
        print(f"✅ Linked {ingredients_linked} dish-ingredient mappings")


async def verify_data():
    """Verify the populated data"""
    async with AsyncSessionLocal() as db:
        # Count dishes
        result = await db.execute(select(GlobalDish))
        dishes = result.scalars().all()
        
        # Count ingredients
        result = await db.execute(select(GlobalIngredient))
        ingredients = result.scalars().all()
        
        # Count mappings
        result = await db.execute(select(GlobalDishIngredient))
        mappings = result.scalars().all()
        
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
            print(f"   - {dish.name} ({dish.category}) - ₹{dish.default_price}")


async def main():
    """Main execution"""
    try:
        print("🚀 Starting Global Dish Library Population...")
        print("=" * 60)
        
        # Step 1: Clear existing data
        print("\n📦 Step 1: Clearing existing data...")
        await clear_global_data()
        
        # Step 2: Populate ingredients
        print("\n📦 Step 2: Populating ingredients...")
        ingredient_map = await populate_ingredients()
        
        # Step 3: Populate dishes
        print("\n📦 Step 3: Populating dishes...")
        await populate_dishes(ingredient_map)
        
        # Step 4: Verify
        print("\n📦 Step 4: Verifying data...")
        await verify_data()
        
        print("\n" + "=" * 60)
        print("✅ Global Dish Library populated successfully!")
        print("\n🎉 You can now:")
        print("   1. Search for dishes: GET /api/v1/global-dishes/search?q=paneer")
        print("   2. Add dishes to restaurant menu from global library")
        print("   3. Auto-map ingredients to restaurant inventory")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
