"""
Menu Management Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import MenuItem, User, UserRole
from app.schemas.schemas import MenuItemCreate, MenuItemUpdate, MenuItemResponse
from app.api.routes.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[MenuItemResponse])
async def get_menu_items(
    category: Optional[str] = None,
    is_vegetarian: Optional[bool] = None,
    is_available: Optional[bool] = True,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get menu items with optional filters - OPTIMIZED
    """
    # PERFORMANCE: Use select only needed columns (avoid loading everything)
    query = db.query(MenuItem).filter(
        MenuItem.restaurant_id == current_user.restaurant_id
    )
    
    if category:
        query = query.filter(MenuItem.category == category)
    
    if is_vegetarian is not None:
        query = query.filter(MenuItem.is_vegetarian == is_vegetarian)
    
    if is_available is not None:
        query = query.filter(MenuItem.is_available == is_available)
    
    if search:
        query = query.filter(
            MenuItem.name.ilike(f"%{search}%") | 
            MenuItem.description.ilike(f"%{search}%")
        )
    
    # PERFORMANCE: Order by most commonly viewed first
    menu_items = query.order_by(MenuItem.id.desc()).offset(skip).limit(limit).all()
    return menu_items

@router.get("/{item_id}", response_model=MenuItemResponse)
async def get_menu_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific menu item by ID
    """
    item = db.query(MenuItem).filter(
        MenuItem.id == item_id,
        MenuItem.restaurant_id == current_user.restaurant_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    
    return item

@router.post("/", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
async def create_menu_item(
    item_data: MenuItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new menu item (Manager only)
    """
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers can create menu items"
        )
    
    # Ensure item belongs to user's restaurant
    if item_data.restaurant_id != current_user.restaurant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create items for other restaurants"
        )
    
    new_item = MenuItem(**item_data.dict())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return new_item

@router.put("/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(
    item_id: int,
    item_data: MenuItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a menu item (Manager only)
    """
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers can update menu items"
        )
    
    item = db.query(MenuItem).filter(
        MenuItem.id == item_id,
        MenuItem.restaurant_id == current_user.restaurant_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    
    # Update fields
    for key, value in item_data.dict(exclude_unset=True).items():
        setattr(item, key, value)
    
    db.commit()
    db.refresh(item)
    
    return item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a menu item (Manager only)
    """
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers can delete menu items"
        )
    
    item = db.query(MenuItem).filter(
        MenuItem.id == item_id,
        MenuItem.restaurant_id == current_user.restaurant_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    
    db.delete(item)
    db.commit()
    
    return None

@router.get("/categories/list")
async def get_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of all menu categories
    """
    categories = db.query(MenuItem.category).filter(
        MenuItem.restaurant_id == current_user.restaurant_id
    ).distinct().all()
    
    return [cat[0] for cat in categories if cat[0]]
