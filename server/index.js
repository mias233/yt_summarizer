import express from 'express';
import cors from 'cors';
import { YoutubeTranscript } from 'youtube-transcript/dist/youtube-transcript.esm.js';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// Helper to extract YouTube video ID
function extractVideoId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : false;
}

// Store basic transcript cache in memory for Q&A
const cache = new Map();

// Generate Summaries Endpoint
app.post('/api/summarize', async (req, res) => {
  try {
    const { url } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Gemini API key missing' });
    }
    
    const apiKey = authHeader.split(' ')[1];
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    if (apiKey === 'DEMO') {
      const demoTranscript = "Welcome to our channel. Today we're learning about artificial intelligence and how large language models are transforming the way we process information. It's truly fascinating. Thanks for watching!";
      cache.set(videoId, demoTranscript);
      return res.json({
        video: {
          id: videoId,
          title: "Demo Video (Mocked)",
          author: "Demo Creator",
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          duration: "1:23",
          transcript: demoTranscript
        },
        summary: {
          short: "This is a brief demo summary of the video.",
          detailed: "This video discusses how artificial intelligence and large language models are transforming information processing. It is a short, fascinating introduction to the topic.",
          keyPoints: ["AI is transforming info processing", "Large language models are key", "It is a fascinating topic"],
          insights: ["The future holds endless possibilities with AI.", "Information processing will never be the same."]
        }
      });
    }

    // Attempt to fetch transcript
    let transcriptItems;
    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (e) {
      return res.status(400).json({ error: 'Could not fetch transcript for this video. Make sure subtitles are enabled or not auto-generated only.' });
    }

    const fullTranscript = transcriptItems.map(item => item.text).join(' ');
    const truncatedTranscript = fullTranscript.length > 20000 ? fullTranscript.substring(0, 20000) + '...' : fullTranscript;

    cache.set(videoId, truncatedTranscript);

    // Prompt Gemini
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are an expert AI summarizer. I am giving you a transcript of a YouTube video. 
      Analyze it and return a JSON object with strictly these keys:
      - "short": A 1-2 sentence ultra-short summary.
      - "detailed": A 1-2 paragraph detailed summary.
      - "keyPoints": An array of strings containing 3-5 key points.
      - "insights": An array of strings containing 2-3 deep insights or takeaways.
      
      Transcript:
      ${truncatedTranscript}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful assistant that summarizes videos and always responds strictly in JSON.",
        responseMimeType: "application/json"
      }
    });

    const parsedSummary = JSON.parse(response.text);

    // Fetch video details via oEmbed
    let title = "YouTube Video";
    let author = "Unknown Artist";
    let thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        title = oembedData.title || title;
        author = oembedData.author_name || author;
        thumbnail = oembedData.thumbnail_url || thumbnail;
      }
    } catch (e) {
      // Ignore oembed fail
    }

    res.json({
      video: {
        id: videoId,
        title,
        author,
        thumbnail,
        duration: null, // oEmbed doesn't return duration, leaving null for simplicity
        transcript: fullTranscript
      },
      summary: parsedSummary
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Q&A Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { videoId, question } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Gemini API key missing' });
    }
    
    const apiKey = authHeader.split(' ')[1];
    const transcript = cache.get(videoId);

    if (!transcript) {
       return res.status(404).json({ error: 'Transcript context not found. Summarize the video again.' });
    }

    if (apiKey === 'DEMO') {
      return res.json({ answer: "This is a simulated response in Demo Mode. In the real app, I would tell you that the video discusses how artificial intelligence and large language models are transforming information processing!"});
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
      config: {
        systemInstruction: `You are answering questions about a video based on this transcript:\n${transcript}\n\nKeep answers concise and conversational.`
      }
    });

    res.json({ answer: response.text });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate answer' });
  }
});

// Twitter Thread Endpoint
app.post('/api/twitter', async (req, res) => {
  try {
    const { videoId } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Gemini API key missing' });
    }
    
    const apiKey = authHeader.split(' ')[1];
    const transcript = cache.get(videoId);

    if (!transcript) {
       return res.status(404).json({ error: 'Transcript context not found. Summarize the video again.' });
    }

    if (apiKey === 'DEMO') {
      return res.json({ thread: [
        "🤖 **AI is changing everything.**\n\nWe just watched a fascinating breakdown of how large language models are transforming information processing. Here’s why it matters. 🧵👇",
        "💡 **The Processing Shift**\n\nTraditional search is dead. LLMs allow us to synthesize hundreds of pages of information into concise insights in seconds.",
        "🚀 **Endless Possibilities**\n\nFrom automated research to instant video summaries, the barrier to acquiring knowledge has never been lower.",
        "⚠️ **The Catch?**\n\nThe real skill is no longer *finding* information, but knowing how to *ask the right questions*.",
        "What are your thoughts on this AI shift? Let me know below! 👇 #AI #Tech #FutureOfWork"
      ]});
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are an expert social media ghostwriter. Turn the following YouTube transcript into a viral Twitter/X thread.
      Format it as a JSON array of strings, where each string represents a single tweet in the thread.
      Use emojis appropriately. Keep each tweet engaging and under 280 characters.
      
      Transcript:
      ${transcript}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a master social media manager. Always respond strictly in JSON format as an array of strings.",
        responseMimeType: "application/json"
      }
    });

    const parsedThread = JSON.parse(response.text);
    res.json({ thread: parsedThread });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate Twitter thread' });
  }
});

// Only listen on a port if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
