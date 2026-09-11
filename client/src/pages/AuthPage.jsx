import React, { useState } from 'react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="relative min-h-screen w-full bg-slate-50 overflow-hidden font-sans">
      
      {/* Back button */}
      <a 
        href="/" 
        onClick={() => {
          window.location.hash = '';
        }}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-slate-200"
      >
        <span>&larr;</span> Home
      </a>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block w-full h-screen relative">
        
        {/* Image Pane (Slides Left/Right) */}
        <div 
          className="absolute top-0 left-0 h-full w-1/2 z-20"
          style={{ 
            transform: isLogin ? 'translateX(0%)' : 'translateX(100%)',
            transition: 'transform 1s cubic-bezier(0.82,0.085,0.395,0.895)'
          }}
        >
          <div className="w-full h-full relative overflow-hidden bg-slate-900">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/40 to-slate-900/70 z-10 mix-blend-multiply" />
            <img 
              src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80&w=1600" 
              alt="Cityscape" 
              className="absolute inset-0 w-full h-full object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-12 text-white">
              <h2 className="text-4xl font-bold mb-4 tracking-tight">
                {isLogin ? 'New to SmartCity?' : 'Already have an account?'}
              </h2>
              <p className="text-lg text-brand-100 mb-8 max-w-sm font-light">
                {isLogin 
                  ? 'Sign up to report issues, track resolutions, and help build a better community.' 
                  : 'Log in to access your dashboard, track your reports, and stay updated.'}
              </p>
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="px-8 py-3 rounded-full border-2 border-white/30 hover:border-white text-white font-bold tracking-wide transition-all hover:bg-white/10 cursor-pointer"
              >
                {isLogin ? 'Create Account' : 'Log In'}
              </button>
            </div>
          </div>
        </div>

        {/* Forms Pane (Slides Right/Left) */}
        <div 
          className="absolute top-0 left-1/2 h-full w-1/2 bg-white flex items-center justify-center z-10"
          style={{
            transform: isLogin ? 'translateX(0%)' : 'translateX(-100%)',
            transition: 'transform 1s cubic-bezier(0.82,0.085,0.395,0.895)'
          }}
        >
          <div className="w-full max-w-md px-8 relative h-[500px]" style={{ perspective: '1000px' }}>
            <div 
              className="w-full h-full relative" 
              style={{ 
                transformStyle: 'preserve-3d', 
                transition: 'transform 0.7s ease-in-out',
                transform: isLogin ? 'rotateY(0deg)' : 'rotateY(180deg)'
              }}
            >
              
              {/* Login Form (Front) */}
              <div className="absolute inset-0 w-full h-full flex flex-col justify-center" style={{ backfaceVisibility: 'hidden' }}>
                <div className="mb-8">
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h3>
                  <p className="text-slate-500 mt-2">Enter your details to access your account.</p>
                </div>
                
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                    <div className="relative">
                      
                      <input type="email" placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-slate-700">Password</label>
                      <a href="#" className="text-xs font-semibold text-brand-600 hover:text-brand-700">Forgot password?</a>
                    </div>
                    <div className="relative">
                      
                      <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                    </div>
                  </div>
                  <button className="w-full bg-brand-600 text-white font-bold rounded-xl py-3.5 shadow-md shadow-brand-500/20 hover:bg-brand-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
                    Log In <span>&rarr;</span>
                  </button>
                </form>
              </div>

              {/* Sign Up Form (Back) */}
              <div className="absolute inset-0 w-full h-full flex flex-col justify-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <div className="mb-8">
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create account</h3>
                  <p className="text-slate-500 mt-2">Join us to make your city better.</p>
                </div>
                
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Full Name</label>
                    <div className="relative">
                      
                      <input type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                    <div className="relative">
                      
                      <input type="email" placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Password</label>
                    <div className="relative">
                      
                      <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                    </div>
                  </div>
                  <button className="w-full bg-slate-900 text-white font-bold rounded-xl py-3.5 shadow-md shadow-slate-900/20 hover:bg-slate-800 hover:shadow-lg transition-all mt-2 cursor-pointer">
                    Create Account
                  </button>
                </form>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden w-full min-h-screen flex items-center justify-center p-6" style={{ perspective: '1000px' }}>
        <div 
          className="w-full max-w-sm h-[500px] relative" 
          style={{ 
            transformStyle: 'preserve-3d', 
            transition: 'transform 0.7s ease-in-out',
            transform: isLogin ? 'rotateY(0deg)' : 'rotateY(180deg)'
          }}
        >
          
          {/* Mobile Login (Front) */}
          <div className="absolute inset-0 w-full h-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col justify-center" style={{ backfaceVisibility: 'hidden' }}>
            <div className="mb-8">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome back</h3>
              <p className="text-sm text-slate-500 mt-2">Enter your details to access your account.</p>
            </div>
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email</label>
                <div className="relative">
                  
                  <input type="email" placeholder="you@example.com" className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                <div className="relative">
                  
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none transition-all" />
                </div>
              </div>
              <button className="w-full bg-brand-600 text-white font-bold rounded-xl py-3 shadow-md hover:bg-brand-700 transition-all mt-2 cursor-pointer">
                Log In
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 font-medium">
                Don't have an account?{' '}
                <button onClick={() => setIsLogin(false)} className="text-brand-600 font-bold hover:underline cursor-pointer">
                  Sign up
                </button>
              </p>
            </div>
          </div>

          {/* Mobile Sign Up (Back) */}
          <div className="absolute inset-0 w-full h-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col justify-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="mb-8">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create account</h3>
              <p className="text-sm text-slate-500 mt-2">Join us to make your city better.</p>
            </div>
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Name</label>
                <div className="relative">
                  
                  <input type="text" placeholder="John Doe" className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email</label>
                <div className="relative">
                  
                  <input type="email" placeholder="you@example.com" className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                <div className="relative">
                  
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none transition-all" />
                </div>
              </div>
              <button className="w-full bg-slate-900 text-white font-bold rounded-xl py-3 shadow-md mt-2 cursor-pointer">
                Create Account
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 font-medium">
                Already have an account?{' '}
                <button onClick={() => setIsLogin(true)} className="text-brand-600 font-bold hover:underline cursor-pointer">
                  Log in
                </button>
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

