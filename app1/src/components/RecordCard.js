import React, { useState } from "react";

function RecordCard({ record, recordType = "General", isEncrypted = true }) {
  const [isHovering, setIsHovering] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="record-card"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="record-card-header">
        <div className="record-card-type-badge">
          {record.type || recordType}
        </div>
        {isEncrypted && (
          <div className="record-encrypted-badge">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            <span>Encrypted</span>
          </div>
        )}
      </div>

      <div className="record-card-body">
        <h3 className="record-card-title">{record.title || "Medical Record"}</h3>

        <p className="record-card-description">
          {record.description || "No description provided"}
        </p>

        <div className="record-card-meta">
          <span className="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatDate(record.timestamp)}
          </span>
          <span className="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {formatTime(record.timestamp)}
          </span>
          {record.doctorAddress && (
            <span className="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {record.doctorAddress.substring(0, 8)}...
            </span>
          )}
        </div>
      </div>

      <div className="record-card-footer">
        <span>Click to view details</span>
      </div>

      {isHovering && (
        <div className="record-card-overlay">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default RecordCard;
