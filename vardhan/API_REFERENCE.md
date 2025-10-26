# API Reference Guide

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### 1. Health Check
**GET** `/health`

Check API status and model information.

**Response:**
```json
{
  "status": "healthy",
  "message": "Face Recognition Attendance System API",
  "model_trained": true,
  "total_students": 5
}
```

---

### 2. Register Student
**POST** `/register`

Register a new student with face images.

**Request Body:**
```json
{
  "student_id": "STU001",
  "name": "John Doe",
  "images": ["base64_image_1", "base64_image_2", ...]
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Student John Doe registered successfully",
  "student_id": "STU001",
  "images_saved": 50
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Student ID already exists"
}
```

---

### 3. Train Model
**POST** `/train`

Train the face recognition model.

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully trained model for 5 students",
  "total_students": 5
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "No student data found"
}
```

---

### 4. Mark Attendance
**POST** `/mark-attendance`

Mark attendance by recognizing faces.

**Request Body:**
```json
{
  "subject": "Mathematics",
  "image": "base64_encoded_image"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Processed 2 face(s)",
  "marked_students": [
    {
      "student_id": "STU001",
      "name": "John Doe",
      "confidence": 0.85,
      "time": "10:30:45"
    }
  ],
  "duplicate_students": [
    {
      "student_id": "STU002",
      "name": "Jane Smith",
      "message": "Attendance already marked for today"
    }
  ],
  "unknown_faces": 0,
  "date": "2025-10-16",
  "time": "10:30:45"
}
```

---

### 5. Get Attendance by Subject
**GET** `/attendance/<subject>`

Retrieve attendance records for a specific subject.

**Query Parameters:**
- `date` (optional): Filter by specific date (YYYY-MM-DD)
- `export` (optional): Set to "excel" for Excel download

**Examples:**
```
GET /api/attendance/Mathematics
GET /api/attendance/Mathematics?date=2025-10-16
GET /api/attendance/Mathematics?export=excel
```

**Response (JSON):**
```json
{
  "success": true,
  "subject": "Mathematics",
  "date": null,
  "records": [
    {
      "Student_ID": "STU001",
      "Name": "John Doe",
      "Subject": "Mathematics",
      "Date": "2025-10-16",
      "Time_In": "10:30:45"
    }
  ],
  "statistics": {
    "total_present": 10,
    "unique_students": 8,
    "subject_breakdown": {"Mathematics": 10},
    "date_breakdown": {"2025-10-16": 10}
  }
}
```

**Response (Excel):**
Returns Excel file download.

---

### 6. Get All Attendance
**GET** `/attendance/all`

Retrieve all attendance records.

**Query Parameters:**
- `export` (optional): Set to "excel" for Excel download
- `start_date` (optional): Filter start date (YYYY-MM-DD)
- `end_date` (optional): Filter end date (YYYY-MM-DD)

**Examples:**
```
GET /api/attendance/all
GET /api/attendance/all?export=excel
GET /api/attendance/all?start_date=2025-10-01&end_date=2025-10-31
```

**Response:**
```json
{
  "success": true,
  "records": [...],
  "statistics": {...},
  "total_records": 50
}
```

---

### 7. Get All Students
**GET** `/students`

Retrieve list of all registered students.

**Response:**
```json
{
  "success": true,
  "students": [
    {
      "student_id": "STU001",
      "name": "John Doe",
      "created_at": "2025-10-16 10:00:00"
    }
  ],
  "total": 5
}
```

---

### 8. Get All Subjects
**GET** `/subjects`

Get list of all subjects with attendance records.

**Response:**
```json
{
  "success": true,
  "subjects": ["Mathematics", "Physics", "Chemistry"]
}
```

---

### 9. Get All Dates
**GET** `/dates`

Get list of all dates with attendance records.

**Query Parameters:**
- `subject` (optional): Filter dates by subject

**Examples:**
```
GET /api/dates
GET /api/dates?subject=Mathematics
```

**Response:**
```json
{
  "success": true,
  "dates": ["2025-10-16", "2025-10-15", "2025-10-14"]
}
```

---

### 10. Detect Faces
**POST** `/detect-faces`

Detect faces in an image without recognition.

**Request Body:**
```json
{
  "image": "base64_encoded_image"
}
```

**Response:**
```json
{
  "success": true,
  "faces_detected": 2,
  "locations": [
    {
      "top": 100,
      "right": 250,
      "bottom": 300,
      "left": 50
    }
  ]
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created (for registration)
- `400` - Bad Request (invalid input)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

---

## Image Encoding Format

All images should be sent as Base64 encoded strings:

```javascript
// JavaScript example
const imageBase64 = webcamRef.current.getScreenshot();
// Returns: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
```

The backend accepts both formats:
- With prefix: `data:image/jpeg;base64,<base64_data>`
- Without prefix: `<base64_data>`

---

## Rate Limiting

Currently no rate limiting is implemented. For production use, consider implementing rate limiting.

---

## CORS

CORS is enabled for all origins in development. For production, configure specific allowed origins in `app.py`:

```python
CORS(app, origins=["http://localhost:3000", "https://yourdomain.com"])
```

---

## Authentication

Currently no authentication is implemented. For production use, add JWT or session-based authentication.

---

## Testing the API

### Using cURL (PowerShell):

**Health Check:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
```

**Get Students:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/students" -Method Get
```

**Get Subjects:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/subjects" -Method Get
```

### Using Postman:

1. Import the endpoints
2. Set `Content-Type: application/json`
3. Use the request body examples above

### Using Frontend:

The React frontend automatically handles all API calls through Axios.

---

## Database Schema

### Students Table:
```sql
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    face_encoding BLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Attendance Table:
```sql
CREATE TABLE attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    date DATE NOT NULL,
    time_in TIME NOT NULL,
    time_out TIME,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);
```

---

## File Storage

### Training Images:
```
backend/TrainingImage/<student_id>/<student_id>_<index>.jpg
```

### Encodings:
```
backend/encodings.pkl
```

### Attendance CSV:
```
backend/attendance_records/<subject>_<date>.csv
```

### Excel Exports:
```
backend/attendance_records/<subject>_attendance_<timestamp>.xlsx
```

---

## Performance Tips

1. **Image Size**: Smaller images process faster. The system resizes to 640x480 automatically.
2. **Lighting**: Good lighting improves recognition accuracy significantly.
3. **Training**: Retrain the model whenever you add new students.
4. **Tolerance**: Default 0.6 tolerance works well. Lower = stricter matching.
5. **Frame Skipping**: Processing every 3rd frame balances speed and accuracy.

---

## Troubleshooting

**Problem**: "No faces detected"
- Ensure good lighting
- Face camera directly
- Check if model is trained

**Problem**: "Failed to register student"
- Check if student_id already exists
- Ensure at least 10 images provided
- Verify face is visible in images

**Problem**: "Unrecognized face"
- Retrain the model after registration
- Check lighting conditions
- Verify student is registered

---

For more information, see the main README.md file.
