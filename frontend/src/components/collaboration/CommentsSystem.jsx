// frontend/src/components/collaboration/CommentsSystem.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';

const CommentsSystem = ({ comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      // Simuler l'ajout d'un commentaire par l'utilisateur actuel
      const commentData = {
        id: Date.now().toString(),
        user: "Utilisateur Actuel", // Remplacer par le nom de l'utilisateur réel
        timestamp: new Date().toISOString(),
        text: newComment.trim(),
      };
      onAddComment(commentData);
      setNewComment('');
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Système de Commentaires</h2>

      {/* Liste des Commentaires */}
      <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-gray-500">Aucun commentaire pour le moment.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-3 bg-gray-50 rounded-md border">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-semibold text-indigo-600">{comment.user}</span>
                <span className="text-gray-500">{new Date(comment.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-gray-700 text-sm">{comment.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Formulaire d'Ajout de Commentaire */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          rows="3"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ajouter un commentaire..."
          required
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm">
            Poster le Commentaire
          </Button>
        </div>
      </form>
    </div>
  );
};

CommentsSystem.propTypes = {
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      user: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })
  ).isRequired,
  onAddComment: PropTypes.func.isRequired,
};

export default CommentsSystem;
