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

  // Initialize when DOM is ready
  function init() {
    console.log('[Doggy Widget] Initializing...');

    // Create host element
    const host = document.createElement('div');
    host.id = 'doggy-chat-widget-host';
    document.body.appendChild(host);

    // Attach Shadow DOM
    const shadow = host.attachShadow({ mode: 'open' });
    console.log('[Doggy Widget] Shadow DOM attached');

    // Add Google Fonts to shadow DOM first
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap';
    shadow.appendChild(fontLink);

    // Fetch and inject CSS
    fetch(baseUrl + '/style.css')
      .then(response => response.text())
      .then(css => {
        console.log('[Doggy Widget] CSS loaded');
        const style = document.createElement('style');
        style.textContent = css;
        shadow.appendChild(style);

        // Fetch and inject HTML
        return fetch(baseUrl + '/widget-frame.html');
      })
      .then(response => response.text())
      .then(html => {
        console.log('[Doggy Widget] HTML loaded');
        // Parse HTML to extract body content only
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Get the widget HTML (everything in body except script tags)
        const bodyContent = doc.body.cloneNode(true);

        // Remove script tags from the cloned content
        const scripts = bodyContent.querySelectorAll('script');
        scripts.forEach(script => script.remove());

        // Also remove the inline style tag
        const styles = bodyContent.querySelectorAll('style');
        styles.forEach(style => style.remove());

        // Append the HTML to shadow DOM
        shadow.appendChild(bodyContent);

        // Now execute the widget JavaScript in the context of the shadow DOM
        console.log('[Doggy Widget] Initializing widget script...');
        initWidget(shadow, baseUrl);
      })
      .catch(error => {
        console.error('[Doggy Widget] Failed to load:', error);
      });
  }

  function initWidget(shadow, baseUrl) {
    const API_URL = "https://n8n.clearlightai.com/webhook/d4160ce2-2f66-47eb-bb9a-e9ab5039b708/chat";
    const ROUTE = "general";

    function getChatId() {
      let id = sessionStorage.getItem("chatId");
      if (!id) {
        id = "chat_" + Math.random().toString(36).substring(2, 10);
        sessionStorage.setItem("chatId", id);
      }
      return id;
    }

    const chatId = getChatId();
    const bubble = shadow.querySelector("#chat-bubble");
    const widget = shadow.querySelector("#chatWidget");
    const sendBtn = shadow.querySelector("#sendBtn");
    const input = shadow.querySelector("#user-input");
    const messages = shadow.querySelector("#chat-messages");
    const expandBtn = shadow.querySelector("#expandChatBtn");

    console.log('[Doggy Widget] Elements found:', {
      bubble: !!bubble,
      widget: !!widget,
      sendBtn: !!sendBtn,
      input: !!input,
      messages: !!messages,
      expandBtn: !!expandBtn
    });

    const chatIconSVG = `
      <svg viewBox="0 0 24 24"><path d="M12 3C6.48 3 2 6.92 2 12c0 2.38 1.05 4.52 2.81 6.17L4 22l4.2-1.82c1.04.29 2.13.45 3.27.45 5.52 0 10-3.92 10-9s-4.48-9-10-9z"/></svg>
    `;
    const closeIconSVG = `
      <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
    `;

    let isChatOpen = false;

    bubble.addEventListener("click", () => {
      // If in fullscreen mode, exit fullscreen instead of closing widget
      if (widget.classList.contains("fullscreen")) {
        widget.classList.remove("fullscreen");
        bubble.classList.remove("moved-top");
        expandBtn.textContent = "⤢";
        return;
      }

      isChatOpen = !isChatOpen;
      if (isChatOpen) {
        widget.classList.add("open");
        bubble.classList.add("active");
        bubble.innerHTML = closeIconSVG;

        if (messages.children.length === 0) {
          addBotMessage("Hey! \uD83D\uDC4B Need help with your dog?");
        }
        input.focus();
      } else {
        widget.classList.remove("open");
        widget.classList.remove("fullscreen");
        bubble.classList.remove("moved-top");
        expandBtn.textContent = "⤢";
        bubble.classList.remove("active");
        bubble.innerHTML = chatIconSVG;
      }
    });

    expandBtn.addEventListener("click", () => {
      widget.classList.toggle("fullscreen");
      bubble.classList.toggle("moved-top");
      expandBtn.textContent = widget.classList.contains("fullscreen") ? "⤡" : "⤢";
    });

    function renderMarkdown(markdownText) {
      let html = markdownText;
      html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
      html = html.replace(/^\* (.*$)/gm, "<li>$1</li>");
      html = html.replace(/(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/gs, "<ul>$1</ul>");
      html = html.replace(/\n/g, "<br>");
      return html;
    }

    function addUserMessage(text) {
      addMessage(text, "user");
    }

    function addBotMessage(text) {
      return addMessage(text, "bot");
    }

    function addMessage(text, sender) {
      const div = document.createElement("div");
      div.className = "message " + sender;
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
      return div;
    }

    function showTypingDots() {
      const div = document.createElement("div");
      div.id = "typingDots";
      div.className = "message bot typing-indicator";
      div.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      `;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function hideTypingDots() {
      const el = shadow.querySelector("#typingDots");
      if (el) el.remove();
    }

    async function streamText(messageElement, text, speed = 3) {
      messageElement.textContent = "";
      let accumulatedText = "";

      for (let i = 0; i < text.length; i++) {
        accumulatedText += text[i];
        messageElement.innerHTML = renderMarkdown(accumulatedText);
        messages.scrollTop = messages.scrollHeight;
        await new Promise((res) => setTimeout(res, speed));
      }

      setTimeout(() => {
        let html = messageElement.innerHTML;
        // Remove excessive breaks (3+) but preserve double breaks for paragraphs
        html = html.replace(/(<br\s*\/?>\s*){3,}/gi, "<br><br>");
        html = html.trim();
        messageElement.innerHTML = html;
      }, 100);
    }

    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });

    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;

      addUserMessage(text);
      input.value = "";
      input.disabled = true;
      sendBtn.disabled = true;

      showTypingDots();

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ chatId, message: text, route: ROUTE }),
        });

        if (!res.ok) throw new Error("Server error");
        const data = await res.json();
        hideTypingDots();

        let reply = data.reply || data.output || data.response || "Sorry, I didn't get that.";
        const botBubble = addBotMessage("");
        streamText(botBubble, reply, 3);
      } catch (err) {
        hideTypingDots();
        addBotMessage("Unable to connect. Please try again.");
      } finally {
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
