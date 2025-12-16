import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook React pour gérer une connexion WebSocket.
 * @param {string} url - URL du WebSocket.
 */
export const useWebSocket = (url = null) => {
  const [status, setStatus] = useState('DISCONNECTED'); // CONNECTED, CONNECTING
  const wsRef = useRef(null);

  // Connecte à un WebSocket
  const connect = useCallback(
    (wsUrl) => {
      if (wsRef.current) {
        wsRef.current.close();
      }

      wsRef.current = new WebSocket(wsUrl);
      setStatus('CONNECTING');

      wsRef.current.onopen = () => setStatus('CONNECTED');
      wsRef.current.onclose = () => setStatus('DISCONNECTED');
      wsRef.current.onerror = () => setStatus('ERROR');
    },
    []
  );

  // Déconnecte
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('DISCONNECTED');
  }, []);

  // Envoie un message
  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket non connecté : impossible d’envoyer le message.');
    }
  }, []);

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { status, connect, disconnect, sendMessage };
};
