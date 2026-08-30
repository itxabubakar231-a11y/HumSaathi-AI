import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';

function getLocalizedText(val, lang, fallback = '') {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val[lang] || val.en || val.ur || val.ur_rm || fallback;
  }
  return String(val);
}

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
  const [speakingIdx, setSpeakingIdx] = useState(null);

  // Voice recording & preview states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedTranscript, setRecordedTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  const isRtl = language === 'ur';

  // Auto-scroll helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const speakText = useCallback((text, lang, idx = null) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === 'ur') {
      utterance.lang = 'ur-PK';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onstart = () => {
      if (idx !== null) setSpeakingIdx(idx);
    };

    utterance.onend = () => {
      setSpeakingIdx(null);
    };

    utterance.onerror = () => {
      setSpeakingIdx(null);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
    }
  };

  // Fetch session details
  const fetchSession = useCallback(() => {
    setLoading(true);
    setError('');
    api.getSession(sessionId)
      .then((data) => {
        const sess = data?.session || (data?.id ? data : null);
        if (!sess) {
          setError(t('common.error') || 'Session not found');
        } else {
          setSession(sess);
          const transcriptList = Array.isArray(sess.transcript) ? sess.transcript : [];
          setMessages(transcriptList);
          setMode(sess.mode || 'text');

          if (sess.mode === 'voice' && transcriptList.length > 0) {
            speakText(transcriptList[0].content, sess.language || language, 0);
          }
        }
      })
      .catch((err) => {
        setError(err.message || t('common.error'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionId, language, speakText, t]);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    fetchSession();

    // Check speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = language === 'ur' ? 'ur-PK' : 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
        setSpeechError('');
      };

      rec.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) {
          setRecordedTranscript((prev) => (prev ? `${prev} ${final}` : final));
        }
        setInterimTranscript(interim);
      };

      rec.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error !== 'no-speech') {
          setSpeechError(`${t('voice.micError')} (${event.error})`);
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      window.speechSynthesis?.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
    };
  }, [sessionId, user, navigate, language, fetchSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Voice recording handlers
  const startRecording = async () => {
    setSpeechError('');
    setRecordedTranscript('');
    setInterimTranscript('');
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
      setAudioPreviewUrl(null);
    }
    audioChunksRef.current = [];

    // Start Audio recording via MediaRecorder if supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            setAudioPreviewUrl(url);
          }
          // Stop stream tracks
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
      } catch (err) {
        console.warn('MediaRecorder error or mic denied:', err);
      }
    }

    // Start speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Speech recognition restart notice:', e);
      }
    }
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
  };

  const deleteRecording = () => {
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
      setAudioPreviewUrl(null);
    }
    audioChunksRef.current = [];
    setRecordedTranscript('');
    setInterimTranscript('');
    setSpeechError('');
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    }
  };

  const togglePlayAudio = () => {
    if (!audioPreviewUrl) return;
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioPreviewUrl);
      audioPlayerRef.current.onended = () => setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.src = audioPreviewUrl;
    }

    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleSendMessage = async (text) => {
    const trimmed = (text || '').trim();
    if (sending || !trimmed) return;
    setSending(true);
    setError('');

    const newUserMessage = { role: 'user', content: trimmed, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, newUserMessage]);
    deleteRecording();

    try {
      const res = await api.sendMessage(sessionId, {
        userId: user.id,
        message: trimmed,
      });

      if (res && res.session) {
        const updatedTranscript = res.session.transcript || [];
        setMessages(updatedTranscript);

        if (res.response) {
          speakText(res.response, res.session.language || language, updatedTranscript.length - 1);
        }

        if (res.completed) {
          setTimeout(() => {
            navigate(`/feedback/${sessionId}`);
          }, 1800);
        }
      }
    } catch (err) {
      setError(err.message || t('common.error'));
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
      setInputText('');
    }
  };

  const handleSendClick = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleSendMessage(inputText);
  };

  const handleFinish = async () => {
    setSending(true);
    try {
      await api.endConversation(sessionId);
      navigate(`/feedback/${sessionId}`);
    } catch (err) {
      navigate(`/feedback/${sessionId}`);
    }
  };

  const getRoleLabel = (roleStr) => {
    if (!roleStr) return t('conversation.aiCoach');
    const key = `role.${String(roleStr).toLowerCase().replace(/\s+/g, '_')}`;
    const translated = t(key);
    if (translated && translated !== key) return translated;
    return getLocalizedText(roleStr, language, roleStr);
  };

  const getDifficultyLabel = (diff) => {
    const key = `scenarios.${String(diff).toLowerCase()}`;
    const translated = t(key);
    if (translated && translated !== key) return translated;
    return diff || 'Easy';
  };

  const scenarioData = session?.scenario || {};
  const scenarioTitle = getLocalizedText(scenarioData.title, language, t('scenarios.title'));
  const scenarioDesc = getLocalizedText(scenarioData.description, language, t('scenarios.intro'));
  const scenarioRole = getRoleLabel(scenarioData.aiRole);
  const scenarioOptions = Array.isArray(scenarioData.options) ? scenarioData.options : [];

  if (loading) {
    return (
      <div className="loading-screen" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="loading-spinner" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="error-card" dir={isRtl ? 'rtl' : 'ltr'} style={{ maxWidth: '600px', margin: 'var(--space-xl) auto', padding: 'var(--space-lg)' }}>
        <p className="error-text">{error}</p>
        <button className="btn-primary" onClick={() => navigate('/scenarios')} style={{ marginTop: 'var(--space-md)' }}>
          ← {t('conversation.backToScenarios')}
        </button>
      </div>
    );
  }

  return (
    <div className="web-practice-workspace" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Left Sidebar: Scenario Information & Goals */}
      <aside className="practice-info-sidebar">
        <div className="practice-info-header">
          <span className="practice-badge-kicker">
            🎯 {t('conversation.interactivePractice')}
          </span>
          <h2 className="practice-scenario-title">{scenarioTitle}</h2>
          <p className="practice-scenario-desc">{scenarioDesc}</p>
        </div>

        <div className="practice-meta-card">
          <div className="meta-row">
            <span className="meta-label">🤖 {t('conversation.aiRole')}</span>
            <strong className="meta-val">{scenarioRole}</strong>
          </div>
          <div className="meta-row">
            <span className="meta-label">🌐 {t('conversation.language')}</span>
            <strong className="meta-val">
              {language === 'ur' ? 'اردو (Urdu)' : language === 'ur_rm' ? 'Roman Urdu' : 'English'}
            </strong>
          </div>
          <div className="meta-row">
            <span className="meta-label">⚡ {t('conversation.difficulty')}</span>
            <strong className="meta-val" style={{ textTransform: 'capitalize' }}>
              {getDifficultyLabel(scenarioData.difficulty)}
            </strong>
          </div>
        </div>

        <div className="practice-tips-card">
          <h4>💡 {t('conversation.tipsTitle')}</h4>
          <ul>
            <li>{t('conversation.tip1')}</li>
            <li>{t('conversation.tip2')}</li>
            <li>{t('conversation.tip3')}</li>
          </ul>
        </div>

        <div className="practice-sidebar-actions">
          <button className="btn-secondary end-session-btn" onClick={handleFinish}>
            🏁 {t('conversation.endBtn')}
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
              <span className="partner-name">{scenarioRole} ({t('conversation.aiCoach')})</span>
              <span className="partner-sub">{t('conversation.safeSimulation')}</span>
            </div>
          </div>

          <div className="mode-toggle-group">
            <button
              type="button"
              className={`mode-toggle-btn ${mode === 'text' ? 'is-active' : ''}`}
              onClick={() => {
                setMode('text');
                stopSpeaking();
              }}
            >
              💬 {t('conversation.modeText')}
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${mode === 'voice' ? 'is-active' : ''}`}
              onClick={() => setMode('voice')}
            >
              🎙️ {t('conversation.modeVoice')}
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
              <div className="bubble-content-wrap">
                <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                  {msg.content}
                </div>
                {msg.role !== 'user' && (
                  <button
                    type="button"
                    className={`btn-replay-audio ${speakingIdx === idx ? 'is-speaking' : ''}`}
                    onClick={() => {
                      if (speakingIdx === idx) {
                        stopSpeaking();
                      } else {
                        speakText(msg.content, session?.language || language, idx);
                      }
                    }}
                    title="Play voice audio"
                    aria-label="Listen to message audio"
                  >
                    {speakingIdx === idx ? `⏹️ ${t('conversation.stop')}` : `🔊 ${t('conversation.listen')}`}
                  </button>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="bubble-avatar-user">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
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

        {/* Quick Suggested Response Option Chips (4 structured options) */}
        {scenarioOptions.length > 0 && !sending && (
          <div
            className="suggested-options-container"
            style={{
              padding: '0.6rem 1.25rem',
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: '0.4rem',
              }}
            >
              💡 {t('conversation.suggestedOptions')}
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '0.4rem',
              }}
            >
              {scenarioOptions.slice(0, 4).map((opt, i) => {
                const optText = getLocalizedText(opt.text, language, opt.text);
                return (
                  <button
                    key={opt.id || i}
                    type="button"
                    className="suggested-option-chip"
                    style={{
                      textAlign: isRtl ? 'right' : 'left',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      lineHeight: '1.35',
                    }}
                    onClick={() => handleSendMessage(optText)}
                    disabled={sending}
                  >
                    💬 {optText}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Floating Input Area */}
        {mode === 'voice' ? (
          <div className="chat-input-area voice-input-area" style={{ padding: '1rem 1.25rem' }}>
            {speechSupported ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Status & Live transcript preview */}
                {(isRecording || recordedTranscript || interimTranscript) && (
                  <div
                    className="voice-preview-box"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.95rem',
                      fontStyle: 'italic',
                      color: 'var(--text-primary)',
                      lineHeight: '1.4',
                    }}
                  >
                    {recordedTranscript || interimTranscript ? (
                      <span>"{recordedTranscript} {interimTranscript}"</span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>
                        🎙️ {t('voice.recording')}
                      </span>
                    )}
                  </div>
                )}

                {speechError && <p className="error-text" style={{ fontSize: '0.85rem', margin: 0 }}>{speechError}</p>}

                {/* Primary Voice Controls */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {!isRecording && !recordedTranscript && (
                    <button
                      className="btn-primary"
                      type="button"
                      style={{ padding: '0.65rem 1.25rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      onClick={startRecording}
                      disabled={sending}
                    >
                      🎙️ {t('voice.tapToSpeak')}
                    </button>
                  )}

                  {isRecording && (
                    <button
                      className="btn-primary"
                      type="button"
                      style={{
                        padding: '0.65rem 1.25rem',
                        fontSize: '0.95rem',
                        background: '#e53e3e',
                        borderColor: '#e53e3e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                      onClick={stopRecording}
                    >
                      ⏹️ {t('conversation.stop')}
                    </button>
                  )}

                  {!isRecording && recordedTranscript && (
                    <>
                      {audioPreviewUrl && (
                        <button
                          className="btn-secondary"
                          type="button"
                          style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}
                          onClick={togglePlayAudio}
                        >
                          {isPlayingAudio ? '⏸️ Stop' : `▶️ ${t('voice.playPreview')}`}
                        </button>
                      )}
                      <button
                        className="btn-secondary"
                        type="button"
                        style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', color: '#e53e3e' }}
                        onClick={deleteRecording}
                      >
                        🗑️ {t('voice.deleteRecording')}
                      </button>
                      <button
                        className="btn-primary"
                        type="button"
                        style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
                        onClick={() => handleSendMessage(recordedTranscript)}
                        disabled={sending}
                      >
                        🚀 {sending ? t('conversation.sending') : t('voice.sendVoiceMessage')}
                      </button>
                    </>
                  )}

                  <button
                    className="btn-secondary"
                    type="button"
                    style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', marginInlineStart: 'auto' }}
                    onClick={() => setMode('text')}
                  >
                    💬 {t('voice.switchToText')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mic-unsupported-box" style={{ padding: '1rem', textAlign: 'center', width: '100%' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {t('voice.micError')}
                </p>
                <button className="btn-primary" type="button" onClick={() => setMode('text')}>
                  💬 {t('voice.switchToText')}
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
              placeholder={t('conversation.placeholder')}
              disabled={sending}
            />
            <button
              className="chat-send-btn"
              type="submit"
              disabled={sending || !inputText.trim()}
              title={t('conversation.send')}
            >
              {sending ? '...' : (isRtl ? '➔' : '➔')}
            </button>
            {speechSupported && (
              <button
                className="voice-quick-btn"
                type="button"
                onClick={() => setMode('voice')}
                title={t('scenarios.startVoice')}
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
