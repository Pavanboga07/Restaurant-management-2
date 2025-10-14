"""
Add Dish from Global Library API
One-click dish addition with auto ingredient mapping
"""
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Dict, Optional
from app.core.database import get_db
from app.models.models import (
    GlobalDish, GlobalIngredient, GlobalDishIngredient,
    MenuItem, Ingredient, DishIngredient, DishAdditionLog,
    User, UserRole, Restaurant
)
from app.schemas.schemas import (
    AddDishFromGlobalRequest,
    AddDishFromGlobalResponse,
    IngredientMappingDetail
)
from app.api.routes.auth import get_current_user
from app.services.ingredient_matcher import (
    ingredient_matcher,
    create_missing_ingredient,
    validate_stock_availability
)

router = APIRouter(prefix="/restaurants", tags=["Restaurant Menu from Global"])


@router.post(
    "/{restaurant_id}/add-from-global/{global_dish_id}",
    response_model=AddDishFromGlobalResponse
)
def add_dish_from_global_library(
    restaurant_id: int = Path(..., description="Restaurant ID"),
    global_dish_id: int = Path(..., description="Global Dish ID"),
    request: AddDishFromGlobalRequest = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    **🎉 ONE-CLICK DISH ADDITION FROM GLOBAL LIBRARY**
    
    Adds a dish from the global library to the restaurant menu with intelligent
    ingredient auto-mapping.
    
    **Features:**
    - 🔍 **Smart Ingredient Matching**: Fuzzy matching with confidence scores
    - ✨ **Auto-Create Missing**: Creates ingredients that don't exist
    - 📊 **Stock Validation**: Checks if sufficient stock available
    - 💰 **Cost Calculation**: Estimates dish cost from ingredients
    - 📈 **Analytics**: Tracks additions for popularity scoring
    
    **How it Works:**
    1. Fetches global dish + ingredient list
    2. For each ingredient:
       - Exact match: "Paneer" → "Paneer" (100% confidence)
       - Alternate names: "Cottage Cheese" → "Paneer" (85%)
       - Fuzzy match: "Panner" → "Paneer" (75%)
       - No match: Creates new ingredient (0%)
    3. Creates menu item with mappings
    4. Returns detailed mapping report
    
    **Request Body:**
    ```json
    {
      "price_override": 320.00,       // Optional custom price
      "ingredient_mappings": {         // Optional manual mappings
        "7": 42                        // Map global ing 7 to restaurant ing 42
      },
      "auto_create_missing": true      // Auto-create missing ingredients
    }
    ```
    
    **Response Example:**
    ```json
    {
      "menu_item_id": 156,
      "dish_name": "Paneer Tikka",
      "final_price": 250.00,
      "ingredients_mapped": 8,
      "ingredients_created": 1,
      "mapping_details": [
        {
          "global_ingredient_name": "Paneer",
          "quantity_needed": 200,
          "unit": "grams",
          "matched_restaurant_ingredient_name": "Paneer",
          "match_confidence": 1.0,
          "needs_creation": false
        }
      ],
      "warnings": ["Low stock: Bell Pepper (30g available, 50g needed)"]
    }
    ```
    
    **Permissions**: Manager or Admin only
    """
    
    # Validate permissions
    if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Only managers and admins can add dishes"
        )
    
    # Validate restaurant ownership
    if current_user.restaurant_id != restaurant_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="You can only add dishes to your own restaurant"
        )
    
    try:
        # Step 1: Fetch global dish
        global_dish = db.query(GlobalDish).filter(GlobalDish.id == global_dish_id).first()
        
        if not global_dish:
            raise HTTPException(status_code=404, detail="Global dish not found")
        
        if not global_dish.is_active:
            raise HTTPException(status_code=400, detail="This dish is no longer available")
        
        # Step 2: Check if dish already exists in restaurant menu
        existing_dish = db.query(MenuItem).filter(
            MenuItem.restaurant_id == restaurant_id,
            MenuItem.name == global_dish.name
        ).first()
        
        if existing_dish:
            raise HTTPException(
                status_code=400,
                detail=f"Dish '{global_dish.name}' already exists in your menu"
            )
        
        # Step 3: Fetch global dish ingredients
        global_ingredients_data = db.query(GlobalDishIngredient, GlobalIngredient).join(
            GlobalIngredient, GlobalDishIngredient.ingredient_id == GlobalIngredient.id
        ).filter(
            GlobalDishIngredient.dish_id == global_dish_id
        ).all()
        
        if not global_ingredients_data:
            raise HTTPException(
                status_code=400,
                detail="This dish has no ingredients defined"
            )
        
        # Step 4: Create menu item
        final_price = request.price_override if request and request.price_override else global_dish.default_price
        
        new_menu_item = MenuItem(
            restaurant_id=restaurant_id,
            name=global_dish.name,
            description=global_dish.description,
            category=global_dish.category,
            price=final_price,
            image_url=global_dish.image_url,
            is_available=True,
            is_vegetarian=global_dish.is_vegetarian,
            spice_level=global_dish.spice_level,
            prep_time_minutes=global_dish.prep_time_minutes,
            calories=global_dish.calories,
            allergens=global_dish.allergens or [],
            tags=global_dish.tags or [],
            popularity_score=0.0
        )
        
        db.add(new_menu_item)
        db.flush()  # Get menu item ID
        
        # Step 5: Map ingredients with intelligent matching
        mapping_details = []
        ingredients_mapped = 0
        ingredients_created = 0
        warnings = []
        manual_mappings = request.ingredient_mappings if request and request.ingredient_mappings else {}
        auto_create = request.auto_create_missing if request and request.auto_create_missing is not None else True
        
        for dish_ingredient, global_ingredient in global_ingredients_data:
            mapping_detail = IngredientMappingDetail(
                global_ingredient_id=global_ingredient.id,
                global_ingredient_name=global_ingredient.name,
                quantity_needed=dish_ingredient.quantity_per_serving,
                unit=dish_ingredient.unit,
                match_confidence=0.0,
                needs_creation=False
            )
            
            restaurant_ingredient = None
            
            # Check for manual mapping first
            if global_ingredient.id in manual_mappings:
                rest_ing_id = manual_mappings[global_ingredient.id]
                restaurant_ingredient = db.query(Ingredient).filter(
                    Ingredient.id == rest_ing_id
                ).first()
                
                if restaurant_ingredient:
                    mapping_detail.matched_restaurant_ingredient_id = restaurant_ingredient.id
                    mapping_detail.matched_restaurant_ingredient_name = restaurant_ingredient.name
                    mapping_detail.match_confidence = 1.0
                    ingredients_mapped += 1
            
            # Auto-match if no manual mapping
            if not restaurant_ingredient:
                best_match = ingredient_matcher.get_best_match(
                    global_ingredient,
                    restaurant_id,
                    db
                )
                
                if best_match:
                    # Found a match!
                    restaurant_ingredient = db.query(Ingredient).filter(
                        Ingredient.id == best_match['ingredient_id']
                    ).first()
                    
                    if restaurant_ingredient:
                        mapping_detail.matched_restaurant_ingredient_id = restaurant_ingredient.id
                        mapping_detail.matched_restaurant_ingredient_name = restaurant_ingredient.name
                        mapping_detail.match_confidence = best_match['similarity_score']
                        ingredients_mapped += 1
                
                # No match found - create new ingredient if allowed
                elif auto_create:
                    restaurant_ingredient = create_missing_ingredient(
                        global_ingredient,
                        restaurant_id,
                        db
                    )
                    
                    mapping_detail.matched_restaurant_ingredient_id = restaurant_ingredient.id
                    mapping_detail.matched_restaurant_ingredient_name = restaurant_ingredient.name
                    mapping_detail.match_confidence = 1.0
                    mapping_detail.needs_creation = True
                    ingredients_created += 1
                    
                    warnings.append(
                        f"Created new ingredient: {restaurant_ingredient.name} (0 stock)"
                    )
            
            # Validate stock availability
            if restaurant_ingredient:
                has_stock, available, warning = validate_stock_availability(
                    restaurant_ingredient.id,
                    dish_ingredient.quantity_per_serving,
                    db
                )
                
                if not has_stock and warning:
                    warnings.append(warning)
                
                # Create dish-ingredient mapping
                dish_ing_mapping = DishIngredient(
                    menu_item_id=new_menu_item.id,
                    ingredient_id=restaurant_ingredient.id,
                    required_quantity=dish_ingredient.quantity_per_serving
                )
                db.add(dish_ing_mapping)
            
            mapping_details.append(mapping_detail)
        
        # Step 6: Create addition log for analytics
        addition_log = DishAdditionLog(
            restaurant_id=restaurant_id,
            global_dish_id=global_dish_id,
            menu_item_id=new_menu_item.id,
            added_by=current_user.id,
            price_adjustment=final_price - global_dish.default_price,
            ingredients_mapped=ingredients_mapped,
            ingredients_created=ingredients_created,
            mapping_details={
                "total_ingredients": len(global_ingredients_data),
                "mapped": ingredients_mapped,
                "created": ingredients_created,
                "warnings": warnings
            }
        )
        db.add(addition_log)
        
        # Step 7: Update global dish popularity
        global_dish.popularity_score += 1.0
        
        # Commit all changes
        db.commit()
        db.refresh(new_menu_item)
        
        # Return detailed response
        return AddDishFromGlobalResponse(
            menu_item_id=new_menu_item.id,
            dish_name=new_menu_item.name,
            final_price=final_price,
            ingredients_mapped=ingredients_mapped,
            ingredients_created=ingredients_created,
            mapping_details=mapping_details,
            warnings=warnings
        )
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add dish: {str(e)}"
        )


@router.get(
    "/{restaurant_id}/preview-mapping/{global_dish_id}",
    response_model=Dict
)
def preview_ingredient_mapping(
    restaurant_id: int = Path(..., description="Restaurant ID"),
    global_dish_id: int = Path(..., description="Global Dish ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    **Preview Ingredient Mapping Before Adding Dish**
    
    Shows how global dish ingredients will be mapped to restaurant inventory.
    Useful for frontend to display mapping preview before user confirms.
    
    **Returns:**
    ```json
    {
      "dish_name": "Paneer Tikka",
      "default_price": 250.00,
      "total_ingredients": 9,
      "ingredients": [
        {
          "global_ingredient_name": "Paneer",
          "quantity_needed": 200,
          "unit": "grams",
          "matches": [
            {
              "ingredient_id": 42,
              "name": "Paneer",
              "similarity_score": 1.0,
              "current_stock": 5000,
              "unit": "grams",
              "is_sufficient": true
            }
          ],
          "best_match": {...},
          "needs_creation": false
        }
      ],
      "estimated_cost": 85.50,
      "can_make_servings": 25
    }
    ```
    """
    
    try:
        # Fetch global dish
        global_dish = db.query(GlobalDish).filter(GlobalDish.id == global_dish_id).first()
        
        if not global_dish:
            raise HTTPException(status_code=404, detail="Global dish not found")
        
        # Fetch ingredients
        global_ingredients_data = db.query(GlobalDishIngredient, GlobalIngredient).join(
            GlobalIngredient, GlobalDishIngredient.ingredient_id == GlobalIngredient.id
        ).filter(
            GlobalDishIngredient.dish_id == global_dish_id
        ).all()
        
        # Get mapping suggestions for all ingredients
        ingredient_previews = []
        estimated_cost = 0.0
        min_servings = float('inf')
        
        for dish_ingredient, global_ingredient in global_ingredients_data:
            matches = ingredient_matcher.find_matches(
                global_ingredient,
                restaurant_id,
                db
            )
            
            # Calculate how many servings can be made from current stock
            if matches:
                best_match = matches[0]
                available_stock = best_match['current_stock']
                required_per_serving = dish_ingredient.quantity_per_serving
                
                if required_per_serving > 0:
                    servings_possible = int(available_stock / required_per_serving)
                    min_servings = min(min_servings, servings_possible)
                    
                    # Estimate cost
                    ing = db.query(Ingredient).filter(
                        Ingredient.id == best_match['ingredient_id']
                    ).first()
                    if ing and ing.cost_per_unit:
                        estimated_cost += required_per_serving * ing.cost_per_unit
            
            ingredient_previews.append({
                "global_ingredient_id": global_ingredient.id,
                "global_ingredient_name": global_ingredient.name,
                "quantity_needed": dish_ingredient.quantity_per_serving,
                "unit": dish_ingredient.unit,
                "matches": matches,
                "best_match": matches[0] if matches else None,
                "needs_creation": len(matches) == 0
            })
        
        return {
            "dish_id": global_dish.id,
            "dish_name": global_dish.name,
            "description": global_dish.description,
            "category": global_dish.category,
            "default_price": global_dish.default_price,
            "total_ingredients": len(global_ingredients_data),
            "ingredients": ingredient_previews,
            "estimated_cost_per_serving": round(estimated_cost, 2),
            "profit_margin": round(global_dish.default_price - estimated_cost, 2),
            "can_make_servings": min_servings if min_servings != float('inf') else 0
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to preview mapping: {str(e)}"
        )
