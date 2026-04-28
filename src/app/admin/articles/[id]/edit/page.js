"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

const CATEGORIES = [
  "Deep Learning", "NLP", "Computer Vision", "Reinforcement Learning", 
  "Generative AI", "MLOps", "Research", "Tutorial", "General ML"
];

export default function EditArticlePage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    title: "", description: "", source: "", category: "General ML",
    publication_date: "", article_url: ""
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchArticle() {
      const { data, error } = await supabase.from('articles').select('*').eq('id', id).single();
      if (!error && data) {
        setFormData({
          title: data.title, description: data.description, source: data.source,
          category: data.category, publication_date: data.publication_date, article_url: data.article_url
        });
      } else {
        setErrorMsg("Article not found.");
      }
      setFetching(false);
    }
    fetchArticle();
  }, [id]);

  const validateUrl = (url) => {
    try { new URL(url); return true; } catch { return false; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.source || !formData.article_url) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (!validateUrl(formData.article_url)) {
      setErrorMsg("Please enter a valid URL.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('articles').update(formData).eq('id', id);
      if (error) throw error;
      router.push('/admin/articles');
    } catch (err) {
      setErrorMsg(err.message || "Failed to update article.");
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>;

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h2>Edit Article</h2>
        <Link href="/admin/articles" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Cancel</Link>
      </div>

      {errorMsg && <div style={{ color: 'var(--danger)', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Title *</label>
          <input className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Description *</label>
          <textarea className="form-input" rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Source/Publisher *</label>
            <input className="form-input" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Publication Date</label>
            <input type="date" className="form-input" value={formData.publication_date} onChange={e => setFormData({...formData, publication_date: e.target.value})} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Article URL *</label>
            <input type="url" className="form-input" value={formData.article_url} onChange={e => setFormData({...formData, article_url: e.target.value})} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
