import React from 'react'
import './AdminLayout.css';
import Sidebar from '../../components/adminComponents/Sidebar';

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