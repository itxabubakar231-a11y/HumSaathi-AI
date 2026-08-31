import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';
import { speakWithBestVoice, stopSpeech } from '../utils/ttsVoiceHelper';

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
    if (!text) return;
    const targetLang = lang || language || 'en';

    speakWithBestVoice({
      text,
      language: targetLang,
      onStart: () => {
        if (idx !== null) setSpeakingIdx(idx);
      },
      onEnd: () => {
        setSpeakingIdx(null);
      },
      onError: () => {
        setSpeakingIdx(null);
      }
    });
  }, [language]);

  const stopSpeaking = () => {
    stopSpeech();
    setSpeakingIdx(null);
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
      rec.lang = (language === 'ur' || language === 'ur_rm') ? 'ur-PK' : 'en-US';

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
  }, [sessionId, user, navigate, language, fetchSession, t]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      handleVoicesChanged();
      return () => {
        if (window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }
  }, []);

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
        language: language,
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
  const objectives = Array.isArray(scenarioData.objectives) ? scenarioData.objectives : [];
  const primaryGoal = objectives.length > 0
    ? getLocalizedText(objectives[0], language, objectives[0])
    : (t('conversation.goalDefault') || 'Join • Contribute • Communicate');

  // Determine current learning loop active stage
  const turnCount = messages.length;
  const loopStep = turnCount === 0 ? 'practice' : turnCount <= 2 ? 'converse' : turnCount <= 4 ? 'adapt' : turnCount <= 6 ? 'reflect' : 'grow';

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
      {/* Left Sidebar: Scenario Information, AI Context & Learning Loop */}
      <aside className="practice-info-sidebar">
        <div className="practice-info-header">
          <span className="practice-badge-kicker">
            🎯 {t('conversation.interactivePractice')}
          </span>
          <h2 className="practice-scenario-title">{scenarioTitle}</h2>
          <p className="practice-scenario-desc">{scenarioDesc}</p>
        </div>

        {/* Visual Learning Loop Stepper */}
        <div className="learning-loop-bar" aria-label="Learning progression loop">
          <span className={`learning-loop-node ${loopStep === 'practice' ? 'is-active' : ''}`}>
            {t('conversation.loopPractice') || 'PRACTICE'}
          </span>
          <span className="learning-loop-arrow">→</span>
          <span className={`learning-loop-node ${loopStep === 'converse' ? 'is-active' : ''}`}>
            {t('conversation.loopConverse') || 'CONVERSE'}
          </span>
          <span className="learning-loop-arrow">→</span>
          <span className={`learning-loop-node ${loopStep === 'adapt' ? 'is-active' : ''}`}>
            {t('conversation.loopAdapt') || 'ADAPT'}
          </span>
          <span className="learning-loop-arrow">→</span>
          <span className={`learning-loop-node ${loopStep === 'reflect' ? 'is-active' : ''}`}>
            {t('conversation.loopReflect') || 'REFLECT'}
          </span>
          <span className="learning-loop-arrow">→</span>
          <span className={`learning-loop-node ${loopStep === 'grow' ? 'is-active' : ''}`}>
            {t('conversation.loopGrow') || 'GROW'}
          </span>
        </div>

        {/* AI Context Panel: "HUMSAATHI UNDERSTANDS" */}
        <div className="ai-context-panel">
          <div className="ai-context-panel-title">
            <span className="ai-context-kicker">
              ✨ {t('conversation.humsaathiUnderstands') || 'HUMSAATHI UNDERSTANDS'}
            </span>
          </div>
          <div className="ai-context-chips-row">
            <span className="ai-context-chip">
              {user?.persona ? `${user.persona.charAt(0).toUpperCase() + user.persona.slice(1)} learner` : 'Learner'} <span className="ai-context-chip-check">✓</span>
            </span>
            <span className="ai-context-chip">
              {scenarioRole} <span className="ai-context-chip-check">✓</span>
            </span>
            <span className="ai-context-chip">
              {language === 'ur' ? 'اردو' : language === 'ur_rm' ? 'Roman Urdu' : 'English'} <span className="ai-context-chip-check">✓</span>
            </span>
            <span className="ai-context-chip">
              {primaryGoal.length > 28 ? primaryGoal.slice(0, 26) + '...' : primaryGoal} <span className="ai-context-chip-check">✓</span>
            </span>
          </div>
          <div className="ai-adaptive-status">
            <span>⚡ {t('conversation.adaptiveGenerated') || 'Adaptive response generated'}</span>
          </div>
        </div>

        {/* Metadata Card */}
        <div className="practice-meta-card">
          <div className="meta-row">
            <span className="meta-label">🤖 {t('conversation.roleLabel') || 'Role'}:</span>
            <strong className="meta-val">{scenarioRole}</strong>
          </div>
          <div className="meta-row">
            <span className="meta-label">🎯 {t('conversation.goalLabel') || 'Goal'}:</span>
            <strong className="meta-val" style={{ fontSize: '0.85rem' }}>{primaryGoal}</strong>
          </div>
          <div className="meta-row">
            <span className="meta-label">🌐 {t('conversation.language') || 'Language:'}</span>
            <strong className="meta-val">
              {language === 'ur' ? 'اردو (Urdu)' : language === 'ur_rm' ? 'Roman Urdu' : 'English'}
            </strong>
          </div>
          <div className="meta-row">
            <span className="meta-label">⚡ {t('conversation.difficulty') || 'Difficulty:'}</span>
            <strong className="meta-val" style={{ textTransform: 'capitalize' }}>
              {getDifficultyLabel(scenarioData.difficulty)}
            </strong>
          </div>
        </div>

        {/* Tips Card */}
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
        {/* Top Chat Bar with AI COACH status & Mode Switcher */}
        <div className="chat-top-header">
          <div className="chat-partner-status">
            <div className="online-pulse-indicator">
              <span className="online-pulse-dot" />
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                {t('conversation.aiCoachHeader') || 'AI COACH'}
              </strong>
              <span style={{ fontSize: '0.75rem', background: 'var(--light-green)', color: 'var(--primary-green)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                {t('conversation.online') || 'Online'}
              </span>
            </div>
            <span className="partner-sub" style={{ marginInlineStart: '0.5rem' }}>
              · {scenarioRole} ({t('conversation.safeSimulation')})
            </span>
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
                <div className="bubble-avatar-ai" title={scenarioRole}>
                  {(() => {
                    const r = String(scenarioRole || '').toLowerCase();
                    if (r.includes('manager') || r.includes('supervisor')) return '👔';
                    if (r.includes('teacher')) return '👩‍🏫';
                    if (r.includes('classmate') || r.includes('friend') || r.includes('student')) return '🧑‍🎓';
                    if (r.includes('support') || r.includes('agent')) return '🎧';
                    if (r.includes('pharmacist') || r.includes('doctor') || r.includes('receptionist')) return '💊';
                    return '🎭';
                  })()}
                </div>
              )}
              <div className="bubble-content-wrap">
                {msg.role !== 'user' && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      display: 'block',
                      marginBottom: '0.2rem',
                    }}
                  >
                    {scenarioRole}
                  </span>
                )}
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
                <div className="bubble-avatar-user" title={user?.name || 'You'}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
          ))}

          {/* AI Thinking Animation */}
          {sending && (
            <div className="chat-bubble-row ai-row">
              <div className="bubble-avatar-ai">🤖</div>
              <div className="ai-thinking-pill" aria-label="AI is generating response">
                <span className="online-pulse-dot" />
                <span style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                  {t('conversation.thinking') || 'HumSaathi is thinking…'}
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && <p className="error-text" style={{ padding: '0 1.5rem', fontSize: '0.85rem' }}>{error}</p>}

        {/* Quick Suggested Response Option Chips */}
        {scenarioOptions.length > 0 && !sending && (
          <div
            className="suggested-options-container"
            style={{
              padding: '0.65rem 1.25rem',
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--primary-green)',
                display: 'block',
                marginBottom: '0.45rem',
                letterSpacing: '0.03em',
              }}
            >
              💡 {t('conversation.suggestedResponses') || 'Suggested responses'}
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '0.45rem',
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
                      padding: '0.55rem 0.85rem',
                      fontSize: '0.86rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      lineHeight: '1.4',
                    }}
                    onClick={() => handleSendMessage(optText)}
                    disabled={sending}
                  >
                    <span>💬</span>
                    <span>{optText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Area (Voice vs Text) */}
        {mode === 'voice' ? (
          <div className="chat-input-area voice-input-area" style={{ padding: '1rem 1.25rem' }}>
            {speechSupported ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Status & Live waveform preview */}
                {(isRecording || recordedTranscript || interimTranscript) && (
                  <div
                    className="voice-preview-box"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.95rem',
                      color: 'var(--text-primary)',
                      lineHeight: '1.4',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                    }}
                  >
                    {isRecording ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', width: '100%' }}>
                        <div className="voice-live-waveform" aria-hidden="true">
                          <span className="waveform-bar" />
                          <span className="waveform-bar" />
                          <span className="waveform-bar" />
                          <span className="waveform-bar" />
                          <span className="waveform-bar" />
                          <span className="waveform-bar" />
                        </div>
                        <span style={{ fontWeight: 600, color: '#ef4444' }}>
                          ● {t('voice.listening') || 'Listening…'}
                        </span>
                        <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                          "{recordedTranscript ? `${recordedTranscript} ` : ''}{interimTranscript || ''}"
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary-green)', fontWeight: 700, flexShrink: 0 }}>
                          ✓ {t('voice.voiceCaptured') || 'Voice captured'}:
                        </span>
                        <input
                          type="text"
                          value={recordedTranscript}
                          onChange={(e) => setRecordedTranscript(e.target.value)}
                          style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            fontSize: '0.95rem',
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit',
                          }}
                          placeholder="Spoken transcript..."
                        />
                      </div>
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
                        background: '#ef4444',
                        borderColor: '#ef4444',
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
                        style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}
                        onClick={startRecording}
                      >
                        ↻ {t('voice.recordAgain') || 'Record Again'}
                      </button>
                      <button
                        className="btn-secondary"
                        type="button"
                        style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', color: '#ef4444' }}
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
                        🚀 {sending ? (t('voice.processingVoice') || 'Processing your voice…') : t('voice.sendVoiceMessage')}
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

