import React, { useState, useEffect } from 'react';
import './FacilitatorSubmitted.css';
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiClock,
  FiX,
  FiEdit,
  FiTrash2
} from 'react-icons/fi';
import {
  FaRegCheckCircle,
  FaRegTimesCircle
} from 'react-icons/fa';
import { useUser } from '../../../contexts/UserContext';

const FacilitatorSubmittedWork = () => {
  const { user } = useUser();
  const userEmail = user?.email;
  const [activeTab, setActiveTab] = useState('assignments');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [comments, setComments] = useState('');

  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const [allUsers, setAllUsers] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);

  const [assignmentForm, setAssignmentForm] = useState({
    id: '',
    title: '',
    description: '',
    specialization: [], 
    dueDate: '',
    userEmails: '', 
  });

  // Enhanced function to calculate how late a submission is
  const calculateLateDays = (submittedAt, dueDate) => {
    if (!submittedAt || !dueDate) return 0;
    const submitted = new Date(submittedAt);
    const due = new Date(dueDate);
    const diffTime = submitted - due;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Fetch submissions and assignments on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [submissionsRes, assignmentsRes] = await Promise.all([
          fetch('http://localhost:5000/assignments/submissions'),
          fetch('http://localhost:5000/assignments')
        ]);

        if (!submissionsRes.ok || !assignmentsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [submissionsData, assignmentsData] = await Promise.all([
          submissionsRes.json(),
          assignmentsRes.json()
        ]);
        setSubmissions(submissionsData);
        setAssignments(assignmentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchData();
    }
  }, [userEmail]);

  // Fetch users for assigning
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/users');
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setAllUsers(data);
    } catch (err) {
      console.error("User fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEmailInput = (input) => {
    setEmailInput(input);
    if (input.length < 2) {
      setFilteredUsers([]);
      return;
    }
    const lower = input.toLowerCase();
    const matches = allUsers.filter(
      u => u.email.toLowerCase().includes(lower) && !selectedEmails.includes(u.email)
    );
    setFilteredUsers(matches);
  };

  const handleAddEmail = (email) => {
    if (!selectedEmails.includes(email)) {
      setSelectedEmails(prev => [...prev, email]);
    }
    setEmailInput('');
    setFilteredUsers([]);
  };

  const handleRemoveEmail = (email) => {
    setSelectedEmails(prev => prev.filter(e => e !== email));
  };

  // Enhanced filter function with better late submission detection
  const filteredSubmissions = submissions.filter(submission => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (
        submission.user?.firstName?.toLowerCase().includes(searchLower) ||
        submission.user?.lastName?.toLowerCase().includes(searchLower) ||
        submission.assignment?.title?.toLowerCase().includes(searchLower) ||
        submission.user?.email?.toLowerCase().includes(searchLower)
      );
    
    const isLate = submission.submittedAt &&
      submission.assignment?.dueDate &&
      new Date(submission.submittedAt) > new Date(submission.assignment.dueDate);
    
    const matchesFilter = filter === 'all' ||
      (filter === 'submitted' ? submission.submitted && !submission.grade :
        filter === 'graded' ? submission.grade !== null :
          filter === 'late' ? isLate : false);
    
    return matchesSearch && matchesFilter;
  });

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      setIsSubmittingGrade(true);
      const response = await fetch(`http://localhost:5000/assignments/${selectedSubmission.assignmentId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: selectedSubmission.userEmail,
          grade,
          comments
        })
      });
      if (!response.ok) throw new Error('Failed to submit grade');

      const updated = submissions.map(sub =>
        sub.id === selectedSubmission.id
          ? { ...sub, grade, comments, gradedAt: new Date().toISOString() }
          : sub
      );
      setSubmissions(updated);
      setSelectedSubmission(null);
    } catch (err) {
      console.error("Grade submission error:", err);
      setModalError('Failed to submit grade. Please try again.');
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    try {
      const userEmailsArray = [...selectedEmails];
      const specializationString = assignmentForm.specialization.join(', ');

      const payload = {
        title: assignmentForm.title,
        description: assignmentForm.description,
        specialization: specializationString,
        dueDate: assignmentForm.dueDate,
        userEmails: userEmailsArray,
        creatorEmail: userEmail,
      };

      const url = assignmentForm.id
        ? `http://localhost:5000/assignments/${assignmentForm.id}`
        : 'http://localhost:5000/assignments';

      const response = await fetch(url, {
        method: assignmentForm.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const assignmentsRes = await fetch('http://localhost:5000/assignments');
      const assignmentsData = await assignmentsRes.json();
      setAssignments(assignmentsData);

      closeAssignmentModal();
      alert(`Assignment ${assignmentForm.id ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Assignment error:', error);
      setModalError(error.message || `Failed to ${assignmentForm.id ? 'update' : 'create'} assignment`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      const response = await fetch(`http://localhost:5000/assignments/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete assignment');

      const assignmentsRes = await fetch('http://localhost:5000/assignments');
      const assignmentsData = await assignmentsRes.json();
      setAssignments(assignmentsData);
      alert('Assignment deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      setModalError('Failed to delete assignment');
    }
  };

  const openEditModal = (assignment) => {
    const emails = assignment.Users?.map(u => u.email) || [];
    setSelectedEmails(emails);
    setAssignmentForm({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      specialization: assignment.specialization ? assignment.specialization.split(',').map(s => s.trim()) : [],
      dueDate: assignment.dueDate.split('T')[0],
      userEmails: emails.join(', '),
    });
    setIsEditModalOpen(true);
  };

  const closeAssignmentModal = () => {
    setIsAssignmentModalOpen(false);
    setIsEditModalOpen(false);
    setAssignmentForm({
      id: '',
      title: '',
      description: '',
      specialization: [],
      dueDate: '',
      userEmails: '',
    });
    setModalError(null);
    setSelectedEmails([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAssignmentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecializationChange = (specialization) => {
    setAssignmentForm(prev => {
      const newSpec = prev.specialization.includes(specialization)
        ? prev.specialization.filter(s => s !== specialization)
        : [...prev.specialization, specialization];
      return { ...prev, specialization: newSpec };
    });
  };

  const downloadFile = (filename) => {
    if (!filename) {
      alert('No file available for download');
      return;
    }
    window.open(`http://localhost:5000/assignments/files/${filename}`, '_blank');
  };

  // Enhanced status badge system
  const statusBadgeIcons = {
    graded: <FaRegCheckCircle className="icon" />,
    late: <FiClock className="icon" />,
    submitted: <FaRegTimesCircle className="icon" />
  };

  const getSubmissionStatus = (submission) => {
    if (submission.grade !== null) return 'graded';
    if (
      submission.submittedAt &&
      submission.assignment?.dueDate &&
      new Date(submission.submittedAt) > new Date(submission.assignment.dueDate)
    ) return 'late';
    return 'submitted';
  };

  // Enhanced function to render status with additional info
  const renderStatusBadge = (submission) => {
    const status = getSubmissionStatus(submission);
    const isLate = status === 'late';
    const lateDays = isLate ? calculateLateDays(submission.submittedAt, submission.assignment?.dueDate) : 0;

    return (
      <span className={`status-badge ${status}`}>
        {statusBadgeIcons[status]}
        {status}
        {isLate && lateDays > 0 && (
          <span className="late-days"> ({lateDays} day{lateDays !== 1 ? 's' : ''} late)</span>
        )}
      </span>
    );
  };

  return (
    <div className="submitted-work-container">
      <div className="header">
        <h1>Submitted Work</h1>
        <div className="controls">
          <button
            onClick={() => {
              setAssignmentForm({
                id: '',
                title: '',
                description: '',
                specialization: [],
                dueDate: '',
                userEmails: '',
              });
              setSelectedEmails([]);
              setIsAssignmentModalOpen(true);
            }}
            className="create-assignment-btn"
          >
            Create Assignment
          </button>

          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by student, email, or assignment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {activeTab === 'submissions' && (
            <div className="filter-dropdown">
              <FiFilter className="filter-icon" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Filter submissions"
              >
                <option value="all">All Submissions</option>
                <option value="submitted">Pending Review</option>
                <option value="graded">Graded</option>
                <option value="late">Late Submissions</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Add the tab navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
        <button
          className={`tab-button ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          Submissions
        </button>
        {/* <button
          className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews
        </button> */}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'assignments' && (
        <div className="assignments-section">
          <h2>Assignments</h2>
          {loading ? (
            <div className="loading-state"><p>Loading assignments...</p></div>
          ) : error ? (
            <div className="error-state"><p>{error}</p></div>
          ) : assignments.length === 0 ? (
            <div className="empty-state"><p>No assignments found</p></div>
          ) : (
            <div className="assignments-list">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="assignment-item">
                  <div className="assignment-info">
                    <h3>{assignment.title}</h3>
                    <p>Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                    <p>{assignment.specialization}</p>
                  </div>
                  <div className="assignment-actions">
                    <button
                      onClick={() => openEditModal(assignment)}
                      className="edit-btn"
                    >
                      <FiEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="delete-btn"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

{activeTab === 'submissions' && (
  <div className="submissions-section">
    <h2>Submissions</h2>
    {loading ? (
      <div className="loading-state"><p>Loading submissions...</p></div>
    ) : error ? (
      <div className="error-state"><p>{error}</p></div>
    ) : filteredSubmissions.length === 0 ? (
      <div className="empty-state"><p>No submissions found matching your criteria.</p></div>
    ) : (
      <>
        {/* Table view for large screens */}
        <div className="submissions-list table-view">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Grade</th>
                <th>Comments</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => {
                const status = getSubmissionStatus(submission);
                const isLate = status === 'late';
                const lateDays = isLate
                  ? calculateLateDays(submission.submittedAt, submission.assignment?.dueDate)
                  : 0;

                return (
                  <tr
                    key={submission.id}
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setGrade(submission.grade || '');
                      setComments(submission.comments || '');
                    }}
                  >
                    <td>{submission.user?.firstName || "Trainee"} {submission.user?.lastName || "Trainee"}</td>
                    <td>{submission.user?.email || "-"}</td>
                    <td>
                      {new Date(submission.submittedAt).toLocaleString()}
                      {isLate && lateDays > 0 && (
                        <span className="late-warning">
                          ({lateDays} day{lateDays !== 1 ? 's' : ''} late)
                        </span>
                      )}
                    </td>
                    <td>{renderStatusBadge(submission)}</td>
                    <td>{submission.grade || "-"}</td>
                    <td className="comment-cell">
                      {submission.comments?.length > 50
                        ? `${submission.comments.substring(0, 50)}...`
                        : submission.comments || "-"}
                    </td>
                    <td>
                      <button
                        className="download-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(submission.submissionLink);
                        }}
                      >
                        <FiDownload />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Card view for smaller screens */}
        <div className="submissions-list card-view">
          {filteredSubmissions.map((submission) => {
            const status = getSubmissionStatus(submission);
            const isLate = status === 'late';
            const lateDays = isLate
              ? calculateLateDays(submission.submittedAt, submission.assignment?.dueDate)
              : 0;

            return (
              <div
                key={submission.id}
                className={`submission-item ${status}`}
                onClick={() => {
                  setSelectedSubmission(submission);
                  setGrade(submission.grade || '');
                  setComments(submission.comments || '');
                }}
              >
                <div className="submission-info">
                  <h3>{submission.Assignment?.title}</h3>
                  <p className="student-name">
                    {submission.user?.firstName || "Trainee"} {submission.user?.lastName || "Trainee"}
                    {submission.user?.email && (
                      <span className="student-email"> ({submission.user.email})</span>
                    )}
                  </p>
                  <p>
                    Submitted: {new Date(submission.submittedAt).toLocaleString()}
                    {isLate && lateDays > 0 && (
                      <span className="late-warning">
                        {' '}({lateDays} day{lateDays !== 1 ? 's' : ''} late)
                      </span>
                    )}
                  </p>
                  {submission.comments && (
                    <p className="comments-preview">
                      Comments: {submission.comments.length > 50
                        ? `${submission.comments.substring(0, 50)}...`
                        : submission.comments}
                    </p>
                  )}
                </div>
                <div className="submission-status">
                  {renderStatusBadge(submission)}
                  {submission.grade && <span className="grade">Grade: {submission.grade}</span>}
                </div>
                <button
                  className="download-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadFile(submission.submissionLink);
                  }}
                >
                  <FiDownload />
                </button>
              </div>
            );
          })}
        </div>
      </>
    )}
  </div>
)}

{/* 
      {activeTab === 'reviews' && (
        <div className="reviews-section">
          <h2>Reviews</h2>
          <div className="empty-state">
            <p>Reviews content will be added here</p>
          </div>
        </div>
      )} */}

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedSubmission.Assignment?.title}</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedSubmission(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="student-info">
                <h3>
                  {selectedSubmission.user?.firstName} {selectedSubmission.user?.lastName}
                  {selectedSubmission.user?.email && (
                    <span className="student-email"> ({selectedSubmission.user.email})</span>
                  )}
                </h3>
                <p>
                  Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}
                  {getSubmissionStatus(selectedSubmission) === 'late' && (
                    <span className="late-warning">
                      {' '}({calculateLateDays(selectedSubmission.submittedAt, selectedSubmission.assignment?.dueDate)} days late)
                    </span>
                  )}
                </p>
                <p>
                  Due Date: {selectedSubmission.assignment?.dueDate 
                    ? new Date(selectedSubmission.assignment.dueDate).toLocaleString() 
                    : 'N/A'}
                </p>
                {selectedSubmission.submissionLink && (
                  <button
                    className="download-btn"
                    onClick={() => downloadFile(selectedSubmission.submissionLink)}
                  >
                    <FiDownload /> Download Submission
                  </button>
                )}
              </div>

              <form onSubmit={handleGradeSubmit}>
                <div className="form-group">
                  <label>Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    required
                    disabled={isSubmittingGrade}
                  >
                    <option value="">Select grade</option>
                    <option value="90">A (75%+)</option>
                    <option value="80">B (65–74%)</option>
                    <option value="70">C (55–64%)</option>
                    <option value="60">D (50–54%)</option>
                    <option value="40">F (Below 50%)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Feedback</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Provide constructive feedback..."
                    rows="5"
                    disabled={isSubmittingGrade}
                  />
                </div>

                {modalError && <p className="error-message">{modalError}</p>}

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setSelectedSubmission(null)}
                    disabled={isSubmittingGrade}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmittingGrade}
                  >
                    {isSubmittingGrade ? 'Submitting...' : 'Submit Grade'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Assignment Modal */}
      {(isAssignmentModalOpen || isEditModalOpen) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{assignmentForm.id ? 'Edit Assignment' : 'Create New Assignment'}</h2>
              <button className="close-btn" onClick={closeAssignmentModal}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleAssignmentSubmit}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={assignmentForm.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={assignmentForm.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>

                {/* Multi-select for specialization */}
                <div className="form-group">
                  <label>Specializations</label>
                  <div className="specialization-checkboxes">
                    {[
                      'developers',
                      'digital marketers',
                      'finance',
                      'it support',
                      'sales',
                      'data analyst'
                    ].map((spec) => (
                      <label key={spec} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={assignmentForm.specialization.includes(spec)}
                          onChange={() => handleSpecializationChange(spec)}
                        />
                        {spec}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={assignmentForm.dueDate}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]} 
                  />
                </div>

                <div className="form-group">
                  <label>Assign to Users</label>
                  <div className="email-autocomplete">
                    <div className="selected-tags">
                      {selectedEmails.map((email) => (
                        <span key={email} className="tag">
                          {email}
                          <button type="button" onClick={() => handleRemoveEmail(email)}>×</button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={emailInput}
                      onChange={(e) => handleEmailInput(e.target.value)}
                      placeholder="Type to search emails..."
                    />
                    {filteredUsers.length > 0 && (
                      <ul className="autocomplete-dropdown">
                        {filteredUsers.map((user) => (
                          <li key={user.email} onClick={() => handleAddEmail(user.email)}>
                            {user.email} ({user.firstName} {user.lastName})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {modalError && <p className="error-message">{modalError}</p>}

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={closeAssignmentModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? (assignmentForm.id ? 'Updating...' : 'Creating...')
                      : (assignmentForm.id ? 'Update Assignment' : 'Create Assignment')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilitatorSubmittedWork;