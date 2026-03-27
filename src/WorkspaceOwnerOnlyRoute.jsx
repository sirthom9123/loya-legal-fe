import React from "react";
import { Navigate } from "react-router-dom";
import { getSessionUser } from "./utils/sessionUser.js";

export default function WorkspaceOwnerOnlyRoute({ children }) {
  const user = getSessionUser();
  if (user?.workspace_member_only) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

