import React from 'react'
import './MentorLayout.css';
import Sidebar from '../../components/mentorComponents/Sidebar';

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