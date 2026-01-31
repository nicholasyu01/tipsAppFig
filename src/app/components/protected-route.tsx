import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/app/lib/userContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactElement;
}) {
  const { user, initializing } = useUser();
  const location = useLocation();

  if (initializing) {
    // while we don't know auth status, render nothing (or a loader)
    return null;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
}
