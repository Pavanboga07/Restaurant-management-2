from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/dishes", tags=["dishes"])

@router.get("/search", response_model=List[schemas.GlobalDish])
def search_global_dishes(
    query: str = Query(..., min_length=2),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db)
):
    """
    Search global dishes database by name
    Returns matching dishes for auto-fill
    """
    dishes = db.query(models.GlobalDish).filter(
        models.GlobalDish.name.ilike(f"%{query}%")
    ).limit(limit).all()
    
    return dishes

@router.get("/{dish_id}", response_model=schemas.GlobalDish)
def get_global_dish(dish_id: int, db: Session = Depends(get_db)):
    """
    Get detailed information about a specific global dish
    """
    dish = db.query(models.GlobalDish).filter(models.GlobalDish.id == dish_id).first()
    if not dish:
        raise HTTPException(status_code=404, detail="Dish not found")
    return dish

@router.get("/", response_model=List[schemas.GlobalDish])
def get_all_dishes(
    skip: int = 0,
    limit: int = 50,
    diet: str = None,
    course: str = None,
    db: Session = Depends(get_db)
):
    """
    Get all global dishes with optional filters
    """
    query = db.query(models.GlobalDish)
    
    if diet:
        query = query.filter(models.GlobalDish.diet == diet)
    if course:
        query = query.filter(models.GlobalDish.course == course)
    
    dishes = query.offset(skip).limit(limit).all()
    return dishes
