import React from 'react';
import { Settings, Sparkles, History } from 'lucide-react';

interface HeaderProps {
  onSettingsClick: () => void;
  onHistoryClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick, onHistoryClick }) => {
  return (
    <header className="header glass-panel">
      <div className="logo-container">
        <Sparkles className="logo-icon" size={28} />
        <span className="logo-text">Summz.AI</span>
      </div>
      <div className="header-actions" style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="settings-btn" onClick={onHistoryClick} aria-label="History">
          <History size={20} />
        </button>
        <button className="settings-btn" onClick={onSettingsClick} aria-label="Settings">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
