from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..database import get_db

router = APIRouter(prefix="/api/bills", tags=["billing"])

@router.post("/", response_model=schemas.Bill)
def create_bill(bill: schemas.BillCreate, db: Session = Depends(get_db)):
    db_bill = crud.create_bill(db=db, bill=bill)
    if db_bill is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_bill

@router.get("/", response_model=List[schemas.Bill])
def read_bills(db: Session = Depends(get_db)):
    return crud.get_bills(db)

@router.get("/{bill_id}", response_model=schemas.Bill)
def read_bill(bill_id: int, db: Session = Depends(get_db)):
    bill = crud.get_bill(db, bill_id=bill_id)
    if bill is None:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill

@router.patch("/{bill_id}/payment", response_model=schemas.Bill)
def update_payment_status(bill_id: int, paid: bool, db: Session = Depends(get_db)):
    bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    bill.paid = paid
    db.commit()
    db.refresh(bill)
    return bill
