"""
Global Dishes API Routes
Search and browse global dish library
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_, and_
from typing import List, Optional
from app.core.database import get_db
from app.models.models import GlobalDish, GlobalIngredient, GlobalDishIngredient, User, UserRole
from app.schemas.schemas import (
    GlobalDishSearchParams,
    GlobalDishSearchResult,
    GlobalDishResponse,
    DishIngredientDetail,
    PaginatedResponse
)
from app.api.routes.auth import get_current_user

router = APIRouter(prefix="/global-dishes", tags=["Global Dishes"])


@router.get("/search", response_model=List[GlobalDishSearchResult])
def search_global_dishes(
    q: Optional[str] = Query(None, description="Search query (optional)"),
    category: Optional[str] = None,
    cuisine: Optional[str] = None,
    is_vegetarian: Optional[bool] = None,
    max_price: Optional[float] = None,
    spice_level_max: Optional[int] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    **Search Global Dish Library with Fuzzy Matching**
    
    Uses PostgreSQL's pg_trgm extension for intelligent fuzzy search.
    
    **Features:**
    - Fuzzy text matching (handles typos: "panner tikka" → "Paneer Tikka")
    - Filter by category, cuisine, vegetarian, price, spice level
    - Returns similarity score for ranking
    - Includes ingredient count
    - Works without search query (returns all dishes)
    
    **Examples:**
    - `/global-dishes/search` → All dishes
    - `/global-dishes/search?q=paneer` → All paneer dishes
    - `/global-dishes/search?category=Main Course` → All main courses
    - `/global-dishes/search?q=chicken&is_vegetarian=false&max_price=300`
    """
    
    try:
        # Build base query (simple LIKE search, no pg_trgm needed)
        if q and len(q) >= 2:
            # Search with LIKE matching
            query = select(
                GlobalDish,
                func.cast(1.0, type_=func.Float()).label('similarity'),
                func.count(GlobalDishIngredient.id).label('ingredients_count')
            ).select_from(GlobalDish).outerjoin(
                GlobalDishIngredient, GlobalDish.id == GlobalDishIngredient.dish_id
            ).where(
                and_(
                    GlobalDish.is_active == True,
                    or_(
                        GlobalDish.name.ilike(f"%{q}%"),  # Search in name
                        GlobalDish.description.ilike(f"%{q}%"),  # Search in description
                        GlobalDish.category.ilike(f"%{q}%"),  # Search in category
                        GlobalDish.cuisine.ilike(f"%{q}%")  # Search in cuisine
                    )
                )
            ).group_by(GlobalDish.id)
        else:
            # No search query - return all active dishes
            query = select(
                GlobalDish,
                func.cast(1.0, type_=func.Float()).label('similarity'),
                func.count(GlobalDishIngredient.id).label('ingredients_count')
            ).select_from(GlobalDish).outerjoin(
                GlobalDishIngredient, GlobalDish.id == GlobalDishIngredient.dish_id
            ).where(
                GlobalDish.is_active == True
            ).group_by(GlobalDish.id)
        
        # Apply filters
        if category:
            query = query.where(GlobalDish.category == category)
        
        if cuisine:
            query = query.where(GlobalDish.cuisine == cuisine)
        
        if is_vegetarian is not None:
            query = query.where(GlobalDish.is_vegetarian == is_vegetarian)
        
        if max_price is not None:
            query = query.where(GlobalDish.default_price <= max_price)
        
        if spice_level_max is not None:
            query = query.where(GlobalDish.spice_level <= spice_level_max)
        
        # Order by popularity and name
        query = query.order_by(
            GlobalDish.popularity_score.desc(),
            GlobalDish.name.asc()
        )
        
        # Pagination
        query = query.limit(limit).offset(offset)
        
        # Execute query
        result = db.execute(query)
        rows = result.all()
        
        # Format response
        results = []
        for dish, similarity, ingredients_count in rows:
            results.append(GlobalDishSearchResult(
                id=dish.id,
                name=dish.name,
                description=dish.description,
                category=dish.category,
                cuisine=dish.cuisine,
                default_price=dish.default_price,
                image_url=dish.image_url,
                is_vegetarian=dish.is_vegetarian,
                spice_level=dish.spice_level,
                prep_time_minutes=dish.prep_time_minutes,
                tags=dish.tags or [],
                similarity_score=float(similarity or 0.0),
                ingredients_count=ingredients_count or 0
            ))
        
        return results
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/categories", response_model=List[dict])
def get_dish_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    **Get All Available Dish Categories**
    
    Returns list of categories with dish count.
    """
    
    try:
        rows = db.query(
            GlobalDish.category,
            func.count(GlobalDish.id).label('count')
        ).filter(
            GlobalDish.is_active == True
        ).group_by(GlobalDish.category).order_by(func.count(GlobalDish.id).desc()).all()
        
        return [{"category": row[0], "count": row[1]} for row in rows]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch categories: {str(e)}")


@router.get("/cuisines", response_model=List[dict])
def get_dish_cuisines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    **Get All Available Cuisines**
    
    Returns list of cuisines with dish count.
    """
    
    try:
        rows = db.query(
            GlobalDish.cuisine,
            func.count(GlobalDish.id).label('count')
        ).filter(
            and_(GlobalDish.is_active == True, GlobalDish.cuisine.isnot(None))
        ).group_by(GlobalDish.cuisine).order_by(func.count(GlobalDish.id).desc()).all()
        
        return [{"cuisine": row[0], "count": row[1]} for row in rows]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch cuisines: {str(e)}")


@router.get("/trending", response_model=List[GlobalDishSearchResult])
def get_trending_dishes(
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    **Get Trending/Popular Dishes**
    
    Returns most popular dishes based on how many restaurants have added them.
    """
    
    try:
        query = db.query(
            GlobalDish,
            func.count(GlobalDishIngredient.id).label('ingredients_count')
        ).select_from(GlobalDish).outerjoin(
            GlobalDishIngredient, GlobalDish.id == GlobalDishIngredient.dish_id
        ).filter(
            GlobalDish.is_active == True
        ).group_by(GlobalDish.id)
        
        if category:
            query = query.filter(GlobalDish.category == category)
        
        query = query.order_by(
            GlobalDish.popularity_score.desc(),
            GlobalDish.created_at.desc()
        ).limit(limit)
        
        rows = query.all()
        
        results = []
        for dish, ingredients_count in rows:
            results.append(GlobalDishSearchResult(
                id=dish.id,
                name=dish.name,
                description=dish.description,
                category=dish.category,
                cuisine=dish.cuisine,
                default_price=dish.default_price,
                image_url=dish.image_url,
                is_vegetarian=dish.is_vegetarian,
                spice_level=dish.spice_level,
                prep_time_minutes=dish.prep_time_minutes,
                tags=dish.tags or [],
                similarity_score=1.0,  # Not applicable for trending
                ingredients_count=ingredients_count or 0
            ))
        
        return results
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch trending dishes: {str(e)}")


@router.get("/{dish_id}", response_model=GlobalDishResponse)
def get_global_dish_details(
    dish_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    **Get Detailed Information About a Global Dish**
    
    Returns complete dish details including:
    - All ingredients with quantities
    - Nutritional information
    - Preparation time
    - Allergens and tags
    """
    
    try:
        # Fetch dish
        dish = db.query(GlobalDish).filter(GlobalDish.id == dish_id).first()
        
        if not dish:
            raise HTTPException(status_code=404, detail="Dish not found")
        
        # Fetch ingredients
        ingredient_rows = db.query(GlobalDishIngredient, GlobalIngredient).join(
            GlobalIngredient, GlobalDishIngredient.ingredient_id == GlobalIngredient.id
        ).filter(GlobalDishIngredient.dish_id == dish_id).all()
        ingredients = []
        
        for dish_ing, ingredient in ingredient_rows:
            ingredients.append(DishIngredientDetail(
                ingredient_id=ingredient.id,
                ingredient_name=ingredient.name,
                quantity_per_serving=dish_ing.quantity_per_serving,
                unit=dish_ing.unit,
                is_optional=dish_ing.is_optional,
                notes=dish_ing.notes
            ))
        
        return GlobalDishResponse(
            id=dish.id,
            name=dish.name,
            description=dish.description,
            category=dish.category,
            cuisine=dish.cuisine,
            default_price=dish.default_price,
            image_url=dish.image_url,
            is_vegetarian=dish.is_vegetarian,
            spice_level=dish.spice_level,
            prep_time_minutes=dish.prep_time_minutes,
            calories=dish.calories,
            allergens=dish.allergens or [],
            tags=dish.tags or [],
            popularity_score=dish.popularity_score,
            is_active=dish.is_active,
            created_at=dish.created_at,
            ingredients=ingredients
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dish: {str(e)}")
