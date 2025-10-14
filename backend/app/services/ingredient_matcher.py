"""
Ingredient Auto-Mapping Service
Intelligently matches global ingredients to restaurant inventory
"""
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List, Dict, Tuple, Optional
from app.models.models import Ingredient, GlobalIngredient
from difflib import SequenceMatcher


class IngredientMatcher:
    """
    Fuzzy matching service for ingredients
    Uses multiple strategies to find the best match
    """
    
    # Match confidence thresholds
    EXACT_MATCH = 1.0
    HIGH_CONFIDENCE = 0.85
    MEDIUM_CONFIDENCE = 0.60
    LOW_CONFIDENCE = 0.40
    
    @staticmethod
    def calculate_similarity(str1: str, str2: str) -> float:
        """
        Calculate similarity between two strings (0.0 to 1.0)
        Uses SequenceMatcher for fuzzy string matching
        """
        return SequenceMatcher(None, str1.lower(), str2.lower()).ratio()
    
    @staticmethod
    def normalize_name(name: str) -> str:
        """Normalize ingredient name for better matching"""
        return name.lower().strip().replace('-', ' ').replace('_', ' ')
    
    def find_matches(
        self,
        global_ingredient: GlobalIngredient,
        restaurant_id: int,
        db: Session
    ) -> List[Dict]:
        """
        Find potential matches for a global ingredient in restaurant inventory
        
        Returns list of matches sorted by confidence score:
        [
            {
                'ingredient_id': 42,
                'name': 'Paneer',
                'similarity_score': 1.0,
                'match_type': 'exact',
                'current_stock': 5.0,
                'unit': 'kg'
            }
        ]
        """
        
        # Fetch all restaurant ingredients
        restaurant_ingredients = db.query(Ingredient).filter(
            Ingredient.restaurant_id == restaurant_id
        ).all()
        
        if not restaurant_ingredients:
            return []
        
        matches = []
        global_name = self.normalize_name(global_ingredient.name)
        alternate_names = [self.normalize_name(name) for name in (global_ingredient.alternate_names or [])]
        
        for rest_ingredient in restaurant_ingredients:
            rest_name = self.normalize_name(rest_ingredient.name)
            
            # Strategy 1: Exact match
            if global_name == rest_name:
                matches.append({
                    'ingredient_id': rest_ingredient.id,
                    'name': rest_ingredient.name,
                    'similarity_score': self.EXACT_MATCH,
                    'match_type': 'exact',
                    'current_stock': rest_ingredient.quantity,
                    'unit': rest_ingredient.unit
                })
                continue
            
            # Strategy 2: Check alternate names
            for alt_name in alternate_names:
                if alt_name == rest_name:
                    matches.append({
                        'ingredient_id': rest_ingredient.id,
                        'name': rest_ingredient.name,
                        'similarity_score': self.HIGH_CONFIDENCE,
                        'match_type': 'alternate_name',
                        'current_stock': rest_ingredient.quantity,
                        'unit': rest_ingredient.unit
                    })
                    break
            
            # Strategy 3: Fuzzy string matching
            similarity = self.calculate_similarity(global_name, rest_name)
            if similarity >= self.LOW_CONFIDENCE:
                matches.append({
                    'ingredient_id': rest_ingredient.id,
                    'name': rest_ingredient.name,
                    'similarity_score': similarity,
                    'match_type': 'fuzzy',
                    'current_stock': rest_ingredient.quantity,
                    'unit': rest_ingredient.unit
                })
            
            # Strategy 4: Check if one name contains the other (substring)
            if global_name in rest_name or rest_name in global_name:
                if not any(m['ingredient_id'] == rest_ingredient.id for m in matches):
                    matches.append({
                        'ingredient_id': rest_ingredient.id,
                        'name': rest_ingredient.name,
                        'similarity_score': 0.75,
                        'match_type': 'substring',
                        'current_stock': rest_ingredient.quantity,
                        'unit': rest_ingredient.unit
                    })
        
        # Remove duplicates (keep highest score)
        unique_matches = {}
        for match in matches:
            ing_id = match['ingredient_id']
            if ing_id not in unique_matches or match['similarity_score'] > unique_matches[ing_id]['similarity_score']:
                unique_matches[ing_id] = match
        
        # Sort by similarity score (highest first)
        sorted_matches = sorted(unique_matches.values(), key=lambda x: x['similarity_score'], reverse=True)
        
        return sorted_matches
    
    def get_best_match(
        self,
        global_ingredient: GlobalIngredient,
        restaurant_id: int,
        db: Session
    ) -> Optional[Dict]:
        """
        Get the best match for an ingredient (highest confidence)
        Returns None if no acceptable match found
        """
        matches = self.find_matches(global_ingredient, restaurant_id, db)
        
        if not matches:
            return None
        
        best_match = matches[0]
        
        # Only return if confidence is above low threshold
        if best_match['similarity_score'] >= self.LOW_CONFIDENCE:
            return best_match
        
        return None
    
    def get_mapping_suggestions(
        self,
        global_ingredient_ids: List[int],
        restaurant_id: int,
        db: Session
    ) -> Dict[int, List[Dict]]:
        """
        Get mapping suggestions for multiple global ingredients
        
        Returns:
        {
            global_ingredient_id: [
                {matches in order of confidence}
            ]
        }
        """
        suggestions = {}
        
        for global_ing_id in global_ingredient_ids:
            # Fetch global ingredient
            global_ingredient = db.query(GlobalIngredient).filter(
                GlobalIngredient.id == global_ing_id
            ).first()
            
            if global_ingredient:
                matches = self.find_matches(global_ingredient, restaurant_id, db)
                suggestions[global_ing_id] = matches
        
        return suggestions


def create_missing_ingredient(
    global_ingredient: GlobalIngredient,
    restaurant_id: int,
    db: Session
) -> Ingredient:
    """
    Create a new ingredient in restaurant inventory based on global ingredient
    """
    new_ingredient = Ingredient(
        restaurant_id=restaurant_id,
        name=global_ingredient.name,
        category=global_ingredient.category,
        unit=global_ingredient.standard_unit,
        quantity=0.0,  # Start with zero stock
        min_quantity=10.0,  # Default minimum
        cost_per_unit=global_ingredient.avg_cost_per_unit,
        supplier=None,
        expiry_date=None,
        storage_location=None
    )
    
    db.add(new_ingredient)
    db.flush()  # Get the ID
    
    return new_ingredient


def validate_stock_availability(
    ingredient_id: int,
    required_quantity: float,
    db: Session
) -> Tuple[bool, float, str]:
    """
    Check if ingredient has sufficient stock
    
    Returns:
    (has_enough: bool, available_quantity: float, warning_message: str)
    """
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    
    if not ingredient:
        return (False, 0.0, "Ingredient not found")
    
    if ingredient.quantity >= required_quantity:
        return (True, ingredient.quantity, "")
    
    warning = f"Low stock: {ingredient.name} ({ingredient.quantity}{ingredient.unit} available, {required_quantity}{ingredient.unit} needed)"
    return (False, ingredient.quantity, warning)


# Singleton instance
ingredient_matcher = IngredientMatcher()
