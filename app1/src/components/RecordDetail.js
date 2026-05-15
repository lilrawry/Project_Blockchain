import React, { useState, useEffect } from "react";
import { decryptData } from "../utils/crypto";
import { downloadFromIPFS } from "../utils/ipfs";

/**
 * RecordDetail.js
 * Professional detailed view for medical records
 */
function RecordDetail({ record, account, onBack, onClose }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDecryptedContent = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Downloading from IPFS and decrypting...");
      
      // 1. Download from IPFS
      const encryptedPayload = await downloadFromIPFS(record.ipfsHash);
      
      // 2. Decrypt using the key stored on the blockchain
      const decrypted = decryptData(encryptedPayload, record.encryptionKey);
      
      console.log("Decryption successful!");
      setContent(decrypted);
    } catch (err) {
      console.error("Decryption error:", err);
      setError("Unable to decrypt record. You may not have access rights or the record may be corrupted.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("RecordDetail mounted with record:", record);
    if (record.isEncrypted && record.ipfsHash && record.encryptionKey) {
      loadDecryptedContent();
    } else {
      setContent(record.content || record.description || "No content available");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record, account]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="record-detail-modal-overlay" onClick={onClose}>
      <div className="record-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="record-detail-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
              <button className="nav-button nav-back" onClick={onBack}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <h1 className="record-detail-title">{record.title || "Medical Record"}</h1>
            </div>
            <p className="record-detail-meta" style={{ marginLeft: "2.5rem" }}>
              <span className="meta-badge meta-date">
                {formatDate(record.timestamp)}
              </span>
              {record.type && (
                <span className="meta-badge meta-type">{record.type}</span>
              )}
            </p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="record-detail-content">
          {loading && (
            <div className="record-detail-loading">
              <div className="spinner"></div>
              <p>Downloading and decrypting record...</p>
            </div>
          )}

          {error && (
            <div className="record-detail-error">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <p>{error}</p>
            </div>
          )}

          {content && !loading && (
            <div className="record-detail-body">
              <div className="record-section">
                <h3>📋 Content</h3>
                <div className="record-content" style={{ whiteSpace: "pre-wrap" }}>
                  {content}
                </div>
              </div>

              {record.description && record.description !== content && (
                <div className="record-section">
                  <h3>📝 Description</h3>
                  <p className="record-notes">{record.description}</p>
                </div>
              )}
              
              <div className="record-section">
                <p style={{ fontSize: "0.8rem", opacity: 0.5 }}>
                  IPFS CID: {record.ipfsHash}<br/>
                  Patient: {record.patientAddress}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecordDetail;
