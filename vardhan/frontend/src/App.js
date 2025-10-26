import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import RegisterNative from './components/RegisterNative';
import Training from './components/Training';
import MarkAttendance from './components/MarkAttendance';
import ViewAttendance from './components/ViewAttendance';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation Bar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="container-fluid">
            <span className="navbar-brand mb-0 h1">
              <i className="bi bi-camera-video me-2"></i>
              Face Recognition Attendance System
            </span>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <NavLink 
                    to="/register" 
                    className={({ isActive }) => 
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <i className="bi bi-person-plus me-1"></i>
                    Register
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink 
                    to="/training" 
                    className={({ isActive }) => 
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <i className="bi bi-gear me-1"></i>
                    Training
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink 
                    to="/mark-attendance" 
                    className={({ isActive }) => 
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <i className="bi bi-camera me-1"></i>
                    Mark Attendance
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink 
                    to="/view-attendance" 
                    className={({ isActive }) => 
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <i className="bi bi-table me-1"></i>
                    View Attendance
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegisterNative />} />
            <Route path="/training" element={<Training />} />
            <Route path="/mark-attendance" element={<MarkAttendance />} />
            <Route path="/view-attendance" element={<ViewAttendance />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="mt-5 py-3 bg-light text-center">
          <p className="mb-0 text-muted">
            Face Recognition Attendance System &copy; 2025
          </p>
        </footer>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="text-center">
      <div className="jumbotron bg-light p-5 rounded">
        <h1 className="display-4">Welcome to Face Recognition Attendance System</h1>
        <p className="lead mt-3">
          An automated attendance management system using facial recognition technology
        </p>
        <hr className="my-4" />
        <div className="row mt-5">
          <div className="col-md-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="bi bi-person-plus fs-1 text-primary"></i>
                <h5 className="card-title mt-3">Register</h5>
                <p className="card-text">Register new students with facial data</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="bi bi-gear fs-1 text-success"></i>
                <h5 className="card-title mt-3">Training</h5>
                <p className="card-text">Train the facial recognition model</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="bi bi-camera fs-1 text-warning"></i>
                <h5 className="card-title mt-3">Mark Attendance</h5>
                <p className="card-text">Record attendance automatically</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="bi bi-table fs-1 text-info"></i>
                <h5 className="card-title mt-3">View Records</h5>
                <p className="card-text">View and export attendance data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
