"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import { useAuth } from "@/app/context/AuthProvider";

const CATEGORIES = [
  "Deep Learning", "NLP", "Computer Vision", "Reinforcement Learning", 
  "Generative AI", "MLOps", "Research", "Tutorial", "General ML"
];

export default function NewArticlePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: "", description: "", source: "", category: "General ML",
    publication_date: new Date().toISOString().split('T')[0], article_url: ""
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
      setErrorMsg("Please enter a valid URL (including http/https).");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // 1. Insert Article
      const { data: newArticle, error: articleError } = await supabase
        .from('articles')
        .insert({ ...formData, posted_by: user.id })
        .select()
        .single();

      if (articleError) throw articleError;

      // 2. Notify all users (except admin)
      const { data: users } = await supabase.from('profiles').select('id').eq('role', 'user');
      
      if (users && users.length > 0) {
        const notifications = users.map(u => ({
          user_id: u.id,
          article_id: newArticle.id,
          title: "New Article Published",
          message: `"${newArticle.title}" has been published in ${newArticle.category}.`,
          is_read: false
        }));
        
        await supabase.from('notifications').insert(notifications);
      }

      router.push('/admin/articles');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to publish article.");
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h2>Publish New Article</h2>
        <Link href="/admin/articles" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Cancel</Link>
      </div>

      {errorMsg && (
        <div style={{ color: 'var(--danger)', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Title *</label>
          <input className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g., Attention Is All You Need" />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Description *</label>
          <textarea className="form-input" rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Short summary of the article..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Source/Publisher *</label>
            <input className="form-input" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} placeholder="e.g., arXiv, Nature" />
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
            <input type="url" className="form-input" value={formData.article_url} onChange={e => setFormData({...formData, article_url: e.target.value})} placeholder="https://..." />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
          {loading ? "Publishing..." : "Publish Article"}
        </button>
      </form>
    </div>
  );
}
