import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Ensure DOM is ready and React refresh is initialized
function initializeApp() {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found");
    return;
  }
  
  try {
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error("Failed to render app:", error);
    // Fallback: try again after a brief delay
    setTimeout(() => {
      try {
        createRoot(rootElement).render(<App />);
      } catch (retryError) {
        console.error("Failed to render app on retry:", retryError);
      }
    }, 100);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
