// src/App.jsx
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import AccessibilityPanel from "./components/AccessibilityPanel";
import SkeletonLoader from "./components/SkeletonLoader";

const HomePage = lazy(() => import("./pages/HomePage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const JourneyPage = lazy(() => import("./pages/JourneyPage"));
const TimelinePage = lazy(() => import("./pages/TimelinePage"));
const CandidatesPage = lazy(() => import("./pages/CandidatesPage"));
const VotePage = lazy(() => import("./pages/VotePage"));

const PageLoader = () => {
  return (
    <div className="container" style={{ padding: "2rem" }}>
      <SkeletonLoader type="card" count={3} />
    </div>
  );
};

export default function App() {
  return (
    <div className="app-root">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/journey" element={<JourneyPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/vote" element={<VotePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <AccessibilityPanel />
    </div>
  );
}
