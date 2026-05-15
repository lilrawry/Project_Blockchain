import React, { useState, useRef } from "react";
import { encryptData, deriveKey } from "../utils/crypto";
import { uploadToIPFS } from "../utils/ipfs";

/**
 * FileUpload.js
 * ─────────────────────────────────────────────────────────────────
 * File upload component with drag-and-drop and encryption
 * Features:
 *   - Drag-and-drop file upload
 *   - File encryption before IPFS upload
 *   - Progress bar display
 *   - Support for multiple file types
 */

function FileUpload({ account, onUploadSuccess, onUploadError, recordTitle = "" }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      if (onUploadError) onUploadError("File size exceeds 10MB limit");
      else alert("File size exceeds 10MB limit");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      if (onUploadError) onUploadError("Please select a file first");
      else alert("Please select a file first");
      return;
    }

    try {
      setIsUploading(true);
      setProgress(0);

      // Read file as binary
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fileData = e.target.result;
          setProgress(30);

          // Derive key from account (the patient's account)
          const key = deriveKey(account);

          // Encrypt file data
          const encryptedPayload = encryptData(fileData, key);
          setProgress(60);

          // Upload to IPFS
          const ipfsHash = await uploadToIPFS(encryptedPayload);
          setProgress(90);

          // Prepare record metadata
          const recordData = {
            title: recordTitle || selectedFile.name,
            ipfsHash: ipfsHash,
            encryptionKey: key,
            type: "Autre", // Default type
            description: `Uploaded: ${selectedFile.name}`,
          };

          setProgress(100);
          onUploadSuccess(recordData);
          setSelectedFile(null);
          setProgress(0);
        } catch (err) {
          console.error("Upload error:", err);
          if (onUploadError) onUploadError(err.message || "Upload failed");
          else alert("Upload failed: " + err.message);
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        if (onUploadError) onUploadError("Failed to read file");
        setIsUploading(false);
      };

      reader.readAsArrayBuffer(selectedFile);
    } catch (err) {
      console.error("File processing error:", err);
      if (onUploadError) onUploadError(err.message || "Failed to process file");
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div
        className={`file-upload ${isDragOver ? "dragover" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon">📄</div>
        <p className="upload-text">
          {selectedFile
            ? `Selected: ${selectedFile.name}`
            : "Drag & drop your file here, or click to browse"}
        </p>
        <p className="upload-hint">Max file size: 10MB | Supported: PDF, DOC, IMG, etc.</p>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          style={{ display: "none" }}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
        />
      </div>

      {selectedFile && (
        <div style={{ marginTop: "var(--spacing-lg)" }}>
          <div
            style={{
              display: "flex",
              gap: "var(--spacing-md)",
              marginBottom: "var(--spacing-md)",
            }}
          >
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload & Encrypt"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSelectedFile(null);
                setProgress(0);
              }}
              disabled={isUploading}
            >
              Cancel
            </button>
          </div>

          {isUploading && (
            <div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--neutral-400)", marginTop: "var(--spacing-sm)" }}>
                {progress}% Complete
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
