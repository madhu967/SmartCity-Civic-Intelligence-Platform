import { useEffect, useRef, useState } from 'react';
import { Activity, ArrowLeft, BarChart3, Bell, BriefcaseBusiness, Camera, ClipboardList, FileWarning, Filter, Home, LayoutDashboard, LoaderCircle, LogOut, Mail, MapPin, Menu, Phone, Settings, ShieldCheck, Sparkles, UserRound, Users, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { apiRequest, getAuthHeaders } from '../config/api';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageDraft, setImageDraft] = useState('');
  const [imageZoom, setImageZoom] = useState(1);
  const [imageOffsetX, setImageOffsetX] = useState(0);
  const [imageOffsetY, setImageOffsetY] = useState(0);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    apiRequest('/auth/me', { headers: getAuthHeaders() })
      .then((data) => setUser(data.user))
      .catch((requestError) => {
        localStorage.removeItem('smart_city_token');
        setError(requestError.message);
      });
  }, []);

  const chooseProfileImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setError('Choose an image smaller than 5 MB.');
      return;
    }
    setError('');
    setImageZoom(1);
    setImageOffsetX(0);
    setImageOffsetY(0);
    const reader = new FileReader();
    reader.onload = () => setImageDraft(reader.result);
    reader.readAsDataURL(file);
  };

  const saveProfileImage = () => {
    if (!imageDraft) return;
    setIsUploading(true);
    const imageElement = new Image();
    imageElement.onload = async () => {
      const canvas = document.createElement('canvas');
      const size = 700;
      const context = canvas.getContext('2d');
      canvas.width = size;
      canvas.height = size;
      context.fillStyle = '#e2e8f0';
      context.fillRect(0, 0, size, size);
      const scale = Math.min(size / imageElement.naturalWidth, size / imageElement.naturalHeight) * imageZoom;
      const renderedWidth = imageElement.naturalWidth * scale;
      const renderedHeight = imageElement.naturalHeight * scale;
      const positionX = (size - renderedWidth) / 2 + imageOffsetX * 2;
      const positionY = (size - renderedHeight) / 2 + imageOffsetY * 2;
      context.drawImage(imageElement, positionX, positionY, renderedWidth, renderedHeight);
      try {
        const data = await apiRequest('/auth/profile-image', { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ profileImage: canvas.toDataURL('image/jpeg', 0.9) }) });
        setUser(data.user);
        localStorage.setItem('smart_city_user', JSON.stringify(data.user));
        setImageDraft('');
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsUploading(false);
      }
    };
    imageElement.src = imageDraft;
  };

  const startImageDrag = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, y: event.clientY, offsetX: imageOffsetX, offsetY: imageOffsetY };
    setIsDraggingImage(true);
  };

  const moveImage = (event) => {
    if (!isDraggingImage) return;
    setImageOffsetX(Math.max(-70, Math.min(70, dragStart.current.offsetX + event.clientX - dragStart.current.x)));
    setImageOffsetY(Math.max(-70, Math.min(70, dragStart.current.offsetY + event.clientY - dragStart.current.y)));
  };

  const stopImageDrag = () => setIsDraggingImage(false);

  const zoomImage = (event) => {
    event.preventDefault();
    setImageZoom((current) => Math.max(1, Math.min(2.5, current + (event.deltaY < 0 ? 0.08 : -0.08))));
  };

  const logout = () => {
    localStorage.removeItem('smart_city_token');
    window.dispatchEvent(new Event('auth-logout'));
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (error) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-sm text-slate-500">{error}. <a href="/login" className="ml-1 font-bold text-brand-600">Log in again</a></main>;
  }

  if (!user) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-brand-600">Loading profile...</main>;
  }

  const initials = user.name?.trim().charAt(0).toUpperCase() || 'C';
  const isAdmin = user.role === 'admin';
  const isWorker = user.role === 'worker';
  const sidebarTitle = isAdmin ? 'Admin console' : isWorker ? 'Worker space' : 'Citizen space';
  const sidebarPages = isAdmin
    ? [
        ['Admin overview', LayoutDashboard, '/admin'],
        ['Manage users', Users, '/admin/users'],
        ['Manage workers', ShieldCheck, '/admin/workers'],
        ['Issue dashboard', Filter, '/admin/issues'],
        ['Contact inbox', Mail, '/admin/contacts'],
        ['Create worker', BriefcaseBusiness, '/admin/workers/new'],
        ['Reports overview', BarChart3, '/admin/reports'],
      ]
    : isWorker
      ? [
          ['My dashboard', BriefcaseBusiness, '/worker'],
          ['Availability', Activity, '/worker/availability'],
          ['Service location', MapPin, '/worker/location'],
          ['Assigned issues', ClipboardList, '/worker/issues'],
        ]
      : [
          ['Overview', Home, '/dashboard'],
          ['Report an issue', FileWarning, '/report-issue'],
          ['AI issue assistant', Sparkles, '/ai-report'],
          ['My reports', ClipboardList, '/reports'],
          ['Nearby activity', Activity, '/activity'],
          ['Notifications', Bell, '/notifications'],
        ];
  const backPath = isAdmin ? '/admin' : isWorker ? '/worker' : '/dashboard';

  return (
    <main className="profile-page min-h-screen bg-white text-slate-900">
      <Navbar isAuthenticated user={user} onLogout={logout} />
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar-open' : ''}`}>
        <div className="dashboard-sidebar-brand"><div className="dashboard-sidebar-mark">S</div><div><p className="dashboard-sidebar-title">{sidebarTitle}</p><p className="dashboard-sidebar-subtitle">SmartCity platform</p></div><button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-close-button" aria-label="Close sidebar"><X size={18} /></button></div>
        <p className="dashboard-sidebar-label">Workspace</p>
        <nav className="dashboard-sidebar-nav">{sidebarPages.map(([label, Icon, href]) => <a key={label} href={href} className="dashboard-sidebar-link" onClick={() => setSidebarOpen(false)}><Icon size={18} /><span>{label}</span></a>)}</nav>
        <div className="dashboard-sidebar-footer"><a href="/profile" className="dashboard-sidebar-link dashboard-sidebar-link-active"><UserRound size={18} /><span>{isAdmin ? 'Admin profile' : isWorker ? 'Worker profile' : 'Profile details'}</span></a><button type="button" className="dashboard-sidebar-link"><Settings size={18} /><span>Account settings</span></button><button type="button" onClick={logout} className="dashboard-sidebar-link dashboard-logout"><LogOut size={18} /><span>Log out</span></button></div>
      </aside>
      {sidebarOpen && <button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-sidebar-overlay" aria-label="Close sidebar" />}
      <div className="profile-mobile-toolbar"><button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"><Menu size={20} /></button><span>Profile details</span></div>
      <section className="profile-content">
        <a href={backPath} className="profile-back-link"><ArrowLeft size={15} /> Back to {isAdmin ? 'admin console' : isWorker ? 'worker dashboard' : 'dashboard'}</a>
        <div className="profile-heading"><p className="dashboard-eyebrow">{isAdmin ? 'Administration' : isWorker ? 'Field operations' : 'Account'}</p><h1>Profile details</h1><p>Manage and review the information connected to your {isAdmin ? 'administrator' : isWorker ? 'worker' : 'citizen'} account.</p></div>
        <div className="profile-card">
          <div className="profile-card-banner"><div className="profile-avatar-upload"><div className="profile-large-avatar">{user.profileImage ? <img src={user.profileImage} alt={`${user.name} profile`} /> : initials}</div><label className="profile-avatar-edit" title="Choose profile picture"><Camera size={14} /><input type="file" accept="image/*" onChange={chooseProfileImage} disabled={isUploading} /></label></div><div><h2>{user.name}</h2><p>{user.role} account</p><small className="profile-image-hint">{isUploading ? 'Saving profile picture...' : imageDraft ? 'Adjust your picture below' : 'Add a profile picture'}</small></div></div>
          {imageDraft && <div className="profile-image-editor"><div className={`profile-image-crop ${isDraggingImage ? 'profile-image-crop-dragging' : ''}`} onPointerDown={startImageDrag} onPointerMove={moveImage} onPointerUp={stopImageDrag} onPointerCancel={stopImageDrag} onWheel={zoomImage}><img src={imageDraft} alt="Profile crop preview" draggable="false" style={{ transform: `translate(${imageOffsetX}px, ${imageOffsetY}px) scale(${imageZoom})` }} /></div><div className="profile-image-controls"><p className="profile-image-instruction">Drag to reposition · Scroll or pinch to zoom</p><div className="profile-image-actions"><button type="button" onClick={() => setImageDraft('')} className="profile-image-cancel">Cancel</button><button type="button" onClick={saveProfileImage} disabled={isUploading} className="dashboard-primary-button">{isUploading ? <><LoaderCircle className="profile-upload-spinner" size={14} /> Saving...</> : 'Save picture'}</button></div></div></div>}
          <div className="profile-detail-grid">
            <div><span><Mail size={16} /> Email address</span><strong>{user.email}</strong></div>
            <div><span><Phone size={16} /> Phone number</span><strong>{user.phone || 'Not added yet'}</strong></div>
            <div><span><ShieldCheck size={16} /> Account role</span><strong className="capitalize">{user.role}</strong></div>
            <div><span><MapPin size={16} /> Community status</span><strong className="profile-active">Active citizen</strong></div>
            <div><span><UserRound size={16} /> Account created</span><strong>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'System account'}</strong></div>
          </div>
        </div>
      </section>
    </main>
  );
}