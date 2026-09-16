import { useState } from 'react';
import { ArrowRight, Clock3, Mail, MapPin, Phone, Send, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import { apiRequest } from '../config/api';

const topics = ['Website support', 'Civic issue help', 'Partnership', 'Feedback', 'Other'];
const initialForm = { name: '', email: '', phone: '', topic: 'Website support', message: '' };

export default function ContactPage({ isAuthenticated = false, user = null, onLogout = () => {} }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isSending, setIsSending] = useState(false);
  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', text: '' });
    setIsSending(true);
    try {
      await apiRequest('/contact', { method: 'POST', body: JSON.stringify(form) });
      setForm(initialForm);
      setStatus({ type: 'success', text: 'Message received. Our civic support team will review it shortly.' });
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
    } finally {
      setIsSending(false);
    }
  };

  return <div className="contact-page min-h-screen bg-[#f6f8f7] text-slate-900"><Navbar isAuthenticated={isAuthenticated} user={user} onLogout={onLogout} /><main className="contact-main"><section className="contact-hero"><div className="contact-hero-copy"><p className="contact-eyebrow"><span /> SmartCity support desk</p><h1>Let’s make the city work <em>better together.</em></h1><p className="contact-hero-description">Questions about the platform, a report that needs attention, or an idea for your community? Send a note to the team behind Civic Intelligence.</p><div className="contact-trust"><ShieldCheck size={17} /><span>Your message is routed securely to the SmartCity team.</span></div></div><div className="contact-hero-image"><img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=85&w=1200" alt="Civic operations team collaborating in a bright workspace" /><div className="contact-image-caption"><span>One team. Every civic signal.</span><strong>We listen, then act.</strong></div></div></section><section className="contact-content"><div className="contact-details"><p className="contact-eyebrow"><span /> Reach the team</p><h2>Have something to share?</h2><p className="contact-details-intro">Choose the path that best describes your message. Every conversation helps us improve the civic experience.</p><div className="contact-detail-list"><a href="mailto:ijjimadhu@gmail.com"><span><Mail size={18} /></span><div><small>Email us</small><strong>ijjimadhu@gmail.com</strong></div></a><div><span><Phone size={18} /></span><div><small>Contact person</small><strong>Ijji Madhu Venkat</strong></div></div><div><span><Clock3 size={18} /></span><div><small>Response window</small><strong>Mon–Fri · 9:00 AM–6:00 PM</strong></div></div><div><span><MapPin size={18} /></span><div><small>Operations studio</small><strong>Vijayawada</strong></div></div></div></div><form className="contact-form" onSubmit={submit}><div className="contact-form-heading"><div><p className="contact-eyebrow"><span /> Write to us</p><h2>Start a conversation</h2></div><Send size={20} /></div><div className="contact-form-grid"><label><span>Your name</span><input required name="name" value={form.name} onChange={updateField} placeholder="Alex Morgan" /></label><label><span>Email address</span><input required type="email" name="email" value={form.email} onChange={updateField} placeholder="alex@example.com" /></label><label><span>Phone <small>Optional</small></span><input name="phone" value={form.phone} onChange={updateField} placeholder="+1 555 000 0000" /></label><label><span>What can we help with?</span><select name="topic" value={form.topic} onChange={updateField}>{topics.map((topic) => <option key={topic}>{topic}</option>)}</select></label></div><label className="contact-message-field"><span>Your message</span><textarea required name="message" value={form.message} onChange={updateField} minLength="10" maxLength="2000" rows="6" placeholder="Tell us what you need help with..." /></label>{status.text && <p className={`contact-form-status contact-form-status-${status.type}`}>{status.text}</p>}<button type="submit" disabled={isSending} className="contact-submit">{isSending ? 'Sending message...' : 'Send message'} <ArrowRight size={16} /></button></form></section></main></div>;
}
