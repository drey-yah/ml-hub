"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import Sidebar from "@/app/components/Sidebar";
import NotificationBell from "@/app/components/NotificationBell";
import { useAuth } from "@/app/context/AuthProvider";

export default function UserLayout({ children }) {
  const { profile } = useAuth();

  return (
    <ProtectedRoute requiredRole="user">
      <div className="app-container">
        <Sidebar role="user" />
        <main className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
          <header style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' 
          }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Dashboard</h1>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Welcome back, {profile?.name || 'User'}
              </span>
            </div>
            <div>
              <NotificationBell />
            </div>
          </header>
          <div style={{ flex: 1 }}>
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
