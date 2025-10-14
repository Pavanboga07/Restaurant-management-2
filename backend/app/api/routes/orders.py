"""
Order Management Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.models.models import Order, OrderItem, MenuItem, User, UserRole, OrderStatus
from app.schemas.schemas import OrderCreate, OrderUpdate, OrderResponse, OrderItemResponse
from app.api.routes.auth import get_current_user
import random
import string

router = APIRouter()

def generate_order_number():
    """Generate unique order number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = ''.join(random.choices(string.digits, k=4))
    return f"ORD-{timestamp}-{random_suffix}"

@router.get("/", response_model=List[OrderResponse])
async def get_orders(
    status_filter: Optional[OrderStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get orders based on user role
    - Customers: their own orders
    - Staff/Chef/Manager: all restaurant orders
    """
    query = db.query(Order).filter(Order.restaurant_id == current_user.restaurant_id)
    
    # Customers can only see their own orders
    if current_user.role == UserRole.CUSTOMER:
        query = query.filter(Order.customer_id == current_user.id)
    
    if status_filter:
        query = query.filter(Order.status == status_filter)
    
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    
    # Convert to response with order items
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific order by ID
    """
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.restaurant_id == current_user.restaurant_id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Customers can only view their own orders
    if current_user.role == UserRole.CUSTOMER and order.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    return order

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new order
    """
    # Verify restaurant
    if order_data.restaurant_id != current_user.restaurant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create order for different restaurant"
        )
    
    # Validate menu items and calculate totals
    total_amount = 0.0
    order_items_data = []
    
    for item in order_data.items:
        menu_item = db.query(MenuItem).filter(
            MenuItem.id == item.menu_item_id,
            MenuItem.restaurant_id == order_data.restaurant_id
        ).first()
        
        if not menu_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item {item.menu_item_id} not found"
            )
        
        if not menu_item.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{menu_item.name} is currently unavailable"
            )
        
        subtotal = menu_item.price * item.quantity
        total_amount += subtotal
        
        order_items_data.append({
            "menu_item_id": item.menu_item_id,
            "quantity": item.quantity,
            "price": menu_item.price,
            "subtotal": subtotal,
            "special_instructions": item.special_instructions
        })
    
    # Calculate tax (18% GST for example)
    tax_amount = total_amount * 0.18
    discount_amount = 0.0  # Could add discount logic here
    final_amount = total_amount + tax_amount - discount_amount
    
    # Calculate estimated time based on items
    estimated_time = max([15] + [item.quantity * 5 for item in order_data.items])
    
    # Create order
    new_order = Order(
        restaurant_id=order_data.restaurant_id,
        table_id=order_data.table_id,
        customer_id=current_user.id,
        order_number=generate_order_number(),
        status=OrderStatus.PENDING,
        total_amount=total_amount,
        discount_amount=discount_amount,
        tax_amount=tax_amount,
        final_amount=final_amount,
        special_instructions=order_data.special_instructions,
        is_takeaway=order_data.is_takeaway,
        estimated_time=estimated_time
    )
    
    db.add(new_order)
    db.flush()  # Get the order ID
    
    # Create order items
    for item_data in order_items_data:
        order_item = OrderItem(
            order_id=new_order.id,
            **item_data
        )
        db.add(order_item)
    
    db.commit()
    db.refresh(new_order)
    
    # TODO: Emit socket event for new order
    # await sio.emit('order:placed', {'order_id': new_order.id})
    
    return new_order

@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    order_data: OrderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update order status (Staff/Chef/Manager only)
    """
    if current_user.role == UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customers cannot update orders"
        )
    
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.restaurant_id == current_user.restaurant_id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Update fields
    for key, value in order_data.dict(exclude_unset=True).items():
        setattr(order, key, value)
    
    # Set completion time if order is completed
    if order_data.status == OrderStatus.COMPLETED:
        order.completed_at = datetime.now()
    
    db.commit()
    db.refresh(order)
    
    # TODO: Emit socket event for order update
    # await sio.emit('order:updated', {'order_id': order.id, 'status': order.status})
    
    return order

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel an order (Customers can cancel their own pending orders)
    """
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.restaurant_id == current_user.restaurant_id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Customers can only cancel their own pending orders
    if current_user.role == UserRole.CUSTOMER:
        if order.customer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to cancel this order"
            )
        if order.status not in [OrderStatus.PENDING, OrderStatus.CONFIRMED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel order in current status"
            )
    
    order.status = OrderStatus.CANCELLED
    db.commit()
    
    return None

@router.get("/kitchen/pending")
async def get_kitchen_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get pending orders for kitchen (Chef view)
    """
    if current_user.role not in [UserRole.CHEF, UserRole.MANAGER, UserRole.STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    orders = db.query(Order).filter(
        Order.restaurant_id == current_user.restaurant_id,
        Order.status.in_([OrderStatus.CONFIRMED, OrderStatus.PREPARING])
    ).order_by(Order.created_at.asc()).all()
    
    return orders
