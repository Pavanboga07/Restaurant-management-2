import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function RegisterNative() {
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [capturedImages, setCapturedImages] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const captureIntervalRef = useRef(null);
  
  const targetImages = 50;

  useEffect(() => {
    return () => {
      // Cleanup: stop camera when component unmounts
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      setCameraReady(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraReady(true);
          console.log('Camera started successfully');
        };
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraReady(false);
      
      let errorMessage = 'Camera access failed';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please connect a camera and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application. Please close other apps using the camera.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints could not be satisfied. Your camera may not support the required resolution.';
      }
      
      setCameraError(errorMessage);
      setMessage({ type: 'danger', text: errorMessage });
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Check if video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('Video dimensions are invalid:', video.videoWidth, video.videoHeight);
      return null;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    // Verify the image was captured (data URL should be longer than just the header)
    if (dataUrl.length < 1000) {
      console.error('Captured image seems invalid (too small)');
      return null;
    }
    
    return dataUrl;
  };

  const startCapture = async () => {
    if (!studentId || !studentName) {
      setMessage({ type: 'danger', text: 'Please enter Student ID and Name' });
      return;
    }

    setShowWebcam(true);
    setCapturedImages([]);
    setCaptureProgress(0);
    setMessage({ type: 'info', text: 'Initializing camera...' });
    
    await startCamera();
    
    // Wait for camera to be ready with multiple checks
    const waitForCamera = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState === 4 && videoRef.current.videoWidth > 0) {
        clearInterval(waitForCamera);
        console.log('Camera is ready, starting capture...');
        console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
        
        setMessage({ type: 'info', text: 'Camera ready! Starting capture in 1 second...' });
        
        setTimeout(() => {
          setIsCapturing(true);
          captureImages();
        }, 1000);
      }
    }, 200); // Check every 200ms
    
    // Timeout after 10 seconds if camera doesn't initialize
    setTimeout(() => {
      clearInterval(waitForCamera);
      if (!videoRef.current || videoRef.current.readyState !== 4) {
        setMessage({ 
          type: 'danger', 
          text: 'Camera initialization timeout. Please refresh the page and try again.' 
        });
        setShowWebcam(false);
      }
    }, 10000);
  };

  const captureImages = () => {
    let count = 0;
    let failedAttempts = 0;
    
    captureIntervalRef.current = setInterval(() => {
      if (count >= targetImages) {
        stopCapture(count);
        return;
      }

      const imageSrc = captureImage();
      
      if (imageSrc) {
        setCapturedImages(prev => [...prev, imageSrc]);
        count++;
        setCaptureProgress(Math.round((count / targetImages) * 100));
        failedAttempts = 0;
        console.log(`Captured image ${count}/${targetImages}`);
      } else {
        failedAttempts++;
        console.warn(`Failed to capture image, attempt ${failedAttempts}`);
        
        if (failedAttempts > 10) {
          clearInterval(captureIntervalRef.current);
          setIsCapturing(false);
          setMessage({ 
            type: 'danger', 
            text: 'Failed to capture images. Camera may not be working properly.' 
          });
        }
      }
    }, 200);
  };

  const stopCapture = (finalCount) => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }
    setIsCapturing(false);
    setMessage({ 
      type: 'success', 
      text: `Successfully captured ${finalCount} images!` 
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
          text: `Student registered successfully! ${capturedImages.length} images saved.` 
        });
        
        // Reset form after successful registration
        setTimeout(() => {
          resetForm();
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.error || 'Failed to register student. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    stopCamera();
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }
    setStudentId('');
    setStudentName('');
    setCapturedImages([]);
    setIsCapturing(false);
    setCaptureProgress(0);
    setMessage({ type: '', text: '' });
    setShowWebcam(false);
    setCameraReady(false);
    setCameraError(null);
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">
                <i className="bi bi-person-plus-fill me-2"></i>
                Student Registration (Native Camera)
              </h3>
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

                    {!cameraReady && !cameraError && (
                      <div className="alert alert-info mb-3" role="alert">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <strong>Initializing camera...</strong> Please wait.
                      </div>
                    )}

                    {cameraReady && (
                      <div className="alert alert-success mb-3" role="alert">
                        <i className="bi bi-check-circle me-2"></i>
                        <strong>Camera is ready!</strong> Live feed below.
                      </div>
                    )}
                    
                    <div className="webcam-container mb-3">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ 
                          width: '100%', 
                          maxWidth: '640px',
                          border: '2px solid #dee2e6',
                          borderRadius: '8px',
                          backgroundColor: '#000'
                        }}
                      />
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                    
                    <div className="mb-3">
                      <h6>Capture Progress: {capturedImages.length} / {targetImages}</h6>
                      <div className="progress" style={{ height: '25px' }}>
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
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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

              <div className="mt-4">
                <h5>Instructions:</h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    <i className="bi bi-1-circle me-2"></i>
                    Enter the student ID and name in the fields above
                  </li>
                  <li className="list-group-item">
                    <i className="bi bi-2-circle me-2"></i>
                    Click "Start Capturing Images" to begin
                  </li>
                  <li className="list-group-item">
                    <i className="bi bi-3-circle me-2"></i>
                    Allow camera access when prompted by your browser
                  </li>
                  <li className="list-group-item">
                    <i className="bi bi-4-circle me-2"></i>
                    The system will automatically capture {targetImages} images from your webcam
                  </li>
                  <li className="list-group-item">
                    <i className="bi bi-5-circle me-2"></i>
                    Move your head slightly during capture for better accuracy
                  </li>
                  <li className="list-group-item">
                    <i className="bi bi-6-circle me-2"></i>
                    Click "Register Student" to complete the registration
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterNative;
