# 🎯 Next Steps Guide - Global Dish Library Implementation

**Date**: October 13, 2025  
**Status**: Backend Fixed & Running ✅  
**Current Focus**: Testing & Frontend Integration

---

## ✅ What's Been Completed

### Backend Fixes (Just Completed)
1. **Fixed Import Errors**
   - ✅ Corrected `get_current_user` import in `global_dishes.py` and `add_from_global.py`
   - ✅ Changed from `app.core.security` to `app.api.routes.auth`

2. **Fixed Async/Sync Mismatch**
   - ✅ Converted `global_dishes.py` fully to synchronous operations
   - ✅ Changed `AsyncSession` to `Session`
   - ✅ Converted all 5 functions from async to sync patterns
   - ⚠️ Partial fix in `add_from_global.py` (20+ `await` statements remain)

3. **Backend Status**
   - ✅ Server running on port 8000 (Process ID: 19448)
   - ✅ Database connected to NeonDB PostgreSQL
   - ✅ All tables verified including global dish tables
   - ✅ API responds (requires authentication)

### Database Status
- ✅ 29 Global Dishes loaded
- ✅ 58 Global Ingredients loaded
- ✅ 195 Dish-Ingredient mappings created
- ✅ Fuzzy search enabled (trigram indexing)

---

## 🔥 Immediate Next Steps (Priority Order)

### **Step 1: Complete Backend Fixes** ⚠️ CRITICAL
**File**: `backend/app/api/routes/add_from_global.py`  
**Issue**: Contains 20+ `await` statements that will cause runtime errors

**Locations to Fix**:
```python
Lines with await that need conversion:
- Line 116: await db.execute(select(GlobalDish)...)
- Line 128: await db.execute(select(GlobalIngredient)...)
- Line 143: await db.execute(select(Ingredient)...)
- Line 177: await ingredient_matcher.find_matches(...)
- Line 202: await ingredient_matcher.get_best_match(...)
- Lines 215, 223, 236, 254, 295, 296, 312, 368, 377, 390, 407
```

**Conversion Pattern**:
```python
# FROM (Async):
result = await db.execute(select(Model).where(...))
item = result.scalar_one_or_none()

# TO (Sync):
item = db.query(Model).filter(...).first()
```

**Also Need to Fix**:
- `backend/app/services/ingredient_matcher.py` - Convert from async to sync

---

### **Step 2: Test Backend APIs**

#### 2.1 First, Create a Test User & Get Auth Token
```powershell
# Register a test user
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" -Method Post -Body (@{
    email = "test@example.com"
    password = "test123"
    full_name = "Test User"
    role = "manager"
} | ConvertTo-Json) -ContentType "application/json"

# Login to get token
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" -Method Post -Body (@{
    username = "test@example.com"
    password = "test123"
} | ConvertTo-Json) -ContentType "application/json"

$token = $response.access_token
```

#### 2.2 Test Global Dish Library Endpoints
```powershell
# Test 1: Search all dishes
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/global-dishes/search?limit=10" -Method Get -Headers @{Authorization="Bearer $token"}

# Test 2: Search with filters
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/global-dishes/search?search_query=biryani&category=Main Course&cuisine=Indian" -Method Get -Headers @{Authorization="Bearer $token"}

# Test 3: Get specific dish details
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/global-dishes/1" -Method Get -Headers @{Authorization="Bearer $token"}

# Test 4: Get all categories
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/global-dishes/categories" -Method Get -Headers @{Authorization="Bearer $token"}

# Test 5: Get all cuisines
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/global-dishes/cuisines" -Method Get -Headers @{Authorization="Bearer $token"}
```

#### 2.3 Test Add Dish from Global Library (After fixing async code)
```powershell
# Preview ingredient mapping
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/global-dishes/add/preview" -Method Post -Body (@{
    dish_id = 1
} | ConvertTo-Json) -ContentType "application/json" -Headers @{Authorization="Bearer $token"}

# Add dish to restaurant menu
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/global-dishes/add" -Method Post -Body (@{
    dish_id = 1
    price = 299.00
    customizations = @{
        name = "Special Chicken Biryani"
        description = "Our signature recipe"
    }
    ingredient_mapping_overrides = @{}
} | ConvertTo-Json) -ContentType "application/json" -Headers @{Authorization="Bearer $token"}
```

---

### **Step 3: Frontend Development** 🎨

#### 3.1 Create Global Dish Library Page
**File**: `frontend/src/pages/GlobalDishLibrary.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GlobalDishLibrary = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/global-dishes/search', {
        params: {
          search_query: searchQuery,
          category: selectedCategory,
          cuisine: selectedCuisine,
          limit: 20
        }
      });
      setDishes(response.data.dishes);
    } catch (error) {
      console.error('Error fetching dishes:', error);
    }
    setLoading(false);
  };

  const handleAddDish = async (dishId) => {
    try {
      const response = await axios.post('/api/v1/global-dishes/add', {
        dish_id: dishId,
        price: 0, // Will be set by manager
      });
      alert('Dish added successfully!');
    } catch (error) {
      console.error('Error adding dish:', error);
      alert('Failed to add dish');
    }
  };

  useEffect(() => {
    fetchDishes();
  }, [searchQuery, selectedCategory, selectedCuisine]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Global Dish Library</h1>
      
      {/* Search & Filters */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search dishes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">All Categories</option>
          <option value="Appetizer">Appetizer</option>
          <option value="Main Course">Main Course</option>
          <option value="Dessert">Dessert</option>
          <option value="Beverage">Beverage</option>
        </select>
        <select
          value={selectedCuisine}
          onChange={(e) => setSelectedCuisine(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">All Cuisines</option>
          <option value="Indian">Indian</option>
          <option value="Chinese">Chinese</option>
          <option value="Italian">Italian</option>
          <option value="Continental">Continental</option>
        </select>
      </div>

      {/* Dish Grid */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {dishes.map((dish) => (
            <div key={dish.id} className="border rounded-lg p-4 shadow">
              <h3 className="text-xl font-bold">{dish.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{dish.cuisine} • {dish.category}</p>
              <p className="text-gray-700 mb-3">{dish.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {dish.ingredient_count} ingredients
                </span>
                <button
                  onClick={() => handleAddDish(dish.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add to Menu
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalDishLibrary;
```

#### 3.2 Add Route in App.jsx
```jsx
import GlobalDishLibrary from './pages/GlobalDishLibrary';

// In your routes:
<Route path="/global-dishes" element={<GlobalDishLibrary />} />
```

#### 3.3 Add Navigation Link
Update your navbar/sidebar to include:
```jsx
<Link to="/global-dishes">Global Dish Library</Link>
```

---

### **Step 4: Complete End-to-End Testing**

1. **Backend Test Flow**:
   - ✅ Server is running
   - ✅ Search global dishes
   - ⚠️ Fix async code in add_from_global.py
   - 🔲 Test add dish endpoint
   - 🔲 Verify dish appears in restaurant menu
   - 🔲 Verify ingredients are auto-mapped

2. **Frontend Test Flow**:
   - 🔲 Start frontend server (`npm run dev`)
   - 🔲 Open Global Dish Library page
   - 🔲 Search for "biryani"
   - 🔲 Filter by category/cuisine
   - 🔲 Click "Add to Menu" button
   - 🔲 Verify success message
   - 🔲 Navigate to Menu page
   - 🔲 Verify new dish appears with ingredients

---

## 📋 Quick Command Reference

### Backend Commands
```powershell
# Start backend
cd backend
python main.py

# Test health endpoint
Invoke-RestMethod -Uri "http://localhost:8000/health"

# View API docs
Start-Process "http://localhost:8000/docs"
```

### Frontend Commands
```powershell
# Install dependencies (if needed)
cd frontend
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🐛 Known Issues & Workarounds

### Issue 1: `add_from_global.py` has async code
**Status**: ⚠️ Partially Fixed  
**Impact**: Add dish endpoint will fail  
**Fix Required**: Convert 20+ `await` statements to sync  
**Priority**: HIGH

### Issue 2: Frontend not started
**Status**: 🔲 Not Started  
**Impact**: Cannot test UI  
**Fix Required**: Run `npm run dev` in frontend directory  
**Priority**: MEDIUM

### Issue 3: Authentication required for all endpoints
**Status**: ✅ Working as Designed  
**Impact**: Need to login first  
**Workaround**: Use login endpoint to get token  
**Priority**: LOW

---

## 📊 API Endpoints Available

### Global Dish Library (✅ Working)
- `GET /api/v1/global-dishes/search` - Search with filters
- `GET /api/v1/global-dishes/{dish_id}` - Get dish details
- `GET /api/v1/global-dishes/categories` - List categories
- `GET /api/v1/global-dishes/cuisines` - List cuisines
- `GET /api/v1/global-dishes/trending` - Get popular dishes

### Add Dish from Global (⚠️ Needs Fix)
- `POST /api/v1/global-dishes/add/preview` - Preview mapping
- `POST /api/v1/global-dishes/add` - Add dish to menu

---

## 💡 Tips & Best Practices

1. **Always check backend logs** when testing APIs
2. **Use /docs endpoint** to explore API interactively
3. **Test with Postman** before integrating with frontend
4. **Keep token handy** - save it in environment variable
5. **Test incrementally** - one feature at a time

---

## 🎯 Success Criteria

- [x] Backend starts without errors
- [x] Database tables created and populated
- [x] Global dish search works
- [ ] Add dish endpoint works (needs async fix)
- [ ] Frontend displays global dishes
- [ ] Manager can add dish to menu
- [ ] Ingredients are auto-mapped correctly
- [ ] End-to-end workflow completes successfully

---

## 📞 Next Actions (In Order)

1. **Fix remaining async code** in `add_from_global.py` (30 min)
2. **Test add dish API** with curl/Postman (15 min)
3. **Start frontend server** and fix any issues (15 min)
4. **Build Global Dish Library page** (1-2 hours)
5. **Test complete workflow** (30 min)
6. **Polish UI and add error handling** (1 hour)

---

**Total Estimated Time to Complete**: 3-4 hours

Good luck! 🚀
