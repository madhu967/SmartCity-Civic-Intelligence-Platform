import { useEffect, useState } from 'react';
import { Activity, Bell, ClipboardList, Home, LogOut, Menu, Settings, UserRound, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { apiRequest, getAuthHeaders } from '../config/api';

const pageData = {
  '/reports': {
    eyebrow: 'Civic reporting',
    title: 'My reports',
    description: 'Track the civic issues you have raised and follow their progress.',
    icon: ClipboardList,
    emptyTitle: 'No reports yet',
    emptyText: 'When you report an issue, its status and resolution updates will appear here.',
    action: 'Report a new issue',
  },
  '/activity': {
    eyebrow: 'Live intelligence',
    title: 'Nearby activity',
    description: 'See the signals and civic activity happening around your community.',
    icon: Activity,
    emptyTitle: 'Your local view is ready',
    emptyText: 'Nearby reports and city responses will appear here as activity is recorded.',
    action: 'Explore community signals',
  },
  '/notifications': {
    eyebrow: 'Updates',
    title: 'Notifications',
    description: 'Stay informed about your reports and the places you care about.',
    icon: Bell,
    emptyTitle: 'You are all caught up',
    emptyText: 'New report updates, community alerts, and city responses will appear here.',
    action: 'View dashboard',
  },
};

const sidebarPages = [
  ['Overview', Home, '/dashboard'],
  ['My reports', ClipboardList, '/reports'],
  ['Nearby activity', Activity, '/activity'],
  ['Notifications', Bell, '/notifications'],
];

export default function CivicPage({ pagePath }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const content = pageData[pagePath];
  const PageIcon = content.icon;

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

  if (error) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">{error}. <a href="/login" className="ml-1 font-bold text-brand-600">Log in again</a></main>;
  if (!user) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-brand-600">Loading page...</main>;

  return (
    <main className="dashboard-page min-h-screen bg-white text-slate-900">
      <Navbar isAuthenticated user={user} onLogout={logout} />
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar-open' : ''}`}>
        <div className="dashboard-sidebar-brand"><div className="dashboard-sidebar-mark">S</div><div><p className="dashboard-sidebar-title">Citizen space</p><p className="dashboard-sidebar-subtitle">SmartCity platform</p></div><button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-close-button" aria-label="Close sidebar"><X size={18} /></button></div>
        <p className="dashboard-sidebar-label">Workspace</p>
        <nav className="dashboard-sidebar-nav">{sidebarPages.map(([label, Icon, href]) => <a key={label} href={href} onClick={() => setSidebarOpen(false)} className={`dashboard-sidebar-link ${href === pagePath ? 'dashboard-sidebar-link-active' : ''}`}><Icon size={18} /><span>{label}</span>{label === 'Notifications' && <span className="dashboard-notification-count">2</span>}</a>)}</nav>
        <div className="dashboard-sidebar-footer"><a href="/profile" className="dashboard-sidebar-link"><UserRound size={18} /><span>Profile details</span></a><button type="button" className="dashboard-sidebar-link"><Settings size={18} /><span>Account settings</span></button><button type="button" onClick={logout} className="dashboard-sidebar-link dashboard-logout"><LogOut size={18} /><span>Log out</span></button></div>
      </aside>
      {sidebarOpen && <button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-sidebar-overlay" aria-label="Close sidebar" />}
      <section className="dashboard-main">
        <div className="dashboard-mobile-toolbar"><button type="button" onClick={() => setSidebarOpen(true)} className="dashboard-mobile-menu-button" aria-label="Open sidebar"><Menu size={20} /></button><span>{content.title}</span></div>
        <div className="dashboard-container">
          <div className="dashboard-heading-row"><div><p className="dashboard-eyebrow">{content.eyebrow}</p><h1 className="dashboard-heading">{content.title}</h1><p className="dashboard-description">{content.description}</p></div><button type="button" className="dashboard-primary-button"><PageIcon size={17} /> {content.action}</button></div>
          <section className="civic-page-panel"><div className="civic-page-icon"><PageIcon size={22} /></div><h2>{content.emptyTitle}</h2><p>{content.emptyText}</p><button type="button" className="dashboard-primary-button">{content.action} <span>→</span></button></section>
          <div className="civic-static-grid"><div className="dashboard-stat-card"><div className="dashboard-stat-top"><span>Community status</span><Activity size={18} /></div><strong>Active</strong><small>Live civic intelligence enabled</small></div><div className="dashboard-stat-card"><div className="dashboard-stat-top"><span>Account role</span><UserRound size={18} /></div><strong className="capitalize">{user.role}</strong><small>{user.email}</small></div></div>
        </div>
      </section>
    </main>
  );
}