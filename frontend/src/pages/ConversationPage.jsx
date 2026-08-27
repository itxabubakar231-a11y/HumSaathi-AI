import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';

export default function ConversationPage() {
  const { sessionId } = useParams();
  const { user } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('text'); // text or voice

  // Voice mode state
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState('');

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!user?.id) {
      navigate('/setup');
      return;
    }
    // Fetch session directly by ID
    api.getSession(sessionId)
      .then(({ session }) => {
        if (!session) {
          setError('Session not found');
        } else {
          setSession(session);
          setMessages(session.transcript || []);
          setMode(session.mode || 'text');
          
          // Text to Speech initial greeting if voice mode
          if (session.mode === 'voice' && session.transcript.length > 0) {
            speakText(session.transcript[0].content, session.language);
          }
        }
      })
      .catch((err) => {
        setError(err.message || t('common.error'));
      })
      .finally(() => {
        setLoading(false);
      });

    // Check speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = user.language === 'ur' ? 'ur-PK' : 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setSpeechError('');
        setTranscriptPreview('');
      };

      rec.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscriptPreview(transcript);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setSpeechError(`${t('conversation.micError')} (${event.error})`);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      // Cleanup speaking and listening on unmount
      window.speechSynthesis?.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [sessionId, user, navigate, t]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Text-to-speech speaker
  const speakText = (text, lang) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    
    const u = speechSupported;
    if (!u) return;

    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === 'ur') {
      utterance.lang = 'ur-PK';
    } else {
      utterance.lang = 'en-US';
    }
    window.speechSynthesis.speak(utterance);
  };

  // Start speech recognition
  const startListening = () => {
    if (!speechSupported || !recognitionRef.current) return;
    setSpeechError('');
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn('Failed to start speech recognition:', e);
    }
  };

  // Stop speech recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      if (transcriptPreview.trim()) {
        handleSendMessage(transcriptPreview);
      }
    }
  };

  const handleSendClick = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleSendMessage(inputText);
    setInputText('');
  };

  const handleSendMessage = async (text) => {
    if (sending || !text.trim()) return;
    setSending(true);
    setError('');

    // Optimistically update UI
    const newUserMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const res = await api.sendMessage(sessionId, {
        userId: user.id,
        message: text
      });

      if (res && res.session) {
        setMessages(res.session.transcript || []);
        
        // Speak AI's response if voice mode
        if (mode === 'voice' && res.response) {
          speakText(res.response, res.session.language);
        }

        if (res.completed) {
          // Completed conversation session
          setTimeout(() => {
            navigate(`/feedback/${sessionId}`);
          }, 1500);
        }
      }
    } catch (err) {
      setError(err.message || t('common.error'));
      // Remove optimistic message if error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await api.endConversation(sessionId);
      navigate(`/feedback/${sessionId}`);
    } catch (err) {
      setError(err.message || t('common.error'));
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="error-card">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="conversation-container">
      {/* Header */}
      <div className="conversation-header">
        <div className="conversation-title-area">
          <h2>{session?.scenario?.title}</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Role: <strong>{session?.scenario?.aiRole}</strong> ({session?.language?.toUpperCase()})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {/* Mode Switcher */}
          <div className="mode-toggle-group">
            <button
              type="button"
              className={`mode-toggle-btn ${mode === 'text' ? 'is-active' : ''}`}
              onClick={() => setMode('text')}
            >
              💬 Text
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${mode === 'voice' ? 'is-active' : ''}`}
              onClick={() => setMode('voice')}
            >
              🎙️ Voice
            </button>
          </div>

          <button className="text-btn" style={{ color: 'var(--accent-highlight)', fontWeight: '600' }} onClick={handleFinish}>
            {t('conversation.endBtn')} ➔
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}
          >
            {msg.content}
          </div>
        ))}

        {sending && (
          <div className="typing-indicator" aria-label="AI is typing">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && <p className="error-text" style={{ fontSize: '0.85rem' }}>{error}</p>}

      {/* Control / Input Bar */}
      {mode === 'voice' ? (
        <div className="chat-input-area" style={{ flexDirection: 'column', alignItems: 'center', gap: 'var(--space-xs)' }}>
          {speechSupported ? (
            <>
              {transcriptPreview && (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', width: '100%' }}>
                  "{transcriptPreview}"
                </div>
              )}
              {speechError && <p className="error-text" style={{ fontSize: '0.8rem' }}>{speechError}</p>}
              
              <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                <button
                  className={`voice-btn ${isListening ? 'is-listening' : ''}`}
                  style={{ width: 'auto', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)' }}
                  onClick={isListening ? stopListening : startListening}
                >
                  {isListening ? t('conversation.listening') : '🎙️ Tap to Speak'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setMode('text')}
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  Switch to Text
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <p>{t('conversation.micError')}</p>
              <button className="btn-secondary" onClick={() => setMode('text')} style={{ marginTop: 'var(--space-xs)' }}>
                Switch to Text Mode
              </button>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSendClick} className="chat-input-area">
          <input
            className="chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('conversation.placeholder')}
            disabled={sending}
          />
          <button className="chat-send-btn" type="submit" disabled={sending || !inputText.trim()} title="Send">
            ➔
          </button>
          {speechSupported && (
            <button
              className="voice-btn"
              type="button"
              onClick={() => setMode('voice')}
              title="Switch to Voice Mode"
            >
              🎙️
            </button>
          )}
        </form>
      )}
    </div>
  );
}
