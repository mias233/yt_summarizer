import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface VideoInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const VideoInput: React.FC<VideoInputProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form className="video-form" onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <Search className="search-icon" size={20} />
        <input 
          type="url" 
          className="input-field yt-input" 
          placeholder="Paste YouTube Video URL here..." 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button 
          type="submit" 
          className="btn btn-primary submit-btn"
          disabled={isLoading || !url.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="spinner" size={18} />
              Processing...
            </>
          ) : (
            'Summarize'
          )}
        </button>
      </div>
    </form>
  );
};

export default VideoInput;
