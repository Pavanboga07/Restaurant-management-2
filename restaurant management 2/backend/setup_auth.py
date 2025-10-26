"""
Create users table and add default users
"""
import sqlite3
from pathlib import Path
from passlib.context import CryptContext

# Database path
db_path = Path(__file__).parent / "restaurant.db"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def migrate_and_seed_users():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("🔐 Setting up authentication system...")
    
    try:
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR UNIQUE NOT NULL,
                email VARCHAR UNIQUE NOT NULL,
                hashed_password VARCHAR NOT NULL,
                full_name VARCHAR,
                role VARCHAR DEFAULT 'staff',
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME
            )
        """)
        print("✅ Created users table")
        
        # Check if users already exist
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        
        if user_count == 0:
            print("\n👤 Creating default users...")
            
            # Default users (roles must be UPPERCASE to match SQLAlchemy Enum)
            default_users = [
                {
                    "username": "admin",
                    "email": "admin@restaurant.com",
                    "password": "admin123",
                    "full_name": "System Administrator",
                    "role": "ADMIN"
                },
                {
                    "username": "manager",
                    "email": "manager@restaurant.com",
                    "password": "manager123",
                    "full_name": "Restaurant Manager",
                    "role": "MANAGER"
                },
                {
                    "username": "chef",
                    "email": "chef@restaurant.com",
                    "password": "chef123",
                    "full_name": "Head Chef",
                    "role": "CHEF"
                },
                {
                    "username": "staff",
                    "email": "staff@restaurant.com",
                    "password": "staff123",
                    "full_name": "Restaurant Staff",
                    "role": "STAFF"
                }
            ]
            
            for user in default_users:
                hashed_password = hash_password(user["password"])
                cursor.execute("""
                    INSERT INTO users (username, email, hashed_password, full_name, role)
                    VALUES (?, ?, ?, ?, ?)
                """, (user["username"], user["email"], hashed_password, user["full_name"], user["role"]))
                print(f"  ✅ Created user: {user['username']} ({user['role']}) - password: {user['password']}")
            
            conn.commit()
            print("\n✅ Default users created successfully!")
            print("\n📝 LOGIN CREDENTIALS:")
            print("=" * 50)
            for user in default_users:
                print(f"Role: {user['role'].upper()}")
                print(f"  Username: {user['username']}")
                print(f"  Password: {user['password']}")
                print()
        else:
            print(f"⚠️  Users table already has {user_count} users")
            print("Skipping user creation.")
            
            # Show existing users
            cursor.execute("SELECT id, username, email, full_name, role FROM users")
            users = cursor.fetchall()
            print("\n📋 Existing users:")
            for user in users:
                print(f"  {user[1]} ({user[4]}) - {user[3]}")
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_and_seed_users()
