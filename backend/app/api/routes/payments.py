"""
Payment Processing Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Payment, Order, User, PaymentStatus, PaymentMethod
from app.schemas.schemas import PaymentCreate, PaymentResponse
from app.api.routes.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create payment for an order
    """
    # Verify order exists and belongs to user's restaurant
    order = db.query(Order).filter(Order.id == payment_data.order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.restaurant_id != current_user.restaurant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Check if payment already exists
    existing_payment = db.query(Payment).filter(Payment.order_id == order.id).first()
    if existing_payment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment already exists for this order"
        )
    
    # Create payment
    new_payment = Payment(
        order_id=payment_data.order_id,
        amount=payment_data.amount,
        method=payment_data.method,
        status=PaymentStatus.PENDING
    )
    
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    
    # TODO: Integrate with actual payment gateway (Stripe/Razorpay)
    # For now, mark cash payments as completed
    if payment_data.method == PaymentMethod.CASH:
        new_payment.status = PaymentStatus.COMPLETED
        new_payment.transaction_id = f"CASH-{new_payment.id}"
        db.commit()
        db.refresh(new_payment)
    
    return new_payment

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get payment details
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Verify access
    order = db.query(Order).filter(Order.id == payment.order_id).first()
    if order.restaurant_id != current_user.restaurant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return payment

# TODO: Add webhook endpoints for Stripe/Razorpay callbacks
# TODO: Add refund functionality
