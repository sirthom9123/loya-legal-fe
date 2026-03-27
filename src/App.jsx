import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AdminRoute from "./AdminRoute.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Collaboration from "./pages/Collaboration.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DocumentDetail from "./pages/DocumentDetail.jsx";
import Documents from "./pages/Documents.jsx";
import Landing from "./pages/Landing.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Login from "./pages/Login.jsx";
import Drafting from "./pages/Drafting.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Playbooks from "./pages/Playbooks.jsx";
import Practice from "./pages/Practice.jsx";
import Profile from "./pages/Profile.jsx";
import Review from "./pages/Review.jsx";
import Workflows from "./pages/Workflows.jsx";
import AssistantRag from "./pages/AssistantRag.jsx";
import RawChat from "./pages/RawChat.jsx";
import SAModules from "./pages/SAModules.jsx";
import SATemplates from "./pages/SATemplates.jsx";
import SemanticSearch from "./pages/SemanticSearch.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import WorkspaceOwnerOnlyRoute from "./WorkspaceOwnerOnlyRoute.jsx";
import Register from "./pages/Register.jsx";
import Billing from "./pages/Billing.jsx";
import Plans from "./pages/Plans.jsx";
import Features from "./pages/Features.jsx";
import FeatureReview from "./pages/FeatureReview.jsx";
import FeatureDrafting from "./pages/FeatureDrafting.jsx";
import FeatureResearch from "./pages/FeatureResearch.jsx";
import FeatureCollaboration from "./pages/FeatureCollaboration.jsx";
import FeatureWorkflows from "./pages/FeatureWorkflows.jsx";
import FeatureAssistant from "./pages/FeatureAssistant.jsx";
import Solutions from "./pages/Solutions.jsx";
import SolutionLitigation from "./pages/SolutionLitigation.jsx";
import SolutionMandA from "./pages/SolutionMandA.jsx";
import SolutionTax from "./pages/SolutionTax.jsx";
import SolutionBanking from "./pages/SolutionBanking.jsx";
import SecurityPage from "./pages/Security.jsx";
import PricingPage from "./pages/Pricing.jsx";

export default function App() {
  return (
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
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SemanticSearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <AssistantRag />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <RawChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sa-templates"
        element={
          <ProtectedRoute>
            <SATemplates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sa-modules"
        element={
          <ProtectedRoute>
            <SAModules />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents/:id"
        element={
          <ProtectedRoute>
            <DocumentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <WorkspaceOwnerOnlyRoute>
              <Profile />
            </WorkspaceOwnerOnlyRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <WorkspaceOwnerOnlyRoute>
              <Billing />
            </WorkspaceOwnerOnlyRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plans"
        element={
          <ProtectedRoute>
            <WorkspaceOwnerOnlyRoute>
              <Plans />
            </WorkspaceOwnerOnlyRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/review"
        element={
          <ProtectedRoute>
            <Review />
          </ProtectedRoute>
        }
      />
      <Route
        path="/collaboration"
        element={
          <ProtectedRoute>
            <Collaboration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice"
        element={
          <ProtectedRoute>
            <Practice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workflows"
        element={
          <ProtectedRoute>
            <Workflows />
          </ProtectedRoute>
        }
      />
      <Route
        path="/drafting"
        element={
          <ProtectedRoute>
            <Drafting />
          </ProtectedRoute>
        }
      />
      <Route
        path="/playbooks"
        element={
          <ProtectedRoute>
            <Playbooks />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

