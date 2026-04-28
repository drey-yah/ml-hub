"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setArticles(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id, title) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (!error) {
        setArticles(articles.filter(a => a.id !== id));
      } else {
        alert("Failed to delete article.");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
        <h2>Manage Articles</h2>
        <Link href="/admin/articles/new" className="btn btn-primary">
          + Publish New Article
        </Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>Title</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Source</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No articles found.</td></tr>
              ) : (
                articles.map(article => (
                  <tr key={article.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>
                      <Link href={`/admin/articles/${article.id}`} style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {article.title}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem' }}><span className="badge">{article.category}</span></td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{article.source}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(article.publication_date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Link href={`/admin/articles/${article.id}/edit`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginRight: '0.5rem' }}>
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(article.id, article.title)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
