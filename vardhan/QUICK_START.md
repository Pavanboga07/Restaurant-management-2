# Quick Start Guide - Face Recognition Attendance System

## 🚀 Get Started in 5 Minutes

### Prerequisites Check
- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Webcam available
- [ ] PowerShell access

### Step 1: Setup (First Time Only)

Open PowerShell in the project directory and run:

```powershell
.\setup.ps1
```

This will:
- Create Python virtual environment
- Install all backend dependencies
- Install all frontend dependencies

**Note**: Setup may take 5-10 minutes depending on your internet connection.

### Step 2: Start Backend

Open a PowerShell terminal and run:

```powershell
.\start-backend.ps1
```

Wait for the message: "Running on http://localhost:5000"

### Step 3: Start Frontend

Open a **new** PowerShell terminal and run:

```powershell
.\start-frontend.ps1
```

The browser will automatically open at http://localhost:3000

### Step 4: Use the System

#### First Time Setup:

1. **Register Students** (Register page)
   - Enter Student ID and Name
   - Click "Start Capturing Images"
   - Wait for 50 images to be captured
   - Click "Register Student"

2. **Train Model** (Training page)
   - Click "Train Model"
   - Wait for success message

3. **Mark Attendance** (Mark Attendance page)
   - Enter subject name
   - Click "Start Camera"
   - Click "Mark Attendance"
   - See recognized students!

4. **View Records** (View Attendance page)
   - Filter by subject or date
   - Export to Excel

---

## 📝 Common Commands

### Backend Commands:
```powershell
# Navigate to backend
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run backend
python app.py

# Deactivate virtual environment
deactivate
```

### Frontend Commands:
```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

---

## 🔧 Troubleshooting Quick Fixes

### Problem: "Python not found"
**Solution**: Install Python from python.org, check "Add to PATH"

### Problem: "Node not found"
**Solution**: Install Node.js from nodejs.org

### Problem: "Virtual environment activation failed"
**Solution**: Run PowerShell as Administrator, then run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problem: "dlib installation failed"
**Solution**: Install Visual C++ Build Tools from Microsoft, then run setup again

### Problem: "Webcam not working"
**Solution**: 
1. Grant camera permissions in Windows Settings
2. Close other apps using the camera
3. Try a different browser (Chrome recommended)

### Problem: "CORS error in browser"
**Solution**: 
1. Ensure backend is running on port 5000
2. Restart both servers
3. Clear browser cache

---

## 📊 Test the System

### Quick Test Scenario:

1. **Register 2 Test Students**:
   - Student ID: TEST001, Name: Alice
   - Student ID: TEST002, Name: Bob

2. **Train the Model**:
   - Should show "2 students trained"

3. **Mark Attendance**:
   - Subject: "Demo Class"
   - Should recognize your face

4. **View Records**:
   - Filter by "Demo Class"
   - Export to Excel

---

## 🎯 Important URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **API Reference**: See API_REFERENCE.md

---

## 📁 Key Files

- `README.md` - Full documentation
- `API_REFERENCE.md` - API endpoint details
- `PROJECT_SUMMARY.md` - Complete project overview
- `backend/app.py` - Backend server
- `frontend/src/App.js` - Frontend application

---

## 🆘 Need Help?

1. Check README.md for detailed instructions
2. Check API_REFERENCE.md for API details
3. Check PROJECT_SUMMARY.md for feature list
4. Review error messages in terminal
5. Check browser console for frontend errors

---

## ✅ Success Checklist

After setup, you should see:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Browser opens automatically
- [ ] Navigation menu visible
- [ ] No errors in terminals
- [ ] Webcam access granted

If all checked, you're ready to use the system! 🎉

---

## 🔄 Daily Use

Once setup is complete, to use the system daily:

1. Run `.\start-backend.ps1`
2. Run `.\start-frontend.ps1` (in new terminal)
3. Use the application
4. Press Ctrl+C in both terminals to stop

---

**Happy Attendance Tracking!** 📸✨
