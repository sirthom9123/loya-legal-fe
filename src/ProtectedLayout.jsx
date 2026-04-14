import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/** JWT in localStorage — parent for nested authenticated routes. */
export default function ProtectedLayout() {
  if (!localStorage.getItem("access")) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
