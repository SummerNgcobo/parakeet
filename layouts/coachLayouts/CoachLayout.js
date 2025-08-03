import React from 'react'
import './CoachLayout.css';
import Sidebar from '../../components/coachComponents/Sidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
        <Sidebar />
        <div className="main-content">
          <div className="content-wrapper">{children}</div>
        </div>
      </div>
  )
}

export default AdminLayout