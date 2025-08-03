import React, { useState, useEffect } from 'react';
import { useUser } from '../../../contexts/UserContext';
import './TraineeAssignment.css';

// Icons
const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={24} height={24}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

function AssignmentSection() {
  const { user } = useUser();
  const email = user?.email;
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [viewedAssignment, setViewedAssignment] = useState(null);

  useEffect(() => {
    async function fetchAssignmentsAndSubmissions() {
      setLoading(true);
      setError(null);

      try {
        // Pass email as query param to get user-specific assignments
        const [assignmentsRes, submissionsRes] = await Promise.all([
          fetch(`http://localhost:5000/assignments/my?email=${email}`, {
            credentials: 'include'
          }),
          fetch(`http://localhost:5000/assignments/submissions`, {
            credentials: 'include'
          })
        ]);

        if (!assignmentsRes.ok || !submissionsRes.ok) {
          throw new Error("Failed to fetch assignments or submissions");
        }

        const assignmentsData = await assignmentsRes.json();
        const submissionsData = await submissionsRes.json();

        // Filter submissions only for the logged-in user
        const userSubmissions = submissionsData.filter(
          (sub) => sub.userEmail === email
        );

        // Merge assignments with user-specific submission info
        const mergedAssignments = assignmentsData.map((assignment) => {
          const submission = userSubmissions.find(
            (sub) => sub.assignmentId === assignment.id
          );

          return {
            ...assignment,
            status: submission ? "submitted" : "pending",
            grade: submission?.grade ?? null,
            feedback: submission?.comments ?? null,
            documentLink: submission?.submissionLink
              ? `http://localhost:5000/assignments/files/${submission.submissionLink}`
              : null,
            dueDate: assignment.dueDate || null,
            submittedAt: submission?.submittedAt || null,
          };
        });

        setAssignments(mergedAssignments);
      } catch (err) {
        setError(err.message || "Failed to load assignments");
      } finally {
        setLoading(false);
      }
    }

    if (email) {
      fetchAssignmentsAndSubmissions();
    }
  }, [email]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleView = (assignment) => {
    setViewedAssignment(assignment);
    setViewModal(true);
  };

  const handleSubmitClick = (assignment) => {
    setSelectedAssignment(assignment);
    setShowModal(true);
    setComment("");
    setFile(null);
    setSubmissionSuccess(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || !file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("submissionComment", comment);
    formData.append("userEmail", email);

    try {
      const response = await fetch(
        `http://localhost:5000/assignments/${selectedAssignment.id}/submit`, 
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Submission failed");
      }

      const result = await response.json();

      const updatedAssignments = assignments.map(a =>
        a.id === selectedAssignment.id ? { 
          ...a, 
          status: "submitted",
          documentLink: result.submissionLink 
            ? `http://localhost:5000/assignments/files/${result.submissionLink}` 
            : null,
          submittedAt: result.submittedAt || new Date().toISOString()
        } : a
      );

      setAssignments(updatedAssignments);
      setSubmissionSuccess(true);
      setTimeout(() => setShowModal(false), 1500);
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.message || "Something went wrong during submission.");
    }
  };

  function handleCloseModal() {
    setShowModal(false);
  }

  return (
    <div className="assignment-container">
      <div className="section">
        <h2 className="section-title">Upcoming Deadline</h2>
        <div className="upcoming-deadline">
          {loading ? (
            <p>Loading assignments...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>Error: {error}</p>
          ) : assignments.length > 0 ? (
            <div className="deadline-content">
              <h3 className="deadline-title">{assignments[0].title}</h3>
              <p className="deadline-date">Due on {formatDate(assignments[0].dueDate)}</p>
            </div>
          ) : (
            <div className="deadline-content">
              <h3 className="deadline-title">No upcoming deadlines</h3>
              <p className="deadline-date">You're all caught up!</p>
            </div>
          )}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Your Assignments</h2>
        <div className="assignments-table-container">
          {loading ? (
            <p>Loading assignments...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>Error: {error}</p>
          ) : assignments.length > 0 ? (
            <table className="assignments-table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>{assignment.title}</td>
                    <td>{formatDate(assignment.dueDate)}</td>
                    <td>
                      <span className={`status-badge status-${assignment.status}`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td>{assignment.grade ?? '-'}</td>
                    <td className="action-buttons">
                      <button
                        className="view-button"
                        onClick={() => handleView(assignment)}
                        title="View Assignment Details"
                      >
                        View
                      </button>

                      <button
                        className="submit-button"
                        onClick={() => handleSubmitClick(assignment)}
                        disabled={assignment.status === "submitted"}
                        title={assignment.status === "submitted" ? "Already submitted" : "Submit Assignment"}
                      >
                        {assignment.status === "submitted" ? "Submitted" : "Submit"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <FileIcon />
              <h3>No assignments yet</h3>
              <p>Check back later for new assignments</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modals">
            <div className="modal-header">
              <h3>Submit Assignment</h3>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <h4>{selectedAssignment?.title}</h4>
              <p>{selectedAssignment?.description}</p>
              <p>Due on {formatDate(selectedAssignment?.dueDate)}</p>

              <div className="form-group">
                <label>Upload Document</label>
                <label className="file-input-label">
                  <FileIcon />
                  <span className="file-input-text"><strong>Click to upload</strong></span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="file-input"
                    accept=".pdf,.doc,.docx"
                  />
                </label>
                {file && (
                  <p className="file-selected">
                    ✓ {file.name} ({Math.round(file.size / 1024)}KB)
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Add a Comment (Optional)</label>
                <textarea
                  value={comment}
                  onChange={handleCommentChange}
                  className="comment-input"
                  rows={4}
                  placeholder="Any notes for your instructor..."
                />
              </div>

              {submissionSuccess && (
                <div className="status-badge status-submitted" style={{ marginTop: '1rem' }}>
                  ✓ Submission successful! Closing...
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={handleCloseModal}>
                Cancel
              </button>
              <button
                className="submit-confirm-button"
                onClick={handleSubmit}
                disabled={!file || submissionSuccess}
              >
                {submissionSuccess ? 'Submitted!' : 'Submit Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {viewModal && viewedAssignment && (
        <div className="modal-overlay">
          <div className="modals">
            <div className="modal-header">
              <h3>Assignment Details</h3>
              <button className="close-button" onClick={() => setViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <h4>{viewedAssignment.title}</h4>
              <p className="assignment-description">{viewedAssignment.description || "No description provided."}</p>
              
              <div className="assignment-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Due Date:</span>
                  <span className="detail-value">{formatDate(viewedAssignment.dueDate)}</span>
                </div>
                
                {viewedAssignment.status === "submitted" && (
                  <div className="detail-item">
                    <span className="detail-label">Submitted On:</span>
                    <span className="detail-value">{formatDateTime(viewedAssignment.submittedAt)}</span>
                  </div>
                )}
                
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value status-${viewedAssignment.status}`}>
                    {viewedAssignment.status}
                  </span>
                </div>
                
                {viewedAssignment.documentLink && (
                  <div className="detail-item">
                    <span className="detail-label">Submission File:</span>
                    <span className="detail-value">
                      <a 
                        href={viewedAssignment.documentLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        Open Document
                      </a>
                    </span>
                  </div>
                )}
                
                {viewedAssignment.grade && (
                  <div className="detail-item">
                    <span className="detail-label">Grade:</span>
                    <span className="detail-value grade-value">
                      {viewedAssignment.grade}
                    </span>
                  </div>
                )}
              </div>
              
              {viewedAssignment.feedback && (
                <div className="feedback-section">
                  <h5>Feedback:</h5>
                  <div className="feedback-content">
                    {viewedAssignment.feedback}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignmentSection;