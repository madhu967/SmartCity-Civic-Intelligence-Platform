import { useEffect, useState } from 'react';
import { Activity, BriefcaseBusiness, CheckCircle2, ClipboardList, FileImage, LoaderCircle, LogOut, MapPin, Menu, ShieldCheck, UserRound, X } from 'lucide-react';
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
  PriorityBeaconIcon,
} from '../components/CivicIcons';
import { CivicStatCard } from '../components/CivicStatCard';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { apiRequest, getAuthHeaders } from '../config/api';
import { getUserCurrentLocation, reverseGeocode } from '../utils/geolocation';

export default function WorkerDashboard({ pagePath = '/worker' }) {
  const [user, setUser] = useState(null);
  const [availability, setAvailability] = useState('Available');
  const [location, setLocation] = useState('');
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [currentPath, setCurrentPath] = useState(() => (pagePath || window.location.pathname).split('#')[0].replace(/\/+$/, '') || '/worker');

  useEffect(() => {
    const onPopState = () => {
      const p = window.location.pathname.split('#')[0].replace(/\/+$/, '') || '/worker';
      setCurrentPath(p);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (pagePath) {
      const p = (pagePath || '/worker').split('#')[0].replace(/\/+$/, '') || '/worker';
      setCurrentPath(p);
    }
  }, [pagePath]);

  const handleWorkerNav = (href, e) => {
    if (e) e.preventDefault();
    setCurrentPath(href);
    if (window.location.pathname !== href) {
      window.history.pushState({}, '', href);
    }
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const isAvailabilityPage = currentPath === '/worker/availability' || window.location.hash === '#availability';
  const isLocationPage = currentPath === '/worker/location' || window.location.hash === '#location';
  const isIssuesPage = currentPath === '/worker/issues' || window.location.hash === '#issues';
  const isOverviewPage = (currentPath === '/worker' || currentPath === '/worker/') && !isAvailabilityPage && !isLocationPage && !isIssuesPage;

  const syncWorkerLocation = async (manual = false) => {
    setIsLocating(true);
    if (manual) setMessage('');
    setLocationStatus('Detecting GPS location...');
    try {
      const loc = await getUserCurrentLocation();
      if (loc) {
        setLocation(loc.locationString);
        await apiRequest('/worker/location', {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            location: loc.locationString,
            latitude: loc.latitude,
            longitude: loc.longitude,
          }),
        });
        setUser((curr) => curr ? ({
          ...curr,
          location: loc.locationString,
          latitude: loc.latitude,
          longitude: loc.longitude,
          locationUpdatedAt: new Date().toISOString(),
        }) : curr);
        setLocationStatus('Location synced with GPS');
      }
    } catch (locErr) {
      console.warn('Worker location sync error:', locErr);
      setLocationStatus(locErr.message || 'Unable to sync GPS location');
    } finally {
      setIsLocating(false);
    }
  };

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
      // Automatically sync worker location upon loading dashboard
      syncWorkerLocation(false);
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

  // Continuously track worker's live location while active
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return undefined;
    let lastSyncTimestamp = 0;

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const now = Date.now();
        // Sync at most once every 30 seconds to conserve battery & network
        if (now - lastSyncTimestamp < 30000) return;
        lastSyncTimestamp = now;

        try {
          const { latitude, longitude } = position.coords;
          const address = await reverseGeocode(latitude, longitude);
          const coordinateNote = `(${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          const locString = address ? `${address} ${coordinateNote}` : coordinateNote;
          const trimmedLoc = locString.slice(0, 190);

          await apiRequest('/worker/location', {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              location: trimmedLoc,
              latitude,
              longitude,
            }),
          });

          setLocation(trimmedLoc);
          setUser((curr) => curr ? ({
            ...curr,
            location: trimmedLoc,
            latitude,
            longitude,
            locationUpdatedAt: new Date().toISOString(),
          }) : curr);
          setLocationStatus('Live GPS active');
        } catch (watchErr) {
          console.warn('Background live GPS watch update error:', watchErr);
        }
      },
      (error) => {
        console.warn('Geolocation watch error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 20000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

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
  if (!user) return <DashboardSkeleton role="worker" statCardCount={4} sidebarItemCount={6} />;

  const currentTitle = isAvailabilityPage ? 'Availability' : isLocationPage ? 'Service location' : isIssuesPage ? 'Assigned issues' : 'My dashboard';
  const currentDescription = isAvailabilityPage ? 'Keep dispatch informed of when you can respond to civic work.' : isLocationPage ? 'Review your assigned ward and update your current operations location.' : isIssuesPage ? 'Open assigned complaints, update progress, and upload completion proof.' : 'Your assignments, service area, and field status at a glance.';

  return (
    <main className="dashboard-page min-h-screen bg-slate-50 text-slate-900">
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
          <p className="dashboard-sidebar-label">Operations</p>
          <nav className="dashboard-sidebar-nav">
            <a
              href="/worker"
              onClick={(e) => handleWorkerNav('/worker', e)}
              className={`dashboard-sidebar-link ${isOverviewPage ? 'dashboard-sidebar-link-active' : ''}`}
            >
              <BriefcaseBusiness size={18} />
              <span>My dashboard</span>
            </a>
            <a
              href="/worker/availability"
              onClick={(e) => handleWorkerNav('/worker/availability', e)}
              className={`dashboard-sidebar-link ${isAvailabilityPage ? 'dashboard-sidebar-link-active' : ''}`}
            >
              <Activity size={18} />
              <span>Availability</span>
            </a>
            <a
              href="/worker/location"
              onClick={(e) => handleWorkerNav('/worker/location', e)}
              className={`dashboard-sidebar-link ${isLocationPage ? 'dashboard-sidebar-link-active' : ''}`}
            >
              <MapPin size={18} />
              <span>Service location</span>
            </a>
            <a
              href="/worker/issues"
              onClick={(e) => handleWorkerNav('/worker/issues', e)}
              className={`dashboard-sidebar-link ${isIssuesPage ? 'dashboard-sidebar-link-active' : ''}`}
            >
              <ClipboardList size={18} />
              <span>Assigned issues</span>
              {assignedIssues.filter((i) => i.status !== 'Resolved').length > 0 && (
                <span className="dashboard-notification-count">
                  {assignedIssues.filter((i) => i.status !== 'Resolved').length}
                </span>
              )}
            </a>
          </nav>
        </div>
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

      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="dashboard-sidebar-overlay"
          aria-label="Close sidebar"
        />
      )}

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
                <span>Welcome back, {user?.name || 'Field Officer'}</span>
                <span className="dashboard-topbar-badge">
                  <ShieldCheck size={12} className="text-blue-600" />
                  Field Officer
                </span>
              </div>
              <p className="dashboard-topbar-sub">
                Municipal Field Operations · Live GPS Telemetry Active
              </p>
            </div>
          </div>

          <div className="dashboard-topbar-right">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {availability}
            </span>

            <a
              href="/profile"
              className="dashboard-topbar-profile"
              title="View worker profile"
            >
              <div className="dashboard-topbar-avatar bg-amber-600">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={`${user.name} avatar`} />
                ) : (
                  user.name?.charAt(0).toUpperCase() || 'W'
                )}
              </div>
              <span className="hidden md:inline max-w-[120px] truncate">{user.name}</span>
            </a>

            <button
              type="button"
              onClick={logout}
              className="dashboard-topbar-logout"
              title="Log out of field worker portal"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </header>

        <div className="dashboard-container">
          <div className="dashboard-heading-row">
            <div>
              <p className="dashboard-eyebrow">Field operations</p>
              <h1 className="dashboard-heading">{currentTitle}</h1>
              <p className="dashboard-description">{currentDescription}</p>
            </div>
          </div>
          {isOverviewPage ? (
            <WorkerOverview
              user={user}
              issues={assignedIssues}
              onUpdate={updateIssue}
              onSyncLocation={syncWorkerLocation}
              isLocating={isLocating}
              locationStatus={locationStatus}
              availability={availability}
              onQuickAvailabilityChange={async (newStatus) => {
                setAvailability(newStatus);
                try {
                  await apiRequest('/worker/availability', {
                    method: 'PATCH',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ availability: newStatus, location }),
                  });
                  setUser((curr) => curr ? ({ ...curr, availability: newStatus }) : curr);
                } catch (e) {
                  setError(e.message);
                }
              }}
            />
          ) : isIssuesPage ? (
            <WorkerIssues issues={assignedIssues} onUpdate={updateIssue} />
          ) : (
            <WorkerOperationalPanel
              availability={availability}
              location={location}
              setAvailability={setAvailability}
              setLocation={setLocation}
              onSubmit={updateAvailability}
              onSyncLocation={syncWorkerLocation}
              isLocating={isLocating}
              locationStatus={locationStatus}
              message={message}
              error={error}
              isLocationPage={isLocationPage}
              user={user}
            />
          )}
        </div>
      </section>
    </main>
  );
}

function WorkerOverview({
  user,
  issues = [],
  onUpdate,
  onSyncLocation,
  isLocating,
  locationStatus,
  availability,
  onQuickAvailabilityChange,
}) {
  const totalAssigned = issues.length;
  const urgentCount = issues.filter((i) => (i.priority === 'Critical' || i.priority === 'High') && i.status !== 'Resolved').length;
  const inProgressCount = issues.filter((i) => i.status === 'In progress').length;
  const reviewPendingCount = issues.filter((i) => i.status === 'In review' || i.workerCompletionStatus === 'Ready for admin review').length;
  const resolvedCount = issues.filter((i) => i.status === 'Resolved').length;
  const completionRate = totalAssigned > 0 ? Math.round((resolvedCount / totalAssigned) * 100) : 100;

  const activeIssues = issues.filter((i) => i.status !== 'Resolved');

  return (
    <>
      {/* Field Officer Control Bar (Duty Toggle & Real-Time GPS) */}
      <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            {user?.name?.charAt(0).toUpperCase() || 'W'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-slate-900 text-sm font-bold">{user?.name || 'Officer'}</strong>
              <span className="text-xs text-slate-500">· {user?.department || 'Operations'}</span>
            </div>
            <span className="text-xs text-slate-500 block">
              Skill: <strong>{user?.jobSkill || 'Field'}</strong> · Ward: <strong>{user?.serviceArea || 'General'}</strong> ({user?.yearsExperience || 0} yrs exp)
            </span>
          </div>
        </div>

        {/* Live Duty Switcher & GPS Sync */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 text-xs font-bold">
            <span className="text-slate-400 text-[10px] uppercase px-1.5">Duty:</span>
            <button
              type="button"
              onClick={() => onQuickAvailabilityChange('Available')}
              className={`px-3 py-1 rounded-md cursor-pointer transition ${
                availability === 'Available'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Available
            </button>
            <button
              type="button"
              onClick={() => onQuickAvailabilityChange('On duty')}
              className={`px-3 py-1 rounded-md cursor-pointer transition ${
                availability === 'On duty'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              On Duty
            </button>
            <button
              type="button"
              onClick={() => onQuickAvailabilityChange('Unavailable')}
              className={`px-3 py-1 rounded-md cursor-pointer transition ${
                availability === 'Unavailable'
                  ? 'bg-slate-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Off Duty
            </button>
          </div>

          <button
            type="button"
            onClick={() => onSyncLocation(true)}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-blue-600 hover:bg-blue-50 cursor-pointer disabled:opacity-50 transition"
            title="Update real-time GPS location"
          >
            {isLocating ? <LoaderCircle className="report-spinner" size={14} /> : <MapPin size={14} />}
            <span>{isLocating ? 'Syncing...' : 'Sync GPS'}</span>
          </button>
        </div>
      </div>

      {locationStatus && (
        <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <VerifiedResolutionSeal size={14} className="text-emerald-600" />
          <span>{locationStatus}</span>
          {user?.latitude && user?.longitude && (
            <span className="text-emerald-700 text-[11px] ml-auto">
              Coordinates: {user.latitude.toFixed(4)}, {user.longitude.toFixed(4)}
            </span>
          )}
        </div>
      )}

      {/* Handcrafted Executive Operational Metrics Grid with Circular Telemetry Gauges */}
      <div className="dashboard-stat-grid">
        <CivicStatCard
          title="Total Assigned"
          value={totalAssigned}
          subtitle="Work orders in queue"
          icon={MunicipalDocketIcon}
          variant="blue"
          percentage={totalAssigned > 0 ? 100 : 0}
          gaugeLabel={`${totalAssigned}`}
          trend={totalAssigned > 0 ? `${totalAssigned} assigned` : 'Queue clear'}
          trendType="positive"
        />

        <CivicStatCard
          title="Urgent / Critical"
          value={urgentCount}
          subtitle={urgentCount > 0 ? 'High-priority response needed' : 'No urgent alerts'}
          icon={PriorityBeaconIcon}
          variant="rose"
          percentage={totalAssigned > 0 ? Math.round((urgentCount / totalAssigned) * 100) : 0}
          gaugeLabel={`${totalAssigned > 0 ? Math.round((urgentCount / totalAssigned) * 100) : 0}%`}
          trend={urgentCount > 0 ? 'Urgent Alert' : 'Normal'}
          trendType={urgentCount > 0 ? 'negative' : 'positive'}
        />

        <CivicStatCard
          title="In Field Work"
          value={inProgressCount}
          subtitle={`${inProgressCount} tasks currently underway`}
          icon={FieldOpsIcon}
          variant="amber"
          percentage={totalAssigned > 0 ? Math.round((inProgressCount / totalAssigned) * 100) : 0}
          gaugeLabel={`${totalAssigned > 0 ? Math.round((inProgressCount / totalAssigned) * 100) : 0}%`}
          trend={inProgressCount > 0 ? 'Active Work' : 'Idle'}
          trendType="neutral"
        />

        <CivicStatCard
          title="Resolved"
          value={resolvedCount}
          subtitle="Successfully closed orders"
          icon={VerifiedResolutionSeal}
          variant="emerald"
          percentage={completionRate}
          gaugeLabel={`${completionRate}%`}
          trend={`${completionRate}% success`}
          trendType="positive"
        />
      </div>

      {/* Active Work Order Dispatch Queue */}
      <section className="dashboard-panel mt-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Work Order Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeIssues.length} active work {activeIssues.length === 1 ? 'order' : 'orders'} requiring field response or admin review
            </p>
          </div>
          <a
            href="/worker/issues"
            className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            Manage All ({issues.length}) →
          </a>
        </div>

        {issues.length === 0 ? (
          <div className="dashboard-empty-state py-12 text-center">
            <ClipboardList size={28} className="text-slate-300 mx-auto mb-2" />
            <strong className="text-slate-800 text-sm block">No work orders currently assigned</strong>
            <p className="text-slate-500 text-xs mt-1">
              When the municipal administrator dispatches a civic complaint in {user.department || 'your department'}, it will appear here immediately.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 mt-4">
            {issues.map((issue) => (
              <WorkerIssueCard key={issue.id} issue={issue} onUpdate={onUpdate} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function WorkerOperationalPanel({
  availability,
  location,
  setAvailability,
  setLocation,
  onSubmit,
  onSyncLocation,
  isLocating,
  locationStatus,
  message,
  error,
  isLocationPage,
  user,
}) {
  return (
    <section className="dashboard-panel worker-availability-panel">
      <div className="dashboard-panel-heading">
        <div>
          <h2>{isLocationPage ? 'Service location details' : 'Availability status'}</h2>
          <p>{isLocationPage ? 'Keep your current operations location visible to dispatch.' : 'Keep your dispatch team informed of your current status.'}</p>
        </div>
        <Activity size={21} />
      </div>
      <div className="worker-static-callout">
        <MapPin size={18} />
        <div>
          <strong>{isLocationPage ? 'Assigned service area' : 'Current assignment area'}</strong>
          <span>Update the fields below when your field status changes.</span>
        </div>
      </div>
      <form className="worker-availability-form" onSubmit={onSubmit}>
        <label className="worker-field">
          <span>Availability</span>
          <select value={availability} onChange={(event) => setAvailability(event.target.value)}>
            <option>Available</option>
            <option>On duty</option>
            <option>Unavailable</option>
          </select>
        </label>
        <div className="worker-field">
          <div className="flex items-center justify-between pb-1">
            <span className="font-bold text-slate-700">Current location</span>
            <button
              type="button"
              onClick={() => onSyncLocation(true)}
              disabled={isLocating}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer disabled:opacity-50"
              title="Detect and sync your real-time GPS location"
            >
              {isLocating ? (
                <>
                  <LoaderCircle className="report-spinner" size={13} />
                  <span>Syncing GPS...</span>
                </>
              ) : (
                <>
                  <MapPin size={13} />
                  <span>Sync current GPS</span>
                </>
              )}
            </button>
          </div>
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="North operations hub"
          />
          {locationStatus && (
            <small
              className={`report-detection-note ${
                locationStatus.includes('denied') || locationStatus.includes('Unable') || locationStatus.includes('timed out')
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {isLocating ? <LoaderCircle className="report-spinner" size={13} /> : <CheckCircle2 size={13} />} {locationStatus}
            </small>
          )}
          {user?.latitude && user?.longitude && (
            <small className="text-slate-400 text-[11px] block mt-1">
              GPS Coordinates: {user.latitude.toFixed(4)}, {user.longitude.toFixed(4)}
              {user.locationUpdatedAt && ` · Synced ${new Date(user.locationUpdatedAt).toLocaleTimeString()}`}
            </small>
          )}
        </div>
        <button type="submit" className="dashboard-primary-button">Save update</button>
      </form>
      {message && <p className="worker-success">{message}</p>}
      {error && <p className="worker-error">{error}</p>}
    </section>
  );
}

function WorkerIssues({ issues, onUpdate }) {
  return (
    <section className="dashboard-panel worker-issues-panel">
      <div className="dashboard-panel-heading">
        <div>
          <h2>Issues assigned to you</h2>
          <p>{issues.length} assigned {issues.length === 1 ? 'issue' : 'issues'}</p>
        </div>
        <ClipboardList size={21} />
      </div>
      {issues.length === 0 ? (
        <div className="admin-empty-users py-12 text-center text-slate-400">
          No issues have been assigned to your queue yet.
        </div>
      ) : (
        <div className="worker-issues-list">
          {issues.map((issue) => (
            <WorkerIssueCard key={issue.id} issue={issue} onUpdate={onUpdate} />
          ))}
        </div>
      )}
    </section>
  );
}

function WorkerIssueCard({ issue, onUpdate }) {
  const [proofImage, setProofImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const currentStatus = issue.status || 'Submitted';

  const isCritical = issue.priority === 'Critical';
  const isHigh = issue.priority === 'High';

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
    if (!proofImage) return setError('Upload a completion proof photo first.');
    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      await onUpdate(issue.id, { proofImage, status: 'Ready for admin review' });
      setProofImage('');
      setMessage('Proof photo submitted successfully! Pending municipal admin review.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Maps navigation link
  const mapsUrl = issue.latitude && issue.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${issue.latitude},${issue.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(issue.location || '')}`;

  return (
    <article className={`worker-issue-card ${isCritical ? 'border-l-4 border-l-red-500' : isHigh ? 'border-l-4 border-l-amber-500' : ''}`}>
      <div className="worker-issue-card-header">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="category-chip">
              {issue.category}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                isCritical
                  ? 'bg-red-100 text-red-700'
                  : isHigh
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {issue.priority || 'Medium'} Priority
            </span>
            {issue.department && (
              <span className="dept-tag">
                {issue.department}
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-900">{issue.aiTitle || issue.description}</h3>
        </div>

        <strong className={`worker-issue-status worker-issue-status-${currentStatus.toLowerCase().replace(/\s+/g, '-')}`}>
          {currentStatus}
        </strong>
      </div>

      {(issue.aiTitle || issue.aiDescription || issue.aiDetectedCategory || issue.aiSummary) && (
        <div className="issue-ai-details worker-ai-details">
          <div className="issue-ai-details-heading">
            <span>
              <CivicIntelligenceIcon size={15} /> Gemini AI Civic Analysis
            </span>
            <strong>{issue.aiDetectedCategory || issue.category}</strong>
          </div>
          {issue.aiTitle && <h3>{issue.aiTitle}</h3>}
          {issue.aiDescription && <p>{issue.aiDescription}</p>}
          {issue.aiSummary && <small>Action Plan: {issue.aiSummary}</small>}
        </div>
      )}

      <p className="worker-citizen-description">
        <strong>Citizen description:</strong> {issue.description}
      </p>

      {/* Incident Location & Navigation */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
        <span className="flex items-center gap-1 font-medium">
          <MapPin size={14} className="text-blue-600 shrink-0" />
          <span>{issue.location}</span>
        </span>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 underline shrink-0"
        >
          Navigate in Google Maps ↗
        </a>
      </div>

      {/* Citizen Reported Evidence */}
      {issue.imageUrl && (
        <div className="worker-evidence-block">
          <span>Citizen Evidence Photo</span>
          <a href={issue.imageUrl} target="_blank" rel="noreferrer">
            <img className="worker-issue-source-image" src={issue.imageUrl} alt={`Evidence for ${issue.category}`} />
            <strong>Open full resolution image</strong>
          </a>
        </div>
      )}

      {/* Action Bar: Progress Selector & Proof Upload */}
      <div className="worker-issue-actions">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Update Status</span>
          <select
            value={issue.workerCompletionStatus || (currentStatus === 'Submitted' ? 'In progress' : currentStatus)}
            onChange={(event) => onUpdate(issue.id, { status: event.target.value })}
            className="text-xs"
          >
            <option>In progress</option>
            <option>Ready for admin review</option>
          </select>
        </div>

        <label className="worker-proof-input">
          <FileImage size={15} /> Upload Restoration Proof
          <input type="file" accept="image/*" onChange={updateProof} />
        </label>

        <button
          type="button"
          className="dashboard-primary-button"
          onClick={submitProof}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Uploading proof...' : 'Submit Proof to Admin'}
        </button>
      </div>

      {proofImage && (
        <div className="worker-proof-preview">
          <span>Selected Proof Preview (Ready to Submit)</span>
          <img src={proofImage} alt="Proof preview" />
        </div>
      )}

      {issue.workerProofImage && (
        <div className="worker-proof-preview worker-proof-uploaded">
          <span>Uploaded Restoration Proof (Verified by Field Officer)</span>
          <a href={issue.workerProofImage} target="_blank" rel="noreferrer">
            <img src={issue.workerProofImage} alt={`Completion proof for ${issue.category}`} />
            <strong>Open full resolution proof</strong>
          </a>
        </div>
      )}

      {issue.proofReviewStatus && (
        <p className="worker-proof-status flex items-center gap-1.5 mt-2">
          <span>Admin Review Status:</span>
          <strong className={issue.proofReviewStatus === 'Approved' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
            {issue.proofReviewStatus}
          </strong>
        </p>
      )}

      {message && <p className="worker-success mt-2">{message}</p>}
      {error && <p className="worker-error mt-2">{error}</p>}
    </article>
  );
}
