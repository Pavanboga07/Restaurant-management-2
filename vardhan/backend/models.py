"""
Database Models for Face Recognition Attendance System
Creates and manages SQLite database for students and attendance records
"""

import sqlite3
import pickle
from datetime import datetime
import os

DATABASE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'attendance.db')

def init_database():
    """Initialize the SQLite database with required tables"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Create students table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            face_encoding BLOB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create attendance table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            subject TEXT NOT NULL,
            date DATE NOT NULL,
            time_in TIME NOT NULL,
            time_out TIME,
            FOREIGN KEY (student_id) REFERENCES students(student_id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print(f"Database initialized at {DATABASE_PATH}")

def add_student(student_id, name, face_encoding=None):
    """Add a new student to the database"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Serialize face encoding if provided (handle numpy arrays properly)
        encoding_blob = None
        if face_encoding is not None:
            encoding_blob = pickle.dumps(face_encoding)
        
        cursor.execute('''
            INSERT INTO students (student_id, name, face_encoding)
            VALUES (?, ?, ?)
        ''', (student_id, name, encoding_blob))
        
        conn.commit()
        conn.close()
        return True
    except sqlite3.IntegrityError:
        return False

def update_student_encoding(student_id, face_encoding):
    """Update face encoding for existing student"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    encoding_blob = pickle.dumps(face_encoding)
    
    cursor.execute('''
        UPDATE students
        SET face_encoding = ?
        WHERE student_id = ?
    ''', (encoding_blob, student_id))
    
    conn.commit()
    conn.close()

def get_student(student_id):
    """Retrieve student information by ID"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT student_id, name, face_encoding, created_at
        FROM students
        WHERE student_id = ?
    ''', (student_id,))
    
    result = cursor.fetchone()
    conn.close()
    
    if result:
        return {
            'student_id': result[0],
            'name': result[1],
            'face_encoding': pickle.loads(result[2]) if result[2] else None,
            'created_at': result[3]
        }
    return None

def get_all_students():
    """Retrieve all students from database"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT student_id, name, face_encoding, created_at
        FROM students
    ''')
    
    results = cursor.fetchall()
    conn.close()
    
    students = []
    for row in results:
        students.append({
            'student_id': row[0],
            'name': row[1],
            'face_encoding': pickle.loads(row[2]) if row[2] else None,
            'created_at': row[3]
        })
    
    return students

def mark_attendance(student_id, subject, date=None, time_in=None):
    """Mark attendance for a student"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    if date is None:
        date = datetime.now().strftime('%Y-%m-%d')
    if time_in is None:
        time_in = datetime.now().strftime('%H:%M:%S')
    
    # Check for duplicate attendance
    cursor.execute('''
        SELECT id FROM attendance
        WHERE student_id = ? AND subject = ? AND date = ?
    ''', (student_id, subject, date))
    
    if cursor.fetchone():
        conn.close()
        return False  # Already marked
    
    cursor.execute('''
        INSERT INTO attendance (student_id, subject, date, time_in)
        VALUES (?, ?, ?, ?)
    ''', (student_id, subject, date, time_in))
    
    conn.commit()
    conn.close()
    return True

def get_attendance_by_subject(subject, date=None):
    """Retrieve attendance records for a specific subject"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    if date:
        cursor.execute('''
            SELECT a.student_id, s.name, a.subject, a.date, a.time_in, a.time_out
            FROM attendance a
            JOIN students s ON a.student_id = s.student_id
            WHERE a.subject = ? AND a.date = ?
            ORDER BY a.time_in
        ''', (subject, date))
    else:
        cursor.execute('''
            SELECT a.student_id, s.name, a.subject, a.date, a.time_in, a.time_out
            FROM attendance a
            JOIN students s ON a.student_id = s.student_id
            WHERE a.subject = ?
            ORDER BY a.date DESC, a.time_in
        ''', (subject,))
    
    results = cursor.fetchall()
    conn.close()
    
    attendance_records = []
    for row in results:
        attendance_records.append({
            'student_id': row[0],
            'name': row[1],
            'subject': row[2],
            'date': row[3],
            'time_in': row[4],
            'time_out': row[5]
        })
    
    return attendance_records

def get_all_attendance():
    """Retrieve all attendance records"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT a.student_id, s.name, a.subject, a.date, a.time_in, a.time_out
        FROM attendance a
        JOIN students s ON a.student_id = s.student_id
        ORDER BY a.date DESC, a.time_in DESC
    ''')
    
    results = cursor.fetchall()
    conn.close()
    
    attendance_records = []
    for row in results:
        attendance_records.append({
            'student_id': row[0],
            'name': row[1],
            'subject': row[2],
            'date': row[3],
            'time_in': row[4],
            'time_out': row[5]
        })
    
    return attendance_records

# Initialize database on module import
if not os.path.exists(os.path.dirname(DATABASE_PATH)):
    os.makedirs(os.path.dirname(DATABASE_PATH))
init_database()
