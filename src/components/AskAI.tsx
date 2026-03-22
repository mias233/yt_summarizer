import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface AskAIProps {
  videoId: string;
  apiKey: string;
}

const AskAI: React.FC<AskAIProps> = ({ videoId, apiKey }) => {
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([
    { role: 'ai', text: "Ask me anything about this video!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !apiKey) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ videoId, question: userMessage })
      });

      if (!response.ok) throw new Error('Failed to get answer');
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I couldn't process your question right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="ask-ai glass-panel fade-in">
      <div className="chat-header">
        <Bot size={20} className="bot-icon" />
        <h3>Ask AI</h3>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="avatar">
              {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className="bubble">{msg.text}</div>
          </div>
        ))}
        {isTyping && (
          <div className="message ai typing">
            <div className="avatar"><Bot size={16} /></div>
            <div className="bubble">
              <Loader2 size={16} className="spinner" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="input-field"
        />
        <button type="submit" className="send-btn" disabled={!input.trim() || isTyping}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default AskAI;
