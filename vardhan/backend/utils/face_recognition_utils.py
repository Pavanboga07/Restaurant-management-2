"""
Face Recognition Utilities
Handles face detection, encoding generation, and face comparison
"""

import cv2
import numpy as np
import os
import pickle
from pathlib import Path

# Try to import face_recognition, use fallback if not available
try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
    print("WARNING: face_recognition library not installed. Using demo mode.")
    print("To enable full functionality, install: pip install dlib face-recognition")

ENCODINGS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'encodings.pkl')
TRAINING_IMAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'TrainingImage')

def capture_training_images(student_id, num_images=50):
    """
    Capture training images from webcam for a student
    
    Args:
        student_id: Unique student identifier
        num_images: Number of images to capture (default: 50)
    
    Returns:
        List of captured image arrays
    """
    images = []
    video_capture = cv2.VideoCapture(0)
    
    # Create student directory
    student_dir = os.path.join(TRAINING_IMAGE_DIR, str(student_id))
    os.makedirs(student_dir, exist_ok=True)
    
    count = 0
    frame_skip = 0
    
    print(f"Starting image capture for student {student_id}")
    
    while count < num_images:
        ret, frame = video_capture.read()
        if not ret:
            break
        
        # Process every 3rd frame to allow movement
        frame_skip += 1
        if frame_skip % 3 != 0:
            continue
        
        # Resize for faster processing
        small_frame = cv2.resize(frame, (640, 480))
        
        # Detect faces
        face_locations = face_recognition.face_locations(small_frame, model="hog")
        
        if len(face_locations) > 0:
            # Save the image
            image_path = os.path.join(student_dir, f"{student_id}_{count}.jpg")
            cv2.imwrite(image_path, small_frame)
            images.append(small_frame)
            count += 1
            print(f"Captured image {count}/{num_images}")
    
    video_capture.release()
    print(f"Successfully captured {count} images for student {student_id}")
    
    return images

def generate_face_encodings(image_path_or_array):
    """
    Generate 128-dimensional face encoding from an image
    
    Args:
        image_path_or_array: Path to image file or numpy array
    
    Returns:
        Face encoding array or None if no face detected
    """
    if not FACE_RECOGNITION_AVAILABLE:
        # Demo mode: return random encoding
        return np.random.rand(128)
    
    if isinstance(image_path_or_array, str):
        image = face_recognition.load_image_file(image_path_or_array)
    else:
        image = image_path_or_array
    
    # Find face locations
    face_locations = face_recognition.face_locations(image, model="hog")
    
    if len(face_locations) == 0:
        return None
    
    # Generate encoding for first detected face
    encodings = face_recognition.face_encodings(image, face_locations)
    
    if len(encodings) > 0:
        return encodings[0]
    
    return None

def generate_encodings_from_images(student_id, images):
    """
    Generate multiple face encodings from a list of images and average them
    
    Args:
        student_id: Student identifier
        images: List of image arrays
    
    Returns:
        Averaged face encoding
    """
    encodings = []
    
    for idx, image in enumerate(images):
        encoding = generate_face_encodings(image)
        # Use 'is not None' check properly for numpy arrays
        if encoding is not None:
            try:
                if len(encoding) > 0:
                    encodings.append(encoding)
            except:
                encodings.append(encoding)
    
    if len(encodings) == 0:
        return None
    
    # Average all encodings for better accuracy
    avg_encoding = np.mean(encodings, axis=0)
    return avg_encoding

def train_model():
    """
    Train the face recognition model by processing all images in TrainingImage folder
    Uses OpenCV LBPH if face_recognition library is not available
    
    Returns:
        Dictionary with training results
    """
    encodings_data = {
        'encodings': [],
        'student_ids': [],
        'names': []
    }
    
    if not os.path.exists(TRAINING_IMAGE_DIR):
        return {'success': False, 'message': 'Training image directory not found'}
    
    student_folders = [f for f in os.listdir(TRAINING_IMAGE_DIR) 
                      if os.path.isdir(os.path.join(TRAINING_IMAGE_DIR, f))]
    
    if len(student_folders) == 0:
        return {'success': False, 'message': 'No student data found'}
    
    trained_count = 0
    
    # If face_recognition is not available, use OpenCV LBPH
    if not FACE_RECOGNITION_AVAILABLE:
        print("Using OpenCV LBPH Face Recognizer for training...")
        recognizer = cv2.face.LBPHFaceRecognizer_create()
        
        faces = []
        labels = []
        label_map = {}  # Map label IDs to student IDs
        current_label = 0
        
        for student_folder in student_folders:
            student_path = os.path.join(TRAINING_IMAGE_DIR, student_folder)
            image_files = [f for f in os.listdir(student_path) 
                          if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            
            if len(image_files) == 0:
                continue
            
            label_map[current_label] = student_folder
            student_face_count = 0
            
            for image_file in image_files:
                image_path = os.path.join(student_path, image_file)
                img = cv2.imread(image_path)
                
                if img is None:
                    continue
                
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                
                # Detect face in the image
                face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                face_coords = face_cascade.detectMultiScale(gray, 1.1, 4)
                
                # Use the largest detected face
                if len(face_coords) > 0:
                    x, y, w, h = max(face_coords, key=lambda rect: rect[2] * rect[3])  # Largest face
                    face_roi = gray[y:y+h, x:x+w]
                    face_roi = cv2.resize(face_roi, (200, 200))  # Normalize size
                    faces.append(face_roi)
                    labels.append(current_label)
                    student_face_count += 1
            
            if student_face_count > 0:
                encodings_data['student_ids'].append(student_folder)
                encodings_data['names'].append(student_folder)
                trained_count += 1
                print(f"Trained {student_face_count} images for student: {student_folder}")
                current_label += 1
        
        if len(faces) == 0:
            return {'success': False, 'message': 'No faces detected in training images'}
        
        # Train the recognizer
        recognizer.train(faces, np.array(labels))
        
        # Save the model
        model_path = os.path.join(os.path.dirname(ENCODINGS_FILE), 'face_model.yml')
        recognizer.save(model_path)
        print(f"Saved OpenCV model to: {model_path}")
        
        # Save encodings data (student IDs and names mapping)
        with open(ENCODINGS_FILE, 'wb') as f:
            pickle.dump(encodings_data, f)
        
        return {
            'success': True,
            'message': f'Successfully trained OpenCV model for {trained_count} students with {len(faces)} images',
            'total_students': trained_count,
            'total_images': len(faces),
            'model_type': 'OpenCV LBPH'
        }
    
    # Original face_recognition library code
    for student_folder in student_folders:
        student_path = os.path.join(TRAINING_IMAGE_DIR, student_folder)
        image_files = [f for f in os.listdir(student_path) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        if len(image_files) == 0:
            continue
        
        student_encodings = []
        
        for image_file in image_files:
            image_path = os.path.join(student_path, image_file)
            encoding = generate_face_encodings(image_path)
            
            if encoding is not None:
                student_encodings.append(encoding)
        
        if len(student_encodings) > 0:
            # Average all encodings for this student
            avg_encoding = np.mean(student_encodings, axis=0)
            encodings_data['encodings'].append(avg_encoding)
            encodings_data['student_ids'].append(student_folder)
            encodings_data['names'].append(student_folder)  # Will be updated with actual names from DB
            trained_count += 1
            print(f"Trained model for student: {student_folder}")
    
    # Save encodings to pickle file
    with open(ENCODINGS_FILE, 'wb') as f:
        pickle.dump(encodings_data, f)
    
    return {
        'success': True,
        'message': f'Successfully trained model for {trained_count} students',
        'total_students': trained_count
    }

def load_encodings():
    """
    Load face encodings from pickle file
    
    Returns:
        Dictionary with encodings, student_ids, and names
    """
    if not os.path.exists(ENCODINGS_FILE):
        return None
    
    with open(ENCODINGS_FILE, 'rb') as f:
        encodings_data = pickle.load(f)
    
    return encodings_data

def recognize_faces(frame, tolerance=0.6):
    """
    Recognize faces in a frame using stored encodings
    
    Args:
        frame: Image frame (numpy array)
        tolerance: Face comparison tolerance (lower is stricter)
    
    Returns:
        List of dictionaries with recognized student info and face locations
    """
    if not FACE_RECOGNITION_AVAILABLE:
        # OpenCV-based face recognition using LBPH
        encodings_data = load_encodings()
        
        if encodings_data is None or len(encodings_data.get('student_ids', [])) == 0:
            return []
        
        # Detect faces using Haar Cascade
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        recognized_faces = []
        
        # Use OpenCV's LBPH face recognizer
        recognizer = cv2.face.LBPHFaceRecognizer_create()
        
        # Check if we have trained model
        model_path = os.path.join(os.path.dirname(ENCODINGS_FILE), 'face_model.yml')
        if not os.path.exists(model_path):
            # No trained model, return detected but unrecognized faces
            for (x, y, w, h) in faces:
                recognized_faces.append({
                    'student_id': "Unknown",
                    'name': "Unknown - Please train the model first",
                    'confidence': 0.0,
                    'location': {'top': int(y), 'right': int(x+w), 'bottom': int(y+h), 'left': int(x)}
                })
            return recognized_faces
        
        recognizer.read(model_path)
        
        for (x, y, w, h) in faces:
            face_roi = gray[y:y+h, x:x+w]
            
            # Predict the face
            label, confidence = recognizer.predict(face_roi)
            
            # Lower confidence value means better match in OpenCV LBPH
            # Typical good match is < 50-70, anything > 100 is likely wrong
            if confidence < 70:  # Threshold for accepting recognition
                student_id = encodings_data['student_ids'][label]
                name = encodings_data['names'][label]
                match_confidence = 1.0 - (confidence / 100.0)  # Convert to 0-1 scale
            else:
                student_id = "Unknown"
                name = "Unknown"
                match_confidence = 0.0
            
            recognized_faces.append({
                'student_id': student_id,
                'name': name,
                'confidence': float(match_confidence),
                'location': {'top': int(y), 'right': int(x+w), 'bottom': int(y+h), 'left': int(x)}
            })
        
        return recognized_faces
    
    encodings_data = load_encodings()
    
    if encodings_data is None or len(encodings_data['encodings']) == 0:
        return []
    
    # Resize frame for faster processing
    small_frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
    rgb_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
    
    # Find faces in current frame
    face_locations = face_recognition.face_locations(rgb_frame, model="hog")
    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
    
    recognized_faces = []
    
    for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
        # Compare with known encodings
        matches = face_recognition.compare_faces(
            encodings_data['encodings'],
            face_encoding,
            tolerance=tolerance
        )
        
        face_distances = face_recognition.face_distance(
            encodings_data['encodings'],
            face_encoding
        )
        
        student_id = "Unknown"
        name = "Unknown"
        confidence = 0
        
        if True in matches:
            best_match_index = np.argmin(face_distances)
            if matches[best_match_index]:
                student_id = encodings_data['student_ids'][best_match_index]
                name = encodings_data['names'][best_match_index]
                confidence = 1 - face_distances[best_match_index]
        
        # Scale back up face locations
        top *= 2
        right *= 2
        bottom *= 2
        left *= 2
        
        recognized_faces.append({
            'student_id': student_id,
            'name': name,
            'confidence': float(confidence),
            'location': {'top': top, 'right': right, 'bottom': bottom, 'left': left}
        })
    
    return recognized_faces

def detect_faces_in_frame(frame):
    """
    Detect faces in a frame without recognition
    
    Args:
        frame: Image frame (numpy array)
    
    Returns:
        List of face locations
    """
    if not FACE_RECOGNITION_AVAILABLE:
        # Use OpenCV Haar Cascade as fallback
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        scaled_locations = []
        for (x, y, w, h) in faces:
            scaled_locations.append({
                'top': int(y),
                'right': int(x + w),
                'bottom': int(y + h),
                'left': int(x)
            })
        return scaled_locations
    
    small_frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
    rgb_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
    
    face_locations = face_recognition.face_locations(rgb_frame, model="hog")
    
    # Scale back up
    scaled_locations = []
    for (top, right, bottom, left) in face_locations:
        scaled_locations.append({
            'top': top * 2,
            'right': right * 2,
            'bottom': bottom * 2,
            'left': left * 2
        })
    
    return scaled_locations

def save_encodings_to_file(encodings_data, filepath=None):
    """
    Save encodings data to pickle file
    
    Args:
        encodings_data: Dictionary with encodings, student_ids, and names
        filepath: Custom filepath (optional)
    """
    if filepath is None:
        filepath = ENCODINGS_FILE
    
    with open(filepath, 'wb') as f:
        pickle.dump(encodings_data, f)
