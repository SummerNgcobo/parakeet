import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiPlus, FiTrash2, FiEdit2, FiSearch, FiFilter } from 'react-icons/fi';
import './FacilitatorCohort.css';

const FacilitatorCohort = () => {
    const [cohorts, setCohorts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedCohort, setSelectedCohort] = useState(null);

    // Fetch data from backend
    useEffect(() => {
        const fetchCohorts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/cohorts');

                console.log('Fetched cohorts:', response.data);

                const data = response.data.cohorts || [];
                const enriched = data.map((cohort, index) => ({
                    id: cohort.id || `cohort-${index}`,
                    name: cohort.name || `Cohort ${index + 1}`,
                    startDate: cohort.startDate || '2023-01-01',
                    endDate: cohort.endDate || '2023-12-31',
                    program: cohort.program || 'Web Development',
                    status: cohort.status || 'active',
                    students: cohort.students || []
                }));
                setCohorts(enriched);
            } catch (error) {
                console.error('Error fetching cohorts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCohorts();
    }, []);

    const handleDeleteCohort = (id) => {
        setCohorts(cohorts.filter(cohort => cohort.id !== id));
        if (selectedCohort?.id === id) {
            setSelectedCohort(null);
        }
    };

    const filteredCohorts = cohorts.filter(cohort => {
        const matchesSearch =
            cohort.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cohort.program?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || cohort.status === filter;
        return matchesSearch && matchesFilter;
    });

    const handleAddStudent = (cohortId, student) => {
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

            <div className="cohort-layout">
                <div className="cohort-list">
                    <h3>All Cohorts ({filteredCohorts.length})</h3>
                    {loading ? (
                        <div className="empty-state">
                            <p>Loading cohorts...</p>
                        </div>
                    ) : filteredCohorts.length === 0 ? (
                        <div className="empty-state">
                            <p>No cohorts found. Create cohorts on Hubpot as Contacts.</p>
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
