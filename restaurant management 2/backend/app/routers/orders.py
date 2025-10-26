from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.get("/", response_model=List[schemas.Order])
def read_orders(active_only: bool = False, db: Session = Depends(get_db)):
    if active_only:
        orders = crud.get_orders(db)
        return [order for order in orders if order.status == "Pending"]
    return crud.get_orders(db)

@router.get("/{order_id}", response_model=schemas.Order)
def read_order(order_id: int, db: Session = Depends(get_db)):
    order = crud.get_order(db, order_id=order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    # Check if table exists and is available
    table = crud.get_table(db, table_id=order.table_id)
    if table is None:
        raise HTTPException(status_code=404, detail="Table not found")
    
    # Create order
    db_order = crud.create_order(db=db, order=order)
    
    # Update table status
    crud.update_table_status(db, table_id=order.table_id, status="Occupied")
    
    return db_order

@router.post("/customer", response_model=schemas.Order)
def create_customer_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    """Customer-facing order creation endpoint"""
    # Check if table exists
    table = crud.get_table(db, table_id=order.table_id)
    if table is None:
        raise HTTPException(status_code=404, detail="Table not found")
    
    # Create order
    db_order = crud.create_order(db=db, order=order)
    
    # Update table status
    crud.update_table_status(db, table_id=order.table_id, status="Occupied")
    
    return db_order

@router.put("/{order_id}", response_model=schemas.Order)
def update_order(order_id: int, order: schemas.OrderUpdate, db: Session = Depends(get_db)):
    db_order = crud.update_order(db, order_id=order_id, order=order)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # If order is completed, free the table
    if order.status == "Completed":
        crud.update_table_status(db, table_id=db_order.table_id, status="Available")
    
    return db_order

@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = crud.delete_order(db, order_id=order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted successfully"}
