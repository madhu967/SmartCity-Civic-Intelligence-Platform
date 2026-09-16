import { useState } from 'react';
import { Bot, LoaderCircle, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { apiRequest, getAuthHeaders } from '../config/api';

const guestSuggestions = ['How does SmartCity work?', 'How do I report a pothole?', 'What issue categories can I report?'];
const memberSuggestions = ['How do I report an issue?', 'What does In progress mean?', 'How does AI issue detection work?'];

export default function CivicChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi, I am Civic AI. Ask me how SmartCity works, how to report an issue, or what your dashboard status means.' }]);

  const suggestions = localStorage.getItem('smart_city_token') ? memberSuggestions : guestSuggestions;

  const sendMessage = async (event, suggestedMessage = '') => {
    event?.preventDefault();
    const content = (suggestedMessage || input).trim();
    if (!content || isSending) return;

    const history = messages.slice(-8);
    setInput('');
    setError('');
    setMessages((current) => [...current, { role: 'user', content }]);
    setIsSending(true);
    try {
      const data = await apiRequest('/chat', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: content, messages: history }),
      });
      setMessages((current) => [...current, { role: 'assistant', content: data.reply }]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSending(false);
    }
  };

  return <div className="civic-chatbot">
    {isOpen && <section className="civic-chat-window" aria-label="Civic AI chat">
      <header className="civic-chat-header"><div className="civic-chat-brand"><span className="civic-chat-brand-icon"><Bot size={18} /></span><div><strong>Civic AI</strong><small>SmartCity guide</small></div></div><button type="button" className="civic-chat-close" onClick={() => setIsOpen(false)} aria-label="Close Civic AI"><X size={18} /></button></header>
      <div className="civic-chat-messages">{messages.map((message, index) => <div className={`civic-chat-message civic-chat-message-${message.role}`} key={`${message.role}-${index}`}><span>{message.role === 'assistant' ? <Bot size={14} /> : 'You'}</span><p>{message.content}</p></div>)}{isSending && <div className="civic-chat-message civic-chat-message-assistant"><span><Bot size={14} /></span><p className="civic-chat-typing"><i /><i /><i /></p></div>}</div>
      {messages.length === 1 && <div className="civic-chat-suggestions">{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => sendMessage(null, suggestion)}><Sparkles size={13} /> {suggestion}</button>)}</div>}
      {error && <p className="civic-chat-error">{error}</p>}
      <form className="civic-chat-composer" onSubmit={sendMessage}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask Civic AI..." maxLength={1200} aria-label="Message Civic AI" /><button type="submit" disabled={isSending || !input.trim()} aria-label="Send message">{isSending ? <LoaderCircle className="civic-chat-spin" size={17} /> : <Send size={17} />}</button></form>
    </section>}
    <button type="button" className={`civic-chat-launcher ${isOpen ? 'civic-chat-launcher-open' : ''}`} onClick={() => setIsOpen((current) => !current)} aria-label={isOpen ? 'Close Civic AI' : 'Ask Civic AI'}><span className="civic-chat-launcher-pulse" /><span className="civic-chat-launcher-orbit civic-chat-launcher-orbit-one" /><span className="civic-chat-launcher-orbit civic-chat-launcher-orbit-two" /><span className="civic-chat-launcher-icon">{isOpen ? <X size={28} /> : <span className="civic-robot" aria-hidden="true"><i className="civic-robot-antenna" /><i className="civic-robot-head"><b /><b /></i><i className="civic-robot-ear civic-robot-ear-left" /><i className="civic-robot-ear civic-robot-ear-right" /><i className="civic-robot-body"><b /><b /></i><i className="civic-robot-arm civic-robot-arm-left" /><i className="civic-robot-arm civic-robot-arm-right" /></span>}</span><span className="civic-chat-launcher-status" /><span className="civic-chat-launcher-label">Ask Civic AI</span></button>
  </div>;
}
