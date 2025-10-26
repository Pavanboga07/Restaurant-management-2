import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function Training() {
  const [isTraining, setIsTraining] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [students, setStudents] = useState([]);
  const [modelStatus, setModelStatus] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    fetchStudents();
    checkModelStatus();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/students`, { timeout: 5000 });
      if (response.data.success) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const checkModelStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
      setModelStatus(response.data);
    } catch (error) {
      console.error('Error checking model status:', error);
      setModelStatus({ status: 'error', message: 'Could not connect to backend' });
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleTrainModel = async () => {
    if (students.length === 0) {
      setMessage({ 
        type: 'warning', 
        text: 'No students registered yet. Please register students first.' 
      });
      return;
    }

    setIsTraining(true);
    setMessage({ type: 'info', text: 'Training model... This may take a few moments.' });

    try {
      const response = await axios.post(`${API_URL}/train`);
      
      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: `✓ ${response.data.message}. Total students trained: ${response.data.total_students}` 
        });
        checkModelStatus(); // Refresh model status
      } else {
        setMessage({ type: 'danger', text: response.data.message });
      }
    } catch (error) {
      console.error('Training error:', error);
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Failed to train model. Please try again.' 
      });
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">
                <i className="bi bi-gear me-2"></i>
                Model Training Dashboard
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

              {/* Model Status Card */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h5 className="card-title">
                        <i className="bi bi-info-circle me-2"></i>
                        Model Status
                      </h5>
                      {modelStatus ? (
                        <>
                          <p className="mb-2">
                            <strong>Status:</strong> 
                            <span className={`badge ms-2 ${modelStatus.model_trained ? 'bg-success' : 'bg-warning'}`}>
                              {modelStatus.model_trained ? 'Trained' : 'Not Trained'}
                            </span>
                          </p>
                          <p className="mb-0">
                            <strong>Trained Students:</strong> 
                            <span className="badge bg-primary ms-2">{modelStatus.total_students}</span>
                          </p>
                        </>
                      ) : loadingStatus ? (
                        <p className="text-muted">Loading status...</p>
                      ) : (
                        <p className="text-warning">Could not load model status</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h5 className="card-title">
                        <i className="bi bi-people me-2"></i>
                        Registered Students
                      </h5>
                      {loadingStudents ? (
                        <p className="text-muted">Loading...</p>
                      ) : (
                        <>
                          <p className="mb-2">
                            <strong>Total Registered:</strong> 
                            <span className="badge bg-info ms-2">{students.length}</span>
                          </p>
                          <p className="mb-0 text-muted small">
                            {students.length === 0 
                              ? 'No students registered yet' 
                              : 'Ready for training'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Training Button */}
              <div className="text-center mb-4">
                <button
                  className="btn btn-success btn-lg"
                  onClick={handleTrainModel}
                  disabled={isTraining || students.length === 0}
                >
                  {isTraining ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Training Model...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-repeat me-2"></i>
                      {modelStatus?.model_trained ? 'Re-train Model' : 'Train Model'}
                    </>
                  )}
                </button>
              </div>

              {/* Registered Students List */}
              <div className="mt-4">
                <h5 className="mb-3">
                  <i className="bi bi-list-ul me-2"></i>
                  Registered Students List
                </h5>
                
                {loadingStudents ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : students.length === 0 ? (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    No students registered yet. Please register students before training the model.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Student ID</th>
                          <th>Name</th>
                          <th>Registered On</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, index) => (
                          <tr key={student.student_id}>
                            <td>{index + 1}</td>
                            <td>
                              <span className="badge bg-secondary">{student.student_id}</span>
                            </td>
                            <td>{student.name}</td>
                            <td>{new Date(student.created_at).toLocaleString()}</td>
                            <td>
                              <span className="badge bg-success">
                                <i className="bi bi-check-circle me-1"></i>
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Information Panel */}
              <div className="mt-4 p-3 bg-light rounded">
                <h6 className="text-muted mb-2">
                  <i className="bi bi-lightbulb me-2"></i>
                  About Model Training:
                </h6>
                <ul className="mb-0 text-muted small">
                  <li>Training creates face encodings from all registered student images</li>
                  <li>The model must be trained before you can mark attendance</li>
                  <li>Re-train the model whenever you register new students</li>
                  <li>Training typically takes 10-30 seconds depending on the number of students</li>
                  <li>The trained model is saved automatically and persists between sessions</li>
                  <li>Ensure all students have clear, well-lit face images for best accuracy</li>
                </ul>
              </div>

              {/* Statistics */}
              {students.length > 0 && (
                <div className="mt-4">
                  <div className="row text-center">
                    <div className="col-md-4">
                      <div className="p-3 border rounded">
                        <h2 className="text-primary mb-0">{students.length}</h2>
                        <p className="text-muted small mb-0">Total Students</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 border rounded">
                        <h2 className="text-success mb-0">
                          {modelStatus?.model_trained ? modelStatus.total_students : 0}
                        </h2>
                        <p className="text-muted small mb-0">Trained</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 border rounded">
                        <h2 className="text-warning mb-0">
                          {students.length - (modelStatus?.total_students || 0)}
                        </h2>
                        <p className="text-muted small mb-0">Pending Training</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Training;
