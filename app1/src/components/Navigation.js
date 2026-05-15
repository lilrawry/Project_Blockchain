import React from "react";

function Navigation({ breadcrumbs = [], onBack, onHome }) {
  return (
    <div className="navigation-header">
      <div className="navigation-content">
        <div className="navigation-left">
          {onBack && (
            <button className="nav-button" onClick={onBack} title="Go back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
          {onHome && (
            <button className="nav-button" onClick={onHome} title="Home">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Home
            </button>
          )}
        </div>

        {breadcrumbs.length > 0 && (
          <div className="breadcrumbs">
            {breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="breadcrumb-item">
                {idx > 0 && <span className="breadcrumb-separator">/</span>}
                <span className={crumb.active ? "breadcrumb-active" : ""}>
                  {crumb.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Navigation;
