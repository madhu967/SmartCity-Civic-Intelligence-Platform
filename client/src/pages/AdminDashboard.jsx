import { useEffect, useState } from 'react';
import { BarChart3, Bot, CheckCircle2, Filter, LayoutDashboard, LogOut, Mail, MapPin, Menu, Search, Settings, ShieldCheck, UserCheck, Users, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { apiRequest, getAuthHeaders } from '../config/api';

const adminPages = [
  { label: 'Admin overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Manage users', href: '/admin/users', icon: Users },
  { label: 'Manage workers', href: '/admin/workers', icon: ShieldCheck },
  { label: 'Issue dashboard', href: '/admin/issues', icon: Filter },
  { label: 'Contact inbox', href: '/admin/contacts', icon: Mail },
  { label: 'Create worker', href: '/admin/workers/new', icon: ShieldCheck },
  { label: 'Reports overview', href: '/admin#reports', icon: BarChart3 },
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
  const isUsersPage = pagePath === '/admin/users';
  const isWorkersPage = pagePath === '/admin/workers';
  const isIssuesPage = pagePath === '/admin/issues';
  const isContactsPage = pagePath === '/admin/contacts';

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
    <main className="dashboard-page min-h-screen bg-white text-slate-900">
      <Navbar isAuthenticated user={user} onLogout={logout} />
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar-open' : ''}`}>
        <div className="dashboard-sidebar-brand"><div className="dashboard-sidebar-mark">S</div><div><p className="dashboard-sidebar-title">Admin console</p><p className="dashboard-sidebar-subtitle">SmartCity platform</p></div><button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-close-button" aria-label="Close sidebar"><X size={18} /></button></div>
        <p className="dashboard-sidebar-label">Administration</p>
        <nav className="dashboard-sidebar-nav">{adminPages.map(({ label, href, icon: Icon }) => <a key={label} href={href} onClick={() => setSidebarOpen(false)} className={`dashboard-sidebar-link ${href === pagePath ? 'dashboard-sidebar-link-active' : ''}`}><Icon size={18} /><span>{label}</span></a>)}</nav>
        <div className="dashboard-sidebar-footer"><a href="/profile" className="dashboard-sidebar-link"><ShieldCheck size={18} /><span>Admin profile</span></a><button type="button" className="dashboard-sidebar-link"><Settings size={18} /><span>Settings</span></button><button type="button" onClick={logout} className="dashboard-sidebar-link dashboard-logout"><LogOut size={18} /><span>Log out</span></button></div>
      </aside>
      {sidebarOpen && <button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-sidebar-overlay" aria-label="Close sidebar" />}
      <section className="dashboard-main">
        <div className="dashboard-mobile-toolbar"><button type="button" onClick={() => setSidebarOpen(true)} className="dashboard-mobile-menu-button" aria-label="Open sidebar"><Menu size={20} /></button><span>{isUsersPage ? 'Manage users' : isWorkersPage ? 'Manage workers' : isIssuesPage ? 'Issue dashboard' : isContactsPage ? 'Contact inbox' : 'Admin overview'}</span></div>
        <div className="dashboard-container">
          <div className="dashboard-heading-row"><div><p className="dashboard-eyebrow">Administrator console</p><h1 className="dashboard-heading">{isUsersPage ? 'Manage users' : isWorkersPage ? 'Manage workers' : isIssuesPage ? 'Admin Issue Dashboard' : isContactsPage ? 'Contact inbox' : 'Admin overview'}</h1><p className="dashboard-description">{isUsersPage ? 'Review citizen accounts and manage their access.' : isWorkersPage ? 'View every field worker and their current service status.' : isIssuesPage ? 'Review, prioritize, edit, and assign every citizen complaint.' : isContactsPage ? 'Review messages about the website, civic help, and community feedback.' : 'A clear view of your SmartCity platform.'}</p></div>{!isUsersPage && !isWorkersPage && !isIssuesPage && !isContactsPage && <div className="dashboard-admin-badge"><ShieldCheck size={17} /> Administrator access</div>}</div>
          {isUsersPage ? <UsersTable users={users} onStatusChange={updateStatus} /> : isWorkersPage ? <WorkersTable workers={workers} /> : isIssuesPage ? <AdminIssues issues={issues} workers={workers} onUpdate={updateIssue} /> : isContactsPage ? <ContactInbox contacts={contacts} onUpdate={(contact) => setContacts((current) => current.map((item) => item.id === contact.id ? contact : item))} /> : <AdminOverview users={users} />}
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

function AdminOverview({ users }) {
  return <div className="dashboard-stat-grid admin-stat-grid"><div className="dashboard-stat-card"><div className="dashboard-stat-top"><span>Total citizens</span><Users size={18} /></div><strong>{users.length}</strong><small>Registered user accounts</small></div><div className="dashboard-stat-card"><div className="dashboard-stat-top"><span>Active accounts</span><ShieldCheck size={18} /></div><strong>{users.filter((user) => user.isActive).length}</strong><small>Currently enabled</small></div><div className="dashboard-stat-card"><div className="dashboard-stat-top"><span>Inactive accounts</span><Users size={18} /></div><strong>{users.filter((user) => !user.isActive).length}</strong><small>Access paused</small></div><section className="dashboard-panel admin-welcome-panel"><h2>Platform administration</h2><p>Use Manage users to review citizen profiles and control account access.</p><a href="/admin/users" className="dashboard-primary-button">Open user management <span>→</span></a></section></div>;
}

function UsersTable({ users, onStatusChange }) {
  return <section className="dashboard-panel admin-users-panel"><div className="dashboard-panel-heading"><div><h2>Citizen accounts</h2><p>{users.length} registered users</p></div><Users size={21} /></div><div className="admin-users-list">{users.length === 0 ? <div className="admin-empty-users">No citizen accounts have been registered yet.</div> : users.map((user) => <div className="admin-user-row" key={user.id}><div className="dashboard-avatar">{user.profileImage ? <img src={user.profileImage} alt={`${user.name} profile`} /> : user.name?.charAt(0).toUpperCase()}</div><div className="admin-user-info"><strong>{user.name}</strong><span>{user.email}</span></div><div className={`admin-status ${user.isActive ? 'admin-status-active' : 'admin-status-inactive'}`}>{user.isActive ? 'Active' : 'Inactive'}</div><button type="button" onClick={() => onStatusChange(user.id, !user.isActive)} className="admin-status-button">{user.isActive ? 'Deactivate' : 'Activate'}</button></div>)}</div></section>;
}

function WorkersTable({ workers }) {
  const [selectedDepartment, setSelectedDepartment] = useState('All departments');
  const departments = [...new Set(workers.map((worker) => worker.department || 'Unassigned department'))].sort((firstDepartment, secondDepartment) => firstDepartment.localeCompare(secondDepartment));
  const visibleWorkers = selectedDepartment === 'All departments' ? workers : workers.filter((worker) => (worker.department || 'Unassigned department') === selectedDepartment);
  const workersByDepartment = visibleWorkers.reduce((groups, worker) => {
    const department = worker.department || 'Unassigned department';
    groups[department] = groups[department] || [];
    groups[department].push(worker);
    return groups;
  }, {});

  return <section className="dashboard-panel admin-users-panel"><div className="dashboard-panel-heading"><div><h2>Field workers</h2><p>{workers.length} workers created by administrators</p></div><ShieldCheck size={21} /></div>{workers.length === 0 ? <div className="admin-empty-users">No workers have been created yet.</div> : <><div className="admin-worker-filter" aria-label="Filter workers by department"><span>Filter by specialty</span><div className="admin-worker-filter-options"><button type="button" onClick={() => setSelectedDepartment('All departments')} className={`admin-worker-filter-button ${selectedDepartment === 'All departments' ? 'admin-worker-filter-button-active' : ''}`}>All departments</button>{departments.map((department) => <button type="button" key={department} onClick={() => setSelectedDepartment(department)} className={`admin-worker-filter-button ${selectedDepartment === department ? 'admin-worker-filter-button-active' : ''}`}>{department}</button>)}</div></div><div className="admin-worker-departments">{Object.entries(workersByDepartment).sort(([firstDepartment], [secondDepartment]) => firstDepartment.localeCompare(secondDepartment)).map(([department, departmentWorkers]) => <section className="admin-worker-department" key={department}><div className="admin-worker-department-heading"><div><h3>{department}</h3><span>{departmentWorkers.length} {departmentWorkers.length === 1 ? 'worker' : 'workers'}</span></div><ShieldCheck size={17} /></div><div className="admin-users-list">{departmentWorkers.map((worker) => <div className="admin-user-row" key={worker.id}><div className="dashboard-avatar">{worker.profileImage ? <img src={worker.profileImage} alt={`${worker.name} profile`} /> : worker.name?.charAt(0).toUpperCase()}</div><div className="admin-user-info"><strong>{worker.name}</strong><span>{worker.email}</span><small className="admin-worker-meta">{worker.jobSkill} · {worker.serviceArea} · {worker.yearsExperience} years</small></div><div className={`admin-status ${worker.availability === 'Unavailable' ? 'admin-status-inactive' : 'admin-status-active'}`}>{worker.availability}</div></div>)}</div></section>)}</div></>}</section>;
}

function AdminIssues({ issues, workers, onUpdate }) {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All priorities');
  const [locationFilter, setLocationFilter] = useState('');
  const departments = departmentOptions;
  const filteredIssues = issues.filter((issue) => {
    const searchText = `${issue.category} ${issue.description} ${issue.location} ${issue.reporter?.name || ''} ${issue.reporter?.email || ''}`.toLowerCase();
    return searchText.includes(search.toLowerCase())
      && (priorityFilter === 'All priorities' || issue.priority === priorityFilter)
      && issue.location.toLowerCase().includes(locationFilter.toLowerCase());
  });

  return <section className="dashboard-panel admin-issues-panel"><div className="admin-issues-toolbar"><label className="admin-issue-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search complaints, people, or locations" /></label><label className="admin-issue-filter"><Filter size={15} /><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option>All priorities</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></label><label className="admin-issue-location-filter"><MapPin size={15} /><input value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} placeholder="Filter location" /></label></div><div className="admin-issues-summary"><strong>{filteredIssues.length}</strong><span>of {issues.length} complaints shown</span></div>{filteredIssues.length === 0 ? <div className="admin-empty-users">No issue reports match the current filters.</div> : <div className="admin-issues-list">{filteredIssues.map((issue) => <AdminIssueCard key={issue.id} issue={issue} workers={workers} departments={departments} onUpdate={onUpdate} />)}</div>}</section>;
}

function AdminIssueCard({ issue, workers, departments, onUpdate }) {
  const [draft, setDraft] = useState({ priority: issue.priority || 'Medium', department: issue.department || '', location: issue.location, status: issue.status || 'Submitted', assignedWorker: issue.assignedWorker?.id || '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const updateDraft = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const submitChanges = async () => {
    setMessage('');
    setError('');
    try {
      await onUpdate(issue.id, draft);
      setMessage('Issue changes saved.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  const reviewProof = (proofReviewStatus) => onUpdate(issue.id, { proofReviewStatus });
  return <article className="admin-issue-card"><div className="admin-issue-card-top"><div><span className="admin-issue-category">{issue.category}</span><h2>{issue.aiTitle || issue.description}</h2><p className="admin-issue-reporter">Reported by {issue.reporter?.name || 'Unknown citizen'} · {issue.reporter?.email || 'No email'}</p></div></div>{(issue.aiTitle || issue.aiDescription || issue.aiDetectedCategory || issue.aiSummary) && <div className="issue-ai-details"><div className="issue-ai-details-heading"><span><Bot size={15} /> Gemini analysis</span><strong>{issue.aiDetectedCategory || issue.category}</strong></div>{issue.aiTitle && <h3>{issue.aiTitle}</h3>}{issue.aiDescription && <p>{issue.aiDescription}</p>}{issue.aiSummary && <small>{issue.aiSummary}</small>}</div>}<p className="issue-citizen-description"><strong>Citizen description:</strong> {issue.description}</p><div className="admin-issue-meta"><span><MapPin size={14} /> {issue.location}</span><span>{new Date(issue.createdAt).toLocaleString()}</span></div>{issue.imageUrl && <a href={issue.imageUrl} target="_blank" rel="noreferrer" className="admin-issue-image-link"><img src={issue.imageUrl} alt={`Evidence for ${issue.category}`} /> View citizen image</a>}{issue.workerProofImage && <div className="admin-proof-review"><img src={issue.workerProofImage} alt={`Worker proof for ${issue.category}`} /><div><strong>Worker completion proof</strong><span>{issue.proofReviewStatus || 'Pending review'}</span><div className="admin-issue-actions"><button type="button" onClick={() => reviewProof('Approved')} className="admin-issue-action admin-issue-verify">Approve proof</button><button type="button" onClick={() => reviewProof('Rejected')} className="admin-issue-action admin-issue-reject">Reject proof</button></div></div></div>}<div className="admin-issue-controls"><label><span>Priority</span><select value={draft.priority} onChange={(event) => updateDraft('priority', event.target.value)}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></label><label><span>Department</span><select value={draft.department} onChange={(event) => updateDraft('department', event.target.value)}><option value="">Select department</option>{departments.map((department) => <option key={department}>{department}</option>)}</select></label><label><span>Location</span><input value={draft.location} onChange={(event) => updateDraft('location', event.target.value)} /></label><label><span>Status</span><select value={draft.status} onChange={(event) => updateDraft('status', event.target.value)}><option>Submitted</option><option>In review</option><option>In progress</option><option>Resolved</option></select></label><label><span><UserCheck size={14} /> Assign worker</span><select value={draft.assignedWorker} onChange={(event) => updateDraft('assignedWorker', event.target.value)}><option value="">Unassigned</option>{workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.name} · {worker.department || 'No department'}</option>)}</select></label></div><div className="admin-issue-submit-row"><button type="button" onClick={submitChanges} className="dashboard-primary-button">Submit issue changes</button>{message && <span className="admin-issue-save-message">{message}</span>}{error && <span className="admin-issue-error-message">{error}</span>}</div></article>;
}