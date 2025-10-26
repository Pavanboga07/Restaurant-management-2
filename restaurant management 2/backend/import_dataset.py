"""
Import Indian food dataset from CSV to global_dishes table
"""
import csv
import sqlite3
from pathlib import Path

# Paths
csv_path = Path(__file__).parent / "Ifood_new.csv"
db_path = Path(__file__).parent / "restaurant.db"

def clean_text(text):
    """Clean and normalize text fields"""
    if not text or text.strip() == '':
        return None
    return text.strip()

def parse_time(time_str):
    """Parse time string to integer minutes"""
    if not time_str or time_str.strip() == '':
        return None
    try:
        # Remove any non-digit characters except numbers
        time_str = time_str.strip().lower()
        if 'min' in time_str:
            return int(time_str.replace('min', '').strip())
        return int(time_str)
    except (ValueError, AttributeError):
        return None

def import_dishes():
    if not csv_path.exists():
        print(f"❌ CSV file not found at: {csv_path}")
        print(f"Please ensure Ifood_new.csv is in: {csv_path.parent}")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print(f"📂 Reading CSV from: {csv_path}")
    
    # Check if table already has data
    cursor.execute("SELECT COUNT(*) FROM global_dishes")
    existing_count = cursor.fetchone()[0]
    
    if existing_count > 0:
        response = input(f"⚠️  Table already has {existing_count} dishes. Clear and re-import? (y/n): ")
        if response.lower() == 'y':
            cursor.execute("DELETE FROM global_dishes")
            print("🗑️  Cleared existing data")
        else:
            print("❌ Import cancelled")
            conn.close()
            return
    
    try:
        imported = 0
        skipped = 0
        
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            
            print(f"📊 CSV Columns: {reader.fieldnames}")
            print("\n🔄 Importing dishes...")
            
            for row in reader:
                # Extract and clean data
                # Handle both 'name' and '\ufeffname' (BOM issue)
                name = clean_text(row.get('name') or row.get('\ufeffname'))
                if not name:
                    skipped += 1
                    continue
                
                ingredients = clean_text(row.get('ingredients'))
                diet = clean_text(row.get('diet'))
                prep_time = parse_time(row.get('prep_time', ''))
                cook_time = parse_time(row.get('cook_time', ''))
                flavor_profile = clean_text(row.get('flavor_profile'))
                course = clean_text(row.get('course'))
                state = clean_text(row.get('state'))
                region = clean_text(row.get('region'))
                
                # Create description from available data
                desc_parts = []
                if flavor_profile:
                    desc_parts.append(f"Flavor: {flavor_profile}")
                if region:
                    desc_parts.append(f"Region: {region}")
                description = '. '.join(desc_parts) if desc_parts else None
                
                # Insert into database
                cursor.execute("""
                    INSERT INTO global_dishes 
                    (name, ingredients, diet, prep_time, cook_time, flavor_profile, course, state, region, description)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (name, ingredients, diet, prep_time, cook_time, flavor_profile, course, state, region, description))
                
                imported += 1
                
                # Progress indicator
                if imported % 10 == 0:
                    print(f"  ✓ Imported {imported} dishes...")
        
        conn.commit()
        print(f"\n✅ Successfully imported {imported} dishes!")
        if skipped > 0:
            print(f"⚠️  Skipped {skipped} rows (missing name)")
        
        # Show sample
        cursor.execute("SELECT id, name, diet, course, state FROM global_dishes LIMIT 5")
        samples = cursor.fetchall()
        print("\n📋 Sample dishes:")
        for dish in samples:
            print(f"  {dish[0]}. {dish[1]} - {dish[2]} - {dish[3]} ({dish[4]})")
        
        # Show stats
        cursor.execute("SELECT COUNT(*), COUNT(DISTINCT state), COUNT(DISTINCT course) FROM global_dishes")
        total, states, courses = cursor.fetchone()
        print(f"\n📊 Database Stats:")
        print(f"  Total Dishes: {total}")
        print(f"  Unique States: {states}")
        print(f"  Unique Courses: {courses}")
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Import failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    import_dishes()
