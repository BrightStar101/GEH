/**
 * main.jsx
 * Global Entry Hub – Frontend Bootstrapper
 *
 * Mounts the application to the DOM using React 18 standards.
 * All routing and component logic is centralized in App.jsx.
 * Includes hard fail fallback if root element is missing or corrupted.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App";
import "./i18n";
import "./styles/main.css";

function mountApplication() {
  try {
    const container = document.getElementById("root");

    if (!container) {
      console.error("GEH Mount Error: #root element not found in index.html");
      document.body.innerHTML =
        "<main style='display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;font-family:sans-serif'><div><h1>Critical Error</h1><p>The application could not be loaded. Please refresh or contact support@globalentryhub.com.</p></div></main>";
      return;
    }

    const root = ReactDOM.createRoot(container);
    root.render(
      // <React.StrictMode>
        <App />
      // </React.StrictMode>
    );
  } catch (err) {
    console.error("GEH Fatal Mount Error:", err); 
    document.body.innerHTML =
      "<main style='display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;font-family:sans-serif'><div><h1>Startup Failure</h1><p>An unexpected error occurred while launching the app. Please try again or contact support.</p></div></main>";
  }
}

mountApplication();
