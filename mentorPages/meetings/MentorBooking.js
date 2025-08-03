import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MentorBooking.css";
import axios from 'axios';
import BookMeeting from './BookMeeting';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUsers, 
  FaVideo, 
  FaTimes, 
  FaPlus, 
  FaChevronRight,
  FaMapMarkerAlt
} from "react-icons/fa";

function Bookings({ user }) {
    const [upcomingMeetings, setUpcomingMeetings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const navigate = useNavigate();
    

    useEffect(() => {
        const fetchMeetings = async () => {
            if (!user) return;

            try {
                const url = user.role === 'admin' 
                    ? '/api/meetings/all' 
                    : '/api/meetings';

                const res = await axios.get(url);
                setUpcomingMeetings(res.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching meetings:', error);
                setIsLoading(false);
            }
        };

        fetchMeetings();
    }, [user]);

    if (!user) {
        return <div>Loading user data...</div>;
    }

    const handleBookMeeting = () => {
        setShowBookingModal(true);
    };

    const handleMeetingCreated = (newMeeting) => {
        setUpcomingMeetings([...upcomingMeetings, newMeeting]);
        setShowBookingModal(false);
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getCategoryColor = (category) => {
        switch(category) {
            case 'training': return '#96d5d3';
            case 'evaluation': return '#ff9f43';
            case 'review': return '#5f27cd';
            default: return '#96d5d3';
        }
    };

    const filteredMeetings = upcomingMeetings.filter(meeting => {
        if (filter === 'all') return true;
        if (filter === 'my') return meeting.attendees.includes(user.id);
        return meeting.meetingType === filter;
    });

    return (
        <div className="bookings-container">
            <div className="bookings-header">
                <div className="header-content">
                    <h1>{user.role === 'admin' ? 'Trainee Meetings' : 'My Meetings'}</h1>
                    <p>Manage upcoming sessions and schedule new ones</p>
                </div>

                <div className="header-actions">
                    <div className="view-controls">
                        <button 
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            Grid View
                        </button>
                        <button 
                            className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                            onClick={() => setViewMode('calendar')}
                        >
                            Calendar View
                        </button>
                    </div>

                    <div className="filters">
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Meetings</option>
                            <option value="my">My Meetings</option>
                            <option value="training">Training</option>
                            <option value="review">Reviews</option>
                            <option value="evaluation">Evaluations</option>
                        </select>
                    </div>

                    <button 
                        className="book-meeting-btn"
                        onClick={handleBookMeeting}
                    >
                        <FaPlus className="btn-icon" />
                        Book a Meeting
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Loading meetings...</p>
                </div>
            ) : filteredMeetings.length === 0 ? (
                <div className="no-meetings">
                    <div className="empty-state">
                        <div className="empty-icon">📅</div>
                        <h3>No meetings found</h3>
                        <p>Get started by booking a new meeting</p>
                        <button 
                            className="book-meeting-btn"
                            onClick={handleBookMeeting}
                        >
                            <FaPlus className="btn-icon" />
                            Book Meeting
                        </button>
                    </div>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="meetings-grid">
                    {filteredMeetings.map((meeting) => (
                        <div 
                            key={meeting.id} 
                            className="meeting-card"
                            onMouseEnter={() => setHoveredCard(meeting.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            style={{ 
                                borderLeft: `5px solid ${getCategoryColor(meeting.meetingType)}`,
                                transform: hoveredCard === meeting.id ? 'translateY(-5px)' : 'none'
                            }}
                        >
                            <div className="card-header">
                                <span 
                                    className="category-tag"
                                    style={{ backgroundColor: getCategoryColor(meeting.meetingType) }}
                                >
                                    {meeting.meetingType}
                                </span>
                                <span className="meeting-time">
                                    <FaClock /> {new Date(meeting.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>

                            <h3>{meeting.title}</h3>

                            <div className="meeting-details">
                                <div className="detail-item">
                                    <FaCalendarAlt />
                                    <span>{formatDate(meeting.start)}</span>
                                </div>
                                <div className="detail-item">
                                    <FaUsers />
                                    <span>
                                        {meeting.attendeeNames ? 
                                            meeting.attendeeNames.join(", ") : 
                                            `${meeting.attendeeCount} attendees`}
                                    </span>
                                </div>
                                {meeting.room && (
                                    <div className="detail-item">
                                        <FaMapMarkerAlt />
                                        <span>{meeting.room}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="calendar-view">Calendar view not implemented yet.</div>
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
