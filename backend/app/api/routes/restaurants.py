"""
Restaurant Management Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Restaurant, User, UserRole
from app.schemas.schemas import RestaurantResponse, RestaurantUpdate
from app.api.routes.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[RestaurantResponse])
async def get_restaurants(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all restaurants (Admin only) or current user's restaurant
    """
    if current_user.role == UserRole.ADMIN:
        restaurants = db.query(Restaurant).all()
    else:
        restaurants = db.query(Restaurant).filter(
            Restaurant.id == current_user.restaurant_id
        ).all()
    
    return restaurants

@router.get("/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant(
    restaurant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get restaurant details
    """
    if current_user.role != UserRole.ADMIN and current_user.restaurant_id != restaurant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    return restaurant

@router.put("/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant(
    restaurant_id: int,
    restaurant_data: RestaurantUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update restaurant details (Manager/Admin only)
    """
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers can update restaurant"
        )
    
    if current_user.role != UserRole.ADMIN and current_user.restaurant_id != restaurant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found"
        )
    
    # Update fields
    for key, value in restaurant_data.dict(exclude_unset=True).items():
        setattr(restaurant, key, value)
    
    db.commit()
    db.refresh(restaurant)
    
    return restaurant
