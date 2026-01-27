import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@/app/lib/userContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactElement;
}) {
  const { user, initializing } = useUser();

  if (initializing) {
    // while we don't know auth status, render nothing (or a loader)
    return null;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
