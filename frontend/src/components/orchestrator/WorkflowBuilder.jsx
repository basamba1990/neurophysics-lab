import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { logger } from '../../../utils/logger';

const initialWorkflow = [
  { id: 1, type: 'Start', description: 'Début du workflow' },
  { id: 2, type: 'PINN Training', description: 'Entraînement du modèle PINN' },
  { id: 3, type: 'Optimization', description: 'Optimisation multi-objectif' },
  { id: 4, type: 'End', description: 'Fin du workflow' },
];

const WorkflowBuilder = () => {
  const [workflow, setWorkflow] = useState(initialWorkflow);
  const [newStepType, setNewStepType] = useState('');

  const handleAddStep = () => {
    if (!newStepType) return;
    const newStep = {
      id: workflow.length + 1,
      type: newStepType,
      description: `Nouvelle étape: ${newStepType}`,
    };
    setWorkflow([...workflow.slice(0, -1), newStep, workflow[workflow.length - 1]]);
    setNewStepType('');
    logger.info(`Étape ajoutée: ${newStepType}`);
  };

  const handleSave = () => {
    logger.info('Workflow sauvegardé:', workflow);
    alert('Workflow sauvegardé (simulé)');
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Constructeur de Workflows</h2>
      
      <div className="space-y-2 mb-4 border p-3 rounded-md bg-gray-50">
        {workflow.map((step, index) => (
          <div key={step.id} className="flex items-center justify-between p-2 bg-white border rounded-md shadow-sm">
            <span className="font-mono text-sm text-gray-600">{index + 1}.</span>
            <span className="font-medium text-blue-600">{step.type}</span>
            <span className="text-sm text-gray-500">{step.description}</span>
          </div>
        ))}
      </div>

      <div className="flex space-x-2 mb-4">
        <Input
          type="text"
          value={newStepType}
          onChange={(e) => setNewStepType(e.target.value)}
          placeholder="Type d'étape (ex: Data Prep)"
          className="flex-grow"
        />
        <Button onClick={handleAddStep} disabled={!newStepType}>
          Ajouter Étape
        </Button>
      </div>

      <Button onClick={handleSave} className="w-full bg-green-500 hover:bg-green-600">
        Sauvegarder le Workflow
      </Button>
    </div>
  );
};

export default WorkflowBuilder;
