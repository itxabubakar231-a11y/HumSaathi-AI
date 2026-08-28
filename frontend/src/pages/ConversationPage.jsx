import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';

export default function ConversationPage() {
  const { sessionId } = useParams();
  const { user } = useUser();
  const { t, language } = useI18n();
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
          if (session.mode === 'voice' && session.transcript?.length > 0) {
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
      window.speechSynthesis?.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [sessionId, user, navigate, t]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const speakText = (text, lang) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    if (!speechSupported) return;

    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === 'ur') {
      utterance.lang = 'ur-PK';
    } else {
      utterance.lang = 'en-US';
    }
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!speechSupported || !recognitionRef.current) return;
    setSpeechError('');
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn('Failed to start speech recognition:', e);
    }
  };

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

    const newUserMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const res = await api.sendMessage(sessionId, {
        userId: user.id,
        message: text
      });

      if (res && res.session) {
        setMessages(res.session.transcript || []);
        
        if (mode === 'voice' && res.response) {
          speakText(res.response, res.session.language);
        }

        if (res.completed) {
          setTimeout(() => {
            navigate(`/feedback/${sessionId}`);
          }, 1500);
        }
      }
    } catch (err) {
      setError(err.message || t('common.error'));
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
    <div className="web-practice-workspace">
      {/* Left Sidebar: Scenario Information & Goals */}
      <aside className="practice-info-sidebar">
        <div className="practice-info-header">
          <span className="practice-badge-kicker">
            🎯 {language === 'ur' ? 'بات چیت کا منظرنامہ' : 'Interactive Practice'}
          </span>
          <h2 className="practice-scenario-title">{session?.scenario?.title}</h2>
          <p className="practice-scenario-desc">{session?.scenario?.description}</p>
        </div>

        <div className="practice-meta-card">
          <div className="meta-row">
            <span className="meta-label">🤖 {language === 'ur' ? 'کردار:' : 'AI Role:'}</span>
            <strong className="meta-val">{session?.scenario?.aiRole}</strong>
          </div>
          <div className="meta-row">
            <span className="meta-label">🌐 {language === 'ur' ? 'زبان:' : 'Language:'}</span>
            <strong className="meta-val">{session?.language?.toUpperCase()}</strong>
          </div>
          <div className="meta-row">
            <span className="meta-label">⚡ {language === 'ur' ? 'لیول:' : 'Difficulty:'}</span>
            <strong className="meta-val" style={{ textTransform: 'capitalize' }}>
              {session?.scenario?.difficulty || 'Intermediate'}
            </strong>
          </div>
        </div>

        <div className="practice-tips-card">
          <h4>💡 {language === 'ur' ? 'رہنمائی اور نکات:' : 'Communication Pro-Tips:'}</h4>
          <ul>
            <li>{language === 'ur' ? 'پراعتماد انداز میں اپنا مدعا بیان کریں۔' : 'Take turns and answer naturally.'}</li>
            <li>{language === 'ur' ? 'ضرورت پڑنے پر وضاحت طلب کریں۔' : 'Ask questions for clarification when needed.'}</li>
            <li>{language === 'ur' ? 'شائستہ اختتامی کلمات استعمال کریں۔' : 'End conversations with polite remarks.'}</li>
          </ul>
        </div>

        <div className="practice-sidebar-actions">
          <button className="btn-secondary end-session-btn" onClick={handleFinish}>
            🏁 {t('conversation.endBtn') || 'Finish & View Feedback'}
          </button>
        </div>
      </aside>

      {/* Right Column: Interactive Chat Conversation Room */}
      <section className="practice-chat-container">
        {/* Top Chat Bar with Mode Switcher */}
        <div className="chat-top-header">
          <div className="chat-partner-status">
            <span className="online-indicator-dot" />
            <div>
              <span className="partner-name">{session?.scenario?.aiRole} (AI Coach)</span>
              <span className="partner-sub">
                {language === 'ur' ? 'محفوظ مشق جاری ہے' : 'Safe simulation active'}
              </span>
            </div>
          </div>

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
        </div>

        {/* Chat Feed */}
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-bubble-row ${msg.role === 'user' ? 'user-row' : 'ai-row'}`}
            >
              {msg.role !== 'user' && (
                <div className="bubble-avatar-ai">🤖</div>
              )}
              <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="bubble-avatar-user">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
              )}
            </div>
          ))}

          {sending && (
            <div className="chat-bubble-row ai-row">
              <div className="bubble-avatar-ai">🤖</div>
              <div className="typing-indicator" aria-label="AI is typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && <p className="error-text" style={{ padding: '0 1.5rem', fontSize: '0.85rem' }}>{error}</p>}

        {/* Floating Input Area */}
        {mode === 'voice' ? (
          <div className="chat-input-area voice-input-area">
            {speechSupported ? (
              <>
                {transcriptPreview && (
                  <div className="voice-preview-text">
                    "{transcriptPreview}"
                  </div>
                )}
                {speechError && <p className="error-text" style={{ fontSize: '0.8rem' }}>{speechError}</p>}
                
                <div className="voice-controls-row">
                  <button
                    className={`voice-btn-large ${isListening ? 'is-listening' : ''}`}
                    onClick={isListening ? stopListening : startListening}
                  >
                    {isListening ? (
                      <>🔴 {t('conversation.listening') || 'Listening... (Tap to Send)'}</>
                    ) : (
                      <>🎙️ {language === 'ur' ? 'بولنے کے لیے کلک کریں' : 'Tap to Speak'}</>
                    )}
                  </button>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => setMode('text')}
                  >
                    💬 {language === 'ur' ? 'ٹیکسٹ پر جائیں' : 'Switch to Text'}
                  </button>
                </div>
              </>
            ) : (
              <div className="mic-unsupported-box">
                <p>{t('conversation.micError') || 'Microphone not supported in this browser. Please use text mode.'}</p>
                <button className="btn-secondary" onClick={() => setMode('text')}>
                  Switch to Text Mode
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSendClick} className="chat-input-area text-input-area">
            <input
              className="chat-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={language === 'ur' ? 'اپنا جواب یہاں لکھیں...' : t('conversation.placeholder')}
              disabled={sending}
            />
            <button
              className="chat-send-btn"
              type="submit"
              disabled={sending || !inputText.trim()}
              title="Send Message"
            >
              ➔
            </button>
            {speechSupported && (
              <button
                className="voice-quick-btn"
                type="button"
                onClick={() => setMode('voice')}
                title="Switch to Voice Mode"
              >
                🎙️
              </button>
            )}
          </form>
        )}
      </section>
    </div>
  );
}
