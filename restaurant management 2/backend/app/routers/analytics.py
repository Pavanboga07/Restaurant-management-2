from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from .. import models
from ..database import get_db

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    week_ago = today - timedelta(days=7)
    
    # Total revenue today
    revenue_today = db.query(func.sum(models.Bill.total_amount))\
        .filter(
            func.date(models.Bill.created_at) == today,
            models.Bill.paid == True
        ).scalar() or 0
    
    # Total revenue this week
    revenue_week = db.query(func.sum(models.Bill.total_amount))\
        .filter(
            func.date(models.Bill.created_at) >= week_ago,
            models.Bill.paid == True
        ).scalar() or 0
    
    # Total orders today
    orders_today = db.query(func.count(models.Order.id))\
        .filter(func.date(models.Order.created_at) == today).scalar() or 0
    
    # Completed orders today
    completed_today = db.query(func.count(models.Order.id))\
        .filter(
            func.date(models.Order.created_at) == today,
            models.Order.status == "Completed"
        ).scalar() or 0
    
    # Active tables
    active_tables = db.query(func.count(models.RestaurantTable.id))\
        .filter(models.RestaurantTable.status == "Occupied").scalar() or 0
    
    # Total tables
    total_tables = db.query(func.count(models.RestaurantTable.id)).scalar() or 0
    
    # Most popular menu items (top 5)
    popular_items = db.query(
        models.MenuItem.name,
        func.count(models.order_items.c.menu_item_id).label('order_count')
    ).join(
        models.order_items,
        models.MenuItem.id == models.order_items.c.menu_item_id
    ).group_by(
        models.MenuItem.name
    ).order_by(
        func.count(models.order_items.c.menu_item_id).desc()
    ).limit(5).all()
    
    # Pending orders
    pending_orders = db.query(func.count(models.Order.id))\
        .filter(models.Order.status == "Pending").scalar() or 0
    
    # Unpaid bills
    unpaid_bills = db.query(func.count(models.Bill.id))\
        .filter(models.Bill.paid == False).scalar() or 0
    
    return {
        "revenue": {
            "today": float(revenue_today),
            "week": float(revenue_week)
        },
        "orders": {
            "today": orders_today,
            "completed_today": completed_today,
            "pending": pending_orders
        },
        "tables": {
            "active": active_tables,
            "total": total_tables
        },
        "popular_items": [
            {"name": item[0], "count": item[1]} 
            for item in popular_items
        ],
        "bills": {
            "unpaid": unpaid_bills
        }
    }
