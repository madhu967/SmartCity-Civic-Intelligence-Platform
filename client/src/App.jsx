import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SignalSection from './components/SignalSection';
import MarqueeSection from './components/MarqueeSection';
import WorkflowSection from './components/WorkflowSection';
import CommandCenter from './components/CommandCenter';
import PlatformRoles from './components/PlatformRoles';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <Navbar />
      <Hero />
      <SignalSection />
      <MarqueeSection />
      {/* <WorkflowSection /> */}
      {/* <CommandCenter /> */}
      <PlatformRoles />
      <Newsletter />
      <Footer />
    </div>
  );
}