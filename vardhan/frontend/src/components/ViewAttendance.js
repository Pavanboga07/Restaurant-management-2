import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function ViewAttendance() {
  const [subjects, setSubjects] = useState([]);
  const [dates, setDates] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'filtered'

  useEffect(() => {
    fetchSubjects();
    fetchDates();
    fetchAllAttendance();
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

  const fetchDates = async () => {
    try {
      const response = await axios.get(`${API_URL}/dates`);
      if (response.data.success) {
        setDates(response.data.dates);
      }
    } catch (error) {
      console.error('Error fetching dates:', error);
    }
  };

  const fetchAllAttendance = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/attendance/all`);
      if (response.data.success) {
        setAttendanceRecords(response.data.records);
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setMessage({ type: 'danger', text: 'Failed to load attendance records' });
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredAttendance = async () => {
    if (!selectedSubject) {
      setMessage({ type: 'warning', text: 'Please select a subject' });
      return;
    }

    setLoading(true);
    try {
      const url = `${API_URL}/attendance/${selectedSubject}${selectedDate ? `?date=${selectedDate}` : ''}`;
      const response = await axios.get(url);
      
      if (response.data.success) {
        setAttendanceRecords(response.data.records);
        setStatistics(response.data.statistics);
        setViewMode('filtered');
        setMessage({ 
          type: 'success', 
          text: `Showing ${response.data.records.length} record(s) for ${selectedSubject}` 
        });
      }
    } catch (error) {
      console.error('Error fetching filtered attendance:', error);
      setMessage({ type: 'danger', text: 'Failed to load attendance records' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      let url = `${API_URL}/attendance/`;
      
      if (viewMode === 'filtered' && selectedSubject) {
        url += `${selectedSubject}?export=excel`;
        if (selectedDate) {
          url += `&date=${selectedDate}`;
        }
      } else {
        url += 'all?export=excel';
      }

      // Open in new tab to trigger download
      window.open(url, '_blank');
      
      setMessage({ type: 'success', text: 'Excel file download started' });
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'danger', text: 'Failed to export to Excel' });
    }
  };

  const resetFilters = () => {
    setSelectedSubject('');
    setSelectedDate('');
    setViewMode('all');
    fetchAllAttendance();
  };

  return (
    <div className="container">
      <div className="card shadow">
        <div className="card-header bg-info text-white">
          <h4 className="mb-0">
            <i className="bi bi-table me-2"></i>
            View Attendance Records
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

          {/* Filters Section */}
          <div className="row mb-4">
            <div className="col-md-4">
              <label className="form-label">
                <strong>Filter by Subject</strong>
              </label>
              <select
                className="form-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map((subject, idx) => (
                  <option key={idx} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-4">
              <label className="form-label">
                <strong>Filter by Date</strong>
              </label>
              <select
                className="form-select"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value="">All Dates</option>
                {dates.map((date, idx) => (
                  <option key={idx} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-4">
              <label className="form-label d-block">
                <strong>&nbsp;</strong>
              </label>
              <button
                className="btn btn-primary me-2"
                onClick={fetchFilteredAttendance}
                disabled={loading}
              >
                <i className="bi bi-funnel me-1"></i>
                Apply Filter
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={resetFilters}
                disabled={loading}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>
                Reset
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card bg-primary text-white">
                  <div className="card-body text-center">
                    <h2 className="mb-0">{statistics.total_present}</h2>
                    <p className="mb-0 small">Total Present</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-success text-white">
                  <div className="card-body text-center">
                    <h2 className="mb-0">{statistics.unique_students}</h2>
                    <p className="mb-0 small">Unique Students</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-warning text-dark">
                  <div className="card-body text-center">
                    <h2 className="mb-0">
                      {Object.keys(statistics.subject_breakdown || {}).length}
                    </h2>
                    <p className="mb-0 small">Subjects</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-info text-white">
                  <div className="card-body text-center">
                    <h2 className="mb-0">
                      {Object.keys(statistics.date_breakdown || {}).length}
                    </h2>
                    <p className="mb-0 small">Days Recorded</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Button */}
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-list-ul me-2"></i>
              Attendance Records
              <span className="badge bg-secondary ms-2">{attendanceRecords.length}</span>
            </h5>
            <button
              className="btn btn-success"
              onClick={handleExport}
              disabled={attendanceRecords.length === 0}
            >
              <i className="bi bi-file-earmark-excel me-1"></i>
              Export to Excel
            </button>
          </div>

          {/* Attendance Table */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading attendance records...</p>
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="alert alert-warning text-center">
              <i className="bi bi-exclamation-triangle me-2"></i>
              No attendance records found. Mark some attendance to see records here.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Time In</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <span className="badge bg-secondary">
                          {record.Student_ID || record.student_id}
                        </span>
                      </td>
                      <td>{record.Name || record.name}</td>
                      <td>
                        <span className="badge bg-info">
                          {record.Subject || record.subject}
                        </span>
                      </td>
                      <td>
                        <i className="bi bi-calendar me-1"></i>
                        {record.Date || record.date}
                      </td>
                      <td>
                        <i className="bi bi-clock me-1"></i>
                        {record.Time_In || record.time_in}
                      </td>
                      <td>
                        <span className="badge bg-success">
                          <i className="bi bi-check-circle me-1"></i>
                          Present
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Subject Breakdown */}
          {statistics && statistics.subject_breakdown && (
            <div className="mt-4">
              <h6 className="mb-3">
                <i className="bi bi-bar-chart me-2"></i>
                Subject-wise Breakdown
              </h6>
              <div className="row">
                {Object.entries(statistics.subject_breakdown).map(([subject, count]) => (
                  <div key={subject} className="col-md-4 mb-3">
                    <div className="card">
                      <div className="card-body">
                        <h6 className="card-title">{subject}</h6>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="badge bg-primary">{count} records</span>
                          <div className="progress flex-grow-1 ms-3" style={{ height: '20px' }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ 
                                width: `${(count / statistics.total_present) * 100}%` 
                              }}
                            >
                              {Math.round((count / statistics.total_present) * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Information Panel */}
          <div className="mt-4 p-3 bg-light rounded">
            <h6 className="text-muted mb-2">
              <i className="bi bi-lightbulb me-2"></i>
              Features:
            </h6>
            <ul className="mb-0 text-muted small">
              <li>View all attendance records or filter by subject and date</li>
              <li>Export attendance data to Excel for offline analysis</li>
              <li>View statistics including total present, unique students, and breakdowns</li>
              <li>Records are automatically saved in CSV format for each subject and date</li>
              <li>Use the filters to narrow down records for specific reporting needs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewAttendance;
