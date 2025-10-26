import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function Register() {
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [capturedImages, setCapturedImages] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  
  const webcamRef = useRef(null);
  const captureIntervalRef = useRef(null);
  
  const targetImages = 50;

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  // Check camera availability on component mount
  useEffect(() => {
    checkCameraAvailability();
  }, []);

  const checkCameraAvailability = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCamera(false);
        setCameraError('Camera API not supported in this browser');
        return;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        setHasCamera(false);
        setCameraError('No camera detected');
      }
    } catch (error) {
      console.error('Error checking camera:', error);
      setCameraError('Error accessing camera: ' + error.message);
    }
  };

  const handleUserMedia = (stream) => {
    console.log('Camera access granted, stream:', stream);
    console.log('Video tracks:', stream.getVideoTracks());
    console.log('Track settings:', stream.getVideoTracks()[0]?.getSettings());
    
    // Force the video element to play
    if (webcamRef.current && webcamRef.current.video) {
      const videoElement = webcamRef.current.video;
      console.log('Video element:', videoElement);
      console.log('Video readyState:', videoElement.readyState);
      console.log('Video paused:', videoElement.paused);
      
      // Ensure video is playing
      videoElement.play().catch(err => {
        console.error('Error playing video:', err);
      });
      
      // Add event listeners to track video state
      videoElement.onloadedmetadata = () => {
        console.log('Video metadata loaded');
        videoElement.play();
      };
      
      videoElement.onplaying = () => {
        console.log('Video is playing');
        setCameraReady(true);
      };
    }
    
    setCameraError(null);
  };

  const handleUserMediaError = (error) => {
    console.error('Camera error:', error);
    setCameraReady(false);
    let errorMessage = 'Camera access denied or error occurred';
    
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Camera access denied. Please allow camera access in your browser settings.';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No camera found. Please connect a camera and try again.';
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Camera is already in use by another application. Please close other apps using the camera.';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage = 'Camera constraints could not be satisfied. Try a different camera or check camera settings.';
    }
    
    setCameraError(errorMessage);
    setMessage({ type: 'danger', text: errorMessage });
    setShowWebcam(false);
    setIsCapturing(false);
  };

  const startCapture = () => {
    if (!studentId || !studentName) {
      setMessage({ type: 'danger', text: 'Please enter Student ID and Name' });
      return;
    }

    setCameraReady(false);
    setShowWebcam(true);
    setCapturedImages([]);
    setCaptureProgress(0);
    setMessage({ type: 'info', text: 'Initializing camera... Please wait.' });
    
    // Wait for webcam to initialize and verify it's working
    setTimeout(() => {
      // Double-check camera is working before starting capture
      if (!webcamRef.current) {
        setMessage({ 
          type: 'danger', 
          text: 'Camera initialization failed. Please refresh the page and allow camera access when prompted.' 
        });
        setShowWebcam(false);
        return;
      }

      const testCapture = webcamRef.current.getScreenshot();
      console.log('Test capture result:', testCapture ? 'Success' : 'Failed');
      
      if (testCapture) {
        setMessage({ type: 'info', text: 'Camera ready! Starting capture...' });
        setTimeout(() => {
          setIsCapturing(true);
          captureImages();
        }, 500);
      } else {
        setMessage({ 
          type: 'danger', 
          text: 'Camera is not ready. Please ensure the camera feed is visible before starting capture. You may need to close other applications using the camera.' 
        });
        setShowWebcam(false);
      }
    }, 2000); // Increased wait time for camera initialization
  };

  const captureImages = () => {
    let count = 0;
    let failedAttempts = 0;
    
    captureIntervalRef.current = setInterval(() => {
      if (count >= targetImages) {
        stopCapture(count);
        return;
      }

      // Check if webcam is ready
      if (!webcamRef.current) {
        failedAttempts++;
        if (failedAttempts > 10) {
          clearInterval(captureIntervalRef.current);
          setIsCapturing(false);
          setMessage({ 
            type: 'danger', 
            text: 'Camera not ready. Please allow camera access and try again.' 
          });
          setShowWebcam(false);
        }
        return;
      }

      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImages(prev => [...prev, imageSrc]);
        count++;
        setCaptureProgress(Math.round((count / targetImages) * 100));
        failedAttempts = 0; // Reset failed attempts on success
      } else {
        failedAttempts++;
        if (failedAttempts > 10) {
          clearInterval(captureIntervalRef.current);
          setIsCapturing(false);
          setMessage({ 
            type: 'danger', 
            text: 'Failed to capture images. Camera may not be working properly.' 
          });
          setShowWebcam(false);
        }
      }
    }, 200); // Capture every 200ms
  };

  const stopCapture = (finalCount) => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }
    setIsCapturing(false);
    setMessage({ 
      type: 'success', 
      text: `Successfully captured ${finalCount || capturedImages.length} images!` 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (capturedImages.length < 10) {
      setMessage({ 
        type: 'danger', 
        text: 'Please capture at least 10 images before submitting' 
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${API_URL}/register`, {
        student_id: studentId,
        name: studentName,
        images: capturedImages
      });

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: `✓ ${response.data.message}. ${response.data.images_saved} images processed.` 
        });
        
        // Reset form
        setTimeout(() => {
          setStudentId('');
          setStudentName('');
          setCapturedImages([]);
          setCaptureProgress(0);
          setShowWebcam(false);
        }, 3000);
      } else {
        setMessage({ type: 'danger', text: response.data.message });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Failed to register student. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStudentId('');
    setStudentName('');
    setCapturedImages([]);
    setCaptureProgress(0);
    setShowWebcam(false);
    setIsCapturing(false);
    setMessage({ type: '', text: '' });
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-person-plus me-2"></i>
                Student Registration
              </h4>
            </div>
            <div className="card-body">
              
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

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Student ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="Enter unique student ID"
                      required
                      disabled={isCapturing || isLoading}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Student Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter student name"
                      required
                      disabled={isCapturing || isLoading}
                    />
                  </div>
                </div>

                <div className="text-center mb-4">
                  {!showWebcam ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={startCapture}
                      disabled={!studentId || !studentName || isLoading}
                    >
                      <i className="bi bi-camera-video me-2"></i>
                      Start Capturing Images
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-danger btn-lg"
                      onClick={resetForm}
                      disabled={isLoading}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Reset
                    </button>
                  )}
                </div>

                {showWebcam && (
                  <div className="text-center mb-4">
                    {cameraError && (
                      <div className="alert alert-danger mb-3" role="alert">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        <strong>Camera Error:</strong> {cameraError}
                      </div>
                    )}
                    
                    {!hasCamera && (
                      <div className="alert alert-warning mb-3" role="alert">
                        <i className="bi bi-camera-video-off me-2"></i>
                        <strong>No Camera Detected:</strong> Please connect a camera to continue.
                      </div>
                    )}

                    {!cameraReady && !cameraError && (
                      <div className="alert alert-info mb-3" role="alert">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <strong>Initializing camera...</strong> Please wait for the video feed to appear.
                      </div>
                    )}

                    {cameraReady && (
                      <div className="alert alert-success mb-3" role="alert">
                        <i className="bi bi-check-circle me-2"></i>
                        <strong>Camera is ready!</strong> You should see yourself in the video feed below.
                      </div>
                    )}
                    
                    <div className="webcam-container mb-3" style={{ position: 'relative' }}>
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        className="border rounded"
                        onUserMedia={handleUserMedia}
                        onUserMediaError={handleUserMediaError}
                        style={{ width: '100%', maxWidth: '640px' }}
                      />
                      {!cameraReady && !cameraError && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: 'white',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          padding: '20px',
                          borderRadius: '10px'
                        }}>
                          <div className="spinner-border text-light mb-2" role="status"></div>
                          <div>Loading camera...</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <h6>Capture Progress: {capturedImages.length} / {targetImages}</h6>
                      <div className="progress">
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                          role="progressbar"
                          style={{ width: `${captureProgress}%` }}
                          aria-valuenow={captureProgress}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          {captureProgress}%
                        </div>
                      </div>
                    </div>

                    {isCapturing && (
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        Please look at the camera and move your head slightly for better training data
                      </div>
                    )}
                  </div>
                )}

                {capturedImages.length >= 10 && !isCapturing && (
                  <div className="text-center">
                    <button
                      type="submit"
                      className="btn btn-success btn-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Registering...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Register Student
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>

              <div className="mt-4 p-3 bg-light rounded">
                <h6 className="text-muted mb-2">
                  <i className="bi bi-lightbulb me-2"></i>
                  Instructions:
                </h6>
                <ul className="mb-0 text-muted small">
                  <li>Enter a unique Student ID and the student's full name</li>
                  <li>Click "Start Capturing Images" to begin the registration process</li>
                  <li>The system will automatically capture {targetImages} images from your webcam</li>
                  <li>Move your head slightly during capture for better accuracy</li>
                  <li>Ensure good lighting and face the camera directly</li>
                  <li>After capture completes, click "Register Student" to save</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
