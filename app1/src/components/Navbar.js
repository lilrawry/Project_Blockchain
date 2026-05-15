import React, { useState, useEffect } from "react";
import { getIPFSStatus } from "../utils/ipfs";

function Navbar({ account, userRole, onDisconnect, activeTab, onTabChange }) {
  const [ipfsConnected, setIpfsConnected] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getIPFSStatus().then((status) => setIpfsConnected(status.available));
  }, []);

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const getRoleStyle = () => {
    if (!userRole) return null;
    return {
      className: `role-badge-nav ${userRole}`,
      label: userRole === "patient" ? "Patient" : "Doctor",
      icon: userRole === "patient" ? "●" : "●",
    };
  };

  const roleStyle = getRoleStyle();

  const navLinks = userRole
    ? [
        { id: "records", label: "Records", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6" },
        { id: "upload", label: "Upload", icon: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12" },
        { id: "access", label: "Access", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
      ]
    : [];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">+</div>
        <span className="navbar-brand-text">MedRecords</span>
      </div>

      {userRole && (
        <>
          <div className={`navbar-links${mobileOpen ? " open" : ""}`}>
            {navLinks.map((link) => (
              <button
                key={link.id}
                className={`navbar-link${activeTab === link.id ? " active" : ""}`}
                onClick={() => { onTabChange(link.id); setMobileOpen(false); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={link.icon} />
                </svg>
                {link.label}
              </button>
            ))}
          </div>

          <button className="navbar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {mobileOpen
                ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                : <><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></>
              }
            </svg>
          </button>
        </>
      )}

      <div className="navbar-right">
        {roleStyle && (
          <span className={roleStyle.className}>
            <span>{roleStyle.icon}</span>
            <span>{roleStyle.label}</span>
          </span>
        )}

        <div className={`ipfs-indicator${ipfsConnected ? " online" : " offline"}`}>
          <span className="ipfs-dot" />
          <span>IPFS</span>
        </div>

        {account && (
          <div className="wallet-badge" onClick={handleCopy} title="Copy address">
            <span className="wallet-dot" />
            <span className="wallet-address">{truncateAddress(account)}</span>
            <span className="wallet-copy-btn">
              {copied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </span>
          </div>
        )}

        {account && (
          <button className="navbar-disconnect" onClick={onDisconnect} title="Disconnect wallet">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Exit</span>
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
