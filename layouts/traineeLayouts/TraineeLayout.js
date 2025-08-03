import React from "react";
import Sidebar from "../../components/traineeComponents/sidebar/Sidebar";
import "./TraineeLayout.css";

const TraineeLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">{children}</div>
      </div>

    </div>
  );
};

export default TraineeLayout;
