import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import RecordDetail from "./RecordDetail";
import RecordCard from "./RecordCard";
import FileUpload from "./FileUpload";
import AccessManager from "./AccessManager";
import { RECORD_TYPE_LABELS } from "../utils/web3";
import { getSampleRecordsForPatient, getSampleDoctors } from "../utils/sampleData";

function PatientDashboard({ account, contract, onLogout, activeTab, onTabChange }) {
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contract && account) {
      loadPatientData();
    }
  }, [account, contract]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      console.log('Fetching records from Blockchain...');
      const recordsData = await contract.methods.getMyRecords().call({ from: account });
      const accessList = await contract.methods.getAuthorizedDoctors().call({ from: account });

      console.log('Records fetched from blockchain:', recordsData.length);
      console.log('Access list from blockchain:', accessList.length);

      let mergedRecords = [];
      if (recordsData.length > 0) {
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
        mergedRecords = processedRecords;
      }

      const sampleRecords = getSampleRecordsForPatient();
      const existingCids = new Set(mergedRecords.map(r => r.ipfsHash));
      for (const sr of sampleRecords) {
        if (!existingCids.has(sr.ipfsHash)) {
          mergedRecords.push(sr);
        }
      }
      mergedRecords.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setRecords(mergedRecords);

      if (accessList.length > 0) {
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
      await loadPatientData();
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
      await loadPatientData();
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
      onTabChange("records");
    } catch (err) {
      console.error("Error saving record to blockchain:", err);
      const localRecord = {
        id: Date.now(),
        title: recordData.title || "Medical Record",
        type: recordData.type || "Autre",
        description: recordData.description || "",
        content: recordData.description || "",
        timestamp: Math.floor(Date.now() / 1000),
        ipfsHash: recordData.ipfsHash,
        encryptionKey: recordData.encryptionKey,
        isEncrypted: true,
        doctorAddress: account,
        patientAddress: account,
      };
      setRecords(prev => [localRecord, ...prev]);
      onTabChange("records");
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === "records" ? "active" : ""}`}
          onClick={() => onTabChange("records")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="11" x2="12" y2="17" />
            <line x1="9" y1="14" x2="15" y2="14" />
          </svg>
          Records <span style={{ opacity: 0.6, fontWeight: 400 }}>({records.length})</span>
        </button>
        <button
          className={`tab-button ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => onTabChange("upload")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload
        </button>
        <button
          className={`tab-button ${activeTab === "access" ? "active" : ""}`}
          onClick={() => onTabChange("access")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Access <span style={{ opacity: 0.6, fontWeight: 400 }}>({doctors.filter(d => d.hasAccess).length})</span>
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "records" && (
          <div className="records-section">
            <div className="section-header">
              <h2>Medical Records</h2>
              <p className="section-description">All records are encrypted end-to-end using AES-256</p>
            </div>
            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Loading records...</p>
              </div>
            ) : records.length > 0 ? (
              <div className="records-grid">
                {records.map(record => (
                  <div key={record.id} className="record-grid-item" onClick={() => setSelectedRecord(record)}>
                    <RecordCard record={record} isEncrypted={record.isEncrypted} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
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
              <h2>Upload New Record</h2>
              <p className="section-description">Files are encrypted before being stored on IPFS</p>
            </div>
            <FileUpload account={account} onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {activeTab === "access" && (
          <div className="access-section">
            <div className="section-header">
              <h2>Doctor Access</h2>
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
