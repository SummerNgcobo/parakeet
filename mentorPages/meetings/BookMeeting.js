import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUserFriends, FaPaperclip, FaVideo, FaTimes, FaCheck } from 'react-icons/fa';
import axios from 'axios';

function BookMeeting({ onClose, user }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    attendees: [],
    sendInvites: true,
    meetingType: 'general',
    traineeId: null,
    room: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [trainees, setTrainees] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [busySlots, setBusySlots] = useState([]);

  // Fetch trainees and rooms on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [traineesRes, roomsRes] = await Promise.all([
          axios.get('/api/trainees'),
          axios.get('/api/rooms')
        ]);
        setTrainees(traineesRes.data);
        setRooms(roomsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  // Check availability when date or times change
  useEffect(() => {
    if (formData.date && formData.startTime && formData.endTime) {
      checkAvailability();
    }
  }, [formData.date, formData.startTime, formData.endTime, formData.attendees]);

  const checkAvailability = async () => {
    try {
      const res = await axios.post('/api/calendar/availability', {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        attendees: formData.attendees
      });
      setBusySlots(res.data.busySlots);
    } catch (err) {
      console.error('Error checking availability:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddAttendee = (trainee) => {
    if (!formData.attendees.includes(trainee.id)) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, trainee.id]
      }));
    }
  };

  const handleRemoveAttendee = (traineeId) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(id => id !== traineeId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
      
      if (startDateTime >= endDateTime) {
        throw new Error('End time must be after start time');
      }
      
      const eventData = {
        title: formData.title,
        description: formData.description,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        attendees: formData.attendees,
        organizer: user.id,
        meetingType: formData.meetingType,
        traineeId: formData.traineeId,
        room: formData.room,
        sendInvites: formData.sendInvites
      };
      
      await axios.post('/api/meetings', eventData);
      
      setSuccess(true);
      setTimeout(() => {
        onClose(true);
      }, 1500);
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create meeting');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="book-meeting-modal">
        <div className="modal-body" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="success-animation">
            <FaCheck className="success-icon" />
          </div>
          <h3>Meeting Scheduled!</h3>
          <p>Your meeting has been successfully added to the TMA calendar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="book-meeting-modal">
      <div className="modal-header">
        <h2>Schedule New Meeting</h2>
        <button className="close-btn" onClick={() => onClose(false)}>
          <FaTimes />
        </button>
      </div>
      
      <div className="modal-body">
        <form onSubmit={handleSubmit} className="meeting-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>
              <FaVideo style={{ marginRight: '8px' }} />
              Meeting Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Team sync, 1:1, etc."
              required
            />
          </div>
          
          <div className="form-group">
            <label>Meeting Type</label>
            <select
              name="meetingType"
              value={formData.meetingType}
              onChange={handleChange}
              required
            >
              <option value="general">General Meeting</option>
              <option value="training">Training Session</option>
              <option value="review">Code Review</option>
              <option value="evaluation">Evaluation</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add meeting agenda or notes..."
              rows="3"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>
                <FaCalendarAlt style={{ marginRight: '8px' }} />
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="form-group">
              <label>
                <FaClock style={{ marginRight: '8px' }} />
                Time
              </label>
              <div className="time-inputs">
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
                <span className="time-separator">-</span>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label>
              <FaUserFriends style={{ marginRight: '8px' }} />
              Select Attendees
            </label>
            <div className="attendee-selection">
              {trainees.map(trainee => (
                <div key={trainee.id} className="attendee-option">
                  <input
                    type="checkbox"
                    id={`trainee-${trainee.id}`}
                    checked={formData.attendees.includes(trainee.id)}
                    onChange={() => 
                      formData.attendees.includes(trainee.id) 
                        ? handleRemoveAttendee(trainee.id) 
                        : handleAddAttendee(trainee)
                    }
                  />
                  <label htmlFor={`trainee-${trainee.id}`}>
                    {trainee.name} ({trainee.role})
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Meeting Room</label>
            <select
              name="room"
              value={formData.room}
              onChange={handleChange}
            >
              <option value="">Virtual Meeting</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} ({room.capacity} people)
                </option>
              ))}
            </select>
          </div>
          
          {busySlots.length > 0 && (
            <div className="availability-warning">
              <h4>Conflict Warning:</h4>
              {busySlots.map((slot, index) => (
                <div key={index} className="conflict-slot">
                  {slot.attendeeName} is busy from {slot.start} to {slot.end}
                </div>
              ))}
            </div>
          )}
          
          {user.role === 'admin' && (
            <div className="form-group">
              <label>Related Trainee</label>
              <select
                name="traineeId"
                value={formData.traineeId || ''}
                onChange={handleChange}
              >
                <option value="">None</option>
                {trainees.map(trainee => (
                  <option key={trainee.id} value={trainee.id}>
                    {trainee.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="sendInvites"
              name="sendInvites"
              checked={formData.sendInvites}
              onChange={handleChange}
            />
            <label htmlFor="sendInvites">Send calendar invites to attendees</label>
          </div>
          
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Scheduling...
              </>
            ) : (
              'Schedule Meeting'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

BookMeeting.defaultProps = {
  user: {
    id: 1,
    name: "Test Admin",
    email: "admin@tma.com",
    role: "admin" 
  }
};
export default BookMeeting;