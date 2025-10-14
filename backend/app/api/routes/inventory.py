"""
Inventory Management Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.models import Ingredient, User, UserRole, InventoryLog
from app.schemas.schemas import IngredientCreate, IngredientUpdate, IngredientResponse
from app.api.routes.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[IngredientResponse])
async def get_ingredients(
    category: Optional[str] = None,
    low_stock: bool = False,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get ingredients with optional filters
    """
    if current_user.role not in [UserRole.MANAGER, UserRole.CHEF, UserRole.STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    query = db.query(Ingredient).filter(
        Ingredient.restaurant_id == current_user.restaurant_id
    )
    
    if category:
        query = query.filter(Ingredient.category == category)
    
    if low_stock:
        query = query.filter(Ingredient.quantity <= Ingredient.min_quantity)
    
    ingredients = query.offset(skip).limit(limit).all()
    return ingredients

@router.get("/expiring", response_model=List[IngredientResponse])
async def get_expiring_ingredients(
    days: int = Query(7, ge=1, le=30),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get ingredients expiring within specified days
    """
    if current_user.role not in [UserRole.MANAGER, UserRole.CHEF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    cutoff_date = datetime.now() + timedelta(days=days)
    
    ingredients = db.query(Ingredient).filter(
        Ingredient.restaurant_id == current_user.restaurant_id,
        Ingredient.expiry_date <= cutoff_date,
        Ingredient.expiry_date > datetime.now()
    ).all()
    
    return ingredients

@router.post("/", response_model=IngredientResponse, status_code=status.HTTP_201_CREATED)
async def create_ingredient(
    ingredient_data: IngredientCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add new ingredient (Manager only)
    """
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers can add ingredients"
        )
    
    if ingredient_data.restaurant_id != current_user.restaurant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot add ingredients for other restaurants"
        )
    
    new_ingredient = Ingredient(**ingredient_data.dict())
    db.add(new_ingredient)
    db.commit()
    db.refresh(new_ingredient)
    
    # Log the addition
    log = InventoryLog(
        ingredient_id=new_ingredient.id,
        change_type="added",
        quantity_change=new_ingredient.quantity,
        reason="Initial stock",
        performed_by=current_user.id
    )
    db.add(log)
    db.commit()
    
    return new_ingredient

@router.put("/{ingredient_id}", response_model=IngredientResponse)
async def update_ingredient(
    ingredient_id: int,
    ingredient_data: IngredientUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update ingredient (Manager/Chef only)
    """
    if current_user.role not in [UserRole.MANAGER, UserRole.CHEF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    ingredient = db.query(Ingredient).filter(
        Ingredient.id == ingredient_id,
        Ingredient.restaurant_id == current_user.restaurant_id
    ).first()
    
    if not ingredient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingredient not found"
        )
    
    # Track quantity change
    old_quantity = ingredient.quantity
    
    # Update fields
    for key, value in ingredient_data.dict(exclude_unset=True).items():
        setattr(ingredient, key, value)
    
    db.commit()
    db.refresh(ingredient)
    
    # Log quantity change
    if ingredient_data.quantity is not None and ingredient_data.quantity != old_quantity:
        change = ingredient.quantity - old_quantity
        log = InventoryLog(
            ingredient_id=ingredient.id,
            change_type="updated",
            quantity_change=change,
            reason="Manual update",
            performed_by=current_user.id
        )
        db.add(log)
        db.commit()
    
    return ingredient

@router.delete("/{ingredient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ingredient(
    ingredient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete ingredient (Manager only)
    """
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers can delete ingredients"
        )
    
    ingredient = db.query(Ingredient).filter(
        Ingredient.id == ingredient_id,
        Ingredient.restaurant_id == current_user.restaurant_id
    ).first()
    
    if not ingredient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingredient not found"
        )
    
    db.delete(ingredient)
    db.commit()
    
    return None
