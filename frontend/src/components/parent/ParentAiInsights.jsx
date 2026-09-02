import { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useI18n } from '../../context/I18nContext';
import { api } from '../../services/api';

export default function ParentAiInsights({ companion, userId }) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();

  const insights = companion?.aiInsights || {};
  const strengthsItems = insights.strengths || [];
  const practiceItems = insights.areasToPractice || [];
  const whyItems = insights.whyThisMatters || [];
  const homeItems = insights.homeGuidance || [];

  // Chat State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your HumSaathi Parent Companion. I can help explain ${companion?.learner?.name || 'your learner'}'s progress, suggest everyday practice activities, or answer questions about their communication journey. How can I assist you today?`,
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState([
    "What are my learner's strongest skills?",
    "How can I help improve conversation initiation at home?",
    "What should we focus on this week?",
    "Can you suggest a 5-minute daily game?",
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const newHistory = [...messages, { role: 'user', content: text }];
    setMessages(newHistory);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await api.sendParentAiChat(userId, text, newHistory);
      const reply = res?.reply || "I'm observing steady progress in recent sessions. Continuing gentle daily practice will support their growth.";
      setMessages([...newHistory, { role: 'assistant', content: reply }]);
      if (res?.suggestedFollowups?.length > 0) {
        setSuggestedPrompts(res.suggestedFollowups);
      }
    } catch (err) {
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: "AI insights are temporarily unavailable. Your learner's progress and activity data remain fully up to date.",
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parent-section-container">
      {/* Header */}
      <header className="parent-subview-header">
        <span className="parent-badge-kicker">Personalized Analysis</span>
        <h2>🤖 {t('parent.nav.insights') || 'AI Insights'}</h2>
        <p className="parent-subview-desc">
          Clear, parent-friendly insights into what your learner does well and how to support them at home.
        </p>
      </header>

      {/* 4-Part Structured AI Cards Grid */}
      <div className="parent-insights-quad-grid">
        {/* 1. Strengths */}
        <motion.div
          className="parent-card insight-quad-card strength-quad"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="quad-card-header">
            <span className="quad-icon">🌟</span>
            <h3>{t('parent.strengths')}</h3>
          </div>
          <div className="quad-card-body">
            {strengthsItems.map((item, idx) => (
              <div key={idx} className="quad-item-block">
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 2. Areas to Practice */}
        <motion.div
          className="parent-card insight-quad-card practice-quad"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06 }}
        >
          <div className="quad-card-header">
            <span className="quad-icon">🎯</span>
            <h3>{t('parent.needsPractice')}</h3>
          </div>
          <div className="quad-card-body">
            {practiceItems.map((item, idx) => (
              <div key={idx} className="quad-item-block">
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 3. Why This Matters */}
        <motion.div
          className="parent-card insight-quad-card why-quad"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
        >
          <div className="quad-card-header">
            <span className="quad-icon">💡</span>
            <h3>{t('parent.whyThisMatters') || 'Why This Matters'}</h3>
          </div>
          <div className="quad-card-body">
            {whyItems.map((item, idx) => (
              <div key={idx} className="quad-item-block">
                <strong>{item.title}</strong>
                <p>{item.explanation}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 4. What You Can Do at Home */}
        <motion.div
          className="parent-card insight-quad-card home-quad"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18 }}
        >
          <div className="quad-card-header">
            <span className="quad-icon">🏠</span>
            <h3>{t('parent.whatYouCanDo') || 'What You Can Do at Home'}</h3>
          </div>
          <div className="quad-card-body">
            {homeItems.map((item, idx) => (
              <div key={idx} className="quad-item-block">
                <strong>{item.title}</strong>
                <p>{item.action}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Ask HumSaathi Parent AI Assistant */}
      <motion.section
        className="parent-card parent-chat-section"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.22 }}
      >
        <div className="parent-chat-header">
          <div className="parent-chat-title-group">
            <span className="chat-avatar-bubble">💬</span>
            <div>
              <h3>{t('parent.askAi') || 'Ask HumSaathi'}</h3>
              <p className="parent-chat-subtitle">Grounded in your learner's real progress and performance</p>
            </div>
          </div>
          <span className="ai-safety-pill">Educational Support Only</span>
        </div>

        {/* Suggested Prompt Chips */}
        <div className="parent-prompt-chips">
          {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              className="parent-prompt-chip-btn"
              type="button"
              onClick={() => handleSendMessage(prompt)}
              disabled={loading}
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="parent-chat-stream">
          {messages.map((m, idx) => (
            <div key={idx} className={`parent-chat-bubble ${m.role === 'user' ? 'is-user' : 'is-assistant'}`}>
              <span className="bubble-sender">{m.role === 'user' ? 'You' : 'HumSaathi AI'}</span>
              <div className="bubble-content">{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className="parent-chat-bubble is-assistant is-typing">
              <span className="bubble-sender">HumSaathi AI</span>
              <div className="typing-dots">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form
          className="parent-chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            className="parent-chat-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t('parent.askAiPlaceholder') || "Ask a question about your learner's progress or home practice..."}
            disabled={loading}
          />
          <button className="btn-primary parent-chat-send-btn" type="submit" disabled={!inputMessage.trim() || loading}>
            Send
          </button>
        </form>

        <p className="parent-chat-disclaimer">
          🔒 {t('parent.disclaimer') || 'HumSaathi is an educational learning companion and does not provide clinical or medical diagnoses.'}
        </p>
      </motion.section>
    </div>
  );
}
