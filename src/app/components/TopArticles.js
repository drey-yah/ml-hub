"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthProvider";

export default function TopArticles({ articles = [] }) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const basePath = isAdmin ? "/admin/articles" : "/dashboard/articles";

  if (!articles.length) {
    return (
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🏆 Top Articles
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No engagement data available yet.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🏆 Top Articles
      </h3>
      <div className="flex flex-col gap-4">
        {articles.map((article, index) => (
          <div key={article.id} className="flex gap-4" style={{ paddingBottom: '1rem', borderBottom: index < articles.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
            <div style={{ 
              width: '28px', height: '28px', borderRadius: '50%', 
              background: index < 3 ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0
            }}>
              {index + 1}
            </div>
            <div>
              <Link href={`${basePath}/${article.id}`} style={{ fontWeight: '600', display: 'block', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                {article.title}
              </Link>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem' }}>
                <span>Score: {article.top_score}</span>
                <span>•</span>
                <span>❤️ {article.like_count}</span>
                <span>💬 {article.comment_count}</span>
                <span>🔗 {article.share_count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
