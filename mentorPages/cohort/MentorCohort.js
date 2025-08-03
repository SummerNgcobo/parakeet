import React, { useState } from 'react';
import { FiUsers, FiPlus, FiTrash2, FiEdit2, FiSearch, FiFilter } from 'react-icons/fi';
import './MentorCohort.css';

const FacilitatorCohort = () => {
  // Sample data - replace with API calls
  const [cohorts, setCohorts] = useState([
    {
      id: 1,
      name: "March 2023 Cohort",
      startDate: "2023-03-01",
      endDate: "2023-08-31",
      program: "Web Development",
      status: "active",
      students: [
        { id: 101, name: "John Doe", email: "john@example.com", joined: "2023-03-05" },
        { id: 102, name: "Jane Smith", email: "jane@example.com", joined: "2023-03-10" },
        { id: 103, name: "Alex Johnson", email: "alex@example.com", joined: "2023-03-15" }
      ]
    },
    {
      id: 2,
      name: "February 2023 Cohort",
      startDate: "2023-02-01",
      endDate: "2023-07-31",
      program: "Data Science",
      status: "active",
      students: [
        { id: 201, name: "Sarah Williams", email: "sarah@example.com", joined: "2023-02-05" },
        { id: 202, name: "Michael Brown", email: "michael@example.com", joined: "2023-02-10" }
      ]
    },
    {
      id: 3,
      name: "January 2023 Cohort",
      startDate: "2023-01-01",
      endDate: "2023-06-30",
      program: "UX Design",
      status: "graduated",
      students: [
        { id: 301, name: "Emily Davis", email: "emily@example.com", joined: "2023-01-05" },
        { id: 302, name: "David Wilson", email: "david@example.com", joined: "2023-01-10" },
        { id: 303, name: "Jessica Lee", email: "jessica@example.com", joined: "2023-01-15" }
      ]
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingCohort, setEditingCohort] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    program: 'Web Development',
    status: 'active'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCohort, setSelectedCohort] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCohort = () => {
    setIsCreating(true);
    setEditingCohort(null);
    setSelectedCohort(null);
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      program: 'Web Development',
      status: 'active'
    });
  };

  const handleEditCohort = (cohort) => {
    setEditingCohort(cohort.id);
    setIsCreating(false);
    setSelectedCohort(null);
    setFormData({
      name: cohort.name,
      startDate: cohort.startDate,
      endDate: cohort.endDate,
      program: cohort.program,
      status: cohort.status
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCohort) {
      setCohorts(cohorts.map(cohort => 
        cohort.id === editingCohort ? { ...cohort, ...formData } : cohort
      ));
    } else {
      const newCohort = {
        id: Date.now(),
        ...formData,
        students: []
      };
      setCohorts([...cohorts, newCohort]);
    }
    setIsCreating(false);
    setEditingCohort(null);
  };

  const handleDeleteCohort = (id) => {
    setCohorts(cohorts.filter(cohort => cohort.id !== id));
    if (selectedCohort?.id === id) {
      setSelectedCohort(null);
    }
  };

  const filteredCohorts = cohorts.filter(cohort => {
    const matchesSearch = cohort.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         cohort.program.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || cohort.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleAddStudent = (cohortId, student) => {
    // In a real app, this would be an API call
    setCohorts(cohorts.map(cohort => 
      cohort.id === cohortId 
        ? { ...cohort, students: [...cohort.students, student] }
        : cohort
    ));
  };

  const handleRemoveStudent = (cohortId, studentId) => {
    setCohorts(cohorts.map(cohort => 
      cohort.id === cohortId 
        ? { ...cohort, students: cohort.students.filter(s => s.id !== studentId) }
        : cohort
    ));
  };

  return (
    <div className="cohort-container">
      <div className="cohort-header">
        <h1><FiUsers /> Cohort Management</h1>
        <button onClick={handleCreateCohort} className="create-btn">
          <FiPlus /> Create Cohort
        </button>
      </div>

      <div className="controls">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search cohorts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <FiFilter className="filter-icon" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Cohorts</option>
            <option value="active">Active</option>
            <option value="graduated">Graduated</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
      </div>

      {(isCreating || editingCohort) && (
        <div className="cohort-form-container">
          <h2>{editingCohort ? 'Edit Cohort' : 'Create New Cohort'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Cohort Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., March 2023 Web Dev"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Program</label>
                <select
                  name="program"
                  value={formData.program}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="UX Design">UX Design</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="graduated">Graduated</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => {
                  setIsCreating(false);
                  setEditingCohort(null);
                }} 
                className="cancel-btn"
              >
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                {editingCohort ? 'Update Cohort' : 'Create Cohort'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="cohort-layout">
        <div className="cohort-list">
          <h3>All Cohorts ({filteredCohorts.length})</h3>
          {filteredCohorts.length === 0 ? (
            <div className="empty-state">
              <p>No cohorts found. Create your first cohort!</p>
            </div>
          ) : (
            filteredCohorts.map(cohort => (
              <div 
                key={cohort.id} 
                className={`cohort-card ${selectedCohort?.id === cohort.id ? 'selected' : ''}`}
                onClick={() => setSelectedCohort(cohort)}
              >
                <div className="cohort-card-header">
                  <h4>{cohort.name}</h4>
                  <span className={`status-badge ${cohort.status}`}>
                    {cohort.status.charAt(0).toUpperCase() + cohort.status.slice(1)}
                  </span>
                </div>
                <p className="program">{cohort.program}</p>
                <div className="cohort-dates">
                  <span>{new Date(cohort.startDate).toLocaleDateString()}</span>
                  <span>to</span>
                  <span>{new Date(cohort.endDate).toLocaleDateString()}</span>
                </div>
                <div className="student-count">
                  {cohort.students.length} {cohort.students.length === 1 ? 'student' : 'students'}
                </div>
                <div className="cohort-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCohort(cohort);
                    }}
                    className="edit-btn"
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCohort(cohort.id);
                    }}
                    className="delete-btn"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cohort-details">
          {selectedCohort ? (
            <>
              <div className="details-header">
                <h2>{selectedCohort.name}</h2>
                <span className={`status-badge ${selectedCohort.status}`}>
                  {selectedCohort.status.charAt(0).toUpperCase() + selectedCohort.status.slice(1)}
                </span>
              </div>
              
              <div className="details-meta">
                <p><strong>Program:</strong> {selectedCohort.program}</p>
                <p><strong>Duration:</strong> {new Date(selectedCohort.startDate).toLocaleDateString()} - {new Date(selectedCohort.endDate).toLocaleDateString()}</p>
              </div>

              <div className="students-section">
                <div className="section-header">
                  <h3>Students ({selectedCohort.students.length})</h3>
                  <button 
                    className="add-student-btn"
                    onClick={() => {
                      // In a real app, this would open a modal to add students
                      const newStudent = {
                        id: Date.now(),
                        name: `New Student ${selectedCohort.students.length + 1}`,
                        email: `student${selectedCohort.students.length + 1}@example.com`,
                        joined: new Date().toISOString().split('T')[0]
                      };
                      handleAddStudent(selectedCohort.id, newStudent);
                    }}
                  >
                    <FiPlus /> Add Student
                  </button>
                </div>

                {selectedCohort.students.length === 0 ? (
                  <div className="empty-state">
                    <p>No students in this cohort yet.</p>
                  </div>
                ) : (
                  <div className="students-list">
                    {selectedCohort.students.map(student => (
                      <div key={student.id} className="student-card">
                        <div className="student-info">
                          <h4>{student.name}</h4>
                          <p>{student.email}</p>
                          <p className="joined-date">Joined: {student.joined}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveStudent(selectedCohort.id, student.id)}
                          className="remove-btn"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Select a cohort to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacilitatorCohort;