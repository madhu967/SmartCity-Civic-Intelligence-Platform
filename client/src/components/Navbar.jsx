import { useState, useEffect } from 'react';
import { LayoutDashboard, LogOut, UserRound } from 'lucide-react';

export default function Navbar({ isAuthenticated = false, user = null, onLogout = () => {} }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const publicNavItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];
  const navItems = isAuthenticated
    ? [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }, ...publicNavItems]
    : publicNavItems;
  const currentPath = window.location.pathname;
  const isActive = (href) => {
    if (href === '/dashboard') return currentPath === '/dashboard' || currentPath.startsWith('/admin') || currentPath.startsWith('/worker');
    return href === '/' ? currentPath === '/' : currentPath === href;
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${isAuthenticated ? 'dashboard-navbar' : ''} ${scrolled || isAuthenticated ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200' : 'bg-transparent'}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8 relative">
        {/* Logo */}
          <a href={isAuthenticated ? "/dashboard" : "#"} className="flex items-center gap-3 group">
          <svg className="h-10 w-10 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M54 0c5.523 0 10 4.477 10 10v44c0 5.523-4.477 10-10 10H37.871C35.368 46.753 41.8 29.002 55.437 17.423a52 52 0 0 0-8.057 3.847C31.593 30.553 22.59 46.956 22.043 64H10c-1.127 0-2.21-.19-3.222-.533-.18-3.525.037-7.127.692-10.75 4.105-22.71 23.963-38.605 46.276-38.46a47 47 0 0 0-7.84-2.128C27.81 8.858 10.266 16.473 0 30.304V10C0 4.477 4.477 0 10 0z" fill="#2563EB"/>
          </svg>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none tracking-tight text-slate-900">
              Smart<span className="text-brand-600">City</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Civic Intelligence
            </span>
          </div>
        </a>

        {/* Desktop Links (Pill Menu) */}
        <div className="navbar-desktop-links items-center bg-zinc-50 border border-zinc-200 rounded-full px-1 py-1 gap-2 shadow-sm">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-colors ${isActive(item.href) ? 'bg-white border border-zinc-200 font-medium text-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`} >
              {item.icon && <item.icon size={14} />}{item.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="navbar-desktop-actions items-center gap-5">
          {isAuthenticated ? (
            <div className="dashboard-navbar-account">
              <a href="/profile" className="dashboard-navbar-profile" aria-label="Open profile details" title="Open profile details">
                <span className="dashboard-navbar-avatar">{user?.profileImage ? <img src={user.profileImage} alt="" /> : <UserRound size={16} />}</span>
                <span className="dashboard-navbar-profile-copy"><strong>{user?.name || 'Citizen'}</strong><small>{user?.role || 'citizen'} profile</small></span>
              </a>
              <button type="button" onClick={onLogout} className="dashboard-navbar-logout"><LogOut size={15} /><span>Log out</span></button>
            </div>
          ) : (
            <a href="#login" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Log in</a>
          )}
          {!isAuthenticated && (
            <a
              href="/report-issue"
              className="flex items-center gap-2.5 bg-brand-600 text-white text-sm font-bold pl-5 pr-2 py-2 rounded-full cursor-pointer border-0 shadow-md transition-all hover:bg-brand-700 hover:shadow-lg hover:-translate-y-0.5 group"
            >
              Report an Issue
              <span className="size-7 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center transition-colors">
                <span aria-hidden="true">→</span>
              </span>
            </a>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="navbar-mobile-toggle flex flex-col gap-1.5 cursor-pointer bg-transparent border-0 p-1" aria-label="Open navigation menu">
          <span className={`block w-6 h-0.5 bg-zinc-800 transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-zinc-800 transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-zinc-800 transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`navbar-mobile-menu absolute top-full left-0 w-full bg-white border-b border-zinc-200 flex-col p-5 gap-1 shadow-xl transition-all duration-300 origin-top ${menuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
        {navItems.map((item) => (
          <a key={item.label} href={item.href} className={`px-4 py-2.5 rounded-lg text-sm ${isActive(item.href) ? 'bg-zinc-50 font-medium text-zinc-800' : 'text-zinc-500 hover:bg-zinc-50'}`} onClick={() => setMenuOpen(false)}>
            {item.label}
          </a>
        ))}
        <div className="h-px bg-zinc-100 my-2" />
        {isAuthenticated ? (
          <>
            <a href="/profile" className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><UserRound size={17} /> Profile details</a>
            <button type="button" className="dashboard-mobile-logout" onClick={onLogout}><LogOut size={17} /> Log out</button>
          </>
        ) : (
          <a href="#login" className="px-4 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50 font-medium" onClick={() => setMenuOpen(false)}>Log in</a>
        )}
        {!isAuthenticated && (
          <a
            href="/report-issue"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2.5 bg-brand-600 text-white text-sm font-bold px-5 py-2.5 rounded-full cursor-pointer border-0 mt-3 w-fit shadow-md hover:bg-brand-700 transition-colors group"
          >
            Report an Issue
            <span className="size-7 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center transition-colors">
              →
            </span>
          </a>
        )}
      </div>
    </header>
  );
}
