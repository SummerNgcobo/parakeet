import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../../../contexts/UserContext"; 
import "./TraineeLeave.css";

// Define your API base URL
const API_BASE = "http://localhost:5000";

const TraineeLeave = () => {
  const { user } = useUser();
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const leaveTypeEmojis = {
    Sick: "🤒",
    Personal: "😊",
    "Ad Hoc": "🎯",
    Family: "👨‍👩‍👧‍👦"
  };

  const statusEmojis = {
    Pending: "⏳",
    Approved: "✅",
    Rejected: "❌"
  };

  // Fetch leave requests for user on mount and when user changes
  useEffect(() => {
    if (!user?.email) return;

    const fetchLeaveRequests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use email in API call
        const response = await axios.get(`${API_BASE}/leave/user/${encodeURIComponent(user.email)}`);
        setRequests(response.data);
      } catch (err) {
        setError("Failed to fetch leave requests.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [user]);

  const resetForm = () => {
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!leaveType || !startDate || !endDate || !reason) {
      setError("Please fill all fields.");
      setIsSubmitting(false);
      return;
    }

    const data = {
      email: user.email,      // Send email instead of userId
      leaveType,
      startDate,
      endDate,
      reason
    };

    try {
      if (editingId) {
        // Update existing leave request
        await axios.put(`${API_BASE}/leave/${editingId}`, data);
        setRequests(
          requests.map((req) =>
            req.id === editingId ? { ...req, ...data, status: "Pending" } : req
          )
        );
        resetForm();
      } else {
        // Create new leave request
        const response = await axios.post(`${API_BASE}/leave`, data);
        setRequests([response.data, ...requests]);
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit leave request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (request) => {
    setEditingId(request.id);
    setLeaveType(request.leaveType);
    setStartDate(request.startDate);
    setEndDate(request.endDate);
    setReason(request.reason);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="leave-request-container">
      <div className="form-header">
        <h2 className="leave-request-title">Take a Break!</h2>
        <p className="form-subtitle">
          Fill out this fun form to request your well-deserved time off
        </p>
      </div>

      <form className="leave-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group floating">
          <select
            className="form-input"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            required
          >
            <option value="" disabled></option>
            <option value="Sick">
              Sick Leave {leaveTypeEmojis["Sick"]}
            </option>
            <option value="Personal">
              Personal Leave {leaveTypeEmojis["Personal"]}
            </option>
            <option value="Ad Hoc">
              Ad Hoc Leave {leaveTypeEmojis["Ad Hoc"]}
            </option>
            <option value="Family">
              Family Responsibility {leaveTypeEmojis["Family"]}
            </option>
          </select>
          <label className="form-label">Leave Type</label>
          <div className="focus-bg"></div>
        </div>

        <div className="form-group floating">
          <input
            className="form-input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <label className="form-label">Start Date</label>
          <div className="focus-bg"></div>
        </div>

        <div className="form-group floating">
          <input
            className="form-input"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
          <label className="form-label">End Date</label>
          <div className="focus-bg"></div>
        </div>

        <div className="form-group floating textarea-group">
          <textarea
            className="form-textarea"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
          <label className="form-label">Reason (Be creative!)</label>
          <div className="focus-bg"></div>
        </div>

        <button
          type="submit"
          className={`form-btn ${isSubmitting ? "submitting" : ""}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              {editingId ? "Updating..." : "Submitting..."}
            </>
          ) : editingId ? (
            "Update Request"
          ) : (
            "Submit Request"
          )}
        </button>
      </form>

      {isLoading ? (
        <p>Loading your leave requests...</p>
      ) : requests.length > 0 ? (
        <div className="requests-list">
          <h3 className="requests-title">Your Leave Requests</h3>
          {requests.map((request) => (
            <div
              key={request.id}
              className={`request-card ${request.status.toLowerCase()}`}
            >
              <div className="request-header">
                <span className="request-type">
                  {leaveTypeEmojis[request.leaveType]} {request.leaveType}
                </span>
                <span className="request-status">
                  {statusEmojis[request.status]} {request.status}
                </span>
              </div>
              <div className="request-dates">
                {new Date(request.startDate).toLocaleDateString()} -{" "}
                {new Date(request.endDate).toLocaleDateString()}
              </div>
              <div className="request-reason">{request.reason}</div>
              <div className="request-footer">
                <span className="request-date">
                  Submitted:{" "}
                  {new Date(request.createdAt || request.submittedAt).toLocaleString()}
                </span>
                {request.status === "Pending" && (
                  <button onClick={() => handleEdit(request)} className="edit-btn">
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>You have no leave requests yet.</p>
      )}

      <div className="form-footer">
        <p>Need urgent leave? Call your manager ☎️</p>
      </div>
    </div>
  );
};

export default TraineeLeave;