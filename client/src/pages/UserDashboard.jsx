import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Briefcase,
  CheckCircle2,
  Clock,
  Eye,
  FileWarning,
  Home,
  Layers,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Radio,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserRound,
  X,
  Zap,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { apiRequest, getAuthHeaders } from '../config/api';

const pages = [
  { label: 'Overview', icon: Home, href: '/dashboard' },
  { label: 'Report an issue', icon: FileWarning, href: '/report-issue' },
  { label: 'AI issue assistant', icon: Sparkles, href: '/ai-report' },
  { label: 'My reports', icon: Layers, href: '/reports' },
  { label: 'Nearby activity', icon: Activity, href: '/activity' },
  { label: 'Notifications', icon: Bell, href: '/notifications' },
];

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [myIssues, setMyIssues] = useState([]);
  const [communityIssues, setCommunityIssues] = useState([]);
  const [activeTab, setActiveTab] = useState('my-reports');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [userData, myIssuesData, communityData] = await Promise.all([
        apiRequest('/auth/me', { headers: getAuthHeaders() }),
        apiRequest('/issues', { headers: getAuthHeaders() }),
        apiRequest('/issues/community', { headers: getAuthHeaders() }).catch(() => ({ issues: [] })),
      ]);
      setUser(userData.user);
      setMyIssues(myIssuesData.issues || []);
      setCommunityIssues(communityData.issues || []);
      setError('');
    } catch (requestError) {
      if (requestError.message?.includes('token') || requestError.message?.includes('unauthorized') || requestError.message?.includes('User not found')) {
        localStorage.removeItem('smart_city_token');
        localStorage.removeItem('smart_city_user');
      }
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const refreshInterval = window.setInterval(loadDashboardData, 15000);
    const handleFocus = () => loadDashboardData();
    window.addEventListener('focus', handleFocus);
    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('smart_city_token');
    localStorage.removeItem('smart_city_user');
    window.dispatchEvent(new Event('auth-logout'));
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (error && !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900 font-sans">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">Session Error</p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Please log in again</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{error}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 cursor-pointer"
          >
            Return to Login
          </button>
        </div>
      </main>
    );
  }

  if (loading || !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-blue-600">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-blue-600" size={28} />
          <span>Synchronizing live civic intelligence...</span>
        </div>
      </main>
    );
  }

  const totalUserReports = myIssues.length;
  const inProgressUserReports = myIssues.filter((i) => i.status === 'In progress' || i.status === 'In review' || i.status === 'Submitted').length;
  const resolvedUserReports = myIssues.filter((i) => i.status === 'Resolved').length;
  const userResolutionRate = totalUserReports > 0 ? Math.round((resolvedUserReports / totalUserReports) * 100) : 100;
  const totalCommunitySignals = communityIssues.length;

  const filteredMyIssues = myIssues.filter((issue) => {
    if (filterStatus === 'resolved') return issue.status === 'Resolved';
    if (filterStatus === 'active') return issue.status !== 'Resolved';
    return true;
  });

  const initials = user.name?.trim().charAt(0).toUpperCase() || 'C';

  const urgentAlerts = communityIssues.filter(
    (i) => (i.priority === 'Critical' || i.priority === 'High') && i.status !== 'Resolved'
  );

  return (
    <main className="dashboard-page min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar isAuthenticated user={user} onLogout={logout} />

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
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
            <img src={selectedImage} alt="Evidence preview" className="w-full h-auto max-h-[85vh] object-contain rounded-xl" />
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
          {pages.map(({ label, icon: Icon, href }, index) => (
            <a
              key={label}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`dashboard-sidebar-link ${index === 0 ? 'dashboard-sidebar-link-active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === 'My reports' && totalUserReports > 0 && (
                <span className="dashboard-notification-count">{totalUserReports}</span>
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
          <span>Citizen Portal</span>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-heading-row">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  <ShieldCheck size={13} className="text-blue-600" /> Verified Resident
                </span>
                <span className="text-xs font-semibold text-slate-400">· Community Contributor</span>
              </div>
              <h1 className="dashboard-heading">Welcome, {user.name}</h1>
              <p className="dashboard-description">
                Real-time tracking of civic issues, field crew dispatch, and municipal resolutions in your ward.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a href="/ai-report" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-sky-300 bg-gradient-to-r from-sky-50 to-blue-50 text-blue-700 text-xs font-bold shadow-xs hover:border-sky-400 hover:shadow-sm transition">
                <Sparkles size={16} className="text-sky-600" />
                <span>AI Photo Assistant</span>
              </a>
              <a href="/report-issue" className="dashboard-primary-button">
                <Plus size={16} /> Report an issue
              </a>
            </div>
          </div>

          {urgentAlerts.length > 0 && (
            <div className="mt-6 p-4 rounded-xl border border-amber-200 bg-amber-50/80 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
                <AlertTriangle size={18} />
              </div>
              <div className="flex-1 text-xs">
                <strong className="font-bold text-amber-900 block">
                  Active Civic Alert ({urgentAlerts.length} urgent {urgentAlerts.length === 1 ? 'incident' : 'incidents'} in city)
                </strong>
                <p className="text-amber-800 mt-0.5">
                  Municipal crews are currently dispatched for <strong>{urgentAlerts[0].category}</strong> at {urgentAlerts[0].location}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('community-signals')}
                className="text-xs font-bold text-amber-900 underline hover:text-amber-950 shrink-0 cursor-pointer"
              >
                View signals →
              </button>
            </div>
          )}

          <div className="dashboard-stat-grid">
            <div className="dashboard-stat-card border-l-4 border-l-blue-600">
              <div className="dashboard-stat-top">
                <span>My Reports</span>
                <Layers size={18} className="text-blue-600" />
              </div>
              <strong>{totalUserReports}</strong>
              <small className="flex items-center justify-between">
                <span>Submitted by you</span>
                <a href="/reports" className="text-blue-600 font-bold hover:underline">View all →</a>
              </small>
            </div>

            <div className="dashboard-stat-card border-l-4 border-l-amber-500">
              <div className="dashboard-stat-top">
                <span>Active & In Progress</span>
                <Clock size={18} className="text-amber-600" />
              </div>
              <strong className="text-amber-600">{inProgressUserReports}</strong>
              <small>
                {inProgressUserReports > 0 ? `${inProgressUserReports} awaiting field resolution` : 'All your complaints resolved'}
              </small>
            </div>

            <div className="dashboard-stat-card border-l-4 border-l-emerald-600">
              <div className="dashboard-stat-top">
                <span>Resolved</span>
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
              <strong className="text-emerald-600">{resolvedUserReports}</strong>
              <small className="flex items-center gap-1">
                <span className="font-bold text-emerald-700">{userResolutionRate}%</span>
                <span>completion rate</span>
              </small>
            </div>

            <div className="dashboard-stat-card border-l-4 border-l-indigo-600">
              <div className="dashboard-stat-top">
                <span>Live Community Signals</span>
                <Radio size={18} className="text-indigo-600 animate-pulse" />
              </div>
              <strong className="text-indigo-900">{totalCommunitySignals}</strong>
              <small>Active city-wide incidents</small>
            </div>
          </div>

          <div className="dashboard-lower-grid mt-6">
            <div className="space-y-6">
              <section className="dashboard-panel">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('my-reports')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        activeTab === 'my-reports'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      My Reports ({totalUserReports})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('community-signals')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        activeTab === 'community-signals'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Community Signals ({totalCommunitySignals})
                    </button>
                  </div>

                  {activeTab === 'my-reports' && totalUserReports > 0 && (
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-600">
                      <button
                        type="button"
                        onClick={() => setFilterStatus('all')}
                        className={`px-2.5 py-1 rounded-md text-[11px] cursor-pointer ${filterStatus === 'all' ? 'bg-white shadow-xs font-bold text-slate-900' : ''}`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterStatus('active')}
                        className={`px-2.5 py-1 rounded-md text-[11px] cursor-pointer ${filterStatus === 'active' ? 'bg-white shadow-xs font-bold text-slate-900' : ''}`}
                      >
                        Active ({inProgressUserReports})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterStatus('resolved')}
                        className={`px-2.5 py-1 rounded-md text-[11px] cursor-pointer ${filterStatus === 'resolved' ? 'bg-white shadow-xs font-bold text-slate-900' : ''}`}
                      >
                        Resolved ({resolvedUserReports})
                      </button>
                    </div>
                  )}
                </div>

                {activeTab === 'my-reports' && (
                  <div className="mt-4">
                    {myIssues.length === 0 ? (
                      <div className="dashboard-empty-state py-12 text-center">
                        <span>
                          <Plus size={22} />
                        </span>
                        <strong>No civic issues reported yet</strong>
                        <p>
                          Help keep your neighborhood clean and safe. Report broken streetlights, potholes, water leaks, or waste accumulation.
                        </p>
                        <a href="/report-issue" className="dashboard-primary-button mt-4">
                          File your first complaint <ArrowRight size={14} />
                        </a>
                      </div>
                    ) : filteredMyIssues.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No reports match the selected filter.
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {filteredMyIssues.map((issue) => (
                          <CitizenIssueCard
                            key={issue.id}
                            issue={issue}
                            onViewImage={(img) => setSelectedImage(img)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'community-signals' && (
                  <div className="mt-4">
                    <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                      <span>Public civic signals across the municipality</span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Live DB Sync
                      </span>
                    </div>

                    {communityIssues.length === 0 ? (
                      <div className="dashboard-empty-state py-8 text-center">
                        <Radio size={24} className="text-slate-400 mx-auto mb-2" />
                        <strong>No community incidents recorded yet</strong>
                        <p>When residents report issues, they will appear here as live civic signals.</p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {communityIssues.map((cIssue) => (
                          <div
                            key={cIssue.id}
                            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="category-chip">
                                  {cIssue.category}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                    cIssue.priority === 'Critical'
                                      ? 'bg-red-100 text-red-700'
                                      : cIssue.priority === 'High'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {cIssue.priority || 'Medium'}
                                </span>
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Clock size={11} /> {new Date(cIssue.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <strong className="text-slate-800 text-sm block truncate">
                                {cIssue.aiTitle || cIssue.description}
                              </strong>
                              <span className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                                <MapPin size={12} className="text-blue-500 shrink-0" />
                                <span className="truncate">{cIssue.location}</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                  cIssue.status === 'Resolved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : cIssue.status === 'In progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {cIssue.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <section className="dashboard-panel">
                <div className="dashboard-panel-heading">
                  <h2>Citizen Profile</h2>
                  <a href="/profile" className="text-xs font-bold text-blue-600 hover:underline">
                    Edit Profile
                  </a>
                </div>

                <div className="dashboard-profile">
                  <div className="dashboard-avatar">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={`${user.name} profile`} />
                    ) : (
                      initials
                    )}
                  </div>
                  <div>
                    <strong>{user.name}</strong>
                    <span className="text-xs text-slate-500 capitalize">{user.role} Account</span>
                  </div>
                </div>

                <dl className="dashboard-profile-details">
                  <div>
                    <dt>Email Address</dt>
                    <dd>{user.email}</dd>
                  </div>
                  <div>
                    <dt>Phone Number</dt>
                    <dd>{user.phone || 'Not added yet'}</dd>
                  </div>
                  <div>
                    <dt>Account Verification</dt>
                    <dd className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> Active & Verified
                    </dd>
                  </div>
                  <div>
                    <dt>Member Since</dt>
                    <dd>{new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
                  </div>
                </dl>
              </section>

              <section className="dashboard-panel bg-gradient-to-br from-blue-900 to-slate-900 text-white border-0 shadow-lg">
                <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={14} /> AI Civic Assistant
                </div>
                <h3 className="text-base font-bold text-white mb-1">Instant Infrastructure Diagnosis</h3>
                <p className="text-slate-300 text-xs leading-relaxed mb-4">
                  Take a photo of any damaged road, leak, or electrical fault. Gemini AI categorizes it in seconds and files the report.
                </p>
                <a
                  href="/ai-report"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
                >
                  <Sparkles size={14} /> Launch AI Camera Assistant
                </a>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function CitizenIssueCard({ issue, onViewImage }) {
  const currentStatus = issue.status || 'Submitted';
  const isResolved = currentStatus === 'Resolved';
  const isInProgress = currentStatus === 'In progress';
  const isInReview = currentStatus === 'In review';

  const step1Done = true;
  const step2Done = isInReview || isInProgress || isResolved;
  const step3Done = Boolean(issue.assignedWorker) || isInProgress || isResolved;
  const step4Done = isResolved;

  return (
    <article className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="category-chip">
            <Layers size={11} /> {issue.category}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              issue.priority === 'Critical'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : issue.priority === 'High'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {issue.priority || 'Medium'} Priority
          </span>
          {(issue.reportCount || 1) > 1 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              <Zap size={10} className="text-amber-600 fill-amber-600" />
              {issue.reportCount} Citizen Reports
            </span>
          )}
          {issue.isCoReported && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Co-reported with Community
            </span>
          )}
          {issue.department && (
            <span className="dept-tag">
              <Briefcase size={10} /> {issue.department}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
              isResolved
                ? 'bg-emerald-100 text-emerald-800'
                : isInProgress
                ? 'bg-blue-100 text-blue-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isResolved ? <CheckCircle2 size={13} /> : <Radio size={12} className="animate-pulse" />}
            {currentStatus}
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock size={11} /> {new Date(issue.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-sm font-bold text-slate-900 leading-snug">
          {issue.aiTitle || issue.description}
        </h3>
        {issue.aiTitle && (
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {issue.description}
          </p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <MapPin size={13} className="text-blue-600" />
            <span className="truncate max-w-xs">{issue.location}</span>
          </span>
          {issue.assignedWorker && (
            <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
              <UserCheck size={13} className="text-emerald-600" />
              <span>Assigned Field Officer: <strong>{issue.assignedWorker.name}</strong> ({issue.assignedWorker.department || 'Infrastructure'})</span>
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Resolution Lifecycle
        </p>
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col items-center text-center">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
              ✓
            </div>
            <span className="text-[10px] font-bold text-slate-700 mt-1">Submitted</span>
            <small className="text-[9px] text-slate-400">{new Date(issue.createdAt).toLocaleDateString()}</small>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-xs ${
              step2Done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {step2Done ? '✓' : '2'}
            </div>
            <span className={`text-[10px] font-bold mt-1 ${step2Done ? 'text-slate-800' : 'text-slate-400'}`}>Triage</span>
            <small className="text-[9px] text-slate-400">{step2Done ? 'AI Classified' : 'Pending'}</small>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-xs ${
              step3Done ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-200 text-slate-500'
            }`}>
              {step3Done ? '✓' : '3'}
            </div>
            <span className={`text-[10px] font-bold mt-1 ${step3Done ? 'text-blue-700' : 'text-slate-400'}`}>Dispatched</span>
            <small className="text-[9px] text-slate-400">{issue.assignedWorker ? issue.assignedWorker.name : 'In Progress'}</small>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-xs ${
              step4Done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {step4Done ? '✓' : '4'}
            </div>
            <span className={`text-[10px] font-bold mt-1 ${step4Done ? 'text-emerald-800' : 'text-slate-400'}`}>Resolved</span>
            <small className="text-[9px] text-slate-400">{step4Done ? 'Verified' : 'In Progress'}</small>
          </div>
        </div>
      </div>

      {(issue.imageUrl || issue.workerProofImage) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-4">
          {issue.imageUrl && (
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 max-w-xs">
              <img
                src={issue.imageUrl}
                alt="Citizen evidence"
                className="w-12 h-12 rounded object-cover cursor-pointer hover:opacity-90"
                onClick={() => onViewImage(issue.imageUrl)}
              />
              <div className="text-[11px]">
                <strong className="block font-bold text-slate-700">Citizen Evidence</strong>
                <button
                  type="button"
                  onClick={() => onViewImage(issue.imageUrl)}
                  className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <Eye size={11} /> View Photo
                </button>
              </div>
            </div>
          )}

          {issue.workerProofImage && (
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 max-w-xs">
              <img
                src={issue.workerProofImage}
                alt="Worker completion proof"
                className="w-12 h-12 rounded object-cover cursor-pointer hover:opacity-90 border border-emerald-300"
                onClick={() => onViewImage(issue.workerProofImage)}
              />
              <div className="text-[11px]">
                <strong className="block font-bold text-emerald-900">Work Completed Proof</strong>
                <span className="text-emerald-700 block text-[10px]">
                  Status: {issue.proofReviewStatus || 'Pending Admin Approval'}
                </span>
                <button
                  type="button"
                  onClick={() => onViewImage(issue.workerProofImage)}
                  className="text-emerald-800 font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <Eye size={11} /> View Proof
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
