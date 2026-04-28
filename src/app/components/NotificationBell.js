"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { useAuth } from "@/app/context/AuthProvider";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, profile } = useAuth();
  const pathname = usePathname();

  const isAdmin = profile?.role === "admin";
  const basePath = isAdmin ? "/admin/notifications" : "/dashboard/notifications";

  useEffect(() => {
    if (!user) return;

    // Fetch initial count
    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    };

    fetchUnreadCount();

    // Subscribe to new notifications
    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        setUnreadCount(prev => prev + 1);
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        // If it was marked as read, decrease count
        if (payload.new.is_read && !payload.old.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  // If we are on the notifications page, we could mark them read, but we'll let the page handle that
  // For now just hide the badge if we are on the page and they are all read.
  
  return (
    <Link href={basePath} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', transition: 'background 0.2s' }} className="hover:bg-slate-600">
      <span style={{ fontSize: '1.25rem' }}>🔔</span>
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          background: 'var(--danger)',
          color: 'white',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid var(--bg-secondary)'
        }}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
