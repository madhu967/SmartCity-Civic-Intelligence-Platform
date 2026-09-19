import { useEffect, useState } from 'react';
import { 
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass, 
  ExternalLink,
  Eye,
  FileText,
  Filter, 
  KeyRound,
  Layers,
  LogOut, 
  Mail,
  MapPin, 
  Menu, 
  Navigation, 
  Phone,
  Plus,
  Radio,
  RefreshCw,
  Search, 
  Settings, 
  TrendingUp,
  User,
  UserCheck, 
  UserRound,
  Users,
  ShieldCheck,
  X, 
  Zap 
} from 'lucide-react';
import {
  CivicIntelligenceIcon,
  HotspotRadarIcon,
  MunicipalIncidentIcon,
  CivicCommandMatrixIcon,
  CitizenMeshIcon,
  FieldOpsIcon,
  WardTelemetryIcon,
  MunicipalDocketIcon,
  VerifiedResolutionSeal,
  SpatialGisReticle,
  OpticalVisionIcon,
  CivicTelemetryTrendsIcon,
  MunicipalCommsIcon,
  PriorityBeaconIcon,
} from '../components/CivicIcons';
import AdminHotspotMap from '../components/AdminHotspotMap';
import AdminInsightsPage from './AdminInsightsPage';
import { apiRequest, getAuthHeaders } from '../config/api';
import { calculateDistanceKm, formatDistance } from '../utils/geolocation';

const adminPages = [
  { label: 'Admin overview', href: '/admin', icon: CivicCommandMatrixIcon },
  { label: 'AI City Insights', href: '/admin/insights', icon: CivicIntelligenceIcon, isAi: true },
  { label: 'Hotspot Map', href: '/admin/hotspots', icon: HotspotRadarIcon },
  { label: 'Manage users', href: '/admin/users', icon: CitizenMeshIcon },
  { label: 'Manage workers', href: '/admin/workers', icon: FieldOpsIcon },
  { label: 'Issue dashboard', href: '/admin/issues', icon: MunicipalIncidentIcon },
  { label: 'Contact inbox', href: '/admin/contacts', icon: MunicipalCommsIcon },
  { label: 'Create worker', href: '/admin/workers/new', icon: FieldOpsIcon },
  { label: 'Reports overview', href: '/admin/reports', icon: CivicTelemetryTrendsIcon },
];

const departmentOptions = ['Roads and Infrastructure', 'Sanitation', 'Water Services', 'Public Safety', 'Parks and Recreation', 'Electrical Services'];

export default function AdminDashboard({ pagePath = '/admin' }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(() => (pagePath || window.location.pathname).split('#')[0].replace(/\/+$/, '') || '/admin');

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.split('#')[0].replace(/\/+$/, '') || '/admin';
      setCurrentPath(p);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (pagePath) {
      const p = (pagePath || '/admin').split('#')[0].replace(/\/+$/, '') || '/admin';
      setCurrentPath(p);
    }
  }, [pagePath]);

  const handleAdminNav = (href, e) => {
    if (e) e.preventDefault();
    setCurrentPath(href);
    if (window.location.pathname !== href) {
      window.history.pushState({}, '', href);
    }
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const isInsightsPage = currentPath === '/admin/insights' || window.location.hash === '#insights';
  const isHotspotsPage = currentPath === '/admin/hotspots' || window.location.hash === '#hotspots';
  const isUsersPage = currentPath === '/admin/users' || window.location.hash === '#users';
  const isWorkersPage = currentPath === '/admin/workers' || window.location.hash === '#workers';
  const isIssuesPage = currentPath === '/admin/issues' || window.location.hash === '#issues';
  const isContactsPage = currentPath === '/admin/contacts' || window.location.hash === '#contacts';
  const isReportsPage = currentPath === '/admin/reports' || window.location.hash === '#reports';
  const isNewWorkerPage = currentPath === '/admin/workers/new' || window.location.hash === '#workers/new';

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const [profile, userList, workerList, issueList, contactList] = await Promise.all([
          apiRequest('/auth/me', { headers: getAuthHeaders() }),
          apiRequest('/admin/users', { headers: getAuthHeaders() }),
          apiRequest('/admin/workers', { headers: getAuthHeaders() }),
          apiRequest('/admin/issues', { headers: getAuthHeaders() }),
          apiRequest('/admin/contacts', { headers: getAuthHeaders() }),
        ]);
        setUser(profile.user);
        setUsers(userList.users);
        setWorkers(workerList.workers);
        setIssues(issueList.issues);
        setContacts(contactList.contacts);
      } catch (requestError) {
        localStorage.removeItem('smart_city_token');
        localStorage.removeItem('smart_city_user');
        setError(requestError.message);
      }
    };

    loadAdmin();
  }, []);

  const logout = () => {
    localStorage.removeItem('smart_city_token');
    localStorage.removeItem('smart_city_user');
    window.dispatchEvent(new Event('auth-logout'));
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const updateStatus = async (userId, isActive) => {
    try {
      const data = await apiRequest(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive }),
      });
      setUsers((currentUsers) => currentUsers.map((item) => item.id === userId ? data.user : item));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const updateIssue = async (issueId, changes) => {
    try {
      const data = await apiRequest(`/admin/issues/${issueId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(changes),
      });
      setIssues((currentIssues) => currentIssues.map((issue) => issue.id === issueId ? data.issue : issue));
      return data.issue;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  };

  if (error) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">{error}. <a href="/login" className="ml-1 font-bold text-brand-600">Log in again</a></main>;
  if (!user) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-brand-600">Loading admin dashboard...</main>;

  return (
    <main className="dashboard-page min-h-screen bg-slate-50 text-slate-900">
      {/* Persistent Full-Height Sidebar (Starts at top: 0, no navbar) */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar-open' : ''}`}>
        <div className="dashboard-sidebar-brand">
          <a href="/" className="dashboard-sidebar-brand-link" title="SmartCity Home">
            <svg className="dashboard-sidebar-logo-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M54 0c5.523 0 10 4.477 10 10v44c0 5.523-4.477 10-10 10H37.871C35.368 46.753 41.8 29.002 55.437 17.423a52 52 0 0 0-8.057 3.847C31.593 30.553 22.59 46.956 22.043 64H10c-1.127 0-2.21-.19-3.222-.533-.18-3.525.037-7.127.692-10.75 4.105-22.71 23.963-38.605 46.276-38.46a47 47 0 0 0-7.84-2.128C27.81 8.858 10.266 16.473 0 30.304V10C0 4.477 4.477 0 10 0z" fill="#3B82F6"/>
            </svg>
            <div className="dashboard-sidebar-brand-text">
              <span className="dashboard-sidebar-brand-title">
                Smart<span>City</span>
              </span>
              <span className="dashboard-sidebar-brand-tagline">
                Civic Intelligence
              </span>
            </div>
          </a>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="dashboard-close-button"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="dashboard-sidebar-scroll">
          <p className="dashboard-sidebar-label">Administration</p>
          <nav className="dashboard-sidebar-nav">
            {adminPages.map(({ label, href, icon: Icon, isAi }) => {
              const isActive =
                href === currentPath ||
                (href === '/admin/reports' && isReportsPage) ||
                (href === '/admin/hotspots' && isHotspotsPage) ||
                (href === '/admin/insights' && isInsightsPage);
              return (
                <a
                  key={label}
                  href={href}
                  onClick={(e) => handleAdminNav(href, e)}
                  className={`dashboard-sidebar-link ${isActive ? 'dashboard-sidebar-link-active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  {isAi && (
                    <span className="ml-auto px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
                      AI
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        </div>
        <div className="dashboard-sidebar-footer">
          <a href="/profile" className="dashboard-sidebar-link">
            <ShieldCheck size={18} />
            <span>Admin profile</span>
          </a>
          <button type="button" onClick={logout} className="dashboard-sidebar-link dashboard-logout">
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="dashboard-sidebar-overlay"
          aria-label="Close sidebar"
        />
      )}

      {/* Main Content Workspace (To the right of the persistent sidebar) */}
      <section className="dashboard-main">
        {/* Executive Sticky Dashboard Top Bar */}
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="dashboard-mobile-menu-button lg:hidden cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>
            <div className="dashboard-topbar-welcome">
              <div className="dashboard-topbar-title">
                <span>Welcome back, {user?.name || 'Administrator'}</span>
                <span className="dashboard-topbar-badge dashboard-topbar-badge-admin">
                  <CivicCommandMatrixIcon size={12} className="text-purple-600" />
                  Administrator Console
                </span>
              </div>
              <p className="dashboard-topbar-sub">
                Municipal Operations Command · Live Incident & Fleet Telemetry Active
              </p>
            </div>
          </div>

          <div className="dashboard-topbar-right">
            <button
              type="button"
              onClick={(e) => handleAdminNav('/admin/insights', e)}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-xs font-bold text-purple-800 hover:bg-purple-100 transition cursor-pointer shadow-xs"
            >
              <CivicIntelligenceIcon size={14} className="text-purple-600" />
              <span>AI Insights</span>
            </button>

            <a
              href="/profile"
              className="dashboard-topbar-profile"
              title="View administrator profile"
            >
              <div className="dashboard-topbar-avatar bg-purple-600">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={`${user.name} avatar`} />
                ) : (
                  user.name?.charAt(0).toUpperCase() || 'A'
                )}
              </div>
              <span className="hidden md:inline max-w-[120px] truncate">{user.name}</span>
            </a>

            <button
              type="button"
              onClick={logout}
              className="dashboard-topbar-logout"
              title="Log out of administrator console"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </header>

        {/* Dynamic White Workspace Container */}
        <div className="dashboard-container">
          <div className="dashboard-heading-row">
            <div>
              <p className="dashboard-eyebrow">Administrator console</p>
              <h1 className="dashboard-heading">
                {isNewWorkerPage
                  ? 'Create a Field Officer'
                  : isInsightsPage
                  ? 'AI City Insights & Analytics'
                  : isHotspotsPage
                  ? 'Civic Hotspot & Problem Density Map'
                  : isUsersPage
                  ? 'Manage Users'
                  : isWorkersPage
                  ? 'Manage Field Officers'
                  : isIssuesPage
                  ? 'Admin Issue Dashboard'
                  : isContactsPage
                  ? 'Contact Inbox'
                  : isReportsPage
                  ? 'Municipal Reports & Analytics'
                  : 'Municipal Operations Overview'}
              </h1>
              <p className="dashboard-description">
                {isNewWorkerPage
                  ? 'Create secure credentials and assign a civic service profile for municipal field operations.'
                  : isInsightsPage
                  ? 'Cognitive civic analytics where AI interprets chart anomalies, explains escalation trends, and delivers municipal action directives.'
                  : isHotspotsPage
                  ? 'Geographic intelligence mapping problem concentration zones, severity heatmaps, and municipal intervention clusters.'
                  : isUsersPage
                  ? 'Review citizen accounts and manage their access credentials.'
                  : isWorkersPage
                  ? 'View every field worker, active workloads, and current service status.'
                  : isIssuesPage
                  ? 'Review, prioritize, edit, and dispatch field personnel to citizen complaints.'
                  : isContactsPage
                  ? 'Review messages about the platform, civic help requests, and community feedback.'
                  : isReportsPage
                  ? 'Real-time municipal performance analytics, resolution velocity, and departmental efficiency metrics.'
                  : 'A consolidated real-time command overview of your SmartCity platform.'}
              </p>
            </div>
          </div>

          {isNewWorkerPage ? (
            <AdminCreateWorker
              departments={departmentOptions}
              onWorkerCreated={(newWorker) => {
                setWorkers((current) => [newWorker, ...current]);
                handleAdminNav('/admin/workers');
              }}
              onCancel={(e) => handleAdminNav('/admin/workers', e)}
            />
          ) : isUsersPage ? (
            <UsersTable users={users} onStatusChange={updateStatus} />
          ) : isWorkersPage ? (
            <WorkersTable workers={workers} onAddWorker={(e) => handleAdminNav('/admin/workers/new', e)} />
          ) : isIssuesPage ? (
            <AdminIssues issues={issues} workers={workers} onUpdate={updateIssue} />
          ) : isContactsPage ? (
            <ContactInbox
              contacts={contacts}
              onUpdate={(contact) =>
                setContacts((current) =>
                  current.map((item) => (item.id === contact.id ? contact : item))
                )
              }
            />
          ) : isReportsPage ? (
            <AdminReportsOverview
              issues={issues}
              workers={workers}
              users={users}
              contacts={contacts}
            />
          ) : isInsightsPage ? (
            <AdminInsightsPage
              issues={issues}
              workers={workers}
              users={users}
              onUpdateIssue={updateIssue}
            />
          ) : isHotspotsPage ? (
            <AdminHotspotMap
              issues={issues}
              workers={workers}
              onUpdateIssue={updateIssue}
            />
          ) : (
            <AdminOverview
              users={users}
              workers={workers}
              issues={issues}
              contacts={contacts}
              onUpdateIssue={updateIssue}
            />
          )}
        </div>
      </section>
    </main>
  );
}

function ContactInbox({ contacts, onUpdate }) {
  const updateStatus = async (contact, status) => {
    const data = await apiRequest(`/admin/contacts/${contact.id}`, { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ status }) });
    onUpdate(data.contact);
  };

  return <section className="dashboard-panel admin-contact-panel"><div className="dashboard-panel-heading"><div><h2>Messages from the Contact page</h2><p>{contacts.length} conversations in your inbox</p></div><Mail size={21} /></div>{contacts.length === 0 ? <div className="admin-empty-users">No contact messages yet.</div> : <div className="admin-contact-list">{contacts.map((contact) => <article className="admin-contact-card" key={contact.id}><div className="admin-contact-card-heading"><div><span className="admin-issue-category">{contact.topic}</span><h3>{contact.name}</h3><a href={`mailto:${contact.email}`}>{contact.email}</a>{contact.phone && <small>{contact.phone}</small>}</div><select value={contact.status} onChange={(event) => updateStatus(contact, event.target.value)} aria-label={`Update status for ${contact.name}`}><option>New</option><option>In review</option><option>Resolved</option></select></div><p className="admin-contact-message">{contact.message}</p><div className="admin-contact-footer"><span>{new Date(contact.createdAt).toLocaleString()}</span>{contact.status === 'Resolved' && <span className="admin-contact-resolved"><CheckCircle2 size={14} /> Resolved</span>}</div></article>)}</div>}</section>;
}

function AdminOverview({ users = [], workers = [], issues = [], contacts = [], onUpdateIssue }) {
  const totalIssues = issues.length;
  const unassignedIssues = issues.filter((i) => !i.assignedWorker && i.status !== 'Resolved');
  const criticalIssues = issues.filter((i) => (i.priority === 'Critical' || i.priority === 'High') && i.status !== 'Resolved');
  const inProgressIssues = issues.filter((i) => i.status === 'In progress');
  const resolvedIssues = issues.filter((i) => i.status === 'Resolved');
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues.length / totalIssues) * 100) : 100;
  const activeWorkers = workers.filter((w) => w.availability !== 'Unavailable');
  const pendingContacts = contacts.filter((c) => c.status !== 'Resolved');

  // Group issues by category for distribution
  const categoryCounts = issues.reduce((acc, issue) => {
    const cat = issue.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const recentIssues = [...issues].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Core Live Operational KPIs */}
      <div className="admin-kpi-grid">
        <a href="/admin/insights" className="admin-kpi-card hover:border-purple-300 transition">
          <div className="civic-icon-housing civic-icon-housing-purple">
            <CivicIntelligenceIcon size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number text-purple-600">AI Insights</span>
            <span className="kpi-label">Cognitive Analytics</span>
          </div>
        </a>

        <a href="/admin/issues" className="admin-kpi-card hover:border-blue-300 transition">
          <div className="civic-icon-housing civic-icon-housing-blue">
            <WardTelemetryIcon size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number">{totalIssues}</span>
            <span className="kpi-label">Total Reports</span>
          </div>
        </a>

        <a href="/admin/issues" className="admin-kpi-card hover:border-amber-300 transition">
          <div className="civic-icon-housing civic-icon-housing-amber">
            <MunicipalIncidentIcon size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number text-amber-600">{unassignedIssues.length}</span>
            <span className="kpi-label">Needs Dispatch</span>
          </div>
        </a>

        <a href="/admin/issues" className="admin-kpi-card hover:border-red-300 transition">
          <div className="civic-icon-housing civic-icon-housing-red">
            <PriorityBeaconIcon size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number text-red-600">{criticalIssues.length}</span>
            <span className="kpi-label">Urgent / Critical</span>
          </div>
        </a>

        <a href="/admin/issues" className="admin-kpi-card hover:border-indigo-300 transition">
          <div className="civic-icon-housing civic-icon-housing-indigo">
            <SpatialGisReticle size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number text-indigo-600">{inProgressIssues.length}</span>
            <span className="kpi-label">In Field Work</span>
          </div>
        </a>

        <a href="/admin/issues" className="admin-kpi-card hover:border-emerald-300 transition">
          <div className="civic-icon-housing civic-icon-housing-emerald">
            <VerifiedResolutionSeal size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number text-emerald-600">{resolvedIssues.length}</span>
            <span className="kpi-label">Resolved ({resolutionRate}%)</span>
          </div>
        </a>

        <a href="/admin/workers" className="admin-kpi-card hover:border-blue-300 transition">
          <div className="civic-icon-housing civic-icon-housing-blue">
            <FieldOpsIcon size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number">{activeWorkers.length} / {workers.length}</span>
            <span className="kpi-label">Field Force Active</span>
          </div>
        </a>

        <a href="/admin/contacts" className="admin-kpi-card hover:border-blue-300 transition">
          <div className="civic-icon-housing civic-icon-housing-amber">
            <MunicipalCommsIcon size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number">{pendingContacts.length}</span>
            <span className="kpi-label">Citizen Inquiries</span>
          </div>
        </a>

        <a href="/admin/hotspots" className="admin-kpi-card hover:border-red-300 transition">
          <div className="civic-icon-housing civic-icon-housing-red">
            <HotspotRadarIcon size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number text-red-600">Hotspot Map</span>
            <span className="kpi-label">Problem Clusters</span>
          </div>
        </a>
      </div>

      {/* Immediate Dispatch Queue (High Priority & Unassigned Incidents) */}
      {unassignedIssues.length > 0 && (
        <section className="dashboard-panel border-amber-200 bg-amber-50/40">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                <PriorityBeaconIcon size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-amber-900">
                  Priority Dispatch Queue ({unassignedIssues.length} Unassigned)
                </h2>
                <p className="text-xs text-amber-700">
                  These civic complaints require municipal personnel assignment.
                </p>
              </div>
            </div>
            <a href="/admin/issues" className="text-xs font-bold text-amber-900 hover:underline">
              Open Full Dispatcher →
            </a>
          </div>

          <div className="grid gap-3 mt-3">
            {unassignedIssues.slice(0, 3).map((issue) => (
              <div
                key={issue.id}
                className="p-3.5 rounded-xl border border-amber-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="category-chip">{issue.category}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        issue.priority === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : issue.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {issue.priority || 'Medium'}
                    </span>
                    <span className="text-xs text-slate-400">
                      Reported by {issue.reporter?.name || 'Citizen'}
                    </span>
                  </div>
                  <strong className="text-sm font-bold text-slate-900 block truncate">
                    {issue.aiTitle || issue.description}
                  </strong>
                  <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-blue-500 shrink-0" />
                    <span className="truncate">{issue.location}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        onUpdateIssue(issue.id, { assignedWorker: e.target.value, status: 'In progress' });
                      }
                    }}
                  >
                    <option value="">-- Quick Assign Worker --</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.department || 'Infrastructure'}) · {w.availability}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Split Operations Grid: Recent Incidents + Workforce Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Civic Issues (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <section className="dashboard-panel">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Incident Reports</h2>
                <p className="text-xs text-slate-500">Live incoming stream of citizen reports</p>
              </div>
              <a href="/admin/issues" className="text-xs font-bold text-blue-600 hover:underline">
                View all issues →
              </a>
            </div>

            {recentIssues.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No civic complaints recorded in the system yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {recentIssues.map((issue) => (
                  <div key={issue.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="category-chip">{issue.category}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            issue.priority === 'Critical'
                              ? 'bg-red-100 text-red-700'
                              : issue.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {issue.priority || 'Medium'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <strong className="text-sm font-bold text-slate-900 block truncate">
                        {issue.aiTitle || issue.description}
                      </strong>
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-blue-500 shrink-0" />
                        <span className="truncate">{issue.location}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {issue.assignedWorker ? (
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                          <UserCheck size={12} className="text-emerald-600" />
                          {issue.assignedWorker.name}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                          Unassigned
                        </span>
                      )}

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          issue.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : issue.status === 'In progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {issue.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Department Breakdown */}
          <section className="dashboard-panel">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Incident Distribution by Specialty</h2>
              <p className="text-xs text-slate-500">Breakdown of complaints across municipal departments</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <div key={cat} className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-xs font-bold text-slate-500 block truncate">{cat}</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <strong className="text-lg font-extrabold text-slate-900">{count}</strong>
                    <span className="text-[11px] text-slate-400">
                      {totalIssues > 0 ? Math.round((count / totalIssues) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Workforce Operations Matrix & Citizen Inquiries (Span 1) */}
        <div className="space-y-6">
          {/* Workforce Status */}
          <section className="dashboard-panel">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Field Personnel Active</h2>
                <p className="text-xs text-slate-500">{workers.length} registered officers</p>
              </div>
              <a href="/admin/workers" className="text-xs font-bold text-blue-600 hover:underline">
                Manage →
              </a>
            </div>

            {workers.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No field officers registered yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {workers.slice(0, 5).map((worker) => (
                  <div key={worker.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {worker.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <strong className="text-xs font-bold text-slate-900 block truncate">
                          {worker.name}
                        </strong>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {worker.department || 'Infrastructure'} · {worker.serviceArea || 'General'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          worker.availability === 'Unavailable'
                            ? 'bg-slate-300'
                            : worker.activeIssuesCount > 2
                            ? 'bg-amber-500 animate-pulse'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <span className="text-[11px] font-bold text-slate-700">
                        {worker.availability}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Citizen Accounts Summary */}
          <section className="dashboard-panel">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Citizen Accounts</h2>
                <p className="text-xs text-slate-500">{users.length} registered residents</p>
              </div>
              <a href="/admin/users" className="text-xs font-bold text-blue-600 hover:underline">
                Manage →
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Active Accounts</span>
                <strong className="text-lg font-bold text-emerald-600 block mt-1">
                  {users.filter((u) => u.isActive).length}
                </strong>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Access Paused</span>
                <strong className="text-lg font-bold text-slate-500 block mt-1">
                  {users.filter((u) => !u.isActive).length}
                </strong>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function AdminReportsOverview({ issues = [], workers = [], users = [], contacts = [] }) {
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter((i) => i.status === 'Resolved');
  const inProgressIssues = issues.filter((i) => i.status === 'In progress');
  const inReviewIssues = issues.filter((i) => i.status === 'In review');
  const submittedIssues = issues.filter((i) => i.status === 'Submitted');
  const unassignedIssues = issues.filter((i) => !i.assignedWorker && i.status !== 'Resolved');
  const criticalIssues = issues.filter((i) => (i.priority === 'Critical' || i.priority === 'High') && i.status !== 'Resolved');
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues.length / totalIssues) * 100) : 100;

  // Workforce metrics
  const activeWorkers = workers.filter((w) => w.availability !== 'Unavailable');
  const onDutyWorkers = workers.filter((w) => w.availability === 'On duty');
  const availableWorkers = workers.filter((w) => w.availability === 'Available');
  const avgWorkload = activeWorkers.length > 0 
    ? (inProgressIssues.length / activeWorkers.length).toFixed(1)
    : '0';

  // Citizens & Contacts
  const activeCitizens = users.filter((u) => u.isActive).length;
  const resolvedContacts = contacts.filter((c) => c.status === 'Resolved').length;
  const contactResolutionRate = contacts.length > 0 
    ? Math.round((resolvedContacts / contacts.length) * 100)
    : 100;

  // AI & Duplicate report efficiency
  const totalDuplicatesPrevented = issues.reduce((acc, curr) => acc + Math.max(0, (curr.reportCount || 1) - 1), 0);
  const multiReportedIssues = issues.filter((i) => (i.reportCount || 1) > 1);

  // Category Intelligence Breakdown
  const allCategories = [
    'Roads & Potholes',
    'Garbage & Sanitation',
    'Water Supply',
    'Electricity',
    'Streetlights',
    'Drainage',
    'Traffic',
    'Other',
    ...new Set(issues.map((i) => i.category).filter(Boolean)),
  ].filter((value, index, self) => self.indexOf(value) === index);

  const categoryStats = allCategories
    .map((cat) => {
      const catIssues = issues.filter((i) => i.category === cat);
      const catResolved = catIssues.filter((i) => i.status === 'Resolved');
      const catInProgress = catIssues.filter((i) => i.status === 'In progress' || i.status === 'In review');
      const rate = catIssues.length > 0 ? Math.round((catResolved.length / catIssues.length) * 100) : 100;
      return {
        category: cat,
        total: catIssues.length,
        resolved: catResolved.length,
        inProgress: catInProgress.length,
        rate,
        percentOfTotal: totalIssues > 0 ? Math.round((catIssues.length / totalIssues) * 100) : 0,
      };
    })
    .filter((s) => s.total > 0 || ['Roads & Potholes', 'Garbage & Sanitation', 'Water Supply', 'Electricity'].includes(s.category))
    .sort((a, b) => b.total - a.total);

  // Department Operational Stats
  const departments = [
    'Roads and Infrastructure',
    'Sanitation',
    'Water Services',
    'Public Safety',
    'Parks and Recreation',
    'Electrical Services',
    ...new Set(workers.map((w) => w.department).filter(Boolean)),
  ].filter((value, index, self) => self.indexOf(value) === index);

  const departmentStats = departments.map((dept) => {
    const deptWorkers = workers.filter((w) => w.department === dept);
    const deptIssues = issues.filter((i) => i.department === dept || i.assignedWorker?.department === dept);
    const deptResolved = deptIssues.filter((i) => i.status === 'Resolved');
    const deptActive = deptIssues.filter((i) => i.status !== 'Resolved');
    const rate = deptIssues.length > 0 ? Math.round((deptResolved.length / deptIssues.length) * 100) : 100;
    return {
      department: dept,
      workersTotal: deptWorkers.length,
      workersActive: deptWorkers.filter((w) => w.availability !== 'Unavailable').length,
      issuesTotal: deptIssues.length,
      issuesResolved: deptResolved.length,
      issuesActive: deptActive.length,
      rate,
    };
  });

  // Top Performing Workers (Leaderboard)
  const workerLeaderboard = [...workers]
    .map((w) => {
      const assigned = issues.filter((i) => i.assignedWorker?.id === w.id || i.assignedWorker === w.id);
      const resolved = assigned.filter((i) => i.status === 'Resolved');
      const active = assigned.filter((i) => i.status !== 'Resolved');
      const rate = assigned.length > 0 ? Math.round((resolved.length / assigned.length) * 100) : 100;
      return {
        ...w,
        totalAssigned: assigned.length,
        resolvedCount: resolved.length,
        activeCount: active.length,
        resolutionRate: rate,
      };
    })
    .sort((a, b) => b.resolvedCount - a.resolvedCount || b.totalAssigned - a.totalAssigned);

  // Priority Severity Breakdown
  const priorities = ['Critical', 'High', 'Medium', 'Low'];
  const priorityStats = priorities.map((p) => {
    const pIssues = issues.filter((i) => i.priority === p);
    const pResolved = pIssues.filter((i) => i.status === 'Resolved');
    const rate = pIssues.length > 0 ? Math.round((pResolved.length / pIssues.length) * 100) : 100;
    const percentOfTotal = totalIssues > 0 ? Math.round((pIssues.length / totalIssues) * 100) : 0;
    return {
      priority: p,
      total: pIssues.length,
      resolved: pResolved.length,
      rate,
      percentOfTotal,
    };
  });

  return (
    <div className="space-y-6">
      {/* 6 Top Analytics Metric Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card border-l-4 border-l-blue-600">
          <div className="kpi-icon-wrap kpi-icon-total">
            <BarChart3 size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number">{totalIssues}</span>
            <span className="kpi-label">Total Citizen Complaints</span>
          </div>
        </div>

        <div className="admin-kpi-card border-l-4 border-l-emerald-600">
          <div className="kpi-icon-wrap kpi-icon-resolved">
            <CheckCircle2 size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number text-emerald-600">{resolutionRate}%</span>
            <span className="kpi-label">City Resolution Rate ({resolvedIssues.length} closed)</span>
          </div>
        </div>

        <div className="admin-kpi-card border-l-4 border-l-amber-500">
          <div className="kpi-icon-wrap kpi-icon-inprogress">
            <Navigation size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number text-amber-600">{inProgressIssues.length + inReviewIssues.length}</span>
            <span className="kpi-label">Active Field Dispatches</span>
          </div>
        </div>

        <div className="admin-kpi-card border-l-4 border-l-indigo-600">
          <div className="civic-icon-housing civic-icon-housing-indigo">
            <CivicIntelligenceIcon size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number text-indigo-600">+{totalDuplicatesPrevented}</span>
            <span className="kpi-label">AI Duplicate Reports Merged</span>
          </div>
        </div>

        <div className="admin-kpi-card border-l-4 border-l-purple-600">
          <div className="civic-icon-housing civic-icon-housing-purple">
            <FieldOpsIcon size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number">{activeWorkers.length} / {workers.length}</span>
            <span className="kpi-label">Field Staff On Duty</span>
          </div>
        </div>

        <div className="admin-kpi-card border-l-4 border-l-teal-600">
          <div className="civic-icon-housing civic-icon-housing-blue">
            <CitizenMeshIcon size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number">{activeCitizens}</span>
            <span className="kpi-label">Active Resident Accounts</span>
          </div>
        </div>
      </div>

      {/* AI Intelligence & Duplicate Suppression Banner */}
      <section className="dashboard-panel bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white border-blue-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-sky-400 border border-slate-700 flex items-center justify-center shadow-xs">
              <CivicIntelligenceIcon size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">AI Duplicate Detection & Proximity Clustering</h2>
              <p className="text-xs text-slate-600">
                CivicTracker AI automatically intercepts recurring incident reports within 200m radius using geolocation and semantic matching.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <strong className="text-lg font-black text-blue-700 block">{totalDuplicatesPrevented} redundant reports</strong>
              <span className="text-[11px] text-slate-500 font-semibold">suppressed & merged into root tickets</span>
            </div>
            <div className="text-right">
              <strong className="text-lg font-black text-slate-900 block">{multiReportedIssues.length} hot-spot locations</strong>
              <span className="text-[11px] text-slate-500 font-semibold">with multi-citizen endorsements</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid: Incident Category Breakdown & Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Panel */}
        <section className="dashboard-panel">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Incident Distribution by Category</h2>
              <p className="text-xs text-slate-500">Breakdown of reported issues and department resolution velocity</p>
            </div>
            <span className="text-xs font-bold text-slate-400">{categoryStats.length} Categories</span>
          </div>

          <div className="space-y-3.5 mt-4">
            {categoryStats.map((item) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{item.category}</span>
                  <div className="flex items-center gap-3 font-medium">
                    <span className="text-slate-500">{item.total} {item.total === 1 ? 'ticket' : 'tickets'} ({item.percentOfTotal}%)</span>
                    <span className="text-emerald-700 font-bold">{item.resolved} resolved</span>
                    <span className="text-blue-700 font-bold">{item.rate}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${item.total > 0 ? (item.resolved / item.total) * 100 : 0}%` }}
                    title={`Resolved: ${item.resolved}`}
                  />
                  <div
                    className="bg-blue-500 h-full transition-all duration-500"
                    style={{ width: `${item.total > 0 ? (item.inProgress / item.total) * 100 : 0}%` }}
                    title={`In progress: ${item.inProgress}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Department Efficiency Panel */}
        <section className="dashboard-panel">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Department Operational Efficiency</h2>
              <p className="text-xs text-slate-500">Personnel deployment and resolution rates per municipal branch</p>
            </div>
            <Briefcase size={18} className="text-slate-400" />
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {departmentStats.map((dept) => (
              <div key={dept.department} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <strong className="text-xs font-bold text-slate-900 block truncate">{dept.department}</strong>
                  <span className="text-[11px] text-slate-500">
                    {dept.workersActive} of {dept.workersTotal} workers on field duty · {dept.issuesActive} open tasks
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-slate-900 block">{dept.issuesResolved} / {dept.issuesTotal} fixed</span>
                  <span className={`text-[11px] font-bold ${dept.rate >= 80 ? 'text-emerald-600' : dept.rate >= 50 ? 'text-blue-600' : 'text-amber-600'}`}>
                    {dept.rate}% resolution
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Grid: Priority Analysis & Field Workforce Performance Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Severity Breakdown */}
        <div className="dashboard-panel space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Severity & Priority Matrix</h2>
            <p className="text-xs text-slate-500">Incident urgency breakdown and resolution status</p>
          </div>

          <div className="space-y-3">
            {priorityStats.map((p) => (
              <div key={p.priority} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    p.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                    p.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                    p.priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {p.priority}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    {p.resolved} of {p.total} resolved
                  </p>
                </div>
                <div className="text-right">
                  <strong className="text-lg font-black text-slate-900">{p.total}</strong>
                  <span className="text-[11px] font-bold text-emerald-600 block">{p.rate}% fixed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Field Workforce Leaderboard (Span 2) */}
        <div className="lg:col-span-2 dashboard-panel">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Field Workforce Productivity Leaderboard</h2>
              <p className="text-xs text-slate-500">Real-time resolution metrics across registered field officers</p>
            </div>
            <a href="/admin/workers" className="text-xs font-bold text-blue-600 hover:underline">
              Manage Field Staff →
            </a>
          </div>

          {workerLeaderboard.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No field workers registered yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 mt-2">
              {workerLeaderboard.slice(0, 6).map((worker, index) => (
                <div key={worker.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-center text-xs font-extrabold text-slate-400">
                      #{index + 1}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {worker.profileImage ? <img src={worker.profileImage} alt="" className="w-full h-full rounded-lg object-cover" /> : worker.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <strong className="text-xs font-bold text-slate-900 block truncate">{worker.name}</strong>
                      <span className="text-[11px] text-slate-500 truncate block">
                        {worker.department} · {worker.serviceArea || 'General Area'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <span className="text-xs font-bold text-emerald-700 block">{worker.resolvedCount} Resolved</span>
                      <span className="text-[11px] text-slate-400">{worker.activeCount} in progress</span>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      worker.availability === 'Unavailable'
                        ? 'bg-slate-100 text-slate-500'
                        : worker.availability === 'On duty'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {worker.availability}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UsersTable({ users, onStatusChange }) {
  return <section className="dashboard-panel admin-users-panel"><div className="dashboard-panel-heading"><div><h2>Citizen accounts</h2><p>{users.length} registered users</p></div><Users size={21} /></div><div className="admin-users-list">{users.length === 0 ? <div className="admin-empty-users">No citizen accounts have been registered yet.</div> : users.map((user) => <div className="admin-user-row" key={user.id}><div className="dashboard-avatar">{user.profileImage ? <img src={user.profileImage} alt={`${user.name} profile`} /> : user.name?.charAt(0).toUpperCase()}</div><div className="admin-user-info"><strong>{user.name}</strong><span>{user.email}</span></div><div className={`admin-status ${user.isActive ? 'admin-status-active' : 'admin-status-inactive'}`}>{user.isActive ? 'Active' : 'Inactive'}</div><button type="button" onClick={() => onStatusChange(user.id, !user.isActive)} className="admin-status-button">{user.isActive ? 'Deactivate' : 'Activate'}</button></div>)}</div></section>;
}

function WorkersTable({ workers, onAddWorker }) {
  const [selectedDepartment, setSelectedDepartment] = useState('All departments');
  const departments = [...new Set(workers.map((worker) => worker.department || 'Unassigned department'))].sort((firstDepartment, secondDepartment) => firstDepartment.localeCompare(secondDepartment));
  const visibleWorkers = selectedDepartment === 'All departments' ? workers : workers.filter((worker) => (worker.department || 'Unassigned department') === selectedDepartment);
  const workersByDepartment = visibleWorkers.reduce((groups, worker) => {
    const department = worker.department || 'Unassigned department';
    groups[department] = groups[department] || [];
    groups[department].push(worker);
    return groups;
  }, {});

  return (
    <section className="dashboard-panel admin-users-panel">
      <div className="dashboard-panel-heading">
        <div>
          <h2>Field workers</h2>
          <p>{workers.length} workers registered with real-time GPS operations</p>
        </div>
        <div className="flex items-center gap-3">
          {onAddWorker && (
            <button
              type="button"
              onClick={onAddWorker}
              className="dashboard-primary-button cursor-pointer text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Plus size={13} />
              <span>Create Worker</span>
            </button>
          )}
          <ShieldCheck size={21} />
        </div>
      </div>
      {workers.length === 0 ? (
        <div className="admin-empty-users">No workers have been created yet.</div>
      ) : (
        <>
          <div className="admin-worker-filter" aria-label="Filter workers by department">
            <span>Filter by specialty</span>
            <div className="admin-worker-filter-options">
              <button
                type="button"
                onClick={() => setSelectedDepartment('All departments')}
                className={`admin-worker-filter-button ${selectedDepartment === 'All departments' ? 'admin-worker-filter-button-active' : ''}`}
              >
                All departments
              </button>
              {departments.map((department) => (
                <button
                  type="button"
                  key={department}
                  onClick={() => setSelectedDepartment(department)}
                  className={`admin-worker-filter-button ${selectedDepartment === department ? 'admin-worker-filter-button-active' : ''}`}
                >
                  {department}
                </button>
              ))}
            </div>
          </div>
          <div className="admin-worker-departments">
            {Object.entries(workersByDepartment).sort(([firstDepartment], [secondDepartment]) => firstDepartment.localeCompare(secondDepartment)).map(([department, departmentWorkers]) => (
              <section className="admin-worker-department" key={department}>
                <div className="admin-worker-department-heading">
                  <div>
                    <h3>{department}</h3>
                    <span>{departmentWorkers.length} {departmentWorkers.length === 1 ? 'worker' : 'workers'}</span>
                  </div>
                  <ShieldCheck size={17} />
                </div>
                <div className="admin-users-list">
                  {departmentWorkers.map((worker) => (
                    <div className="admin-user-row admin-worker-row" key={worker.id}>
                      <div className="dashboard-avatar">
                        {worker.profileImage ? <img src={worker.profileImage} alt={`${worker.name} profile`} /> : worker.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="admin-user-info">
                        <div className="flex items-center gap-2">
                          <strong>{worker.name}</strong>
                          <span className="text-xs text-slate-500">{worker.email}</span>
                        </div>
                        <small className="admin-worker-meta">
                          {worker.jobSkill} · {worker.serviceArea} · {worker.yearsExperience} yrs exp
                        </small>
                        <div className="admin-worker-stats-row">
                          <span className="admin-worker-loc-chip" title={worker.location || 'Location pending'}>
                            <MapPin size={11} className="text-blue-600 inline mr-1" />
                            {worker.location ? (worker.location.length > 50 ? `${worker.location.slice(0, 50)}...` : worker.location) : 'Location pending'}
                          </span>
                          <span className="admin-worker-workload-chip">
                            <Zap size={11} className={worker.activeIssuesCount > 2 ? 'text-amber-500 inline mr-1' : 'text-emerald-500 inline mr-1'} />
                            {worker.activeIssuesCount || 0} active {worker.activeIssuesCount === 1 ? 'task' : 'tasks'} · {worker.workload || 'Low'} workload
                          </span>
                        </div>
                      </div>
                      <div className={`admin-status ${worker.availability === 'Unavailable' ? 'admin-status-inactive' : 'admin-status-active'}`}>
                        {worker.availability}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function AdminIssues({ issues, workers, onUpdate }) {
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [assignmentFilter, setAssignmentFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const departments = departmentOptions;

  // Real-time KPI metrics
  const totalCount = issues.length;
  const unassignedCount = issues.filter((i) => !i.assignedWorker && i.status !== 'Resolved').length;
  const criticalCount = issues.filter((i) => (i.priority === 'Critical' || i.priority === 'High') && i.status !== 'Resolved').length;
  const inProgressCount = issues.filter((i) => i.status === 'In progress').length;
  const resolvedCount = issues.filter((i) => i.status === 'Resolved').length;

  const filteredIssues = issues
    .filter((issue) => {
      // Status tab filtering
      if (statusTab === 'unassigned') {
        if (issue.assignedWorker || issue.status === 'Resolved') return false;
      } else if (statusTab !== 'all') {
        if (issue.status !== statusTab) return false;
      }

      // Search query across fields
      if (search.trim()) {
        const query = search.toLowerCase();
        const reporterName = issue.reporter?.name || '';
        const reporterEmail = issue.reporter?.email || '';
        const assignedName = issue.assignedWorker?.name || '';
        const category = issue.category || '';
        const description = issue.description || '';
        const location = issue.location || '';
        const aiTitle = issue.aiTitle || '';
        const match =
          category.toLowerCase().includes(query) ||
          description.toLowerCase().includes(query) ||
          location.toLowerCase().includes(query) ||
          reporterName.toLowerCase().includes(query) ||
          reporterEmail.toLowerCase().includes(query) ||
          assignedName.toLowerCase().includes(query) ||
          aiTitle.toLowerCase().includes(query);
        if (!match) return false;
      }

      // Priority filter
      if (priorityFilter !== 'All' && issue.priority !== priorityFilter) return false;

      // Department filter
      if (departmentFilter !== 'All' && issue.department !== departmentFilter) return false;

      // Worker assignment filter
      if (assignmentFilter === 'Assigned' && !issue.assignedWorker) return false;
      if (assignmentFilter === 'Unassigned' && issue.assignedWorker) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'priority') {
        const rank = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return (rank[b.priority] || 0) - (rank[a.priority] || 0);
      }
      return 0;
    });

  const clearFilters = () => {
    setSearch('');
    setStatusTab('all');
    setPriorityFilter('All');
    setDepartmentFilter('All');
    setAssignmentFilter('All');
    setSortBy('newest');
  };

  const hasActiveFilters = search || statusTab !== 'all' || priorityFilter !== 'All' || departmentFilter !== 'All' || assignmentFilter !== 'All' || sortBy !== 'newest';

  return (
    <section className="dashboard-panel admin-issues-panel">
      {/* Executive Operational KPI Metrics */}
      <div className="admin-kpi-grid">
        <div 
          onClick={() => { setStatusTab('all'); setPriorityFilter('All'); }} 
          className={`admin-kpi-card ${statusTab === 'all' && priorityFilter === 'All' ? 'kpi-active' : ''}`}
          title="Click to view all issues"
        >
          <div className="kpi-icon-wrap kpi-icon-total">
            <Radio size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number">{totalCount}</span>
            <span className="kpi-label">Total Reports</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusTab('unassigned')} 
          className={`admin-kpi-card ${statusTab === 'unassigned' ? 'kpi-active' : ''}`}
          title="Click to view unassigned complaints"
        >
          <div className="kpi-icon-wrap kpi-icon-unassigned">
            <AlertTriangle size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number">{unassignedCount}</span>
            <span className="kpi-label">Needs Dispatch</span>
          </div>
        </div>

        <div 
          onClick={() => { setPriorityFilter('Critical'); setStatusTab('all'); }} 
          className={`admin-kpi-card ${priorityFilter === 'Critical' ? 'kpi-active' : ''}`}
          title="Click to filter critical urgency issues"
        >
          <div className="kpi-icon-wrap kpi-icon-critical">
            <Zap size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number">{criticalCount}</span>
            <span className="kpi-label">Urgent / Critical</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusTab('In progress')} 
          className={`admin-kpi-card ${statusTab === 'In progress' ? 'kpi-active' : ''}`}
          title="Click to filter issues currently in progress"
        >
          <div className="kpi-icon-wrap kpi-icon-inprogress">
            <Navigation size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number">{inProgressCount}</span>
            <span className="kpi-label">In Field Work</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusTab('Resolved')} 
          className={`admin-kpi-card ${statusTab === 'Resolved' ? 'kpi-active' : ''}`}
          title="Click to filter resolved issues"
        >
          <div className="kpi-icon-wrap kpi-icon-resolved">
            <CheckCircle2 size={19} />
          </div>
          <div className="kpi-data">
            <span className="kpi-number">{resolvedCount}</span>
            <span className="kpi-label">Resolved</span>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="admin-filter-bar">
        <div className="admin-status-tabs" aria-label="Filter complaints by status">
          <button
            type="button"
            onClick={() => setStatusTab('all')}
            className={`status-tab-btn ${statusTab === 'all' ? 'tab-active' : ''}`}
          >
            All Reports <span className="tab-badge">{totalCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusTab('unassigned')}
            className={`status-tab-btn ${statusTab === 'unassigned' ? 'tab-active' : ''}`}
          >
            Needs Dispatch <span className="tab-badge tab-badge-warning">{unassignedCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusTab('Submitted')}
            className={`status-tab-btn ${statusTab === 'Submitted' ? 'tab-active' : ''}`}
          >
            Submitted <span className="tab-badge">{issues.filter(i => i.status === 'Submitted').length}</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusTab('In review')}
            className={`status-tab-btn ${statusTab === 'In review' ? 'tab-active' : ''}`}
          >
            In Review <span className="tab-badge">{issues.filter(i => i.status === 'In review').length}</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusTab('In progress')}
            className={`status-tab-btn ${statusTab === 'In progress' ? 'tab-active' : ''}`}
          >
            In Progress <span className="tab-badge">{inProgressCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusTab('Resolved')}
            className={`status-tab-btn ${statusTab === 'Resolved' ? 'tab-active' : ''}`}
          >
            Resolved <span className="tab-badge tab-badge-success">{resolvedCount}</span>
          </button>
        </div>

        {/* Search & Multi-Filter Toolbar */}
        <div className="admin-search-toolbar">
          <div className="search-input-wrap">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, citizen, location, or keyword..."
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="search-clear-btn" aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="toolbar-dropdowns">
            <div className="custom-select-wrap">
              <Filter size={13} className="text-slate-400" />
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} aria-label="Priority filter">
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="custom-select-wrap">
              <Briefcase size={13} className="text-slate-400" />
              <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} aria-label="Department filter">
                <option value="All">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="custom-select-wrap">
              <UserCheck size={13} className="text-slate-400" />
              <select value={assignmentFilter} onChange={(e) => setAssignmentFilter(e.target.value)} aria-label="Assignment filter">
                <option value="All">All Staffing</option>
                <option value="Assigned">Assigned Only</option>
                <option value="Unassigned">Unassigned Only</option>
              </select>
            </div>

            <div className="custom-select-wrap">
              <Clock size={13} className="text-slate-400" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort order">
                <option value="newest">Newest First</option>
                <option value="priority">Highest Urgency</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="btn-reset-filters">
                <X size={13} /> Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="admin-results-count">
        <strong>{filteredIssues.length}</strong>
        <span>of {issues.length} civic issues matching active view</span>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="admin-empty-users py-12 text-center">
          <AlertTriangle size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-slate-700 text-sm">No complaints match the current search or filters.</p>
          <p className="text-slate-400 text-xs mt-1">Try resetting the filters or modifying your search query.</p>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="btn-reset-filters mt-4 mx-auto">
              Reset all filters
            </button>
          )}
        </div>
      ) : (
        <div className="admin-issues-list">
          {filteredIssues.map((issue) => (
            <AdminIssueCard
              key={issue.id}
              issue={issue}
              workers={workers}
              departments={departments}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function AdminIssueCard({ issue, workers, departments, onUpdate }) {
  const [draft, setDraft] = useState({
    priority: issue.priority || 'Medium',
    department: issue.department || '',
    location: issue.location || '',
    status: issue.status || 'Submitted',
    assignedWorker: issue.assignedWorker?.id || (typeof issue.assignedWorker === 'string' ? issue.assignedWorker : ''),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showDispatcher, setShowDispatcher] = useState(false);
  const [imageModal, setImageModal] = useState(null);
  const [showReporters, setShowReporters] = useState(false);

  // Parse GPS coordinates for issue
  let issueLat = typeof issue.latitude === 'number' ? issue.latitude : null;
  let issueLon = typeof issue.longitude === 'number' ? issue.longitude : null;
  if ((issueLat === null || issueLon === null) && issue.location) {
    const match = issue.location.match(/\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/);
    if (match) {
      issueLat = parseFloat(match[1]);
      issueLon = parseFloat(match[2]);
    }
  }

  // Calculate live proximity and workload for every field worker
  const proximityWorkers = workers.map((worker) => {
    let wLat = typeof worker.latitude === 'number' ? worker.latitude : null;
    let wLon = typeof worker.longitude === 'number' ? worker.longitude : null;
    if ((wLat === null || wLon === null) && worker.location) {
      const match = worker.location.match(/\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/);
      if (match) {
        wLat = parseFloat(match[1]);
        wLon = parseFloat(match[2]);
      }
    }

    const dist = (issueLat !== null && issueLon !== null && wLat !== null && wLon !== null)
      ? calculateDistanceKm(issueLat, issueLon, wLat, wLon)
      : null;

    return {
      ...worker,
      distanceKm: dist,
      distanceText: dist !== null ? formatDistance(dist) : null,
      isVeryClose: dist !== null && dist <= 2.5,
      isClose: dist !== null && dist <= 8,
      isDeptMatch: worker.department && (draft.department ? worker.department === draft.department : (issue.department ? worker.department === issue.department : true)),
    };
  }).sort((a, b) => {
    if (a.distanceKm !== null && b.distanceKm !== null) {
      return a.distanceKm - b.distanceKm;
    }
    if (a.distanceKm !== null) return -1;
    if (b.distanceKm !== null) return 1;
    return (a.activeIssuesCount || 0) - (b.activeIssuesCount || 0);
  });

  // Top closest field workers for rapid dispatch recommendation
  const nearbyRecommendations = proximityWorkers.slice(0, 3);

  // Currently assigned worker record (enriched with live distance & stats)
  const currentAssignedId = draft.assignedWorker || (typeof issue.assignedWorker === 'object' ? issue.assignedWorker?.id : issue.assignedWorker);
  const currentAssignedWorker = proximityWorkers.find((w) => w.id === currentAssignedId) || 
    (typeof issue.assignedWorker === 'object' && issue.assignedWorker?.name ? issue.assignedWorker : null);

  const updateDraft = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  const submitChanges = async () => {
    setMessage('');
    setError('');
    setIsSaving(true);
    try {
      await onUpdate(issue.id, draft);
      setSaveSuccess(true);
      setMessage('Changes saved successfully.');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const reviewProof = async (proofReviewStatus) => {
    try {
      await onUpdate(issue.id, { proofReviewStatus });
      setMessage(`Proof ${proofReviewStatus.toLowerCase()} successfully.`);
    } catch (err) {
      setError(err.message);
    }
  };

  // Priority styling classes
  const priorityClass = 
    draft.priority === 'Critical' ? 'card-priority-critical' :
    draft.priority === 'High' ? 'card-priority-high' :
    draft.priority === 'Medium' ? 'card-priority-medium' :
    'card-priority-low';

  const priorityChipClass = 
    draft.priority === 'Critical' ? 'priority-chip-critical' :
    draft.priority === 'High' ? 'priority-chip-high' :
    draft.priority === 'Medium' ? 'priority-chip-medium' :
    'priority-chip-low';

  // Status badge classes
  const statusPillClass =
    draft.status === 'Submitted' ? 'status-pill-submitted' :
    draft.status === 'In review' ? 'status-pill-in-review' :
    draft.status === 'In progress' ? 'status-pill-in-progress' :
    'status-pill-resolved';

  return (
    <article className={`admin-issue-card ${priorityClass}`}>
      {/* Lightbox / Image Preview Modal */}
      {imageModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900 border border-white/20 p-2" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              onClick={() => setImageModal(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer"
              aria-label="Close enlarged preview"
            >
              <X size={18} />
            </button>
            <img src={imageModal} alt="Enlarged evidence" className="w-full h-auto max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Top Header Row: Category, Priority, Department & Status */}
      <div className="admin-issue-card-top">
        <div className="admin-issue-tag-group">
          <span className="category-chip">
            <Layers size={12} /> {issue.category}
          </span>

          {/* Citizen Report Count Badge */}
          <span
            className={`category-chip ${
              (issue.reportCount || 1) > 1
                ? 'border-amber-400 bg-amber-50 text-amber-900 font-bold'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
            title={`${issue.reportCount || 1} citizens filed this incident report`}
          >
            <Zap
              size={12}
              className={(issue.reportCount || 1) > 1 ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}
            />
            <span>
              {issue.reportCount || 1} {(issue.reportCount || 1) === 1 ? 'Citizen Report' : 'Citizen Reports'}
            </span>
          </span>

          <span className={`priority-chip ${priorityChipClass}`}>
            <span className="relative flex h-2 w-2">
              {draft.priority === 'Critical' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${draft.priority === 'Critical' ? 'bg-red-500' : draft.priority === 'High' ? 'bg-amber-500' : draft.priority === 'Medium' ? 'bg-blue-500' : 'bg-slate-400'}`} />
            </span>
            {draft.priority} Priority
          </span>
          {issue.department && (
            <span className="dept-tag">
              <Briefcase size={11} /> {issue.department}
            </span>
          )}
        </div>

        <div className="admin-issue-header-right">
          <span className={`status-pill ${statusPillClass}`}>
            {draft.status === 'Resolved' ? <CheckCircle2 size={13} /> : <Radio size={12} className="animate-pulse" />}
            {draft.status}
          </span>
          <span className="issue-timestamp" title={new Date(issue.createdAt).toLocaleString()}>
            <Clock size={12} /> {new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Main Issue Content & Citizen Report */}
      <div className="issue-main-content">
        <h2 className="issue-title">{issue.aiTitle || issue.description}</h2>
        
        {issue.aiTitle && (
          <p className="issue-citizen-desc">
            <strong className="text-slate-800 font-bold block mb-1">Citizen's original report:</strong>
            {issue.description}
          </p>
        )}

        {/* Reporter Info & Geo-Coordinates */}
        <div className="issue-meta-row flex-wrap">
          <span className="meta-chip">
            <User size={13} className="text-slate-400" />
            <span>Reported by <strong>{issue.reporter?.name || 'Anonymous Citizen'}</strong></span>
            {issue.reporter?.email && (
              <a href={`mailto:${issue.reporter.email}`} className="text-blue-600 hover:underline">
                ({issue.reporter.email})
              </a>
            )}
          </span>

          <span className="meta-chip" title={issue.location}>
            <MapPin size={13} className="text-blue-600 shrink-0" />
            <span className="truncate max-w-sm">{issue.location || 'Location details pending'}</span>
          </span>

          {/* Co-reporters toggle badge if multiple reports exist */}
          {(issue.reportCount || 1) > 1 && (
            <button
              type="button"
              onClick={() => setShowReporters(!showReporters)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold text-amber-800 transition cursor-pointer"
              title="View all citizens who reported this duplicate incident"
            >
              <Users size={13} className="text-amber-600" />
              <span>{issue.reportCount} Citizens Reported</span>
              <ChevronDown size={13} className={`transform transition-transform ${showReporters ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Expandable Co-Reporters Showcase Drawer */}
        {(issue.reportCount || 1) > 1 && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/40 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-amber-600" />
                <span className="text-xs font-bold text-amber-950">
                  Citizen Reporting History ({issue.reportCount} Co-Reports Recorded)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowReporters(!showReporters)}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer"
              >
                {showReporters ? 'Hide Co-Reporters' : 'Show All Co-Reporters'}
              </button>
            </div>

            {showReporters && (
              <div className="space-y-2 pt-2 border-t border-amber-200/60">
                {/* 1. Original Reporter Entry */}
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <strong className="text-slate-900">{issue.reporter?.name || 'Citizen'}</strong>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                        First / Original Reporter
                      </span>
                      {issue.reporter?.email && (
                        <span className="text-slate-400 text-[11px]">({issue.reporter.email})</span>
                      )}
                    </div>
                    <p className="text-slate-600 mt-1 text-[11px]">{issue.description}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* 2. Subsequent Co-Reporters Entries */}
                {issue.duplicateReporters && issue.duplicateReporters.map((dup, index) => (
                  <div key={dup.id || index} className="p-2.5 rounded-lg bg-white border border-amber-200 text-xs flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="text-slate-900">{dup.user?.name || `Citizen #${index + 2}`}</strong>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                          Duplicate Reporter #{index + 1}
                        </span>
                        {dup.user?.email && (
                          <span className="text-slate-400 text-[11px]">({dup.user.email})</span>
                        )}
                      </div>
                      {dup.description && (
                        <p className="text-slate-600 mt-1 text-[11px] italic">
                          "{dup.description}"
                        </p>
                      )}
                      {dup.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setImageModal(dup.imageUrl)}
                          className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          <Eye size={11} /> View Co-Reporter Photo Evidence
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {dup.reportedAt ? new Date(dup.reportedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Gemini AI Civic Triage Analysis Banner */}
      {(issue.aiTitle || issue.aiDescription || issue.aiDetectedCategory || issue.aiSummary) && (
        <div className="issue-ai-box">
          <div className="issue-ai-box-heading">
            <span>
              <CivicIntelligenceIcon size={14} className="text-sky-600" /> Gemini Civic Intelligence Engine
            </span>
            <strong>{issue.aiDetectedCategory || issue.category}</strong>
          </div>
          {issue.aiTitle && <h3>{issue.aiTitle}</h3>}
          {issue.aiDescription && <p>{issue.aiDescription}</p>}
          {issue.aiSummary && <small>AI Recommendation: {issue.aiSummary}</small>}
        </div>
      )}

      {/* Evidence & Completion Proof Showcase */}
      {(issue.imageUrl || issue.workerProofImage) && (
        <div className="issue-media-gallery">
          {issue.imageUrl && (
            <div className="evidence-card">
              <img 
                src={issue.imageUrl} 
                alt={`Evidence for ${issue.category}`} 
                onClick={() => setImageModal(issue.imageUrl)}
                title="Click to zoom in"
              />
              <div className="evidence-card-info">
                <span className="evidence-card-title">Citizen Evidence Photo</span>
                <button 
                  type="button" 
                  onClick={() => setImageModal(issue.imageUrl)} 
                  className="text-blue-600 hover:text-blue-800 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Eye size={12} /> View 4K
                </button>
              </div>
            </div>
          )}

          {issue.workerProofImage && (
            <div className="admin-proof-review-card">
              <div className="proof-review-header">
                <strong>Field Work Completion Proof</strong>
                <span className={`proof-review-status-pill ${issue.proofReviewStatus === 'Approved' ? 'proof-approved' : issue.proofReviewStatus === 'Rejected' ? 'proof-rejected' : 'proof-pending'}`}>
                  {issue.proofReviewStatus || 'Pending Review'}
                </span>
              </div>
              <div className="flex gap-3 items-start">
                <img 
                  src={issue.workerProofImage} 
                  alt="Worker completion proof" 
                  className="w-20 h-20 rounded-lg object-cover border border-amber-300 cursor-pointer"
                  onClick={() => setImageModal(issue.workerProofImage)}
                  title="Click to view worker proof"
                />
                <div className="flex-1">
                  <p className="text-[11px] text-amber-900 leading-snug">
                    Worker submitted photographic proof of completed restoration. Review before approving resolution.
                  </p>
                  <div className="proof-actions-row">
                    <button
                      type="button"
                      onClick={() => reviewProof('Approved')}
                      className="admin-issue-action admin-issue-verify"
                    >
                      <CheckCircle2 size={13} /> Approve Proof
                    </button>
                    <button
                      type="button"
                      onClick={() => reviewProof('Rejected')}
                      className="admin-issue-action admin-issue-reject"
                    >
                      <X size={13} /> Reject Proof
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* HERO SECTION: FIELD OFFICER ASSIGNMENT & REAL-TIME PROXIMITY DISPATCH HUB */}
      {/* ========================================================================= */}
      <div className="admin-worker-section">
        {currentAssignedWorker ? (
          /* State A: Officer is Currently Assigned */
          <div className="admin-worker-profile-card">
            <div className="worker-profile-ribbon">
              <ShieldCheck size={14} className="text-blue-600" />
              <span>Assigned Field Officer · Operations Active</span>
            </div>

            <div className="worker-profile-main">
              <div className="worker-profile-left">
                <div className="worker-avatar-box">
                  {currentAssignedWorker.profileImage ? (
                    <img src={currentAssignedWorker.profileImage} alt={currentAssignedWorker.name} />
                  ) : (
                    <span>{currentAssignedWorker.name?.charAt(0).toUpperCase() || 'W'}</span>
                  )}
                  <span 
                    className={`worker-status-dot ${currentAssignedWorker.availability === 'Unavailable' ? 'dot-unavailable' : currentAssignedWorker.activeIssuesCount > 0 ? 'dot-busy' : 'dot-available'}`} 
                    title={`Status: ${currentAssignedWorker.availability || 'Active'}`}
                  />
                </div>

                <div className="worker-identity">
                  <div className="worker-name-title">
                    <strong>{currentAssignedWorker.name}</strong>
                    <ShieldCheck size={14} className="worker-badge-verified" title="Verified Municipal Worker" />
                  </div>

                  <span className="worker-dept-skill">
                    {currentAssignedWorker.department || 'Civic Infrastructure'} · {currentAssignedWorker.jobSkill || 'Field Technician'} {currentAssignedWorker.yearsExperience ? `(${currentAssignedWorker.yearsExperience} yrs exp)` : ''}
                  </span>

                  {/* Distance, Workload & Active Tasks Chips */}
                  <div className="worker-chips-row">
                    {/* Live Distance Pill */}
                    <span 
                      className={`chip-distance ${currentAssignedWorker.isVeryClose ? 'chip-distance-close' : ''}`}
                      title={currentAssignedWorker.location || 'Location tracking active'}
                    >
                      <Navigation size={12} className="text-blue-600" />
                      <span>{currentAssignedWorker.distanceText || (currentAssignedWorker.location ? `${currentAssignedWorker.location.slice(0, 32)}...` : 'GPS Verified')}</span>
                    </span>

                    {/* Active Tasks & Workload Pill */}
                    <span className={`chip-tasks ${currentAssignedWorker.activeIssuesCount > 2 ? 'chip-workload-high' : ''}`}>
                      <Zap size={12} className={currentAssignedWorker.activeIssuesCount > 2 ? 'text-red-500' : 'text-amber-500'} />
                      <span>{currentAssignedWorker.activeIssuesCount || 0} active {currentAssignedWorker.activeIssuesCount === 1 ? 'task' : 'tasks'} ({currentAssignedWorker.workload || 'Low'} workload)</span>
                    </span>

                    {/* Availability Tag */}
                    <span className="chip-contact">
                      <UserCheck size={12} className="text-slate-400" />
                      <span>{currentAssignedWorker.availability || 'Available'}</span>
                    </span>

                    {/* Contact Phone if present */}
                    {currentAssignedWorker.phone && (
                      <a href={`tel:${currentAssignedWorker.phone}`} className="chip-contact hover:text-blue-600">
                        <Phone size={11} className="text-slate-400" />
                        <span>{currentAssignedWorker.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Assigned Officer */}
              <div className="worker-profile-actions">
                <button
                  type="button"
                  onClick={() => setShowDispatcher(!showDispatcher)}
                  className="btn-reassign-worker"
                >
                  <RefreshCw size={12} /> {showDispatcher ? 'Close Dispatcher' : 'Reassign Worker'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateDraft('assignedWorker', '');
                    setShowDispatcher(true);
                  }}
                  className="btn-unassign-worker"
                  title="Remove assignment"
                >
                  <X size={12} /> Unassign
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* State B: No Worker Assigned (Prompt to Dispatch) */
          <div className="admin-unassigned-notice">
            <div className="unassigned-notice-text">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-amber-600" />
              </div>
              <div>
                <h4>No Field Personnel Assigned</h4>
                <p>This incident requires municipal dispatch. Select a nearby officer below based on shortest distance and availability.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDispatcher(true)}
              className="btn-dispatch-trigger"
            >
              <Navigation size={13} /> {showDispatcher ? 'Hide Dispatcher' : 'Open Proximity Dispatcher'}
            </button>
          </div>
        )}

        {/* Smart Proximity Dispatcher Drawer (Interactive Grid of Nearby Personnel) */}
        {(showDispatcher || !currentAssignedWorker) && (
          <div className="admin-dispatcher-hub">
            <div className="dispatcher-hub-header">
              <div className="dispatcher-hub-title">
                <Compass size={16} className="text-blue-600" />
                <span>Nearby Field Personnel (Live GPS Proximity)</span>
              </div>
              <span className="dispatcher-subtext">Ranked by closest distance to incident site</span>
            </div>

            {/* Quick-Dispatch Cards (Top 3 Closest Personnel) */}
            <div className="dispatcher-grid">
              {nearbyRecommendations.map((worker) => {
                const isSelected = draft.assignedWorker === worker.id;
                return (
                  <div
                    key={worker.id}
                    className={`dispatcher-card ${isSelected ? 'dispatcher-card-selected' : ''}`}
                  >
                    <div className="dispatcher-card-top">
                      <div>
                        <strong className="dispatcher-worker-name block">{worker.name}</strong>
                        <span className="dispatcher-worker-sub block">{worker.department} · {worker.jobSkill || 'Field Ops'}</span>
                      </div>
                      <span className={`dispatcher-dist-tag ${worker.isVeryClose ? 'dist-tag-very-close' : 'dist-tag-close'}`}>
                        <Navigation size={10} /> {worker.distanceText || 'Distance active'}
                      </span>
                    </div>

                    <div className="dispatcher-card-metrics">
                      <span className="flex items-center gap-1">
                        <Zap size={11} className={worker.activeIssuesCount > 2 ? 'text-amber-500' : 'text-emerald-500'} />
                        {worker.activeIssuesCount || 0} active {worker.activeIssuesCount === 1 ? 'task' : 'tasks'}
                      </span>
                      <span>{worker.workload} workload</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        updateDraft('assignedWorker', worker.id);
                        if (worker.department && !draft.department) {
                          updateDraft('department', worker.department);
                        }
                      }}
                      className={`btn-dispatch-select ${isSelected ? 'btn-is-assigned' : ''}`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 size={13} /> Assigned to Incident
                        </>
                      ) : (
                        <>
                          <UserCheck size={13} /> Quick Dispatch ({worker.distanceText || 'Assign'})
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Complete Staffing Directory Select */}
            <div className="dispatcher-directory-row">
              <label>Select any registered worker across all departments:</label>
              <select
                value={draft.assignedWorker}
                onChange={(event) => updateDraft('assignedWorker', event.target.value)}
              >
                <option value="">-- Leave Unassigned --</option>
                {proximityWorkers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} · {worker.department || 'No dept'} {worker.distanceText ? `[📍 ${worker.distanceText}]` : ''} · {worker.activeIssuesCount || 0} tasks ({worker.workload} workload) · {worker.availability}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Inline Quick-Edit Controls & Save Action Bar */}
      <div className="admin-issue-controls-row">
        <div className="control-field">
          <label><Filter size={11} /> Priority</label>
          <select value={draft.priority} onChange={(event) => updateDraft('priority', event.target.value)}>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <div className="control-field">
          <label><Briefcase size={11} /> Department</label>
          <select value={draft.department} onChange={(event) => updateDraft('department', event.target.value)}>
            <option value="">Select department</option>
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </div>

        <div className="control-field">
          <label><Radio size={11} /> Status Workflow</label>
          <select value={draft.status} onChange={(event) => updateDraft('status', event.target.value)}>
            <option>Submitted</option>
            <option>In review</option>
            <option>In progress</option>
            <option>Resolved</option>
          </select>
        </div>

        <div className="control-field">
          <label><MapPin size={11} /> Location Address</label>
          <input
            value={draft.location}
            onChange={(event) => updateDraft('location', event.target.value)}
            placeholder="Address or GPS coordinates"
          />
        </div>

        <div className="control-actions">
          <button 
            type="button" 
            onClick={submitChanges} 
            disabled={isSaving}
            className={`btn-save-issue ${saveSuccess ? 'btn-saved-success' : ''}`}
          >
            {isSaving ? (
              <>
                <RefreshCw size={13} className="animate-spin" /> Saving...
              </>
            ) : saveSuccess ? (
              <>
                <Check size={14} /> Saved!
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>

      {/* Save status notifications */}
      {(message || error) && (
        <div className="mt-3 flex items-center gap-2">
          {message && <span className="admin-issue-save-message">{message}</span>}
          {error && <span className="admin-issue-error-message">{error}</span>}
        </div>
      )}
    </article>
  );
}

const defaultWorkerSkills = [
  'Road maintenance',
  'Waste management',
  'Plumbing',
  'Emergency response',
  'Landscaping',
  'Electrical repair',
];

function AdminCreateWorker({ departments = [], onWorkerCreated, onCancel }) {
  const initialForm = {
    name: '',
    email: '',
    password: '',
    phone: '',
    department: departments[0] || 'Roads and Infrastructure',
    jobSkill: defaultWorkerSkills[0],
    serviceArea: '',
    yearsExperience: '',
    availability: 'Available',
    location: '',
  };

  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      const data = await apiRequest('/admin/workers', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...form,
          yearsExperience: Number(form.yearsExperience) || 0,
        }),
      });
      setMessage('Worker account created successfully. They can now log in with the email and password provided.');
      setForm(initialForm);
      if (onWorkerCreated && data?.worker) {
        onWorkerCreated(data.worker);
      }
    } catch (requestError) {
      setError(
        requestError.details
          ? `${requestError.message}: ${requestError.details}`
          : requestError.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={onCancel}
          className="profile-back-link cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={14} /> Back to Field Officers
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form className="worker-form space-y-6" onSubmit={submit}>
        <div className="worker-form-section dashboard-panel">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-sm font-bold text-slate-900">Identity & System Access</h2>
            <p className="text-xs text-slate-500">Provide personal credentials for mobile/field app authentication.</p>
          </div>
          <div className="worker-form-grid">
            <WorkerInputField
              label="Full name"
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="Alex Morgan"
              icon={<UserRound size={15} />}
            />
            <WorkerInputField
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="alex@smartcity.local"
              icon={<Mail size={15} />}
            />
            <WorkerInputField
              label="Phone number"
              name="phone"
              value={form.phone}
              onChange={updateField}
              placeholder="+1 555 0100"
              icon={<Phone size={15} />}
            />
            <WorkerInputField
              label="Worker password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="Minimum 6 characters"
              icon={<KeyRound size={15} />}
            />
          </div>
        </div>

        <div className="worker-form-section dashboard-panel">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-sm font-bold text-slate-900">Service Assignment</h2>
            <p className="text-xs text-slate-500">Assign operational ward jurisdiction and municipal specialty.</p>
          </div>
          <div className="worker-form-grid">
            <WorkerSelectField
              label="Department"
              name="department"
              value={form.department}
              onChange={updateField}
              options={departments}
            />
            <WorkerSelectField
              label="Job / skill"
              name="jobSkill"
              value={form.jobSkill}
              onChange={updateField}
              options={defaultWorkerSkills}
            />
            <WorkerInputField
              label="Service area / ward"
              name="serviceArea"
              value={form.serviceArea}
              onChange={updateField}
              placeholder="Ward 04 - North District"
              icon={<MapPin size={15} />}
            />
            <WorkerInputField
              label="Location"
              name="location"
              value={form.location}
              onChange={updateField}
              placeholder="North operations hub"
              icon={<Navigation size={15} />}
            />
            <WorkerInputField
              label="Years of experience"
              name="yearsExperience"
              type="number"
              min="0"
              value={form.yearsExperience}
              onChange={updateField}
              placeholder="5"
              icon={<Briefcase size={15} />}
            />
            <WorkerSelectField
              label="Availability"
              name="availability"
              value={form.availability}
              onChange={updateField}
              options={['Available', 'On duty', 'Unavailable']}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="dashboard-primary-button cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Creating Worker...</span>
              </>
            ) : (
              <>
                <span>Create Worker Account</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function WorkerInputField({ label, icon, ...props }) {
  return (
    <label className="worker-field block">
      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
        {icon}
        {label}
      </span>
      <input
        required
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
        {...props}
      />
    </label>
  );
}

function WorkerSelectField({ label, name, value, onChange, options }) {
  return (
    <label className="worker-field block">
      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
        {label}
      </span>
      <select
        required
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}