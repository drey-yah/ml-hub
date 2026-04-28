"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthProvider";

export default function RecommendedArticles({ articles = [] }) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const basePath = isAdmin ? "/admin/articles" : "/dashboard/articles";

  if (!articles.length) {
    return (
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🎯 Recommended For You
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Interact with articles to get personalized recommendations.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🎯 Recommended For You
      </h3>
      <div className="flex flex-col gap-4">
        {articles.map((article, index) => (
          <div key={article.id} style={{ paddingBottom: '1rem', borderBottom: index < articles.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '600', marginBottom: '0.25rem' }}>
              {article.category}
            </div>
            <Link href={`${basePath}/${article.id}`} style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              {article.title}
            </Link>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {article.source}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
