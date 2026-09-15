import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SignalSection from "./components/SignalSection";
import AboutSection from "./components/AboutSection";
import MarqueeSection from "./components/MarqueeSection";
import WorkflowSection from "./components/WorkflowSection";
import CommandCenter from "./components/CommandCenter";
import PlatformRoles from "./components/PlatformRoles";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";
import AuthPage from "./pages/AuthPage";
import AboutPage from "./pages/AboutPage";
import UserDashboard from "./pages/UserDashboard";
import ProfilePage from "./pages/ProfilePage";
import CivicPage from "./pages/CivicPage";
import AdminDashboard from "./pages/AdminDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import WorkerCreatePage from "./pages/WorkerCreatePage";
import ReportIssuePage from "./pages/ReportIssuePage";

export default function App() {
  const [currentPath, setCurrentPath] = useState(
    window.location.pathname + window.location.hash,
  );
  const [hasSavedSession, setHasSavedSession] = useState(
    Boolean(localStorage.getItem("smart_city_token")),
  );
  const savedUser = JSON.parse(localStorage.getItem("smart_city_user") || "null");

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname + window.location.hash);
    };

    const handleAuthLogout = () => setHasSavedSession(false);

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("auth-logout", handleAuthLogout);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("auth-logout", handleAuthLogout);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("smart_city_token");
    localStorage.removeItem("smart_city_user");
    setHasSavedSession(false);
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  if (
    hasSavedSession &&
    (currentPath === "/login" ||
      currentPath === "/#login" ||
      window.location.hash === "#login")
  ) {
    return savedUser?.role === "admin" ? <AdminDashboard /> : savedUser?.role === "worker" ? <WorkerDashboard /> : <UserDashboard />;
  }

  if (
    currentPath === "/login" ||
    currentPath === "/#login" ||
    window.location.hash === "#login"
  ) {
    return <AuthPage />;
  }

  if (currentPath === "/dashboard") {
    return savedUser?.role === "admin" ? <AdminDashboard /> : savedUser?.role === "worker" ? <WorkerDashboard /> : <UserDashboard />;
  }

  if (currentPath === "/report-issue") {
    return <ReportIssuePage />;
  }

  if (currentPath === "/admin" || currentPath === "/admin/users" || currentPath === "/admin/workers" || currentPath === "/admin/workers/new") {
    if (currentPath === "/admin/workers/new") return <WorkerCreatePage />;
    return <AdminDashboard pagePath={currentPath} />;
  }

  if (currentPath === "/worker" || currentPath === "/worker/availability" || currentPath === "/worker/location") {
    return <WorkerDashboard pagePath={currentPath} />;
  }

  if (currentPath === "/profile") {
    return <ProfilePage />;
  }

  if (currentPath === "/reports" || currentPath === "/activity" || currentPath === "/notifications") {
    return <CivicPage pagePath={currentPath} />;
  }

  if (currentPath === "/about" || currentPath === "/#about") {
    return <AboutPage />;
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <Navbar isAuthenticated={hasSavedSession} user={savedUser} onLogout={logout} />
      <div id="platform">
        <Hero />
      </div>
      <div id="live-intelligence">
        <SignalSection />
      </div>
      <AboutSection />
      <MarqueeSection />
      {/* <WorkflowSection /> */}
      {/* <div id="command-center">
        <CommandCenter />
      </div> */}
      <div id="apps">
        <PlatformRoles />
      </div>
      <Newsletter />
      <Footer />
    </div>
  );
}
