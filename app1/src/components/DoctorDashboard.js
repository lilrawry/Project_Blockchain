import React, { useState, useEffect } from "react";
import RecordDetail from "./RecordDetail";
import RecordCard from "./RecordCard";
import { RECORD_TYPE_LABELS } from "../utils/web3";
import { getSamplePatientsForDoctor } from "../utils/sampleData";

function DoctorDashboard({ account, contract, web3, onLogout, activeTab, onTabChange }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);

  useEffect(() => {
    if (contract && account) {
      loadPatientsFromEvents();
    }
  }, [account, contract]);

  useEffect(() => {
    if (selectedPatient && activeTab === "records") {
      loadPatientRecords(selectedPatient.address);
    }
  }, [selectedPatient, activeTab]);

  const loadPatientsFromEvents = async () => {
    try {
      setLoading(true);
      console.log("Fetching AccessGranted events for doctor:", account);

      const events = await contract.getPastEvents("AccessGranted", {
        filter: { doctor: account },
        fromBlock: 0,
        toBlock: "latest"
      });

      const patientAddresses = [...new Set(events.map(ev => ev.returnValues.patient))];

      const patientsList = [];
      for (const pAddr of patientAddresses) {
        const isAuth = await contract.methods.isAuthorized(pAddr, account).call();
        if (isAuth) {
          const latestEvent = events.filter(ev => ev.returnValues.patient === pAddr).pop();
          patientsList.push({
            address: pAddr,
            name: "Patient " + pAddr.substring(0, 6),
            accessGrantedAt: Number(latestEvent.returnValues.timestamp)
          });
        }
      }

      if (patientsList.length > 0) {
        setPatients(patientsList);
      } else {
        console.log('Using sample patients for doctor view');
        setPatients(getSamplePatientsForDoctor());
      }
    } catch (err) {
      console.error("Error loading patients from events:", err);
      setPatients(getSamplePatientsForDoctor());
    } finally {
      setLoading(false);
    }
  };

  const loadPatientRecords = async (patientAddress) => {
    try {
      setRecordsLoading(true);
      console.log("Fetching records for patient:", patientAddress);

      const recordsData = await contract.methods.getPatientRecords(patientAddress).call({ from: account });

      if (recordsData.length > 0) {
        const processedRecords = recordsData.map(record => ({
          id: Number(record.id),
          ipfsHash: record.ipfsCID,
          encryptionKey: record.encryptedKey,
          patientAddress: record.patientAddress,
          doctorAddress: record.doctorAddress,
          timestamp: Number(record.timestamp),
          type: RECORD_TYPE_LABELS[Number(record.recordType)] || "Autre",
          description: record.description,
          isEncrypted: true
        }));

        setPatientRecords(processedRecords.reverse());
      } else {
        console.log('Using sample records for patient');
        const samplePatients = getSamplePatientsForDoctor();
        const foundPatient = samplePatients.find(p => p.address.toLowerCase() === patientAddress.toLowerCase());
        if (foundPatient) {
          setPatientRecords([...foundPatient.records].reverse());
        } else {
          setPatientRecords([]);
        }
      }
    } catch (err) {
      console.error("Error loading patient records from contract:", err);
      const samplePatients = getSamplePatientsForDoctor();
      const foundPatient = samplePatients.find(p => p.address.toLowerCase() === patientAddress.toLowerCase());
      if (foundPatient) {
        setPatientRecords([...foundPatient.records].reverse());
      } else {
        alert("Failed to load records. Ensure you still have access.");
        setPatientRecords([]);
      }
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
  };

  const handleCloseRecord = () => {
    setSelectedRecord(null);
  };

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Doctor Dashboard</h1>
          <p className="subtitle">Access patient records with granted permissions</p>
        </div>
        <div className="header-actions">
          <span className="account-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
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
          className={`tab-button ${activeTab === "patients" ? "active" : ""}`}
          onClick={() => onTabChange("patients")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Patients <span style={{ opacity: 0.6, fontWeight: 400 }}>({patients.length})</span>
        </button>
        {selectedPatient && (
          <button
            className={`tab-button ${activeTab === "records" ? "active" : ""}`}
            onClick={() => onTabChange("records")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Records: {truncateAddress(selectedPatient.address)}
          </button>
        )}
      </div>

      <div className="dashboard-content">
        {activeTab === "patients" && (
          <div className="patients-section">
            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Finding patients...</p>
              </div>
            ) : patients.length > 0 ? (
              <div className="records-grid">
                {patients.map((patient) => (
                  <div
                    key={patient.address}
                    className="record-grid-item"
                    onClick={() => {
                      setSelectedPatient(patient);
                      onTabChange("records");
                    }}
                  >
                    <div className="record-card">
                      <div className="record-card-header">
                        <div className="record-card-type-badge">Patient</div>
                        <div className="record-encrypted-badge" style={{ background: "rgba(0, 230, 118, 0.08)", borderColor: "rgba(0, 230, 118, 0.15)", color: "var(--secondary-light)" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Authorized
                        </div>
                      </div>
                      <h3 className="record-card-title">{patient.name}</h3>
                      <p className="record-card-description" style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                        {patient.address}
                      </p>
                      <div className="record-card-footer">
                        Granted: {new Date(patient.accessGrantedAt * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                <h3>No patients yet</h3>
                <p>Patients will appear here once they grant you access</p>
                <button className="btn btn-primary" onClick={loadPatientsFromEvents} style={{ marginTop: "1rem" }}>
                  Refresh List
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "records" && selectedPatient && (
          <div className="records-section">
            <div className="section-header">
              <h2>Records for {truncateAddress(selectedPatient.address)}</h2>
            </div>

            {recordsLoading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Loading records...</p>
              </div>
            ) : patientRecords.length > 0 ? (
              <div className="records-grid">
                {patientRecords.map((record) => (
                  <div
                    key={record.id}
                    className="record-grid-item"
                    onClick={() => handleViewRecord(record)}
                  >
                    <RecordCard record={record} isEncrypted={true} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No records available</h3>
                <p>This patient hasn't uploaded any records yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedRecord && (
        <RecordDetail
          record={selectedRecord}
          account={account}
          onClose={handleCloseRecord}
          onBack={handleCloseRecord}
        />
      )}
    </div>
  );
}

export default DoctorDashboard;
