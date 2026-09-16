import { useEffect, useState } from 'react';
import { Activity, ArrowLeft, Bell, Bot, CheckCircle2, ClipboardList, FileImage, FileWarning, Home, LoaderCircle, LogOut, MapPin, Menu, Sparkles, UserRound, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { apiRequest, getAuthHeaders } from '../config/api';
import { getUserCurrentLocation } from '../utils/geolocation';

const issueCategories = ['Roads & Potholes', 'Garbage & Sanitation', 'Water Supply', 'Electricity', 'Streetlights', 'Drainage', 'Traffic'];
const sidebarPages = [['Overview', Home, '/dashboard'], ['Report an issue', FileWarning, '/report-issue'], ['AI issue assistant', Sparkles, '/ai-report'], ['My reports', ClipboardList, '/reports'], ['Nearby activity', Activity, '/activity'], ['Notifications', Bell, '/notifications']];
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
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
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
  }, []);

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

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);
    try {
      await apiRequest('/issues', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(form) });
      setForm(initialForm);
      setImagePreview('');
      setDetection(null);
      setLocationStatus('');
      setMessage('Your issue was reported successfully. The city team can now review it.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !user) return <main className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center text-sm text-slate-500">{error}. <a href="/login" className="ml-1 font-bold text-brand-600">Log in again</a></main>;
  if (!user) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-brand-600">Loading report form...</main>;

  return (
    <main className="dashboard-page min-h-screen bg-white text-slate-900">
      <Navbar isAuthenticated user={user} onLogout={logout} />
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar-open' : ''}`}>
        <div className="dashboard-sidebar-brand"><div className="dashboard-sidebar-mark">S</div><div><p className="dashboard-sidebar-title">Citizen space</p><p className="dashboard-sidebar-subtitle">SmartCity platform</p></div><button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-close-button" aria-label="Close sidebar"><X size={18} /></button></div>
        <p className="dashboard-sidebar-label">Workspace</p>
        <nav className="dashboard-sidebar-nav">{sidebarPages.map(([label, Icon, href]) => <a key={label} href={href} onClick={() => setSidebarOpen(false)} className={`dashboard-sidebar-link ${href === '/report-issue' ? 'dashboard-sidebar-link-active' : ''}`}><Icon size={18} /><span>{label}</span>{label === 'Notifications' && <span className="dashboard-notification-count">2</span>}</a>)}</nav>
        <div className="dashboard-sidebar-footer"><a href="/profile" className="dashboard-sidebar-link"><UserRound size={18} /><span>Profile details</span></a><button type="button" onClick={logout} className="dashboard-sidebar-link dashboard-logout"><LogOut size={18} /><span>Log out</span></button></div>
      </aside>
      {sidebarOpen && <button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-sidebar-overlay" aria-label="Close sidebar" />}
      <section className="dashboard-main">
        <div className="dashboard-mobile-toolbar"><button type="button" onClick={() => setSidebarOpen(true)} className="dashboard-mobile-menu-button" aria-label="Open sidebar"><Menu size={20} /></button><span>Report an issue</span></div>
        <div className="dashboard-container">
          <a href="/dashboard" className="profile-back-link"><ArrowLeft size={15} /> Back to dashboard</a>
          <div className="dashboard-heading-row worker-heading-row"><div><p className="dashboard-eyebrow">Civic reporting</p><h1 className="dashboard-heading">Report an issue</h1><p className="dashboard-description">Start with a photo. AI will suggest the issue type, title, and description.</p></div></div>
          {message && <p className="worker-success">{message} <a href="/reports">View my reports</a></p>}
          {error && <p className="worker-error">{error}</p>}
          <form className="worker-form report-issue-form" onSubmit={submit}>
            <div className="worker-form-section report-form-section">
              <div className="report-section-heading"><div><p className="report-kicker">Step 1 · Upload evidence</p><h2>Show us what is happening</h2></div><span className="report-ai-chip"><Bot size={15} /> AI assisted</span></div>
              <label className="report-first-image-field"><span><FileImage size={16} /> Issue image <small>Optional, maximum 5 MB</small></span><input type="file" accept="image/*" onChange={updateImage} /></label>
              {imagePreview && <div className="report-ai-result report-ai-result-expanded"><img src={imagePreview} alt="Selected issue evidence" /><div><div className="report-ai-result-label"><span>{isDetecting ? <><LoaderCircle className="report-spinner" size={14} /> AI is inspecting the image</> : <><CheckCircle2 size={14} /> AI result</>}</span>{!isDetecting && <strong>{detection?.category || 'Needs review'}</strong>}</div>{isDetecting ? <p>Identifying the main visible civic subject and preparing the report details.</p> : <div className="report-ai-copy"><strong>{detection?.title || 'Issue title pending'}</strong><p>{detection?.description || detection?.summary}</p></div>}</div></div>}
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
