(function() {
  'use strict';

  // Prevent multiple widget loads
  if (window.DoggyDanChatWidget) {
    return;
  }
  window.DoggyDanChatWidget = true;

  // Get the current script URL to determine the base URL for assets
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  const scriptSrc = currentScript.src;
  const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));

  // Inject CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = baseUrl + '/style.css';
  document.head.appendChild(link);

  // Wait for DOM to be ready
  function initWidget() {
    const API_URL = "https://n8n.clearlightai.com/webhook/d4160ce2-2f66-47eb-bb9a-e9ab5039b708/chat";
    const ROUTE = "general";

    // Create widget HTML
    const widgetHTML = `
      <div id="chat-bubble">
        <svg id="icon-chat" viewBox="0 0 24 24">
          <path d="M12 3C6.48 3 2 6.92 2 12c0 2.38 1.05 4.52 2.81 6.17L4 22l4.2-1.82c1.04.29 2.13.45 3.27.45 5.52 0 10-3.92 10-9s-4.48-9-10-9z"/>
        </svg>
      </div>

      <div class="chat-widget" id="chatWidget">
        <div class="chat-header">
          <img src="${baseUrl}/cropped-final-logo.png" alt="Logo" />
          <strong>Doggy Chat</strong>
          <button class="expand-chat-btn" id="expandChatBtn">⤢</button>
        </div>

        <div id="chat-messages"></div>

        <div class="input-area">
          <input id="user-input" placeholder="Type your message..." />
          <button class="send-btn" id="sendBtn">
            <svg viewBox="0 0 24 24">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
            </svg>
          </button>
        </div>

        <div class="powered-by">
          <svg viewBox="0 0 24 24" style="width: 40px; height: 40px">
            <circle fill="#FFD166" cx="12" cy="12" r="9" />
            <path fill="#EF946C" d="M7 7a4 4 0 015-4M17 7a4 4 0 00-5-4" />
            <ellipse fill="#333" cx="9" cy="11" rx="1.5" ry="2" />
            <ellipse fill="#333" cx="15" cy="11" rx="1.5" ry="2" />
            <circle fill="white" cx="8.8" cy="10.5" r="0.5" />
            <circle fill="white" cx="14.8" cy="10.5" r="0.5" />
            <path fill="#333" d="M12 14a2 2 0 00-2 2h4a2 2 0 00-2-2z" />
            <path fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" d="M9 16c.8 1.2 2.2 2 3.5 2 1.3 0 2.7-.8 3.5-2" />
          </svg>
          Powered by Doggy Dan AI
        </div>
      </div>
    `;

    // Insert widget into body
    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
    document.body.appendChild(container);

    // Widget functionality
    function getChatId() {
      let id = sessionStorage.getItem('chatId');
      if (!id) {
        id = 'chat_' + Math.random().toString(36).substring(2, 10);
        sessionStorage.setItem('chatId', id);
      }
      return id;
    }

    const chatId = getChatId();
    const bubble = document.getElementById('chat-bubble');
    const widget = document.getElementById('chatWidget');
    const sendBtn = document.getElementById('sendBtn');
    const input = document.getElementById('user-input');
    const messages = document.getElementById('chat-messages');
    const expandBtn = document.getElementById('expandChatBtn');

    // Icons
    const chatIconSVG = `
      <svg viewBox="0 0 24 24"><path d="M12 3C6.48 3 2 6.92 2 12c0 2.38 1.05 4.52 2.81 6.17L4 22l4.2-1.82c1.04.29 2.13.45 3.27.45 5.52 0 10-3.92 10-9s-4.48-9-10-9z"/></svg>
    `;
    const closeIconSVG = `
      <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
    `;

    // Toggle chat
    let isChatOpen = false;

    bubble.addEventListener('click', () => {
      // If in fullscreen mode, exit fullscreen instead of closing widget
      if (widget.classList.contains('fullscreen')) {
        widget.classList.remove('fullscreen');
        bubble.classList.remove('moved-top');
        expandBtn.textContent = '⤢';
        return;
      }

      isChatOpen = !isChatOpen;
      if (isChatOpen) {
        widget.classList.add('open');
        bubble.classList.add('active');
        document.body.classList.add('chat-open');
        bubble.innerHTML = closeIconSVG;

        if (messages.children.length === 0) {
          addBotMessage('Hey! 👋 Need help with your dog?');
        }
        input.focus();
      } else {
        widget.classList.remove('open');
        widget.classList.remove('fullscreen');
        bubble.classList.remove('moved-top');
        expandBtn.textContent = '⤢';
        bubble.classList.remove('active');
        document.body.classList.remove('chat-open');
        bubble.innerHTML = chatIconSVG;
      }
    });

    expandBtn.addEventListener('click', () => {
      widget.classList.toggle('fullscreen');
      bubble.classList.toggle('moved-top');
      expandBtn.textContent = widget.classList.contains('fullscreen') ? '⤡' : '⤢';
    });

    function renderMarkdown(markdownText) {
      let html = markdownText;
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
      html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
      html = html.replace(/(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/gs, '<ul>$1</ul>');
      html = html.replace(/\n/g, '<br>');
      return html;
    }

    function addUserMessage(text) {
      addMessage(text, 'user');
    }

    function addBotMessage(text) {
      return addMessage(text, 'bot');
    }

    function addMessage(text, sender) {
      const div = document.createElement('div');
      div.className = 'message ' + sender;

      // Use innerHTML to decode HTML entities (like &#x1f44b; to 👋)
      // This preserves emojis in both user and bot messages
      div.innerHTML = text;

      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
      return div;
    }

    function showTypingDots() {
      const div = document.createElement('div');
      div.id = 'typingDots';
      div.className = 'message bot typing-indicator';
      div.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      `;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function hideTypingDots() {
      const el = document.getElementById('typingDots');
      if (el) el.remove();
    }

    async function streamText(messageElement, text, speed = 3) {
      messageElement.textContent = '';
      let accumulatedText = '';

      for (let i = 0; i < text.length; i++) {
        accumulatedText += text[i];
        messageElement.innerHTML = renderMarkdown(accumulatedText);
        messages.scrollTop = messages.scrollHeight;
        await new Promise((res) => setTimeout(res, speed));
      }

      setTimeout(() => {
        let html = messageElement.innerHTML;
        // Remove excessive breaks (3+) but preserve double breaks for paragraphs
        html = html.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>');
        html = html.trim();
        messageElement.innerHTML = html;
      }, 100);
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;

      addUserMessage(text);
      input.value = '';
      input.disabled = true;
      sendBtn.disabled = true;

      showTypingDots();

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ chatId, message: text, route: ROUTE }),
        });

        if (!res.ok) throw new Error('Server error');
        const data = await res.json();
        hideTypingDots();

        let reply = data.reply || data.output || data.response || "Sorry, I didn't get that.";
        const botBubble = addBotMessage('');

        streamText(botBubble, reply, 15);
      } catch (err) {
        hideTypingDots();
        addBotMessage('Unable to connect. Please try again.');
      } finally {
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
