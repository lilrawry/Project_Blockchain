import React from "react";

/**
 * LoadingScreen.js
 * ─────────────────────────────────────────────────────────────────
 * Animated loading screen component
 * Features:
 *   - Spinning loader animation
 *   - "Connecting to blockchain..." message
 *   - Full viewport coverage
 *   - Glassmorphism design
 */

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <div className="loading-text">
        <h2 style={{ marginBottom: "0.5rem" }}>Connecting to Blockchain...</h2>
        <p style={{ fontSize: "0.9rem", color: "var(--neutral-400)" }}>
          Initializing Web3 connection and loading your records
        </p>
      </div>
    </div>
  );
}

export default LoadingScreen;
