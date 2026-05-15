import React, { useState, useEffect, useRef } from "react";

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
      <div className="flex-between mb-lg">
        <h4 style={{ margin: 0, fontFamily: "var(--font-display)" }}>Authorized Doctors</h4>
        {isPatient && !showGrantForm && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowGrantForm(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Grant Access
          </button>
        )}
      </div>

      {message && (
        <div
          style={{
            padding: "var(--spacing-md) var(--spacing-lg)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "var(--spacing-lg)",
            background: message.includes("Error")
              ? "rgba(239, 68, 68, 0.06)"
              : "rgba(0, 230, 118, 0.06)",
            border: message.includes("Error")
              ? "1px solid rgba(239, 68, 68, 0.15)"
              : "1px solid rgba(0, 230, 118, 0.15)",
            color: message.includes("Error") ? "#fca5a5" : "#69f0ae",
            fontSize: "0.85rem",
            animation: "slideDown 0.2s ease",
          }}
        >
          {message}
        </div>
      )}

      {showGrantForm && (
        <div
          style={{
            padding: "var(--spacing-xl)",
            background: "rgba(0, 180, 216, 0.03)",
            border: "1px solid rgba(0, 180, 216, 0.12)",
            borderRadius: "var(--radius-xl)",
            marginBottom: "var(--spacing-xl)",
            animation: "slideDown 0.2s ease",
          }}
        >
          <h5 style={{ marginBottom: "var(--spacing-lg)", color: "var(--neutral-200)" }}>Grant Access to Doctor</h5>
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
              className="btn btn-primary btn-sm"
              onClick={handleGrantAccess}
              disabled={isLoading || !doctorAddress}
            >
              Grant
            </button>
            <button
              className="btn btn-outline btn-sm"
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
            <div
              key={idx}
              className="access-item"
              style={{ animation: `slideUp 0.2s ease ${idx * 0.05}s both` }}
            >
              <div className="access-info">
                <div className="access-label">Doctor</div>
                <div className="access-address">
                  {truncateAddress(access.doctorAddress || access.address)}
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
              padding: "var(--spacing-2xl)",
              textAlign: "center",
              color: "var(--neutral-600)",
              fontSize: "0.875rem",
            }}
          >
            No doctors have access yet
          </div>
        )}
      </div>
    </div>
  );
}

export default AccessManager;
