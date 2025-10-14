"""
Staff Management Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import User, UserRole
from app.schemas.schemas import UserResponse
from app.api.routes.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
async def get_staff(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all staff members (Manager only)
    """
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers can view staff"
        )
    
    staff = db.query(User).filter(
        User.restaurant_id == current_user.restaurant_id,
        User.role.in_([UserRole.STAFF, UserRole.CHEF, UserRole.MANAGER])
    ).all()
    
    return staff

@router.get("/{user_id}", response_model=UserResponse)
async def get_staff_member(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get specific staff member details
    """
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    staff = db.query(User).filter(
        User.id == user_id,
        User.restaurant_id == current_user.restaurant_id
    ).first()
    
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found"
        )
    
    return staff

# TODO: Add update staff, deactivate staff, etc.
