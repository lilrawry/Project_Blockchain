import React from "react";

function RoleSelection({ account, onSelectRole }) {
  return (
    <div className="role-selection">
      <div className="role-container">
        <div className="role-header">
          <h1>Welcome to MedRecords</h1>
          <p>Select your role to access the decentralized health platform</p>
        </div>

        <div className="role-options">
          <div
            className="role-card patient"
            onClick={() => onSelectRole("patient")}
          >
            <div className="role-icon-wrapper">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#48cae4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14l-7 4-7-4M19 10l-7 4-7-4M12 3L5 7l7 4 7-4-7-4z" />
                <path d="M5 17l7 4 7-4M5 13l7 4 7-4" />
              </svg>
            </div>
            <h3 className="role-title" style={{ color: "var(--primary-accent-lighter)" }}>Patient</h3>
            <p className="role-description">
              View your medical records, manage doctor access, and upload health documents securely
            </p>
            <button className="btn btn-primary">
              Continue as Patient
            </button>
          </div>

          <div
            className="role-card doctor"
            onClick={() => onSelectRole("doctor")}
          >
            <div className="role-icon-wrapper">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#69f0ae" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h3 className="role-title" style={{ color: "var(--secondary-light)" }}>Doctor</h3>
            <p className="role-description">
              Access patient records with permission, review diagnoses, and update treatment plans
            </p>
            <button className="btn btn-success">
              Continue as Doctor
            </button>
          </div>
        </div>

        <div className="role-wallet-info">
          <p>
            Connected wallet: <code>{account.substring(0, 10)}...{account.slice(-8)}</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;
