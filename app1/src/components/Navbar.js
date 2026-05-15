import React, { useState, useEffect } from "react";
import { getIPFSStatus } from "../utils/ipfs";

/**
 * Navbar.js
 * ─────────────────────────────────────────────────────────────────
 * Navigation bar component with wallet display, role badge, and IPFS status
 * Features:
 *   - Display connected wallet address (truncated)
 *   - Show user role (Patient/Doctor) 
 *   - Display IPFS connection status
 *   - Disconnect wallet button
 */

function Navbar({ account, userRole, onDisconnect }) {
  const [ipfsConnected, setIpfsConnected] = useState(false);

  useEffect(() => {
    getIPFSStatus().then((status) => setIpfsConnected(status.available));
  }, []);

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getRoleBadge = () => {
    if (!userRole) return null;
    const roleText = userRole === "patient" ? "Patient" : "Doctor";
    const color = userRole === "patient" ? "#00d9ff" : "#00e676";
    return (
      <span
        style={{
          padding: "0.4rem 0.8rem",
          borderRadius: "999px",
          fontSize: "0.75rem",
          fontWeight: "700",
          backgroundColor: `${color}20`,
          color: color,
          border: `1px solid ${color}`,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {roleText}
      </span>
    );
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span>🏥</span>
        <span>MedRecords</span>
      </div>

      <div className="navbar-center">
        {userRole && getRoleBadge()}
      </div>

      <div className="navbar-right">
        {account && (
          <div className="wallet-info">
            <span>💰</span>
            <code>{truncateAddress(account)}</code>
          </div>
        )}

        <div className={`ipfs-status ${ipfsConnected ? "" : "offline"}`}>
          <span>{ipfsConnected ? "✓" : "✕"}</span>
          <span>IPFS</span>
        </div>

        {account && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={onDisconnect}
            style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
          >
            Disconnect
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
