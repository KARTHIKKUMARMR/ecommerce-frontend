import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Chatbot.css';

const FLOW = [
  { id: 'welcome', bot: "Namaste! 🙏 Welcome to Handkala! I'm your personal style assistant. What are you looking for today?", type: 'choice', choices: ['Kurtis', 'Sarees', 'Earrings', 'Bangles', 'Surprise me!'] },
  { id: 'size', bot: "Lovely choice! What size do you usually wear?", type: 'choice', choices: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'] },
  { id: 'budget', bot: "Perfect! What's your budget range?", type: 'choice', choices: ['Under ₹500', '₹500 – ₹1,500', '₹1,500 – ₹3,000', '₹3,000 – ₹6,000', '₹6,000+'] },
  { id: 'location', bot: "Great! Which city are you ordering from? We deliver across India 🇮🇳", type: 'input' },
  { id: 'result', bot: null, type: 'result' },
];

const BUDGET_MAP = {
  'Under ₹500': [0, 500],
  '₹500 – ₹1,500': [500, 1500],
  '₹1,500 – ₹3,000': [1500, 3000],
  '₹3,000 – ₹6,000': [3000, 6000],
  '₹6,000+': [6000, 99999],
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputVal, setInputVal] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

  const addBotMsg = useCallback((text, delay = 600) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { from: 'bot', text }]);
    }, delay);
  }, []);

  const startChat = useCallback(() => {
    setMessages([]);
    setStep(0);
    setAnswers({});
    const q = FLOW[0];
    addBotMsg(q.bot, 400);
  }, [addBotMsg]);

  useEffect(() => {
    if (open && messages.length === 0) startChat();
  }, [open, messages.length, startChat]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleUserReply = (text) => {
    setMessages(prev => [...prev, { from: 'user', text }]);

    const currentFlow = FLOW[step];
    const newAnswers = { ...answers, [currentFlow.id]: text };
    setAnswers(newAnswers);

    const next = step + 1;
    if (next >= FLOW.length - 1) {
      // Show result
      setStep(FLOW.length - 1);
      const category = newAnswers['welcome'] === 'Surprise me!' ? '' : newAnswers['welcome'];
      const [min, max] = BUDGET_MAP[newAnswers['budget']] || [0, 99999];
      const city = newAnswers['location'] || 'your city';

      setTimeout(() => setTyping(true), 400);
      setTimeout(() => {
        setTyping(false);
        setMessages(prev => [...prev, {
          from: 'bot',
          text: `We deliver to ${city}! 🎉 Based on your preferences, I've found some amazing picks for you!`,
          isResult: true,
          category,
          minPrice: min,
          maxPrice: max,
        }]);
      }, 1200);
    } else {
      setStep(next);
      addBotMsg(FLOW[next].bot);
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    handleUserReply(inputVal.trim());
    setInputVal('');
  };

  const handleViewProducts = (msg) => {
    const params = new URLSearchParams();
    if (msg.category) params.set('category', msg.category);
    if (msg.minPrice) params.set('minPrice', msg.minPrice);
    if (msg.maxPrice) params.set('maxPrice', msg.maxPrice);
    navigate(`/products?${params.toString()}`);
    setOpen(false);
  };

  const currentFlow = FLOW[Math.min(step, FLOW.length - 1)];

  return (
    <>
      {/* Toggle button */}
      <button className={`chatbot-toggle ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} aria-label="Open Chatbot">
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && <span className="chatbot-badge">1</span>}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-avatar">
              <Bot size={20} />
            </div>
            <div>
              <p className="chatbot-header-name">Handkala Assistant</p>
              <p className="chatbot-header-status">🟢 Online · Here to help</p>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}><X size={18} /></button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.from}`}>
                {msg.from === 'bot' && (
                  <div className="bot-avatar"><Bot size={14} /></div>
                )}
                <div className="chat-bubble">
                  <p>{msg.text}</p>
                  {msg.isResult && (
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={() => handleViewProducts(msg)}>
                      View Recommendations →
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
            {!typing && currentFlow?.type === 'choice' && step < FLOW.length - 1 && (
              <div className="chat-choices">
                {currentFlow.choices.map(c => (
                  <button key={c} className="choice-btn" onClick={() => handleUserReply(c)}>{c}</button>
                ))}
              </div>
            )}
            {!typing && currentFlow?.type === 'input' && step < FLOW.length - 1 && (
              <form onSubmit={handleInputSubmit} className="chat-input-form">
                <input
                  type="text"
                  placeholder="Type your city name..."
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  className="chat-text-input"
                  autoFocus
                />
                <button type="submit" className="chat-send-btn"><Send size={16} /></button>
              </form>
            )}
            {step === FLOW.length - 1 && !typing && (
              <button className="btn btn-outline btn-sm btn-full" onClick={startChat} style={{ margin: '0 12px 12px' }}>
                Start Over 🔄
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
