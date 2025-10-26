from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
from datetime import datetime
from .. import crud, schemas, models
from ..database import get_db

router = APIRouter(prefix="/api/menu", tags=["menu"])

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[schemas.MenuItem])
def read_menu_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = crud.get_menu_items(db, skip=skip, limit=limit)
    return items

@router.get("/{item_id}", response_model=schemas.MenuItem)
def read_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = crud.get_menu_item(db, item_id=item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return item

@router.post("/", response_model=schemas.MenuItem)
async def create_menu_item(
    name: str = Form(...),
    category: str = Form(...),
    price: float = Form(...),
    description: Optional[str] = Form(None),
    is_available: bool = Form(True),
    prep_time: Optional[int] = Form(None),
    cook_time: Optional[int] = Form(None),
    diet: Optional[str] = Form(None),
    course: Optional[str] = Form(None),
    global_dish_id: Optional[int] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Create menu item with optional auto-fill from global dish
    """
    image_url = None
    if image:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{image.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/static/uploads/{filename}"
    
    item_data = schemas.MenuItemCreate(
        name=name,
        category=category,
        price=price,
        description=description,
        image_url=image_url,
        is_available=is_available,
        prep_time=prep_time,
        cook_time=cook_time,
        diet=diet,
        course=course,
        global_dish_id=global_dish_id,
        ingredients=[]
    )
    return crud.create_menu_item(db=db, item=item_data)

@router.post("/from-global-dish/{dish_id}", response_model=schemas.MenuItem)
def create_menu_item_from_global_dish(
    dish_id: int,
    price: float,
    custom_name: Optional[str] = None,
    custom_description: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Create menu item by copying from global dish database
    Auto-fills name, ingredients, category, etc.
    """
    global_dish = db.query(models.GlobalDish).filter(models.GlobalDish.id == dish_id).first()
    if not global_dish:
        raise HTTPException(status_code=404, detail="Global dish not found")
    
    # Create menu item with auto-filled data
    menu_item = models.MenuItem(
        name=custom_name or global_dish.name,
        category=global_dish.course or "Main Course",
        price=price,
        description=custom_description or global_dish.description,
        global_dish_id=dish_id,
        prep_time=global_dish.prep_time,
        cook_time=global_dish.cook_time,
        diet=global_dish.diet,
        course=global_dish.course,
        is_available=True
    )
    
    db.add(menu_item)
    db.commit()
    db.refresh(menu_item)
    
    return menu_item

@router.put("/{item_id}", response_model=schemas.MenuItem)
def update_menu_item(item_id: int, item: schemas.MenuItemUpdate, db: Session = Depends(get_db)):
    db_item = crud.update_menu_item(db, item_id=item_id, item=item)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return db_item

@router.delete("/{item_id}")
def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = crud.delete_menu_item(db, item_id=item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"message": "Menu item deleted successfully"}
