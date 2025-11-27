// frontend/src/components/collaboration/TeamShare.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';
import Input from '../ui/Input';

const TeamShare = ({ collaborators, onInvite, onRemove }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');

  const handleInvite = (e) => {
    e.preventDefault();
    if (email.trim()) {
      onInvite(email, role);
      setEmail('');
      setRole('viewer');
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Partage et Collaboration</h2>

      {/* Liste des Collaborateurs */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-indigo-600 mb-2">Collaborateurs Actuels</h3>
        <ul className="space-y-2">
          {collaborators.map((collab) => (
            <li key={collab.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md border">
              <div>
                <p className="font-medium">{collab.email}</p>
                <span className="text-sm text-gray-500 capitalize">{collab.role}</span>
              </div>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={() => onRemove(collab.id)}
              >
                Retirer
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {/* Inviter un Nouveau Collaborateur */}
      <form onSubmit={handleInvite} className="space-y-3 p-4 border rounded-lg bg-indigo-50">
        <h3 className="text-lg font-semibold text-indigo-700">Inviter un Membre</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Input 
              type="email"
              placeholder="Email du collaborateur"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="viewer">Lecteur</option>
              <option value="engineer">Ingénieur</option>
              <option value="lead">Chef de Projet</option>
            </select>
          </div>
        </div>
        <Button type="submit" variant="primary">Envoyer l'Invitation</Button>
      </form>
    </div>
  );
};

TeamShare.propTypes = {
  collaborators: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
    })
  ).isRequired,
  onInvite: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default TeamShare;
