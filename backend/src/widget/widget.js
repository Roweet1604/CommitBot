(function () {
  const botId = document.currentScript.getAttribute('data-bot-id');
  const apiUrl = document.currentScript.getAttribute('data-api-url') || 'http://localhost:5000';

  if (!botId) {
    console.error('CommitBot: data-bot-id is required');
    return;
  }

  fetch(`${apiUrl}/api/chat/${botId}/config`)
    .then(res => res.json())
    .then(config => injectWidget(config))
    .catch(err => console.error('CommitBot failed to load:', err));

  function injectWidget(config) {
    const a = config.appearance;
    const botName = a.botDisplayName || config.name || 'Assistant';
    const position = a.widgetPosition || 'bottom-right';
    const isLeft = position === 'bottom-left';
    const iconSize = a.iconSize === 'small' ? 44 : a.iconSize === 'large' ? 64 : 52;
    const iconRadius = a.iconShape === 'rounded' ? '30%' : '50%';
    const pulse = a.pulseAnimation === true;

    const icons = {
      chat: `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.06L2 22l4.94-1.37C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.66 0-3.21-.49-4.5-1.33l-.32-.2-3.33.93.93-3.33-.2-.32C3.49 15.21 3 13.66 3 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9z"/></svg>`,
      question: `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>`,
      smiley: `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>`,
      custom: a.logoUrl ? `<img src="${a.logoUrl}" style="width:60%;height:60%;object-fit:contain;border-radius:4px" />` : `<svg viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>`
    }

    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes sitebotPulse {
        0% { box-shadow: 0 0 0 0 ${a.bubbleColor}66; }
        70% { box-shadow: 0 0 0 12px ${a.bubbleColor}00; }
        100% { box-shadow: 0 0 0 0 ${a.bubbleColor}00; }
      }
      @keyframes sitebotBounce {
        0%,60%,100% { transform: translateY(0); }
        30% { transform: translateY(-5px); }
      }
      #sitebot-bubble {
        position: fixed;
        bottom: 24px;
        ${isLeft ? 'left: 24px;' : 'right: 24px;'}
        width: ${iconSize}px;
        height: ${iconSize}px;
        border-radius: ${iconRadius};
        background: ${a.bubbleColor};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: transform 0.2s, opacity 0.2s;
        ${pulse ? `animation: sitebotPulse 2s infinite;` : ''}
        box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      }
      #sitebot-bubble:hover { transform: scale(1.08); }
      #sitebot-bubble svg, #sitebot-bubble img { width: 55%; height: 55%; }
      #sitebot-window {
        position: fixed;
        bottom: ${iconSize + 36}px;
        ${isLeft ? 'left: 24px;' : 'right: 24px;'}
        width: 348px;
        height: 500px;
        border-radius: 16px;
        overflow: hidden;
        display: none;
        flex-direction: column;
        z-index: 9998;
        font-family: 'Inter', -apple-system, sans-serif;
        box-shadow: 0 12px 40px rgba(0,0,0,0.25);
        border: 1px solid rgba(255,255,255,0.08);
      }
      #sitebot-window.open { display: flex; }
      #sitebot-header {
        background: ${a.bubbleColor};
        padding: 14px 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      #sitebot-header-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; flex-shrink: 0; }
      #sitebot-header-name { font-size: 14px; font-weight: 600; color: white; flex: 1; }
      #sitebot-close { color: rgba(255,255,255,0.6); cursor: pointer; font-size: 18px; line-height: 1; background: none; border: none; padding: 0 2px; }
      #sitebot-close:hover { color: white; }
      #sitebot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: ${a.backgroundColor};
      }
      #sitebot-messages::-webkit-scrollbar { width: 4px; }
      #sitebot-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
      .sitebot-msg {
        max-width: 82%;
        padding: 9px 13px;
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.55;
        word-break: break-word;
      }
      .sitebot-msg.bot {
        background: rgba(0,0,0,0.06);
        color: ${a.fontColor};
        align-self: flex-start;
        border-bottom-left-radius: 3px;
      }
      .sitebot-msg.user {
        background: ${a.bubbleColor};
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 3px;
      }
      .sitebot-typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px; }
      .sitebot-typing span {
        width: 6px; height: 6px;
        background: rgba(0,0,0,0.2);
        border-radius: 50%;
        animation: sitebotBounce 1.2s infinite;
      }
      .sitebot-typing span:nth-child(2) { animation-delay: 0.2s; }
      .sitebot-typing span:nth-child(3) { animation-delay: 0.4s; }
      #sitebot-input-area {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        gap: 8px;
        border-top: 1px solid rgba(0,0,0,0.08);
        background: ${a.backgroundColor};
        flex-shrink: 0;
      }
      #sitebot-input {
        flex: 1;
        padding: 9px 14px;
        border: 1px solid rgba(0,0,0,0.1);
        border-radius: 24px;
        font-size: 13px;
        outline: none;
        background: rgba(0,0,0,0.04);
        color: ${a.fontColor};
        font-family: inherit;
      }
      #sitebot-input:focus { border-color: ${a.bubbleColor}; }
      #sitebot-send {
        width: 34px; height: 34px;
        border-radius: 50%;
        background: ${a.bubbleColor};
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
        transition: opacity 0.2s;
      }
      #sitebot-send:hover { opacity: 0.85; }
      #sitebot-footer {
        text-align: center;
        padding: 6px;
        font-size: 10px;
        color: rgba(0,0,0,0.25);
        background: ${a.backgroundColor};
        flex-shrink: 0;
      }
      #sitebot-footer a { color: rgba(0,0,0,0.3); text-decoration: none; }
    `;
    document.head.appendChild(style);

    const bubble = document.createElement('div');
    bubble.id = 'sitebot-bubble';
    bubble.innerHTML = icons[a.widgetIcon || 'chat'];
    document.body.appendChild(bubble);

    const win = document.createElement('div');
    win.id = 'sitebot-window';
    win.innerHTML = `
      <div id="sitebot-header">
        <div id="sitebot-header-dot"></div>
        <div id="sitebot-header-name">${botName}</div>
        <button id="sitebot-close">✕</button>
      </div>
      <div id="sitebot-messages">
        <div class="sitebot-msg bot">${config.greetingMessage}</div>
        ${a.awayMessage ? `<div class="sitebot-msg bot" style="opacity:0.6;font-style:italic">${a.awayMessage}</div>` : ''}
      </div>
      <div id="sitebot-input-area">
        <input id="sitebot-input" type="text" placeholder="Type a message..." />
        <button id="sitebot-send">↑</button>
      </div>
      <div id="sitebot-footer">Powered by <a href="#" target="_blank">CommitBot</a></div>
    `;
    document.body.appendChild(win);

    bubble.addEventListener('click', () => win.classList.toggle('open'));
    document.getElementById('sitebot-close').addEventListener('click', () => win.classList.remove('open'));

    const input = document.getElementById('sitebot-input');
    const sendBtn = document.getElementById('sitebot-send');
    const messages = document.getElementById('sitebot-messages');

    const addMessage = (text, sender) => {
      const msg = document.createElement('div');
      msg.className = `sitebot-msg ${sender}`;
      msg.textContent = text;
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    };

    const showTyping = () => {
      const t = document.createElement('div');
      t.className = 'sitebot-msg bot sitebot-typing';
      t.id = 'sitebot-typing';
      t.innerHTML = '<span></span><span></span><span></span>';
      messages.appendChild(t);
      messages.scrollTop = messages.scrollHeight;
    };

    const sendMessage = async () => {
      const text = input.value.trim();
      if (!text) return;
      addMessage(text, 'user');
      input.value = '';
      showTyping();
      try {
        const res = await fetch(`${apiUrl}/api/chat/${botId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        document.getElementById('sitebot-typing')?.remove();
        addMessage(data.reply, 'bot');
      } catch (err) {
        document.getElementById('sitebot-typing')?.remove();
        addMessage('Sorry, something went wrong. Please try again.', 'bot');
      }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
  }
})();