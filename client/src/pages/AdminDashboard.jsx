import { useEffect, useState } from 'react';
import { BarChart3, LayoutDashboard, LogOut, Menu, Settings, ShieldCheck, Users, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { apiRequest, getAuthHeaders } from '../config/api';

const adminPages = [
  { label: 'Admin overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Manage users', href: '/admin/users', icon: Users },
  { label: 'Manage workers', href: '/admin/workers', icon: ShieldCheck },
  { label: 'Create worker', href: '/admin/workers/new', icon: ShieldCheck },
  { label: 'Reports overview', href: '/admin#reports', icon: BarChart3 },
];

export default function AdminDashboard({ pagePath = '/admin' }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isUsersPage = pagePath === '/admin/users';
  const isWorkersPage = pagePath === '/admin/workers';

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const [profile, userList, workerList] = await Promise.all([
          apiRequest('/auth/me', { headers: getAuthHeaders() }),
          apiRequest('/admin/users', { headers: getAuthHeaders() }),
          apiRequest('/admin/workers', { headers: getAuthHeaders() }),
        ]);
        setUser(profile.user);
        setUsers(userList.users);
        setWorkers(workerList.workers);
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
        <div className="dashboard-mobile-toolbar"><button type="button" onClick={() => setSidebarOpen(true)} className="dashboard-mobile-menu-button" aria-label="Open sidebar"><Menu size={20} /></button><span>{isUsersPage ? 'Manage users' : isWorkersPage ? 'Manage workers' : 'Admin overview'}</span></div>
        <div className="dashboard-container">
          <div className="dashboard-heading-row"><div><p className="dashboard-eyebrow">Administrator console</p><h1 className="dashboard-heading">{isUsersPage ? 'Manage users' : isWorkersPage ? 'Manage workers' : 'Admin overview'}</h1><p className="dashboard-description">{isUsersPage ? 'Review citizen accounts and manage their access.' : isWorkersPage ? 'View every field worker and their current service status.' : 'A clear view of your SmartCity platform.'}</p></div>{!isUsersPage && !isWorkersPage && <div className="dashboard-admin-badge"><ShieldCheck size={17} /> Administrator access</div>}</div>
          {isUsersPage ? <UsersTable users={users} onStatusChange={updateStatus} /> : isWorkersPage ? <WorkersTable workers={workers} /> : <AdminOverview users={users} />}
        </div>
      </section>
    </main>
  );
}

function AdminOverview({ users }) {
  return <div className="dashboard-stat-grid admin-stat-grid"><div className="dashboard-stat-card"><div className="dashboard-stat-top"><span>Total citizens</span><Users size={18} /></div><strong>{users.length}</strong><small>Registered user accounts</small></div><div className="dashboard-stat-card"><div className="dashboard-stat-top"><span>Active accounts</span><ShieldCheck size={18} /></div><strong>{users.filter((user) => user.isActive).length}</strong><small>Currently enabled</small></div><div className="dashboard-stat-card"><div className="dashboard-stat-top"><span>Inactive accounts</span><Users size={18} /></div><strong>{users.filter((user) => !user.isActive).length}</strong><small>Access paused</small></div><section className="dashboard-panel admin-welcome-panel"><h2>Platform administration</h2><p>Use Manage users to review citizen profiles and control account access.</p><a href="/admin/users" className="dashboard-primary-button">Open user management <span>→</span></a></section></div>;
}

function UsersTable({ users, onStatusChange }) {
  return <section className="dashboard-panel admin-users-panel"><div className="dashboard-panel-heading"><div><h2>Citizen accounts</h2><p>{users.length} registered users</p></div><Users size={21} /></div><div className="admin-users-list">{users.length === 0 ? <div className="admin-empty-users">No citizen accounts have been registered yet.</div> : users.map((user) => <div className="admin-user-row" key={user.id}><div className="dashboard-avatar">{user.name?.charAt(0).toUpperCase()}</div><div className="admin-user-info"><strong>{user.name}</strong><span>{user.email}</span></div><div className={`admin-status ${user.isActive ? 'admin-status-active' : 'admin-status-inactive'}`}>{user.isActive ? 'Active' : 'Inactive'}</div><button type="button" onClick={() => onStatusChange(user.id, !user.isActive)} className="admin-status-button">{user.isActive ? 'Deactivate' : 'Activate'}</button></div>)}</div></section>;
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

  return <section className="dashboard-panel admin-users-panel"><div className="dashboard-panel-heading"><div><h2>Field workers</h2><p>{workers.length} workers created by administrators</p></div><ShieldCheck size={21} /></div>{workers.length === 0 ? <div className="admin-empty-users">No workers have been created yet.</div> : <><div className="admin-worker-filter" aria-label="Filter workers by department"><span>Filter by specialty</span><div className="admin-worker-filter-options"><button type="button" onClick={() => setSelectedDepartment('All departments')} className={`admin-worker-filter-button ${selectedDepartment === 'All departments' ? 'admin-worker-filter-button-active' : ''}`}>All departments</button>{departments.map((department) => <button type="button" key={department} onClick={() => setSelectedDepartment(department)} className={`admin-worker-filter-button ${selectedDepartment === department ? 'admin-worker-filter-button-active' : ''}`}>{department}</button>)}</div></div><div className="admin-worker-departments">{Object.entries(workersByDepartment).sort(([firstDepartment], [secondDepartment]) => firstDepartment.localeCompare(secondDepartment)).map(([department, departmentWorkers]) => <section className="admin-worker-department" key={department}><div className="admin-worker-department-heading"><div><h3>{department}</h3><span>{departmentWorkers.length} {departmentWorkers.length === 1 ? 'worker' : 'workers'}</span></div><ShieldCheck size={17} /></div><div className="admin-users-list">{departmentWorkers.map((worker) => <div className="admin-user-row" key={worker.id}><div className="dashboard-avatar">{worker.name?.charAt(0).toUpperCase()}</div><div className="admin-user-info"><strong>{worker.name}</strong><span>{worker.email}</span><small className="admin-worker-meta">{worker.jobSkill} · {worker.serviceArea} · {worker.yearsExperience} years</small></div><div className={`admin-status ${worker.availability === 'Unavailable' ? 'admin-status-inactive' : 'admin-status-active'}`}>{worker.availability}</div></div>)}</div></section>)}</div></>}</section>;
}