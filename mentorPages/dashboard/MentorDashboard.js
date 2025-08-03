import React, { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend } from "chart.js";
import "./MentorDashboard.css";
import { useUser } from '../../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";


ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend);

const FacilitatorDashboard = () => {


  const { user } = useUser();
  const navigate = useNavigate();
  const mentorName = user?.firstName || "Mentor";
  const defaultAvatar = "https://randomuser.me/api/portraits/women/44.jpg";
  const [dashboardData, setDashboardData] = useState({
    submittedAssignments: 0,
    yesterdaySubmissions: 0,
    pendingReviews: 0,
    activeCourses: 0,
    notifications: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

      const [profile, setProfile] = useState({
        name: mentorName,
        avatar: defaultAvatar
      });
    

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/mentors/${user.id}/dashboard`);
        const data = await response.json();
        setDashboardData({
          submittedAssignments: data.submitted_count || 0,
          yesterdaySubmissions: data.yesterday_count || 0,
          pendingReviews: data.pending_count || 0,
          activeCourses: data.course_count || 0,
          notifications: data.notification_count || 0,
          recentActivities: data.recent_activities || []
        });
         } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

     if (user?.id) {
      fetchDashboardData();
    }

    const storedProfile = localStorage.getItem("traineeProfile");
          if (storedProfile) {
            const parsed = JSON.parse(storedProfile);
            setProfile({
              avatar: parsed.avatar || defaultAvatar
            });
    }


  }, [user], [defaultAvatar]);

  const getSubmissionChange = () => {
    const difference = dashboardData.submittedAssignments - dashboardData.yesterdaySubmissions;
    if (difference === 0) return 'No change from yesterday';
    return `${difference > 0 ? '+' : ''}${difference} from yesterday`;
  };

  const handleSubmittedClick = () => {
    navigate('/mentor/submitted-work');
  };

  if (loading) {
    return <div className="facilitator-dashboard loading">Loading dashboard...</div>;
  }

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
          <h1>Welcome back, {mentorName}! <span className="welcome-emoji">👋</span></h1>
          <p className="subtitle">Here's what's happening today</p>
        </div>

       
          <div className="avatar-circle">
            <Link to="/profile"> {/* Navigate to profile page */}
              <img src={profile.avatar} alt="User Avatar" />
            </Link>
            <span className="status-dot"></span>
          </div>
    
      </header>

      <section className="dashboard-overview">
        <div 
          className="overview-card card-1 clickable" 
          onClick={handleSubmittedClick}
        >
          <div className="card-icon">📚</div>
          <div className="card-content">
            <h3>Submitted Assignments</h3>
            <p className="count">{dashboardData.submittedAssignments}</p>
            <p className={`change ${dashboardData.submittedAssignments > dashboardData.yesterdaySubmissions ? 'positive' : 'neutral'}`}>
              {getSubmissionChange()}
            </p>
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