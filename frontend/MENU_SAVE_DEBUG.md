# Menu Item Save Error - DEBUGGING GUIDE

## Issue
When trying to add a menu item in Manager Dashboard, getting error: **"Failed to save menu item"**

## Fixes Applied

### 1. Restaurant ID Fix
**Problem**: Code was hardcoding `restaurantId = 1` instead of using user's actual restaurant ID

**Fixed locations**:
- `handleSaveMenuItem()` - Now uses `user?.restaurant_id || 1`
- `handleDeleteMenuItem()` - Now uses `user?.restaurant_id || 1`
- `loadMenuData()` - Now uses `user?.restaurant_id || 1`
- `loadDashboardData()` - Now uses `user?.restaurant_id || 1`
- `handleSaveStaff()` - Now uses `user?.restaurant_id || 1`

### 2. Better Error Logging
Added console.error to show actual error details:
```javascript
catch (error) {
  console.error('Save menu error:', error);
  const errorMsg = error.response?.data?.detail || 'Failed to save menu item';
  toast.error(errorMsg);
}
```

## How to Debug

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try adding a menu item
4. Look for error message starting with "Save menu error:"

### Step 2: Check Network Tab
1. Open DevTools Network tab
2. Try adding menu item
3. Look for POST request to `/api/v1/restaurants/{id}/menu`
4. Check:
   - Request URL - Should show correct restaurant ID
   - Request Payload - Should contain all form data
   - Response - Shows actual error from backend

### Step 3: Check Backend Logs
Run in terminal:
```powershell
cd "C:\Users\91862\OneDrive\Desktop\mini project\backend"
# Check if backend is running
Get-Process -Name "python" -ErrorAction SilentlyContinue
```

### Step 4: Verify User Data
Check if user object has restaurant_id:
1. In browser console, type: `localStorage.getItem('access_token')`
2. Decode JWT token at https://jwt.io
3. Check if payload contains `restaurant_id`

## Common Errors & Solutions

### Error: "401 Unauthorized"
**Cause**: Token expired or invalid
**Solution**: 
1. Log out and log back in
2. Check if token exists: `localStorage.getItem('access_token')`

### Error: "404 Not Found"
**Cause**: Restaurant ID doesn't exist
**Solution**:
1. Check user's restaurant_id in auth response
2. Verify restaurant exists in database

### Error: "422 Unprocessable Entity"
**Cause**: Invalid data format
**Solution**:
1. Check form data being sent
2. Verify all required fields are filled
3. Check price is a valid number

### Error: "500 Internal Server Error"
**Cause**: Backend database or logic error
**Solution**:
1. Check backend terminal for Python error traceback
2. Verify database connection
3. Check if database tables exist

## Test Data for Menu Item
Use this to test:
```json
{
  "name": "Test Pizza",
  "description": "Delicious test pizza",
  "price": 12.99,
  "category": "Main Course",
  "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
  "available": true
}
```

## Verification Steps
After fixes, test:
1. ✅ Can add new menu item
2. ✅ Can edit existing menu item
3. ✅ Can delete menu item
4. ✅ Menu items display correctly
5. ✅ No console errors
6. ✅ Success toast appears

## Backend API Endpoint
```
POST   /api/v1/restaurants/{restaurant_id}/menu
PUT    /api/v1/restaurants/{restaurant_id}/menu/{item_id}
DELETE /api/v1/restaurants/{restaurant_id}/menu/{item_id}
GET    /api/v1/restaurants/{restaurant_id}/menu
```

## Next Steps
1. Try adding menu item again
2. Check browser console for detailed error
3. Check Network tab for API response
4. If still failing, check backend logs
5. Verify database has required data

---
**Status**: Fixes applied, awaiting user testing  
**Date**: October 13, 2025
