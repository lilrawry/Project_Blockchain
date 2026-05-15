import React from "react";

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <div className="loading-text">
        <h2>Connecting to Blockchain</h2>
        <p>Initializing Web3 and loading your secure records</p>
      </div>
      <div className="loading-progress">
        <div className="loading-progress-bar" />
      </div>
    </div>
  );
}

export default LoadingScreen;
