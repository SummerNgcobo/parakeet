import React from 'react'
import Sidebar from '../../components/facilitatorComponents/Sibebar'

const FacilitatorLayout = ({ children }) => {
  return (
    <div className="admin-layout">
        <Sidebar />
        <div className="main-content">
          <div className="content-wrapper">{children}</div>
        </div>
      </div>
  )
}

export default FacilitatorLayout
