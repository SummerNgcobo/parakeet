import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BookMeeting from "./BookMeeting";
import {
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaPlus,
  FaTh,
  FaCalendarDay,
  FaFilter,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
} from "react-icons/fa";
import { useUser } from "../../../contexts/UserContext";
import CalendarView from "./CalendarView";
import "./Meeting.css";

axios.defaults.withCredentials = true;

function Bookings() {
  const { user } = useUser();
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();

  const fetchMeetings = async () => {
    if (!user || !user.email) return;

    setIsLoading(true);
    setError(null);
    try {
      const url =
        user.role === "admin"
          ? "http://localhost:5000/calendar/meetings/all"
          : "http://localhost:5000/calendar/meetings";

      const res = await axios.get(url, { withCredentials: true });
      setUpcomingMeetings(res.data);
    } catch (err) {
      console.error("Error fetching meetings:", err.response || err.message || err);
      setError("Failed to load meetings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.email) {
      fetchMeetings();
    }
  }, [user]);

  const filteredMeetings = useMemo(() => {
    if (!user) return [];

    return upcomingMeetings.filter((meeting) => {
      if (filter === "all") return true;
      if (filter === "my") {
        return (
          meeting.attendees.includes(user.email) ||
          meeting.organizer === user.email
        );
      }
      return meeting.meetingType === filter;
    });
  }, [upcomingMeetings, filter, user]);

  const handleMeetingCreated = (newMeeting) => {
    setUpcomingMeetings((prev) => [...prev, newMeeting]);
    setShowBookingModal(false);
  };

  const formatDate = (dateString) => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      training: "#4e79a7",
      evaluation: "#e15759",
      review: "#59a14f",
      general: "#79706e",
    };
    return colors[category] || colors.general;
  };

  const handleRetry = () => {
    setError(null);
    fetchMeetings();
  };

  if (!user) {
    return (
      <div className="user-loading">
        <h3>Loading user data...</h3>
        <p>Please ensure you are logged in.</p>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <div className="header-content">
          <h1>{user.role === "admin" ? "Trainee Meetings" : "My Meetings"}</h1>
          <p>Manage upcoming sessions and schedule new ones</p>
        </div>

        <div className="header-actions">
          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-pressed={viewMode === "grid"}
              aria-label="Grid view"
            >
              <FaTh /> Grid
            </button>
            <button
              className={`view-btn ${viewMode === "calendar" ? "active" : ""}`}
              onClick={() => setViewMode("calendar")}
              aria-pressed={viewMode === "calendar"}
              aria-label="Calendar view"
            >
              <FaCalendarDay /> Calendar
            </button>
          </div>

          <div className="filters">
            <div className="filter-select-wrapper">
              <FaFilter className="filter-icon" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
                aria-label="Filter meetings"
              >
                <option value="all">All Meetings</option>
                <option value="my">My Meetings</option>
                <option value="training">Training</option>
                <option value="review">Reviews</option>
                <option value="evaluation">Evaluations</option>
              </select>
            </div>
          </div>

          <button
            className="book-meeting-btn"
            onClick={() => setShowBookingModal(true)}
            aria-label="Book a new meeting"
          >
            <FaPlus /> Book a Meeting
          </button>
        </div>
      </div>

      {error && (
        <div className="error-state">
          <FaExclamationTriangle />
          <span>{error}</span>
          <button onClick={handleRetry} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {isLoading && (
        <div className="loading-state">
          <FaSpinner className="spinner-icon" />
          <span>Loading meetings...</span>
        </div>
      )}

      {!isLoading && !error && filteredMeetings.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No meetings found</h3>
          <p>Get started by booking a new meeting.</p>
         
        </div>
      )}

      {!isLoading && !error && filteredMeetings.length > 0 && viewMode === "grid" && (
        <div className="meetings-grid">
          {filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="meeting-card"
              onClick={() => navigate(`/meetings/${meeting.id}`)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) =>
                e.key === "Enter" && navigate(`/meetings/${meeting.id}`)
              }
              aria-label={`Meeting: ${meeting.title}`}
              style={{
                borderLeft: `4px solid ${getCategoryColor(meeting.meetingType)}`,
              }}
            >
              <div className="card-header">
                <span
                  className="category-tag"
                  style={{
                    backgroundColor: getCategoryColor(meeting.meetingType),
                    color: meeting.meetingType === "general" ? "#fff" : "#333",
                  }}
                >
                  {meeting.meetingType.charAt(0).toUpperCase() +
                    meeting.meetingType.slice(1)}
                </span>
                <span className="meeting-time">
                  <FaClock /> {formatTime(meeting.start)}
                </span>
              </div>

              <h3 className="meeting-title">{meeting.title}</h3>

              {meeting.description && (
                <p className="meeting-description">
                  {meeting.description.length > 100
                    ? `${meeting.description.substring(0, 100)}...`
                    : meeting.description}
                </p>
              )}

              <div className="meeting-details">
                <div className="detail-item">
                  <FaCalendarAlt />
                  <span>{formatDate(meeting.start)}</span>
                </div>
                <div className="detail-item">
                  <FaUsers />
                  <span>
                    {meeting.attendees.length} attendee
                    {meeting.attendees.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {meeting.meetingLink && (
                <a
                  href={meeting.meetingLink}
                  className="meeting-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Join Meeting
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && filteredMeetings.length > 0 && viewMode === "calendar" && (
        <div className="calendar-view-container">
          <CalendarView meetings={filteredMeetings} />
          <button className="switch-view-btn" onClick={() => setViewMode("grid")}>
            <FaArrowLeft /> Switch to Grid View
          </button>
        </div>
      )}

      {showBookingModal && (
        <BookMeeting
          onClose={() => setShowBookingModal(false)}
          onMeetingCreated={handleMeetingCreated}
          user={user}
        />
      )}
    </div>
  );
}

export default Bookings;
