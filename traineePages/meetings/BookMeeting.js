import React, { useState, useEffect } from 'react';
import {
  FaCalendarAlt, FaClock, FaUserFriends, FaVideo, FaTimes, FaCheck, FaExclamationTriangle
} from 'react-icons/fa';
import axios from 'axios';
import './BookMeeting.css';

axios.defaults.withCredentials = true;

function BookMeeting({ onClose, user, existingMeeting = null }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    attendees: [],
    sendInvites: true,
    meetingType: 'general',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [trainees, setTrainees] = useState([]);
  const [busySlots, setBusySlots] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (existingMeeting) {
      const startDate = new Date(existingMeeting.start);
      const endDate = new Date(existingMeeting.end);
      setFormData({
        title: existingMeeting.title || '',
        description: existingMeeting.description || '',
        date: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        attendees: (existingMeeting.attendees || []).map(a => a.email),
        sendInvites: existingMeeting.sendInvites ?? true,
        meetingType: existingMeeting.meetingType || 'general',
      });
    }
  }, [existingMeeting]);

  useEffect(() => {
    const fetchTrainees = async () => {
      setIsLoadingData(true);
      try {
        const res = await axios.get('http://localhost:5000/users', {
          withCredentials: true,
        });
        setTrainees(res.data);
      } catch (err) {
        console.error('Error fetching trainees:', err);
        setError('Failed to load trainees');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchTrainees();
  }, []);

  useEffect(() => {
    if (formData.date && formData.startTime && formData.endTime && formData.attendees.length > 0) {
      checkAvailability();
    } else {
      setBusySlots([]);
    }
  }, [formData.date, formData.startTime, formData.endTime, formData.attendees]);

  const checkAvailability = async () => {
    try {
      const res = await axios.post('http://localhost:5000/calendar/availability', {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        attendees: formData.attendees
      }, {
        withCredentials: true,
      });
      setBusySlots(res.data.busySlots || []);
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

  const handleAddAttendee = (email) => {
    if (!formData.attendees.includes(email)) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, email]
      }));
    }
  };

  const handleRemoveAttendee = (email) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(e => e !== email)
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
        title: formData.title.trim(),
        description: formData.description.trim(),
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        attendees: formData.attendees.map(email => ({ email })),
        meetingType: formData.meetingType,
        sendInvites: formData.sendInvites
      };

      const response = existingMeeting
        ? await axios.put(
            `http://localhost:5000/calendar/meetings/${existingMeeting.id}`,
            eventData,
            { withCredentials: true }
          )
        : await axios.post('http://localhost:5000/calendar/meetings', eventData, { withCredentials: true });

      setSuccess(true);
      setTimeout(() => {
        onClose(response.data);
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to save meeting'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="book-meeting-modal">
        <div className="modal-body success">
          <FaCheck className="success-icon" />
          <h3>Meeting {existingMeeting ? 'Updated' : 'Scheduled'}!</h3>
          <p>Your meeting has been successfully {existingMeeting ? 'modified' : 'created'}.</p>
          <button className="success-close-btn" onClick={() => onClose()}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-meeting-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="modal-title">{existingMeeting ? 'Modify Meeting' : 'Schedule New Meeting'}</h2>
          <button className="close-btn" onClick={() => onClose()} aria-label="Close modal">
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {isLoadingData ? (
            <div className="loading-data">
              <div className="loading-spinner" aria-label="Loading"></div>
              <p>Loading meeting data...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="error-message" role="alert">
                  <FaExclamationTriangle aria-hidden="true" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="meeting-form" noValidate>
                <div className="form-section">
                  <h3 className="section-title">Meeting Details</h3>

                  <div className="form-group">
                    <label htmlFor="title"><FaVideo /> Meeting Title *</label>
                    <input
                      id="title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Enter meeting title"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="meetingType">Meeting Type *</label>
                    <select
                      id="meetingType"
                      name="meetingType"
                      value={formData.meetingType}
                      onChange={handleChange}
                      required
                    >
                      <option value="general">General</option>
                      <option value="training">Training</option>
                      <option value="review">Review</option>
                      <option value="evaluation">Evaluation</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Add meeting agenda or notes..."
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Date & Time</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="date"><FaCalendarAlt /> Date *</label>
                      <input
                        id="date"
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="form-group time-group">
                      <label> <FaClock /> Time *</label>
                      <div className="time-inputs">
                        <input
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleChange}
                          required
                          aria-label="Start time"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleChange}
                          required
                          aria-label="End time"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Attendees</h3>
                  <div className="form-group">
                    <label><FaUserFriends /> Add Attendees</label>
                    <div className="attendee-selection">
                      {trainees.length === 0 ? (
                        <p>No attendees available</p>
                      ) : (
                        trainees.map(trainee => (
                          <div key={trainee.id} className="attendee-option">
                            <input
                              type="checkbox"
                              id={`attendee-${trainee.id}`}
                              checked={formData.attendees.includes(trainee.email)}
                              onChange={() =>
                                formData.attendees.includes(trainee.email)
                                  ? handleRemoveAttendee(trainee.email)
                                  : handleAddAttendee(trainee.email)
                              }
                            />
                            <label htmlFor={`attendee-${trainee.id}`}>
                              {trainee.name} ({trainee.email})
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {busySlots.length > 0 && (
                  <div className="form-section conflict-section" role="alert" aria-live="assertive">
                    <h3 className="section-title conflict-title">
                      <FaExclamationTriangle aria-hidden="true" /> Scheduling Conflicts
                    </h3>
                    <div className="conflict-list">
                      {busySlots.map((slot, i) => {
                        const attendeeName = trainees.find(t => t.email === slot.attendeeEmail)?.name || slot.attendeeEmail;
                        return (
                          <div key={i} className="conflict-item">
                            <div className="conflict-attendee">{attendeeName}</div>
                            <div className="conflict-time">
                              {new Date(slot.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(slot.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="conflict-note">
                      You can still schedule the meeting, but some attendees may be unavailable.
                    </p>
                  </div>
                )}

                <div className="form-actions">
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

                  <div className="action-buttons">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => onClose()}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner" aria-hidden="true"></span>
                          {existingMeeting ? 'Updating...' : 'Scheduling...'}
                        </>
                      ) : existingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookMeeting;
