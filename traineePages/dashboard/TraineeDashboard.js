import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend } from "chart.js";
import "./TraineeDashboard.css";
import { useUser } from '../../../contexts/UserContext'; 


ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend);

const TraineeDashboard = () => {
  const { user } = useUser();
  const traineeName = user?.firstName || "Trainee";
  const quote = "The beautiful thing about learning is that no one can take it away from you. - B.B. King";
  const defaultAvatar = "/user.png";
  const [avatar, setAvatar] = useState(defaultAvatar);
  
  
  useEffect(() => {
    const storedProfile = localStorage.getItem("traineeProfile");
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      setAvatar(parsed.avatar || defaultAvatar);
    }
  }, [defaultAvatar]);

  const courses = [
    { id: 1, title: "Communication in a professional space", progress: 75, emoji: "💬", color: "#FF9F40" },
    { id: 2, title: "LinkedIn fundamentals", progress: 50, emoji: "🔗", color: "#4BC0C0" },
  ];

  const upcomingAssignment = {
    title: "Final Project Submission",
    dueDate: "April 10, 2025",
    status: "Pending",
    daysLeft: 3,
  };

  const notifications = [
    { id: 1, text: "You have a new message from your instructor", time: "2h ago", read: false },
    { id: 2, text: "Your assignment 'React Basics' has been graded", time: "1d ago", read: true },
    { id: 3, text: "New course content available in 'Node.js & Express'", time: "2d ago", read: true },
  ];

  const attendanceData = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        data: [88, 12],
        backgroundColor: ["#36A2EB", "#FF6384"],
        borderWidth: 0,
      },
    ],
  };

  const progressData = {
    labels: ["Completed", "In Progress", "Not Started"],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: ["#4BC0C0", "#FFCE56", "#FF6384"],
        borderWidth: 0,
      },
    ],
  };

  const average = {
    labels: ["Average Grading", ],
    datasets: [
      {
        data: [89],
        backgroundColor: ["#4BC0C0", "#FFCE56",],
        borderWidth: 0,
      },
    ],
  };

  const navigate = useNavigate();

  const toCourses = () => {
    navigate("/trainee/courses");
  };

  return (
    <div className="dashboard-container">
<header className="dashboard-header">
  <div className="welcome-section">
    <h1>
      Welcome back, {traineeName}! <span className="welcome-emoji">👋</span>
    </h1>
    <p className="quote">{quote}</p>
  </div>

  <div className="avatar-circle">
    <div className="avatar-initial">
      {(traineeName || "?").charAt(0).toUpperCase()}
    </div>
    <span className="status-dot"></span>
  </div>
</header>


      <section className="dashboard-content">
        <div className="data-visualization">
          <div className="chart-card">
            <h3>Attendance Tracking</h3>
            <div className="chart-wrapper">
              <Doughnut 
                data={attendanceData} 
                options={{
                  cutout: '70%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        padding: 20
                      }
                    }
                  }
                }}
              />
              <div className="chart-center-text">{attendanceData.datasets[0].data[0]}%</div>
            </div>
          </div>

          <div className="chart-card">
            <h3>Progress Overview</h3>
            <div className="chart-wrapper">
              <Doughnut 
                data={progressData} 
                options={{
                  cutout: '70%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        padding: 20
                      }
                    }
                  }
                }}
              />
              <div className="chart-center-text-2">{progressData.datasets[0].data[0]}%</div>
            </div>
          </div>
        </div>

        <div className="courses-section">
          <h2>Your Courses</h2>
          <div className="course-list">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-emoji">{course.emoji}</div>
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <div className="progress-container">
                    <div className="progress-info">
                      <span>{course.progress}% complete</span>
                      <span>{100 - course.progress}% remaining</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${course.progress}%`, backgroundColor: course.color }}
                      ></div>
                    </div>
                  </div>
                  <button className="continue-btn" onClick={toCourses}>
                    Continue Learning <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="deadline-section">
          <div className="deadline-card">
            <div className="deadline-header">
              <h3>Upcoming Deadline</h3>
              <div className="days-left">{upcomingAssignment.daysLeft} days left</div>
            </div>
            <div className="deadline-content">
              <h4>{upcomingAssignment.title}</h4>
              <p>Due on {upcomingAssignment.dueDate}</p>
              <div className={`status-badge ${upcomingAssignment.status.toLowerCase()}`}>
                {upcomingAssignment.status}
              </div>
            </div>
            <button className="view-all-btn">View All Assignments</button>
          </div>

          <div className="notifications-card">
            <h3>Recent Activity</h3>
            <ul className="notifications-list">
              {notifications.map((note) => (
                <li key={note.id} className={note.read ? "" : "unread"}>
                  <div className="notification-dot"></div>
                  <div className="notification-content">
                    <p>{note.text}</p>
                    <span className="notification-time">{note.time}</span>
                  </div>
                </li>
              ))}
            </ul>
            <button className="view-all-btn">View All Notifications</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TraineeDashboard;