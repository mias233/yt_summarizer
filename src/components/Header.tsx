import React from 'react';
import { Sparkles, History, LogOut } from 'lucide-react';
import { auth, signOut } from '../firebase';

interface HeaderProps {
  user: any;
  onHistoryClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onHistoryClick }) => {
  return (
    <header className="header glass-panel">
      <div className="logo-container">
        <Sparkles className="logo-icon" size={28} />
        <span className="logo-text">Summz.AI</span>
      </div>
      <div className="header-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginRight: '1rem', paddingRight: '1rem', borderRight: '1px solid var(--surface-border)' }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user.email?.[0].toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }} className="hide-on-mobile">{user.displayName || user.email}</span>
            <button className="settings-btn" onClick={() => signOut(auth)} title="Sign Out">
              <LogOut size={18} />
            </button>
          </div>
        )}
        <button className="settings-btn" onClick={onHistoryClick} aria-label="History">
          <History size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
