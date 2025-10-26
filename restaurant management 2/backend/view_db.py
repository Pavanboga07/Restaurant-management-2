import sqlite3
import json

def view_database():
    conn = sqlite3.connect('restaurant.db')
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print("\n" + "="*60)
    print("DATABASE TABLES")
    print("="*60)
    
    for table in tables:
        table_name = table[0]
        print(f"\n📋 Table: {table_name}")
        print("-" * 60)
        
        # Get table schema
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = cursor.fetchall()
        print(f"   Columns: {', '.join([col[1] for col in columns])}")
        
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
        count = cursor.fetchone()[0]
        print(f"   Rows: {count}")
        
        # Show first 5 rows
        if count > 0:
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 5;")
            rows = cursor.fetchall()
            print(f"\n   Sample Data (first {min(5, count)} rows):")
            col_names = [col[1] for col in columns]
            
            for i, row in enumerate(rows, 1):
                print(f"\n   Row {i}:")
                for col_name, value in zip(col_names, row):
                    print(f"      {col_name}: {value}")
        else:
            print("   (No data yet)")
    
    print("\n" + "="*60)
    conn.close()

if __name__ == "__main__":
    view_database()
