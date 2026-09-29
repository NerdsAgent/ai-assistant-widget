/**
 * ==============================================================================
 *  AI CHATBOT EMBEDDABLE WIDGET (Self-Contained, Shadow DOM, Expand/Shrink)
 * ==============================================================================
 *  Usage:
 *  1. Drop into any HTML or template page:
 *     <script src="chatbot-widget.js"
 *             data-agent-url="https://agent-nerdagent-123-xxx.local.nerdagent.ai/invocations"
 *             data-agent-key="xxxx"
 *             data-title="ShopAI Assistant"
 *             data-primary-color="#6366f1"
 *             data-position="bottom-right">
 *     </script>
 *
 *  2. Or initialize programmatically:
 *     <script src="chatbot-widget.js"></script>
 *     <script>
 *       window.ChatbotWidget.init({
 *         agentUrl: "...",
 *         agentKey: "...",
 *         title: "ShopAI Assistant",
 *         position: "bottom-right",
 *         theme: "dark"
 *       });
 *     </script>
 * ==============================================================================
 */

(function () {
  "use strict";

  // Prevent multiple initializations
  if (window.ChatbotWidget && window.ChatbotWidget.initialized) {
    return;
  }

  // Find the script tag that loaded this script to extract data-attributes
  const currentScript =
    document.currentScript ||
    document.querySelector('script[src*="chatbot-widget"]');

  // Default configuration
  const DEFAULT_CONFIG = {
    agentUrl:
      currentScript?.getAttribute("data-agent-url") ||
      "https://agent-nerdagent-123-6b2m3i11.local.nerdagent.ai/invocations",
    agentKey:
      currentScript?.getAttribute("data-agent-key") ||
      "xxx-Enx8bA_9DuPMyk",
    title: currentScript?.getAttribute("data-title") || "AI Assistant",
    subtitle: currentScript?.getAttribute("data-subtitle") || "Always active",
    greeting:
      currentScript?.getAttribute("data-greeting") ||
      "Hi there! How can I assist you today?",
    primaryColor:
      currentScript?.getAttribute("data-primary-color") || "#6366f1",
    secondaryColor:
      currentScript?.getAttribute("data-secondary-color") || "#8b5cf6",
    position:
      currentScript?.getAttribute("data-position") || "bottom-right", // "bottom-right" | "bottom-left"
    theme: currentScript?.getAttribute("data-theme") || "dark", // "dark" | "light"
    placeholder:
      currentScript?.getAttribute("data-placeholder") ||
      "Ask a question or type a message...",
    enableSound:
      currentScript?.getAttribute("data-sound") !== "false",
    enablePersist:
      currentScript?.getAttribute("data-persist") !== "false",
    storageKey: "chatbot_widget_history_v1",
    autoOpenDelay: parseInt(
      currentScript?.getAttribute("data-auto-open") || "0",
      10
    ),
  };

  // State management
  const state = {
    config: { ...DEFAULT_CONFIG },
    isOpen: false,
    isExpanded: false,
    isLoading: false,
    isMuted: false,
    messages: [],
    audioCtx: null,
  };

  // SVG Icons
  const ICONS = {
    chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    expand: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`,
    shrink: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`,
    clear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>`,
    soundOn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`,
    soundOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`,
    send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`,
    bot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>`,
    copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>`,
  };

  // Sound Synthesizer using Web Audio API (zero audio files needed)
  function playChime() {
    if (state.isMuted || !state.config.enableSound) return;
    try {
      if (!state.audioCtx) {
        state.audioCtx = new (window.AudioContext ||
          window.webkitAudioContext)();
      }
      if (state.audioCtx.state === "suspended") {
        state.audioCtx.resume();
      }
      const now = state.audioCtx.currentTime;

      // First pleasant note (F#5)
      const osc1 = state.audioCtx.createOscillator();
      const gain1 = state.audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(739.99, now);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(state.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Second note (B5)
      const osc2 = state.audioCtx.createOscillator();
      const gain2 = state.audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(987.77, now + 0.1);
      gain2.gain.setValueAtTime(0.08, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(state.audioCtx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.5);
    } catch (_) { }
  }

  // Safe Markdown / Text Renderer
  function formatMarkdown(text) {
    if (!text) return "";
    let safe = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code blocks with syntax container and copy button
    safe = safe.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<div class="code-block">
        <div class="code-header">
          <span>${lang || "code"}</span>
          <button class="code-copy-btn" data-code="${encodeURIComponent(code)}">Copy</button>
        </div>
        <pre><code>${code.trim()}</code></pre>
      </div>`;
    });

    // Inline code
    safe = safe.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Bold
    safe = safe.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    // Italic
    safe = safe.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    // Links [text](url)
    safe = safe.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Bullet lists (- or *)
    safe = safe.replace(/^\s*[-*]\s+(.+)$/gm, "<li>$1</li>");
    safe = safe.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

    // Paragraph line breaks
    safe = safe.replace(/\n\n+/g, "<br><br>");
    safe = safe.replace(/\n/g, "<br>");

    return safe;
  }

  // Generate CSS styles inside Shadow DOM
  function generateStyles(config) {
    const isRight = config.position !== "bottom-left";
    const primary = config.primaryColor;
    const secondary = config.secondaryColor;

    return `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

      :host {
        --cb-primary: ${primary};
        --cb-primary-hover: #4f46e5;
        --cb-primary-rgb: 99, 102, 241;
        --cb-secondary: ${secondary};
        --cb-bg: #0f111a;
        --cb-surface: #181b29;
        --cb-surface-light: #222638;
        --cb-border: rgba(255, 255, 255, 0.1);
        --cb-border-focus: rgba(99, 102, 241, 0.5);
        --cb-text: #f3f4f6;
        --cb-text-muted: #9ca3af;
        --cb-user-msg-bg: linear-gradient(135deg, ${primary}, ${secondary});
        --cb-bot-msg-bg: #1e2235;
        --cb-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.08);
        --cb-radius-lg: 20px;
        --cb-radius-md: 14px;
        --cb-radius-sm: 8px;
        --cb-font: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        
        position: fixed;
        ${isRight ? "right: 24px;" : "left: 24px;"}
        bottom: 24px;
        z-index: 2147483647;
        font-family: var(--cb-font);
        font-size: 14px;
        line-height: 1.5;
        color: var(--cb-text);
        box-sizing: border-box;
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      /* ================= LAUNCHER BUTTON ================= */
      .launcher-container {
        position: relative;
        display: flex;
        align-items: center;
        gap: 12px;
        flex-direction: ${isRight ? "row-reverse" : "row"};
      }

      .launcher-btn {
        width: 62px;
        height: 62px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--cb-primary), var(--cb-secondary));
        color: #ffffff;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px -4px rgba(var(--cb-primary-rgb), 0.55), 0 0 0 1px rgba(255,255,255,0.2);
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
        outline: none;
        position: relative;
      }

      .launcher-btn:hover {
        transform: scale(1.08);
        box-shadow: 0 12px 30px -4px rgba(var(--cb-primary-rgb), 0.75), 0 0 0 1px rgba(255,255,255,0.3);
      }

      .launcher-btn:active {
        transform: scale(0.96);
      }

      .launcher-icon {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease;
      }

      .launcher-icon svg {
        width: 100%;
        height: 100%;
      }

      .pulse-ring {
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border-radius: 50%;
        border: 2px solid var(--cb-primary);
        opacity: 0.8;
        animation: pulse 2.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        pointer-events: none;
      }

      @keyframes pulse {
        0% { transform: scale(0.95); opacity: 0.8; }
        50% { transform: scale(1.22); opacity: 0; }
        100% { transform: scale(1.22); opacity: 0; }
      }

      /* Teaser Pill */
      .teaser-bubble {
        background: var(--cb-surface);
        border: 1px solid var(--cb-border);
        color: var(--cb-text);
        padding: 8px 14px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: opacity 0.3s ease, transform 0.3s ease;
        animation: slideIn 0.4s ease;
      }

      .teaser-bubble:hover {
        border-color: var(--cb-primary);
      }

      @keyframes slideIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* ================= CHAT WINDOW ================= */
      .chat-window {
        position: absolute;
        ${isRight ? "right: 0;" : "left: 0;"}
        bottom: 80px;
        width: 410px;
        height: 640px;
        max-width: calc(100vw - 32px);
        max-height: calc(100vh - 110px);
        background: var(--cb-bg);
        border: 1px solid var(--cb-border);
        border-radius: var(--cb-radius-lg);
        box-shadow: var(--cb-shadow);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        opacity: 0;
        pointer-events: none;
        transform: translateY(20px) scale(0.95);
        transform-origin: ${isRight ? "bottom right" : "bottom left"};
        transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                    width 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                    height 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                    max-width 0.35s ease,
                    max-height 0.35s ease;
        backdrop-filter: blur(20px);
      }

      .chat-window.open {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0) scale(1);
      }

      /* EXPANDED / MAXIMIZED STATE */
      .chat-window.expanded {
        width: 860px;
        height: 86vh;
        max-width: calc(100vw - 48px);
        max-height: calc(100vh - 110px);
      }

      /* ================= HEADER ================= */
      .chat-header {
        padding: 16px 18px;
        background: var(--cb-surface);
        border-bottom: 1px solid var(--cb-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        user-select: none;
      }

      .header-bot-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .avatar-wrapper {
        position: relative;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--cb-primary), var(--cb-secondary));
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 12px rgba(var(--cb-primary-rgb), 0.3);
      }

      .avatar-wrapper svg {
        width: 22px;
        height: 22px;
      }

      .status-dot {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 11px;
        height: 11px;
        background: #10b981;
        border: 2px solid var(--cb-surface);
        border-radius: 50%;
      }

      .header-titles h3 {
        font-size: 15px;
        font-weight: 600;
        color: var(--cb-text);
        letter-spacing: -0.01em;
      }

      .header-titles p {
        font-size: 12px;
        color: #10b981;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .action-btn {
        width: 32px;
        height: 32px;
        border-radius: var(--cb-radius-sm);
        border: none;
        background: transparent;
        color: var(--cb-text-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
      }

      .action-btn:hover {
        background: var(--cb-surface-light);
        color: var(--cb-text);
      }

      .action-btn:active {
        transform: scale(0.92);
      }

      .action-btn svg {
        width: 17px;
        height: 17px;
      }

      /* ================= MESSAGES CONTAINER ================= */
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px 18px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        scroll-behavior: smooth;
      }

      .chat-messages::-webkit-scrollbar {
        width: 5px;
      }

      .chat-messages::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 10px;
      }

      /* Welcome Card */
      .welcome-card {
        background: var(--cb-surface);
        border: 1px solid var(--cb-border);
        border-radius: var(--cb-radius-md);
        padding: 18px;
        text-align: center;
        animation: fadeIn 0.4s ease;
      }

      .welcome-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(var(--cb-primary-rgb), 0.15);
        color: var(--cb-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
      }

      .welcome-icon svg {
        width: 26px;
        height: 26px;
      }

      .welcome-card h4 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 6px;
      }

      .welcome-card p {
        font-size: 13px;
        color: var(--cb-text-muted);
        line-height: 1.45;
        margin-bottom: 14px;
      }

      .quick-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
      }

      .quick-chip {
        background: var(--cb-surface-light);
        border: 1px solid var(--cb-border);
        color: var(--cb-text);
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
      }

      .quick-chip:hover {
        background: rgba(var(--cb-primary-rgb), 0.2);
        border-color: var(--cb-primary);
        transform: translateY(-1px);
      }

      /* Message Row */
      .message-row {
        display: flex;
        gap: 10px;
        max-width: 88%;
        animation: msgIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .message-row.user {
        align-self: flex-end;
        flex-direction: row-reverse;
      }

      .message-row.bot {
        align-self: flex-start;
      }

      .message-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--cb-surface-light);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--cb-primary);
        flex-shrink: 0;
        margin-top: 4px;
      }

      .message-avatar svg {
        width: 16px;
        height: 16px;
      }

      .message-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .message-bubble {
        padding: 12px 16px;
        border-radius: var(--cb-radius-md);
        font-size: 14px;
        line-height: 1.5;
        word-break: break-word;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      }

      .message-row.user .message-bubble {
        background: var(--cb-user-msg-bg);
        color: #ffffff;
        border-bottom-right-radius: 4px;
      }

      .message-row.bot .message-bubble {
        background: var(--cb-bot-msg-bg);
        color: var(--cb-text);
        border: 1px solid var(--cb-border);
        border-bottom-left-radius: 4px;
      }

      .message-time {
        font-size: 11px;
        color: var(--cb-text-muted);
        align-self: flex-start;
        padding: 0 4px;
      }

      .message-row.user .message-time {
        align-self: flex-end;
      }

      /* Markdown styles */
      .message-bubble strong {
        color: #ffffff;
        font-weight: 600;
      }

      .message-bubble a {
        color: #818cf8;
        text-decoration: underline;
      }

      .message-bubble ul {
        margin: 6px 0 6px 18px;
      }

      .message-bubble li {
        margin-bottom: 4px;
      }

      .inline-code {
        background: rgba(0, 0, 0, 0.3);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
        color: #e2e8f0;
      }

      .code-block {
        background: #0b0d14;
        border: 1px solid var(--cb-border);
        border-radius: var(--cb-radius-sm);
        margin: 8px 0;
        overflow: hidden;
      }

      .code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.05);
        padding: 4px 10px;
        font-size: 11px;
        color: var(--cb-text-muted);
      }

      .code-copy-btn {
        background: transparent;
        border: none;
        color: var(--cb-text-muted);
        cursor: pointer;
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 3px;
      }

      .code-copy-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .code-block pre {
        padding: 10px;
        overflow-x: auto;
        font-family: 'Fira Code', monospace;
        font-size: 12px;
      }

      /* Typing indicator */
      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 12px 16px;
        background: var(--cb-bot-msg-bg);
        border: 1px solid var(--cb-border);
        border-radius: var(--cb-radius-md);
        border-bottom-left-radius: 4px;
        width: fit-content;
      }

      .typing-dot {
        width: 7px;
        height: 7px;
        background: var(--cb-primary);
        border-radius: 50%;
        animation: typingBounce 1.4s infinite ease-in-out both;
      }

      .typing-dot:nth-child(1) { animation-delay: -0.32s; }
      .typing-dot:nth-child(2) { animation-delay: -0.16s; }

      @keyframes typingBounce {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
      }

      @keyframes msgIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* ================= FOOTER / INPUT AREA ================= */
      .chat-footer {
        padding: 14px 18px 10px;
        background: var(--cb-surface);
        border-top: 1px solid var(--cb-border);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .input-wrapper {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        background: var(--cb-bg);
        border: 1px solid var(--cb-border);
        border-radius: var(--cb-radius-md);
        padding: 6px 8px 6px 14px;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .input-wrapper:focus-within {
        border-color: var(--cb-border-focus);
        box-shadow: 0 0 0 2px rgba(var(--cb-primary-rgb), 0.2);
      }

      .chat-input {
        flex: 1;
        background: transparent;
        border: none;
        color: var(--cb-text);
        font-family: inherit;
        font-size: 14px;
        line-height: 1.4;
        resize: none;
        max-height: 120px;
        min-height: 24px;
        outline: none;
        padding: 4px 0;
      }

      .chat-input::placeholder {
        color: var(--cb-text-muted);
      }

      .send-btn {
        width: 36px;
        height: 36px;
        border-radius: var(--cb-radius-sm);
        background: var(--cb-surface-light);
        border: none;
        color: var(--cb-text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: not-allowed;
        transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
      }

      .send-btn.active {
        background: linear-gradient(135deg, var(--cb-primary), var(--cb-secondary));
        color: #ffffff;
        cursor: pointer;
      }

      .send-btn.active:hover {
        transform: scale(1.05);
      }

      .send-btn.active:active {
        transform: scale(0.95);
      }

      .send-btn svg {
        width: 17px;
        height: 17px;
      }

      .footer-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 11px;
        color: var(--cb-text-muted);
        padding: 0 4px;
      }

      .footer-branding {
        display: flex;
        align-items: center;
        gap: 4px;
        opacity: 0.75;
      }

      .footer-branding svg {
        width: 12px;
        height: 12px;
        color: var(--cb-primary);
      }

      /* Mobile responsiveness */
      @media (max-width: 480px) {
        :host {
          right: 12px !important;
          left: 12px !important;
          bottom: 16px !important;
        }

        .chat-window {
          right: 0 !important;
          left: 0 !important;
          bottom: 74px !important;
          width: 100% !important;
          height: calc(100vh - 95px) !important;
          max-width: 100% !important;
          max-height: 100% !important;
          border-radius: var(--cb-radius-md);
        }
      }
    `;
  }

  // Build the complete Shadow DOM UI
  function createWidget(container, config) {
    const shadow = container.attachShadow({ mode: "open" });

    // Inject Stylesheet
    const styleEl = document.createElement("style");
    styleEl.textContent = generateStyles(config);
    shadow.appendChild(styleEl);

    // Root Container
    const rootEl = document.createElement("div");
    rootEl.className = "chatbot-widget-inner";

    rootEl.innerHTML = `
      <!-- Floating Launcher Button -->
      <div class="launcher-container">
        <div class="teaser-bubble" id="teaserBubble" title="Click to chat">
          <span>Chat with ${config.title} 👋</span>
        </div>
        <button class="launcher-btn" id="launcherBtn" aria-label="Toggle chat">
          <div class="pulse-ring"></div>
          <div class="launcher-icon" id="launcherIcon">
            ${ICONS.chat}
          </div>
        </button>
      </div>

      <!-- Chat Modal Window -->
      <div class="chat-window" id="chatWindow">
        <!-- Header -->
        <div class="chat-header">
          <div class="header-bot-info">
            <div class="avatar-wrapper">
              ${ICONS.bot}
              <div class="status-dot"></div>
            </div>
            <div class="header-titles">
              <h3>${config.title}</h3>
              <p>${config.subtitle}</p>
            </div>
          </div>
          <div class="header-actions">
            <!-- Sound Toggle -->
            <button class="action-btn" id="soundBtn" title="Toggle audio chime">
              ${state.isMuted ? ICONS.soundOff : ICONS.soundOn}
            </button>
            <!-- Clear Chat -->
            <button class="action-btn" id="clearBtn" title="Reset conversation">
              ${ICONS.clear}
            </button>
            <!-- Expand / Shrink -->
            <button class="action-btn" id="expandBtn" title="Expand view">
              ${ICONS.expand}
            </button>
            <!-- Minimize / Close -->
            <button class="action-btn" id="closeBtn" title="Minimize chat">
              ${ICONS.close}
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div class="chat-messages" id="messagesArea">
          <!-- Welcome Greeting Card -->
          <div class="welcome-card" id="welcomeCard">
            <div class="welcome-icon">
              ${ICONS.sparkles}
            </div>
            <h4>${config.greeting}</h4>
            <p>I am your smart assistant powered by AI. How can I help you today?</p>
            <div class="quick-chips">
              <button class="quick-chip" data-prompt="What can you help me with?">What can you do?</button>
              <button class="quick-chip" data-prompt="Tell me about your features">Features</button>
              <button class="quick-chip" data-prompt="How do I get started?">Get started</button>
            </div>
          </div>
        </div>

        <!-- Footer / Input -->
        <div class="chat-footer">
          <div class="input-wrapper">
            <textarea
              class="chat-input"
              id="messageInput"
              placeholder="${config.placeholder}"
              rows="1"
            ></textarea>
            <button class="send-btn" id="sendBtn" title="Send message">
              ${ICONS.send}
            </button>
          </div>
          <div class="footer-meta">
            <span>Press Enter to send</span>
            <div class="footer-branding">
              ${ICONS.sparkles}
              <span>Powered by AI</span>
            </div>
          </div>
        </div>
      </div>
    `;

    shadow.appendChild(rootEl);

    // Grab elements inside shadow DOM
    const launcherBtn = shadow.getElementById("launcherBtn");
    const launcherIcon = shadow.getElementById("launcherIcon");
    const teaserBubble = shadow.getElementById("teaserBubble");
    const chatWindow = shadow.getElementById("chatWindow");
    const messagesArea = shadow.getElementById("messagesArea");
    const messageInput = shadow.getElementById("messageInput");
    const sendBtn = shadow.getElementById("sendBtn");
    const closeBtn = shadow.getElementById("closeBtn");
    const expandBtn = shadow.getElementById("expandBtn");
    const clearBtn = shadow.getElementById("clearBtn");
    const soundBtn = shadow.getElementById("soundBtn");
    const welcomeCard = shadow.getElementById("welcomeCard");

    // ================= EVENT HANDLERS & ACTIONS =================

    // Toggle Chat Open/Close
    function toggleChat() {
      if (state.isOpen) {
        closeChat();
      } else {
        openChat();
      }
    }

    function openChat() {
      state.isOpen = true;
      chatWindow.classList.add("open");
      launcherIcon.innerHTML = ICONS.close;
      teaserBubble.style.display = "none";
      setTimeout(() => messageInput.focus(), 150);
      scrollToBottom();
    }

    function closeChat() {
      state.isOpen = false;
      chatWindow.classList.remove("open");
      launcherIcon.innerHTML = ICONS.chat;
    }

    // Toggle Expand / Shrink
    function toggleExpand() {
      state.isExpanded = !state.isExpanded;
      if (state.isExpanded) {
        chatWindow.classList.add("expanded");
        expandBtn.innerHTML = ICONS.shrink;
        expandBtn.setAttribute("title", "Shrink view");
      } else {
        chatWindow.classList.remove("expanded");
        expandBtn.innerHTML = ICONS.expand;
        expandBtn.setAttribute("title", "Expand view");
      }
      scrollToBottom();
    }

    // Toggle Sound
    function toggleSound() {
      state.isMuted = !state.isMuted;
      soundBtn.innerHTML = state.isMuted ? ICONS.soundOff : ICONS.soundOn;
      soundBtn.setAttribute(
        "title",
        state.isMuted ? "Unmute audio" : "Mute audio"
      );
    }

    // Clear Conversation
    function clearChat() {
      state.messages = [];
      if (state.config.enablePersist) {
        localStorage.removeItem(state.config.storageKey);
      }
      const bubbles = messagesArea.querySelectorAll(".message-row");
      bubbles.forEach((b) => b.remove());
      welcomeCard.style.display = "block";
    }

    // Scroll messages to bottom smoothly
    function scrollToBottom() {
      setTimeout(() => {
        messagesArea.scrollTop = messagesArea.scrollHeight;
      }, 50);
    }

    // Render a single message into the chat UI
    function renderMessage(role, text, time = null) {
      welcomeCard.style.display = "none";
      const timestamp =
        time ||
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

      const row = document.createElement("div");
      row.className = `message-row ${role}`;

      const avatarHtml =
        role === "bot"
          ? `<div class="message-avatar">${ICONS.bot}</div>`
          : "";

      row.innerHTML = `
        ${avatarHtml}
        <div class="message-content-wrapper">
          <div class="message-bubble">${formatMarkdown(text)}</div>
          <span class="message-time">${timestamp}</span>
        </div>
      `;

      // Copy buttons inside code blocks
      row.querySelectorAll(".code-copy-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const rawCode = decodeURIComponent(
            btn.getAttribute("data-code") || ""
          );
          navigator.clipboard.writeText(rawCode).then(() => {
            btn.textContent = "Copied!";
            setTimeout(() => (btn.textContent = "Copy"), 2000);
          });
        });
      });

      messagesArea.appendChild(row);
      scrollToBottom();
    }

    // Typing loading indicator
    let loadingEl = null;
    function showLoading() {
      if (loadingEl) return;
      loadingEl = document.createElement("div");
      loadingEl.className = "message-row bot";
      loadingEl.innerHTML = `
        <div class="message-avatar">${ICONS.bot}</div>
        <div class="message-content-wrapper">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      `;
      messagesArea.appendChild(loadingEl);
      scrollToBottom();
    }

    function removeLoading() {
      if (loadingEl) {
        loadingEl.remove();
        loadingEl = null;
      }
    }

    // Extract message response safely
    function extractBotResponse(data) {
      if (data?.output?.message) return data.output.message;
      if (data?.response) return data.response;
      if (data?.answer) return data.answer;
      if (data?.message) {
        return typeof data.message === "string"
          ? data.message
          : data.message.content || JSON.stringify(data.message);
      }
      if (data?.output) {
        return typeof data.output === "string"
          ? data.output
          : JSON.stringify(data.output);
      }
      return typeof data === "string" ? data : JSON.stringify(data, null, 2);
    }

    // Send user message to agent API
    async function sendMessage(textToSend) {
      const text = (textToSend || messageInput.value).trim();
      if (!text || state.isLoading) return;

      // Add user message
      renderMessage("user", text);
      state.messages.push({
        role: "user",
        text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      // Clear input & reset textarea height
      messageInput.value = "";
      messageInput.style.height = "auto";
      sendBtn.classList.remove("active");
      state.isLoading = true;
      showLoading();

      try {
        const payload = {
          input: {
            prompt: text,
          },
        };

        const headers = {
          "Content-Type": "application/json",
          accept: "application/json",
        };
        if (state.config.agentKey) {
          headers["agent-key"] = state.config.agentKey;
        }

        // Send request
        let response;
        try {
          response = await fetch(state.config.agentUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
          });
        } catch (fetchErr) {
          // If direct call fails (e.g. CORS preflight blocked), try fallback to local proxy if available
          if (
            window.location.protocol.startsWith("http") &&
            !state.config.agentUrl.startsWith("/api")
          ) {
            console.warn(
              "Direct agent connection failed (likely CORS). Attempting fallback to /api/chat..."
            );
            response = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          } else {
            throw fetchErr;
          }
        }

        const rawText = await response.text();
        removeLoading();

        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}: ${rawText}`);
        }

        let parsed;
        try {
          parsed = JSON.parse(rawText);
        } catch (_) {
          parsed = rawText;
        }

        const reply = extractBotResponse(parsed);
        renderMessage("bot", reply);
        playChime();

        state.messages.push({
          role: "bot",
          text: reply,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });

        // Persist to localStorage if enabled
        if (state.config.enablePersist) {
          localStorage.setItem(
            state.config.storageKey,
            JSON.stringify(state.messages)
          );
        }
      } catch (err) {
        removeLoading();
        console.error("Chatbot API Error:", err);
        const errMsg =
          err.message && err.message.includes("Failed to fetch")
            ? `⚠️ **Connection Error (CORS / Network):**\n\nThe browser was blocked from contacting \`${state.config.agentUrl}\`. This usually occurs when the backend server rejects the browser's preflight \`OPTIONS\` request.\n\n* **Solution:** Enable CORS on your backend server, or route through a local proxy (\`/api/chat\`).`
            : `⚠️ **Unable to reach agent:** ${err.message}`;
        renderMessage("bot", errMsg);
      } finally {
        state.isLoading = false;
        messageInput.focus();
      }
    }

    // Auto-resize input textarea as user types
    messageInput.addEventListener("input", () => {
      messageInput.style.height = "auto";
      messageInput.style.height = `${Math.min(
        messageInput.scrollHeight,
        120
      )}px`;
      if (messageInput.value.trim().length > 0) {
        sendBtn.classList.add("active");
      } else {
        sendBtn.classList.remove("active");
      }
    });

    // Enter to send, Shift+Enter for newline
    messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Button Clicks
    sendBtn.addEventListener("click", () => sendMessage());
    launcherBtn.addEventListener("click", toggleChat);
    teaserBubble.addEventListener("click", openChat);
    closeBtn.addEventListener("click", closeChat);
    expandBtn.addEventListener("click", toggleExpand);
    clearBtn.addEventListener("click", clearChat);
    soundBtn.addEventListener("click", toggleSound);

    // Quick chip suggestion clicks
    shadow.querySelectorAll(".quick-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const prompt = chip.getAttribute("data-prompt");
        if (prompt) sendMessage(prompt);
      });
    });

    // Load persisted chat history if any
    if (state.config.enablePersist) {
      try {
        const saved = localStorage.getItem(state.config.storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            state.messages = parsed;
            parsed.forEach((m) => renderMessage(m.role, m.text, m.time));
          }
        }
      } catch (_) { }
    }

    // Auto-open if configured
    if (config.autoOpenDelay > 0) {
      setTimeout(openChat, config.autoOpenDelay);
    }

    return {
      open: openChat,
      close: closeChat,
      toggle: toggleChat,
      expand: () => {
        if (!state.isExpanded) toggleExpand();
      },
      shrink: () => {
        if (state.isExpanded) toggleExpand();
      },
      clear: clearChat,
      send: sendMessage,
    };
  }

  // Initialization routine
  function initialize(userConfig = {}) {
    state.config = { ...DEFAULT_CONFIG, ...userConfig };

    // Check if host already exists
    let host = document.getElementById("chatbot-widget-root");
    if (!host) {
      host = document.createElement("div");
      host.id = "chatbot-widget-root";
      document.body.appendChild(host);
    }

    const api = createWidget(host, state.config);
    window.ChatbotWidget = {
      initialized: true,
      config: state.config,
      open: api.open,
      close: api.close,
      toggle: api.toggle,
      expand: api.expand,
      shrink: api.shrink,
      clear: api.clear,
      send: api.send,
      init: initialize,
    };

    console.log(
      `%c[ChatbotWidget]%c Loaded successfully! Target: ${state.config.agentUrl}`,
      "color: #6366f1; font-weight: bold;",
      "color: inherit;"
    );
  }

  // Auto-initialize when DOM is ready
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    initialize();
  } else {
    document.addEventListener("DOMContentLoaded", () => initialize());
  }
})();
