import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UpcomingEvents.css';
import { useUser } from '../../../contexts/UserContext'; 

function UpcomingEvents() {
  const { user } = useUser();
  const email = user?.email;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);


  function isToday(dateString) {
    const today = new Date();
    const eventDate = new Date(dateString);
    return today.toDateString() === eventDate.toDateString();
  }

    async function updateAttendance(eventId, status) {
    try {
      console.log('📧 Sending attendance update for email:', email); // now correct

      const res = await axios.post(`http://localhost:5000/api/events/${eventId}/attendance`, {
        email,
        attending: status,
      });

      const updatedAttendance = {
        user: {
          email,
          firstName: res.data.user?.firstName || 'You',
          lastName: res.data.user?.lastName || '',
        },
        attending: status,
      };

      setEvents(events.map(event => {
        if (event.id === eventId) {
          const existing = (event.attendances || []).filter(
            a => a.user?.email !== email
          );
          return {
            ...event,
            attendances: [...existing, updatedAttendance],
          };
        }
        return event;
      }));
    } catch (err) {
      console.error('Failed to update attendance:', err);
    }
  }

  if (loading) return <div className="events-container">Loading events...</div>;
  if (error) return <div className="events-container">Error: {error}</div>;

  return (
    <div className="events-container">
      <h2 className="section-title">Upcoming Events</h2>
      <div className="events-list">
        {events.map(event => {
          const userAttendance = event.attendances?.find(
            a => a.user?.email === email  // ✅ updated
          );
          const attendingStatus = userAttendance ? userAttendance.attending : null;

          const attendingUsers = event.attendances
            ?.filter(a => a.attending)
            .map(a =>
              a.user?.firstName || a.user?.lastName
                ? `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.trim()
                : a.user?.email
            );

          return (
            <div key={event.id} className={`event-card event-type-${event.type}`}>
              <div className="event-date-container">
                <div className="event-date">
                  {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric' })}
                </div>
                <div className="event-month">
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                </div>
              </div>
              <div className="event-details">
                <h3 className="event-title">{event.title}</h3>
                <div className="event-info">
                  <div className="event-time">{event.time}</div>
                  <div className="event-location">{event.location}</div>
                </div>
                {isToday(event.date) && <span className="today-tag">Today</span>}
                <div className="event-actions">
                  <div className="attendance-selection">
                    <span className="attending-label">Attending?</span>
                    <div className="attendance-buttons">
                      <button
                        className={`attendance-button yes-button ${attendingStatus === true ? 'selected' : ''}`}
                        onClick={() => updateAttendance(event.id, true)}
                      >
                        Yes
                      </button>
                      <button
                        className={`attendance-button no-button ${attendingStatus === false ? 'selected' : ''}`}
                        onClick={() => updateAttendance(event.id, false)}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>

                {attendingUsers && attendingUsers.length > 0 && (
                  <div className="event-attendees">
                    <strong>Attending:</strong>
                    <ul>
                      {attendingUsers.map((name, index) => (
                        <li key={index}>{name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {events.length === 0 && (
        <div className="no-events">No upcoming events scheduled</div>
      )}
    </div>
  );
}

export default UpcomingEvents;
