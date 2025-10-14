"""
Quick Setup Script for Global Dish Library
Run this after starting your backend server
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import engine, Base
from populate_global_dishes import main as populate_main


async def setup_global_library():
    """
    Complete setup process for Global Dish Library
    """
    print("=" * 70)
    print("  GLOBAL DISH LIBRARY - SETUP WIZARD")
    print("=" * 70)
    print()
    
    # Step 1: Check database connection
    print("Step 1: Checking database connection...")
    try:
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        print("✅ Database connection successful!")
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        print("\n💡 Make sure PostgreSQL is running and DATABASE_URL is set correctly")
        return False
    
    # Step 2: Check for pg_trgm extension
    print("\nStep 2: Checking pg_trgm extension...")
    try:
        async with engine.begin() as conn:
            result = await conn.execute(
                "SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm')"
            )
            has_extension = result.scalar()
            if has_extension:
                print("✅ pg_trgm extension is enabled!")
            else:
                print("⚠️  pg_trgm extension not found. Attempting to enable...")
                await conn.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
                print("✅ pg_trgm extension enabled successfully!")
    except Exception as e:
        print(f"❌ Failed to enable pg_trgm: {str(e)}")
        print("\n💡 You may need superuser privileges. Run manually:")
        print("   psql -U postgres -d your_database -c 'CREATE EXTENSION pg_trgm;'")
        return False
    
    # Step 3: Run migrations
    print("\nStep 3: Database migrations...")
    print("💡 Please run: alembic upgrade head")
    print("   (This script assumes migrations are already run)")
    
    # Step 4: Populate data
    print("\nStep 4: Populating Global Dish Library...")
    try:
        await populate_main()
    except Exception as e:
        print(f"❌ Population failed: {str(e)}")
        return False
    
    # Step 5: Verification
    print("\nStep 5: Final verification...")
    from app.core.database import AsyncSessionLocal
    from app.models.models import GlobalDish, GlobalIngredient
    from sqlalchemy import select, func
    
    try:
        async with AsyncSessionLocal() as db:
            # Count dishes
            result = await db.execute(select(func.count(GlobalDish.id)))
            dish_count = result.scalar()
            
            # Count ingredients
            result = await db.execute(select(func.count(GlobalIngredient.id)))
            ingredient_count = result.scalar()
            
            if dish_count > 0 and ingredient_count > 0:
                print(f"✅ Setup complete!")
                print(f"   - {dish_count} dishes")
                print(f"   - {ingredient_count} ingredients")
                print()
                print("=" * 70)
                print("  🎉 READY TO USE!")
                print("=" * 70)
                print()
                print("📚 API Endpoints Available:")
                print("   - GET  /api/v1/global-dishes/search?q=paneer")
                print("   - GET  /api/v1/global-dishes/{dish_id}")
                print("   - GET  /api/v1/global-dishes/categories/list")
                print("   - GET  /api/v1/global-dishes/popular/trending")
                print()
                print("📖 Documentation:")
                print("   - Swagger UI: http://localhost:8000/docs")
                print("   - Full Guide: GLOBAL_DISH_LIBRARY_IMPLEMENTATION.md")
                print()
                return True
            else:
                print("⚠️  Setup incomplete. No data found.")
                return False
    except Exception as e:
        print(f"❌ Verification failed: {str(e)}")
        return False


if __name__ == "__main__":
    print()
    success = asyncio.run(setup_global_library())
    print()
    
    if not success:
        print("❌ Setup failed. Please check the errors above.")
        sys.exit(1)
    else:
        print("✅ All done! Happy coding! 🚀")
        sys.exit(0)
