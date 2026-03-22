import React from 'react';
import { Clock, Trash2, ArrowRight } from 'lucide-react';

export interface HistoryItem {
  id: string;
  url: string;
  video: any;
  summary: any;
  timestamp: number;
}

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, onClear, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="history-sidebar glass-panel slide-up">
      <div className="sidebar-header">
        <div className="flex-center">
          <Clock size={20} className="text-secondary" />
          <h3>Recent Summaries</h3>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="sidebar-content">
        {history.length === 0 ? (
          <div className="empty-history">
            <p>No recent summaries.</p>
          </div>
        ) : (
          <ul className="history-list">
            {history.map((item) => (
              <li key={item.id} className="history-item" onClick={() => onSelect(item)}>
                <img src={item.video.thumbnail} alt={item.video.title} className="history-thumb" />
                <div className="history-info">
                  <h4 title={item.video.title}>{item.video.title}</h4>
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <ArrowRight size={16} className="history-arrow" />
              </li>
            ))}
          </ul>
        )}
      </div>

      {history.length > 0 && (
        <div className="sidebar-footer">
          <button className="btn btn-secondary clear-btn" onClick={onClear}>
            <Trash2 size={16} />
            Clear History
          </button>
        </div>
      )}
    </div>
  );
};

export default HistorySidebar;
