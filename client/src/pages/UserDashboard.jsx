import { useEffect, useState } from 'react';
import {
  Activity,
  Bell,
  ClipboardList,
  Home,
  LogOut,
  MapPin,
  Menu,
  Plus,
  FileWarning,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { apiRequest, getAuthHeaders } from '../config/api';

const pages = [
  { label: 'Overview', icon: Home, href: '/dashboard' },
  { label: 'Report an issue', icon: FileWarning, href: '/report-issue' },
  { label: 'AI issue assistant', icon: Sparkles, href: '/ai-report' },
  { label: 'My reports', icon: ClipboardList, href: '/reports' },
  { label: 'Nearby activity', icon: Activity, href: '/activity' },
  { label: 'Notifications', icon: Bell, href: '/notifications' },
];

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [reportCount, setReportCount] = useState(0);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadReports = async () => {
      const issueData = await apiRequest('/issues', { headers: getAuthHeaders() });
      setReportCount(issueData.issues.length);
    };

    const loadUser = async () => {
      try {
        const [userData, issueData] = await Promise.all([
          apiRequest('/auth/me', { headers: getAuthHeaders() }),
          apiRequest('/issues', { headers: getAuthHeaders() }),
        ]);
        setUser(userData.user);
        setReportCount(issueData.issues.length);
      } catch (requestError) {
        localStorage.removeItem('smart_city_token');
        setError(requestError.message);
      }
    };

    loadUser();
    const refreshOnFocus = () => loadReports().catch((requestError) => setError(requestError.message));
    const refreshTimer = window.setInterval(refreshOnFocus, 10000);
    window.addEventListener('focus', refreshOnFocus);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('smart_city_token');
    window.dispatchEvent(new Event('auth-logout'));
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Session expired</p>
          <h1 className="mt-3 text-2xl font-bold">Please log in again</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{error}</p>
          <button type="button" onClick={logout} className="mt-6 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700">Return to login</button>
        </div>
      </main>
    );
  }

  if (!user) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-brand-600">Loading your dashboard...</main>;
  }

  const initials = user.name?.trim().charAt(0).toUpperCase() || 'C';

  return (
    <main className="dashboard-page min-h-screen bg-white text-slate-900">
      <Navbar isAuthenticated user={user} onLogout={logout} />

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar-open' : ''}`}>
        <div className="dashboard-sidebar-brand">
          <div className="dashboard-sidebar-mark">S</div>
          <div><p className="dashboard-sidebar-title">Citizen space</p><p className="dashboard-sidebar-subtitle">SmartCity platform</p></div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-close-button" aria-label="Close sidebar"><X size={18} /></button>
        </div>

        <p className="dashboard-sidebar-label">Workspace</p>
        <nav className="dashboard-sidebar-nav">
          {pages.map(({ label, icon: Icon, href }, index) => (
            <a key={label} href={href} onClick={() => setSidebarOpen(false)} className={`dashboard-sidebar-link ${index === 0 ? 'dashboard-sidebar-link-active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
              {label === 'Notifications' && <span className="dashboard-notification-count">2</span>}
            </a>
          ))}
        </nav>

        <div className="dashboard-sidebar-footer">
          <a href="/profile" className="dashboard-sidebar-link"><UserRound size={18} /><span>Profile details</span></a>
          <button type="button" className="dashboard-sidebar-link"><Settings size={18} /><span>Account settings</span></button>
          <button type="button" onClick={logout} className="dashboard-sidebar-link dashboard-logout"><LogOut size={18} /><span>Log out</span></button>
        </div>
      </aside>

      {sidebarOpen && <button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-sidebar-overlay" aria-label="Close sidebar" />}

      <section className="dashboard-main">
        <div className="dashboard-mobile-toolbar"><button type="button" onClick={() => setSidebarOpen(true)} className="dashboard-mobile-menu-button" aria-label="Open sidebar"><Menu size={20} /></button><span>Dashboard</span></div>
        <div className="dashboard-container">
          <div className="dashboard-heading-row">
            <div><p className="dashboard-eyebrow">Citizen dashboard</p><h1 className="dashboard-heading">Welcome, {user.name}.</h1><p className="dashboard-description">Your civic space for making a difference in your community.</p></div>
            <a href="/report-issue" className="dashboard-primary-button"><Plus size={17} /> Report an issue</a>
          </div>

          <div className="dashboard-stat-grid">
            <div className="dashboard-stat-card"><div className="dashboard-stat-top"><span>My reports</span><ClipboardList size={18} /></div><strong>{reportCount}</strong><small><a href="/reports">View submitted reports</a></small></div>
            <div className="dashboard-stat-card"><div className="dashboard-stat-top"><span>Resolved</span><ShieldCheck size={18} /></div><strong>See reports</strong><small>Track city progress in My reports</small></div>
            <div className="dashboard-stat-card"><div className="dashboard-stat-top"><span>Nearby signals</span><Activity size={18} /></div><strong>12</strong><small>Active in your area</small></div>
            <div className="dashboard-stat-card"><div className="dashboard-stat-top"><span>Account status</span><UserRound size={18} /></div><strong className="dashboard-status-active">Active</strong><small>Citizen account verified</small></div>
          </div>

          <div className="dashboard-lower-grid">
            <section className="dashboard-panel"><div className="dashboard-panel-heading"><div><h2>Your civic activity</h2><p>Reports and updates will appear here.</p></div><Activity size={21} /></div><div className="dashboard-empty-state"><span><Plus size={19} /></span><strong>Start making an impact</strong><p>Report a civic issue and help your city team understand what needs attention.</p><a href="/report-issue">Create your first report <span>→</span></a></div></section>
            <section className="dashboard-panel"><div className="dashboard-panel-heading"><h2>Profile</h2><a href="/profile">View details</a></div><div className="dashboard-profile"><div className="dashboard-avatar">{initials}</div><div><strong>{user.name}</strong><span className="capitalize">{user.role} account</span></div></div><dl className="dashboard-profile-details"><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Phone</dt><dd>{user.phone || 'Not added yet'}</dd></div><div className="dashboard-connected"><MapPin size={14} /> Connected to your community</div></dl></section>
          </div>
        </div>
      </section>
    </main>
  );
}
