import React from "react";
import "./TraineeCourses.css";

const TraineeCourses = () => {
  const courses = [
    {
      id: 1,
      name: "Personal Branding",
      progress: 80,
      description: "Learn how to build a strong personal brand that stands out in today's competitive market.",
      image: "https://boti.co.za/wp-content/uploads/2015/07/Personal-BrandingBadge.05112016-1024x835.jpg",
      category: "Career Development",
      modules: 8,
      duration: "4 weeks"
    },
    {
      id: 2,
      name: "Effective Communication",
      progress: 60,
      description: "Master verbal and non-verbal communication techniques for professional success.",
      image: "https://www.aeologic.com/blog/wp-content/uploads/2023/06/Elements-of-Effective-Communication-in-the-Workplace-2048x1179.jpg",
      category: "Soft Skills",
      modules: 10,
      duration: "6 weeks"
    },
    {
      id: 3,
      name: "Time Management",
      progress: 100,
      description: "Boost productivity with proven time management strategies and tools.",
      image: "https://www.prialto.com/hubfs/image%20%282%29-1-1.jpg",
      category: "Productivity",
      modules: 5,
      duration: "3 weeks"
    },
    {
      id: 4,
      name: "Leadership Skills",
      progress: 90,
      description: "Develop essential leadership qualities to inspire and guide teams effectively.",
      image: "https://imageio.forbes.com/specials-images/imageserve/62df7418b50fd7ef6dd194e4/10-Most-Important-Leadership-Skills-For-The-21st-Century-Workplace--And-How-To/960x0.jpg?format=jpg&width=1440",
      category: "Management",
      modules: 7,
      duration: "5 weeks"
    },
    {
      id: 5,
      name: "Teamwork & Collaboration",
      progress: 100,
      description: "Learn techniques for successful collaboration in diverse team environments.",
      image: "https://interviewcracker.com/wp-content/uploads/1970/01/teamwork-and-collaboration.png",
      category: "Soft Skills",
      modules: 6,
      duration: "4 weeks"
    },
  ];

  const getProgressColor = (progress) => {
    if (progress >= 90) return "#00b894"; // Emerald green
    if (progress >= 75) return "#55efc4"; // Mint green
    if (progress >= 50) return "#fdcb6e"; // Yellow
    return "#ff7675"; // Coral red
  };

  const getProgressEmoji = (progress) => {
    if (progress === 100) return "🎉";
    if (progress >= 75) return "🚀";
    if (progress >= 50) return "🔥";
    return "🌱";
  };

  // Categorize courses
  const doneCourses = courses.filter((course) => course.progress === 100);
  const ongoingCourses = courses.filter((course) => course.progress < 100);

  return (
    <div className="courses-container">
      <header className="courses-header">
        <h1>My Learning Journey</h1>
        <p className="subtitle">Expand your skills and unlock new opportunities</p>
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-value">{ongoingCourses.length}</div>
            <div className="stat-label">Active Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{doneCourses.length}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.round(courses.reduce((acc, course) => acc + course.progress, 0) / courses.length)}%</div>
            <div className="stat-label">Avg Completion</div>
          </div>
        </div>
      </header>

      <section className="courses-section">
        <h2 className="section-title">
          <span className="title-icon">📚</span> Ongoing Courses
        </h2>
        <div className="courses-grid">
          {ongoingCourses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="course-image-container">
                <img src={course.image} alt={course.name} className="course-image" />
                <div className="course-category">{course.category}</div>
              </div>
              <div className="course-content">
                <div className="course-header">
                  <h3>{course.name}</h3>
                  <span className="progress-emoji">{getProgressEmoji(course.progress)}</span>
                </div>
                <p className="course-description">{course.description}</p>
                
                <div className="course-meta">
                  <span className="meta-item">📖 {course.modules} modules</span>
                  <span className="meta-item">⏱️ {course.duration}</span>
                </div>
                
                <div className="progress-container">
                  <div className="progress-info">
                    <span>{course.progress}% complete</span>
                    <span>{100 - course.progress}% remaining</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${course.progress}%`,
                        background: getProgressColor(course.progress),
                      }}
                    ></div>
                  </div>
                </div>
                
                <button 
                  className="continue-btn"
                  onClick={() => window.open("https://globalemploymentchallenge.udemy.com", "_blank")}
                  >
                  Continue Learning <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="courses-section">
        <h2 className="section-title">
          <span className="title-icon">🏆</span> Completed Courses
        </h2>
        <div className="courses-grid">
          {doneCourses.map((course) => (
            <div key={course.id} className="course-card completed">
              <div className="course-image-container">
                <img src={course.image} alt={course.name} className="course-image" />
                <div className="course-category">{course.category}</div>
                <div className="completed-badge">Completed</div>
              </div>
              <div className="course-content">
                <div className="course-header">
                  <h3>{course.name}</h3>
                  <span className="progress-emoji">🎉</span>
                </div>
                <p className="course-description">{course.description}</p>
                
                <div className="course-meta">
                  <span className="meta-item">📖 {course.modules} modules</span>
                  <span className="meta-item">⏱️ {course.duration}</span>
                </div>
                
                <div className="achievement">
                  <div className="certificate-btn">
                    View Certificate <span>📜</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TraineeCourses;