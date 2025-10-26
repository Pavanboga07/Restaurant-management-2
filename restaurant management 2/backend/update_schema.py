"""
Database schema migration script to add new columns to existing tables
"""
import sqlite3
from pathlib import Path

# Database path
db_path = Path(__file__).parent / "restaurant.db"

def migrate_database():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Starting database migration...")
    
    try:
        # Add new columns to menu_items table
        new_columns = [
            ("global_dish_id", "INTEGER"),
            ("prep_time", "INTEGER"),
            ("cook_time", "INTEGER"),
            ("diet", "VARCHAR"),
            ("course", "VARCHAR")
        ]
        
        for column_name, column_type in new_columns:
            try:
                cursor.execute(f"ALTER TABLE menu_items ADD COLUMN {column_name} {column_type}")
                print(f"✅ Added column: {column_name}")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e):
                    print(f"⚠️  Column {column_name} already exists, skipping...")
                else:
                    raise e
        
        # Create global_dishes table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS global_dishes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR NOT NULL,
                ingredients TEXT,
                diet VARCHAR,
                prep_time INTEGER,
                cook_time INTEGER,
                flavor_profile VARCHAR,
                course VARCHAR,
                state VARCHAR,
                region VARCHAR,
                description TEXT
            )
        """)
        print("✅ Created/verified global_dishes table")
        
        # Create ingredients table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ingredients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR NOT NULL UNIQUE,
                category VARCHAR,
                unit VARCHAR DEFAULT 'kg',
                current_stock FLOAT DEFAULT 0,
                minimum_stock FLOAT DEFAULT 5,
                expiry_date DATE,
                cost_per_unit FLOAT,
                supplier VARCHAR,
                last_restocked DATETIME
            )
        """)
        print("✅ Created/verified ingredients table")
        
        # Create ingredient_usage table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ingredient_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ingredient_id INTEGER NOT NULL,
                order_id INTEGER,
                quantity_used FLOAT NOT NULL,
                unit VARCHAR NOT NULL,
                used_by VARCHAR,
                used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
            )
        """)
        print("✅ Created/verified ingredient_usage table")
        
        # Create menu_item_ingredients association table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS menu_item_ingredients (
                menu_item_id INTEGER NOT NULL,
                ingredient_id INTEGER NOT NULL,
                quantity_required FLOAT NOT NULL,
                unit VARCHAR NOT NULL,
                PRIMARY KEY (menu_item_id, ingredient_id),
                FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
                FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
            )
        """)
        print("✅ Created/verified menu_item_ingredients table")
        
        conn.commit()
        print("\n✅ Database migration completed successfully!")
        
        # Show current schema
        cursor.execute("PRAGMA table_info(menu_items)")
        columns = cursor.fetchall()
        print("\n📊 Current menu_items schema:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
