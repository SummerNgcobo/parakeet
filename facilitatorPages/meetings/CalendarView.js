import React from "react";
import { format, parseISO } from "date-fns";
import { FaCalendarAlt, FaClock, FaUsers, FaMapMarkerAlt } from "react-icons/fa";
import "./CalendarView.css";

function CalendarView({ meetings }) {
  // Group meetings by date
  const meetingsByDate = meetings.reduce((acc, meeting) => {
    const date = format(parseISO(meeting.start), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(meeting);
    return acc;
  }, {});

  // Sort dates chronologically
  const sortedDates = Object.keys(meetingsByDate).sort();

  return (
    <div className="calendar-view">
      {sortedDates.length === 0 ? (
        <div className="no-events">
          <p>No meetings scheduled</p>
        </div>
      ) : (
        sortedDates.map((date) => (
          <div key={date} className="calendar-day">
            <h3 className="day-header">
              {format(parseISO(date), 'EEEE, MMMM do')}
            </h3>
            <div className="day-events">
              {meetingsByDate[date]
                .sort((a, b) => new Date(a.start) - new Date(b.start))
                .map((meeting) => (
                  <div key={meeting.id} className="calendar-event">
                    <div className="event-time">
                      {format(parseISO(meeting.start), 'h:mm a')} -{' '}
                      {format(parseISO(meeting.end), 'h:mm a')}
                    </div>
                    <div className="event-details">
                      <h4 className="event-title">{meeting.title}</h4>
                      <div className="event-meta">
                        <span className="event-type" style={{ 
                          backgroundColor: getCategoryColor(meeting.meetingType),
                          color: meeting.meetingType === 'general' ? '#fff' : '#333'
                        }}>
                          {meeting.meetingType}
                        </span>
                        {meeting.room && (
                          <span className="event-location">
                            <FaMapMarkerAlt /> {meeting.room}
                          </span>
                        )}
                      </div>
                      {meeting.description && (
                        <p className="event-description">{meeting.description}</p>
                      )}
                      {meeting.meetingLink && (
                        <a 
                          href={meeting.meetingLink} 
                          className="event-link"
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Join Meeting
                        </a>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Helper function to get category color
function getCategoryColor(category) {
  const colors = {
    training: "#4e79a7",
    evaluation: "#e15759",
    review: "#59a14f",
    general: "#79706e"
  };
  return colors[category] || colors.general;
}

export default CalendarView;