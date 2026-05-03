// src/pages/ChatPage.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { chatApi } from "../services/api";
import PropTypes from "prop-types";
import "./ChatPage.css";

const SUGGESTED_QUESTIONS = [
  "chat.suggested_q1",
  "chat.suggested_q2",
  "chat.suggested_q3",
  "chat.suggested_q4",
];

// Individual AI response component
const AIResponseCard = ({ response, t }) => {
  const speak = (text) => {
    if ("speechSynthesis" in globalThis) {
      globalThis.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      globalThis.speechSynthesis.speak(utt);
    }
  };

  const fullText = [
    response.explanation,
    (response.steps ?? []).join(". "),
    (response.tips ?? []).join(". "),
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <div className="ai-response-card" role="article" aria-label="AI response">
      <div className="ai-response-header">
        <span className="ai-avatar" aria-hidden="true">
          🤖
        </span>
        <span className="ai-label">BallotBuddy AI</span>
        <button
          className="speak-btn"
          onClick={() => speak(fullText)}
          aria-label={t("chat.speak")}
          title={t("chat.speak")}
        >
          🔊
        </button>
      </div>

      {response.explanation && (
        <div className="response-section">
          <h3 className="response-section-title">💡 {t("chat.explanation")}</h3>
          <p className="response-text">{response.explanation}</p>
        </div>
      )}

      {(response.steps ?? []).length > 0 && (
        <div className="response-section">
          <h3 className="response-section-title">📋 {t("chat.steps")}</h3>
          <ol className="response-steps" aria-label="Step-by-step guide">
            {(response.steps ?? []).map((step, i) => (
              <li key={i} className="response-step">
                {step.replace(/^Step \d+:\s*/i, "")}
              </li>
            ))}
          </ol>
        </div>
      )}

      {response.timeline && (
        <div className="response-section">
          <h3 className="response-section-title">🗓️ {t("chat.timeline")}</h3>
          <p className="response-text">{response.timeline}</p>
        </div>
      )}

      {(response.checklist ?? []).length > 0 && (
        <div className="response-section">
          <h3 className="response-section-title">✅ {t("chat.checklist")}</h3>
          <ul className="response-checklist" aria-label="Checklist">
            {(response.checklist ?? []).map((item, i) => (
              <li key={i} className="checklist-item">
                <span className="checklist-icon" aria-hidden="true">
                  ☐
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(response.tips ?? []).length > 0 && (
        <div className="response-section response-tips">
          <h3 className="response-section-title">💡 {t("chat.tips")}</h3>
          <ul className="tip-list">
            {(response.tips ?? []).map((tip, i) => (
              <li key={i} className="tip-item">
                → {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(response.relatedTopics ?? []).length > 0 && (
        <div className="related-topics">
          <span className="related-label">{t("chat.related")}:</span>
          <ul className="related-topics-list">
            {(response.relatedTopics ?? []).map((topic) => (
              <li key={topic} className="related-chip">
                {topic}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

AIResponseCard.propTypes = {
  response: PropTypes.shape({
    explanation: PropTypes.string,
    steps: PropTypes.arrayOf(PropTypes.string),
    timeline: PropTypes.string,
    checklist: PropTypes.arrayOf(PropTypes.string),
    tips: PropTypes.arrayOf(PropTypes.string),
    relatedTopics: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  t: PropTypes.func.isRequired,
};

export default function ChatPage() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (messageText) => {
      const text = (messageText || input).trim();
      if (!text || isLoading) return;

      const userMsg = { role: "user", content: text, id: Date.now() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);
      setError("");

      try {
        const history = messages.slice(-10).map((m) => {
          if (m.role === "model" && m.response) {
            return {
              role: "model",
              content: [
                m.response.explanation,
                (m.response.steps ?? []).join(". "),
                (m.response.tips ?? []).join(". "),
              ]
                .filter(Boolean)
                .join(". "),
            };
          }
          return { role: m.role, content: m.content };
        });
        const res = await chatApi.sendMessage(text, history, i18n.language);
        const aiMsg = {
          role: "model",
          response: res.data.response,
          id: Date.now() + 1,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (err) {
        setError(err.response?.data?.error || t("common.error"));
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [input, isLoading, messages, i18n.language, t],
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startVoiceInput = () => {
    if (
      !("webkitSpeechRecognition" in globalThis || "SpeechRecognition" in globalThis)
    ) {
      setError("Voice input not supported in your browser.");
      return;
    }
    const SpeechRecognition =
      globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang =
      i18n.language === "hi"
        ? "hi-IN"
        : i18n.language === "ta"
          ? "ta-IN"
          : "en-IN";
    recognition.interimResults = true;
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      setError("Voice input error. Please try again.");
    };
    recognition.start();
    setIsListening(true);
  };

  const stopVoiceInput = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h1 className="chat-title">🤖 {t("chat.title")}</h1>
        <p className="chat-subtitle">{t("chat.subtitle")}</p>
      </div>

      <div className="chat-layout">
        {/* Suggested Questions Sidebar */}
        <aside className="chat-sidebar" aria-label="Suggested questions">
          <h2 className="sidebar-title">Quick Questions</h2>
          <ul className="suggested-questions">
            {SUGGESTED_QUESTIONS.map((key) => (
              <li key={key}>
                <button
                  className="suggested-btn"
                  onClick={() => sendMessage(t(key))}
                  aria-label={`${t("chat.ask")}: ${t(key)}`}
                  disabled={isLoading}
                >
                  {t(key)}
                </button>
              </li>
            ))}
          </ul>
          <div className="chat-info-box">
            <p>🔒 Powered by Google Gemini AI</p>
            <p>📚 Based on ECI Guidelines</p>
            <p>🌐 Available in EN / HI / TA</p>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main">
          <ul
            className="chat-messages"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.length === 0 && (
              <li className="chat-empty" role="status">
                <div className="chat-empty-icon" aria-hidden="true">
                  🗳️
                </div>
                <h2>Ask me anything about Indian elections!</h2>
                <p>
                  I can help with voter registration, election steps, documents
                  needed, and more.
                </p>
              </li>
            )}

            {messages.map((msg) => (
              <li key={msg.id} className={`message-row ${msg.role}`}>
                {msg.role === "user" ? (
                  <div
                    className="user-bubble"
                    role="article"
                    aria-label={`${t("chat.you_said")}: ${msg.content}`}
                  >
                    {msg.content}
                  </div>
                ) : (
                  <AIResponseCard response={msg.response} t={t} />
                )}
              </li>
            ))}

            {isLoading && (
              <li
                className="message-row model"
                role="status"
                aria-label={t("chat.thinking")}
              >
                <div className="thinking-indicator">
                  <span className="ai-avatar" aria-hidden="true">
                    🤖
                  </span>
                  <div className="thinking-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="sr-only">{t("chat.thinking")}</span>
                </div>
              </li>
            )}

            {error && (
              <li className="message-row model">
                <div className="chat-error" role="alert" aria-live="assertive">
                  ⚠️ {error}
                </div>
              </li>
            )}

            <div ref={messagesEndRef} />
          </ul>

          {/* Input Area */}
          <div
            className="chat-input-area"
            role="form"
            aria-label="Message input"
          >
            <textarea
              ref={inputRef}
              className="chat-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("chat.placeholder")}
              rows={2}
              maxLength={1000}
              aria-label={t("chat.placeholder")}
              aria-describedby="char-count"
              disabled={isLoading}
            />
            <div className="chat-controls">
              <span id="char-count" className="char-count" aria-live="polite">
                {input.length}/1000
              </span>
              <div className="chat-buttons">
                <button
                  className={`voice-btn ${isListening ? "listening" : ""}`}
                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                  aria-label={
                    isListening ? t("chat.voice_stop") : t("chat.voice_start")
                  }
                  aria-pressed={isListening}
                  title={isListening ? "Stop recording" : "Voice input"}
                >
                  {isListening ? "⏹️" : "🎤"}
                </button>
                <button
                  className="btn btn-primary send-btn"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  aria-label={t("chat.send")}
                >
                  {isLoading ? "..." : t("chat.send")} →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
