"""
Fix user roles in database to use uppercase enum values
"""
import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / "restaurant.db"

def fix_roles():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("🔧 Fixing user roles to uppercase...")
    
    try:
        # Update all roles to uppercase
        cursor.execute("""
            UPDATE users 
            SET role = UPPER(role)
            WHERE role IN ('admin', 'manager', 'chef', 'staff')
        """)
        
        rows_updated = cursor.rowcount
        conn.commit()
        
        print(f"✅ Updated {rows_updated} user roles to uppercase")
        
        # Verify the changes
        cursor.execute("SELECT username, role FROM users")
        users = cursor.fetchall()
        print("\n📋 Updated users:")
        for username, role in users:
            print(f"  {username}: {role}")
            
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    fix_roles()
