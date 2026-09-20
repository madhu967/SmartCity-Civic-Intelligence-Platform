import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  ExternalLink,
  Eye,
  FileImage,
  Filter,
  Layers,
  LoaderCircle,
  Locate,
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
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
  X,
  Zap,
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
import { CivicStatCard } from '../components/CivicStatCard';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { apiRequest, getAuthHeaders } from '../config/api';
import { getUserCurrentLocation, calculateDistanceKm, formatDistance } from '../utils/geolocation';

const issueCategories = [
  'Roads & Potholes',
  'Garbage & Sanitation',
  'Water Supply',
  'Electricity',
  'Streetlights',
  'Drainage',
  'Traffic',
];

const pages = [
  { id: 'overview', label: 'Overview', icon: CivicCommandMatrixIcon, href: '/dashboard' },
  { id: 'report-issue', label: 'Report an issue', icon: MunicipalIncidentIcon, href: '/report-issue' },
  { id: 'ai-report', label: 'Vision Triage Engine', icon: CivicIntelligenceIcon, href: '/ai-report', isAi: true },
  { id: 'reports', label: 'My reports', icon: MunicipalDocketIcon, href: '/reports' },
  { id: 'activity', label: 'Ward telemetry', icon: WardTelemetryIcon, href: '/activity' },
  { id: 'notifications', label: 'Incident alerts', icon: PriorityBeaconIcon, href: '/notifications' },
];

const initialReportForm = {
  category: issueCategories[0],
  location: '',
  latitude: null,
  longitude: null,
  description: '',
  image: '',
  aiTitle: '',
  aiDescription: '',
  aiDetectedCategory: '',
  aiSummary: '',
};

export default function UserDashboard({ initialNav = '/dashboard' }) {
  const getNavFromPath = (path) => {
    const clean = (path || window.location.pathname).replace(/\/+$/, '') || '/dashboard';
    if (clean === '/reports') return 'reports';
    if (clean === '/activity') return 'activity';
    if (clean === '/notifications') return 'notifications';
    if (clean === '/report-issue') return 'report-issue';
    if (clean === '/ai-report') return 'ai-report';
    if (clean === '/profile') return 'profile';
    return 'overview';
  };

  const [activeNav, setActiveNav] = useState(() => getNavFromPath(initialNav));
  const [user, setUser] = useState(null);
  const [myIssues, setMyIssues] = useState([]);
  const [communityIssues, setCommunityIssues] = useState([]);
  const [activeTab, setActiveTab] = useState('my-reports');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- Subview state: Report Issue ---
  const [reportForm, setReportForm] = useState(initialReportForm);
  const [reportImagePreview, setReportImagePreview] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isDetectingCategory, setIsDetectingCategory] = useState(false);
  const [isLocatingReport, setIsLocatingReport] = useState(false);
  const [reportLocationStatus, setReportLocationStatus] = useState('');
  const [reportSuccessMsg, setReportSuccessMsg] = useState('');
  const [reportErrorMsg, setReportErrorMsg] = useState('');
  const [duplicateAlert, setDuplicateAlert] = useState(null);

  // --- Subview state: AI Vision Triage ---
  const [aiImage, setAiImage] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiError, setAiError] = useState('');

  // --- Subview state: Ward Telemetry / Activity ---
  const [activityLocation, setActivityLocation] = useState(null);
  const [isLocatingActivity, setIsLocatingActivity] = useState(false);
  const [activityRadiusKm, setActivityRadiusKm] = useState(5);
  const [showAllCityWide, setShowAllCityWide] = useState(false);
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('All');
  const [activitySearchQuery, setActivitySearchQuery] = useState('');

  // --- Subview state: Profile ---
  const [profileImageDraft, setProfileImageDraft] = useState('');
  const [profilePhoneDraft, setProfilePhoneDraft] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

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
      setProfilePhoneDraft(userData.user?.phone || '');
      setError('');
    } catch (requestError) {
      if (
        requestError.message?.includes('token') ||
        requestError.message?.includes('unauthorized') ||
        requestError.message?.includes('User not found')
      ) {
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

  // Listen to browser Back/Forward (popstate) to switch views seamlessly
  useEffect(() => {
    const handlePopState = () => {
      const navKey = getNavFromPath(window.location.pathname);
      setActiveNav(navKey);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronize when initialNav prop changes from parent
  useEffect(() => {
    if (initialNav) {
      const targetNav = getNavFromPath(initialNav);
      setActiveNav(targetNav);
    }
  }, [initialNav]);

  // Instant view change without page reload
  const handleNavChange = (navKey, href, e) => {
    if (e) e.preventDefault();
    setActiveNav(navKey);
    if (window.location.pathname !== href) {
      window.history.pushState({}, '', href);
    }
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const logout = () => {
    localStorage.removeItem('smart_city_token');
    localStorage.removeItem('smart_city_user');
    window.dispatchEvent(new Event('auth-logout'));
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Detect GPS for Report Issue Form
  const detectReportLocation = async () => {
    setIsLocatingReport(true);
    setReportLocationStatus('Detecting GPS location...');
    try {
      const loc = await getUserCurrentLocation();
      setReportForm((curr) => ({
        ...curr,
        location: loc.locationString,
        latitude: loc.latitude,
        longitude: loc.longitude,
      }));
      setReportLocationStatus('GPS coordinates locked');
    } catch (locErr) {
      console.warn('Geolocation detection error:', locErr);
      setReportLocationStatus(locErr.message || 'Location unavailable. You can enter it manually.');
    } finally {
      setIsLocatingReport(false);
    }
  };

  // Image Upload with Gemini Auto-categorization for Report Issue
  const handleReportImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setReportErrorMsg('Please choose an image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setReportErrorMsg('Please choose an image smaller than 5 MB.');
      return;
    }

    setReportErrorMsg('');
    setIsDetectingCategory(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      setReportImagePreview(base64);
      setReportForm((curr) => ({ ...curr, image: base64 }));
      try {
        const result = await apiRequest('/issues/detect-category', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ image: base64 }),
        });
        setReportForm((curr) => ({
          ...curr,
          category: issueCategories.includes(result.category) ? result.category : curr.category,
          description: result.description || curr.description,
          aiTitle: result.title || '',
          aiDescription: result.description || '',
          aiDetectedCategory: result.category || '',
          aiSummary: result.summary || '',
        }));
      } catch {
        // Fallback gracefully
      } finally {
        setIsDetectingCategory(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Report Issue Form
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportSuccessMsg('');
    setReportErrorMsg('');
    setDuplicateAlert(null);
    setIsSubmittingReport(true);
    try {
      const data = await apiRequest('/issues', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(reportForm),
      });

      if (data.isDuplicate) {
        setDuplicateAlert(data);
        setReportForm(initialReportForm);
        setReportImagePreview('');
        setReportLocationStatus('');
      } else {
        setReportForm(initialReportForm);
        setReportImagePreview('');
        setReportLocationStatus('');
        setReportSuccessMsg('Your civic report was submitted successfully. The municipal team has been dispatched.');
      }
      loadDashboardData();
    } catch (err) {
      setReportErrorMsg(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Vision Triage Engine Image Analysis
  const handleAiImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAiError('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAiError('Please choose an image smaller than 5 MB.');
      return;
    }

    setAiError('');
    setAiResult(null);
    setIsAnalyzingAi(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      setAiImage(base64);
      try {
        const analysis = await apiRequest('/issues/detect-category', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ image: base64 }),
        });
        setAiResult(analysis);
      } catch (err) {
        setAiError(err.message || 'Failed to analyze civic issue image.');
      } finally {
        setIsAnalyzingAi(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Transfer AI vision triage into report form
  const applyAiResultToReport = () => {
    if (!aiResult) return;
    setReportForm((curr) => ({
      ...curr,
      category: issueCategories.includes(aiResult.category) ? aiResult.category : curr.category,
      description: aiResult.description || aiResult.summary || curr.description,
      aiTitle: aiResult.title || '',
      aiDescription: aiResult.description || '',
      aiDetectedCategory: aiResult.category || '',
      aiSummary: aiResult.summary || '',
      image: aiImage || curr.image,
    }));
    setReportImagePreview(aiImage || '');
    handleNavChange('report-issue', '/report-issue');
  };

  // Detect GPS for Ward Activity
  const detectActivityLocation = async () => {
    setIsLocatingActivity(true);
    try {
      const loc = await getUserCurrentLocation();
      setActivityLocation(loc);
    } catch (err) {
      console.warn('Geolocation detection error for activity:', err);
    } finally {
      setIsLocatingActivity(false);
    }
  };

  // Save Profile Photo / Phone
  const handleSaveProfile = async () => {
    setIsUpdatingProfile(true);
    setProfileSuccessMsg('');
    try {
      const payload = {};
      if (profileImageDraft) payload.profileImage = profileImageDraft;
      if (profilePhoneDraft) payload.phone = profilePhoneDraft;
      const data = await apiRequest('/auth/profile', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      setUser(data.user);
      localStorage.setItem('smart_city_user', JSON.stringify(data.user));
      setProfileImageDraft('');
      setProfileSuccessMsg('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
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
    return <DashboardSkeleton role="citizen" statCardCount={4} sidebarItemCount={6} />;
  }

  // Metrics
  const totalUserReports = myIssues.length;
  const inProgressUserReports = myIssues.filter(
    (i) => i.status === 'In progress' || i.status === 'In review' || i.status === 'Submitted'
  ).length;
  const resolvedUserReports = myIssues.filter((i) => i.status === 'Resolved').length;
  const userResolutionRate = totalUserReports > 0 ? Math.round((resolvedUserReports / totalUserReports) * 100) : 100;
  const totalCommunitySignals = communityIssues.length;
  const notificationCount = myIssues.filter(
    (i) => i.assignedWorker || i.workerProofImage || i.status === 'Resolved'
  ).length;

  const filteredMyIssues = myIssues.filter((issue) => {
    if (filterStatus === 'resolved') return issue.status === 'Resolved';
    if (filterStatus === 'active') return issue.status !== 'Resolved';
    return true;
  });

  const initials = user.name?.trim().charAt(0).toUpperCase() || 'C';

  const urgentAlerts = communityIssues.filter(
    (i) => (i.priority === 'Critical' || i.priority === 'High') && i.status !== 'Resolved'
  );

  // Process community issues with distance calculations for Activity view
  const processedActivityIssues = communityIssues
    .map((item) => {
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
      if (activityLocation?.latitude != null && activityLocation?.longitude != null && iLat != null && iLon != null) {
        distKm = calculateDistanceKm(activityLocation.latitude, activityLocation.longitude, iLat, iLon);
      } else if (typeof item.distanceKm === 'number') {
        distKm = item.distanceKm;
      }

      return {
        ...item,
        distanceKm: distKm,
        distanceText: distKm !== null ? formatDistance(distKm) : null,
      };
    })
    .filter((item) => {
      if (activityLocation && !showAllCityWide) {
        if (item.distanceKm === null || item.distanceKm > activityRadiusKm) return false;
      }
      if (activityCategoryFilter !== 'All' && item.category !== activityCategoryFilter) return false;
      if (activitySearchQuery.trim()) {
        const q = activitySearchQuery.toLowerCase();
        const matchesCat = item.category?.toLowerCase().includes(q);
        const matchesTitle = item.aiTitle?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesLoc = item.location?.toLowerCase().includes(q);
        if (!matchesCat && !matchesTitle && !matchesDesc && !matchesLoc) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // Dynamic notification list derived from user's issues
  const notificationsList = [];
  myIssues.forEach((report) => {
    notificationsList.push({
      id: `${report.id}-created`,
      title: `Report Submitted: ${report.category}`,
      description: `Your incident at "${report.location}" was received by civic dispatch.`,
      time: report.createdAt,
      type: 'submitted',
      issue: report,
    });
    if (report.assignedWorker) {
      notificationsList.push({
        id: `${report.id}-assigned`,
        title: `Field Technician Assigned`,
        description: `${report.assignedWorker.name} (${report.assignedWorker.department || 'Infrastructure'}) was assigned to your report.`,
        time: report.updatedAt || report.createdAt,
        type: 'assigned',
        issue: report,
      });
    }
    if (report.workerProofImage) {
      notificationsList.push({
        id: `${report.id}-proof`,
        title: `Completion Proof Uploaded`,
        description: `Field officer uploaded photographic proof of resolution. Admin verification in progress.`,
        time: report.updatedAt || report.createdAt,
        type: 'proof',
        issue: report,
      });
    }
    if (report.status === 'Resolved') {
      notificationsList.push({
        id: `${report.id}-resolved`,
        title: `Incident Successfully Resolved`,
        description: `Your complaint has been verified and closed by municipal administration.`,
        time: report.updatedAt || report.createdAt,
        type: 'resolved',
        issue: report,
      });
    }
  });
  notificationsList.sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <main className="dashboard-page min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Lightbox / Evidence Viewer Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900 border border-white/20 p-2"
            onClick={(e) => e.stopPropagation()}
          >
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
          <p className="dashboard-sidebar-label">Citizen Workspace</p>
          <nav className="dashboard-sidebar-nav">
            {pages.map(({ id, label, icon: Icon, href, isAi }) => {
              const isActive = activeNav === id;
              return (
                <a
                  key={id}
                  href={href}
                  onClick={(e) => handleNavChange(id, href, e)}
                  className={`dashboard-sidebar-link ${isActive ? 'dashboard-sidebar-link-active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  {isAi && (
                    <span className="ml-auto px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
                      AI
                    </span>
                  )}
                  {id === 'reports' && totalUserReports > 0 && (
                    <span className="dashboard-notification-count">{totalUserReports}</span>
                  )}
                  {id === 'notifications' && notificationCount > 0 && (
                    <span className="dashboard-notification-count">{notificationCount}</span>
                  )}
                  {id === 'activity' && totalCommunitySignals > 0 && (
                    <span className="dashboard-notification-count bg-emerald-600 text-white">
                      {totalCommunitySignals}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="dashboard-sidebar-footer">
          <a
            href="/profile"
            onClick={(e) => handleNavChange('profile', '/profile', e)}
            className={`dashboard-sidebar-link ${activeNav === 'profile' ? 'dashboard-sidebar-link-active' : ''}`}
          >
            <UserRound size={18} />
            <span>Profile details</span>
          </a>
          <button
            type="button"
            onClick={logout}
            className="dashboard-sidebar-link dashboard-logout"
          >
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
                <span>Welcome back, {user?.name || 'Resident'}</span>
                <span className="dashboard-topbar-badge">
                  <VerifiedResolutionSeal size={12} className="text-blue-600" />
                  Verified Resident
                </span>
              </div>
              <p className="dashboard-topbar-sub">
                Ward 14 Civic Telemetry · Live Municipal Connection Active
              </p>
            </div>
          </div>

          <div className="dashboard-topbar-right">
            <button
              type="button"
              onClick={(e) => handleNavChange('ai-report', '/ai-report', e)}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:border-sky-500 hover:text-sky-600 transition cursor-pointer shadow-xs"
            >
              <CivicIntelligenceIcon size={14} className="text-sky-500" />
              <span>Vision Triage</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleNavChange('profile', '/profile', e)}
              className="dashboard-topbar-profile"
              title="View resident profile"
            >
              <div className="dashboard-topbar-avatar">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={`${user.name} avatar`} />
                ) : (
                  initials
                )}
              </div>
              <span className="hidden md:inline max-w-[120px] truncate">{user.name}</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="dashboard-topbar-logout"
              title="Log out of citizen portal"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </header>

        {/* Dynamic White Workspace Container */}
        <div className="dashboard-container">
          {/* =========================================================================
              VIEW 1: OVERVIEW (Default Dashboard)
             ========================================================================= */}
          {activeNav === 'overview' && (
            <div className="space-y-6">
              <div className="dashboard-heading-row">
                <div>
                  <p className="dashboard-eyebrow">Citizen Command Matrix</p>
                  <h1 className="dashboard-heading">Ward Overview & Telemetry</h1>
                  <p className="dashboard-description">
                    Real-time tracking of civic complaints, field crew dispatches, and municipal resolutions in your ward.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleNavChange('ai-report', '/ai-report', e)}
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-xs font-bold shadow-sm hover:bg-slate-800 hover:border-sky-500/50 transition group cursor-pointer"
                  >
                    <div className="p-1 rounded-md bg-sky-500/20 text-sky-400 group-hover:scale-110 transition">
                      <CivicIntelligenceIcon size={15} />
                    </div>
                    <span>Vision Triage Engine</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      AI
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleNavChange('report-issue', '/report-issue', e)}
                    className="dashboard-primary-button cursor-pointer"
                  >
                    <Plus size={16} /> Report an issue
                  </button>
                </div>
              </div>

              {urgentAlerts.length > 0 && (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/80 flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
                    <PriorityBeaconIcon size={18} />
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

              {/* Handcrafted Executive Civic Stat Cards with Animated Circular Radial Graphs */}
              <div className="dashboard-stat-grid">
                <CivicStatCard
                  title="My Reports"
                  value={totalUserReports}
                  subtitle="Recorded in municipal log"
                  icon={MunicipalDocketIcon}
                  variant="blue"
                  percentage={totalUserReports > 0 ? 100 : 0}
                  gaugeLabel={totalUserReports > 0 ? `${totalUserReports}` : '0'}
                  trend={totalUserReports > 0 ? `${totalUserReports} registered` : 'No reports'}
                  trendType="positive"
                  actionText="View all"
                  onAction={(e) => handleNavChange('reports', '/reports', e)}
                />

                <CivicStatCard
                  title="In Field Work"
                  value={inProgressUserReports}
                  subtitle={inProgressUserReports > 0 ? `${inProgressUserReports} awaiting fix` : 'All tasks addressed'}
                  icon={FieldOpsIcon}
                  variant="amber"
                  percentage={totalUserReports > 0 ? Math.round((inProgressUserReports / totalUserReports) * 100) : 0}
                  gaugeLabel={`${totalUserReports > 0 ? Math.round((inProgressUserReports / totalUserReports) * 100) : 0}%`}
                  trend={inProgressUserReports > 0 ? 'Dispatched' : 'Clear'}
                  trendType={inProgressUserReports > 0 ? 'neutral' : 'positive'}
                />

                <CivicStatCard
                  title="Resolved & Verified"
                  value={resolvedUserReports}
                  subtitle="Civic fixes verified"
                  icon={VerifiedResolutionSeal}
                  variant="emerald"
                  percentage={userResolutionRate}
                  gaugeLabel={`${userResolutionRate}%`}
                  trend={`${userResolutionRate}% completion`}
                  trendType="positive"
                />

                <CivicStatCard
                  title="Live Telemetry"
                  value={totalCommunitySignals}
                  subtitle="City-wide incident signals"
                  icon={WardTelemetryIcon}
                  variant="indigo"
                  isLive={true}
                  percentage={Math.min(100, Math.max(20, totalCommunitySignals > 0 ? Math.min(96, 25 + totalCommunitySignals * 6) : 85))}
                  gaugeLabel="Sync"
                  trend="Real-time"
                  trendType="live"
                />
              </div>

              {/* Lower Split Grid */}
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
                            <button
                              type="button"
                              onClick={(e) => handleNavChange('report-issue', '/report-issue', e)}
                              className="dashboard-primary-button mt-4 cursor-pointer"
                            >
                              File your first complaint <ArrowRight size={14} />
                            </button>
                          </div>
                        ) : filteredMyIssues.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            No reports match the selected filter.
                          </div>
                        ) : (
                          <div className="grid gap-4">
                            {filteredMyIssues.slice(0, 5).map((issue) => (
                              <CitizenIssueCard
                                key={issue.id}
                                issue={issue}
                                onViewImage={(img) => setSelectedImage(img)}
                              />
                            ))}
                            {filteredMyIssues.length > 5 && (
                              <button
                                type="button"
                                onClick={(e) => handleNavChange('reports', '/reports', e)}
                                className="w-full py-2.5 text-center text-xs font-bold text-blue-600 bg-blue-50/60 rounded-xl hover:bg-blue-100 transition cursor-pointer"
                              >
                                View all {filteredMyIssues.length} reports →
                              </button>
                            )}
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
                            {communityIssues.slice(0, 6).map((cIssue) => (
                              <div
                                key={cIssue.id}
                                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="category-chip">{cIssue.category}</span>
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
                  {/* Citizen Profile Summary */}
                  <section className="dashboard-panel">
                    <div className="dashboard-panel-heading">
                      <h2>Citizen Credentials</h2>
                      <button
                        type="button"
                        onClick={(e) => handleNavChange('profile', '/profile', e)}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Edit Profile
                      </button>
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
                        <dt>Residency Status</dt>
                        <dd className="text-emerald-600 font-bold flex items-center gap-1">
                          <VerifiedResolutionSeal size={14} /> Active Resident
                        </dd>
                      </div>
                      <div>
                        <dt>Member Since</dt>
                        <dd>
                          {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </dd>
                      </div>
                    </dl>
                  </section>

                  {/* Autonomous Vision Triage Card */}
                  <section className="dashboard-panel bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
                      <div className="p-1 rounded bg-sky-500/20 text-sky-400">
                        <CivicIntelligenceIcon size={14} />
                      </div>
                      <span>Autonomous Vision Triage</span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Instant Infrastructure Diagnosis</h3>
                    <p className="text-slate-300 text-xs leading-relaxed mb-4">
                      Upload photographic telemetry of fractured roads, drainage leaks, or power faults. The optical engine extracts severity vectors and files the report.
                    </p>
                    <button
                      type="button"
                      onClick={(e) => handleNavChange('ai-report', '/ai-report', e)}
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                    >
                      <OpticalVisionIcon size={15} /> Launch Vision Inspection
                    </button>
                  </section>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: MY REPORTS (/reports)
             ========================================================================= */}
          {activeNav === 'reports' && (
            <div className="space-y-6">
              <div className="dashboard-heading-row">
                <div>
                  <p className="dashboard-eyebrow">Civic Reporting</p>
                  <h1 className="dashboard-heading">My Incident Reports</h1>
                  <p className="dashboard-description">
                    Track the civic issues you have raised, inspect field technician assignments, and verify completions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleNavChange('report-issue', '/report-issue', e)}
                  className="dashboard-primary-button cursor-pointer"
                >
                  <Plus size={16} /> Report an issue
                </button>
              </div>

              <div className="dashboard-stat-grid grid-cols-1 sm:grid-cols-3">
                <CivicStatCard
                  title="Total Submitted"
                  value={totalUserReports}
                  subtitle="Recorded in municipal register"
                  icon={MunicipalDocketIcon}
                  variant="blue"
                  percentage={100}
                  gaugeLabel={`${totalUserReports}`}
                  trend="Logged"
                  trendType="positive"
                />
                <CivicStatCard
                  title="Active Work"
                  value={inProgressUserReports}
                  subtitle="Under review or dispatched"
                  icon={FieldOpsIcon}
                  variant="amber"
                  percentage={totalUserReports > 0 ? Math.round((inProgressUserReports / totalUserReports) * 100) : 0}
                  gaugeLabel={`${totalUserReports > 0 ? Math.round((inProgressUserReports / totalUserReports) * 100) : 0}%`}
                  trend={inProgressUserReports > 0 ? 'Underway' : 'Queue clear'}
                  trendType={inProgressUserReports > 0 ? 'neutral' : 'positive'}
                />
                <CivicStatCard
                  title="Resolved"
                  value={resolvedUserReports}
                  subtitle="Verified fixes completed"
                  icon={VerifiedResolutionSeal}
                  variant="emerald"
                  percentage={userResolutionRate}
                  gaugeLabel={`${userResolutionRate}%`}
                  trend={`${userResolutionRate}% velocity`}
                  trendType="positive"
                />
              </div>

              {/* Filter controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                      filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    All Reports ({totalUserReports})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('active')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                      filterStatus === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    In Progress ({inProgressUserReports})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('resolved')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                      filterStatus === 'resolved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Resolved ({resolvedUserReports})
                  </button>
                </div>
              </div>

              {/* Issue list */}
              {filteredMyIssues.length === 0 ? (
                <div className="dashboard-panel py-16 text-center">
                  <MunicipalDocketIcon size={36} className="text-slate-300 mx-auto mb-3" />
                  <h2 className="text-base font-bold text-slate-700">No reports found</h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {filterStatus !== 'all'
                      ? 'No complaints currently match this status filter.'
                      : 'You have not submitted any complaints yet. File a report to alert municipal teams.'}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => handleNavChange('report-issue', '/report-issue', e)}
                    className="dashboard-primary-button mt-4 cursor-pointer inline-flex"
                  >
                    <Plus size={15} /> File a complaint
                  </button>
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

          {/* =========================================================================
              VIEW 3: WARD TELEMETRY / NEARBY ACTIVITY (/activity)
             ========================================================================= */}
          {activeNav === 'activity' && (
            <div className="space-y-6">
              <div className="dashboard-heading-row">
                <div>
                  <p className="dashboard-eyebrow">Live Telemetry</p>
                  <h1 className="dashboard-heading">Nearby Community Activity</h1>
                  <p className="dashboard-description">
                    Civic issues reported near your location, sorted by closest proximity and real-time dispatch status.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleNavChange('report-issue', '/report-issue', e)}
                  className="dashboard-primary-button cursor-pointer"
                >
                  <Plus size={16} /> Report an issue
                </button>
              </div>

              {/* Proximity & GPS Control Bar */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={detectActivityLocation}
                    disabled={isLocatingActivity}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition cursor-pointer"
                  >
                    <Locate size={14} className={isLocatingActivity ? 'animate-spin' : ''} />
                    <span>{isLocatingActivity ? 'Detecting GPS...' : activityLocation ? 'GPS Calibrated' : 'Detect My GPS'}</span>
                  </button>
                  {activityLocation && (
                    <span className="text-xs text-slate-500">
                      Coordinates: {activityLocation.latitude.toFixed(4)}, {activityLocation.longitude.toFixed(4)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAllCityWide(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      !showAllCityWide ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Within 5 km
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAllCityWide(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      showAllCityWide ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    City-wide ({totalCommunitySignals})
                  </button>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {['All', ...issueCategories].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActivityCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      activityCategoryFilter === cat
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={activitySearchQuery}
                  onChange={(e) => setActivitySearchQuery(e.target.value)}
                  placeholder="Search by neighborhood, problem keyword, or road..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Cards Grid */}
              {processedActivityIssues.length === 0 ? (
                <div className="dashboard-panel py-12 text-center">
                  <WardTelemetryIcon size={34} className="text-slate-300 mx-auto mb-2" />
                  <h2 className="text-sm font-bold text-slate-700">No community activity found</h2>
                  <p className="text-xs text-slate-400 mt-1">No incidents match the chosen proximity or category filter.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {processedActivityIssues.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="category-chip">{item.category}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              item.priority === 'Critical'
                                ? 'bg-red-100 text-red-700'
                                : item.priority === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.priority || 'Medium'}
                          </span>
                          {item.distanceText && (
                            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                              📍 {item.distanceText}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock size={11} /> {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <strong className="text-slate-900 text-sm block truncate">
                          {item.aiTitle || item.description}
                        </strong>
                        <span className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-blue-500 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              VIEW 4: INCIDENT NOTIFICATIONS (/notifications)
             ========================================================================= */}
          {activeNav === 'notifications' && (
            <div className="space-y-6">
              <div className="dashboard-heading-row">
                <div>
                  <p className="dashboard-eyebrow">Updates & Timeline</p>
                  <h1 className="dashboard-heading">Incident Notifications</h1>
                  <p className="dashboard-description">
                    Real-time timeline of your reports, field technician assignments, completion proofs, and administrative verifications.
                  </p>
                </div>
              </div>

              {notificationsList.length === 0 ? (
                <div className="dashboard-panel py-16 text-center">
                  <PriorityBeaconIcon size={36} className="text-slate-300 mx-auto mb-3" />
                  <h2 className="text-base font-bold text-slate-700">You are all caught up</h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    When you report a problem, real-time dispatches, field officer updates, and closure seals will appear in this timeline.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => handleNavChange('report-issue', '/report-issue', e)}
                    className="dashboard-primary-button mt-4 cursor-pointer inline-flex"
                  >
                    <Plus size={15} /> File a report
                  </button>
                </div>
              ) : (
                <div className="dashboard-panel p-6">
                  <div className="divide-y divide-slate-100">
                    {notificationsList.map((notif) => {
                      let Icon = MunicipalIncidentIcon;
                      let iconColor = 'text-blue-600 bg-blue-50 border-blue-200';
                      if (notif.type === 'assigned') {
                        Icon = FieldOpsIcon;
                        iconColor = 'text-amber-600 bg-amber-50 border-amber-200';
                      } else if (notif.type === 'proof') {
                        Icon = Eye;
                        iconColor = 'text-indigo-600 bg-indigo-50 border-indigo-200';
                      } else if (notif.type === 'resolved') {
                        Icon = VerifiedResolutionSeal;
                        iconColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
                      }

                      return (
                        <div key={notif.id} className="py-4 flex items-start gap-3.5 first:pt-0 last:pb-0">
                          <div className={`p-2 rounded-xl border shrink-0 ${iconColor}`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <strong className="text-sm font-bold text-slate-900 block">
                                {notif.title}
                              </strong>
                              <span className="text-[11px] text-slate-400">
                                {new Date(notif.time).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {notif.description}
                            </p>
                            {notif.issue && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                  {notif.issue.category}
                                </span>
                                <span className="text-[11px] text-slate-400 truncate">
                                  📍 {notif.issue.location}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              VIEW 5: REPORT AN ISSUE (/report-issue)
             ========================================================================= */}
          {activeNav === 'report-issue' && (
            <div className="space-y-6">
              <div className="dashboard-heading-row">
                <div>
                  <p className="dashboard-eyebrow">Civic Action</p>
                  <h1 className="dashboard-heading">Report a Civic Problem</h1>
                  <p className="dashboard-description">
                    Submit infrastructure issues directly to municipal dispatch with automatic geolocation and AI duplicate detection.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleNavChange('ai-report', '/ai-report', e)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-sky-300 bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-100 transition cursor-pointer"
                >
                  <CivicIntelligenceIcon size={14} />
                  <span>Try AI Vision Assistant</span>
                </button>
              </div>

              {/* Duplicate Alert Modal */}
              {duplicateAlert && (
                <div
                  className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-sm font-bold">This issue was already reported by your community!</strong>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Your report was merged into the active municipal ticket ({duplicateAlert.existingIssue?.reportCount || 2} citizen reports total).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleNavChange('reports', '/reports', e)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition shrink-0 cursor-pointer"
                  >
                    View in My Reports →
                  </button>
                </div>
              )}

              {reportSuccessMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 text-xs font-semibold">
                  <span>✓ {reportSuccessMsg}</span>
                  <button
                    type="button"
                    onClick={(e) => handleNavChange('reports', '/reports', e)}
                    className="underline font-bold text-emerald-900 cursor-pointer"
                  >
                    View in My Reports
                  </button>
                </div>
              )}

              {reportErrorMsg && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
                  ⚠ {reportErrorMsg}
                </div>
              )}

              <form onSubmit={handleReportSubmit} className="dashboard-panel p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Civic Category
                    </label>
                    <select
                      value={reportForm.category}
                      onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                    >
                      {issueCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Location / Address
                      </label>
                      <button
                        type="button"
                        onClick={detectReportLocation}
                        disabled={isLocatingReport}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        <Locate size={12} className={isLocatingReport ? 'animate-spin' : ''} />
                        <span>{isLocatingReport ? 'Locating...' : 'Auto-detect GPS'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={reportForm.location}
                      onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                      placeholder="e.g. 5th Main Road, Near Municipal Water Tank"
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                    {reportLocationStatus && (
                      <span className="block mt-1 text-[11px] text-slate-400">{reportLocationStatus}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Problem Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    placeholder="Provide details about the issue (depth of pothole, duration of water leak, hazard level)..."
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none resize-vertical"
                  />
                </div>

                {/* Photo Upload Zone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Photographic Evidence (Optional)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60">
                    {reportImagePreview ? (
                      <div className="relative">
                        <img
                          src={reportImagePreview}
                          alt="Report preview"
                          className="w-24 h-24 rounded-lg object-cover border border-slate-200 shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setReportImagePreview('');
                            setReportForm({ ...reportForm, image: '' });
                          }}
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-red-600 text-white shadow-xs hover:bg-red-700 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        <FileImage size={24} />
                      </div>
                    )}
                    <div className="flex-1 text-center sm:text-left">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-xs">
                        <Camera size={14} />
                        <span>{reportImagePreview ? 'Change Photo' : 'Upload Incident Photo'}</span>
                        <input type="file" accept="image/*" onChange={handleReportImageUpload} className="hidden" />
                      </label>
                      <p className="text-[11px] text-slate-400 mt-1">
                        JPG, PNG, WEBP up to 5 MB. Image is automatically analyzed by Gemini AI.
                      </p>
                    </div>
                    {isDetectingCategory && (
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                        <LoaderCircle size={14} className="animate-spin" />
                        <span>AI Analyzing...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="dashboard-primary-button cursor-pointer"
                  >
                    {isSubmittingReport ? (
                      <>
                        <LoaderCircle size={15} className="animate-spin" />
                        <span>Submitting Ticket...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={15} />
                        <span>Submit Civic Report</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              VIEW 6: VISION TRIAGE ENGINE (/ai-report)
             ========================================================================= */}
          {activeNav === 'ai-report' && (
            <div className="space-y-6">
              <div className="dashboard-heading-row">
                <div>
                  <p className="dashboard-eyebrow">Civic Optical Intelligence</p>
                  <h1 className="dashboard-heading">Autonomous Vision Triage</h1>
                  <p className="dashboard-description">
                    Upload photographic evidence to automatically categorize faults, estimate severity, and construct the municipal dispatch dossier.
                  </p>
                </div>
                <span className="report-ai-chip">
                  <CivicIntelligenceIcon size={15} /> Vision Engine
                </span>
              </div>

              {aiError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
                  ⚠ {aiError}
                </div>
              )}

              <div className="dashboard-panel p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upload box */}
                  <div className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 text-center">
                    {aiImage ? (
                      <div className="w-full max-w-md rounded-xl overflow-hidden border border-slate-200 shadow-md">
                        <img src={aiImage} alt="Civic problem uploaded" className="w-full h-64 object-cover" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-xs">
                          <OpticalVisionIcon size={32} />
                        </div>
                        <strong className="block text-sm font-bold text-slate-800">
                          Upload Civic Fault Photograph
                        </strong>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Road fractures, leaking mains, broken poles, waste heaps, or dangling wires.
                        </p>
                      </div>
                    )}

                    <label className="mt-5 dashboard-primary-button cursor-pointer">
                      <Camera size={15} />
                      <span>{aiImage ? 'Choose Another Image' : 'Choose Photo'}</span>
                      <input type="file" accept="image/*" onChange={handleAiImageUpload} className="hidden" />
                    </label>
                    <small className="text-[11px] text-slate-400 mt-2">JPG, PNG, WEBP · Max 5 MB</small>
                  </div>

                  {/* Results box */}
                  <div className="flex flex-col justify-between p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                            Gemini Optical Classifier
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                            {isAnalyzingAi
                              ? 'Inspecting optical vectors...'
                              : aiResult
                              ? 'Telemetry Analysis Complete'
                              : 'Waiting for photo upload'}
                          </h3>
                        </div>
                        {isAnalyzingAi ? (
                          <LoaderCircle className="animate-spin text-sky-600" size={20} />
                        ) : aiResult ? (
                          <VerifiedResolutionSeal size={20} className="text-emerald-600" />
                        ) : (
                          <CivicIntelligenceIcon size={20} className="text-slate-300" />
                        )}
                      </div>

                      {isAnalyzingAi && (
                        <div className="py-12 text-center text-xs font-semibold text-slate-500 flex flex-col items-center gap-2">
                          <LoaderCircle className="animate-spin text-blue-600" size={24} />
                          <span>Extracting severity and fault category...</span>
                        </div>
                      )}

                      {!isAnalyzingAi && aiResult && (
                        <div className="mt-4 space-y-3.5 text-xs">
                          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                            <span className="text-[10px] font-bold text-sky-800 uppercase block mb-1">
                              Detected Category
                            </span>
                            <strong className="text-base font-bold text-slate-900">{aiResult.category}</strong>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                              Synthesized Title
                            </span>
                            <input
                              type="text"
                              readOnly
                              value={aiResult.title || 'Civic infrastructure complaint'}
                              className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800 text-xs"
                            />
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                              Technical Description
                            </span>
                            <textarea
                              readOnly
                              rows={3}
                              value={aiResult.description || aiResult.summary || ''}
                              className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs resize-none"
                            />
                          </div>

                          {aiResult.summary && (
                            <p className="text-[11px] text-slate-500 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                              <CivicIntelligenceIcon size={14} className="text-sky-500 shrink-0 mt-0.5" />
                              <span>{aiResult.summary}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {!isAnalyzingAi && !aiResult && (
                        <div className="py-12 text-center text-slate-400 text-xs">
                          Upload an image on the left to see the instant AI diagnosis.
                        </div>
                      )}
                    </div>

                    {!isAnalyzingAi && aiResult && (
                      <button
                        type="button"
                        onClick={applyAiResultToReport}
                        className="mt-5 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Use this in a Report</span>
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 7: PROFILE DETAILS (/profile)
             ========================================================================= */}
          {activeNav === 'profile' && (
            <div className="space-y-6">
              <div className="dashboard-heading-row">
                <div>
                  <p className="dashboard-eyebrow">Citizen Account</p>
                  <h1 className="dashboard-heading">Resident Profile Details</h1>
                  <p className="dashboard-description">
                    Review verified residency credentials, contact information, and community participation statistics.
                  </p>
                </div>
              </div>

              {profileSuccessMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  ✓ {profileSuccessMsg}
                </div>
              )}

              <div className="profile-card">
                <div className="profile-card-banner">
                  <div className="profile-avatar-upload">
                    <div className="profile-large-avatar">
                      {profileImageDraft ? (
                        <img src={profileImageDraft} alt="Draft avatar preview" />
                      ) : user.profileImage ? (
                        <img src={user.profileImage} alt={`${user.name} avatar`} />
                      ) : (
                        initials
                      )}
                    </div>
                    <label className="profile-avatar-edit" title="Choose profile picture">
                      <Camera size={14} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => setProfileImageDraft(reader.result);
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                  <div>
                    <h2>{user.name}</h2>
                    <p>{user.role} account · Ward 14</p>
                    <small className="profile-image-hint">
                      {profileImageDraft ? 'Click Save Changes below to update picture' : 'Click the camera badge to update avatar'}
                    </small>
                  </div>
                </div>

                <div className="p-6 bg-white space-y-4">
                  <div className="profile-detail-grid">
                    <div>
                      <span>
                        <Mail size={16} /> Email address
                      </span>
                      <strong>{user.email}</strong>
                    </div>
                    <div>
                      <span>
                        <Phone size={16} /> Phone number
                      </span>
                      <input
                        type="tel"
                        value={profilePhoneDraft}
                        onChange={(e) => setProfilePhoneDraft(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="mt-2 w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <span>
                        <ShieldCheck size={16} /> Account role
                      </span>
                      <strong className="capitalize">{user.role}</strong>
                    </div>
                    <div>
                      <span>
                        <VerifiedResolutionSeal size={16} /> Verification status
                      </span>
                      <strong className="profile-active">Verified Resident</strong>
                    </div>
                    <div>
                      <span>
                        <MunicipalDocketIcon size={16} /> Reports submitted
                      </span>
                      <strong>{totalUserReports} complaints filed</strong>
                    </div>
                    <div>
                      <span>
                        <Clock size={16} /> Member since
                      </span>
                      <strong>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'System account'}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isUpdatingProfile}
                      className="dashboard-primary-button cursor-pointer"
                    >
                      {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Helper: CitizenIssueCard Component with Resolution Lifecycle & Proof Modals
// ---------------------------------------------------------------------------
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
            <MunicipalDocketIcon size={12} /> {issue.category}
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
              <FieldOpsIcon size={11} /> {issue.department}
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
            {isResolved && <VerifiedResolutionSeal size={13} />}
            {isInProgress && <FieldOpsIcon size={13} />}
            {!isResolved && !isInProgress && <Clock size={13} />}
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
              <span>
                Assigned Field Officer: <strong>{issue.assignedWorker.name}</strong> (
                {issue.assignedWorker.department || 'Infrastructure'})
              </span>
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
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-xs ${
                step2Done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step2Done ? '✓' : '2'}
            </div>
            <span className={`text-[10px] font-bold mt-1 ${step2Done ? 'text-slate-800' : 'text-slate-400'}`}>
              Triage
            </span>
            <small className="text-[9px] text-slate-400">{step2Done ? 'AI Classified' : 'Pending'}</small>
          </div>

          <div className="flex flex-col items-center text-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-xs ${
                step3Done ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step3Done ? '✓' : '3'}
            </div>
            <span className={`text-[10px] font-bold mt-1 ${step3Done ? 'text-blue-700' : 'text-slate-400'}`}>
              Dispatched
            </span>
            <small className="text-[9px] text-slate-400">
              {issue.assignedWorker ? issue.assignedWorker.name : 'In Progress'}
            </small>
          </div>

          <div className="flex flex-col items-center text-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-xs ${
                step4Done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step4Done ? '✓' : '4'}
            </div>
            <span className={`text-[10px] font-bold mt-1 ${step4Done ? 'text-emerald-800' : 'text-slate-400'}`}>
              Resolved
            </span>
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
