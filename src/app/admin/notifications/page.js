"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import { useAuth } from "@/app/context/AuthProvider";

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  if (loading) return <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
        <h2>Notifications</h2>
        {notifications.some(n => !n.is_read) && (
          <button onClick={markAllAsRead} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No notifications yet.
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((n, i) => (
              <div 
                key={n.id} 
                onClick={() => !n.is_read && markAsRead(n.id)}
                style={{ 
                  padding: '1.25rem 1.5rem', 
                  borderBottom: i < notifications.length - 1 ? '1px solid var(--border-color)' : 'none',
                  background: n.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                  cursor: n.is_read ? 'default' : 'pointer',
                  display: 'flex',
                  gap: '1rem',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginTop: '0.1rem' }}>{n.title.includes('New Article') ? '📰' : '🔔'}</div>
                <div style={{ flex: 1 }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: n.is_read ? '500' : '700', color: 'var(--text-primary)' }}>{n.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{n.message}</p>
                  
                  {n.article_id && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <Link 
                        href={`/admin/articles/${n.article_id}`} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={(e) => { e.stopPropagation(); if (!n.is_read) markAsRead(n.id); }}
                      >
                        View Article
                      </Link>
                    </div>
                  )}
                </div>
                {!n.is_read && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', alignSelf: 'center' }}></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
