import { useEffect, useState } from 'react';
import { Activity, ArrowLeft, Bell, ClipboardList, FileImage, FileWarning, Home, LogOut, Menu, UserRound, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { apiRequest, getAuthHeaders } from '../config/api';

const issueCategories = [
  'Roads & Potholes',
  'Garbage & Sanitation',
  'Water Supply',
  'Electricity',
  'Streetlights',
  'Drainage',
  'Traffic',
  'Other',
];

const sidebarPages = [
  ['Overview', Home, '/dashboard'],
  ['Report an issue', FileWarning, '/report-issue'],
  ['My reports', ClipboardList, '/reports'],
  ['Nearby activity', Activity, '/activity'],
  ['Notifications', Bell, '/notifications'],
];

const initialForm = { category: issueCategories[0], location: '', description: '', image: '' };

export default function ReportIssuePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    apiRequest('/auth/me', { headers: getAuthHeaders() })
      .then((data) => {
        if (data.user.role !== 'citizen') throw new Error('Only citizen accounts can report issues');
        setUser(data.user);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const updateImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Please choose an image smaller than 5 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const logout = () => {
    localStorage.removeItem('smart_city_token');
    localStorage.removeItem('smart_city_user');
    window.dispatchEvent(new Event('auth-logout'));
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);
    try {
      await apiRequest('/issues', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(form) });
      setForm(initialForm);
      setMessage('Your issue was reported successfully. The city team can now review it.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !user) return <main className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center text-sm text-slate-500">{error}. <a href="/login" className="ml-1 font-bold text-brand-600">Log in again</a></main>;
  if (!user) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-brand-600">Loading report form...</main>;

  return <main className="dashboard-page min-h-screen bg-white text-slate-900"><Navbar isAuthenticated user={user} onLogout={logout} /><aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar-open' : ''}`}><div className="dashboard-sidebar-brand"><div className="dashboard-sidebar-mark">S</div><div><p className="dashboard-sidebar-title">Citizen space</p><p className="dashboard-sidebar-subtitle">SmartCity platform</p></div><button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-close-button" aria-label="Close sidebar"><X size={18} /></button></div><p className="dashboard-sidebar-label">Workspace</p><nav className="dashboard-sidebar-nav">{sidebarPages.map(([label, Icon, href]) => <a key={label} href={href} onClick={() => setSidebarOpen(false)} className={`dashboard-sidebar-link ${href === '/report-issue' ? 'dashboard-sidebar-link-active' : ''}`}><Icon size={18} /><span>{label}</span>{label === 'Notifications' && <span className="dashboard-notification-count">2</span>}</a>)}</nav><div className="dashboard-sidebar-footer"><a href="/profile" className="dashboard-sidebar-link"><UserRound size={18} /><span>Profile details</span></a><button type="button" onClick={logout} className="dashboard-sidebar-link dashboard-logout"><LogOut size={18} /><span>Log out</span></button></div></aside>{sidebarOpen && <button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-sidebar-overlay" aria-label="Close sidebar" />}<section className="dashboard-main"><div className="dashboard-mobile-toolbar"><button type="button" onClick={() => setSidebarOpen(true)} className="dashboard-mobile-menu-button" aria-label="Open sidebar"><Menu size={20} /></button><span>Report an issue</span></div><div className="dashboard-container"><a href="/dashboard" className="profile-back-link"><ArrowLeft size={15} /> Back to dashboard</a><div className="dashboard-heading-row worker-heading-row"><div><p className="dashboard-eyebrow">Civic reporting</p><h1 className="dashboard-heading">Report an issue</h1><p className="dashboard-description">Tell the city team what needs attention in your community.</p></div></div>{message && <p className="worker-success">{message} <a href="/reports">View my reports</a></p>}{error && <p className="worker-error">{error}</p>}<form className="worker-form report-issue-form" onSubmit={submit}><div className="worker-form-section"><h2>Issue details</h2><div className="worker-form-grid"><label className="worker-field"><span>Issue type</span><select required name="category" value={form.category} onChange={updateField}>{issueCategories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="worker-field"><span>Location</span><input required name="location" value={form.location} onChange={updateField} placeholder="Street, ward, or landmark" /></label><label className="worker-field report-description-field"><span>What is happening?</span><textarea required name="description" value={form.description} onChange={updateField} placeholder="Describe the problem and any details that may help the city team." rows="6" minLength="10" maxLength="2000" /></label><label className="worker-field report-image-field"><span><FileImage size={16} /> Evidence image <small>(optional, max 5 MB)</small></span><input type="file" accept="image/*" onChange={updateImage} /></label></div></div><button type="submit" disabled={isSubmitting} className="dashboard-primary-button worker-submit">{isSubmitting ? 'Submitting report...' : 'Submit issue report'} <span>→</span></button></form></div></section></main>;
}
