"""
Seed script for global dishes database
This will populate the global_dishes table with sample Indian dishes
Replace with actual Kaggle dataset loading when available
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models import GlobalDish

# Create tables
Base.metadata.create_all(bind=engine)

# Sample dishes data (replace with actual dataset)
SAMPLE_DISHES = [
    {
        "name": "Paneer Tikka",
        "ingredients": "Paneer, Yogurt, Ginger-Garlic Paste, Red Chili Powder, Turmeric, Garam Masala, Lemon Juice, Bell Peppers, Onions",
        "diet": "Vegetarian",
        "prep_time": 20,
        "cook_time": 15,
        "flavor_profile": "Spicy",
        "course": "Appetizer",
        "state": "Punjab",
        "region": "North India",
        "description": "Grilled cottage cheese marinated in spiced yogurt"
    },
    {
        "name": "Butter Chicken",
        "ingredients": "Chicken, Butter, Cream, Tomatoes, Onions, Ginger-Garlic Paste, Kashmiri Red Chili, Garam Masala, Kasuri Methi",
        "diet": "Non-Vegetarian",
        "prep_time": 30,
        "cook_time": 40,
        "flavor_profile": "Rich and Creamy",
        "course": "Main Course",
        "state": "Punjab",
        "region": "North India",
        "description": "Tender chicken in rich tomato-butter gravy"
    },
    {
        "name": "Masala Dosa",
        "ingredients": "Rice, Urad Dal, Potatoes, Onions, Green Chilies, Curry Leaves, Mustard Seeds, Turmeric",
        "diet": "Vegetarian",
        "prep_time": 480,  # Including fermentation
        "cook_time": 20,
        "flavor_profile": "Savory",
        "course": "Main Course",
        "state": "Karnataka",
        "region": "South India",
        "description": "Crispy rice crepe filled with spiced potato filling"
    },
    {
        "name": "Biryani",
        "ingredients": "Basmati Rice, Chicken/Mutton, Yogurt, Onions, Tomatoes, Ginger-Garlic Paste, Biryani Masala, Saffron, Mint, Coriander",
        "diet": "Non-Vegetarian",
        "prep_time": 45,
        "cook_time": 60,
        "flavor_profile": "Aromatic and Spicy",
        "course": "Main Course",
        "state": "Hyderabad",
        "region": "South India",
        "description": "Fragrant rice layered with spiced meat"
    },
    {
        "name": "Palak Paneer",
        "ingredients": "Spinach, Paneer, Onions, Tomatoes, Ginger-Garlic Paste, Cream, Cumin, Coriander Powder, Garam Masala",
        "diet": "Vegetarian",
        "prep_time": 15,
        "cook_time": 25,
        "flavor_profile": "Mild and Creamy",
        "course": "Main Course",
        "state": "Punjab",
        "region": "North India",
        "description": "Cottage cheese in spinach gravy"
    },
    {
        "name": "Samosa",
        "ingredients": "All-Purpose Flour, Potatoes, Peas, Cumin Seeds, Coriander Seeds, Garam Masala, Green Chilies, Ginger",
        "diet": "Vegetarian",
        "prep_time": 30,
        "cook_time": 20,
        "flavor_profile": "Savory and Spicy",
        "course": "Appetizer",
        "state": "Uttar Pradesh",
        "region": "North India",
        "description": "Crispy pastry filled with spiced potato filling"
    },
    {
        "name": "Gulab Jamun",
        "ingredients": "Khoya/Mawa, All-Purpose Flour, Milk Powder, Sugar, Cardamom, Rose Water, Ghee",
        "diet": "Vegetarian",
        "prep_time": 20,
        "cook_time": 30,
        "flavor_profile": "Sweet",
        "course": "Dessert",
        "state": "West Bengal",
        "region": "East India",
        "description": "Deep-fried milk dumplings in sugar syrup"
    },
    {
        "name": "Tandoori Chicken",
        "ingredients": "Chicken, Yogurt, Tandoori Masala, Ginger-Garlic Paste, Lemon Juice, Kashmiri Red Chili, Garam Masala",
        "diet": "Non-Vegetarian",
        "prep_time": 240,  # Including marination
        "cook_time": 30,
        "flavor_profile": "Smoky and Spicy",
        "course": "Main Course",
        "state": "Punjab",
        "region": "North India",
        "description": "Marinated chicken roasted in tandoor"
    },
    {
        "name": "Chole Bhature",
        "ingredients": "Chickpeas, All-Purpose Flour, Yogurt, Onions, Tomatoes, Ginger-Garlic Paste, Chole Masala, Amchur",
        "diet": "Vegetarian",
        "prep_time": 30,
        "cook_time": 40,
        "flavor_profile": "Spicy and Tangy",
        "course": "Main Course",
        "state": "Punjab",
        "region": "North India",
        "description": "Spicy chickpeas with deep-fried bread"
    },
    {
        "name": "Pani Puri",
        "ingredients": "Semolina, Potatoes, Chickpeas, Tamarind, Mint, Coriander, Black Salt, Cumin Powder, Chili Powder",
        "diet": "Vegetarian",
        "prep_time": 30,
        "cook_time": 15,
        "flavor_profile": "Tangy and Spicy",
        "course": "Appetizer",
        "state": "Maharashtra",
        "region": "West India",
        "description": "Crispy hollow puris filled with tangy water"
    },
    {
        "name": "Rogan Josh",
        "ingredients": "Mutton, Yogurt, Onions, Ginger-Garlic Paste, Kashmiri Red Chili, Fennel Powder, Garam Masala, Bay Leaves",
        "diet": "Non-Vegetarian",
        "prep_time": 30,
        "cook_time": 90,
        "flavor_profile": "Rich and Aromatic",
        "course": "Main Course",
        "state": "Jammu and Kashmir",
        "region": "North India",
        "description": "Aromatic mutton curry in red gravy"
    },
    {
        "name": "Idli Sambar",
        "ingredients": "Rice, Urad Dal, Toor Dal, Tamarind, Drumsticks, Vegetables, Sambar Powder, Curry Leaves, Mustard Seeds",
        "diet": "Vegetarian",
        "prep_time": 480,  # Including fermentation
        "cook_time": 30,
        "flavor_profile": "Mild and Tangy",
        "course": "Breakfast",
        "state": "Tamil Nadu",
        "region": "South India",
        "description": "Steamed rice cakes with lentil stew"
    },
    {
        "name": "Dal Makhani",
        "ingredients": "Black Lentils, Kidney Beans, Butter, Cream, Tomatoes, Onions, Ginger-Garlic Paste, Kashmiri Red Chili, Garam Masala",
        "diet": "Vegetarian",
        "prep_time": 480,  # Soaking time
        "cook_time": 120,
        "flavor_profile": "Rich and Creamy",
        "course": "Main Course",
        "state": "Punjab",
        "region": "North India",
        "description": "Slow-cooked black lentils in butter and cream"
    },
    {
        "name": "Vada Pav",
        "ingredients": "Potatoes, Pav Bread, Chickpea Flour, Green Chilies, Garlic, Ginger, Turmeric, Mustard Seeds, Curry Leaves",
        "diet": "Vegetarian",
        "prep_time": 20,
        "cook_time": 20,
        "flavor_profile": "Spicy",
        "course": "Snack",
        "state": "Maharashtra",
        "region": "West India",
        "description": "Spiced potato fritter in bread bun"
    },
    {
        "name": "Rasmalai",
        "ingredients": "Paneer, Milk, Sugar, Saffron, Cardamom, Pistachios, Almonds",
        "diet": "Vegetarian",
        "prep_time": 30,
        "cook_time": 45,
        "flavor_profile": "Sweet and Creamy",
        "course": "Dessert",
        "state": "West Bengal",
        "region": "East India",
        "description": "Soft paneer dumplings in sweetened milk"
    }
]

def seed_dishes():
    db = SessionLocal()
    try:
        # Check if dishes already exist
        existing_count = db.query(GlobalDish).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} dishes. Skipping seed.")
            return
        
        # Add sample dishes
        for dish_data in SAMPLE_DISHES:
            dish = GlobalDish(**dish_data)
            db.add(dish)
        
        db.commit()
        print(f"Successfully seeded {len(SAMPLE_DISHES)} dishes!")
        
    except Exception as e:
        print(f"Error seeding dishes: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Seeding global dishes database...")
    seed_dishes()
    print("Done!")
