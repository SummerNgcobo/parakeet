import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../../../contexts/UserContext"; 
import "./TraineeAttendance.css";

const API_BASE = "http://localhost:5000";

const ClockSystem = () => {
  const { user } = useUser();
  const [status, setStatus] = useState("ready");
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [workDuration, setWorkDuration] = useState("00:00:00");
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState(null);
  const [isAtOffice, setIsAtOffice] = useState(false);
  const [locationDetails, setLocationDetails] = useState(null);

  const OFFICE = {
    address: "155 West Street, Sandton, Johannesburg, GP",
    coordinates: {
      lat: -26.104029891448988,
      lng: 28.05264119446373
    },
    radius: 150,
    landmarks: [
      "Sandton Train Station (short walk)",
      "Financial institutions",
      "Cultural attractions"
    ]
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    const checkClockStatus = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Changed to fetch attendance by email, not user id
        const response = await axios.get(`${API_BASE}/attendance/user/email/${encodeURIComponent(user.email)}?startDate=${today.toISOString()}`);

        console.log("Clock status response:", response.data);
        const todayRecords = response.data;
        if (todayRecords.length > 0) {
          const record = todayRecords[0];
          setClockInTime(new Date(record.clockIn));
          setLocationDetails(record.location);
          if (record.clockOut) {
            setClockOutTime(new Date(record.clockOut));
            setStatus("ended");
          } else {
            setStatus("working");
          }
        }
      } catch (err) {
        console.error("Error checking clock status:", err);
      }
    };

    if (user?.email) checkClockStatus();
  }, [user]);

  const verifyOfficeLocation = () => {
    setIsLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const distance = calculateDistance(
          latitude, longitude,
          OFFICE.coordinates.lat, OFFICE.coordinates.lng
        );
        const atOffice = distance <= OFFICE.radius;
        setIsAtOffice(atOffice);

        if (atOffice) {
          const now = new Date();
          setClockInTime(now);
          setStatus("working");

          const location = {
            distance: Math.round(distance),
            accuracy: Math.round(accuracy),
            coordinates: { lat: latitude, lng: longitude }
          };
          setLocationDetails(location);

          try {
            // Send email instead of userId
            await axios.post(`${API_BASE}/attendance/clock-in`, {
              email: user.email,
              clockIn: now.toISOString(),
              location
            });
          } catch (err) {
            setError("Failed to save clock-in data.");
          }
        } else {
          setError(`You must be at ${OFFICE.address} to clock in (${Math.round(distance)}m away)`);
        }

        setIsLoading(false);
      },
      (err) => {
        setError("Location access denied. Please enable location services.");
        setIsLoading(false);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleClockOut = async () => {
    const now = new Date();
    setClockOutTime(now);
    setStatus("ended");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);

    try {
      // Send email instead of userId
      await axios.post(`${API_BASE}/attendance/clock-out`, {
        email: user.email,
        clockOut: now.toISOString()
      });
    } catch (err) {
      setError("Failed to save clock-out data.");
    }
  };

  useEffect(() => {
    let interval;
    if (status === "working" && clockInTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now - clockInTime;
        const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
        const minutes = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0');
        const seconds = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
        setWorkDuration(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, clockInTime]);

  return (
    <div className="clock-system-container">
      <div className="clock-header">
        <h1>TalentMatch Attendance System</h1>
        <p>Verify your presence at {OFFICE.address}</p>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      <div className="clock-status">
        {status === "ready" && <div className="status-bubble ready">⏱️Ready to clock in</div>}
        {status === "working" && <div className="status-bubble working">💼Currently at office</div>}
        {status === "ended" && <div className="status-bubble ended">🎉 Work session complete!</div>}
      </div>

      <div className="clock-card">
        <div className="clock-section">
          <h3>Clock In</h3>
          {status !== "working" ? (
            <button onClick={verifyOfficeLocation} disabled={isLoading} className={`clock-btn ${isLoading ? 'loading' : ''}`}>
              {isLoading ? <><span className="spinner"></span> Getting Location...</> : "Verify Office Location & Clock In"}
            </button>
          ) : (
            <div className="clock-details">
              <div className="detail-item success">
                <span className="detail-label">Status:</span>
                <span className="detail-value">✅ Verified at office</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Time In:</span>
                <span className="detail-value">{clockInTime?.toLocaleTimeString()}</span>
              </div>
              <div className="office-info">
                <div className="office-address">🏢 {OFFICE.address}</div>
                <div className="location-details">
                  <div><span className="detail-label">Distance:</span> {locationDetails?.distance}m</div>
                  <div><span className="detail-label">Accuracy:</span> ±{locationDetails?.accuracy}m</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="divider">
          <div className="line"></div>
          <div className="time-counter"><span>{workDuration}</span></div>
          <div className="line"></div>
        </div>

        <div className="clock-section">
          <h3>Clock Out</h3>
          {status === "working" ? (
            <button onClick={handleClockOut} className="clock-btn out-btn">🏁 Finish Work & Clock Out</button>
          ) : status === "ended" ? (
            <div className="clock-details">
              <div className="detail-item"><span className="detail-label">Time Out:</span> <span className="detail-value">{clockOutTime?.toLocaleTimeString()}</span></div>
              <div className="detail-item"><span className="detail-label">Total Time:</span> <span className="detail-value">{workDuration}</span></div>
            </div>
          ) : (
            <button disabled className="clock-btn disabled-btn">Verify office location first</button>
          )}
        </div>
      </div>

      {showConfetti && (
        <div className="confetti">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="confetti-piece"></div>
          ))}
        </div>
      )}

      <div className="fun-message">
        {status === "ready" && "Ready to start your workday? Verify your office location to begin!"}
        {status === "working" && `You're checked in at ${OFFICE.address}!`}
        {status === "ended" && "Productive day complete! See you tomorrow!"}
      </div>
    </div>
  );
};

export default ClockSystem;
