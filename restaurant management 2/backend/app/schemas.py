from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, date
from enum import Enum

# User/Auth Schemas
class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    CHEF = "chef"
    STAFF = "staff"

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.STAFF

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    username: Optional[str] = None

# Global Dish Schemas
class GlobalDishBase(BaseModel):
    name: str
    ingredients: Optional[str] = None
    diet: Optional[str] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    flavor_profile: Optional[str] = None
    course: Optional[str] = None
    state: Optional[str] = None
    region: Optional[str] = None
    description: Optional[str] = None

class GlobalDish(GlobalDishBase):
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Ingredient Schemas
class IngredientBase(BaseModel):
    name: str
    category: Optional[str] = None
    unit: str = 'kg'
    current_stock: float = 0.0
    minimum_stock: float = 5.0
    expiry_date: Optional[date] = None
    cost_per_unit: Optional[float] = None
    supplier: Optional[str] = None

class IngredientCreate(IngredientBase):
    pass

class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    current_stock: Optional[float] = None
    minimum_stock: Optional[float] = None
    expiry_date: Optional[date] = None
    cost_per_unit: Optional[float] = None
    supplier: Optional[str] = None

class Ingredient(IngredientBase):
    id: int
    last_restocked: Optional[datetime] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Ingredient Usage Schemas
class IngredientUsageCreate(BaseModel):
    ingredient_id: int
    order_id: Optional[int] = None
    quantity_used: float
    unit: str = 'kg'
    used_by: Optional[str] = None
    notes: Optional[str] = None

class IngredientUsage(IngredientUsageCreate):
    id: int
    used_at: datetime
    
    class Config:
        from_attributes = True

# Menu Item with Ingredients
class MenuItemIngredient(BaseModel):
    ingredient_id: int
    quantity_required: float = 1.0
    unit: str = 'unit'

class MenuItemBase(BaseModel):
    name: str
    category: str
    price: float
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_available: bool = True
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    diet: Optional[str] = None
    course: Optional[str] = None

class MenuItemCreate(MenuItemBase):
    global_dish_id: Optional[int] = None
    ingredients: Optional[List[MenuItemIngredient]] = []

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    diet: Optional[str] = None
    course: Optional[str] = None

class MenuItem(MenuItemBase):
    id: int
    created_at: datetime
    global_dish_id: Optional[int] = None
    ingredients: List[Ingredient] = []
    
    class Config:
        from_attributes = True

class TableBase(BaseModel):
    table_number: int
    status: str = "Available"
    capacity: int = 4

class TableCreate(TableBase):
    pass

class TableUpdate(BaseModel):
    status: Optional[str] = None
    capacity: Optional[int] = None

class Table(TableBase):
    id: int
    
    class Config:
        from_attributes = True

class OrderItemBase(BaseModel):
    menu_item_id: int
    quantity: int = 1

class OrderCreate(BaseModel):
    table_id: int
    items: List[OrderItemBase]
    special_notes: Optional[str] = None

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    special_notes: Optional[str] = None
    estimated_completion_time: Optional[int] = None
    started_at: Optional[datetime] = None
    priority: Optional[str] = None

class Order(BaseModel):
    id: int
    table_id: int
    status: str
    total_amount: float
    created_at: datetime
    completed_at: Optional[datetime] = None
    special_notes: Optional[str] = None
    estimated_completion_time: Optional[int] = None
    started_at: Optional[datetime] = None
    priority: Optional[str] = None
    items: List[MenuItem] = []
    
    class Config:
        from_attributes = True

class BillCreate(BaseModel):
    order_id: int

class Bill(BaseModel):
    id: int
    order_id: int
    total_amount: float
    created_at: datetime
    paid: bool
    
    class Config:
        from_attributes = True

# Kitchen Message Schemas
class KitchenMessageCreate(BaseModel):
    order_id: Optional[int] = None
    sender: str
    recipient: str
    message: str
    message_type: str = "info"

class KitchenMessage(KitchenMessageCreate):
    id: int
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Shift Handover Schemas
class ShiftHandoverCreate(BaseModel):
    chef_name: str
    prep_completed: Optional[str] = None
    low_stock_items: Optional[str] = None
    pending_tasks: Optional[str] = None
    incidents: Optional[str] = None
    notes: Optional[str] = None

class ShiftHandover(ShiftHandoverCreate):
    id: int
    shift_date: date
    created_at: datetime
    
    class Config:
        from_attributes = True

