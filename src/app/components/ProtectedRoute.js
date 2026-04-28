"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthProvider";

/**
 * ProtectedRoute — Wraps pages that require authentication.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {"admin"|"user"|null} props.requiredRole - If set, restricts access to that role
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, profile, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Not logged in → redirect to login
    if (!user) {
      router.replace("/login");
      return;
    }

    // Profile hasn't loaded yet — wait
    if (!profile) return;

    // Role check
    if (requiredRole === "admin" && !isAdmin) {
      router.replace("/dashboard");
      return;
    }

    if (requiredRole === "user" && isAdmin) {
      router.replace("/admin");
      return;
    }
  }, [user, profile, loading, isAdmin, requiredRole, router]);

  // Show loading spinner while checking auth
  if (loading || !user || !profile) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // If role doesn't match, don't render (redirect is happening)
  if (requiredRole === "admin" && !isAdmin) return null;
  if (requiredRole === "user" && isAdmin) return null;

  return children;
}
