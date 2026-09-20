import React, { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { apiRequest, redirectToDashboard } from '../config/api';
import { getUserCurrentLocation } from '../utils/geolocation';

const DEMO_ACCOUNTS = [
  {
    role: 'admin',
    label: 'Admin',
    email: 'admin@smartcity.local',
    password: 'SmartCityAdmin2026!',
    badge: 'Civic Admin',
  },
  {
    role: 'citizen',
    label: 'Citizen',
    email: 'citizen@smartcity.local',
    password: 'CitizenDemo2026!',
    badge: 'Resident',
  },
  {
    role: 'worker',
    label: 'Worker',
    email: 'worker@smartcity.local',
    password: 'WorkerDemo2026!',
    badge: 'Field Ops',
  },
];

const initialLoginForm = {
  name: '',
  email: DEMO_ACCOUNTS[0].email,
  password: DEMO_ACCOUNTS[0].password,
};

const initialRegisterForm = {
  name: '',
  email: '',
  password: '',
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState(initialLoginForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  const selectDemoAccount = (acc) => {
    setForm((prev) => ({
      ...prev,
      email: acc.email,
      password: acc.password,
    }));
    setError('');
  };

  const clearCredentials = () => {
    setForm((prev) => ({
      ...prev,
      email: '',
      password: '',
    }));
    setError('');
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data = await apiRequest(isLogin ? '/auth/login' : '/auth/register', {
        method: 'POST',
        body: JSON.stringify(isLogin ? {
          email: form.email,
          password: form.password,
        } : form),
      });

      localStorage.setItem('smart_city_token', data.token);
      localStorage.setItem('smart_city_user', JSON.stringify(data.user));

      if (data.user?.role === 'worker') {
        // Run location update non-blockingly so dashboard redirects immediately
        getUserCurrentLocation()
          .then((loc) => {
            if (loc) {
              return apiRequest('/worker/location', {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${data.token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  location: loc.locationString,
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                }),
              });
            }
          })
          .catch((locationError) => {
            console.warn('Worker location background sync:', locationError);
          });
      }

      redirectToDashboard(data.user.role === 'admin' ? '/admin' : data.user.role === 'worker' ? '/worker' : '/dashboard');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setIsLogin((currentMode) => {
      const nextMode = !currentMode;
      setForm(nextMode ? initialLoginForm : initialRegisterForm);
      return nextMode;
    });
    setError('');
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all';
  const mobileInputClass = 'w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none transition-all';
  const errorMessage = error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 font-sans">
      <a
        href="/"
        onClick={() => {
          window.location.hash = '';
        }}
        className="absolute left-6 top-6 z-50 flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-500 shadow-sm backdrop-blur transition-colors hover:text-slate-900"
      >
        <span>&larr;</span> Home
      </a>

      <div className="auth-desktop-view relative h-screen w-full">
        <div
          className="absolute left-0 top-0 z-20 h-full w-1/2"
          style={{
            transform: isLogin ? 'translateX(0%)' : 'translateX(100%)',
            transition: 'transform 1s cubic-bezier(0.82,0.085,0.395,0.895)',
          }}
        >
          <div className="relative h-full w-full overflow-hidden bg-slate-900">
            <div className="absolute inset-0 z-10 bg-linear-to-br from-brand-600/40 to-slate-900/70 mix-blend-multiply" />
            <img
              src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80&w=1600"
              alt="Cityscape"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-center text-white">
              <h2 className="mb-4 text-4xl font-bold tracking-tight">
                {isLogin ? 'New to SmartCity?' : 'Already have an account?'}
              </h2>
              <p className="mb-8 max-w-sm text-lg font-light text-brand-100">
                {isLogin
                  ? 'Sign up to report issues, track resolutions, and help build a better community.'
                  : 'Log in to access your dashboard, track your reports, and stay updated.'}
              </p>
              <button
                type="button"
                onClick={switchMode}
                className="cursor-pointer rounded-full border-2 border-white/30 px-8 py-3 font-bold tracking-wide text-white transition-all hover:border-white hover:bg-white/10"
              >
                {isLogin ? 'Create Account' : 'Log In'}
              </button>
            </div>
          </div>
        </div>

        <div
          className="absolute left-1/2 top-0 z-10 flex h-full w-1/2 items-center justify-center bg-white"
          style={{
            transform: isLogin ? 'translateX(0%)' : 'translateX(-100%)',
            transition: 'transform 1s cubic-bezier(0.82,0.085,0.395,0.895)',
          }}
        >
          <div className="relative w-full max-w-md px-8" style={{ perspective: '1000px', height: '520px' }}>
            <div
              className="relative h-full w-full"
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.7s ease-in-out',
                transform: isLogin ? 'rotateY(0deg)' : 'rotateY(180deg)',
              }}
            >
              <div className="absolute inset-0 flex h-full w-full flex-col justify-center" style={{ backfaceVisibility: 'hidden' }}>
                <div className="mb-4">
                  <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome back</h3>
                  <p className="mt-1 text-sm text-slate-500">Log in or select a demo account for 1-click access.</p>
                </div>

                {/* 1-Click Demo Profiles */}
                <div className="mb-4 rounded-2xl border border-slate-200/90 bg-slate-50/90 p-2.5 shadow-xs">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Demo Accounts</span>
                    {(form.email || form.password) && (
                      <button
                        type="button"
                        onClick={clearCredentials}
                        className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 shadow-2xs transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        title="Clear input fields"
                      >
                        <X size={12} />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {DEMO_ACCOUNTS.map((acc) => {
                      const isSelected = form.email === acc.email && form.password === acc.password;
                      return (
                        <button
                          key={acc.role}
                          type="button"
                          onClick={() => selectDemoAccount(acc)}
                          className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl p-2 text-center transition-all ${
                            isSelected
                              ? 'border border-brand-600 bg-white text-brand-900 shadow-xs ring-2 ring-brand-500/20'
                              : 'border border-slate-200/80 bg-white/80 text-slate-700 hover:border-slate-300 hover:bg-white'
                          }`}
                        >
                          <span className="text-xs font-bold">{acc.label}</span>
                          <span className={`mt-0.5 text-[10px] font-medium ${isSelected ? 'text-brand-600 font-semibold' : 'text-slate-400'}`}>
                            {acc.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form className="space-y-3.5" onSubmit={submitForm}>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                    <input required type="email" name="email" value={form.email} onChange={updateField} placeholder="you@example.com" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                      >
                        {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                        <span>{showPassword ? 'Hide password' : 'Show password'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        required
                        minLength={6}
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={updateField}
                        placeholder="••••••••"
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
                        title={showPassword ? 'Hide password' : 'Show password'}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                  {errorMessage}
                  <button type="submit" disabled={isSubmitting} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 font-bold text-white shadow-md shadow-brand-500/20 transition-all hover:bg-brand-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60">
                    {isSubmitting ? 'Logging in...' : 'Log In'} {!isSubmitting && <span>&rarr;</span>}
                  </button>
                </form>
              </div>

              <div className="absolute inset-0 flex h-full w-full flex-col justify-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <div className="mb-8">
                  <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">Create account</h3>
                  <p className="mt-2 text-slate-500">Join us to make your city better.</p>
                </div>
                <form className="space-y-4" onSubmit={submitForm}>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Full Name</label>
                    <input required name="name" value={form.name} onChange={updateField} placeholder="John Doe" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                    <input required type="email" name="email" value={form.email} onChange={updateField} placeholder="you@example.com" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                        <span>{showPassword ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        required
                        minLength={6}
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={updateField}
                        placeholder="••••••••"
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
                        title={showPassword ? 'Hide password' : 'Show password'}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                  {errorMessage}
                  <button type="submit" disabled={isSubmitting} className="mt-2 w-full cursor-pointer rounded-xl bg-slate-900 py-3.5 font-bold text-white shadow-md shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60">
                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-mobile-view flex min-h-screen w-full items-center justify-center p-4 sm:p-6" style={{ perspective: '1000px' }}>
        <div
          className="relative w-full max-w-sm"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.7s ease-in-out',
            transform: isLogin ? 'rotateY(0deg)' : 'rotateY(180deg)',
            height: '580px',
          }}
        >
          <div className="absolute inset-0 flex h-full w-full flex-col justify-center rounded-3xl border border-slate-100 bg-white p-6 shadow-xl" style={{ backfaceVisibility: 'hidden' }}>
            <div className="mb-3">
              <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">Welcome back</h3>
              <p className="mt-1 text-xs text-slate-500">Select a demo role or enter your credentials.</p>
            </div>

            {/* 1-Click Demo Profiles */}
            <div className="mb-3 rounded-2xl border border-slate-200/90 bg-slate-50/90 p-2 shadow-xs">
              <div className="mb-1.5 flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Demo Accounts</span>
                {(form.email || form.password) && (
                  <button
                    type="button"
                    onClick={clearCredentials}
                    className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-2xs transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    title="Clear input fields"
                  >
                    <X size={10} />
                    <span>Clear</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {DEMO_ACCOUNTS.map((acc) => {
                  const isSelected = form.email === acc.email && form.password === acc.password;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => selectDemoAccount(acc)}
                      className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl p-1.5 text-center transition-all ${
                        isSelected
                          ? 'border border-brand-600 bg-white text-brand-900 shadow-xs ring-2 ring-brand-500/20'
                          : 'border border-slate-200/80 bg-white/80 text-slate-700 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <span className="text-[11px] font-bold">{acc.label}</span>
                      <span className={`text-[9px] font-medium ${isSelected ? 'text-brand-600 font-semibold' : 'text-slate-400'}`}>
                        {acc.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form className="space-y-3" onSubmit={submitForm}>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Email</label>
                <input required type="email" name="email" value={form.email} onChange={updateField} placeholder="you@example.com" className={mobileInputClass} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="flex cursor-pointer items-center gap-1 text-[10px] font-semibold text-brand-600 hover:text-brand-700"
                  >
                    {showPassword ? <EyeOff size={11} /> : <Eye size={11} />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    required
                    minLength={6}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={updateField}
                    placeholder="••••••••"
                    className={`${mobileInputClass} pr-9`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {errorMessage}
              <button type="submit" disabled={isSubmitting} className="mt-1 w-full cursor-pointer rounded-xl bg-brand-600 py-3 font-bold text-white shadow-md transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Logging in...' : 'Log In'}</button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-xs font-medium text-slate-500">Don't have an account?{' '}<button type="button" onClick={switchMode} className="cursor-pointer font-bold text-brand-600 hover:underline">Sign up</button></p>
            </div>
          </div>

          <div className="absolute inset-0 flex h-full w-full flex-col justify-center rounded-3xl border border-slate-100 bg-white p-6 shadow-xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="mb-4">
              <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">Create account</h3>
              <p className="mt-1 text-xs text-slate-500">Join us to make your city better.</p>
            </div>
            <form className="space-y-3" onSubmit={submitForm}>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Name</label>
                <input required name="name" value={form.name} onChange={updateField} placeholder="John Doe" className={mobileInputClass} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Email</label>
                <input required type="email" name="email" value={form.email} onChange={updateField} placeholder="you@example.com" className={mobileInputClass} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="flex cursor-pointer items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-800"
                  >
                    {showPassword ? <EyeOff size={11} /> : <Eye size={11} />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    required
                    minLength={6}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={updateField}
                    placeholder="••••••••"
                    className={`${mobileInputClass} pr-9`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {errorMessage}
              <button type="submit" disabled={isSubmitting} className="mt-2 w-full cursor-pointer rounded-xl bg-slate-900 py-3 font-bold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Creating account...' : 'Create Account'}</button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-xs font-medium text-slate-500">Already have an account?{' '}<button type="button" onClick={switchMode} className="cursor-pointer font-bold text-brand-600 hover:underline">Log in</button></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
