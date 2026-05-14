import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Chatbot.css';

// ── Enhanced conversation flow with support topics ────────────────────────────
const MAIN_MENU_CHOICES = ['🛍️ Shop Products', '📦 Order Tracking', '🔄 Return Policy', '📞 Contact Us', '💬 General Help'];

const SHOP_FLOW = [
  { id: 'shop_category', bot: "Great choice! What category are you interested in?", type: 'choice', choices: ['Sarees', 'Dupattas', 'Dress Materials', 'Running Fabric', 'Surprise me!'] },
  { id: 'shop_budget', bot: "Perfect! What's your budget range?", type: 'choice', choices: ['Under ₹500', '₹500 – ₹1,500', '₹1,500 – ₹3,000', '₹3,000 – ₹6,000', '₹6,000+'] },
  { id: 'shop_result', bot: null, type: 'result' },
];

const BUDGET_MAP = {
  'Under ₹500': [0, 500],
  '₹500 – ₹1,500': [500, 1500],
  '₹1,500 – ₹3,000': [1500, 3000],
  '₹3,000 – ₹6,000': [3000, 6000],
  '₹6,000+': [6000, 99999],
};

const SUPPORT_RESPONSES = {
  '📦 Order Tracking': {
    text: "📦 To track your order:\n\n1. Go to 'My Profile' → 'My Orders'\n2. Or visit our Track Order page\n3. Enter your Order ID to see live status\n\nNeed more help with an order?",
    link: '/track',
    linkText: 'Track My Order →'
  },
  '🔄 Return Policy': {
    text: "🔄 Our Return Policy:\n\n✅ 7-day easy returns from delivery\n✅ Items must be unworn & with tags\n✅ Free return pickup in most cities\n✅ Refund within 5-7 business days\n\nFor full details, visit our Return Policy page.",
    link: '/return-policy',
    linkText: 'View Full Policy →'
  },
  '📞 Contact Us': {
    text: "📞 Reach out to us:\n\n📱 Phone: 8897270798\n📧 Email: srihastikala@gmail.com\n📍 Location: Srikalahasthi, Andhra Pradesh, India\n\n⏰ Available: Mon–Sat, 10 AM – 7 PM IST\n\nWe'd love to hear from you!"
  },
  '💬 General Help': {
    text: "💬 Here are some things I can help with:\n\n🛍️ Browse & shop products\n📦 Track your orders\n🔄 Returns & exchange info\n📐 Size guide assistance\n🚚 Shipping information\n📞 Contact our team\n\nWhat would you like to know more about?",
    choices: ['📐 Size Guide', '🚚 Shipping Info', '❓ FAQ']
  },
  '📐 Size Guide': {
    text: "📐 Need help with sizing?\n\nOur detailed Size Guide has measurements for all categories. We recommend measuring your body and comparing with our size chart for the perfect fit!",
    link: '/size-guide',
    linkText: 'Open Size Guide →'
  },
  '🚚 Shipping Info': {
    text: "🚚 Shipping Details:\n\n✅ Free shipping on orders above ₹999\n✅ Standard delivery: 5-7 business days\n✅ Express delivery available in select cities\n✅ Pan-India delivery via trusted couriers\n\nFor full details:",
    link: '/shipping-info',
    linkText: 'View Shipping Info →'
  },
  '❓ FAQ': {
    text: "❓ Check our FAQ section for answers to common questions about orders, payments, sizing, and more!",
    link: '/faq',
    linkText: 'Browse FAQ →'
  },
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState('menu'); // 'menu', 'shopping', 'support'
  const [shopStep, setShopStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputVal, setInputVal] = useState('');
  const [typing, setTyping] = useState(false);
  const [currentChoices, setCurrentChoices] = useState([]);
  const endRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

  const addBotMsg = useCallback((text, delay = 600, extras = {}) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { from: 'bot', text, ...extras }]);
    }, delay);
  }, []);

  const startChat = useCallback(() => {
    setMessages([]);
    setMode('menu');
    setShopStep(0);
    setAnswers({});
    setCurrentChoices(MAIN_MENU_CHOICES);
    addBotMsg("Welcome to ApsarasFashions! 🙏✨ How can we help you today?", 400);
  }, [addBotMsg]);

  useEffect(() => {
    if (open && messages.length === 0) startChat();
  }, [open, messages.length, startChat]);

  useEffect(() => { scrollToBottom(); }, [messages, typing]);

  const handleMenuChoice = (text) => {
    setMessages(prev => [...prev, { from: 'user', text }]);

    if (text === '🛍️ Shop Products') {
      setMode('shopping');
      setShopStep(0);
      setCurrentChoices(SHOP_FLOW[0].choices);
      addBotMsg(SHOP_FLOW[0].bot);
      return;
    }

    const response = SUPPORT_RESPONSES[text];
    if (response) {
      setMode('support');
      addBotMsg(response.text, 800, {
        link: response.link,
        linkText: response.linkText,
      });
      if (response.choices) {
        setTimeout(() => setCurrentChoices(response.choices), 1000);
      } else {
        setTimeout(() => setCurrentChoices(['🏠 Main Menu', ...MAIN_MENU_CHOICES.filter(c => c !== text)]), 1000);
      }
      return;
    }

    // Handle sub-support items
    if (text === '🏠 Main Menu') {
      setMode('menu');
      setCurrentChoices(MAIN_MENU_CHOICES);
      addBotMsg("Back to main menu! What else can I help you with? 😊");
      return;
    }

    // Fallback
    setCurrentChoices(MAIN_MENU_CHOICES);
    addBotMsg("I'm not sure about that. Let me show you what I can help with! 😊");
  };

  const handleShopReply = (text) => {
    setMessages(prev => [...prev, { from: 'user', text }]);
    const currentFlow = SHOP_FLOW[shopStep];
    const newAnswers = { ...answers, [currentFlow.id]: text };
    setAnswers(newAnswers);

    const next = shopStep + 1;
    if (next >= SHOP_FLOW.length - 1) {
      // Show result
      setShopStep(SHOP_FLOW.length - 1);
      const category = newAnswers['shop_category'] === 'Surprise me!' ? '' : newAnswers['shop_category'];
      const [min, max] = BUDGET_MAP[newAnswers['shop_budget']] || [0, 99999];

      setTimeout(() => setTyping(true), 400);
      setTimeout(() => {
        setTyping(false);
        setMessages(prev => [...prev, {
          from: 'bot',
          text: `✨ Based on your preferences, I've found some amazing picks for you!`,
          isResult: true,
          category,
          minPrice: min,
          maxPrice: max,
        }]);
        setCurrentChoices(['🏠 Main Menu', '🛍️ Shop Again']);
      }, 1200);
    } else {
      setShopStep(next);
      setCurrentChoices(SHOP_FLOW[next].choices);
      addBotMsg(SHOP_FLOW[next].bot);
    }
  };

  const handleUserReply = (text) => {
    if (text === '🏠 Main Menu') {
      setMessages(prev => [...prev, { from: 'user', text }]);
      setMode('menu');
      setShopStep(0);
      setAnswers({});
      setCurrentChoices(MAIN_MENU_CHOICES);
      addBotMsg("Back to main menu! What else can I help you with? 😊");
      return;
    }
    if (text === '🛍️ Shop Again') {
      setMessages(prev => [...prev, { from: 'user', text }]);
      setMode('shopping');
      setShopStep(0);
      setAnswers({});
      setCurrentChoices(SHOP_FLOW[0].choices);
      addBotMsg(SHOP_FLOW[0].bot);
      return;
    }

    if (mode === 'shopping') {
      handleShopReply(text);
    } else {
      handleMenuChoice(text);
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const text = inputVal.trim();
    setInputVal('');
    setMessages(prev => [...prev, { from: 'user', text }]);
    
    // Smart keyword detection
    const lower = text.toLowerCase();
    if (lower.includes('track') || lower.includes('order') || lower.includes('delivery')) {
      handleMenuChoice('📦 Order Tracking');
    } else if (lower.includes('return') || lower.includes('refund') || lower.includes('exchange')) {
      handleMenuChoice('🔄 Return Policy');
    } else if (lower.includes('contact') || lower.includes('phone') || lower.includes('email') || lower.includes('call')) {
      handleMenuChoice('📞 Contact Us');
    } else if (lower.includes('size') || lower.includes('measurement')) {
      handleMenuChoice('📐 Size Guide');
    } else if (lower.includes('ship') || lower.includes('deliver')) {
      handleMenuChoice('🚚 Shipping Info');
    } else if (lower.includes('saree') || lower.includes('dupatta') || lower.includes('dress') || lower.includes('shop') || lower.includes('buy')) {
      handleMenuChoice('🛍️ Shop Products');
    } else {
      addBotMsg("Thanks for your message! Let me connect you to the right help. 😊", 600);
      setTimeout(() => setCurrentChoices(MAIN_MENU_CHOICES), 800);
    }
  };

  const handleViewProducts = (msg) => {
    const params = new URLSearchParams();
    if (msg.category) params.set('category', msg.category);
    if (msg.minPrice) params.set('minPrice', msg.minPrice);
    if (msg.maxPrice) params.set('maxPrice', msg.maxPrice);
    navigate(`/products?${params.toString()}`);
    setOpen(false);
  };

  const handleLinkClick = (link) => {
    navigate(link);
    setOpen(false);
  };

  return (
    <>
      {/* Toggle button */}
      <button className={`chatbot-toggle ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} aria-label="Open Chatbot" id="chatbot-toggle">
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && <span className="chatbot-badge">1</span>}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chatbot-window" id="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-avatar">
              <Bot size={20} />
            </div>
            <div>
              <p className="chatbot-header-name">ApsarasFashions</p>
              <p className="chatbot-header-status">🟢 Online · Here to help</p>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)} aria-label="Close chatbot"><X size={18} /></button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.from}`}>
                {msg.from === 'bot' && (
                  <div className="bot-avatar"><Bot size={14} /></div>
                )}
                <div className="chat-bubble">
                  <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                  {msg.isResult && (
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 10, width: '100%' }} onClick={() => handleViewProducts(msg)}>
                      View Recommendations →
                    </button>
                  )}
                  {msg.link && (
                    <button className="btn btn-outline btn-sm" style={{ marginTop: 10, width: '100%', fontSize: '0.78rem' }} onClick={() => handleLinkClick(msg.link)}>
                      {msg.linkText || 'Learn More →'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="chat-msg bot">
                <div className="bot-avatar"><Bot size={14} /></div>
                <div className="chat-bubble typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Choices or input */}
          <div className="chatbot-input-area">
            {!typing && currentChoices.length > 0 && (
              <div className="chat-choices">
                {currentChoices.map(c => (
                  <button key={c} className="choice-btn" onClick={() => handleUserReply(c)}>{c}</button>
                ))}
              </div>
            )}
            <form onSubmit={handleInputSubmit} className="chat-input-form" style={{ marginTop: currentChoices.length > 0 ? 8 : 0 }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                className="chat-text-input"
                id="chatbot-input"
              />
              <button type="submit" className="chat-send-btn" aria-label="Send message"><Send size={16} /></button>
            </form>
            <button className="chatbot-restart" onClick={startChat} title="Restart conversation">
              <RotateCcw size={14} /> Start Over
            </button>
          </div>
        </div>
      )}
    </>
  );
}
