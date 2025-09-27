import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Enhanced error handling and recovery system
function initializeApp() {
  try {
    console.log("🚀 Initializing HwinNwin app...");
    
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.error("❌ Root element not found");
      createFallbackUI("Root element not found. Please refresh the page.");
      return;
    }

    console.log("✅ Root element found, creating React app...");
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log("✅ React app rendered successfully");
    
    // Add automatic recovery mechanism
    setTimeout(() => {
      if (rootElement.children.length === 0) {
        console.warn("⚠️ App may not have rendered properly, attempting recovery...");
        location.reload();
      }
    }, 5000);
    
  } catch (error) {
    console.error("❌ Critical error initializing app:", error);
    handleAppError(error);
  }
}

// Enhanced error handling with recovery options
function handleAppError(error: any) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : JSON.stringify(error);
  
  createFallbackUI(errorMessage, errorStack);
}

// Create user-friendly fallback UI with recovery options
function createFallbackUI(message: string, stack?: string) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    padding: 40px 20px;
    max-width: 800px;
    margin: 40px auto;
    font-family: 'Inter', Arial, sans-serif;
    line-height: 1.6;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  `;
  
  errorDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #ff6b6b, #ee5a24); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 36px;">⚠</span>
      </div>
      <h2 style="color: #2c3e50; margin: 0 0 10px; font-size: 24px; font-weight: 600;">Application Loading Error</h2>
      <p style="color: #7f8c8d; font-size: 16px; margin: 0;">We encountered an issue while starting the application</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <strong style="color: #e74c3c;">Error:</strong> ${message}
    </div>
    
    <div style="text-align: center; margin-bottom: 20px;">
      <button onclick="location.reload()" style="
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        margin: 0 10px;
        transition: transform 0.2s;
      " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
        🔄 Refresh Page
      </button>
      
      <button onclick="window.location.href='/hwin'" style="
        background: linear-gradient(135deg, #2ecc71, #27ae60);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        margin: 0 10px;
        transition: transform 0.2s;
      " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
        🏠 Go to Homepage
      </button>
    </div>
    
    <div style="text-align: center; margin-bottom: 20px;">
      <small style="color: #95a5a6;">
        Try refreshing first. If the problem persists, go to the homepage.
      </small>
    </div>
    
    ${stack ? `
      <details style="margin-top: 20px;">
        <summary style="cursor: pointer; color: #7f8c8d; font-size: 14px; margin-bottom: 10px;">
          🔧 Technical Details (for developers)
        </summary>
        <div style="background: #2c3e50; color: #ecf0f1; padding: 15px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 12px; overflow: auto; white-space: pre-wrap;">
${stack}</div>
      </details>
    ` : ''}
  `;
  
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = '';
    rootElement.appendChild(errorDiv);
  } else {
    document.body.appendChild(errorDiv);
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
