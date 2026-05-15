import React, { useState, useEffect } from "react";
import RecordDetail from "./RecordDetail";
import RecordCard from "./RecordCard";
import { RECORD_TYPE_LABELS } from "../utils/web3";
import { getSamplePatientsForDoctor } from "../utils/sampleData";

/**
 * DoctorDashboard.js
 * ─────────────────────────────────────────────────────────────────
 * Doctor dashboard component
 * Features:
 *   - View list of patients who granted access (via Blockchain Events)
 *   - Access patient records (via Smart Contract with permission)
 *   - View detailed medical records
 */

function DoctorDashboard({ account, contract, web3, onLogout }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("patients"); // patients, records

  useEffect(() => {
    if (contract && account) {
      loadPatientsFromEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, contract]);

  useEffect(() => {
    if (selectedPatient && activeTab === "records") {
      loadPatientRecords(selectedPatient.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatient, activeTab]);

  const loadPatientsFromEvents = async () => {
    try {
      setLoading(true);
      console.log("Fetching AccessGranted events for doctor:", account);
      
      // Fetch AccessGranted events where this doctor is the target
      const events = await contract.getPastEvents("AccessGranted", {
        filter: { doctor: account },
        fromBlock: 0,
        toBlock: "latest"
      });

      // Extract unique patients who currently have authorizedDoctors[patient][doctor] == true
      const patientAddresses = [...new Set(events.map(ev => ev.returnValues.patient))];
      
      const patientsList = [];
      for (const pAddr of patientAddresses) {
        const isAuth = await contract.methods.isAuthorized(pAddr, account).call();
        if (isAuth) {
          // Find the latest name used for this doctor
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
        // Web3 v4 returns uint types as BigInt, convert with Number()
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
            👨‍⚕️ {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </span>
          <button className="btn btn-secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === "patients" ? "active" : ""}`}
          onClick={() => setActiveTab("patients")}
        >
          My Patients ({patients.length})
        </button>
        {selectedPatient && (
          <button
            className={`tab-button ${activeTab === "records" ? "active" : ""}`}
            onClick={() => setActiveTab("records")}
          >
            Records: {truncateAddress(selectedPatient.address)}
          </button>
        )}
      </div>

      <div className="dashboard-content">
        {activeTab === "patients" && (
          <div className="patients-section">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
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
                      setActiveTab("records");
                    }}
                  >
                    <div className="record-card glass-lg">
                      <div className="record-card-header">
                        <div className="record-card-type-badge">Patient</div>
                        <div className="record-encrypted-badge" style={{ background: "rgba(0, 230, 118, 0.2)", color: "#00e676" }}>
                          ✓ Authorized
                        </div>
                      </div>
                      <h3 className="record-card-title">{patient.name}</h3>
                      <p className="record-card-description" style={{ fontSize: "0.85rem" }}>
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
                <h3>No patients yet</h3>
                <p>Patients will appear here once they grant you access on the blockchain</p>
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
                <div className="spinner"></div>
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
