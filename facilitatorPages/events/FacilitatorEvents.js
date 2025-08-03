import React, { useState, useEffect } from 'react';
import { FiCalendar, FiPlus, FiTrash2, FiEdit2, FiClock, FiMapPin } from 'react-icons/fi';
import axios from 'axios';
import './FacilitatorEvents.css';

const FacilitatorEvents = ({ userEmail }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    type: 'training'
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateEvent = () => {
    setIsCreating(true);
    setEditingEvent(null);
    setFormData({
      title: '',
      date: '',
      time: '',
      location: '',
      type: 'training'
    });
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event.id);
    setIsCreating(false);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      type: event.type
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await axios.put(`http://localhost:5000/api/events/${editingEvent}`, formData);
        setEvents(events.map(event =>
          event.id === editingEvent ? { ...event, ...formData } : event
        ));
      } else {
        const response = await axios.post('http://localhost:5000/api/events', formData);
        setEvents([...events, response.data]);
      }
      setIsCreating(false);
      setEditingEvent(null);
    } catch (err) {
      console.error('Error saving event:', err);
      setError('Failed to save event. Please try again.');
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`);
      setEvents(events.filter(event => event.id !== id));
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event. Please try again.');
    }
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingEvent(null);
  };

  const formatTimeDisplay = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hourNum = parseInt(hours, 10);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const formattedHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${formattedHour}:${minutes} ${period}`;
  };

  if (loading) return <div className="events-container">Loading events...</div>;
  if (error) return <div className="events-container">Error: {error}</div>;

  return (
    <div className="events-container">
      <div className="events-header">
        <h1><FiCalendar /> Event Management</h1>
        <button onClick={handleCreateEvent} className="create-btn">
          <FiPlus /> Create Event
        </button>
      </div>

      {(isCreating || editingEvent) && (
        <div className="event-form-container">
          <h2>{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Event Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Event Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="training">Training</option>
                  <option value="communication">Communication</option>
                  <option value="networking">Networking</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={cancelForm} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="events-list">
        {events.length === 0 ? (
          <div className="empty-state">
            <p>No events scheduled yet. Create your first event!</p>
          </div>
        ) : (
          events.map(event => {
            const attendingCount = (event.attendances || []).filter(a => a.attending).length;

            return (
              <div key={event.id} className={`event-card event-type-${event.type}`}>
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <div className="event-actions">
                    <button onClick={() => handleEditEvent(event)} className="edit-btn">
                      <FiEdit2 />
                    </button>
                    <button onClick={() => handleDeleteEvent(event.id)} className="delete-btn">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className="event-details">
                  <div className="detail-item">
                    <FiCalendar />
                    <span>{new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>

                  <div className="detail-item">
                    <FiClock />
                    <span>{formatTimeDisplay(event.time)}</span>
                  </div>

                  <div className="detail-item">
                    <FiMapPin />
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="event-type">
                  <span className={`type-badge event-type-${event.type}`}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                </div>

                <div className="event-footer">
                  <span className="attendees">
                    {attendingCount} attendee{attendingCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FacilitatorEvents;
