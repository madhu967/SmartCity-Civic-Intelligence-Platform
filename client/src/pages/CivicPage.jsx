import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  FileWarning,
  Home,
  Layers,
  LogOut,
  MapPin,
  Menu,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  UserCheck,
  UserRound,
  X,
} from 'lucide-react';
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
    description: 'Live community signals and municipal responses across the city.',
    icon: Activity,
    emptyTitle: 'No community activity yet',
    emptyText: 'City-wide civic complaints and restoration works will appear here.',
    action: 'Report an issue',
  },
  '/notifications': {
    eyebrow: 'Updates',
    title: 'Notifications',
    description: 'Real-time timeline of your reports, field assignments, and city resolutions.',
    icon: Bell,
    emptyTitle: 'You are all caught up',
    emptyText: 'New report updates, community alerts, and field dispatches will appear here.',
    action: 'View dashboard',
  },
};

const sidebarPages = [
  ['Overview', Home, '/dashboard'],
  ['Report an issue', FileWarning, '/report-issue'],
  ['My reports', ClipboardList, '/reports'],
  ['Nearby activity', Activity, '/activity'],
  ['Notifications', Bell, '/notifications'],
];

const formatReportDate = (date) =>
  new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));

export default function CivicPage({ pagePath }) {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [communityIssues, setCommunityIssues] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const content = pageData[pagePath] || pageData['/reports'];
  const PageIcon = content.icon;

  useEffect(() => {
    const loadPageData = async () => {
      try {
        const [userData, myIssuesData, communityData] = await Promise.all([
          apiRequest('/auth/me', { headers: getAuthHeaders() }),
          apiRequest('/issues', { headers: getAuthHeaders() }),
          apiRequest('/issues/community', { headers: getAuthHeaders() }).catch(() => ({ issues: [] })),
        ]);
        setUser(userData.user);
        setReports(myIssuesData.issues || []);
        setCommunityIssues(communityData.issues || []);
      } catch (requestError) {
        localStorage.removeItem('smart_city_token');
        setError(requestError.message);
      }
    };

    loadPageData();
    const refreshTimer = window.setInterval(loadPageData, 12000);
    window.addEventListener('focus', loadPageData);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener('focus', loadPageData);
    };
  }, [pagePath]);

  const logout = () => {
    localStorage.removeItem('smart_city_token');
    localStorage.removeItem('smart_city_user');
    window.dispatchEvent(new Event('auth-logout'));
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500 font-sans">
        {error}. <a href="/login" className="ml-1 font-bold text-blue-600">Log in again</a>
      </main>
    );
  }
  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-blue-600 font-sans">
        Loading live civic data...
      </main>
    );
  }

  // Derive real notifications dynamically from the user's reports
  const notifications = [];
  reports.forEach((report) => {
    notifications.push({
      id: `${report.id}-created`,
      title: `Report Submitted: ${report.category}`,
      description: `Your incident at "${report.location}" was received by civic dispatch.`,
      time: report.createdAt,
      type: 'submitted',
      icon: Layers,
    });

    if (report.assignedWorker) {
      notifications.push({
        id: `${report.id}-assigned`,
        title: `Field Technician Assigned`,
        description: `${report.assignedWorker.name} (${report.assignedWorker.department || 'Infrastructure'}) was assigned to your ${report.category} report.`,
        time: report.updatedAt || report.createdAt,
        type: 'assigned',
        icon: UserCheck,
      });
    }

    if (report.workerProofImage) {
      notifications.push({
        id: `${report.id}-proof`,
        title: `Completion Proof Uploaded`,
        description: `Field officer uploaded photo proof of resolution. Admin review is pending.`,
        time: report.updatedAt || report.createdAt,
        type: 'proof',
        icon: CheckCircle2,
      });
    }

    if (report.status === 'Resolved') {
      notifications.push({
        id: `${report.id}-resolved`,
        title: `Incident Successfully Resolved`,
        description: `Your report for ${report.category} has been verified and closed by municipal administration.`,
        time: report.updatedAt || report.createdAt,
        type: 'resolved',
        icon: CheckCircle2,
      });
    }
  });

  notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.category?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.location?.toLowerCase().includes(q) ||
      r.aiTitle?.toLowerCase().includes(q)
    );
  });

  return (
    <main className="dashboard-page min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar isAuthenticated user={user} onLogout={logout} />

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900 border border-white/20 p-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer"
              aria-label="Close enlarged preview"
            >
              <X size={18} />
            </button>
            <img src={selectedImage} alt="Enlarged evidence" className="w-full h-auto max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar-open' : ''}`}>
        <div className="dashboard-sidebar-brand">
          <div className="dashboard-sidebar-mark">S</div>
          <div>
            <p className="dashboard-sidebar-title">Citizen space</p>
            <p className="dashboard-sidebar-subtitle">SmartCity platform</p>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-close-button" aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <p className="dashboard-sidebar-label">Citizen Workspace</p>
        <nav className="dashboard-sidebar-nav">
          {sidebarPages.map(([label, Icon, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`dashboard-sidebar-link ${href === pagePath ? 'dashboard-sidebar-link-active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === 'Notifications' && notifications.length > 0 && (
                <span className="dashboard-notification-count">{notifications.length}</span>
              )}
            </a>
          ))}
        </nav>

        <div className="dashboard-sidebar-footer">
          <a href="/profile" className="dashboard-sidebar-link">
            <UserRound size={18} />
            <span>Profile details</span>
          </a>
          <button type="button" onClick={logout} className="dashboard-sidebar-link dashboard-logout">
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && <button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-sidebar-overlay" aria-label="Close sidebar" />}

      <section className="dashboard-main">
        <div className="dashboard-mobile-toolbar">
          <button type="button" onClick={() => setSidebarOpen(true)} className="dashboard-mobile-menu-button" aria-label="Open sidebar">
            <Menu size={20} />
          </button>
          <span>{content.title}</span>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-heading-row">
            <div>
              <p className="dashboard-eyebrow">{content.eyebrow}</p>
              <h1 className="dashboard-heading">{content.title}</h1>
              <p className="dashboard-description">{content.description}</p>
            </div>
            <a href={pagePath === '/reports' ? '/report-issue' : '/dashboard'} className="dashboard-primary-button">
              <PageIcon size={17} /> {content.action}
            </a>
          </div>

          {/* VIEW 1: MY REPORTS */}
          {pagePath === '/reports' && (
            <div className="mt-6 space-y-6">
              <div className="dashboard-stat-grid">
                <div className="dashboard-stat-card border-l-4 border-l-blue-600">
                  <div className="dashboard-stat-top">
                    <span>Total Submitted</span>
                    <ClipboardList size={18} className="text-blue-600" />
                  </div>
                  <strong>{reports.length}</strong>
                  <small>Your complaint history</small>
                </div>

                <div className="dashboard-stat-card border-l-4 border-l-emerald-600">
                  <div className="dashboard-stat-top">
                    <span>Resolved</span>
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  </div>
                  <strong className="text-emerald-600">
                    {reports.filter((r) => r.status === 'Resolved').length}
                  </strong>
                  <small>Verified municipal fixes</small>
                </div>

                <div className="dashboard-stat-card border-l-4 border-l-amber-500">
                  <div className="dashboard-stat-top">
                    <span>In Progress</span>
                    <Clock size={18} className="text-amber-600" />
                  </div>
                  <strong className="text-amber-600">
                    {reports.filter((r) => r.status !== 'Resolved').length}
                  </strong>
                  <small>Active in field work</small>
                </div>
              </div>

              {reports.length > 0 && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200">
                  <Search size={16} className="text-slate-400 ml-2" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by category, location, or description..."
                    className="w-full bg-transparent border-0 outline-none text-xs text-slate-800"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}

              {filteredReports.length === 0 ? (
                <section className="civic-page-panel">
                  <div className="civic-page-icon">
                    <PageIcon size={22} />
                  </div>
                  <h2>{content.emptyTitle}</h2>
                  <p>{content.emptyText}</p>
                  <a href="/report-issue" className="dashboard-primary-button">
                    {content.action} <span>→</span>
                  </a>
                </section>
              ) : (
                <div className="civic-reports-list grid gap-4">
                  {filteredReports.map((report) => (
                    <article className="civic-report-item p-4 rounded-xl border border-slate-200 bg-white shadow-xs" key={report.id}>
                      <div className="civic-report-item-header flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="civic-report-category text-xs font-bold text-blue-600">
                              {report.category}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                report.priority === 'Critical'
                                  ? 'bg-red-100 text-red-700'
                                  : report.priority === 'High'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {report.priority || 'Medium'}
                            </span>
                          </div>
                          <strong className="text-sm font-bold text-slate-900 block mt-1">
                            {report.aiTitle || report.description}
                          </strong>
                        </div>
                        <span className={`civic-report-status civic-report-status-${(report.status || 'Submitted').toLowerCase().replace(/\s+/g, '-')}`}>
                          {report.status || 'Submitted'}
                        </span>
                      </div>

                      <div className="civic-report-meta flex items-center gap-4 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-blue-600" /> {report.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays size={13} /> {formatReportDate(report.createdAt)}
                        </span>
                      </div>

                      {report.aiTitle && (
                        <p className="civic-report-description text-xs text-slate-600 mt-2">
                          {report.description}
                        </p>
                      )}

                      {report.assignedWorker && (
                        <div className="mt-2.5 p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-center gap-2">
                          <UserCheck size={14} className="text-blue-600 shrink-0" />
                          <span>
                            Field Officer: <strong>{report.assignedWorker.name}</strong> · {report.assignedWorker.department || 'Civic Infrastructure'}
                          </span>
                        </div>
                      )}

                      {(report.imageUrl || report.workerProofImage) && (
                        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-100">
                          {report.imageUrl && (
                            <button
                              type="button"
                              onClick={() => setSelectedImage(report.imageUrl)}
                              className="inline-flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs"
                            >
                              <img src={report.imageUrl} alt="Citizen evidence" className="w-10 h-10 rounded object-cover" />
                              <span className="font-semibold text-slate-700">Citizen photo</span>
                            </button>
                          )}
                          {report.workerProofImage && (
                            <button
                              type="button"
                              onClick={() => setSelectedImage(report.workerProofImage)}
                              className="inline-flex items-center gap-2 p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 cursor-pointer text-xs"
                            >
                              <img src={report.workerProofImage} alt="Completion proof" className="w-10 h-10 rounded object-cover border border-emerald-300" />
                              <div className="text-left">
                                <span className="font-bold text-emerald-900 block">Restoration proof</span>
                                <small className="text-emerald-700 text-[10px]">{report.proofReviewStatus || 'Under review'}</small>
                              </div>
                            </button>
                          )}
                        </div>
                      )}

                      <div className="civic-report-footer flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                        <span>Incident ID: #{String(report.id).slice(-8).toUpperCase()}</span>
                        {report.status === 'Resolved' && (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 size={13} /> Completed & Verified
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: NEARBY COMMUNITY ACTIVITY */}
          {pagePath === '/activity' && (
            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">City-Wide Signals Monitor</h3>
                  <p className="text-xs text-slate-500">Live feed of civic reports submitted across municipal wards.</p>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  {communityIssues.length} Active Incidents
                </span>
              </div>

              {communityIssues.length === 0 ? (
                <section className="civic-page-panel">
                  <div className="civic-page-icon">
                    <Activity size={22} />
                  </div>
                  <h2>No public activity yet</h2>
                  <p>When issues are reported across the city, they will appear here in real-time.</p>
                </section>
              ) : (
                <div className="grid gap-3">
                  {communityIssues.map((item) => (
                    <article key={item.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="category-chip">
                            {item.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              item.priority === 'Critical'
                                ? 'bg-red-100 text-red-700'
                                : item.priority === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.priority || 'Medium'} Priority
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={11} /> {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <strong className="text-sm font-bold text-slate-900 block truncate">
                          {item.aiTitle || item.description}
                        </strong>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-blue-500 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            item.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'In progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: NOTIFICATIONS */}
          {pagePath === '/notifications' && (
            <div className="mt-6 space-y-4">
              {notifications.length === 0 ? (
                <section className="civic-page-panel">
                  <div className="civic-page-icon">
                    <Bell size={22} />
                  </div>
                  <h2>{content.emptyTitle}</h2>
                  <p>{content.emptyText}</p>
                </section>
              ) : (
                <div className="grid gap-3">
                  {notifications.map((notif) => {
                    const NotifIcon = notif.icon;
                    return (
                      <div
                        key={notif.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex items-start gap-3.5"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          notif.type === 'resolved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : notif.type === 'assigned'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          <NotifIcon size={18} />
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <strong className="text-sm font-bold text-slate-900 block">{notif.title}</strong>
                            <span className="text-slate-400 text-[11px] shrink-0">{formatReportDate(notif.time)}</span>
                          </div>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">{notif.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}