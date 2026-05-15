import React, { useState, useEffect, useRef } from "react";

/**
 * AccessManager.js
 * ─────────────────────────────────────────────────────────────────
 * Component for managing doctor access to patient records
 * Features:
 *   - Display list of authorized doctors
 *   - Grant access to new doctors
 *   - Revoke access from existing doctors
 *   - Show access timestamps
 */

function AccessManager({
  recordId,
  currentAccessList = [],
  onGrantAccess,
  onRevokeAccess,
  isPatient = true,
}) {
  const [showGrantForm, setShowGrantForm] = useState(false);
  const [doctorAddress, setDoctorAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const timeoutsRef = useRef([]);

  const handleGrantAccess = async () => {
    if (!doctorAddress || !doctorAddress.startsWith("0x")) {
      setMessage("Please enter a valid Ethereum address");
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");
      await onGrantAccess(recordId, doctorAddress);
      setMessage("Access granted successfully!");
      setDoctorAddress("");
      setShowGrantForm(false);

      // Clear message after 3 seconds
      const t1 = setTimeout(() => setMessage(""), 3000);
      timeoutsRef.current.push(t1);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeAccess = async (docAddress) => {
    if (!window.confirm(`Revoke access for ${docAddress}?`)) return;

    try {
      setIsLoading(true);
      await onRevokeAccess(recordId, docAddress);
      setMessage("Access revoked successfully!");

      // Clear message after 3 seconds
      const t2 = setTimeout(() => setMessage(""), 3000);
      timeoutsRef.current.push(t2);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };

  return (
    <div className="access-manager">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-lg)" }}>
        <h3 style={{ margin: 0 }}>Access Management</h3>
        {isPatient && !showGrantForm && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowGrantForm(true)}
          >
            Grant Access
          </button>
        )}
      </div>

      {message && (
        <div
          style={{
            padding: "var(--spacing-md)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--spacing-lg)",
            background: message.includes("Error")
              ? "rgba(244, 67, 54, 0.1)"
              : "rgba(0, 230, 118, 0.1)",
            border: message.includes("Error")
              ? "1px solid #f44336"
              : "1px solid #00e676",
            color: message.includes("Error") ? "#ff6b6b" : "#33ff8d",
            fontSize: "0.9rem",
          }}
        >
          {message}
        </div>
      )}

      {showGrantForm && (
        <div
          style={{
            padding: "var(--spacing-lg)",
            background: "rgba(0, 217, 255, 0.05)",
            border: "1px solid var(--primary-accent)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--spacing-lg)",
          }}
        >
          <h4 style={{ marginBottom: "var(--spacing-md)" }}>Grant Access to Doctor</h4>
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <input
              type="text"
              placeholder="Doctor Ethereum Address (0x...)"
              value={doctorAddress}
              onChange={(e) => setDoctorAddress(e.target.value)}
              disabled={isLoading}
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-primary"
              onClick={handleGrantAccess}
              disabled={isLoading || !doctorAddress}
            >
              Grant
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowGrantForm(false);
                setDoctorAddress("");
              }}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="access-list">
        {currentAccessList && currentAccessList.length > 0 ? (
          currentAccessList.map((access, idx) => (
            <div key={idx} className="access-item">
              <div className="access-info">
                <div className="access-email">
                  <strong>Doctor:</strong> {truncateAddress(access.doctorAddress || access.address)}
                </div>
                <div className="access-date">
                  Granted: {formatDate(access.grantedAt || access.timestamp)}
                </div>
              </div>
              {isPatient && (
                <div className="access-actions">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      handleRevokeAccess(access.doctorAddress || access.address)
                    }
                    disabled={isLoading}
                  >
                    Revoke
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div
            style={{
              padding: "var(--spacing-lg)",
              textAlign: "center",
              color: "var(--neutral-500)",
              fontSize: "0.9rem",
            }}
          >
            No doctors have access to this record yet
          </div>
        )}
      </div>
    </div>
  );
}

export default AccessManager;
