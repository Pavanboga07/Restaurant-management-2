from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/tables", tags=["tables"])

@router.get("/", response_model=List[schemas.Table])
def read_tables(db: Session = Depends(get_db)):
    return crud.get_tables(db)

@router.get("/{table_id}", response_model=schemas.Table)
def read_table(table_id: int, db: Session = Depends(get_db)):
    table = crud.get_table(db, table_id=table_id)
    if table is None:
        raise HTTPException(status_code=404, detail="Table not found")
    return table

@router.post("/", response_model=schemas.Table)
def create_table(table: schemas.TableCreate, db: Session = Depends(get_db)):
    return crud.create_table(db=db, table=table)

@router.put("/{table_id}", response_model=schemas.Table)
def update_table(table_id: int, table: schemas.TableUpdate, db: Session = Depends(get_db)):
    db_table = crud.update_table(db, table_id=table_id, table=table)
    if db_table is None:
        raise HTTPException(status_code=404, detail="Table not found")
    return db_table
