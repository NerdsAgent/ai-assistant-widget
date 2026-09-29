# 🤖 Universal AI Chatbot Widget

A lightweight, zero-dependency, embeddable AI chatbot widget that you can drop into **any HTML page, Node.js app, or React/Next.js website**. It features a floating launcher, **expand & shrink modes**, full Shadow DOM isolation (so no CSS conflicts with your website), rich Markdown & code block rendering with 1-click copy, and automatic connection to your deployed agent URL.

---

## ⚡ Quick Start: Embed in Any HTML Page

Add this single `<script>` tag right before the closing `</body>` tag on any webpage:

```html
<script 
  src="chatbot-widget.js"
  data-agent-url="https://agent-nerdagent-123-6b2m3i11.local.nerdagent.ai/invocations"
  data-agent-key="DT_v_ir4LTZuHUokY4oUrIBHz6PGbvi-Enx8bA_9DuPMyk"
  data-title="ShopAI Assistant"
  data-subtitle="Online • Ask me anything"
  data-greeting="Hi! How can I assist you today?"
  data-primary-color="#6366f1"
  data-position="bottom-right">
</script>
```

That's it! The floating chat bubble will appear in the bottom right corner with smooth animations.

---

## 🖥️ Live Demo

To test the widget live right now:
1. Start the server (already running if started):
   ```bash
   python3 server.py
   ```
2. Open in your browser:
   **[http://localhost:3000/demo.html](http://localhost:3000/demo.html)**

---

## ⚙️ Configuration Options (`data-*` attributes)

| Attribute | Default | Description |
| :--- | :--- | :--- |
| `data-agent-url` | *(Your agent URL)* | Target endpoint for `/invocations` |
| `data-agent-key` | *(Your key)* | Agent authentication key header |
| `data-title` | `"AI Assistant"` | Name displayed in the chat header |
| `data-subtitle` | `"Always active"` | Status subtitle below the title |
| `data-greeting` | `"Hi there! ..."` | Greeting message in the welcome card |
| `data-primary-color` | `"#6366f1"` | Hex color for buttons, bubble, and accents |
| `data-secondary-color` | `"#8b5cf6"` | Gradient accent color |
| `data-position` | `"bottom-right"` | `"bottom-right"` or `"bottom-left"` |
| `data-theme` | `"dark"` | `"dark"` or `"light"` |
| `data-placeholder` | `"Ask a question..."` | Textarea placeholder |
| `data-sound` | `"true"` | Play soft audio chime on response (`"true"`/`"false"`) |
| `data-persist` | `"true"` | Save conversation across page reloads (`"true"`/`"false"`) |
| `data-auto-open` | `"0"` | Auto-open chat after milliseconds (e.g. `"5000"`) |

---

## 🎮 JavaScript Control API

The widget exposes a global `window.ChatbotWidget` object that you can control from anywhere in your page or app:

```javascript
// Open or close
ChatbotWidget.open();
ChatbotWidget.close();
ChatbotWidget.toggle();

// Expand to large / wide view, or shrink to standard view
ChatbotWidget.expand();
ChatbotWidget.shrink();

// Send a programmatic message
ChatbotWidget.send("What can you do?");

// Reset / clear conversation
ChatbotWidget.clear();
```

---

## 📦 Integration Guides

### 1. In Node.js / Express Web Applications

Serve `chatbot-widget.js` as a static file in Express:

```javascript
// server.js
const express = require('express');
const app = express();

// Serve the widget script as static
app.use(express.static('public'));

app.listen(3000, () => console.log('Server running on port 3000'));
```

Then in your EJS / Pug / HTML template:
```html
<script src="/chatbot-widget.js"
  data-agent-url="https://agent-nerdagent-123-6b2m3i11.local.nerdagent.ai/invocations"
  data-agent-key="YOUR_AGENT_KEY"
  data-title="AI Assistant">
</script>
```

---

### 2. In React / Next.js

In Next.js (App Router or Pages Router):

```jsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="/chatbot-widget.js"
          strategy="lazyOnload"
          data-agent-url="https://agent-nerdagent-123-6b2m3i11.local.nerdagent.ai/invocations"
          data-agent-key="DT_v_ir4LTZuHUokY4oUrIBHz6PGbvi-Enx8bA_9DuPMyk"
          data-title="ShopAI Assistant"
        />
      </body>
    </html>
  );
}
```

---

## 🛡️ Note on Direct Browser Requests & Backend CORS

When calling your deployed agent URL directly from client-side JavaScript on external websites, the browser will issue a preflight `OPTIONS` request.

To allow your deployed agent (`https://agent-nerdagent-123-6b2m3i11.local.nerdagent.ai/invocations`) to accept requests from **any website**, ensure CORS middleware is enabled on your backend (e.g. in `AgentService/app/main.py`):

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all host websites to embed the widget
    allow_credentials=True,
    allow_methods=["*"],  # Allows OPTIONS, POST, GET
    allow_headers=["*"],  # Allows agent-key, Content-Type, accept
)
```

If CORS is not yet enabled on the agent backend, the widget will automatically route requests through your local proxy (`/api/chat` or `server.py`).
