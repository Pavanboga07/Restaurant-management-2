import sqlite3

db_path = r'c:\Users\91862\OneDrive\Desktop\vardhan\database\attendance.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Show all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("=" * 60)
print("DATABASE TABLES:")
print("=" * 60)
for table in tables:
    print(f"  - {table[0]}")

# Show students table
print("\n" + "=" * 60)
print("STUDENTS TABLE:")
print("=" * 60)
cursor.execute("PRAGMA table_info(students)")
columns = cursor.fetchall()
print("Columns:")
for col in columns:
    print(f"  {col[1]} ({col[2]})")

cursor.execute("SELECT * FROM students")
students = cursor.fetchall()
print(f"\nData ({len(students)} rows):")
if students:
    for student in students:
        print(f"  {student}")
else:
    print("  (empty)")

# Show attendance table
print("\n" + "=" * 60)
print("ATTENDANCE TABLE:")
print("=" * 60)
cursor.execute("PRAGMA table_info(attendance)")
columns = cursor.fetchall()
print("Columns:")
for col in columns:
    print(f"  {col[1]} ({col[2]})")

cursor.execute("SELECT COUNT(*) FROM attendance")
count = cursor.fetchone()[0]
print(f"\nTotal records: {count}")

if count > 0:
    cursor.execute("SELECT * FROM attendance LIMIT 5")
    records = cursor.fetchall()
    print(f"Sample data (first 5 rows):")
    for record in records:
        print(f"  {record}")

conn.close()
print("\n" + "=" * 60)
