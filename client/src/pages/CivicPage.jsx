import { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bell,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Compass,
  ExternalLink,
  Eye,
  FileWarning,
  Filter,
  Home,
  Layers,
  Locate,
  LogOut,
  MapPin,
  Menu,
  Navigation,
  Radio,
  RefreshCw,
  Search,
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
import { calculateDistanceKm, formatDistance, getUserCurrentLocation } from '../utils/geolocation';

const civicCategories = [
  'All',
  'Roads & Potholes',
  'Garbage & Sanitation',
  'Water Supply',
  'Electricity',
  'Streetlights',
  'Drainage',
  'Traffic',
  'Other',
];

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
    description: 'Civic issues reported within 5 km of your location, sorted by closest proximity.',
    icon: Activity,
    emptyTitle: 'No nearby community activity',
    emptyText: 'No civic reports filed within 5 km of your current GPS position.',
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
  ['AI issue assistant', Sparkles, '/ai-report'],
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

  // Proximity Radar & Geolocation state for /activity
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [radiusKm, setRadiusKm] = useState(5); // Default 5 km radius
  const [showAllCityWide, setShowAllCityWide] = useState(false);
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('All');

  const content = pageData[pagePath] || pageData['/reports'];
  const PageIcon = content.icon;

  const detectLocation = async () => {
    setIsLocating(true);
    setLocationError('');
    try {
      const loc = await getUserCurrentLocation();
      setUserLocation(loc);
      return loc;
    } catch (err) {
      console.warn('Geolocation detection error:', err);
      setLocationError(err.message || 'Unable to access your GPS position. Please check your browser location permissions.');
      return null;
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    if (pagePath === '/activity') {
      detectLocation();
    }
  }, [pagePath]);

  const loadPageData = async () => {
    try {
      const commUrl = userLocation?.latitude && userLocation?.longitude
        ? `/issues/community?lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=${showAllCityWide ? 'all' : radiusKm}`
        : '/issues/community';

      const [userData, myIssuesData, communityData] = await Promise.all([
        apiRequest('/auth/me', { headers: getAuthHeaders() }),
        apiRequest('/issues', { headers: getAuthHeaders() }),
        apiRequest(commUrl, { headers: getAuthHeaders() }).catch(() => ({ issues: [] })),
      ]);
      setUser(userData.user);
      setReports(myIssuesData.issues || []);
      setCommunityIssues(communityData.issues || []);
    } catch (requestError) {
      localStorage.removeItem('smart_city_token');
      setError(requestError.message);
    }
  };

  useEffect(() => {
    loadPageData();
    const refreshTimer = window.setInterval(loadPageData, 12000);
    window.addEventListener('focus', loadPageData);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener('focus', loadPageData);
    };
  }, [pagePath, userLocation?.latitude, userLocation?.longitude, radiusKm, showAllCityWide]);

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

  // Extract coordinates and compute distance to user for each community issue
  const processedCommunityIssues = communityIssues.map((item) => {
    let iLat = typeof item.latitude === 'number' ? item.latitude : null;
    let iLon = typeof item.longitude === 'number' ? item.longitude : null;
    if ((iLat === null || iLon === null) && item.location) {
      const m = item.location.match(/\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/);
      if (m) {
        iLat = parseFloat(m[1]);
        iLon = parseFloat(m[2]);
      }
    }

    let distKm = null;
    if (userLocation?.latitude != null && userLocation?.longitude != null && iLat != null && iLon != null) {
      distKm = calculateDistanceKm(userLocation.latitude, userLocation.longitude, iLat, iLon);
    } else if (typeof item.distanceKm === 'number') {
      distKm = item.distanceKm;
    }

    return {
      ...item,
      extractedLat: iLat,
      extractedLon: iLon,
      distanceKm: distKm,
      distanceText: distKm !== null ? formatDistance(distKm) : null,
    };
  });

  // Filter and sort: most nearby issue first within 5 km radius
  const nearbyIssues = processedCommunityIssues
    .filter((item) => {
      // 1. Proximity filter: if user location is known and not in showAllCityWide mode, enforce radius (default 5 km)
      if (userLocation && !showAllCityWide) {
        if (item.distanceKm === null || item.distanceKm > radiusKm) {
          return false;
        }
      }

      // 2. Category filter
      if (activityCategoryFilter !== 'All' && item.category !== activityCategoryFilter) {
        return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCat = item.category?.toLowerCase().includes(q);
        const matchesTitle = item.aiTitle?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesLoc = item.location?.toLowerCase().includes(q);
        const matchesReporter = item.reporter?.name?.toLowerCase().includes(q);
        if (!matchesCat && !matchesTitle && !matchesDesc && !matchesLoc && !matchesReporter) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // Sort closest first! (most nearby issue on top)
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      // Secondary sort: newest first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const totalWithin5Km = processedCommunityIssues.filter(
    (i) => i.distanceKm !== null && i.distanceKm <= 5
  ).length;

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
              {label === 'Nearby activity' && totalWithin5Km > 0 && (
                <span className="dashboard-notification-count bg-emerald-600 text-white font-bold">{totalWithin5Km}</span>
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
                            {(report.reportCount || 1) > 1 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                                <Zap size={10} className="text-amber-600 fill-amber-600" />
                                {report.reportCount} Citizen Reports
                              </span>
                            )}
                            {report.isCoReported && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                Co-reported with Community
                              </span>
                            )}
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

          {/* VIEW 2: NEARBY COMMUNITY ACTIVITY (5 KM PROXIMITY RADAR) */}
          {pagePath === '/activity' && (
            <div className="mt-6 space-y-4">
              {/* Proximity Command Bar */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">Live Proximity Radar</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                        {showAllCityWide ? 'All City Incidents' : `Within ${radiusKm} km Radius`}
                      </span>
                    </div>

                    {userLocation ? (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                        <MapPin size={13} className="text-rose-500 shrink-0" />
                        <span className="font-semibold text-slate-700">{userLocation.address || userLocation.locationString}</span>
                        <span className="text-[11px] text-slate-400">· GPS Accuracy ±{Math.round(userLocation.accuracy || 10)}m</span>
                      </p>
                    ) : isLocating ? (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1.5 animate-pulse font-medium">
                        <RefreshCw size={13} className="animate-spin" />
                        Detecting your satellite GPS coordinates...
                      </p>
                    ) : locationError ? (
                      <p className="text-xs text-amber-700 mt-1 flex items-center gap-1.5 font-medium">
                        <AlertCircle size={13} className="shrink-0 text-amber-600" />
                        {locationError}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Navigation size={13} className="text-blue-500 shrink-0" />
                        Location detection ready. Click "Refresh GPS" to synchronize nearest issues.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      title="Refresh current GPS position"
                    >
                      <RefreshCw size={13} className={isLocating ? 'animate-spin text-blue-600' : 'text-slate-500'} />
                      <span>{isLocating ? 'Locating...' : 'Refresh GPS'}</span>
                    </button>
                  </div>
                </div>

                {/* Radius Filter & Issue Count */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                      <Compass size={13} /> Radius:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRadiusKm(5);
                        setShowAllCityWide(false);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        !showAllCityWide && radiusKm === 5
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      5 km (Closest)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRadiusKm(10);
                        setShowAllCityWide(false);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        !showAllCityWide && radiusKm === 10
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      10 km
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRadiusKm(25);
                        setShowAllCityWide(false);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        !showAllCityWide && radiusKm === 25
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      25 km
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAllCityWide(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        showAllCityWide
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      City-Wide (All)
                    </button>
                  </div>

                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    ⚡ {nearbyIssues.length} {nearbyIssues.length === 1 ? 'Incident' : 'Incidents'} {!showAllCityWide && `Within ${radiusKm} km`}
                  </span>
                </div>

                {/* Search and Category Filters */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter nearby incidents by category, title, description, or reporter..."
                      className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 transition"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                    {civicCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActivityCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                          activityCategoryFilter === cat
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Incidents List or Empty States */}
              {nearbyIssues.length === 0 ? (
                <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {userLocation && !showAllCityWide
                        ? `No civic issues reported within ${radiusKm} km`
                        : 'No matching civic incidents found'}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      {userLocation && !showAllCityWide
                        ? `Great news! There are zero citizen-reported civic issues within a ${radiusKm} km radius of your current GPS location. Your neighborhood is looking clean and operational.`
                        : 'No reports match your current filters. Try changing your search keywords or switching category filters.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
                    {!showAllCityWide && (
                      <button
                        type="button"
                        onClick={() => setShowAllCityWide(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <Navigation size={13} />
                        View all city-wide incidents ({processedCommunityIssues.length})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={detectLocation}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      Refresh GPS location
                    </button>
                    <a
                      href="/report-issue"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition"
                    >
                      <FileWarning size={13} />
                      Report an issue in this area
                    </a>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {nearbyIssues.map((item, index) => (
                    <article
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-2xl border bg-white shadow-xs hover:shadow-md transition-shadow flex flex-col gap-3 ${
                        index === 0 && item.distanceKm !== null && item.distanceKm <= 5
                          ? 'border-emerald-400 ring-2 ring-emerald-400/20'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Rank #1 Pill */}
                          {index === 0 && item.distanceKm !== null && item.distanceKm <= 5 && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider shadow-xs flex items-center gap-1">
                              <Compass size={11} className="animate-spin" /> #1 Most Nearby
                            </span>
                          )}

                          {/* Distance Badge */}
                          {item.distanceKm !== null ? (
                            item.distanceKm < 0.3 ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs inline-flex items-center gap-1 shadow-xs animate-pulse">
                                <Zap size={12} className="fill-white" />
                                {Math.round(item.distanceKm * 1000)}m away · Closest
                              </span>
                            ) : item.distanceKm < 1.0 ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs inline-flex items-center gap-1 border border-emerald-200">
                                <MapPin size={12} className="text-emerald-600" />
                                {Math.round(item.distanceKm * 1000)}m away
                              </span>
                            ) : item.distanceKm < 3.0 ? (
                              <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 font-extrabold text-xs inline-flex items-center gap-1 border border-sky-200">
                                <Navigation size={12} className="text-sky-600" />
                                {item.distanceKm.toFixed(2)} km away
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-xs inline-flex items-center gap-1 border border-indigo-200">
                                <Navigation size={12} className="text-indigo-600" />
                                {item.distanceKm.toFixed(2)} km away
                              </span>
                            )
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-xs inline-flex items-center gap-1 border border-slate-200">
                              <MapPin size={12} /> Distance pending GPS
                            </span>
                          )}

                          {/* Category Chip */}
                          <span className="category-chip text-xs font-semibold">
                            {item.category}
                          </span>

                          {/* Priority Badge */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              item.priority === 'Critical'
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : item.priority === 'High'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {item.priority || 'Medium'} Priority
                          </span>

                          {/* Duplicate Reports Counter */}
                          {item.reportCount > 1 ? (
                            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1 shadow-2xs">
                              <Zap size={12} className="fill-amber-500 text-amber-600" />
                              {item.reportCount} Citizens Reported
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              1 Report
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                              item.status === 'Resolved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : item.status === 'In progress'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {item.status === 'Resolved' && <CheckCircle2 size={13} />}
                            {item.status === 'In progress' && <Clock size={13} />}
                            {item.status}
                          </span>
                        </div>
                      </div>

                      {/* Title and Content */}
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {item.aiTitle || item.description}
                        </h4>

                        {item.aiSummary && (
                          <div className="mt-2 p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-start gap-1.5">
                            <Sparkles size={13} className="text-blue-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>AI Insight:</strong> {item.aiSummary}
                            </span>
                          </div>
                        )}

                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Location & Map Directions */}
                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin size={13} className="text-rose-500 shrink-0" />
                          <span>{item.location}</span>
                        </span>
                        {item.extractedLat && item.extractedLon && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${item.extractedLat},${item.extractedLon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-[11px] font-bold inline-flex items-center gap-0.5 ml-1 shrink-0"
                          >
                            <ExternalLink size={11} /> Open in Maps
                          </a>
                        )}
                      </div>

                      {/* Assigned Worker */}
                      {item.assignedWorker && (
                        <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-center gap-2">
                          <UserCheck size={14} className="text-blue-600 shrink-0" />
                          <span>
                            Field Officer: <strong>{item.assignedWorker.name}</strong> · {item.assignedWorker.department || 'Civic Infrastructure'}
                          </span>
                        </div>
                      )}

                      {/* Image Evidence & Verification Proof */}
                      {(item.imageUrl || item.workerProofImage) && (
                        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
                          {item.imageUrl && (
                            <button
                              type="button"
                              onClick={() => setSelectedImage(item.imageUrl)}
                              className="inline-flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs"
                            >
                              <img src={item.imageUrl} alt="Citizen evidence" className="w-10 h-10 rounded object-cover" />
                              <span className="font-semibold text-slate-700">Citizen photo</span>
                            </button>
                          )}
                          {item.workerProofImage && (
                            <button
                              type="button"
                              onClick={() => setSelectedImage(item.workerProofImage)}
                              className="inline-flex items-center gap-2 p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 cursor-pointer text-xs"
                            >
                              <img src={item.workerProofImage} alt="Completion proof" className="w-10 h-10 rounded object-cover border border-emerald-300" />
                              <div className="text-left">
                                <span className="font-bold text-emerald-900 block">Restoration proof</span>
                                <small className="text-emerald-700 text-[10px]">{item.proofReviewStatus || 'Under review'}</small>
                              </div>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Card Footer: Submitter info and timestamp */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex-wrap gap-2">
                        <span className="flex items-center gap-1.5 font-medium text-slate-600">
                          <UserRound size={12} className="text-slate-400" />
                          Reported by <strong>{item.reporter?.name || 'Citizen'}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {formatReportDate(item.createdAt)}
                        </span>
                        <span>Incident ID: #{String(item.id).slice(-8).toUpperCase()}</span>
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