import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook for handling owner authentication across owner pages
 * 
 * This hook manages:
 * - Session checking on initial load
 * - PIN modal state (show/hide)
 * - Authentication status
 * - Handling successful PIN authentication
 * - Preventing API calls until authenticated
 * 
 * Usage pattern:
 * 1. Call this hook at the top of owner components
 * 2. Render PIN modal using the provided props
 * 3. Only make API calls when isAuthenticated is true
 * 4. Handle 401 errors by calling showPinModal()
 */
export function useOwnerAuth() {
  const [location, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Check if this is an owner route
  const isOwnerRoute = location.startsWith('/owner');

  // Check for existing session on owner routes
  const sessionCheck = useQuery({
    queryKey: ['/api/owner/session'],
    enabled: isOwnerRoute && isInitialLoad,
    retry: false, // Don't retry on 401
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    staleTime: 5 * 60 * 1000, // Consider session valid for 5 minutes
  });

  useEffect(() => {
    if (isOwnerRoute && isInitialLoad) {
      if (sessionCheck.isSuccess) {
        // Valid session exists, authenticate without PIN modal
        setIsAuthenticated(true);
        setIsInitialLoad(false);
      } else if (sessionCheck.isError) {
        // No valid session, show PIN modal
        setShowPinModal(true);
        setIsInitialLoad(false);
      }
      // If still loading, wait for session check to complete
    }
  }, [isOwnerRoute, isInitialLoad, sessionCheck.isSuccess, sessionCheck.isError]);

  const handlePinSuccess = () => {
    setIsAuthenticated(true);
    setShowPinModal(false);
  };

  const handlePinModalClose = () => {
    // If user closes PIN modal without authenticating, redirect to home
    if (!isAuthenticated) {
      navigate('/');
    } else {
      setShowPinModal(false);
    }
  };

  const handle401Error = () => {
    // When API calls return 401, show PIN modal instead of redirecting
    setIsAuthenticated(false);
    setShowPinModal(true);
  };

  return {
    isAuthenticated,
    showPinModal: showPinModal,
    onPinSuccess: handlePinSuccess,
    onPinModalClose: handlePinModalClose,
    handle401Error,
    // Helper to determine if components should make API calls
    shouldMakeApiCalls: isAuthenticated
  };
}