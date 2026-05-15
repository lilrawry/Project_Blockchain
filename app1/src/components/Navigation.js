import React from "react";

/**
 * Navigation.js
 * Professional navigation component with breadcrumbs and back button
 */
function Navigation({ breadcrumbs = [], onBack, onHome }) {
  return (
    <div className="navigation-header">
      <div className="navigation-content">
        <div className="navigation-left">
          {onBack && (
            <button 
              className="nav-button nav-back"
              onClick={onBack}
              title="Go back to previous page"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          )}
          {onHome && (
            <button 
              className="nav-button nav-home"
              onClick={onHome}
              title="Go to home"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v6h-6M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 21v-6h6"/>
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
