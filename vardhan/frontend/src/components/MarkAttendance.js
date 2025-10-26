import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function MarkAttendance() {
  const [subject, setSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [recognizedStudents, setRecognizedStudents] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  const webcamRef = useRef(null);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  useEffect(() => {
    fetchSubjects();
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/subjects`);
      if (response.data.success) {
        setSubjects(response.data.subjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleMarkAttendance = async () => {
    if (!subject) {
      setMessage({ type: 'warning', text: 'Please enter a subject name' });
      return;
    }

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      setMessage({ type: 'danger', text: 'Failed to capture image from webcam' });
      return;
    }

    setIsProcessing(true);
    setMessage({ type: 'info', text: 'Processing... Recognizing faces...' });

    try {
      const response = await axios.post(`${API_URL}/mark-attendance`, {
        subject: subject,
        image: imageSrc
      });

      if (response.data.success) {
        const { marked_students, duplicate_students, unknown_faces } = response.data;
        
        // Update recognized students list
        setRecognizedStudents(prev => [
          ...marked_students.map(s => ({ ...s, status: 'new' })),
          ...duplicate_students.map(s => ({ ...s, status: 'duplicate' })),
          ...prev
        ]);

        // Construct success message
        let messageText = '';
        if (marked_students.length > 0) {
          messageText += `✓ Attendance marked for ${marked_students.length} student(s). `;
        }
        if (duplicate_students.length > 0) {
          messageText += `${duplicate_students.length} already marked today. `;
        }
        if (unknown_faces > 0) {
          messageText += `${unknown_faces} unrecognized face(s). `;
        }
        if (marked_students.length === 0 && unknown_faces > 0) {
          messageText = 'No recognized students found in the image.';
        }

        setMessage({ 
          type: marked_students.length > 0 ? 'success' : 'warning', 
          text: messageText 
        });
        
        // Refresh subjects list
        fetchSubjects();
      } else {
        setMessage({ type: 'danger', text: response.data.message });
      }
    } catch (error) {
      console.error('Attendance marking error:', error);
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Failed to mark attendance. Please try again.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow">
            <div className="card-header bg-warning text-dark">
              <h4 className="mb-0">
                <i className="bi bi-camera me-2"></i>
                Mark Attendance
              </h4>
            </div>
            <div className="card-body">
              
              {/* Date and Time Display */}
              <div className="alert alert-info text-center">
                <h5 className="mb-0">
                  <i className="bi bi-clock me-2"></i>
                  {formatDateTime(currentDateTime)}
                </h5>
              </div>

              {message.text && (
                <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                  {message.text}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setMessage({ type: '', text: '' })}
                  ></button>
                </div>
              )}

              {/* Subject Selection */}
              <div className="mb-4">
                <label className="form-label">
                  <strong>Subject Name</strong>
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter subject name (e.g., Mathematics, Physics)"
                    list="subjects-list"
                    disabled={isProcessing}
                  />
                  <datalist id="subjects-list">
                    {subjects.map((subj, idx) => (
                      <option key={idx} value={subj} />
                    ))}
                  </datalist>
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setShowWebcam(!showWebcam)}
                    disabled={!subject}
                  >
                    {showWebcam ? (
                      <>
                        <i className="bi bi-camera-video-off me-1"></i>
                        Stop Camera
                      </>
                    ) : (
                      <>
                        <i className="bi bi-camera-video me-1"></i>
                        Start Camera
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Webcam Feed */}
              {showWebcam && (
                <div className="text-center mb-4">
                  <div className="webcam-container mb-3">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                      className="border rounded"
                    />
                  </div>
                  
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleMarkAttendance}
                    disabled={isProcessing || !subject}
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Mark Attendance
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Recognized Students List */}
              {recognizedStudents.length > 0 && (
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">
                      <i className="bi bi-people me-2"></i>
                      Recognized Students
                    </h5>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setRecognizedStudents([])}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Clear List
                    </button>
                  </div>
                  
                  <div className="row">
                    {recognizedStudents.map((student, idx) => (
                      <div key={idx} className="col-md-6 mb-3">
                        <div className={`card student-card ${
                          student.status === 'new' ? 'border-success' : 'border-warning'
                        }`}>
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="card-title mb-1">
                                  {student.name}
                                  {student.status === 'new' && (
                                    <i className="bi bi-check-circle-fill text-success ms-2"></i>
                                  )}
                                </h6>
                                <p className="card-text mb-1">
                                  <small className="text-muted">
                                    ID: <span className="badge bg-secondary">{student.student_id}</span>
                                  </small>
                                </p>
                                {student.confidence && (
                                  <p className="card-text mb-1">
                                    <small className="text-muted">
                                      Confidence: {(student.confidence * 100).toFixed(1)}%
                                    </small>
                                  </p>
                                )}
                                <p className="card-text mb-0">
                                  <small className="text-muted">
                                    <i className="bi bi-clock me-1"></i>
                                    {student.time || new Date().toLocaleTimeString()}
                                  </small>
                                </p>
                              </div>
                              <div>
                                {student.status === 'new' ? (
                                  <span className="badge bg-success">Marked</span>
                                ) : (
                                  <span className="badge bg-warning text-dark">Already Marked</span>
                                )}
                              </div>
                            </div>
                            {student.message && (
                              <div className="alert alert-warning mb-0 mt-2 py-1 px-2 small">
                                {student.message}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-4 p-3 bg-light rounded">
                <h6 className="text-muted mb-2">
                  <i className="bi bi-lightbulb me-2"></i>
                  Instructions:
                </h6>
                <ul className="mb-0 text-muted small">
                  <li>Enter the subject name for which you want to mark attendance</li>
                  <li>Click "Start Camera" to activate your webcam</li>
                  <li>Position students in front of the camera</li>
                  <li>Click "Mark Attendance" to capture and recognize faces</li>
                  <li>The system will automatically identify registered students</li>
                  <li>Duplicate attendance entries for the same day are prevented</li>
                  <li>Ensure good lighting for best recognition accuracy</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarkAttendance;
