import { useEffect, useState } from 'react';
import { ArrowLeft, LoaderCircle, LogOut, Menu, UserRound, X } from 'lucide-react';
import {
  CivicIntelligenceIcon,
  MunicipalIncidentIcon,
  CivicCommandMatrixIcon,
  WardTelemetryIcon,
  MunicipalDocketIcon,
  VerifiedResolutionSeal,
  OpticalVisionIcon,
  PriorityBeaconIcon,
} from '../components/CivicIcons';
import Navbar from '../components/Navbar';
import { apiRequest, getAuthHeaders } from '../config/api';

const sidebarPages = [
  ['Overview', CivicCommandMatrixIcon, '/dashboard'],
  ['Report an issue', MunicipalIncidentIcon, '/report-issue'],
  ['Vision Triage Engine', CivicIntelligenceIcon, '/ai-report'],
  ['My reports', MunicipalDocketIcon, '/reports'],
  ['Ward telemetry', WardTelemetryIcon, '/activity'],
  ['Incident alerts', PriorityBeaconIcon, '/notifications'],
];

export default function AiIssuePage() {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState('');
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    apiRequest('/auth/me', { headers: getAuthHeaders() })
      .then((data) => {
        if (data.user.role !== 'citizen') throw new Error('Only citizen accounts can use the AI issue assistant');
        setUser(data.user);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const analyzeImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Please choose an image smaller than 5 MB');
      return;
    }

    setError('');
    setResult(null);
    setIsAnalyzing(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const imageData = reader.result;
      setImage(imageData);
      try {
        const analysis = await apiRequest('/issues/detect-category', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ image: imageData }),
        });
        setResult(analysis);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsAnalyzing(false);
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

  if (error && !user) return <main className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center text-sm text-slate-500">{error}. <a href="/login" className="ml-1 font-bold text-brand-600">Log in again</a></main>;
  if (!user) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-brand-600">Loading AI assistant...</main>;

  return (
    <main className="dashboard-page min-h-screen bg-white text-slate-900">
      <Navbar isAuthenticated user={user} onLogout={logout} />
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar-open' : ''}`}>
        <div className="dashboard-sidebar-brand"><div className="dashboard-sidebar-mark">S</div><div><p className="dashboard-sidebar-title">Citizen space</p><p className="dashboard-sidebar-subtitle">SmartCity platform</p></div><button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-close-button" aria-label="Close sidebar"><X size={18} /></button></div>
        <p className="dashboard-sidebar-label">Workspace</p>
        <nav className="dashboard-sidebar-nav">{sidebarPages.map(([label, Icon, href]) => <a key={label} href={href} onClick={() => setSidebarOpen(false)} className={`dashboard-sidebar-link ${href === '/ai-report' ? 'dashboard-sidebar-link-active' : ''}`}><Icon size={18} /><span>{label}</span></a>)}</nav>
        <div className="dashboard-sidebar-footer"><a href="/profile" className="dashboard-sidebar-link"><UserRound size={18} /><span>Profile details</span></a><button type="button" onClick={logout} className="dashboard-sidebar-link dashboard-logout"><LogOut size={18} /><span>Log out</span></button></div>
      </aside>
      {sidebarOpen && <button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-sidebar-overlay" aria-label="Close sidebar" />}
      <section className="dashboard-main">
        <div className="dashboard-mobile-toolbar"><button type="button" onClick={() => setSidebarOpen(true)} className="dashboard-mobile-menu-button" aria-label="Open sidebar"><Menu size={20} /></button><span>Vision Triage Engine</span></div>
        <div className="dashboard-container ai-issue-container">
          <a href="/dashboard" className="profile-back-link"><ArrowLeft size={15} /> Back to dashboard</a>
          <div className="dashboard-heading-row worker-heading-row"><div><p className="dashboard-eyebrow">Civic Optical Intelligence</p><h1 className="dashboard-heading">Autonomous Vision Triage</h1><p className="dashboard-description">Upload photographic evidence to automatically categorize faults, estimate severity, and construct the municipal dispatch dossier.</p></div><span className="report-ai-chip"><CivicIntelligenceIcon size={15} /> Vision Engine</span></div>
          {error && <p className="worker-error">{error}</p>}
          <section className="ai-issue-panel">
            <div className="ai-upload-zone">
              {image ? <img src={image} alt="Uploaded civic issue" className="ai-upload-preview" /> : <div className="ai-upload-empty"><OpticalVisionIcon size={34} /><strong>Upload an issue image</strong><span>Roads, garbage, drains, lights, wires, or traffic infrastructure</span></div>}
              <label className="dashboard-primary-button ai-upload-button"><OpticalVisionIcon size={17} /> {image ? 'Choose another image' : 'Choose image'}<input type="file" accept="image/*" onChange={analyzeImage} /></label>
              <small>JPG, PNG, WEBP · maximum 5 MB</small>
            </div>
            <div className="ai-result-panel">
              <div className="ai-result-heading"><div><p className="report-kicker">AI analysis</p><h2>{isAnalyzing ? 'Inspecting the image...' : result ? 'Here is what Gemini sees' : 'Your result will appear here'}</h2></div>{isAnalyzing ? <LoaderCircle className="report-spinner" size={21} /> : result && <VerifiedResolutionSeal size={21} />}</div>
              {isAnalyzing && <div className="ai-result-loading"><LoaderCircle className="report-spinner" size={18} /> Checking the visible civic problem</div>}
              {!isAnalyzing && result && <div className="ai-result-content"><div className="ai-detected-type"><span>Detected issue type</span><strong>{result.category}</strong></div><label className="ai-result-field"><span>Suggested title</span><input readOnly value={result.title || 'Civic infrastructure issue'} /></label><label className="ai-result-field"><span>Suggested description</span><textarea readOnly value={result.description || result.summary || ''} rows="5" /></label><p className="ai-result-summary"><CivicIntelligenceIcon size={15} /> {result.summary}</p><a href="/report-issue" className="dashboard-primary-button">Use this in a report <span>→</span></a></div>}
              {!isAnalyzing && !result && <div className="ai-result-empty"><OpticalVisionIcon size={30} /><p>Upload an image to see the AI’s suggested issue type, title, and description.</p></div>}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
