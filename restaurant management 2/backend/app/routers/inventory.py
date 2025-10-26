from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/inventory", tags=["inventory"])

# ===== INGREDIENT CRUD =====

@router.get("/ingredients", response_model=List[schemas.Ingredient])
def get_all_ingredients(
    skip: int = 0,
    limit: int = 100,
    low_stock_only: bool = False,
    db: Session = Depends(get_db)
):
    """
    Get all ingredients with optional low stock filter
    """
    query = db.query(models.Ingredient)
    
    if low_stock_only:
        query = query.filter(models.Ingredient.current_stock <= models.Ingredient.minimum_stock)
    
    ingredients = query.offset(skip).limit(limit).all()
    return ingredients

@router.get("/ingredients/{ingredient_id}", response_model=schemas.Ingredient)
def get_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    """
    Get specific ingredient details
    """
    ingredient = db.query(models.Ingredient).filter(models.Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ingredient

@router.post("/ingredients", response_model=schemas.Ingredient)
def create_ingredient(ingredient: schemas.IngredientCreate, db: Session = Depends(get_db)):
    """
    Add new ingredient to inventory
    """
    # Check if ingredient already exists
    existing = db.query(models.Ingredient).filter(models.Ingredient.name == ingredient.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ingredient already exists")
    
    db_ingredient = models.Ingredient(**ingredient.dict())
    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient

@router.put("/ingredients/{ingredient_id}", response_model=schemas.Ingredient)
def update_ingredient(
    ingredient_id: int,
    ingredient: schemas.IngredientUpdate,
    db: Session = Depends(get_db)
):
    """
    Update ingredient details or stock
    """
    db_ingredient = db.query(models.Ingredient).filter(models.Ingredient.id == ingredient_id).first()
    if not db_ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    update_data = ingredient.dict(exclude_unset=True)
    
    # If stock is being updated, record restock time
    if 'current_stock' in update_data and update_data['current_stock'] > db_ingredient.current_stock:
        db_ingredient.last_restocked = datetime.utcnow()
    
    for key, value in update_data.items():
        setattr(db_ingredient, key, value)
    
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient

@router.delete("/ingredients/{ingredient_id}")
def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    """
    Delete ingredient from inventory
    """
    db_ingredient = db.query(models.Ingredient).filter(models.Ingredient.id == ingredient_id).first()
    if not db_ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    db.delete(db_ingredient)
    db.commit()
    return {"message": "Ingredient deleted successfully"}

# ===== INGREDIENT USAGE TRACKING =====

@router.post("/usage", response_model=schemas.IngredientUsage)
def record_ingredient_usage(usage: schemas.IngredientUsageCreate, db: Session = Depends(get_db)):
    """
    Record ingredient usage (when dish is prepared)
    Automatically deducts from stock
    """
    ingredient = db.query(models.Ingredient).filter(models.Ingredient.id == usage.ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    # Check if enough stock
    if ingredient.current_stock < usage.quantity_used:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Available: {ingredient.current_stock} {ingredient.unit}"
        )
    
    # Deduct from stock
    ingredient.current_stock -= usage.quantity_used
    
    # Record usage
    db_usage = models.IngredientUsage(**usage.dict())
    db.add(db_usage)
    db.commit()
    db.refresh(db_usage)
    
    return db_usage

@router.get("/usage", response_model=List[schemas.IngredientUsage])
def get_ingredient_usage_history(
    ingredient_id: int = None,
    order_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get ingredient usage history with filters
    """
    query = db.query(models.IngredientUsage)
    
    if ingredient_id:
        query = query.filter(models.IngredientUsage.ingredient_id == ingredient_id)
    if order_id:
        query = query.filter(models.IngredientUsage.order_id == order_id)
    
    usage_logs = query.order_by(models.IngredientUsage.used_at.desc()).offset(skip).limit(limit).all()
    return usage_logs

# ===== INVENTORY ALERTS & REPORTS =====

@router.get("/alerts/low-stock", response_model=List[schemas.Ingredient])
def get_low_stock_alerts(db: Session = Depends(get_db)):
    """
    Get ingredients that are below minimum stock level
    """
    low_stock = db.query(models.Ingredient).filter(
        models.Ingredient.current_stock <= models.Ingredient.minimum_stock
    ).all()
    return low_stock

@router.get("/alerts/expiring-soon", response_model=List[schemas.Ingredient])
def get_expiring_ingredients(days: int = 7, db: Session = Depends(get_db)):
    """
    Get ingredients expiring within specified days
    """
    cutoff_date = datetime.utcnow().date() + timedelta(days=days)
    
    expiring = db.query(models.Ingredient).filter(
        models.Ingredient.expiry_date != None,
        models.Ingredient.expiry_date <= cutoff_date
    ).all()
    return expiring

@router.get("/grocery-list")
def generate_grocery_list(db: Session = Depends(get_db)):
    """
    Generate grocery shopping list for low stock items
    """
    low_stock = db.query(models.Ingredient).filter(
        models.Ingredient.current_stock <= models.Ingredient.minimum_stock
    ).all()
    
    grocery_list = []
    for ingredient in low_stock:
        needed_quantity = ingredient.minimum_stock * 2 - ingredient.current_stock
        grocery_list.append({
            "name": ingredient.name,
            "current_stock": ingredient.current_stock,
            "needed_quantity": max(needed_quantity, 0),
            "unit": ingredient.unit,
            "estimated_cost": ingredient.cost_per_unit * needed_quantity if ingredient.cost_per_unit else None,
            "supplier": ingredient.supplier
        })
    
    return {
        "items": grocery_list,
        "total_items": len(grocery_list),
        "total_estimated_cost": sum(item['estimated_cost'] for item in grocery_list if item['estimated_cost'])
    }

# ===== DISH INGREDIENT REQUIREMENTS =====

@router.get("/required-ingredients/{menu_item_id}")
def get_required_ingredients_for_dish(menu_item_id: int, db: Session = Depends(get_db)):
    """
    Get ingredients required for a specific dish
    """
    menu_item = db.query(models.MenuItem).filter(models.MenuItem.id == menu_item_id).first()
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    # Get ingredient requirements from association table
    requirements = db.query(
        models.Ingredient,
        models.menu_item_ingredients.c.quantity_required,
        models.menu_item_ingredients.c.unit
    ).join(
        models.menu_item_ingredients,
        models.Ingredient.id == models.menu_item_ingredients.c.ingredient_id
    ).filter(
        models.menu_item_ingredients.c.menu_item_id == menu_item_id
    ).all()
    
    result = []
    for ingredient, qty_required, unit in requirements:
        result.append({
            "ingredient": schemas.Ingredient.from_orm(ingredient),
            "quantity_required": qty_required,
            "unit": unit,
            "available": ingredient.current_stock >= qty_required
        })
    
    return {
        "menu_item": menu_item.name,
        "ingredients": result,
        "can_prepare": all(item['available'] for item in result)
    }
