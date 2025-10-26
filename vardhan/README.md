# Face Recognition Attendance System - MVP Prototype

A complete full-stack web-based attendance management system using facial recognition technology. Built with Flask (Python) backend and React frontend.

## 🌟 Features

### Backend Features
- **Student Registration**: Capture 30-50 face images via webcam and generate 128-dimensional face encodings
- **Model Training**: Process images and create face recognition model with pickle storage
- **Attendance Marking**: Real-time face detection and recognition with duplicate prevention
- **Attendance Management**: CSV storage and Excel export capabilities
- **REST API**: Full RESTful API with CORS support

### Frontend Features
- **Registration Interface**: Webcam integration with live face capture and progress tracking
- **Training Dashboard**: Model training trigger with status display
- **Attendance Marking**: Live webcam feed with real-time face recognition overlay
- **Reports View**: Filterable tables with Excel export and statistics dashboard
- **Responsive Design**: Bootstrap-based UI that works on desktop and mobile

## 📁 Project Structure

```
project/
├── backend/
│   ├── app.py                          # Flask main application
│   ├── models.py                       # Database models
│   ├── requirements.txt                # Python dependencies
│   ├── utils/
│   │   ├── face_recognition_utils.py   # Face recognition functions
│   │   └── attendance_utils.py         # Attendance data processing
│   ├── TrainingImage/                  # Face images storage
│   ├── encodings.pkl                   # Trained face encodings
│   └── attendance_records/             # CSV attendance files
├── frontend/
│   ├── package.json                    # Node dependencies
│   ├── public/
│   │   └── index.html                  # HTML template
│   └── src/
│       ├── App.js                      # Main React component
│       ├── App.css                     # Global styles
│       ├── index.js                    # React entry point
│       └── components/
│           ├── Register.js             # Student registration
│           ├── Training.js             # Model training
│           ├── MarkAttendance.js       # Attendance marking
│           └── ViewAttendance.js       # Reports view
└── database/
    └── attendance.db                   # SQLite database
```

## 🚀 Installation Instructions

### Prerequisites
- Python 3.8 or higher
- Node.js 16+ and npm
- Webcam/camera access
- Windows/Linux/macOS

### Backend Setup

1. **Navigate to backend directory**
   ```powershell
   cd backend
   ```

2. **Create virtual environment (recommended)**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. **Install Python dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

   **Note for Windows users**: If you encounter issues installing `dlib` or `face-recognition`, you may need to:
   - Install CMake: `pip install cmake`
   - Install Visual C++ Build Tools from Microsoft
   - Alternatively, use pre-compiled wheels from [https://github.com/ageitgey/face_recognition_models](https://github.com/ageitgey/face_recognition_models)

4. **Run the Flask backend**
   ```powershell
   python app.py
   ```

   The backend server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal)
   ```powershell
   cd frontend
   ```

2. **Install Node.js dependencies**
   ```powershell
   npm install
   ```

3. **Start the React development server**
   ```powershell
   npm start
   ```

   The frontend will open automatically at `http://localhost:3000`

## 📖 Usage Guide

### 1. Register Students

1. Navigate to the **Register** page
2. Enter Student ID (unique) and Student Name
3. Click "Start Capturing Images"
4. The system will automatically capture 50 images from your webcam
5. Move your head slightly during capture for better training data
6. Click "Register Student" to save

**Best Practices:**
- Ensure good lighting
- Face the camera directly
- Avoid glasses or face coverings if possible
- Allow slight head movement during capture

### 2. Train the Model

1. Navigate to the **Training** page
2. Verify the number of registered students
3. Click "Train Model" button
4. Wait for training to complete (10-30 seconds)
5. Check the success message showing total students trained

**Note:** Re-train the model whenever you register new students.

### 3. Mark Attendance

1. Navigate to the **Mark Attendance** page
2. Enter the subject name (e.g., "Mathematics")
3. Click "Start Camera" to activate webcam
4. Position students in front of the camera
5. Click "Mark Attendance" to capture and recognize faces
6. View recognized students with confidence scores
7. System prevents duplicate attendance for the same day

### 4. View Attendance Records

1. Navigate to the **View Attendance** page
2. Use filters to select specific subject and/or date
3. Click "Apply Filter" or view all records
4. View statistics dashboard showing:
   - Total present
   - Unique students
   - Subject breakdown
   - Date breakdown
5. Click "Export to Excel" to download attendance data

## 🔌 API Endpoints

### Student Management
- `POST /api/register` - Register new student with face images
- `GET /api/students` - Get all registered students

### Model Training
- `POST /api/train` - Train face recognition model

### Attendance
- `POST /api/mark-attendance` - Mark attendance with face recognition
- `GET /api/attendance/<subject>` - Get attendance for specific subject
- `GET /api/attendance/all` - Get all attendance records

### Utilities
- `GET /api/subjects` - Get list of all subjects
- `GET /api/dates` - Get list of all dates with records
- `GET /api/health` - Health check and model status
- `POST /api/detect-faces` - Detect faces without recognition

## 🧪 Testing Checklist

### Registration Testing
- [ ] Register 3-5 test students with different names
- [ ] Test with different lighting conditions
- [ ] Verify images are saved in `TrainingImage/<student_id>/`
- [ ] Check duplicate student ID prevention
- [ ] Confirm face encodings stored in database

### Training Testing
- [ ] Train model with registered students
- [ ] Verify `encodings.pkl` file is created
- [ ] Check training completion message
- [ ] Test re-training after adding new students

### Attendance Testing
- [ ] Mark attendance with recognized faces
- [ ] Test with unrecognized faces
- [ ] Verify CSV file creation in `attendance_records/`
- [ ] Confirm duplicate prevention for same day
- [ ] Check attendance timestamps accuracy
- [ ] Test with multiple faces in single frame

### Reporting Testing
- [ ] View all attendance records
- [ ] Filter by specific subject
- [ ] Filter by specific date
- [ ] Export to Excel and verify file
- [ ] Check statistics calculation accuracy
- [ ] Test with empty records

### Browser Compatibility
- [ ] Chrome/Edge (recommended)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (responsive design)

## 🛠️ Technical Specifications

### Backend Technologies
- **Flask 2.3.3** - Web framework
- **Flask-CORS 4.0.0** - Cross-origin resource sharing
- **OpenCV 4.8.0** - Video capture and image processing
- **face_recognition 1.3.0** - Face detection and encoding
- **dlib 19.24.2** - Machine learning toolkit
- **NumPy 1.24.3** - Numerical computing
- **Pandas 2.0.3** - Data analysis
- **openpyxl 3.1.2** - Excel file generation
- **SQLite3** - Database

### Frontend Technologies
- **React 18.2.0** - UI framework
- **React Router DOM 6.15.0** - Routing
- **React Webcam 7.1.1** - Webcam integration
- **Axios 1.5.0** - HTTP client
- **Bootstrap 5.3.1** - CSS framework
- **React Bootstrap 2.8.0** - Bootstrap components

### Performance Optimizations
- Frame skipping (processes every 3rd frame)
- Frame resizing to 640x480 for faster processing
- HOG model for faster face detection
- In-memory encoding caching
- Threading for non-blocking video capture

### Security Features
- Input validation for all endpoints
- Duplicate attendance prevention
- Sanitized file paths
- CORS policies
- Base64 image encoding for secure transmission

## 📊 Expected Performance

- **Face Recognition Accuracy**: 85%+ (with good lighting and proper registration)
- **Recognition Speed**: ~1-2 seconds per frame
- **Training Time**: 10-30 seconds (depends on number of students)
- **Capture Time**: ~10 seconds for 50 images
- **Database Size**: Minimal (encodings are compressed)
- **CSV File Size**: ~1KB per 10 students per day

## 🐛 Troubleshooting

### Backend Issues

**Problem**: `dlib` installation fails
**Solution**: 
- Install CMake: `pip install cmake`
- Install Visual Studio Build Tools
- Use pre-compiled wheels: `pip install dlib-binary`

**Problem**: Camera not accessible
**Solution**:
- Check camera permissions in system settings
- Ensure no other application is using the camera
- Try different camera index in OpenCV

**Problem**: Face not detected
**Solution**:
- Ensure good lighting
- Face camera directly
- Remove glasses or face coverings
- Increase image capture count

### Frontend Issues

**Problem**: CORS errors
**Solution**:
- Ensure Flask-CORS is installed
- Check backend is running on port 5000
- Verify proxy setting in `package.json`

**Problem**: Webcam not loading
**Solution**:
- Grant camera permissions in browser
- Use HTTPS or localhost only
- Check browser compatibility

**Problem**: Images not uploading
**Solution**:
- Check network connection
- Verify backend is running
- Check browser console for errors

## 🔒 Privacy & Data Protection

- Face encodings are mathematical representations, not actual images
- Images stored locally in `TrainingImage` folder
- No cloud storage or external API calls
- SQLite database stored locally
- All data remains on your system

## 📝 Future Enhancements

- [ ] User authentication and role-based access
- [ ] Real-time video streaming for continuous monitoring
- [ ] Mobile app (React Native)
- [ ] Email notifications for attendance reports
- [ ] Integration with existing school management systems
- [ ] Multiple camera support
- [ ] Advanced analytics and insights
- [ ] Attendance percentage calculation
- [ ] Automated backup and restore
- [ ] Dark mode UI

## 📄 License

This project is created for educational and demonstration purposes.

## 👨‍💻 Support

For issues, questions, or contributions:
1. Check the troubleshooting section
2. Review the testing checklist
3. Ensure all dependencies are correctly installed
4. Verify camera permissions are granted

## 🙏 Acknowledgments

- **face_recognition** library by Adam Geitgey
- **dlib** library by Davis King
- **OpenCV** community
- **React** and **Flask** communities

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Status**: MVP Prototype - Fully Functional

---

## Quick Start Commands

### Start Backend (PowerShell)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

### Start Frontend (PowerShell)
```powershell
cd frontend
npm install
npm start
```

Access the application at: **http://localhost:3000**

API documentation available at: **http://localhost:5000/api/health**
