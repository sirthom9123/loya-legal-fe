import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AdminRoute from "./AdminRoute.jsx";
import ProtectedLayout from "./ProtectedLayout.jsx";
import RequiresOnboardingGate from "./RequiresOnboardingGate.jsx";
import WorkspaceOwnerOnlyRoute from "./WorkspaceOwnerOnlyRoute.jsx";

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
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.jsx"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail.jsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const AdminComms = lazy(() => import("./pages/AdminComms.jsx"));
const AdminMailingLists = lazy(() => import("./pages/AdminMailingLists.jsx"));
const AdminDemoLeads = lazy(() => import("./pages/AdminDemoLeads.jsx"));
const SemanticSearch = lazy(() => import("./pages/SemanticSearch.jsx"));
const AssistantRag = lazy(() => import("./pages/AssistantRag.jsx"));
// const RawChat = lazy(() => import("./pages/RawChat.jsx"));
const SATemplates = lazy(() => import("./pages/SATemplates.jsx"));
const SAModules = lazy(() => import("./pages/SAModules.jsx"));
const Documents = lazy(() => import("./pages/Documents.jsx"));
const DocumentDetail = lazy(() => import("./pages/DocumentDetail.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Billing = lazy(() => import("./pages/Billing.jsx"));
const Plans = lazy(() => import("./pages/Plans.jsx"));
const Review = lazy(() => import("./pages/Review.jsx"));
const Collaboration = lazy(() => import("./pages/Collaboration.jsx"));
const Practice = lazy(() => import("./pages/Practice.jsx"));
const Workflows = lazy(() => import("./pages/Workflows.jsx"));
const Cases = lazy(() => import("./pages/Cases.jsx"));
const Calendar = lazy(() => import("./pages/Calendar.jsx"));
const Drafting = lazy(() => import("./pages/Drafting.jsx"));
const Playbooks = lazy(() => import("./pages/Playbooks.jsx"));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-vanilla text-brand-800 text-sm font-medium">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route element={<ProtectedLayout />}>
          <Route path="onboarding" element={<Onboarding />} />
          <Route
            path="billing"
            element={
              <WorkspaceOwnerOnlyRoute>
                <Billing />
              </WorkspaceOwnerOnlyRoute>
            }
          />
          <Route
            path="plans"
            element={
              <WorkspaceOwnerOnlyRoute>
                <Plans />
              </WorkspaceOwnerOnlyRoute>
            }
          />
          <Route
            path="admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="admin/comms"
            element={
              <AdminRoute>
                <AdminComms />
              </AdminRoute>
            }
          />
          <Route
            path="admin/mailing-lists"
            element={
              <AdminRoute>
                <AdminMailingLists />
              </AdminRoute>
            }
          />
          <Route
            path="admin/demo-leads"
            element={
              <AdminRoute>
                <AdminDemoLeads />
              </AdminRoute>
            }
          />
          <Route element={<RequiresOnboardingGate />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="search" element={<SemanticSearch />} />
            <Route path="assistant" element={<AssistantRag />} />
            {/* <Route path="chat" element={<RawChat />} /> */}
            <Route path="sa-templates" element={<SATemplates />} />
            <Route path="sa-modules" element={<SAModules />} />
            <Route path="documents" element={<Documents />} />
            <Route path="documents/:id" element={<DocumentDetail />} />
            <Route
              path="profile"
              element={
                <WorkspaceOwnerOnlyRoute>
                  <Profile />
                </WorkspaceOwnerOnlyRoute>
              }
            />
            <Route path="review" element={<Review />} />
            <Route path="collaboration" element={<Collaboration />} />
            <Route path="practice" element={<Practice />} />
            <Route path="workflows" element={<Workflows />} />
            <Route path="cases" element={<Cases />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="drafting" element={<Drafting />} />
            <Route path="playbooks" element={<Playbooks />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
