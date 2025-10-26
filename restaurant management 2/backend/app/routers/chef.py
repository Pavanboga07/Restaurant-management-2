from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/chef", tags=["chef"])

# Get active orders for chef dashboard
@router.get("/orders/active", response_model=List[schemas.Order])
def get_active_orders(db: Session = Depends(get_db)):
    """Get all active orders (Pending, In Progress)"""
    orders = db.query(models.Order).filter(
        models.Order.status.in_(["Pending", "In Progress"])
    ).order_by(models.Order.created_at.asc()).all()
    return orders

# Update order with chef-specific fields
@router.put("/orders/{order_id}", response_model=schemas.Order)
def update_order_chef(
    order_id: int,
    order_update: schemas.OrderUpdate,
    db: Session = Depends(get_db)
):
    """Update order status, estimated time, and other chef fields"""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Auto-set started_at when status changes to "In Progress"
    if order_update.status == "In Progress" and order.status != "In Progress":
        order.started_at = datetime.utcnow()
    
    # Auto-set completed_at when status changes to "Ready" or "Completed"
    if order_update.status in ["Ready", "Completed"] and order.status not in ["Ready", "Completed"]:
        order.completed_at = datetime.utcnow()
    
    # Update fields
    for key, value in order_update.dict(exclude_unset=True).items():
        setattr(order, key, value)
    
    db.commit()
    db.refresh(order)
    return order

# Quick toggle menu item availability (86 feature)
@router.patch("/menu-items/{item_id}/toggle-availability")
def toggle_menu_item_availability(
    item_id: int,
    is_available: bool,
    db: Session = Depends(get_db)
):
    """Quickly toggle menu item availability (86 feature)"""
    menu_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    menu_item.is_available = is_available
    db.commit()
    db.refresh(menu_item)
    
    return {
        "success": True,
        "item_id": item_id,
        "item_name": menu_item.name,
        "is_available": is_available,
        "message": f"{menu_item.name} is now {'available' if is_available else 'unavailable (86)'}"
    }

# Kitchen Messages
@router.post("/messages", response_model=schemas.KitchenMessage)
def create_kitchen_message(
    message: schemas.KitchenMessageCreate,
    db: Session = Depends(get_db)
):
    """Create a kitchen message"""
    db_message = models.KitchenMessage(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/messages", response_model=List[schemas.KitchenMessage])
def get_kitchen_messages(
    recipient: str = None,
    unread_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get kitchen messages, optionally filtered"""
    query = db.query(models.KitchenMessage)
    
    if recipient:
        query = query.filter(models.KitchenMessage.recipient == recipient)
    
    if unread_only:
        query = query.filter(models.KitchenMessage.is_read == False)
    
    messages = query.order_by(models.KitchenMessage.created_at.desc()).all()
    return messages

@router.patch("/messages/{message_id}/read")
def mark_message_read(message_id: int, db: Session = Depends(get_db)):
    """Mark a message as read"""
    message = db.query(models.KitchenMessage).filter(models.KitchenMessage.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    message.is_read = True
    db.commit()
    return {"success": True, "message_id": message_id}

# Shift Handover
@router.post("/shift-handover", response_model=schemas.ShiftHandover)
def create_shift_handover(
    handover: schemas.ShiftHandoverCreate,
    db: Session = Depends(get_db)
):
    """Create a shift handover note"""
    db_handover = models.ShiftHandover(**handover.dict())
    db.add(db_handover)
    db.commit()
    db.refresh(db_handover)
    return db_handover

@router.get("/shift-handover/latest", response_model=schemas.ShiftHandover)
def get_latest_handover(db: Session = Depends(get_db)):
    """Get the latest shift handover note"""
    handover = db.query(models.ShiftHandover).order_by(
        models.ShiftHandover.created_at.desc()
    ).first()
    
    if not handover:
        raise HTTPException(status_code=404, detail="No handover notes found")
    
    return handover

@router.get("/shift-handover", response_model=List[schemas.ShiftHandover])
def get_shift_handovers(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get recent shift handover notes"""
    handovers = db.query(models.ShiftHandover).order_by(
        models.ShiftHandover.created_at.desc()
    ).limit(limit).all()
    return handovers

# Batch ingredient usage
@router.post("/inventory/batch-usage")
def record_batch_usage(
    usages: List[schemas.IngredientUsageCreate],
    db: Session = Depends(get_db)
):
    """Record multiple ingredient uses at once"""
    recorded = []
    
    for usage_data in usages:
        # Verify ingredient exists
        ingredient = db.query(models.Ingredient).filter(
            models.Ingredient.id == usage_data.ingredient_id
        ).first()
        
        if not ingredient:
            raise HTTPException(
                status_code=404,
                detail=f"Ingredient with id {usage_data.ingredient_id} not found"
            )
        
        # Deduct from stock
        ingredient.current_stock -= usage_data.quantity_used
        
        # Create usage record
        usage = models.IngredientUsage(**usage_data.dict())
        db.add(usage)
        recorded.append({
            "ingredient_id": usage_data.ingredient_id,
            "ingredient_name": ingredient.name,
            "quantity_used": usage_data.quantity_used,
            "new_stock": ingredient.current_stock
        })
    
    db.commit()
    
    return {
        "success": True,
        "recorded_count": len(recorded),
        "details": recorded
    }
