import React from "react";

/**
 * RoleSelection.js
 * ─────────────────────────────────────────────────────────────────
 * Role selection component for first-time users
 * Features:
 *   - Choice between Patient and Doctor roles
 *   - Beautiful card design with hover effects
 *   - Callback to parent to update user role
 */

function RoleSelection({ account, onSelectRole }) {
  return (
    <div className="role-selection">
      <div className="role-container">
        <div className="role-header">
          <h1 style={{ fontSize: "2.25rem", marginBottom: "0.5rem" }}>
            Welcome to MedRecords
          </h1>
          <p style={{ color: "var(--neutral-400)", fontSize: "1rem" }}>
            Select your role to continue
          </p>
        </div>

        <div className="role-options">
          {/* Patient Option */}
          <div
            className="role-card patient glass-lg"
            onClick={() => onSelectRole("patient")}
            style={{ cursor: "pointer" }}
          >
            <div className="role-icon">🏥</div>
            <h3 className="role-title">Patient</h3>
            <p className="role-description">
              View your medical records, manage doctor access, and upload health documents
            </p>
            <button
              className="btn btn-primary"
              style={{ marginTop: "var(--spacing-lg)", width: "100%" }}
            >
              Continue as Patient
            </button>
          </div>

          {/* Doctor Option */}
          <div
            className="role-card doctor glass-lg"
            onClick={() => onSelectRole("doctor")}
            style={{ cursor: "pointer" }}
          >
            <div className="role-icon">👨‍⚕️</div>
            <h3 className="role-title">Doctor</h3>
            <p className="role-description">
              Access patient records with permission, and upload diagnoses and treatment plans
            </p>
            <button
              className="btn btn-success"
              style={{ marginTop: "var(--spacing-lg)", width: "100%" }}
            >
              Continue as Doctor
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "var(--spacing-2xl)" }}>
          <p style={{ color: "var(--neutral-500)", fontSize: "0.85rem" }}>
            Connected wallet: <code>{account.substring(0, 10)}...{account.slice(-8)}</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;
