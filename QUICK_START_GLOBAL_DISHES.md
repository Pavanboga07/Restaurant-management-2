# 🚀 Quick Start Guide - Global Dish Library

**Ready to test your new feature in 5 minutes!**

---

## ⚡ Quick Start (5 Steps)

### Step 1: Start Backend (30 seconds)
```powershell
cd "C:\Users\91862\OneDrive\Desktop\mini project\backend"
python main.py
```

✅ **Expected Output**:
```
🚀 Starting Multi-Tenant Restaurant Management System...
📊 Database: postgresql://...
🔒 Environment: development
INFO:     Application startup complete.
```

🌐 **Backend URL**: http://localhost:8000

---

### Step 2: Start Frontend (30 seconds)
```powershell
cd "C:\Users\91862\OneDrive\Desktop\mini project\frontend"
npm run dev
```

✅ **Expected Output**:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

🌐 **Frontend URL**: http://localhost:5173

---

### Step 3: Login as Manager (1 minute)

1. Open http://localhost:5173
2. Login with:
   - **Email**: Your manager account
   - **Password**: Your password
   
   (If no account, register as "manager" role)

---

### Step 4: Access Global Library (1 minute)

1. Look for **"Global Library"** in the navbar
2. Click it (Sparkles ✨ icon)
3. You should see:
   - Search bar
   - Filter options
   - Grid of 29 dishes

---

### Step 5: Add Your First Dish (2 minutes)

1. **Search** for "Chicken Biryani"
2. **Click** "Add to Menu" button
3. **Preview** opens showing:
   - Ingredient mapping
   - Stock availability
   - Profit margin
4. **Set price** (e.g., ₹299)
5. **Click** "Confirm & Add to Menu"
6. **Success!** Toast notification appears
7. **Go to Menu** page - dish is there!

---

## 🧪 Test Scenarios

### Scenario 1: Search & Filter
```
1. Type "biryani" in search
2. Results show biryani dishes
3. Select "Main Course" category
4. Results filter to main courses
5. Select "Indian" cuisine
6. Results show Indian main courses
```

### Scenario 2: Preview Before Adding
```
1. Click any dish's "Add to Menu"
2. Preview modal opens
3. See ingredient list:
   - Green items = Already in inventory
   - Yellow items = Will be created
4. Change price if needed
5. Review profit margin
6. Cancel or Confirm
```

### Scenario 3: Complete Addition
```
1. Find "Paneer Tikka"
2. Click "Add to Menu"
3. Set price: ₹250
4. Click "Confirm & Add"
5. Wait for success message
6. Navigate to Menu page
7. Verify "Paneer Tikka" appears
8. Check ingredients are mapped
```

---

## 📸 What You'll See

### Main Page:
```
┌─────────────────────────────────────────────────────┐
│  ✨ Global Dish Library          [Filters]          │
│  Browse and add popular dishes...                    │
├─────────────────────────────────────────────────────┤
│  [🔍 Search dishes...]                              │
├─────────────────────────────────────────────────────┤
│  29 dishes found                                     │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Biryani  │  │  Tikka   │  │  Butter  │         │
│  │ [Image]  │  │ [Image]  │  │ [Image]  │         │
│  │ ₹250     │  │  ₹200    │  │  ₹180    │         │
│  │ [+ Add]  │  │ [+ Add]  │  │ [+ Add]  │         │
│  └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────────────────────────────────────┘
```

### Preview Modal:
```
┌─────────────────────────────────────────────────────┐
│  Chicken Biryani                             [×]    │
│  Indian • Main Course                               │
├─────────────────────────────────────────────────────┤
│  Set Price: [___299___]  (Suggested: ₹250)        │
│                                                     │
│  Ingredient Mapping Preview:                        │
│  ┌───────────────────────────────────────────────┐ │
│  │ 🟢 Basmati Rice → Basmati Rice (100% match)  │ │
│  │ 🟢 Chicken → Chicken Breast (95% match)      │ │
│  │ 🟡 Biryani Masala → Will be created          │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [Cancel]          [✓ Confirm & Add to Menu]       │
└─────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Problem: Backend won't start
**Solution**:
```powershell
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill the process if needed
taskkill /PID <process_id> /F

# Restart backend
python main.py
```

### Problem: Frontend won't start
**Solution**:
```powershell
# Install dependencies
npm install

# Start dev server
npm run dev
```

### Problem: "Global Library" link not visible
**Solution**:
- Make sure you're logged in as **Manager** or **Admin**
- Customer/Staff roles can't see this link
- Check user role in navbar (top right)

### Problem: No dishes showing
**Solution**:
1. Check backend is running (http://localhost:8000/health)
2. Check browser console for errors
3. Verify you're logged in
4. Try refreshing the page

### Problem: Can't add dish
**Solutions**:
- Make sure price is entered
- Check you have restaurant_id in user profile
- Check backend logs for errors
- Verify backend database connection

---

## 📊 API Endpoints to Test

### Test with PowerShell:

```powershell
# 1. Health Check
Invoke-RestMethod -Uri "http://localhost:8000/health"

# 2. Get Auth Token (replace credentials)
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" `
  -Method Post -Body (@{username="manager@test.com"; password="test123"} | ConvertTo-Json) `
  -ContentType "application/json"
$token = $loginResponse.access_token

# 3. Search Global Dishes
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/global-dishes/search?limit=5" `
  -Headers @{Authorization="Bearer $token"}

# 4. Get Categories
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/global-dishes/categories" `
  -Headers @{Authorization="Bearer $token"}

# 5. Preview Mapping
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/restaurants/1/preview-mapping/1" `
  -Headers @{Authorization="Bearer $token"}

# 6. Add Dish to Menu
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/restaurants/1/add-from-global/1" `
  -Method Post -Body '{"price_override":299}' `
  -ContentType "application/json" -Headers @{Authorization="Bearer $token"}
```

---

## ✅ Success Checklist

After completing the quick start:

- [ ] Backend running without errors
- [ ] Frontend running on localhost:5173
- [ ] Logged in as Manager/Admin
- [ ] "Global Library" link visible in navbar
- [ ] Can see list of 29 dishes
- [ ] Search works (e.g., "biryani")
- [ ] Filters work (category, cuisine)
- [ ] Preview modal opens when clicking "Add to Menu"
- [ ] Can see ingredient mapping preview
- [ ] Can set custom price
- [ ] Successfully added at least one dish
- [ ] Dish appears in Menu page
- [ ] Ingredients are mapped correctly

---

## 🎉 You're All Set!

Your Global Dish Library feature is ready to use. Enjoy adding dishes with one click! 🚀

---

**Need Help?**
- Check `FRONTEND_GLOBAL_DISHES_COMPLETE.md` for detailed documentation
- Check `ASYNC_TO_SYNC_COMPLETE.md` for backend fixes
- Check backend logs for API errors
- Check browser console for frontend errors
