// src/contexts/OrchestratorProvider.jsx
import React, { createContext } from 'react';
import { useOrchestrator as useOrchestratorHook } from '../hooks/useOrchestrator';

export const OrchestratorContext = createContext();

export const OrchestratorProvider = ({ children }) => {
  const orchestrator = useOrchestratorHook();

  return (
    <OrchestratorContext.Provider value={orchestrator}>
      {children}
    </OrchestratorContext.Provider>
  );
};
