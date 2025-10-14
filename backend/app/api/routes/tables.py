"""
Table Management Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Table, User, UserRole
from app.schemas.schemas import TableCreate, TableUpdate, TableResponse
from app.api.routes.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[TableResponse])
async def get_tables(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all tables for current restaurant
    """
    tables = db.query(Table).filter(
        Table.restaurant_id == current_user.restaurant_id
    ).all()
    
    return tables

@router.post("/", response_model=TableResponse, status_code=status.HTTP_201_CREATED)
async def create_table(
    table_data: TableCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new table (Manager only)
    """
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers can create tables"
        )
    
    if table_data.restaurant_id != current_user.restaurant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create tables for other restaurants"
        )
    
    new_table = Table(**table_data.dict())
    db.add(new_table)
    db.commit()
    db.refresh(new_table)
    
    return new_table

@router.put("/{table_id}", response_model=TableResponse)
async def update_table(
    table_id: int,
    table_data: TableUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update table (Staff/Manager only)
    """
    if current_user.role == UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customers cannot update tables"
        )
    
    table = db.query(Table).filter(
        Table.id == table_id,
        Table.restaurant_id == current_user.restaurant_id
    ).first()
    
    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table not found"
        )
    
    # Update fields
    for key, value in table_data.dict(exclude_unset=True).items():
        setattr(table, key, value)
    
    db.commit()
    db.refresh(table)
    
    return table

@router.delete("/{table_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_table(
    table_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete table (Manager only)
    """
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers can delete tables"
        )
    
    table = db.query(Table).filter(
        Table.id == table_id,
        Table.restaurant_id == current_user.restaurant_id
    ).first()
    
    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table not found"
        )
    
    db.delete(table)
    db.commit()
    
    return None
