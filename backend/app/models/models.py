"""
Database Models - Multi-Tenant Restaurant Management System
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

# Enums
class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    STAFF = "staff"
    MANAGER = "manager"
    CHEF = "chef"
    ADMIN = "admin"

class TableStatus(str, enum.Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    MAINTENANCE = "maintenance"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    SERVED = "served"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CARD = "card"
    UPI = "upi"
    ONLINE = "online"

# Models
class Restaurant(Base):
    __tablename__ = "restaurants"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    location = Column(String(500))
    contact = Column(String(50))
    email = Column(String(255))
    logo_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    settings = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="restaurant")
    tables = relationship("Table", back_populates="restaurant")
    menu_items = relationship("MenuItem", back_populates="restaurant")
    ingredients = relationship("Ingredient", back_populates="restaurant")
    orders = relationship("Order", back_populates="restaurant")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.CUSTOMER)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    avatar_url = Column(String(500))
    preferences = Column(JSON, default={})
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="users")
    orders = relationship("Order", back_populates="customer")
    recommendations = relationship("AIRecommendation", back_populates="user")

class Table(Base):
    __tablename__ = "tables"
    
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False, index=True)
    table_number = Column(String(50), nullable=False)
    capacity = Column(Integer, nullable=False)
    status = Column(Enum(TableStatus), default=TableStatus.AVAILABLE)
    location_area = Column(String(100))
    qr_code = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="tables")
    orders = relationship("Order", back_populates="table")

class MenuItem(Base):
    __tablename__ = "menu_items"
    
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100), index=True)
    price = Column(Float, nullable=False)
    image_url = Column(String(500))
    is_available = Column(Boolean, default=True)
    is_vegetarian = Column(Boolean, default=False)
    spice_level = Column(Integer, default=0)  # 0-5
    prep_time_minutes = Column(Integer, default=15)
    calories = Column(Integer)
    allergens = Column(JSON, default=[])
    tags = Column(JSON, default=[])
    popularity_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="menu_items")
    dish_ingredients = relationship("DishIngredient", back_populates="menu_item")
    order_items = relationship("OrderItem", back_populates="menu_item")

class Ingredient(Base):
    __tablename__ = "ingredients"
    
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100))
    unit = Column(String(50))  # kg, liters, pieces, etc.
    quantity = Column(Float, default=0.0)
    min_quantity = Column(Float, default=0.0)
    cost_per_unit = Column(Float, default=0.0)
    supplier = Column(String(255))
    expiry_date = Column(DateTime(timezone=True))
    storage_location = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="ingredients")
    dish_ingredients = relationship("DishIngredient", back_populates="ingredient")
    inventory_logs = relationship("InventoryLog", back_populates="ingredient")

class DishIngredient(Base):
    __tablename__ = "dish_ingredients"
    
    id = Column(Integer, primary_key=True, index=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    required_quantity = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    menu_item = relationship("MenuItem", back_populates="dish_ingredients")
    ingredient = relationship("Ingredient", back_populates="dish_ingredients")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False, index=True)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    total_amount = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    final_amount = Column(Float, default=0.0)
    special_instructions = Column(Text)
    is_takeaway = Column(Boolean, default=False)
    estimated_time = Column(Integer)  # minutes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="orders")
    table = relationship("Table", back_populates="orders")
    customer = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")
    payment = relationship("Payment", back_populates="order", uselist=False)

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    special_instructions = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="order_items")
    menu_item = relationship("MenuItem", back_populates="order_items")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, unique=True)
    amount = Column(Float, nullable=False)
    method = Column(Enum(PaymentMethod), nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    transaction_id = Column(String(255), unique=True)
    gateway_response = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="payment")

class InventoryLog(Base):
    __tablename__ = "inventory_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    change_type = Column(String(50))  # added, used, wasted, expired
    quantity_change = Column(Float, nullable=False)
    reason = Column(Text)
    performed_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    ingredient = relationship("Ingredient", back_populates="inventory_logs")

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recommended_items = Column(JSON, default=[])
    context = Column(JSON)  # time of day, weather, previous orders, etc.
    confidence_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="recommendations")


# ============================================================================
# GLOBAL DISH LIBRARY - Shared across all restaurants
# ============================================================================

class GlobalDish(Base):
    """
    Global dish library - Contains standard dishes that can be added to any restaurant.
    Examples: Paneer Tikka, Chicken Biryani, Masala Dosa, etc.
    """
    __tablename__ = "global_dishes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    category = Column(String(100), index=True)  # Appetizer, Main Course, Dessert, etc.
    cuisine = Column(String(100), index=True)  # Indian, Chinese, Continental, etc.
    default_price = Column(Float, nullable=False)
    image_url = Column(String(500))
    is_vegetarian = Column(Boolean, default=False)
    spice_level = Column(Integer, default=0)  # 0-5
    prep_time_minutes = Column(Integer, default=15)
    calories = Column(Integer)
    allergens = Column(JSON, default=[])
    tags = Column(JSON, default=[])  # popular, trending, signature, etc.
    popularity_score = Column(Float, default=0.0)  # How many restaurants use this
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    dish_ingredients = relationship("GlobalDishIngredient", back_populates="dish")


class GlobalIngredient(Base):
    """
    Global ingredient library - Standard ingredients used across dishes.
    Examples: Paneer, Chicken, Rice, Tomato, etc.
    """
    __tablename__ = "global_ingredients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    category = Column(String(100), index=True)  # Dairy, Meat, Vegetable, Spice, etc.
    standard_unit = Column(String(50), nullable=False)  # kg, liters, pieces, grams, etc.
    alternate_names = Column(JSON, default=[])  # For fuzzy matching: ["Paneer", "Cottage Cheese"]
    avg_cost_per_unit = Column(Float, default=0.0)  # Average cost reference
    is_perishable = Column(Boolean, default=False)
    avg_shelf_life_days = Column(Integer)  # Average shelf life
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    dish_ingredients = relationship("GlobalDishIngredient", back_populates="ingredient")


class GlobalDishIngredient(Base):
    """
    Links global dishes to global ingredients with quantity per serving.
    Example: Paneer Tikka requires 200g Paneer, 50g Bell Pepper, 30ml Oil, etc.
    """
    __tablename__ = "global_dish_ingredients"
    
    id = Column(Integer, primary_key=True, index=True)
    dish_id = Column(Integer, ForeignKey("global_dishes.id"), nullable=False, index=True)
    ingredient_id = Column(Integer, ForeignKey("global_ingredients.id"), nullable=False, index=True)
    quantity_per_serving = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)  # Should match ingredient's standard_unit
    is_optional = Column(Boolean, default=False)
    notes = Column(Text)  # Special preparation notes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    dish = relationship("GlobalDish", back_populates="dish_ingredients")
    ingredient = relationship("GlobalIngredient", back_populates="dish_ingredients")


class DishAdditionLog(Base):
    """
    Tracks when restaurants add dishes from the global library.
    Useful for analytics and popularity tracking.
    """
    __tablename__ = "dish_addition_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False, index=True)
    global_dish_id = Column(Integer, ForeignKey("global_dishes.id"), nullable=False, index=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    added_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    price_adjustment = Column(Float, default=0.0)  # Difference from default price
    ingredients_mapped = Column(Integer, default=0)  # How many ingredients were auto-mapped
    ingredients_created = Column(Integer, default=0)  # How many new ingredients were created
    mapping_details = Column(JSON)  # Detailed mapping information
    created_at = Column(DateTime(timezone=True), server_default=func.now())
