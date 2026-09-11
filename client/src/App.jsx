import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SignalSection from './components/SignalSection';
import AboutSection from './components/AboutSection';
import MarqueeSection from './components/MarqueeSection';
import WorkflowSection from './components/WorkflowSection';
import CommandCenter from './components/CommandCenter';
import PlatformRoles from './components/PlatformRoles';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import AuthPage from './pages/AuthPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname + window.location.hash);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname + window.location.hash);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  if (currentPath === '/login' || currentPath === '/#login' || window.location.hash === '#login') {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <Navbar />
      <Hero />
      <SignalSection />
      <AboutSection />
      <MarqueeSection />
      {/* <WorkflowSection /> */}
      {/* <CommandCenter /> */}
      <PlatformRoles />
      <Newsletter />
      <Footer />
    </div>
  );
}