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
import AiIssuePage from "./pages/AiIssuePage";
import ContactPage from "./pages/ContactPage";

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname.replace(/\/+$/, "") || "/";
  });
  const [currentHash, setCurrentHash] = useState(() => window.location.hash);
  const [hasSavedSession, setHasSavedSession] = useState(() =>
    Boolean(localStorage.getItem("smart_city_token")),
  );
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("smart_city_user") || "null");
    } catch {
      return null;
    }
  });

  const syncState = () => {
    const cleanPath = window.location.pathname.replace(/\/+$/, "") || "/";
    setCurrentPath(cleanPath);
    setCurrentHash(window.location.hash);
    setHasSavedSession(Boolean(localStorage.getItem("smart_city_token")));
    try {
      setUser(JSON.parse(localStorage.getItem("smart_city_user") || "null"));
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    window.addEventListener("popstate", syncState);
    window.addEventListener("hashchange", syncState);
    window.addEventListener("auth-logout", syncState);
    window.addEventListener("storage", syncState);

    // Global SPA navigation interceptor: ensures smooth client-side transitions between all pages
    const handleGlobalClick = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = event.target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.getAttribute("target") === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      // Allow same-page hash jumps
      if (href.startsWith("#")) {
        return;
      }

      event.preventDefault();

      try {
        const url = new URL(anchor.href, window.location.origin);
        const targetPath = url.pathname.replace(/\/+$/, "") || "/";
        const targetHash = url.hash;

        if (
          targetPath !== window.location.pathname.replace(/\/+$/, "") ||
          targetHash !== window.location.hash ||
          url.search !== window.location.search
        ) {
          window.history.pushState({}, "", url.pathname + url.search + url.hash);
          syncState();
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      } catch (err) {
        console.warn("Navigation interceptor error:", err);
      }
    };

    document.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("popstate", syncState);
      window.removeEventListener("hashchange", syncState);
      window.removeEventListener("auth-logout", syncState);
      window.removeEventListener("storage", syncState);
      document.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("smart_city_token");
    localStorage.removeItem("smart_city_user");
    setHasSavedSession(false);
    setUser(null);
    window.history.pushState({}, "", "/");
    syncState();
  };

  // 1. Auth Page
  if (currentPath === "/login" || currentHash === "#login") {
    if (hasSavedSession) {
      if (user?.role === "admin") return <AdminDashboard pagePath="/admin" />;
      if (user?.role === "worker") return <WorkerDashboard pagePath="/worker" />;
      return <UserDashboard initialNav="/dashboard" />;
    }
    return <AuthPage />;
  }

  // 2. Citizen Dashboard & Core Workspace routes (persistent sidebar shell, zero page reloads)
  if (
    currentPath === "/dashboard" ||
    currentPath === "/reports" ||
    currentPath === "/activity" ||
    currentPath === "/notifications" ||
    currentPath === "/report-issue" ||
    currentPath === "/ai-report"
  ) {
    if (hasSavedSession) {
      if (user?.role === "admin") return <AdminDashboard pagePath={currentPath.startsWith("/admin") ? currentPath : "/admin"} />;
      if (user?.role === "worker") return <WorkerDashboard pagePath={currentPath.startsWith("/worker") ? currentPath : "/worker"} />;
      return <UserDashboard initialNav={currentPath} />;
    }
    return <AuthPage />;
  }

  // 3. Admin Routes (starts with /admin)
  if (currentPath.startsWith("/admin")) {
    if (hasSavedSession) {
      return <AdminDashboard pagePath={currentPath} />;
    }
    return <AuthPage />;
  }

  // 4. Worker Routes (starts with /worker)
  if (currentPath.startsWith("/worker")) {
    return <WorkerDashboard pagePath={currentPath} />;
  }

  // 5. Profile Page
  if (currentPath === "/profile") {
    if (hasSavedSession && user?.role === "citizen") {
      return <UserDashboard initialNav="/profile" />;
    }
    return <ProfilePage />;
  }

  // 8. Contact Page
  if (currentPath === "/contact") {
    return <ContactPage isAuthenticated={hasSavedSession} user={user} onLogout={logout} />;
  }

  // 9. About Page
  if (currentPath === "/about" || currentHash === "#about") {
    return <AboutPage isAuthenticated={hasSavedSession} user={user} onLogout={logout} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <Navbar isAuthenticated={hasSavedSession} user={user} onLogout={logout} />
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
