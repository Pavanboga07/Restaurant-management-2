from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime

# Menu Items
def get_menu_items(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.MenuItem).offset(skip).limit(limit).all()

def get_menu_item(db: Session, item_id: int):
    return db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()

def create_menu_item(db: Session, item: schemas.MenuItemCreate):
    db_item = models.MenuItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_menu_item(db: Session, item_id: int, item: schemas.MenuItemUpdate):
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if db_item:
        update_data = item.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)
        db.commit()
        db.refresh(db_item)
    return db_item

def delete_menu_item(db: Session, item_id: int):
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item

# Tables
def get_tables(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.RestaurantTable).offset(skip).limit(limit).all()

def get_table(db: Session, table_id: int):
    return db.query(models.RestaurantTable).filter(models.RestaurantTable.id == table_id).first()

def create_table(db: Session, table: schemas.TableCreate):
    db_table = models.RestaurantTable(**table.model_dump())
    db.add(db_table)
    db.commit()
    db.refresh(db_table)
    return db_table

def update_table(db: Session, table_id: int, table: schemas.TableUpdate):
    db_table = db.query(models.RestaurantTable).filter(models.RestaurantTable.id == table_id).first()
    if db_table:
        update_data = table.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_table, field, value)
        db.commit()
        db.refresh(db_table)
    return db_table

def update_table_status(db: Session, table_id: int, status: str):
    """Update table status (Available/Occupied)"""
    db_table = db.query(models.RestaurantTable).filter(models.RestaurantTable.id == table_id).first()
    if db_table:
        db_table.status = status
        db.commit()
        db.refresh(db_table)
    return db_table

def delete_table(db: Session, table_id: int):
    db_table = db.query(models.RestaurantTable).filter(models.RestaurantTable.id == table_id).first()
    if db_table:
        db.delete(db_table)
        db.commit()
    return db_table

# Orders
def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Order).offset(skip).limit(limit).all()

def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def create_order(db: Session, order: schemas.OrderCreate):
    # Calculate total amount
    total_amount = 0
    menu_items = []
    
    for item in order.items:
        menu_item = db.query(models.MenuItem).filter(models.MenuItem.id == item.menu_item_id).first()
        if menu_item:
            total_amount += menu_item.price * item.quantity
            for _ in range(item.quantity):
                menu_items.append(menu_item)
    
    db_order = models.Order(
        table_id=order.table_id,
        total_amount=total_amount,
        status="Pending"
    )
    db_order.items = menu_items
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def update_order(db: Session, order_id: int, order: schemas.OrderUpdate):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order:
        update_data = order.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_order, field, value)
        
        if order.status == "Completed":
            db_order.completed_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_order)
    return db_order

def delete_order(db: Session, order_id: int):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order:
        db.delete(db_order)
        db.commit()
    return db_order

# Bills
def get_bills(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Bill).offset(skip).limit(limit).all()

def get_bill(db: Session, bill_id: int):
    return db.query(models.Bill).filter(models.Bill.id == bill_id).first()

def create_bill(db: Session, bill: schemas.BillCreate):
    order = db.query(models.Order).filter(models.Order.id == bill.order_id).first()
    if not order:
        return None
    
    db_bill = models.Bill(
        order_id=bill.order_id,
        total_amount=order.total_amount
    )
    db.add(db_bill)
    db.commit()
    db.refresh(db_bill)
    return db_bill

def update_bill_payment(db: Session, bill_id: int, paid: bool):
    db_bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if db_bill:
        db_bill.paid = paid
        db.commit()
        db.refresh(db_bill)
    return db_bill

def delete_bill(db: Session, bill_id: int):
    db_bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if db_bill:
        db.delete(db_bill)
        db.commit()
    return db_bill
