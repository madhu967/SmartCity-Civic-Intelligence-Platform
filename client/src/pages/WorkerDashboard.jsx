import { useEffect, useState } from 'react';
import { Activity, BriefcaseBusiness, Bot, FileImage, ClipboardList, LogOut, MapPin, Menu, ShieldCheck, UserRound, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { apiRequest, getAuthHeaders } from '../config/api';

export default function WorkerDashboard({ pagePath = '/worker' }) {
  const [user, setUser] = useState(null);
  const [availability, setAvailability] = useState('Available');
  const [location, setLocation] = useState('');
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isAvailabilityPage = pagePath === '/worker/availability';
  const isLocationPage = pagePath === '/worker/location';
  const isIssuesPage = pagePath === '/worker/issues';

  useEffect(() => {
    const loadAssignedIssues = async () => {
      try {
        const issueData = await apiRequest('/worker/issues', { headers: getAuthHeaders() });
        setAssignedIssues(issueData.issues);
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    apiRequest('/auth/me', { headers: getAuthHeaders() }).then((data) => {
      setUser(data.user);
      setAvailability(data.user.availability || 'Available');
      setLocation(data.user.location || '');
      return loadAssignedIssues();
    }).catch((requestError) => setError(requestError.message));

    if (!isIssuesPage) return undefined;
    const refreshOnFocus = () => loadAssignedIssues();
    const refreshTimer = window.setInterval(loadAssignedIssues, 10000);
    window.addEventListener('focus', refreshOnFocus);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, [isIssuesPage]);

  const logout = () => {
    localStorage.removeItem('smart_city_token');
    localStorage.removeItem('smart_city_user');
    window.dispatchEvent(new Event('auth-logout'));
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const updateAvailability = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await apiRequest('/worker/availability', { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ availability, location }) });
      setMessage('Availability and service location updated successfully.');
      setUser((current) => ({ ...current, availability, location }));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const updateIssue = async (issueId, changes) => {
    try {
      const data = await apiRequest(`/worker/issues/${issueId}`, { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(changes) });
      setAssignedIssues((currentIssues) => currentIssues.map((issue) => issue.id === issueId ? data.issue : issue));
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  };

  if (error && !user) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">{error}. <a href="/login" className="ml-1 font-bold text-brand-600">Log in again</a></main>;
  if (!user) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-brand-600">Loading worker dashboard...</main>;

  const currentTitle = isAvailabilityPage ? 'Availability' : isLocationPage ? 'Service location' : isIssuesPage ? 'Assigned issues' : 'My dashboard';
  const currentDescription = isAvailabilityPage ? 'Keep dispatch informed of when you can respond to civic work.' : isLocationPage ? 'Review your assigned ward and update your current operations location.' : isIssuesPage ? 'Open assigned complaints, update progress, and upload completion proof.' : 'Your assignments, service area, and field status at a glance.';

  return (
    <main className="dashboard-page min-h-screen bg-white text-slate-900">
      <Navbar isAuthenticated user={user} onLogout={logout} />
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar-open' : ''}`}>
        <div className="dashboard-sidebar-brand"><div className="dashboard-sidebar-mark">S</div><div><p className="dashboard-sidebar-title">Worker space</p><p className="dashboard-sidebar-subtitle">SmartCity platform</p></div><button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-close-button"><X size={18} /></button></div>
        <p className="dashboard-sidebar-label">Workspace</p>
        <nav className="dashboard-sidebar-nav">
          <a href="/worker" className={`dashboard-sidebar-link ${pagePath === '/worker' ? 'dashboard-sidebar-link-active' : ''}`}><BriefcaseBusiness size={18} /><span>My dashboard</span></a>
          <a href="/worker/availability" className={`dashboard-sidebar-link ${isAvailabilityPage ? 'dashboard-sidebar-link-active' : ''}`}><Activity size={18} /><span>Availability</span></a>
          <a href="/worker/location" className={`dashboard-sidebar-link ${isLocationPage ? 'dashboard-sidebar-link-active' : ''}`}><MapPin size={18} /><span>Service location</span></a>
          <a href="/worker/issues" className={`dashboard-sidebar-link ${isIssuesPage ? 'dashboard-sidebar-link-active' : ''}`}><ClipboardList size={18} /><span>Assigned issues</span></a>
        </nav>
        <div className="dashboard-sidebar-footer"><a href="/profile" className="dashboard-sidebar-link"><UserRound size={18} /><span>Profile details</span></a><button type="button" onClick={logout} className="dashboard-sidebar-link dashboard-logout"><LogOut size={18} /><span>Log out</span></button></div>
      </aside>
      {sidebarOpen && <button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-sidebar-overlay" />}
      <section className="dashboard-main">
        <div className="dashboard-mobile-toolbar"><button type="button" onClick={() => setSidebarOpen(true)} className="dashboard-mobile-menu-button"><Menu size={20} /></button><span>{currentTitle}</span></div>
        <div className="dashboard-container">
          <div className="dashboard-heading-row"><div><p className="dashboard-eyebrow">Field operations</p><h1 className="dashboard-heading">{currentTitle}</h1><p className="dashboard-description">{currentDescription}</p></div><div className="dashboard-admin-badge"><ShieldCheck size={17} /> Worker account</div></div>
          {pagePath === '/worker' ? <WorkerOverview user={user} /> : isIssuesPage ? <WorkerIssues issues={assignedIssues} onUpdate={updateIssue} /> : <WorkerOperationalPanel availability={availability} location={location} setAvailability={setAvailability} setLocation={setLocation} onSubmit={updateAvailability} message={message} error={error} isLocationPage={isLocationPage} />}
        </div>
      </section>
    </main>
  );
}

function WorkerOverview({ user }) {
  return <><div className="dashboard-stat-grid"><div className="dashboard-stat-card"><div className="dashboard-stat-top"><span>Department</span><BriefcaseBusiness size={18} /></div><strong className="worker-stat-text">{user.department}</strong><small>{user.jobSkill}</small></div><div className="dashboard-stat-card"><div className="dashboard-stat-top"><span>Service area</span><MapPin size={18} /></div><strong className="worker-stat-text">{user.serviceArea}</strong><small>{user.location}</small></div><div className="dashboard-stat-card"><div className="dashboard-stat-top"><span>Experience</span><ShieldCheck size={18} /></div><strong>{user.yearsExperience}</strong><small>Years in service</small></div><div className="dashboard-stat-card"><div className="dashboard-stat-top"><span>Availability</span><Activity size={18} /></div><strong className="dashboard-status-active">{user.availability}</strong><small>Current field status</small></div></div><section className="dashboard-panel worker-static-panel"><h2>Today in the field</h2><p>Your assigned civic service profile is active. Use the sidebar to update your availability or current location.</p><div className="worker-static-items"><span><ShieldCheck size={16} /> Profile verified</span><span><MapPin size={16} /> {user.serviceArea}</span><span><Activity size={16} /> Ready for dispatch</span></div></section></>;
}

function WorkerOperationalPanel({ availability, location, setAvailability, setLocation, onSubmit, message, error, isLocationPage }) {
  return <section className="dashboard-panel worker-availability-panel"><div className="dashboard-panel-heading"><div><h2>{isLocationPage ? 'Service location details' : 'Availability status'}</h2><p>{isLocationPage ? 'Keep your current operations location visible to dispatch.' : 'Keep your dispatch team informed of your current status.'}</p></div><Activity size={21} /></div><div className="worker-static-callout"><MapPin size={18} /><div><strong>{isLocationPage ? 'Assigned service area' : 'Current assignment area'}</strong><span>Update the fields below when your field status changes.</span></div></div><form className="worker-availability-form" onSubmit={onSubmit}><label className="worker-field"><span>Availability</span><select value={availability} onChange={(event) => setAvailability(event.target.value)}><option>Available</option><option>On duty</option><option>Unavailable</option></select></label><label className="worker-field"><span>Current location</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="North operations hub" /></label><button type="submit" className="dashboard-primary-button">Save update</button></form>{message && <p className="worker-success">{message}</p>}{error && <p className="worker-error">{error}</p>}</section>;
}

function WorkerIssues({ issues, onUpdate }) {
  return <section className="dashboard-panel worker-issues-panel"><div className="dashboard-panel-heading"><div><h2>Issues assigned to you</h2><p>{issues.length} assigned {issues.length === 1 ? 'issue' : 'issues'}</p></div><ClipboardList size={21} /></div>{issues.length === 0 ? <div className="admin-empty-users">No issues have been assigned to you yet.</div> : <div className="worker-issues-list">{issues.map((issue) => <WorkerIssueCard key={issue.id} issue={issue} onUpdate={onUpdate} />)}</div>}</section>;
}

function WorkerIssueCard({ issue, onUpdate }) {
  const [proofImage, setProofImage] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const currentStatus = issue.status || 'Submitted';
  const updateProof = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setError('Choose an image smaller than 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProofImage(reader.result);
    reader.readAsDataURL(file);
  };
  const submitProof = async () => {
    if (!proofImage) return setError('Upload a proof image first.');
    setError('');
    setMessage('');
    try {
      await onUpdate(issue.id, { proofImage, status: 'Ready for admin review' });
      setProofImage('');
      setMessage('Proof submitted for admin review.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  return <article className="worker-issue-card"><div className="worker-issue-card-header"><div><span>{issue.category}</span><h3>{issue.aiTitle || issue.description}</h3></div><strong className={`worker-issue-status worker-issue-status-${currentStatus.toLowerCase().replace(/\s+/g, '-')}`}>{currentStatus}</strong></div>{(issue.aiTitle || issue.aiDescription || issue.aiDetectedCategory || issue.aiSummary) && <div className="issue-ai-details worker-ai-details"><div className="issue-ai-details-heading"><span><Bot size={15} /> Gemini analysis</span><strong>{issue.aiDetectedCategory || issue.category}</strong></div>{issue.aiTitle && <h3>{issue.aiTitle}</h3>}{issue.aiDescription && <p>{issue.aiDescription}</p>}{issue.aiSummary && <small>{issue.aiSummary}</small>}</div>}<p className="worker-citizen-description"><strong>Citizen description:</strong> {issue.description}</p><p className="worker-issue-location"><MapPin size={14} /> {issue.location} · Priority: {issue.priority || 'Medium'}</p>{issue.imageUrl && <div className="worker-evidence-block"><span>Citizen evidence</span><a href={issue.imageUrl} target="_blank" rel="noreferrer"><img className="worker-issue-source-image" src={issue.imageUrl} alt={`Citizen evidence for ${issue.category}`} /><strong>Open full image</strong></a></div>}<div className="worker-issue-actions"><select value={issue.workerCompletionStatus || (currentStatus === 'Submitted' ? 'In progress' : currentStatus)} onChange={(event) => onUpdate(issue.id, { status: event.target.value })}><option>In progress</option><option>Ready for admin review</option></select><label className="worker-proof-input"><FileImage size={15} /> Choose proof image<input type="file" accept="image/*" onChange={updateProof} /></label><button type="button" className="dashboard-primary-button" onClick={submitProof}>Submit proof for admin</button></div>{proofImage && <div className="worker-proof-preview"><span>Selected proof preview</span><img src={proofImage} alt="Selected completion proof preview" /></div>}{issue.workerProofImage && <div className="worker-proof-preview worker-proof-uploaded"><span>Uploaded proof image</span><a href={issue.workerProofImage} target="_blank" rel="noreferrer"><img src={issue.workerProofImage} alt={`Uploaded completion proof for ${issue.category}`} /><strong>Open full proof image</strong></a></div>}{issue.proofReviewStatus && <p className="worker-proof-status">Proof review: {issue.proofReviewStatus}</p>}{message && <p className="worker-success">{message}</p>}{error && <p className="worker-error">{error}</p>}</article>;
}
