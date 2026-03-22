import React, { useState } from 'react';
import { FileText, AlignLeft, List, Target, FileAudio, Copy, CheckCircle2 } from 'lucide-react';

interface SummaryTabsProps {
  isLoading: boolean;
  data: any;
  transcript: string;
}

const SummaryTabs: React.FC<SummaryTabsProps> = ({ isLoading, data, transcript }) => {
  const [activeTab, setActiveTab] = useState('short');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'short', label: 'Short', icon: <FileText size={16} /> },
    { id: 'detailed', label: 'Detailed', icon: <AlignLeft size={16} /> },
    { id: 'keyPoints', label: 'Key Points', icon: <List size={16} /> },
    { id: 'insights', label: 'Insights', icon: <Target size={16} /> },
    { id: 'transcript', label: 'Transcript', icon: <FileAudio size={16} /> },
    { id: 'twitter', label: 'Twitter Thread', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 3.541H5.078z"/></svg> }
  ];

  const handleCopy = () => {
    let textToCopy = '';
    if (activeTab === 'transcript') textToCopy = transcript;
    else if (data && data[activeTab]) {
      if (Array.isArray(data[activeTab])) {
        textToCopy = data[activeTab].join('\n- ');
        textToCopy = `- ${textToCopy}`;
      } else {
        textToCopy = data[activeTab];
      }
    }
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [twitterThread, setTwitterThread] = useState<string[] | null>(null);
  const [isGeneratingTwitter, setIsGeneratingTwitter] = useState(false);

  const fetchTwitterThread = async () => {
    if (!data?.id) return;
    
    setIsGeneratingTwitter(true);
    try {
      const apiKey = localStorage.getItem('gemini_key');
      const response = await fetch('/api/twitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ videoId: data.id })
      });

      if (!response.ok) throw new Error('Failed to generate thread');
      
      const result = await response.json();
      setTwitterThread(result.thread);
    } catch (err) {
      console.error(err);
      setTwitterThread(["Failed to generate Twitter thread. Please try again later."]);
    } finally {
      setIsGeneratingTwitter(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="skeleton-lines">
          <div className="skeleton-line" style={{ width: '100%' }}></div>
          <div className="skeleton-line" style={{ width: '90%' }}></div>
          <div className="skeleton-line" style={{ width: '95%' }}></div>
          <div className="skeleton-line" style={{ width: '80%' }}></div>
          <div className="skeleton-line" style={{ width: '85%' }}></div>
        </div>
      );
    }

    if (activeTab === 'transcript') {
      return <div className="content-text transcript-text">{transcript || 'No transcript available.'}</div>;
    }

    if (activeTab === 'twitter') {
      if (isGeneratingTwitter) {
        return (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.7)' }}>
            <div className="loader" style={{ margin: '0 auto 1rem auto' }}></div>
            Generating viral thread...
          </div>
        );
      }
      
      if (!twitterThread) {
        return (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ marginBottom: '1.5rem', color: 'rgba(255,255,255,0.8)' }}>
              Ready to share this knowledge? Generate a viral 5-tweet thread from this video!
            </p>
            <button className="btn btn-primary" onClick={fetchTwitterThread}>
              Generate Twitter Thread 🐦
            </button>
          </div>
        );
      }

      return (
        <div className="twitter-thread">
          {twitterThread.map((tweet, idx) => (
            <div key={idx} style={{ 
              background: 'rgba(255,255,255,0.03)', 
              padding: '1.2rem', 
              borderRadius: '12px', 
              marginBottom: '1rem',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {idx + 1}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>{idx + 1}/{twitterThread.length}</span>
              </div>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{tweet}</p>
            </div>
          ))}
        </div>
      );
    }

    if (!data) return null;

    const content = data[activeTab];
    if (Array.isArray(content)) {
      return (
        <ul className="content-list">
          {content.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
    }

    return <div className="content-text">{content || 'Content not available.'}</div>;
  };

  return (
    <div className="summary-tabs glass-panel fade-in">
      <div className="tabs-header">
        <div className="tabs-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="copy-btn" 
            onClick={() => window.print()}
            disabled={isLoading || (!data && !transcript)}
            title="Download as PDF"
            aria-label="Download as PDF"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          </button>
          <button 
            className="copy-btn" 
            onClick={handleCopy}
            disabled={isLoading || (!data && !transcript)}
            title="Copy to clipboard"
            aria-label="Copy to clipboard"
          >
            {copied ? <CheckCircle2 size={18} className="text-green" /> : <Copy size={18} />}
          </button>
        </div>
      </div>
      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default SummaryTabs;
