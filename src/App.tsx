import { useState, useEffect } from 'react';
import Header from './components/Header';
import VideoInput from './components/VideoInput';
import VideoPreview from './components/VideoPreview';
import SummaryTabs from './components/SummaryTabs';
import AskAI from './components/AskAI';
import HistorySidebar, { type HistoryItem } from './components/HistorySidebar';
import LoginScreen from './components/LoginScreen';
import { auth, onAuthStateChanged } from './firebase';

function App() {
  const [videoData, setVideoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('yt_summary_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSummarize = async (url: string) => {
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to process video';
        try {
          // Vercel might return HTML string or empty body on 500
          const textData = await response.text();
          if (textData) {
            const errData = JSON.parse(textData);
            errorMessage = errData.error || errorMessage;
          }
        } catch(e) {
          console.error("Failed to parse error response", e);
        }
        throw new Error(errorMessage);
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
  }

  if (authChecking) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="loader" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0, width: '100vw', maxWidth: '100%' }}>
        <LoginScreen onLoginSuccess={() => {}} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header 
        user={user}
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
                {videoData && <AskAI videoId={videoData.id} />}
              </div>
              <div className="right-panel">
                <SummaryTabs isLoading={isLoading} data={summaryData} transcript={videoData?.transcript} />
              </div>
            </div>
          </section>
        )}
      </main>

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
