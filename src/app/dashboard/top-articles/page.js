"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

export default function UserTopArticlesPage() {
  const [topArticles, setTopArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopArticles() {
      const { data, error } = await supabase.rpc('get_top_articles', { result_limit: 50 });
      if (!error && data) {
        setTopArticles(data);
      }
      setLoading(false);
    }
    fetchTopArticles();
  }, []);

  if (loading) return <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆 Top Articles</h1>
        <p style={{ color: 'var(--text-secondary)' }}>The most engaging machine learning articles ranked by community interaction.</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {topArticles.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No articles found.
          </div>
        ) : (
          <div className="flex flex-col">
            {topArticles.map((article, index) => (
              <div 
                key={article.id} 
                style={{ 
                  padding: '1.5rem', 
                  borderBottom: index < topArticles.length - 1 ? '1px solid var(--border-color)' : 'none',
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'center'
                }}
              >
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', 
                  background: index < 3 ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0
                }}>
                  {index + 1}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>{article.category}</span>
                  </div>
                  <Link href={`/dashboard/articles/${article.id}`} style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                    {article.title}
                  </Link>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {article.source} • {new Date(article.publication_date).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ 
                  background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                  display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{article.top_score}</div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Score</div>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
                    <div>❤️ {article.like_count}</div>
                  </div>
                  <div>
                    <div>💬 {article.comment_count}</div>
                  </div>
                  <div>
                    <div>🔗 {article.share_count}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
