import { useState } from 'react';
import Header from './components/Header';
import VideoInput from './components/VideoInput';
import VideoPreview from './components/VideoPreview';
import SummaryTabs from './components/SummaryTabs';
import AskAI from './components/AskAI';
import ApiKeyModal from './components/ApiKeyModal';
import HistorySidebar, { type HistoryItem } from './components/HistorySidebar';

function App() {
  const [videoData, setVideoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_key') || '');
  const [showApiModal, setShowApiModal] = useState(!localStorage.getItem('gemini_key'));
  const [summaryData, setSummaryData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('yt_summary_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);

  const handleSummarize = async (url: string) => {
    if (!apiKey) {
      setShowApiModal(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setVideoData(null);
    setSummaryData(null);

    try {
      // In a real app, this would call our Express backend.
      // We will proxy the request via our Node.js server in dev, and Vercel will handle it in prod.
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to process video');
      }

      const data = await response.json();
      setVideoData(data.video);
      setSummaryData(data.summary);
      
      const newItem: HistoryItem = {
        id: data.video.id + '-' + Date.now(),
        url,
        video: data.video,
        summary: data.summary,
        timestamp: Date.now()
      };
      
      setHistory(prev => {
        const updated = [newItem, ...prev].slice(0, 20); // Keep last 20
        localStorage.setItem('yt_summary_history', JSON.stringify(updated));
        return updated;
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_key', key);
    setShowApiModal(false);
  };

  return (
    <div className="app-container">
      <Header 
        onSettingsClick={() => setShowApiModal(true)} 
        onHistoryClick={() => setShowHistory(true)} 
      />
      
      <main className="main-content">
        <section className="hero-section">
          <h1 className="slide-up">Summarize Any Video in Seconds ⚡</h1>
          <p className="subtitle slide-up" style={{ animationDelay: '0.1s' }}>
            Powered by AI. Get instant transcripts, key insights, and ask questions.
          </p>
          
          <div className="input-container slide-up" style={{ animationDelay: '0.2s' }}>
            <VideoInput onSubmit={handleSummarize} isLoading={isLoading} />
            {error && <div className="error-message">{error}</div>}
          </div>
        </section>

        {(isLoading || videoData) && (
          <section className="results-section fade-in">
            <div className="grid-layout">
              <div className="left-panel">
                <VideoPreview isLoading={isLoading} data={videoData} />
                {videoData && <AskAI videoId={videoData.id} apiKey={apiKey} />}
              </div>
              <div className="right-panel">
                <SummaryTabs isLoading={isLoading} data={summaryData} transcript={videoData?.transcript} />
              </div>
            </div>
          </section>
        )}
      </main>

      {showApiModal && (
        <ApiKeyModal 
          onSave={handleSaveKey} 
          onClose={() => apiKey ? setShowApiModal(false) : null} 
          hasKey={!!apiKey} 
        />
      )}

      <HistorySidebar 
        history={history} 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        onSelect={(item) => {
          setVideoData(item.video);
          setSummaryData(item.summary);
          setShowHistory(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
        onClear={() => {
          setHistory([]);
          localStorage.removeItem('yt_summary_history');
        }} 
      />
    </div>
  );
}

export default App;
