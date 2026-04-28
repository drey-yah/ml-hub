"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthProvider";

export default function Sidebar({ role = "user" }) {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  const adminLinks = [
    { name: "Dashboard", path: "/admin", icon: "📊" },
    { name: "Manage Articles", path: "/admin/articles", icon: "📝" },
    { name: "Notifications", path: "/admin/notifications", icon: "🔔" },
  ];

  const userLinks = [
    { name: "Feed", path: "/dashboard", icon: "📰" },
    { name: "Top Articles", path: "/dashboard/top-articles", icon: "🏆" },
    { name: "Notifications", path: "/dashboard/notifications", icon: "🔔" },
  ];

  const links = role === "admin" ? adminLinks : userLinks;

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '2rem', padding: '0 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>
          ML <span className="text-gradient">Hub</span>
        </h2>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {role === "admin" ? "Admin Panel" : "User Dashboard"}
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {links.map((link) => {
          const isActive = pathname === link.path || (link.path !== "/admin" && link.path !== "/dashboard" && pathname.startsWith(link.path));
          
          return (
            <Link 
              key={link.path} 
              href={link.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span style={{ marginRight: '0.75rem', fontSize: '1.25rem' }}>{link.icon}</span>
              <span style={{ fontWeight: isActive ? '600' : '400' }}>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', wordBreak: 'break-all' }}>
          {user?.email}
        </div>
        <button 
          onClick={() => signOut()} 
          className="btn btn-secondary" 
          style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem' }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
