import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./FacilitatorDashboard.css";
import { useUser } from '../../../contexts/UserContext';

const FacilitatorDashboard = () => {
  const { user } = useUser();

  // Defaults from context or fallback values
  const defaultName = `${user?.firstName || "Facilitator"} ${user?.lastName || "Surname"}`;
  const defaultAvatar = "/user.png"; // Fallback avatar

  const [profile, setProfile] = useState({
    name: defaultName,
    avatar: defaultAvatar
  });

  // Load saved profile from localStorage
  useEffect(() => {
    const storedProfile = localStorage.getItem("traineeProfile");
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      setProfile({
        name: parsed.name || defaultName,
        avatar: parsed.avatar || defaultAvatar
      });
    }
  }, [defaultName, defaultAvatar]);

  return (
    <div className="facilitator-dashboard">
      {/* Animated background elements */}
      <div className="dashboard-bg-elements">
        <div className="bg-circle-1"></div>
        <div className="bg-circle-2"></div>
        <div className="bg-circle-3"></div>
      </div>

    <header className="dashboard-header">
  <div className="welcome-message">
    <h1>
      Welcome back, {profile.name.split(" ")[0]}! <span className="welcome-emoji">👋</span>
    </h1>
    <p className="subtitle">Here's what's happening today</p>
  </div>

  <div className="avatar-wrapper">
    <Link to="/profile" aria-label="Profile">
      <div className="avatar-circle">
        <span className="avatar-initial">
          {(profile?.name || profile?.username || "?").charAt(0).toUpperCase()}
        </span>
      </div>
    </Link>
    <span className="status-dot" />
  </div>
</header>

      <section className="dashboard-overview">
        <div className="overview-card card-1">
          <div className="card-icon">📚</div>
          <div className="card-content">
            <h3>Submitted Assignments</h3>
            <p className="count">23</p>
            <p className="change positive">+3 from yesterday</p>
          </div>
        </div>

        <div className="overview-card card-2">
          <div className="card-icon">🎓</div>
          <div className="card-content">
            <h3>Active Courses</h3>
            <p className="count">4</p>
            <p className="change">2 in progress</p>
          </div>
        </div>

        <div className="overview-card card-3">
          <div className="card-icon">✏️</div>
          <div className="card-content">
            <h3>Pending Reviews</h3>
            <p className="count">7</p>
            <p className="change neutral">Due in 2 days</p>
          </div>
        </div>

        <div className="overview-card card-4">
          <div className="card-icon">🔔</div>
          <div className="card-content">
            <h3>New Notifications</h3>
            <p className="count">5</p>
            <p className="change">2 require action</p>
          </div>
        </div>
      </section>

      <section className="dashboard-recent">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <button className="view-all">View All →</button>
        </div>

        <div className="activity-feed">
          <div className="activity-item">
            <div className="activity-icon">📝</div>
            <div className="activity-details">
              <p><strong>John Doe</strong> submitted assignment in <strong>Web Dev 101</strong></p>
              <span className="activity-time">2 hours ago</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">💬</div>
            <div className="activity-details">
              <p>You sent feedback to <strong>Jane</strong> on <strong>UI Design Basics</strong></p>
              <span className="activity-time">Yesterday</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">👥</div>
            <div className="activity-details">
              <p>New cohort <strong>Spring '23</strong> added to your dashboard</p>
              <span className="activity-time">2 days ago</span>
            </div>
          </div>

          <div className="activity-item upcoming">
            <div className="activity-icon">🎤</div>
            <div className="activity-details">
              <p><strong>Upcoming:</strong> Guest Lecture - Friday @ 2pm</p>
              <span className="activity-time">Set reminder</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FacilitatorDashboard;
