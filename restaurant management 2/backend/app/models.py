from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Table, Text, Date, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, date
from .database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    CHEF = "chef"
    STAFF = "staff"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.STAFF)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

order_items = Table(
    'order_items',
    Base.metadata,
    Column('order_id', Integer, ForeignKey('orders.id'), primary_key=True),
    Column('menu_item_id', Integer, ForeignKey('menu_items.id'), primary_key=True),
    Column('quantity', Integer, default=1)
)

# Many-to-many relationship between menu items and ingredients
menu_item_ingredients = Table(
    'menu_item_ingredients',
    Base.metadata,
    Column('menu_item_id', Integer, ForeignKey('menu_items.id'), primary_key=True),
    Column('ingredient_id', Integer, ForeignKey('ingredients.id'), primary_key=True),
    Column('quantity_required', Float, default=1.0),  # Amount needed per dish
    Column('unit', String, default='unit')  # kg, liter, piece, etc.
)

# Global dishes database (from Kaggle dataset)
class GlobalDish(Base):
    __tablename__ = "global_dishes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    ingredients = Column(Text, nullable=True)  # Comma-separated or JSON
    diet = Column(String, nullable=True)  # Vegetarian, Non-Vegetarian
    prep_time = Column(Integer, nullable=True)  # minutes
    cook_time = Column(Integer, nullable=True)  # minutes
    flavor_profile = Column(String, nullable=True)
    course = Column(String, nullable=True)  # Appetizer, Main Course, Dessert
    state = Column(String, nullable=True)  # Indian state
    region = Column(String, nullable=True)
    description = Column(Text, nullable=True)

class MenuItem(Base):
    __tablename__ = "menu_items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # New fields for ingredients integration
    global_dish_id = Column(Integer, ForeignKey('global_dishes.id'), nullable=True)
    prep_time = Column(Integer, nullable=True)
    cook_time = Column(Integer, nullable=True)
    diet = Column(String, nullable=True)
    course = Column(String, nullable=True)
    
    # Relationships
    global_dish = relationship("GlobalDish", backref="menu_items")
    ingredients = relationship("Ingredient", secondary=menu_item_ingredients, back_populates="menu_items")

class Ingredient(Base):
    __tablename__ = "ingredients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    category = Column(String, nullable=True)  # Vegetables, Spices, Dairy, etc.
    unit = Column(String, default='kg')  # kg, liter, piece, etc.
    current_stock = Column(Float, default=0.0)
    minimum_stock = Column(Float, default=5.0)  # Low stock threshold
    expiry_date = Column(Date, nullable=True)
    cost_per_unit = Column(Float, nullable=True)
    supplier = Column(String, nullable=True)
    last_restocked = Column(DateTime, nullable=True)
    
    # Relationships
    menu_items = relationship("MenuItem", secondary=menu_item_ingredients, back_populates="ingredients")
    usage_logs = relationship("IngredientUsage", back_populates="ingredient")

class IngredientUsage(Base):
    __tablename__ = "ingredient_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(Integer, ForeignKey('ingredients.id'), nullable=False)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=True)
    quantity_used = Column(Float, nullable=False)
    unit = Column(String, default='kg')
    used_by = Column(String, nullable=True)  # Staff/Chef name
    used_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(String, nullable=True)
    
    # Relationships
    ingredient = relationship("Ingredient", back_populates="usage_logs")
    order = relationship("Order", backref="ingredient_usage")

class RestaurantTable(Base):
    __tablename__ = "tables"
    
    id = Column(Integer, primary_key=True, index=True)
    table_number = Column(Integer, unique=True, nullable=False)
    status = Column(String, default="Available")
    capacity = Column(Integer, default=4)
    
    orders = relationship("Order", back_populates="table")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=False)
    status = Column(String, default="Pending")
    total_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Chef-related fields
    special_notes = Column(Text, nullable=True)  # Customer special requests
    estimated_completion_time = Column(Integer, nullable=True)  # Minutes
    started_at = Column(DateTime, nullable=True)  # When chef started cooking
    priority = Column(String, default="normal")  # normal, high, urgent
    
    table = relationship("RestaurantTable", back_populates="orders")
    items = relationship("MenuItem", secondary=order_items, backref="orders")

class Bill(Base):
    __tablename__ = "bills"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    paid = Column(Boolean, default=False)

class KitchenMessage(Base):
    __tablename__ = "kitchen_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    sender = Column(String, nullable=False)  # Chef name
    recipient = Column(String, nullable=False)  # server, manager, chef
    message = Column(Text, nullable=False)
    message_type = Column(String, default="info")  # info, warning, urgent
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    order = relationship("Order", backref="messages")

class ShiftHandover(Base):
    __tablename__ = "shift_handovers"
    
    id = Column(Integer, primary_key=True, index=True)
    shift_date = Column(Date, default=date.today)
    chef_name = Column(String, nullable=False)
    prep_completed = Column(Text, nullable=True)  # What was prepped
    low_stock_items = Column(Text, nullable=True)  # Ingredients running low
    pending_tasks = Column(Text, nullable=True)  # Tasks for next shift
    incidents = Column(Text, nullable=True)  # Any issues/incidents
    notes = Column(Text, nullable=True)  # General notes
    created_at = Column(DateTime, default=datetime.utcnow)

