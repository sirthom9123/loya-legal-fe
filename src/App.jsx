import React, { lazy, Suspense, useEffect, useLayoutEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

const Landing = lazy(() => import("./pages/Landing.jsx"));
const Features = lazy(() => import("./pages/Features.jsx"));
const FeatureReview = lazy(() => import("./pages/FeatureReview.jsx"));
const FeatureDrafting = lazy(() => import("./pages/FeatureDrafting.jsx"));
const FeatureResearch = lazy(() => import("./pages/FeatureResearch.jsx"));
const FeatureCollaboration = lazy(() => import("./pages/FeatureCollaboration.jsx"));
const FeatureWorkflows = lazy(() => import("./pages/FeatureWorkflows.jsx"));
const FeatureAssistant = lazy(() => import("./pages/FeatureAssistant.jsx"));
const Solutions = lazy(() => import("./pages/Solutions.jsx"));
const SolutionLitigation = lazy(() => import("./pages/SolutionLitigation.jsx"));
const SolutionMandA = lazy(() => import("./pages/SolutionMandA.jsx"));
const SolutionTax = lazy(() => import("./pages/SolutionTax.jsx"));
const SolutionBanking = lazy(() => import("./pages/SolutionBanking.jsx"));
const SecurityPage = lazy(() => import("./pages/Security.jsx"));
const PricingPage = lazy(() => import("./pages/Pricing.jsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.jsx"));
const Terms = lazy(() => import("./pages/Terms.jsx"));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-vanilla text-brand-800 text-sm font-medium">
      Loading…
    </div>
  );
}

function ScrollToTopOnRouteChange() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    function scrollPageTop() {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = 0;
      }
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    const frame = window.requestAnimationFrame(() => {
      if (hash) {
        const elementId = decodeURIComponent(hash.replace("#", ""));
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
          targetElement.scrollIntoView();
          return;
        }
      }

      scrollPageTop();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <ScrollToTopOnRouteChange />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/features/review" element={<FeatureReview />} />
        <Route path="/features/drafting" element={<FeatureDrafting />} />
        <Route path="/features/research" element={<FeatureResearch />} />
        <Route path="/features/collaboration" element={<FeatureCollaboration />} />
        <Route path="/features/workflows" element={<FeatureWorkflows />} />
        <Route path="/features/assistant" element={<FeatureAssistant />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/solutions/litigation" element={<SolutionLitigation />} />
        <Route path="/solutions/ma" element={<SolutionMandA />} />
        <Route path="/solutions/tax" element={<SolutionTax />} />
        <Route path="/solutions/banking" element={<SolutionBanking />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        {/* App decommissioned: auth and app routes redirect to the marketing home (the catch-all below). */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
