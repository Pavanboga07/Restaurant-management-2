"""
Pydantic Schemas for Request/Response Validation
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.models import UserRole, TableStatus, OrderStatus, PaymentStatus, PaymentMethod

# Authentication Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    restaurant_id: int

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    restaurant_id: int
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None
    restaurant_id: Optional[int] = None
    role: Optional[str] = None

# Restaurant Schemas
class RestaurantBase(BaseModel):
    name: str
    slug: str
    location: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[EmailStr] = None

class RestaurantCreate(RestaurantBase):
    logo_url: Optional[str] = None
    settings: Optional[Dict[str, Any]] = {}

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[EmailStr] = None
    logo_url: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class RestaurantResponse(RestaurantBase):
    id: int
    logo_url: Optional[str]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Table Schemas
class TableBase(BaseModel):
    table_number: str
    capacity: int = Field(..., ge=1, le=20)
    location_area: Optional[str] = None

class TableCreate(TableBase):
    restaurant_id: int

class TableUpdate(BaseModel):
    table_number: Optional[str] = None
    capacity: Optional[int] = Field(None, ge=1, le=20)
    status: Optional[TableStatus] = None
    location_area: Optional[str] = None

class TableResponse(TableBase):
    id: int
    restaurant_id: int
    status: TableStatus
    qr_code: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Menu Item Schemas
class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    price: float = Field(..., gt=0)
    is_vegetarian: bool = False
    spice_level: int = Field(0, ge=0, le=5)
    prep_time_minutes: int = Field(15, ge=1)

class MenuItemCreate(MenuItemBase):
    restaurant_id: int
    image_url: Optional[str] = None
    calories: Optional[int] = None
    allergens: Optional[List[str]] = []
    tags: Optional[List[str]] = []

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    is_vegetarian: Optional[bool] = None
    spice_level: Optional[int] = Field(None, ge=0, le=5)
    prep_time_minutes: Optional[int] = Field(None, ge=1)
    calories: Optional[int] = None
    allergens: Optional[List[str]] = None
    tags: Optional[List[str]] = None

class MenuItemResponse(MenuItemBase):
    id: int
    restaurant_id: int
    image_url: Optional[str]
    is_available: bool
    calories: Optional[int]
    allergens: List[str]
    tags: List[str]
    popularity_score: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# Ingredient Schemas
class IngredientBase(BaseModel):
    name: str
    category: Optional[str] = None
    unit: str
    quantity: float = Field(..., ge=0)
    min_quantity: float = Field(0, ge=0)
    cost_per_unit: float = Field(0, ge=0)

class IngredientCreate(IngredientBase):
    restaurant_id: int
    supplier: Optional[str] = None
    expiry_date: Optional[datetime] = None
    storage_location: Optional[str] = None

class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    quantity: Optional[float] = Field(None, ge=0)
    min_quantity: Optional[float] = Field(None, ge=0)
    cost_per_unit: Optional[float] = Field(None, ge=0)
    supplier: Optional[str] = None
    expiry_date: Optional[datetime] = None
    storage_location: Optional[str] = None

class IngredientResponse(IngredientBase):
    id: int
    restaurant_id: int
    supplier: Optional[str]
    expiry_date: Optional[datetime]
    storage_location: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Order Schemas
class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int = Field(..., ge=1)
    special_instructions: Optional[str] = None

class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    price: float
    subtotal: float
    special_instructions: Optional[str]
    
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    restaurant_id: int
    table_id: Optional[int] = None
    items: List[OrderItemCreate]
    special_instructions: Optional[str] = None
    is_takeaway: bool = False

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    special_instructions: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    restaurant_id: int
    table_id: Optional[int]
    customer_id: int
    order_number: str
    status: OrderStatus
    total_amount: float
    discount_amount: float
    tax_amount: float
    final_amount: float
    special_instructions: Optional[str]
    is_takeaway: bool
    estimated_time: Optional[int]
    created_at: datetime
    order_items: List[OrderItemResponse]
    
    class Config:
        from_attributes = True

# Payment Schemas
class PaymentCreate(BaseModel):
    order_id: int
    amount: float = Field(..., gt=0)
    method: PaymentMethod

class PaymentResponse(BaseModel):
    id: int
    order_id: int
    amount: float
    method: PaymentMethod
    status: PaymentStatus
    transaction_id: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Inventory Log Schemas
class InventoryLogCreate(BaseModel):
    ingredient_id: int
    change_type: str
    quantity_change: float
    reason: Optional[str] = None

class InventoryLogResponse(BaseModel):
    id: int
    ingredient_id: int
    change_type: str
    quantity_change: float
    reason: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# AI Recommendation Schemas
class RecommendationRequest(BaseModel):
    user_id: int
    context: Optional[Dict[str, Any]] = {}

class RecommendationResponse(BaseModel):
    id: int
    user_id: int
    recommended_items: List[int]
    confidence_score: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# Pagination Schema
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    per_page: int
    pages: int


# ============================================================================
# GLOBAL DISH LIBRARY SCHEMAS
# ============================================================================

# Global Ingredient Schemas
class GlobalIngredientBase(BaseModel):
    name: str
    category: Optional[str] = None
    standard_unit: str
    alternate_names: List[str] = []
    avg_cost_per_unit: float = 0.0
    is_perishable: bool = False
    avg_shelf_life_days: Optional[int] = None

class GlobalIngredientCreate(GlobalIngredientBase):
    pass

class GlobalIngredientResponse(GlobalIngredientBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Global Dish Ingredient Mapping
class DishIngredientDetail(BaseModel):
    ingredient_id: int
    ingredient_name: str
    quantity_per_serving: float
    unit: str
    is_optional: bool = False
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True


# Global Dish Schemas
class GlobalDishBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    cuisine: Optional[str] = None
    default_price: float
    image_url: Optional[str] = None
    is_vegetarian: bool = False
    spice_level: int = 0
    prep_time_minutes: int = 15
    calories: Optional[int] = None
    allergens: List[str] = []
    tags: List[str] = []

class GlobalDishCreate(GlobalDishBase):
    ingredient_ids: List[Dict[str, Any]]  # [{"ingredient_id": 1, "quantity": 200, "unit": "grams"}]

class GlobalDishResponse(GlobalDishBase):
    id: int
    popularity_score: float
    is_active: bool
    created_at: datetime
    ingredients: List[DishIngredientDetail] = []
    
    class Config:
        from_attributes = True


# Search Schemas
class GlobalDishSearchParams(BaseModel):
    q: str = Field(..., min_length=2, description="Search query (min 2 characters)")
    category: Optional[str] = None
    cuisine: Optional[str] = None
    is_vegetarian: Optional[bool] = None
    max_price: Optional[float] = None
    limit: int = Field(20, ge=1, le=100)
    offset: int = Field(0, ge=0)

class GlobalDishSearchResult(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: str
    cuisine: Optional[str]
    default_price: float
    image_url: Optional[str]
    is_vegetarian: bool
    spice_level: int
    prep_time_minutes: int
    tags: List[str]
    similarity_score: float  # For fuzzy search ranking
    ingredients_count: int
    
    class Config:
        from_attributes = True


# Add Dish from Global Library
class AddDishFromGlobalRequest(BaseModel):
    price_override: Optional[float] = None  # Custom price, else use default
    ingredient_mappings: Optional[Dict[int, int]] = None  # {global_ing_id: restaurant_ing_id}
    auto_create_missing: bool = True  # Auto-create missing ingredients

class IngredientMappingDetail(BaseModel):
    global_ingredient_id: int
    global_ingredient_name: str
    quantity_needed: float
    unit: str
    matched_restaurant_ingredient_id: Optional[int] = None
    matched_restaurant_ingredient_name: Optional[str] = None
    match_confidence: float  # 1.0 = exact, 0.0-0.9 = fuzzy
    needs_creation: bool = False

class AddDishFromGlobalResponse(BaseModel):
    menu_item_id: int
    dish_name: str
    final_price: float
    ingredients_mapped: int
    ingredients_created: int
    mapping_details: List[IngredientMappingDetail]
    warnings: List[str] = []
    
    class Config:
        from_attributes = True


# Ingredient Auto-Mapping Schemas
class IngredientMatchSuggestion(BaseModel):
    restaurant_ingredient_id: int
    restaurant_ingredient_name: str
    similarity_score: float  # 0.0 to 1.0
    current_stock: float
    unit: str

class IngredientMappingPreview(BaseModel):
    global_dish_id: int
    global_dish_name: str
    ingredients: List[Dict[str, Any]]  # Details of each ingredient with suggestions
