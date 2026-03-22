import React, { useState } from 'react';
import { Key, X } from 'lucide-react';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
  onClose: () => void;
  hasKey: boolean;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, onClose, hasKey }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  return (
    <div className="modal-overlay fade-in">
      <div className="modal-content glass-panel slide-up">
        {hasKey && (
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        )}
        
        <div className="modal-header">
          <div className="icon-wrapper">
            <Key size={24} className="text-primary" />
          </div>
          <h2>Gemini API Key Required</h2>
          <p>We need your free Gemini API key from Google AI Studio to generate summaries and insights. Your key is stored securely in your browser's local storage and is never saved on our servers.</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <input
            type="password"
            className="input-field"
            placeholder="sk-..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
            autoComplete="off"
          />
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={!key.trim()}>
              Save Key & Continue
            </button>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => onSave('DEMO')}>
              Use Demo Mode
            </button>
          </div>
        </form>
        
        <div className="modal-footer">
          Don't have one? Get a free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
