import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';
import { speakWithBestVoice, stopSpeech } from '../utils/ttsVoiceHelper';
import {
  MessageIcon,
  MicIcon,
  PlayIcon,
  StopIcon,
  TrashIcon,
  RefreshIcon,
  SendIcon,
  VolumeIcon,
  SparklesIcon,
  CheckIcon,
  ArrowRightIcon,
  AiIcon,
} from '../components/ui/Icons';

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
      },
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
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [fetchSession, language, navigate, t, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Voice recording handlers
  const startRecording = async () => {
    setSpeechError('');
    setRecordedTranscript('');
    setInterimTranscript('');
    setAudioPreviewUrl(null);
    audioChunksRef.current = [];

    // 1. Start Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start retry:', err);
      }
    }

    // 2. Start MediaRecorder for audio playback
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioPreviewUrl(url);
          // Stop stream tracks
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
      } catch (err) {
        console.warn('MediaRecorder error:', err);
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
  };

  const deleteRecording = () => {
    stopRecording();
    setRecordedTranscript('');
    setInterimTranscript('');
    setAudioPreviewUrl(null);
    setIsPlayingAudio(false);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
  };

  const togglePlayAudio = () => {
    if (!audioPreviewUrl) return;
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioPreviewUrl);
      audioPlayerRef.current.onended = () => setIsPlayingAudio(false);
    }
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Send message handler
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || sending) return;

    setInputText('');
    setRecordedTranscript('');
    setInterimTranscript('');
    setAudioPreviewUrl(null);
    setSending(true);
    setError('');

    // Append user message optimistically
    const nextUserMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, nextUserMsg]);

    try {
      const activeLang = session?.language || language || 'en';
      const res = await api.sendMessage(sessionId, {
        userId: user?.id,
        message: text,
        language: activeLang,
      });

      if (res && res.session) {
        const transcriptList = Array.isArray(res.session.transcript) ? res.session.transcript : [];
        setMessages(transcriptList);

        // If in voice mode, speak AI response
        if (mode === 'voice' && transcriptList.length > 0) {
          const lastIdx = transcriptList.length - 1;
          const lastMsg = transcriptList[lastIdx];
          if (lastMsg && lastMsg.role !== 'user') {
            speakText(lastMsg.content, res.session.language || activeLang, lastIdx);
          }
        }
      }
    } catch (err) {
      setError(err.message || t('common.error'));
    } finally {
      setSending(false);
    }
  };

  const handleSendClick = (e) => {
    e?.preventDefault();
    handleSendMessage(inputText);
  };

  const handleFinish = async () => {
    stopSpeaking();
    stopRecording();
    try {
      await api.endConversation(sessionId);
    } catch {
      // ignore
    }
    navigate(`/feedback/${sessionId}`);
  };

  const getRoleLabel = (roleStr) => {
    if (!roleStr) return 'AI Coach';
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
      {/* Left Sidebar: Scenario Information (Desktop) */}
      <aside className="practice-info-sidebar">
        <div className="practice-info-header">
          <span className="practice-badge-kicker">
            {t('conversation.interactivePractice')}
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
              <SparklesIcon size={14} /> {t('conversation.humsaathiUnderstands') || 'HUMSAATHI UNDERSTANDS'}
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
            <span>{t('conversation.adaptiveGenerated') || 'Adaptive response active'}</span>
          </div>
        </div>

        {/* Metadata Card */}
        <div className="practice-meta-card">
          <div className="meta-row">
            <span className="meta-label">{t('conversation.roleLabel') || 'Role'}:</span>
            <strong className="meta-val">{scenarioRole}</strong>
          </div>
          <div className="meta-row">
            <span className="meta-label">{t('conversation.goalLabel') || 'Goal'}:</span>
            <strong className="meta-val" style={{ fontSize: '0.85rem' }}>{primaryGoal}</strong>
          </div>
          <div className="meta-row">
            <span className="meta-label">{t('conversation.language') || 'Language:'}</span>
            <strong className="meta-val">
              {language === 'ur' ? 'اردو (Urdu)' : language === 'ur_rm' ? 'Roman Urdu' : 'English'}
            </strong>
          </div>
          <div className="meta-row">
            <span className="meta-label">{t('conversation.difficulty') || 'Difficulty:'}</span>
            <strong className="meta-val" style={{ textTransform: 'capitalize' }}>
              {getDifficultyLabel(scenarioData.difficulty)}
            </strong>
          </div>
        </div>

        {/* Tips Card */}
        <div className="practice-tips-card">
          <h4>{t('conversation.tipsTitle')}</h4>
          <ul>
            <li>{t('conversation.tip1')}</li>
            <li>{t('conversation.tip2')}</li>
            <li>{t('conversation.tip3')}</li>
          </ul>
        </div>

        <div className="practice-sidebar-actions">
          <button className="btn-secondary end-session-btn" onClick={handleFinish}>
            {t('conversation.endBtn')}
          </button>
        </div>
      </aside>

      {/* Main Column: Interactive Chat Conversation Room */}
      <section className="practice-chat-container">
        {/* 1. Header: AI COACH status & Mode Switcher */}
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

          <div className="chat-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="mode-toggle-group">
              <button
                type="button"
                className={`mode-toggle-btn ${mode === 'text' ? 'is-active' : ''}`}
                onClick={() => {
                  setMode('text');
                  stopSpeaking();
                }}
                aria-label="Switch to Text Mode"
              >
                <MessageIcon size={14} />
                <span>{t('conversation.modeText')}</span>
              </button>
              <button
                type="button"
                className={`mode-toggle-btn ${mode === 'voice' ? 'is-active' : ''}`}
                onClick={() => setMode('voice')}
                aria-label="Switch to Voice Mode"
              >
                <MicIcon size={14} />
                <span>{t('conversation.modeVoice')}</span>
              </button>
            </div>

            <button
              className="mobile-end-session-btn"
              type="button"
              onClick={handleFinish}
              title="Finish Session"
            >
              {t('conversation.endBtn')}
            </button>
          </div>
        </div>

        {/* 2. Mobile Scenario Summary Banner (Visible on mobile/tablets) */}
        <div className="mobile-scenario-banner">
          <div className="mobile-scenario-info">
            <strong className="mobile-scenario-title">{scenarioTitle}</strong>
            <div className="mobile-scenario-meta">
              <span><strong>Role:</strong> {scenarioRole}</span>
              <span>·</span>
              <span><strong>Goal:</strong> {primaryGoal}</span>
            </div>
          </div>
        </div>

        {/* 3. Chat Feed */}
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-bubble-row ${msg.role === 'user' ? 'user-row' : 'ai-row'}`}
            >
              {msg.role !== 'user' && (
                <div className="bubble-avatar-ai" title={scenarioRole}>
                  <AiIcon size={18} />
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
                    {speakingIdx === idx ? (
                      <>
                        <StopIcon size={13} /> <span>{t('conversation.stop')}</span>
                      </>
                    ) : (
                      <>
                        <VolumeIcon size={13} /> <span>{t('conversation.listen')}</span>
                      </>
                    )}
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
              <div className="bubble-avatar-ai">
                <AiIcon size={18} />
              </div>
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

        {/* 4. Quick Suggested Response Option Chips */}
        {scenarioOptions.length > 0 && !sending && (
          <div className="suggested-options-container">
            <span className="suggested-options-kicker">
              <SparklesIcon size={13} />
              <span>{t('conversation.suggestedResponses') || 'Suggested responses'}</span>
            </span>
            <div className="suggested-options-grid">
              {scenarioOptions.slice(0, 4).map((opt, i) => {
                const optText = getLocalizedText(opt.text, language, opt.text);
                return (
                  <button
                    key={opt.id || i}
                    type="button"
                    className="suggested-option-chip"
                    onClick={() => handleSendMessage(optText)}
                    disabled={sending}
                  >
                    <span>{optText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Input Area / Composer (Voice vs Text) */}
        {mode === 'voice' ? (
          <div className="chat-input-area voice-input-area">
            {speechSupported ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Status & Live waveform preview */}
                {(isRecording || recordedTranscript || interimTranscript) && (
                  <div className="voice-preview-box">
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
                          {t('voice.listening') || 'Listening…'}
                        </span>
                        <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                          "{recordedTranscript ? `${recordedTranscript} ` : ''}{interimTranscript || ''}"
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary-green)', fontWeight: 700, flexShrink: 0 }}>
                          ✓ {t('voice.voiceCaptured') || 'Captured'}:
                        </span>
                        <input
                          type="text"
                          value={recordedTranscript}
                          onChange={(e) => setRecordedTranscript(e.target.value)}
                          className="voice-transcript-input"
                          placeholder="Spoken transcript..."
                        />
                      </div>
                    )}
                  </div>
                )}

                {speechError && <p className="error-text" style={{ fontSize: '0.85rem', margin: 0 }}>{speechError}</p>}

                {/* Primary Voice Controls */}
                <div className="voice-controls-row">
                  {!isRecording && !recordedTranscript && (
                    <button
                      className="btn-primary"
                      type="button"
                      onClick={startRecording}
                      disabled={sending}
                    >
                      <MicIcon size={16} />
                      <span>{t('voice.tapToSpeak')}</span>
                    </button>
                  )}

                  {isRecording && (
                    <button
                      className="btn-primary btn-stop-recording"
                      type="button"
                      onClick={stopRecording}
                    >
                      <StopIcon size={16} />
                      <span>{t('conversation.stop')}</span>
                    </button>
                  )}

                  {!isRecording && recordedTranscript && (
                    <>
                      {audioPreviewUrl && (
                        <button
                          className="btn-secondary"
                          type="button"
                          onClick={togglePlayAudio}
                        >
                          {isPlayingAudio ? <StopIcon size={15} /> : <PlayIcon size={15} />}
                          <span>{isPlayingAudio ? 'Stop' : t('voice.playPreview')}</span>
                        </button>
                      )}
                      <button
                        className="btn-secondary"
                        type="button"
                        onClick={startRecording}
                      >
                        <RefreshIcon size={15} />
                        <span>{t('voice.recordAgain') || 'Record Again'}</span>
                      </button>
                      <button
                        className="btn-secondary btn-delete-recording"
                        type="button"
                        onClick={deleteRecording}
                      >
                        <TrashIcon size={15} />
                        <span>{t('voice.deleteRecording')}</span>
                      </button>
                      <button
                        className="btn-primary"
                        type="button"
                        onClick={() => handleSendMessage(recordedTranscript)}
                        disabled={sending}
                      >
                        <SendIcon size={15} />
                        <span>{sending ? (t('voice.processingVoice') || 'Processing…') : t('voice.sendVoiceMessage')}</span>
                      </button>
                    </>
                  )}

                  <button
                    className="btn-secondary switch-mode-btn"
                    type="button"
                    onClick={() => setMode('text')}
                  >
                    <MessageIcon size={15} />
                    <span>{t('voice.switchToText')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mic-unsupported-box" style={{ padding: '1rem', textAlign: 'center', width: '100%' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {t('voice.micError')}
                </p>
                <button className="btn-primary" type="button" onClick={() => setMode('text')}>
                  <MessageIcon size={15} />
                  <span>{t('voice.switchToText')}</span>
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
              aria-label="Message input"
            />
            <button
              className="chat-send-btn"
              type="submit"
              disabled={sending || !inputText.trim()}
              title={t('conversation.send')}
              aria-label="Send message"
            >
              {sending ? <span className="send-spinner" /> : <SendIcon size={16} />}
            </button>
            {speechSupported && (
              <button
                className="voice-quick-btn"
                type="button"
                onClick={() => setMode('voice')}
                title={t('scenarios.startVoice')}
                aria-label="Switch to voice recording"
              >
                <MicIcon size={18} />
              </button>
            )}
          </form>
        )}
      </section>
    </div>
  );
}
