import React from 'react';
import { PlayCircle, Clock } from 'lucide-react';

interface VideoPreviewProps {
  isLoading: boolean;
  data: any;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ isLoading, data }) => {
  if (isLoading) {
    return (
      <div className="video-preview glass-panel skeleton-container">
        <div className="skeleton-thumb"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-meta"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="video-preview glass-panel fade-in">
      <div className="thumbnail-wrapper">
        <img src={data.thumbnail} alt={data.title} className="thumbnail" />
        <div className="play-overlay">
          <PlayCircle size={48} className="play-icon" />
        </div>
        {data.duration && (
          <div className="duration-badge">
            <Clock size={12} className="clock-icon" />
            {data.duration}
          </div>
        )}
      </div>
      <div className="video-info">
        <h3 className="video-title">{data.title}</h3>
        <p className="video-author">{data.author}</p>
      </div>
    </div>
  );
};

export default VideoPreview;
