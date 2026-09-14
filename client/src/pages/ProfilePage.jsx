import { useEffect, useState } from 'react';
import { Activity, ArrowLeft, Bell, ClipboardList, Home, LogOut, Mail, MapPin, Menu, Phone, Settings, ShieldCheck, UserRound, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { apiRequest, getAuthHeaders } from '../config/api';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    apiRequest('/auth/me', { headers: getAuthHeaders() })
      .then((data) => setUser(data.user))
      .catch((requestError) => {
        localStorage.removeItem('smart_city_token');
        setError(requestError.message);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem('smart_city_token');
    window.history.pushState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (error) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-sm text-slate-500">{error}. <a href="/login" className="ml-1 font-bold text-brand-600">Log in again</a></main>;
  }

  if (!user) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-brand-600">Loading profile...</main>;
  }

  const initials = user.name?.trim().charAt(0).toUpperCase() || 'C';
  const sidebarPages = [
    ['Overview', Home, '/dashboard'],
    ['My reports', ClipboardList, '/reports'],
    ['Nearby activity', Activity, '/activity'],
    ['Notifications', Bell, '/notifications'],
  ];

  return (
    <main className="profile-page min-h-screen bg-white text-slate-900">
      <Navbar isAuthenticated user={user} onLogout={logout} />
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar-open' : ''}`}>
        <div className="dashboard-sidebar-brand"><div className="dashboard-sidebar-mark">S</div><div><p className="dashboard-sidebar-title">Citizen space</p><p className="dashboard-sidebar-subtitle">SmartCity platform</p></div><button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-close-button" aria-label="Close sidebar"><X size={18} /></button></div>
        <p className="dashboard-sidebar-label">Workspace</p>
        <nav className="dashboard-sidebar-nav">{sidebarPages.map(([label, Icon, href], index) => <a key={label} href={href} className={`dashboard-sidebar-link ${index === 0 ? 'dashboard-sidebar-link-active' : ''}`} onClick={() => setSidebarOpen(false)}><Icon size={18} /><span>{label}</span>{label === 'Notifications' && <span className="dashboard-notification-count">2</span>}</a>)}</nav>
        <div className="dashboard-sidebar-footer"><a href="/profile" className="dashboard-sidebar-link dashboard-sidebar-link-active"><UserRound size={18} /><span>Profile details</span></a><button type="button" className="dashboard-sidebar-link"><Settings size={18} /><span>Account settings</span></button><button type="button" onClick={logout} className="dashboard-sidebar-link dashboard-logout"><LogOut size={18} /><span>Log out</span></button></div>
      </aside>
      {sidebarOpen && <button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-sidebar-overlay" aria-label="Close sidebar" />}
      <div className="profile-mobile-toolbar"><button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"><Menu size={20} /></button><span>Profile details</span></div>
      <section className="profile-content">
        <a href="/dashboard" className="profile-back-link"><ArrowLeft size={15} /> Back to dashboard</a>
        <div className="profile-heading"><p className="dashboard-eyebrow">Account</p><h1>Profile details</h1><p>Manage and review the information connected to your citizen account.</p></div>
        <div className="profile-card">
          <div className="profile-card-banner"><div className="profile-large-avatar">{initials}</div><div><h2>{user.name}</h2><p>{user.role} account</p></div></div>
          <div className="profile-detail-grid">
            <div><span><Mail size={16} /> Email address</span><strong>{user.email}</strong></div>
            <div><span><Phone size={16} /> Phone number</span><strong>{user.phone || 'Not added yet'}</strong></div>
            <div><span><ShieldCheck size={16} /> Account role</span><strong className="capitalize">{user.role}</strong></div>
            <div><span><MapPin size={16} /> Community status</span><strong className="profile-active">Active citizen</strong></div>
            <div><span><UserRound size={16} /> Account created</span><strong>{new Date(user.createdAt).toLocaleDateString()}</strong></div>
          </div>
        </div>
      </section>
    </main>
  );
}