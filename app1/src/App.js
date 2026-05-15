import React, { useEffect, useState } from "react";
import { initWeb3, resetInstance } from "./utils/web3";
import Navbar from "./components/Navbar";
import LoadingScreen from "./components/LoadingScreen";
import RoleSelection from "./components/RoleSelection";
import PatientDashboard from "./components/PatientDashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import "./App.css";

const DEMO_ACCOUNT = "0x742d35Cc6634C0532925a3b844Bc9e7595f42dA4";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [web3Instance, setWeb3Instance] = useState(null);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [activeTab, setActiveTab] = useState("records");
  useEffect(() => {
    initializeBlockchain();
    listenToAccountChanges();
  }, []);

  const initializeBlockchain = async () => {
    try {
      setLoading(true);
      setError("");

      if (!window.ethereum) {
        setError("MetaMask not detected. Please install MetaMask extension.");
        setLoading(false);
        return;
      }

      const { web3, account, contract } = await initWeb3();

      setWeb3Instance(web3);
      setAccount(account);
      setContract(contract);

      if (showRolePicker) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      await checkUserRole(contract, account);
      setLoading(false);
    } catch (err) {
      console.error("Blockchain initialization error:", err);
      setError(err.message || "Failed to connect to blockchain");
      setLoading(false);
    }
  };

  const enterDemoMode = () => {
    setAccount(DEMO_ACCOUNT);
    setContract(null);
    setWeb3Instance(null);
    setError("");
    setUserRole(null);
    setShowRolePicker(true);
    setLoading(false);
  };

  const checkUserRole = async (contractInstance, userAccount) => {
    try {
      const role = await contractInstance.methods
        .getRole(userAccount)
        .call();

      console.log("User role from contract:", role);

      const roleNum = Number(role);
      if (roleNum === 1) {
        setUserRole("patient");
        setActiveTab("records");
      } else if (roleNum === 2) {
        setUserRole("doctor");
        setActiveTab("patients");
      } else {
        setUserRole(null);
      }
    } catch (err) {
      console.warn("Could not fetch user role from contract", err);
    }
  };

  const listenToAccountChanges = () => {
    if (!window.ethereum) return;

    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        setAccount("");
        setUserRole(null);
      } else {
        setAccount(accounts[0]);
        resetInstance();
        setShowRolePicker(true);
        setLoading(true);
        window.location.reload();
      }
    });

    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });
  };

  const handleRoleSelect = async (role) => {
    if (!contract) {
      setUserRole(role);
      setActiveTab(role === "doctor" ? "patients" : "records");
      setShowRolePicker(false);
      return;
    }
    try {
      setLoading(true);
      const roleId = role === "patient" ? 1 : 2;

      await contract.methods.registerRole(roleId).send({ from: account });

      setUserRole(role);
      setActiveTab(role === "doctor" ? "patients" : "records");
      setShowRolePicker(false);
      setLoading(false);
    } catch (err) {
      console.error("Error registering role:", err);
      alert("Failed to register role on blockchain: " + (err.message || "Unknown error"));
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    resetInstance();
    setShowRolePicker(true);
    setAccount("");
    setUserRole(null);
    setContract(null);
    setWeb3Instance(null);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div className="card card-glass animate-fade-in" style={{ maxWidth: "460px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "1rem", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 style={{ color: "var(--neutral-0)", marginBottom: "0.5rem" }}>Connection Error</h2>
          <p style={{ fontSize: "0.9rem", marginBottom: "1.5rem" }}>{error}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button className="btn btn-primary btn-block" onClick={initializeBlockchain}>
              Retry Connection
            </button>
            <button className="btn btn-secondary btn-block" onClick={enterDemoMode}>
              Continue in Demo Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div className="card card-glass animate-fade-in" style={{ maxWidth: "420px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "1rem", background: "rgba(0,180,216,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#48cae4" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 style={{ marginBottom: "0.5rem" }}>Connect Wallet</h2>
          <p style={{ fontSize: "0.9rem", marginBottom: "1.5rem" }}>Connect your MetaMask wallet to access the platform</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button className="btn btn-primary btn-xl btn-block" onClick={initializeBlockchain}>
              Connect MetaMask
            </button>
            <button className="btn btn-secondary btn-block" onClick={enterDemoMode}>
              Continue as Demo (No Wallet)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <>
        <Navbar account={account} userRole={userRole} onDisconnect={handleDisconnect} />
        <RoleSelection account={account} onSelectRole={handleRoleSelect} />
      </>
    );
  }

  return (
    <>
      <Navbar
        account={account}
        userRole={userRole}
        onDisconnect={handleDisconnect}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div style={{ paddingTop: "64px" }}>
        {userRole === "patient" ? (
          <PatientDashboard account={account} contract={contract} onLogout={handleDisconnect} activeTab={activeTab} onTabChange={setActiveTab} />
        ) : (
          <DoctorDashboard account={account} contract={contract} onLogout={handleDisconnect} web3={web3Instance} activeTab={activeTab} onTabChange={setActiveTab} />
        )}
      </div>
    </>
  );
}

export default App;
