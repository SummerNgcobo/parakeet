import React from "react";
import Conversations from "../../conversations"; 

const TraineeMessages = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Messages</h2>
      <Conversations />
    </div>
  );
};

export default TraineeMessages;
