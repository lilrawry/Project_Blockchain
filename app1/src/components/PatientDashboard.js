import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import RecordDetail from "./RecordDetail";
import RecordCard from "./RecordCard";
import FileUpload from "./FileUpload";
import AccessManager from "./AccessManager";
import { RECORD_TYPE_LABELS } from "../utils/web3";
import { getSampleRecordsForPatient, getSampleDoctors } from "../utils/sampleData";

/**
 * PatientDashboard.js
 * ─────────────────────────────────────────────────────────────────
 * Professional patient dashboard component
 * Features:
 *   - View personal medical records with proper encryption
 *   - Upload new medical documents (to Blockchain & IPFS)
 *   - Manage doctor access permissions
 *   - Decrypt and view encrypted records using wallet-derived keys
 */

function PatientDashboard({ account, contract, onLogout }) {
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("records");

  useEffect(() => {
    if (contract && account) {
      loadPatientData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, contract]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      console.log('Fetching records from Blockchain...');
      const recordsData = await contract.methods.getMyRecords().call({ from: account });
      const accessList = await contract.methods.getAuthorizedDoctors().call({ from: account });

      console.log('Records fetched from blockchain:', recordsData.length);
      console.log('Access list from blockchain:', accessList.length);

      if (recordsData.length > 0) {
        // Filter and map records from blockchain structure
        // Web3 v4 returns uint types as BigInt, so convert with Number()
        const processedRecords = recordsData.map(record => ({
          id: Number(record.id),
          ipfsHash: record.ipfsCID,
          encryptionKey: record.encryptedKey,
          patientAddress: record.patientAddress,
          doctorAddress: record.doctorAddress,
          timestamp: Number(record.timestamp),
          type: RECORD_TYPE_LABELS[Number(record.recordType)] || "Autre",
          recordTypeRaw: Number(record.recordType),
          description: record.description,
          isEncrypted: true
        }));

        setRecords(processedRecords.reverse());
      } else {
        console.log('Using sample patient records');
        setRecords(getSampleRecordsForPatient());
      }

      if (accessList.length > 0) {
        // Map access list to doctors format
        const doctorsList = accessList.map(doc => ({
          address: doc.doctorAddress,
          name: doc.name,
          hasAccess: doc.active,
          grantedAt: Number(doc.grantedAt)
        }));

        setDoctors(doctorsList);
      } else {
        console.log('Using sample doctors');
        setDoctors(getSampleDoctors());
      }
    } catch (err) {
      console.error("Error loading patient data from blockchain:", err);
      setRecords(getSampleRecordsForPatient());
      setDoctors(getSampleDoctors());
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async (recordIdUnused, doctorAddress) => {
    try {
      setLoading(true);
      const doctorName = prompt("Enter doctor's name or title:");
      if (!doctorName) {
        setLoading(false);
        return;
      }

      await contract.methods.grantAccess(doctorAddress, doctorName).send({ from: account });
      await loadPatientData(); // Refresh data
    } catch (err) {
      console.error("Error granting access:", err);
      alert("Failed to grant access: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (recordIdUnused, doctorAddress) => {
    try {
      setLoading(true);
      await contract.methods.revokeAccess(doctorAddress).send({ from: account });
      await loadPatientData(); // Refresh data
    } catch (err) {
      console.error("Error revoking access:", err);
      alert("Failed to revoke access: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = async (recordData) => {
    try {
      setLoading(true);
      // Determine record type enum index
      // 0: Consultation, 1: Ordonnance, 2: Analyse, 3: Radiologie, 4: Autre
      const typeStr = recordData.type || "Autre";
      const typeIndex = Number(Object.keys(RECORD_TYPE_LABELS).find(key => RECORD_TYPE_LABELS[key] === typeStr) || 4);

      await contract.methods.addRecord(
        account,
        recordData.ipfsHash,
        recordData.encryptionKey,
        typeIndex,
        recordData.description || recordData.title
      ).send({ from: account });

      await loadPatientData();
      setActiveTab("records");
    } catch (err) {
      console.error("Error saving record to blockchain:", err);
      alert("Failed to save record to blockchain: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Navigation 
        breadcrumbs={[
          { label: "Dashboard", active: true },
          { label: "Patient Records", active: true }
        ]}
        onHome={() => window.location.reload()}
      />

      <div className="dashboard-header">
        <div>
          <h1>Your Medical Records</h1>
          <p className="subtitle">Manage your health information securely on the blockchain</p>
        </div>
        <div className="header-actions">
          <span className="account-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </span>
          <button className="btn btn-secondary" onClick={onLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === "records" ? "active" : ""}`}
          onClick={() => setActiveTab("records")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="11" x2="12" y2="17"></line>
            <line x1="9" y1="14" x2="15" y2="14"></line>
          </svg>
          Medical Records ({records.length})
        </button>
        <button
          className={`tab-button ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => setActiveTab("upload")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Upload Record
        </button>
        <button
          className={`tab-button ${activeTab === "access" ? "active" : ""}`}
          onClick={() => setActiveTab("access")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1l.933 1.822 2.048.236-1.48 1.44.349 2.04L12 5.951l-1.85.967.35-2.04-1.48-1.44 2.048-.236L12 1z"></path>
            <circle cx="12" cy="13" r="9"></circle>
          </svg>
          Manage Access ({doctors.filter(d => d.hasAccess).length})
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "records" && (
          <div className="records-section">
            <div className="section-header">
              <h2>Your Records</h2>
              <p className="section-description">All your medical records are encrypted end-to-end using AES-256</p>
            </div>
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Processing...</p>
              </div>
            ) : records.length > 0 ? (
              <div className="records-grid">
                {records.map(record => (
                  <div key={record.id} className="record-grid-item" onClick={() => setSelectedRecord(record)}>
                    <RecordCard
                      record={record}
                      isEncrypted={record.isEncrypted}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <h3>No records yet</h3>
                <p>Upload your first medical record to get started</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "upload" && (
          <div className="upload-section">
            <div className="section-header">
              <h2>Upload New Medical Record</h2>
              <p className="section-description">Records are encrypted before being stored on IPFS</p>
            </div>
            <FileUpload account={account} onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {activeTab === "access" && (
          <div className="access-section">
            <div className="section-header">
              <h2>Manage Doctor Access</h2>
              <p className="section-description">Control which doctors can view your medical records</p>
            </div>
            <AccessManager
              currentAccessList={doctors}
              onGrantAccess={handleGrantAccess}
              onRevokeAccess={handleRevokeAccess}
            />
          </div>
        )}
      </div>

      {selectedRecord && (
        <RecordDetail
          record={selectedRecord}
          account={account}
          onBack={() => setSelectedRecord(null)}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}

export default PatientDashboard;
