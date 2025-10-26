"""
Flask Backend Application for Face Recognition Attendance System
Main application with REST API endpoints
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
import base64
from datetime import datetime
import os
import sys

# Add utils to path
sys.path.append(os.path.dirname(__file__))

from models import (
    add_student, update_student_encoding, get_student, 
    get_all_students, mark_attendance as db_mark_attendance,
    get_attendance_by_subject, get_all_attendance
)
from utils.face_recognition_utils import (
    capture_training_images, generate_face_encodings,
    generate_encodings_from_images, train_model,
    recognize_faces, detect_faces_in_frame, load_encodings
)
from utils.attendance_utils import (
    save_attendance_to_csv, read_attendance_csv,
    export_to_excel, get_attendance_statistics,
    get_available_subjects, get_available_dates,
    get_all_attendance_records, filter_attendance_by_date_range
)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size
app.config['TRAINING_IMAGE_DIR'] = os.path.join(os.path.dirname(__file__), 'TrainingImage')
app.config['ATTENDANCE_DIR'] = os.path.join(os.path.dirname(__file__), 'attendance_records')

# Helper function to decode base64 image
def decode_base64_image(base64_string):
    """Decode base64 string to numpy array image"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

# ===== STUDENT REGISTRATION ENDPOINT =====
@app.route('/api/register', methods=['POST'])
def register_student():
    """
    Register a new student with face images
    Accepts: student_id, name, and array of base64 encoded images
    """
    try:
        data = request.get_json()
        
        student_id = data.get('student_id')
        name = data.get('name')
        images_base64 = data.get('images', [])
        
        # Validate input
        if not student_id or not name:
            return jsonify({
                'success': False,
                'message': 'Student ID and name are required'
            }), 400
        
        if len(images_base64) < 10:
            return jsonify({
                'success': False,
                'message': 'At least 10 images are required for registration'
            }), 400
        
        # Check if student already exists
        existing_student = get_student(student_id)
        if existing_student:
            return jsonify({
                'success': False,
                'message': 'Student ID already exists'
            }), 409
        
        # Create student directory
        student_dir = os.path.join(app.config['TRAINING_IMAGE_DIR'], student_id)
        os.makedirs(student_dir, exist_ok=True)
        
        # Process and save images
        saved_images = []
        for idx, img_base64 in enumerate(images_base64):
            img = decode_base64_image(img_base64)
            if img is not None:
                img_path = os.path.join(student_dir, f"{student_id}_{idx}.jpg")
                cv2.imwrite(img_path, img)
                saved_images.append(img)
        
        if len(saved_images) == 0:
            return jsonify({
                'success': False,
                'message': 'No valid images could be processed'
            }), 400
        
        # Generate face encoding
        face_encoding = generate_encodings_from_images(student_id, saved_images)
        
        # Check if encoding was generated (use proper numpy array check)
        if face_encoding is None or (isinstance(face_encoding, np.ndarray) and face_encoding.size == 0):
            return jsonify({
                'success': False,
                'message': 'Could not detect faces in the provided images'
            }), 400
        
        # Add student to database
        success = add_student(student_id, name, face_encoding)
        
        if not success:
            return jsonify({
                'success': False,
                'message': 'Failed to add student to database'
            }), 500
        
        return jsonify({
            'success': True,
            'message': f'Student {name} registered successfully',
            'student_id': student_id,
            'images_saved': len(saved_images)
        }), 201
        
    except Exception as e:
        import traceback
        print(f"Error in register_student: {e}")
        print("Full traceback:")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500

# ===== MODEL TRAINING ENDPOINT =====
@app.route('/api/train', methods=['POST'])
def train_recognition_model():
    """
    Train the face recognition model using all stored images
    Processes images from TrainingImage folder and creates encodings.pkl
    """
    try:
        # Run training
        result = train_model()
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        print(f"Error in train_recognition_model: {e}")
        return jsonify({
            'success': False,
            'message': f'Training failed: {str(e)}'
        }), 500

# ===== ATTENDANCE MARKING ENDPOINT =====
@app.route('/api/mark-attendance', methods=['POST'])
def mark_attendance():
    """
    Mark attendance by recognizing faces in the provided image
    Accepts: subject name and base64 encoded image from webcam
    """
    try:
        data = request.get_json()
        
        subject = data.get('subject')
        image_base64 = data.get('image')
        
        # Validate input
        if not subject:
            return jsonify({
                'success': False,
                'message': 'Subject name is required'
            }), 400
        
        if not image_base64:
            return jsonify({
                'success': False,
                'message': 'Image is required'
            }), 400
        
        # Decode image
        frame = decode_base64_image(image_base64)
        if frame is None:
            return jsonify({
                'success': False,
                'message': 'Invalid image data'
            }), 400
        
        # Recognize faces
        recognized_faces = recognize_faces(frame, tolerance=0.6)
        
        if len(recognized_faces) == 0:
            return jsonify({
                'success': False,
                'message': 'No faces detected in the image'
            }), 400
        
        # Mark attendance for recognized students
        marked_students = []
        duplicate_students = []
        unknown_faces = []
        
        current_date = datetime.now().strftime('%Y-%m-%d')
        current_time = datetime.now().strftime('%H:%M:%S')
        
        for face in recognized_faces:
            student_id = face['student_id']
            
            if student_id == "Unknown":
                unknown_faces.append(face)
                continue
            
            # Get student info from database
            student = get_student(student_id)
            if not student:
                unknown_faces.append(face)
                continue
            
            # Mark attendance in database
            db_success = db_mark_attendance(student_id, subject, current_date, current_time)
            
            # Mark attendance in CSV
            csv_success = save_attendance_to_csv(
                student_id, 
                student['name'], 
                subject, 
                current_date, 
                current_time
            )
            
            if db_success and csv_success:
                marked_students.append({
                    'student_id': student_id,
                    'name': student['name'],
                    'confidence': face['confidence'],
                    'time': current_time
                })
            else:
                duplicate_students.append({
                    'student_id': student_id,
                    'name': student['name'],
                    'message': 'Attendance already marked for today'
                })
        
        return jsonify({
            'success': True,
            'message': f'Processed {len(recognized_faces)} face(s)',
            'marked_students': marked_students,
            'duplicate_students': duplicate_students,
            'unknown_faces': len(unknown_faces),
            'date': current_date,
            'time': current_time
        }), 200
        
    except Exception as e:
        print(f"Error in mark_attendance: {e}")
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500

# ===== ATTENDANCE VIEWING ENDPOINTS =====
@app.route('/api/attendance/<subject>', methods=['GET'])
def get_attendance(subject):
    """
    Get attendance records for a specific subject
    Query params: date (optional), export (optional - 'excel')
    """
    try:
        date = request.args.get('date')
        export_format = request.args.get('export')
        
        # Get attendance records from CSV
        records = read_attendance_csv(subject, date)
        
        if export_format == 'excel':
            # Export to Excel
            excel_file = export_to_excel(records, subject)
            if excel_file:
                return send_file(
                    excel_file,
                    mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    as_attachment=True,
                    download_name=os.path.basename(excel_file)
                )
            else:
                return jsonify({
                    'success': False,
                    'message': 'No records to export'
                }), 404
        
        # Get statistics
        stats = get_attendance_statistics(subject, date)
        
        return jsonify({
            'success': True,
            'subject': subject,
            'date': date,
            'records': records,
            'statistics': stats
        }), 200
        
    except Exception as e:
        print(f"Error in get_attendance: {e}")
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/attendance/all', methods=['GET'])
def get_all_attendance_records_endpoint():
    """
    Get all attendance records across all subjects
    Query params: export (optional - 'excel'), start_date, end_date
    """
    try:
        export_format = request.args.get('export')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Get all records
        records = get_all_attendance_records()
        
        # Filter by date range if provided
        if start_date and end_date:
            records = filter_attendance_by_date_range(records, start_date, end_date)
        
        if export_format == 'excel':
            # Export to Excel
            excel_file = export_to_excel(records)
            if excel_file:
                return send_file(
                    excel_file,
                    mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    as_attachment=True,
                    download_name=os.path.basename(excel_file)
                )
            else:
                return jsonify({
                    'success': False,
                    'message': 'No records to export'
                }), 404
        
        # Get statistics
        stats = get_attendance_statistics()
        
        return jsonify({
            'success': True,
            'records': records,
            'statistics': stats,
            'total_records': len(records)
        }), 200
        
    except Exception as e:
        print(f"Error in get_all_attendance_records: {e}")
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500

# ===== UTILITY ENDPOINTS =====
@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    """Get list of all subjects with attendance records"""
    try:
        subjects = get_available_subjects()
        return jsonify({
            'success': True,
            'subjects': subjects
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/dates', methods=['GET'])
def get_dates():
    """Get list of all dates with attendance records"""
    try:
        subject = request.args.get('subject')
        dates = get_available_dates(subject)
        return jsonify({
            'success': True,
            'dates': dates
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/students', methods=['GET'])
def get_students():
    """Get list of all registered students"""
    try:
        students = get_all_students()
        # Remove face encodings from response (too large)
        students_list = [
            {
                'student_id': s['student_id'],
                'name': s['name'],
                'created_at': s['created_at']
            }
            for s in students
        ]
        return jsonify({
            'success': True,
            'students': students_list,
            'total': len(students_list)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/detect-faces', methods=['POST'])
def detect_faces():
    """
    Detect faces in an image without recognition
    Useful for registration interface
    """
    try:
        data = request.get_json()
        image_base64 = data.get('image')
        
        if not image_base64:
            return jsonify({
                'success': False,
                'message': 'Image is required'
            }), 400
        
        frame = decode_base64_image(image_base64)
        if frame is None:
            return jsonify({
                'success': False,
                'message': 'Invalid image data'
            }), 400
        
        face_locations = detect_faces_in_frame(frame)
        
        return jsonify({
            'success': True,
            'faces_detected': len(face_locations),
            'locations': face_locations
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# ===== HEALTH CHECK ENDPOINT =====
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    encodings = load_encodings()
    return jsonify({
        'status': 'healthy',
        'message': 'Face Recognition Attendance System API',
        'model_trained': encodings is not None,
        'total_students': len(encodings['student_ids']) if encodings else 0
    }), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("Face Recognition Attendance System - Backend Server")
    print("=" * 60)
    print(f"Server starting on http://localhost:5000")
    print(f"Training images directory: {app.config['TRAINING_IMAGE_DIR']}")
    print(f"Attendance records directory: {app.config['ATTENDANCE_DIR']}")
    print("=" * 60)
    
    # Run Flask app
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
