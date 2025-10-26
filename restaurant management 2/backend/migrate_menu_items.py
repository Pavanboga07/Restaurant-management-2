"""
Migration script to add new columns to menu_items table
Run this to update existing database with new fields
"""
from sqlalchemy import create_engine, text
from app.database import DATABASE_URL

def migrate():
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        try:
            # Check if columns already exist
            result = conn.execute(text("PRAGMA table_info(menu_items)"))
            columns = [row[1] for row in result.fetchall()]
            
            print("Existing columns:", columns)
            
            # Add new columns if they don't exist
            new_columns = {
                'global_dish_id': 'INTEGER',
                'prep_time': 'INTEGER',
                'cook_time': 'INTEGER',
                'diet': 'VARCHAR',
                'course': 'VARCHAR'
            }
            
            for col_name, col_type in new_columns.items():
                if col_name not in columns:
                    print(f"Adding column: {col_name}")
                    conn.execute(text(f"ALTER TABLE menu_items ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
                else:
                    print(f"Column {col_name} already exists")
            
            print("\n✅ Migration completed successfully!")
            
        except Exception as e:
            print(f"❌ Error during migration: {e}")
            conn.rollback()

if __name__ == "__main__":
    migrate()
