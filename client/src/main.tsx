import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add comprehensive error handling for Safari/mobile debugging
function initializeApp() {
  try {
    console.log("🚀 Initializing HwinNwin app...");
    
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.error("❌ Root element not found");
      document.body.innerHTML = '<div style="padding: 20px; color: red; font-family: Arial;">Error: Root element not found. Please refresh the page.</div>';
      return;
    }

    console.log("✅ Root element found, creating React app...");
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log("✅ React app rendered successfully");
    
  } catch (error) {
    console.error("❌ Critical error initializing app:", error);
    
    // Show user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'padding: 20px; margin: 20px; border: 1px solid red; background: #ffe6e6; color: red; font-family: Arial; border-radius: 8px;';
    errorDiv.innerHTML = `
      <h3>Application Error</h3>
      <p>Sorry, there was an error loading the application.</p>
      <p><strong>Error:</strong> ${error instanceof Error ? error.message : 'Unknown error'}</p>
      <p><em>Please try refreshing the page or contact support if the issue persists.</em></p>
      <details style="margin-top: 10px;">
        <summary>Technical Details</summary>
        <pre style="background: #f5f5f5; padding: 10px; margin-top: 5px; font-size: 12px; overflow: auto;">${error instanceof Error ? error.stack || error.message : JSON.stringify(error)}</pre>
      </details>
    `;
    
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.appendChild(errorDiv);
    } else {
      document.body.appendChild(errorDiv);
    }
  }
}

// Add window error handlers for better debugging
window.addEventListener('error', (event) => {
  console.error("❌ Global error:", event.error, event);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error("❌ Unhandled promise rejection:", event.reason);
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
