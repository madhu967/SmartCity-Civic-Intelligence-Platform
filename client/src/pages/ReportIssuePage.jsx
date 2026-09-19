import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileImage,
  FileWarning,
  Layers,
  LoaderCircle,
  LogOut,
  MapPin,
  Menu,
  ShieldAlert,
  UserCheck,
  UserRound,
  Users,
  X,
  Zap,
} from 'lucide-react';
import {
  CivicIntelligenceIcon,
  MunicipalIncidentIcon,
  CivicCommandMatrixIcon,
  WardTelemetryIcon,
  MunicipalDocketIcon,
  VerifiedResolutionSeal,
  SpatialGisReticle,
  OpticalVisionIcon,
  PriorityBeaconIcon,
} from '../components/CivicIcons';
import { apiRequest, getAuthHeaders } from '../config/api';
import { getUserCurrentLocation, calculateDistanceKm, formatDistance } from '../utils/geolocation';

const issueCategories = ['Roads & Potholes', 'Garbage & Sanitation', 'Water Supply', 'Electricity', 'Streetlights', 'Drainage', 'Traffic'];
const sidebarPages = [
  ['Overview', CivicCommandMatrixIcon, '/dashboard'],
  ['Report an issue', MunicipalIncidentIcon, '/report-issue'],
  ['Vision Triage Engine', CivicIntelligenceIcon, '/ai-report'],
  ['My reports', MunicipalDocketIcon, '/reports'],
  ['Ward telemetry', WardTelemetryIcon, '/activity'],
  ['Incident alerts', PriorityBeaconIcon, '/notifications'],
];
const initialForm = {
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

export default function ReportIssuePage() {
  const [user, setUser] = useState(null);
  const [communityIssues, setCommunityIssues] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [duplicateAlert, setDuplicateAlert] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [detection, setDetection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const detectLocation = async () => {
    setIsLocating(true);
    setLocationStatus('Detecting your current location...');
    try {
      const loc = await getUserCurrentLocation();
      setForm((current) => ({
        ...current,
        location: loc.locationString,
        latitude: loc.latitude,
        longitude: loc.longitude,
      }));
      setLocationStatus('Current location detected');
    } catch (locErr) {
      console.warn('Geolocation detection error:', locErr);
      setLocationStatus(locErr.message || 'Location unavailable. You can enter it manually.');
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    apiRequest('/auth/me', { headers: getAuthHeaders() })
      .then((data) => {
        if (data.user.role !== 'citizen') throw new Error('Only citizen accounts can report issues');
        setUser(data.user);
        // Automatically capture user's current location when reporting an issue
        detectLocation();
      })
      .catch((requestError) => setError(requestError.message));

    apiRequest('/issues/community', { headers: getAuthHeaders() })
      .then((data) => setCommunityIssues(data.issues || []))
      .catch(() => {});
  }, []);

  // Live Nearby Issue Radar Check
  let activeLat = typeof form.latitude === 'number' ? form.latitude : null;
  let activeLon = typeof form.longitude === 'number' ? form.longitude : null;
  if ((activeLat === null || activeLon === null) && form.location) {
    const m = form.location.match(/\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/);
    if (m) {
      activeLat = parseFloat(m[1]);
      activeLon = parseFloat(m[2]);
    }
  }

  const nearbyCandidate = activeLat !== null && activeLon !== null
    ? communityIssues
        .filter((issue) => issue.status !== 'Resolved')
        .map((issue) => {
          let iLat = typeof issue.latitude === 'number' ? issue.latitude : null;
          let iLon = typeof issue.longitude === 'number' ? issue.longitude : null;
          if ((iLat === null || iLon === null) && issue.location) {
            const m = issue.location.match(/\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/);
            if (m) {
              iLat = parseFloat(m[1]);
              iLon = parseFloat(m[2]);
            }
          }
          const distKm = (iLat !== null && iLon !== null)
            ? calculateDistanceKm(activeLat, activeLon, iLat, iLon)
            : null;
          return {
            ...issue,
            distanceKm: distKm,
            distanceText: distKm !== null ? formatDistance(distKm) : null,
          };
        })
        .filter((issue) => issue.distanceKm !== null && issue.distanceKm <= 0.25)
        .sort((a, b) => a.distanceKm - b.distanceKm)[0] || null
    : null;

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const updateImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Please choose an image file');
    if (file.size > 5 * 1024 * 1024) return setError('Please choose an image smaller than 5 MB');

    setError('');
    setDetection(null);
    setIsDetecting(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const image = reader.result;
      setImagePreview(image);
      setForm((current) => ({ ...current, image }));
      try {
        const result = await apiRequest('/issues/detect-category', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ image }),
        });
        setForm((current) => ({
          ...current,
          category: issueCategories.includes(result.category) ? result.category : current.category,
          description: result.description || current.description,
          aiTitle: result.title || '',
          aiDescription: result.description || '',
          aiDetectedCategory: result.category || '',
          aiSummary: result.summary || '',
        }));
        setDetection(result);
      } catch {
        setDetection({
          category: 'Needs review',
          title: 'Issue needs review',
          description: 'The image could not be confidently classified. Add the issue details below.',
          summary: 'Please review the image and add the closest issue details.',
        });
      } finally {
        setIsDetecting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const logout = () => {
    localStorage.removeItem('smart_city_token');
    localStorage.removeItem('smart_city_user');
    window.dispatchEvent(new Event('auth-logout'));
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [toast]);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setDuplicateAlert(null);
    setIsSubmitting(true);
    try {
      const data = await apiRequest('/issues', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(form) });
      if (data.isDuplicate) {
        setDuplicateAlert(data);
        setToast({
          type: 'duplicate',
          title: 'This issue has already been reported.',
          description: `Active incident located ${data.distanceMeters !== undefined ? `${data.distanceMeters}m away` : 'nearby'}. Your report was merged (${data.existingIssue?.reportCount || 2} citizen reports total).`,
          data,
        });
        setForm(initialForm);
        setImagePreview('');
        setDetection(null);
        setLocationStatus('');
      } else {
        setForm(initialForm);
        setImagePreview('');
        setDetection(null);
        setLocationStatus('');
        setMessage('Your issue was reported successfully. The city team can now review it.');
        setToast({
          type: 'success',
          title: 'Report Submitted Successfully',
          description: 'Your civic report has been submitted and queued for municipal review.',
        });
      }
    } catch (requestError) {
      setError(requestError.message);
      setToast({
        type: 'error',
        title: 'Submission Failed',
        description: requestError.message || 'Unable to submit report.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !user) return <main className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center text-sm text-slate-500">{error}. <a href="/login" className="ml-1 font-bold text-brand-600">Log in again</a></main>;
  if (!user) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-brand-600">Loading report form...</main>;

  return (
    <main className="dashboard-page min-h-screen bg-slate-50 text-slate-900">

      {/* Floating Animated Toast Notification for Immediate Feedback */}
      {toast && (
        <div className="fixed top-5 right-4 sm:right-6 z-[9999] max-w-sm sm:max-w-md w-[calc(100%-2rem)] shadow-2xl rounded-2xl animate-in slide-in-from-top-3 fade-in duration-300">
          <div
            className={`p-4 rounded-2xl border backdrop-blur-md flex items-start gap-3 shadow-lg ${
              toast.type === 'duplicate'
                ? 'bg-amber-50/95 border-amber-300 text-amber-950 shadow-amber-500/10'
                : toast.type === 'error'
                ? 'bg-red-50/95 border-red-300 text-red-950 shadow-red-500/10'
                : 'bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-emerald-500/10'
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                toast.type === 'duplicate'
                  ? 'bg-amber-100 text-amber-600'
                  : toast.type === 'error'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {toast.type === 'duplicate' ? (
                <AlertTriangle size={19} />
              ) : toast.type === 'error' ? (
                <FileWarning size={19} />
              ) : (
                <CheckCircle2 size={19} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                {toast.type === 'duplicate' ? 'Civic Duplicate Alert' : 'System Notification'}
              </span>
              <h4 className="text-xs font-bold text-slate-900 leading-snug mt-0.5">{toast.title}</h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{toast.description}</p>

              {toast.type === 'duplicate' && (
                <div className="mt-2.5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (toast.data) setDuplicateAlert(toast.data);
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect Issue</span>
                    <ArrowRight size={12} />
                  </button>
                  <span className="text-slate-300">•</span>
                  <a
                    href="/reports"
                    className="text-[11px] font-bold text-slate-700 hover:text-slate-900 hover:underline"
                  >
                    Track in My Reports
                  </a>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer transition shrink-0"
              aria-label="Close notification"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Interactive AI Duplicate Alert Modal (Pinned Header & Footer, Never Overflows) */}
      {duplicateAlert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-sm overflow-hidden"
          onClick={() => setDuplicateAlert(null)}
        >
          <div
            className="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-amber-300 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pinned Modal Header (Never scrolls away) */}
            <div className="shrink-0 px-5 py-3.5 border-b border-amber-200 bg-amber-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 shadow-xs shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                    AI Duplicate Issue Detection
                  </span>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    This issue has already been reported.
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDuplicateAlert(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-100 hover:text-slate-700 cursor-pointer transition"
                aria-label="Close duplicate alert"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Modal Body (Always fits neatly within screen) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
              {/* Explanatory Banner */}
              <div className="rounded-xl bg-amber-50/90 border border-amber-200 p-3 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                <CivicIntelligenceIcon size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-950">
                    A matching civic issue was located within your immediate vicinity.
                  </p>
                  <p className="mt-1 text-amber-800">
                    To prevent duplicate tickets and accelerate response, <strong>we have linked your report to this existing ticket</strong>. Every citizen report increases its priority level for municipal dispatch!
                  </p>
                </div>
              </div>

              {/* Key Live Incident Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-medium text-slate-500 block">Distance</span>
                  <div className="flex items-center gap-1 mt-0.5 font-bold text-xs text-blue-600">
                    <MapPin size={13} className="shrink-0" />
                    <span className="truncate">
                      {duplicateAlert.distanceMeters !== undefined
                        ? `${duplicateAlert.distanceMeters}m away`
                        : 'Nearby'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-medium text-slate-500 block">Citizen Reports</span>
                  <div className="flex items-center gap-1 mt-0.5 font-bold text-xs text-amber-600">
                    <Zap size={13} className="shrink-0" />
                    <span>{duplicateAlert.existingIssue?.reportCount || 2} reported</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-medium text-slate-500 block">Status</span>
                  <div className="flex items-center gap-1 mt-0.5 font-bold text-xs text-slate-800">
                    <Clock size={13} className="text-blue-500 shrink-0" />
                    <span className="truncate">{duplicateAlert.existingIssue?.status || 'In review'}</span>
                  </div>
                </div>
              </div>

              {/* Existing Active Incident Details */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    <Layers size={12} /> {duplicateAlert.existingIssue?.category}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {duplicateAlert.existingIssue?.createdAt ? new Date(duplicateAlert.existingIssue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {duplicateAlert.existingIssue?.title || 'Civic infrastructure complaint'}
                </h3>

                <div className="text-xs text-slate-600 flex items-start gap-1.5">
                  <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                  <span>{duplicateAlert.existingIssue?.location || 'Nearby Location'}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap">
                  <span>Originally reported by: <strong className="text-slate-700">{duplicateAlert.existingIssue?.reportedBy || 'Fellow Citizen'}</strong></span>
                  {duplicateAlert.existingIssue?.assignedWorker && (
                    <span>Field Officer: <strong className="text-slate-700">{duplicateAlert.existingIssue.assignedWorker.name}</strong></span>
                  )}
                </div>

                {duplicateAlert.existingIssue?.imageUrl && (
                  <div className="pt-1.5">
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">Original Photo:</span>
                    <img
                      src={duplicateAlert.existingIssue.imageUrl}
                      alt="Original incident evidence"
                      className="h-28 w-full object-cover rounded-lg border border-slate-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Pinned Modal Footer (Always visible at the bottom) */}
            <div className="shrink-0 px-5 py-3 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-2.5">
              <a
                href="/reports"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
              >
                <span>Track in My Reports</span>
                <ArrowRight size={15} />
              </a>
              <button
                type="button"
                onClick={() => setDuplicateAlert(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition"
              >
                Report Another Issue
              </button>
            </div>
          </div>
        </div>
      )}

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
        <p className="dashboard-sidebar-label">Workspace</p>
        <nav className="dashboard-sidebar-nav">{sidebarPages.map(([label, Icon, href]) => <a key={label} href={href} onClick={() => setSidebarOpen(false)} className={`dashboard-sidebar-link ${href === '/report-issue' ? 'dashboard-sidebar-link-active' : ''}`}><Icon size={18} /><span>{label}</span></a>)}</nav>
        <div className="dashboard-sidebar-footer"><a href="/profile" className="dashboard-sidebar-link"><UserRound size={18} /><span>Profile details</span></a><button type="button" onClick={logout} className="dashboard-sidebar-link dashboard-logout"><LogOut size={18} /><span>Log out</span></button></div>
      </aside>
      {sidebarOpen && <button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-sidebar-overlay" aria-label="Close sidebar" />}
      <section className="dashboard-main">
        <div className="dashboard-mobile-toolbar"><button type="button" onClick={() => setSidebarOpen(true)} className="dashboard-mobile-menu-button" aria-label="Open sidebar"><Menu size={20} /></button><span>Report an issue</span></div>
        <div className="dashboard-container">
          <a href="/dashboard" className="profile-back-link"><ArrowLeft size={15} /> Back to dashboard</a>
          <div className="dashboard-heading-row worker-heading-row"><div><p className="dashboard-eyebrow">Civic reporting</p><h1 className="dashboard-heading">Report an issue</h1><p className="dashboard-description">Start with a photo. AI will suggest the issue type, title, and description.</p></div></div>

          {/* In-page Duplicate Banner if dismissed or persistent */}
          {duplicateAlert && (
            <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <AlertTriangle size={18} className="text-amber-600" />
                  <span>This issue has already been reported ({duplicateAlert.distanceMeters !== undefined ? `${duplicateAlert.distanceMeters}m away` : 'Nearby'}).</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDuplicateAlert(null)}
                  className="text-amber-600 hover:text-amber-800 text-xs font-semibold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                Your report was linked to the active ticket with <strong>{duplicateAlert.existingIssue?.reportCount || 2} total citizen reports</strong>.
                <a href="/reports" className="ml-2 font-bold text-blue-600 hover:underline">Track progress in My Reports →</a>
              </p>
            </div>
          )}

          {message && <p className="worker-success">{message} <a href="/reports">View my reports</a></p>}
          {error && <p className="worker-error">{error}</p>}
          <form className="worker-form report-issue-form" onSubmit={submit}>
            <div className="worker-form-section report-form-section">
              <div className="report-section-heading"><div><p className="report-kicker">Step 1 · Upload evidence</p><h2>Show us what is happening</h2></div><span className="report-ai-chip"><CivicIntelligenceIcon size={15} /> AI assisted</span></div>
              <label className="report-first-image-field"><span><OpticalVisionIcon size={16} /> Issue image <small>Optional, maximum 5 MB</small></span><input type="file" accept="image/*" onChange={updateImage} /></label>
              {imagePreview && <div className="report-ai-result report-ai-result-expanded"><img src={imagePreview} alt="Selected issue evidence" /><div><div className="report-ai-result-label"><span>{isDetecting ? <><LoaderCircle className="report-spinner" size={14} /> AI is inspecting the image</> : <><VerifiedResolutionSeal size={14} /> AI result</>}</span>{!isDetecting && <strong>{detection?.category || 'Needs review'}</strong>}</div>{isDetecting ? <p>Identifying the main visible civic subject and preparing the report details.</p> : <div className="report-ai-copy"><strong>{detection?.title || 'Issue title pending'}</strong><p>{detection?.description || detection?.summary}</p></div>}</div></div>}
              <div className="worker-form-grid report-followup-grid">
                <label className="worker-field">
                  <span>Issue type</span>
                  <select required name="category" value={form.category} onChange={updateField}>
                    {issueCategories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                  <small className="report-detection-note">
                    {detection ? <><CheckCircle2 size={13} /> AI suggestion shown above. You can change it.</> : 'Upload an image to get an AI suggestion.'}
                  </small>
                </label>
                <div className="worker-field">
                  <div className="flex items-center justify-between pb-1">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                      <MapPin size={14} className="text-brand-600" /> Location
                    </span>
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer disabled:opacity-50"
                      title="Fetch and use your current GPS location"
                    >
                      {isLocating ? (
                        <>
                          <LoaderCircle className="report-spinner" size={13} />
                          <span>Detecting GPS...</span>
                        </>
                      ) : (
                        <>
                          <MapPin size={13} />
                          <span>Use current location</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    required
                    name="location"
                    value={form.location}
                    onChange={updateField}
                    placeholder="Street, ward, or landmark"
                  />
                  {locationStatus && (
                    <small
                      className={`report-detection-note ${
                        locationStatus.includes('denied') ||
                        locationStatus.includes('unavailable') ||
                        locationStatus.includes('timed out')
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {isLocating ? (
                        <LoaderCircle className="report-spinner" size={13} />
                      ) : (
                        <CheckCircle2 size={13} />
                      )}{' '}
                      {locationStatus}
                    </small>
                  )}
                  {nearbyCandidate && (
                    <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-amber-900 flex items-center gap-1.5">
                          <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                          Nearby Active Issue ({nearbyCandidate.distanceText})
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                          {nearbyCandidate.reportCount || 1} report(s)
                        </span>
                      </div>
                      <p className="mt-1 font-semibold text-slate-800">
                        "{nearbyCandidate.aiTitle || nearbyCandidate.description}"
                      </p>
                      <p className="mt-1 text-amber-800 text-[11px]">
                        💡 <strong>Smart Duplicate Detection Active:</strong> If your report is about this same problem, submitting will automatically merge your report into this ticket and elevate its priority!
                      </p>
                    </div>
                  )}
                </div>
                <label className="worker-field report-description-field">
                  <span>Description</span>
                  <textarea
                    required
                    name="description"
                    value={form.description}
                    onChange={updateField}
                    placeholder="The AI description will appear here after image analysis. Add any useful details."
                    rows="6"
                    minLength="10"
                    maxLength="2000"
                  />
                </label>
              </div>
            </div>
            <div className="report-submit-panel"><div><strong>Ready to send?</strong><span>Review the AI suggestion, add the location, then send your report.</span></div><button type="submit" disabled={isSubmitting || isDetecting} className="dashboard-primary-button worker-submit">{isSubmitting ? 'Submitting report...' : 'Submit issue report'} <span>→</span></button></div>
          </form>
        </div>
      </section>
    </main>
  );
}
