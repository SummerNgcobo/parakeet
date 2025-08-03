import React, { useState, useEffect } from 'react';
import './MentorSubmittedWork.css';
import { FiSearch, FiFilter, FiDownload, FiMessageSquare, FiClock } from 'react-icons/fi';
import { FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa';
import { useUser } from '../../../contexts/UserContext';

const MentorSubmittedWork = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`/api/mentors/${user.id}/submissions`);
        const data = await response.json();
        setSubmissions(data);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchSubmissions();
    }
  }, [user]);

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         submission.assignment_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || submission.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/submissions/${selectedSubmission.id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grade,
          feedback,
          mentor_id: user.id
        }),
      });
      
      if (response.ok) {
        // Update local state
        const updatedSubmissions = submissions.map(sub => 
          sub.id === selectedSubmission.id 
            ? { ...sub, grade, comments: feedback, status: 'graded' } 
            : sub
        );
        setSubmissions(updatedSubmissions);
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error('Error submitting grade:', error);
    }
  };

  const handleDownload = async (submissionId, fileName) => {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading submissions...</div>;
  }

  return (
    <div className="submitted-work-container">
      <div className="header">
        <h1>Submitted Work</h1>
        <div className="controls">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by student or assignment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <FiFilter className="filter-icon" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Submissions</option>
              <option value="submitted">Pending Review</option>
              <option value="graded">Graded</option>
              <option value="late">Late Submissions</option>
              <option value="needs_revision">Needs Revision</option>
            </select>
          </div>
        </div>
      </div>

      <div className="submissions">
        <div className="submissions-list">
          <div className="list-header">
            <span>Student</span>
            <span>Assignment</span>
            <span>Course</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {filteredSubmissions.length > 0 ? (
            filteredSubmissions.map(submission => (
              <div 
                key={submission.id} 
                className={`submission-item ${submission.status}`}
                onClick={() => {
                  setSelectedSubmission(submission);
                  setGrade(submission.grade || '');
                  setFeedback(submission.comments || '');
                }}
              >
                <span>{submission.student_name}</span>
                <span>{submission.assignment_title}</span>
                <span>{submission.course_name || 'N/A'}</span>
                <span>
                  <span className={`status-badge ${submission.status}`}>
                    {submission.status === 'graded' ? (
                      <FaRegCheckCircle className="icon" />
                    ) : submission.status === 'late' ? (
                      <FiClock className="icon" />
                    ) : (
                      <FaRegTimesCircle className="icon" />
                    )}
                    {submission.status.replace('_', ' ')}
                  </span>
                </span>
                <span className="actions">
                  <button 
                    className="download-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(submission.id, submission.file_name);
                    }}
                  >
                    <FiDownload />
                  </button>
                </span>
              </div>
            ))
          ) : (
            <div className="no-results">
              No submissions found matching your criteria
            </div>
          )}
        </div>

        {selectedSubmission && (
          <div className="submission-details">
            <div className="details-header">
              <h2>{selectedSubmission.assignment_title}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedSubmission(null)}
              >
                &times;
              </button>
            </div>
            <div className="student-info">
              <h3>{selectedSubmission.student_name}</h3>
              <p>{selectedSubmission.course_name || 'N/A'}</p>
              <p>Submitted: {new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
              <button
                className="file-link"
                onClick={() => handleDownload(selectedSubmission.id, selectedSubmission.file_name)}
              >
                <FiDownload /> Download Submission
              </button>
            </div>
            
            <form onSubmit={handleGradeSubmit}>
              <div className="grade-section">
                <label>Grade:</label>
                <select 
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  required
                >
                  <option value="">Select grade</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="F">F</option>
                </select>
              </div>
              
              <div className="comments-section">
                <label>Feedback:</label>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback..."
                  rows="5"
                  required
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {selectedSubmission.grade ? 'Update' : 'Submit'} Grade
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorSubmittedWork;