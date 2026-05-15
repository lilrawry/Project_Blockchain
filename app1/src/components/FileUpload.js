import React, { useState, useRef } from "react";
import { encryptData, deriveKey } from "../utils/crypto";
import { uploadToIPFS } from "../utils/ipfs";

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

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fileData = e.target.result;
          setProgress(30);

          const key = deriveKey(account);
          const encryptedData = encryptData(fileData, key);
          setProgress(60);

          const fileWrapper = JSON.stringify({
            name: selectedFile.name,
            mimeType: selectedFile.type || "application/octet-stream",
            data: encryptedData
          });
          const ipfsHash = await uploadToIPFS(fileWrapper);
          setProgress(90);

          const recordData = {
            title: recordTitle || selectedFile.name,
            ipfsHash: ipfsHash,
            encryptionKey: key,
            type: "Autre",
            description: `Uploaded: ${selectedFile.name}`,
          };

          setProgress(100);
          setTimeout(() => {
            onUploadSuccess(recordData);
            setSelectedFile(null);
            setProgress(0);
          }, 400);
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
        <div className="upload-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#48cae4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
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
        <div style={{ marginTop: "var(--spacing-2xl)" }}>
          <div style={{ display: "flex", gap: "var(--spacing-md)", marginBottom: "var(--spacing-lg)" }}>
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <><span className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 1.5, marginRight: 4 }} /> Uploading...</>
              ) : "Upload & Encrypt"}
            </button>
            <button
              className="btn btn-outline"
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
            <div className="animate-fade-in">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--neutral-600)", marginTop: "var(--spacing-sm)" }}>
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
