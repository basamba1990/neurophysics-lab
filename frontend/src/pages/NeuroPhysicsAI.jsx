import React from 'react';
import WorkspaceLayout from '../components/layout/WorkspaceLayout';
import OrchestratorChat from '../components/orchestrator/OrchestratorChat';
import WorkflowBuilder from '../components/orchestrator/WorkflowBuilder';
import ExecutionPlan from '../components/orchestrator/ExecutionPlan';
import ResultsSynthesizer from '../components/orchestrator/ResultsSynthesizer';
import { OrchestratorProvider } from '../hooks/useOrchestrator';
import { VectorProvider } from '../hooks/useVectorContext';

const NeuroPhysicsAI = () => {
  return (
    <WorkspaceLayout title="NeuroPhysics AI Orchestrator">
      <VectorProvider>
        <OrchestratorProvider>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Colonne 1: Chat et Synthèse */}
            <div className="lg:col-span-2 flex flex-col space-y-6">
              <div className="h-3/5">
                <OrchestratorChat />
              </div>
              <div className="h-2/5">
                <ResultsSynthesizer />
              </div>
            </div>

            {/* Colonne 2: Planification et Workflow */}
            <div className="lg:col-span-1 flex flex-col space-y-6">
              <div className="h-1/2">
                <WorkflowBuilder />
              </div>
              <div className="h-1/2">
                <ExecutionPlan />
              </div>
            </div>
          </div>
        </OrchestratorProvider>
      </VectorProvider>
    </WorkspaceLayout>
  );
};

export default NeuroPhysicsAI;
