# 🤖 AgentChat Universal Chatbot Widget

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](chatbot-widget.js)
[![Shadow DOM](https://img.shields.io/badge/Shadow%20DOM-Isolated-purple.svg)](chatbot-widget.js)
[![CDN Ready](https://img.shields.io/badge/CDN-jsDelivr-orange.svg)](https://unpkg.com/nerd-chat-widget@1.0.1/chatbot-widget.js)

A lightweight, zero-dependency, embeddable AI chatbot widget that you can drop into **any HTML page, Node.js app, or React/Next.js/Vue website**. Built with native Web Components and Shadow DOM isolation to guarantee **zero CSS conflicts** with your website.

---

## ✨ Features

- 🛡️ **Shadow DOM Isolation**: 100% style containment. No CSS leaks or collisions with your website's styles (Bootstrap, Tailwind, custom CSS, etc.).
- 🚀 **Zero Dependencies**: Pure vanilla JavaScript (no React, jQuery, FontAwesome, or external CSS required). Under ~42KB total.
- 🌐 **Instant CDN Integration**: Drop it into any page via jsDelivr CDN with a single `<script>` tag.
- 📐 **Expand & Minimize Views**: Standard floating drawer (`410px`) with a 1-click **Expanded Wide Mode** (`860px` / `86vh`) for comfortably reading long-form AI answers, tables, and code snippets.
- 💻 **Rich Markdown & Code Highlighting**: Formats headings, bold, italics, bullet lists, links, inline code, and syntax containers with a **1-click Copy to Clipboard** button.
- 🎵 **Web Audio Synthesis**: Synthesizes soft, pleasant chime notifications natively via the Web Audio API—no external `.mp3` or `.wav` sound files needed.
- 💾 **Persistent Chat History**: Automatically preserves conversation history across page navigations and refreshes using `localStorage`.
- ⚡ **Auto-Open & Proactive Teaser**: Configurable teaser pill and optional auto-open timeout to greet visitors proactively.
- 🎨 **Full Theming & Customization**: Customize primary/secondary gradient colors, position (`bottom-right` or `bottom-left`), greetings, and dark/light themes.
- 🎮 **Global JavaScript API**: Programmatically control widget state (`open`, `close`, `toggle`, `expand`, `shrink`, `send`, `clear`).
- 🛡️ **Resilient Network Handling**: Connects directly to your deployed agent endpoint with automatic fallback to `/api/chat` proxy if CORS is restricted.

---

## ⚡ Quick Start

### 1. Embed via Global CDN (Fastest, 100% Free)

Add this single `<script>` tag before the closing `</body>` tag on any webpage:

```html
<script 
  src="https://unpkg.com/nerd-chat-widget@1.0.1/chatbot-widget.js"
  data-agent-url="https://your-agent-endpoint.com/invocations"
  data-agent-key="YOUR_AGENT_KEY"
  data-title="AI Assistant"
  data-subtitle="Online • Ask me anything"
  data-greeting="Hi! How can I assist you today?"
  data-primary-color="#6366f1"
  data-position="bottom-right">
</script>
```

> **Tip:** You can pin a specific branch or release tag for production stability:  
> `https://cdn.jsdelivr.net/gh/agent-chat-widget/widget@v1.0.0/chatbot-widget.js`

---

### 2. Embed via Self-Hosted File

1. Download [`chatbot-widget.js`](file:///home/sooraj/Projects/NewNerdWorkspace/nerdsMS/nerd-chatbot-widget/chatbot-widget.js) into your project's public folder.
2. Include it on your page:

```html
<script 
  src="/chatbot-widget.js"
  data-agent-url="https://your-agent-endpoint.com/invocations"
  data-agent-key="YOUR_AGENT_KEY"
  data-title="Shop Assistant"
  data-position="bottom-right">
</script>
```

---

### 3. Programmatic Initialization

If you prefer to initialize the widget via JavaScript instead of `data-*` attributes:

```html
<script src="https://unpkg.com/nerd-chat-widget@1.0.1/chatbot-widget.js"></script>

<script>
  window.ChatbotWidget.init({
    agentUrl: "https://your-agent-endpoint.com/invocations",
    agentKey: "YOUR_AGENT_KEY",
    title: "Support Assistant",
    subtitle: "Available 24/7",
    greeting: "Hello! Welcome to our store. How can I help you?",
    primaryColor: "#0ea5e9",
    secondaryColor: "#3b82f6",
    position: "bottom-right",
    theme: "dark",
    enableSound: true,
    enablePersist: true
  });
</script>
```

---

## ⚙️ Configuration Reference

All settings can be specified either as `data-*` attributes on the `<script>` tag, or as keys in the `window.ChatbotWidget.init({...})` options object:

| `data-*` Attribute | JS Config Key | Type | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `data-agent-url` | `agentUrl` | `string` | *(Pre-configured)* | The endpoint URL for agent invocations (e.g. `https://.../invocations`). |
| `data-agent-key` | `agentKey` | `string` | `""` | Authentication key passed in the `agent-key` HTTP header. |
| `data-title` | `title` | `string` | `"AI Assistant"` | Main title displayed in the chat window header. |
| `data-subtitle` | `subtitle` | `string` | `"Always active"` | Subtitle / status indicator below the main title. |
| `data-greeting` | `greeting` | `string` | `"Hi there! How can I assist you today?"` | Welcome greeting shown inside the initial welcome card. |
| `data-primary-color` | `primaryColor` | `string` | `"#6366f1"` | Hex color for launcher button, user bubbles, and accents. |
| `data-secondary-color` | `secondaryColor` | `string` | `"#8b5cf6"` | Secondary hex color for gradients. |
| `data-position` | `position` | `string` | `"bottom-right"` | Screen placement: `"bottom-right"` or `"bottom-left"`. |
| `data-theme` | `theme` | `string` | `"dark"` | Visual theme: `"dark"` or `"light"`. |
| `data-placeholder` | `placeholder` | `string` | `"Ask a question or type a message..."` | Placeholder text inside the message textarea. |
| `data-sound` | `enableSound` | `boolean` | `true` | Synthesize Web Audio chime when the bot replies (`"true"` or `"false"`). |
| `data-persist` | `enablePersist` | `boolean` | `true` | Save chat messages in `localStorage` across page navigations (`"true"` or `"false"`). |
| `data-auto-open` | `autoOpenDelay` | `number` | `0` | Delay in milliseconds before automatically opening drawer (e.g. `"5000"` for 5s; `0` disables). |

---

## 🎮 JavaScript Control API

The widget exposes a global `window.ChatbotWidget` object that allows complete programmatic control:

```javascript
// Open, close, or toggle the chat drawer
ChatbotWidget.open();
ChatbotWidget.close();
ChatbotWidget.toggle();

// Switch between standard drawer and widescreen mode
ChatbotWidget.expand();   // Expands to wide view (860px / 86vh)
ChatbotWidget.shrink();   // Restores standard view (410px)

// Programmatically send a message to the chatbot
ChatbotWidget.send("What services do you offer?");

// Clear conversation history and localStorage
ChatbotWidget.clear();

// Re-initialize or update settings dynamically
ChatbotWidget.init({
  title: "VIP Support Assistant",
  primaryColor: "#10b981"
});
```

---

## 📦 Framework Integration Guides

### Next.js (App Router & Pages Router)

Use Next.js's built-in `next/script` in your root layout:

```tsx
// app/layout.tsx (App Router)
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://unpkg.com/nerd-chat-widget@1.0.1/chatbot-widget.js"
          strategy="lazyOnload"
          data-agent-url="https://your-agent-endpoint.com/invocations"
          data-agent-key="YOUR_AGENT_KEY"
          data-title="AI Assistant"
          data-position="bottom-right"
        />
      </body>
    </html>
  );
}
```

---

### React (Vite / Create React App)

Add the script tag in your `index.html` right before `</body>`:

```html
<!-- index.html -->
<body>
  <div id="root"></div>
  <script 
    src="https://unpkg.com/nerd-chat-widget@1.0.1/chatbot-widget.js"
    data-agent-url="https://your-agent-endpoint.com/invocations"
    data-agent-key="YOUR_AGENT_KEY"
    data-title="AI Assistant">
  </script>
</body>
```

Or inject it dynamically inside a `useEffect`:

```jsx
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/nerd-chat-widget@1.0.1/chatbot-widget.js';
    script.setAttribute('data-agent-url', 'https://your-agent-endpoint.com/invocations');
    script.setAttribute('data-agent-key', 'YOUR_AGENT_KEY');
    script.setAttribute('data-title', 'AI Assistant');
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div>My Website Content</div>;
}
```

---

### Vue / Nuxt 3

In Nuxt 3 (`nuxt.config.ts`):

```ts
export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          src: 'https://unpkg.com/nerd-chat-widget@1.0.1/chatbot-widget.js',
          'data-agent-url': 'https://your-agent-endpoint.com/invocations',
          'data-agent-key': 'YOUR_AGENT_KEY',
          'data-title': 'AI Assistant',
          tagPosition: 'bodyClose',
        },
      ],
    },
  },
});
```

---

### WordPress, Shopify, Webflow, Squarespace

1. Go to your site admin panel (e.g. **Custom Code**, **Theme Liquid**, or **Footer Code Injection**).
2. Paste the snippet right before `</body>`:

```html
<script 
  src="https://unpkg.com/nerd-chat-widget@1.0.1/chatbot-widget.js"
  data-agent-url="https://your-agent-endpoint.com/invocations"
  data-agent-key="YOUR_AGENT_KEY"
  data-title="Customer Support"
  data-position="bottom-right">
</script>
```

---

### Node.js / Express Web Applications

Serve `chatbot-widget.js` statically:

```javascript
// server.js
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.listen(3000, () => console.log('App running on port 3000'));
```

And in your HTML / EJS template:

```html
<script 
  src="/chatbot-widget.js"
  data-agent-url="https://your-agent-endpoint.com/invocations"
  data-agent-key="YOUR_AGENT_KEY">
</script>
```

---

## 🔌 Backend API Specification & Response Extraction

### Request Payload

When the user enters a prompt, the widget sends an `HTTP POST` request to `data-agent-url`:

```http
POST /invocations HTTP/1.1
Host: your-agent-endpoint.com
Content-Type: application/json
accept: application/json
agent-key: YOUR_AGENT_KEY

{
  "input": {
    "prompt": "Hello! What can you help me with?"
  }
}
```

### Supported Response Formats

The widget features an adaptive parser (`extractBotResponse`) that automatically detects and renders any of the following standard response formats:

```json
// Format 1: Nested output message (Standard)
{
  "output": {
    "message": "Hello! I can help answer questions..."
  }
}

// Format 2: Direct response key
{
  "response": "Hello! I can help answer questions..."
}

// Format 3: Direct answer key
{
  "answer": "Hello! I can help answer questions..."
}

// Format 4: Direct message key (string or OpenAI style)
{
  "message": "Hello! I can help answer questions..."
}
// or
{
  "message": {
    "content": "Hello! I can help answer questions..."
  }
}

// Format 5: Raw text or string output
"Hello! I can help answer questions..."
```

---

## 🛡️ CORS Setup Guide

When the widget runs inside client-side JavaScript on external websites, the browser issues a preflight `OPTIONS` request before sending the `POST`.

To ensure your agent backend accepts requests from host websites, enable CORS on your backend server:

### FastAPI (Python)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Or list specific allowed domains
    allow_credentials=True,
    allow_methods=["*"],       # Allows OPTIONS, POST, GET
    allow_headers=["*"],       # Allows agent-key, Content-Type, accept
)
```

### Express.js (Node.js)

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'accept', 'agent-key']
}));
```

### Flask (Python)

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, headers=['Content-Type', 'accept', 'agent-key'])
```

### Nginx Reverse Proxy

```nginx
location /invocations {
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,agent-key,accept';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
    add_header 'Access-Control-Allow-Origin' '*' always;
    proxy_pass http://backend-upstream;
}
```

> **Automatic Fallback:** If a direct browser fetch to `data-agent-url` is blocked by CORS, the widget will automatically attempt to proxy the request through your local backend at `/api/chat`.

---

## 🎨 Theming Presets

Customize the widget to match your brand by adjusting `data-primary-color` and `data-secondary-color`:

```html
<!-- Indigo & Violet (Default) -->
data-primary-color="#6366f1"
data-secondary-color="#8b5cf6"

<!-- Emerald & Teal (Finance / Healthcare) -->
data-primary-color="#059669"
data-secondary-color="#0d9488"

<!-- Cyberpunk Sunset (Entertainment / Gaming) -->
data-primary-color="#f43f5e"
data-secondary-color="#f97316"

<!-- Modern Ocean (Tech / SaaS) -->
data-primary-color="#0284c7"
data-secondary-color="#2563eb"

<!-- Clean Dark / Obsidian -->
data-primary-color="#3b82f6"
data-secondary-color="#6366f1"
data-theme="dark"

<!-- Clean Light Mode -->
data-primary-color="#2563eb"
data-secondary-color="#4f46e5"
data-theme="light"
```

---

## ⌨️ Keyboard Shortcuts & Interactions

- **`Enter`**: Send message
- **`Shift + Enter`**: Insert a new line
- **Auto-resize**: The textarea grows automatically as you type (up to `120px` height)
- **1-Click Code Copying**: Any code block rendered in bot responses has a dedicated copy button
- **Quick Suggestion Chips**: Click any prompt chip in the welcome card to immediately submit a query

---

## 💻 Local Testing & Development

To test the widget locally:

1. Clone this repository:
   ```bash
   git clone https://github.com/agent-chat-widget/widget.git
   cd agent-chat-widget
   ```

2. Start a simple static web server:
   ```bash
   # Using Python
   python3 -m http.server 3000

   # Or using Node.js
   npx serve .
   ```

3. Open `http://localhost:3000` in your web browser.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
