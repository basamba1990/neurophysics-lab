import React, { useState, useCallback } from 'react';
import Button from '../ui/Button';         // <-- correction : import par défaut
import Input from '../ui/Input';           // <-- correction : import par défaut
import { useOrchestrator } from '../../hooks/useOrchestrator';
import { VectorContext } from '../../hooks/useVectorContext'; // <-- import correct
import { logger } from '../../utils/logger'; // Logger frontend

const OrchestratorChat = () => {
  const [input, setInput] = useState('');
  const { messages, sendMessage, isLoading } = useOrchestrator();

  // Récupérer le context depuis le provider
  const { contextId } = React.useContext(VectorContext);

  const handleSend = useCallback(() => {
    if (input.trim() === '') return;
    logger.info(`Envoi de la requête à l'orchestrateur: ${input}`);
    sendMessage(input, contextId);
    setInput('');
  }, [input, sendMessage, contextId]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  }, [handleSend, isLoading]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">NeuroPhysics AI Orchestrator</h2>
      
      {/* Zone de messages */}
      <div className="flex-grow overflow-y-auto space-y-4 p-2 border rounded-md bg-gray-50 mb-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            Posez une question complexe ou demandez une simulation.
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3/4 p-3 rounded-lg ${
              msg.sender === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}>
              <p className="font-medium">{msg.sender === 'user' ? 'Vous' : 'Orchestrateur'}</p>
              <p>{msg.text}</p>
              {msg.plan && (
                <div className="mt-2 text-sm bg-gray-100 p-2 rounded text-gray-700">
                  <strong>Plan:</strong> {msg.plan.description}
                  <ul className="list-disc list-inside ml-2">
                    {msg.plan.steps.map((step, i) => (
                      <li key={i}>{step.task_type} ({step.params.model || step.params.engine || 'local'})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-3/4 p-3 rounded-lg bg-gray-200 text-gray-800">
              <p className="font-medium">Orchestrateur</p>
              <p>... en cours de traitement</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Zone de saisie */}
      <div className="flex space-x-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Décrivez votre objectif (ex: Simuler le transfert de chaleur et optimiser la forme)"
          className="flex-grow"
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={isLoading}>
          {isLoading ? 'Envoi...' : 'Envoyer'}
        </Button>
      </div>
    </div>
  );
};

export default OrchestratorChat;
