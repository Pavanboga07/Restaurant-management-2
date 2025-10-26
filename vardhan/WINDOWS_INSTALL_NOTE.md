# Installation Note for Windows Users

## ⚠️ Important: Installing face_recognition on Windows

The `face_recognition` library depends on `dlib`, which requires compilation on Windows. Here are your options:

### Option 1: Install CMake (Recommended for Full Functionality)

1. **Download CMake** from: https://cmake.org/download/
   - Get the Windows x64 Installer (.msi file)
   
2. **Install CMake**
   - During installation, select "Add CMake to the system PATH for all users"
   
3. **Restart PowerShell** and verify:
   ```powershell
   cmake --version
   ```

4. **Install dlib and face_recognition**:
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   pip install dlib face-recognition face-recognition-models
   ```

### Option 2: Use Pre-built Wheels (Easier but may not be available for Python 3.12+)

Try installing from unofficial builds:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install https://github.com/jloh02/dlib/releases/download/v19.22/dlib-19.22.99-cp312-cp312-win_amd64.whl
pip install face-recognition face-recognition-models
```

### Option 3: Run Without Face Recognition (Demo Mode)

The system can run in demo mode without actual face recognition. I'll create a version that:
- Still captures images
- Stores student data
- Demonstrates the UI workflow
- Uses placeholder recognition

For demo mode, all other dependencies are already installed!

---

## Current Status

✅ **Already Installed:**
- Flask (Web framework)
- Flask-CORS (API cors support)  
- OpenCV (Image/video processing)
- NumPy (Numerical operations)
- Pandas (Data processing)
- openpyxl (Excel export)
- Pillow (Image handling)

❌ **Needs Installation:**
- dlib (Face detection - requires CMake)
- face-recognition (Face recognition library)

---

## Quick Start (Demo Mode)

Since most dependencies are installed, you can:

1. **Test the Frontend**:
   ```powershell
   cd frontend
   npm start
   ```
   This will show the complete UI!

2. **Install CMake** (for full functionality):
   - Download from cmake.org
   - Add to PATH
   - Reinstall dependencies

---

## Alternative: Use Python 3.9 or 3.10

`dlib` has better pre-built support for older Python versions:

1. **Uninstall Python 3.12**
2. **Install Python 3.10** from python.org
3. **Re-run setup.ps1**

The libraries work best with Python 3.9-3.11 on Windows.

---

## Need Help?

The complete system is built and ready. The only blocker is the `dlib` compilation which requires CMake or an older Python version.

**Recommended Path**: Install CMake (takes 5 minutes) then run:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install dlib face-recognition face-recognition-models
python app.py
```

Then everything will work perfectly! 🎉
