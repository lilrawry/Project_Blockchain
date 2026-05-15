import React, { useState, useEffect } from "react";
import { decryptData, decryptToBase64 } from "../utils/crypto";
import { downloadFromIPFS } from "../utils/ipfs";

function RecordDetail({ record, account, onBack, onClose }) {
  const [content, setContent] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDecryptedContent = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Downloading from IPFS and decrypting...");

      const raw = await downloadFromIPFS(record.ipfsHash);

      let parsed;
      try { parsed = JSON.parse(raw); } catch {}

      if (parsed && parsed.name && parsed.data) {
        const base64 = decryptToBase64(parsed.data, record.encryptionKey);
        const dataUrl = `data:${parsed.mimeType};base64,${base64}`;
        setFileInfo({ name: parsed.name, mimeType: parsed.mimeType, dataUrl });
        return;
      }

      const decrypted = decryptData(raw, record.encryptionKey);
      if (!decrypted) {
        const base64 = decryptToBase64(raw, record.encryptionKey);
        const desc = record.description || "";
        const name = desc.startsWith("Uploaded: ") ? desc.slice(9) : "document.bin";
        const ext = name.split('.').pop().toLowerCase();
        const mimeMap = {
          pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg',
          png: 'image/png', gif: 'image/gif', doc: 'application/msword',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        };
        const mimeType = mimeMap[ext] || 'application/octet-stream';
        const dataUrl = `data:${mimeType};base64,${base64}`;
        setFileInfo({ name, mimeType, dataUrl });
        return;
      }
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

  const isPdf = fileInfo?.mimeType === "application/pdf";
  const isImage = fileInfo?.mimeType?.startsWith("image/");

  return (
    <div className="record-detail-modal-overlay" onClick={onClose}>
      <div className="record-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="record-detail-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <button className="nav-button" onClick={onBack} style={{ padding: "0.375rem 0.75rem" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="record-detail-title">{record.title || "Medical Record"}</h1>
            </div>
            <p className="record-detail-meta" style={{ marginLeft: "2.75rem" }}>
              <span className="meta-badge">{formatDate(record.timestamp)}</span>
              {record.type && <span className="meta-badge meta-type">{record.type}</span>}
              {fileInfo && <span className="meta-badge">{fileInfo.mimeType}</span>}
            </p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="record-detail-content">
          {loading && (
            <div className="record-detail-loading">
              <div className="loading-state">
                <div className="spinner" />
                <p>Downloading and decrypting record...</p>
              </div>
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

          {fileInfo && !loading && (
            <div className="record-detail-body">
              <div className="record-section">
                <h3>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#48cae4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  {fileInfo.name}
                </h3>

                {isImage ? (
                  <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", background: "rgba(0,0,0,0.2)" }}>
                    <img src={fileInfo.dataUrl} alt={fileInfo.name} style={{ width: "100%", display: "block" }} />
                  </div>
                ) : isPdf ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{
                      padding: "2rem", borderRadius: "var(--radius-lg)",
                      background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)",
                      textAlign: "center"
                    }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: "0.75rem", opacity: 0.6 }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                      <p style={{ margin: "0 0 0.5rem", fontWeight: 600, color: "var(--neutral-300)" }}>PDF Document</p>
                      <p style={{ margin: "0 0 1rem", fontSize: "0.85rem" }}>{fileInfo.name}</p>
                      <a href={fileInfo.dataUrl} download={fileInfo.name}
                         className="btn btn-primary"
                         style={{ textDecoration: "none", display: "inline-flex" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download PDF
                      </a>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", padding: "2rem", borderRadius: "var(--radius-lg)", background: "rgba(0,180,216,0.03)", border: "1px solid rgba(0,180,216,0.08)" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#48cae4" strokeWidth="1.5" style={{ opacity: 0.5 }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <p style={{ margin: 0 }}>{fileInfo.name}</p>
                    <a href={fileInfo.dataUrl} download={fileInfo.name}
                       className="btn btn-primary btn-sm"
                       style={{ textDecoration: "none" }}>
                      Download File
                    </a>
                  </div>
                )}
              </div>

              <div className="record-section">
                <p style={{ fontSize: "0.75rem", color: "var(--neutral-600)" }}>
                  IPFS CID: {record.ipfsHash}<br />
                  Patient: {record.patientAddress}
                </p>
              </div>
            </div>
          )}

          {content && !loading && !fileInfo && (
            <div className="record-detail-body">
              <div className="record-section">
                <h3>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#48cae4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="11" x2="12" y2="17" />
                    <line x1="9" y1="14" x2="15" y2="14" />
                  </svg>
                  Content
                </h3>
                <div className="record-content" style={{ whiteSpace: "pre-wrap" }}>
                  {content}
                </div>
              </div>

              {record.description && record.description !== content && (
                <div className="record-section">
                  <h3>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#48cae4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Description
                  </h3>
                  <p className="record-notes">{record.description}</p>
                </div>
              )}

              <div className="record-section">
                <p style={{ fontSize: "0.75rem", color: "var(--neutral-600)" }}>
                  IPFS CID: {record.ipfsHash}<br />
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
