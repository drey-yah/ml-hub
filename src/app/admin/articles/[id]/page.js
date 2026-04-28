"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import CommentSection from "@/app/components/CommentSection";
import { useAuth } from "@/app/context/AuthProvider";

export default function AdminArticleDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArticleAndComments = async () => {
    // 1. Fetch Article with Stats
    const { data: articlesData } = await supabase.rpc('get_top_articles', { result_limit: 100 });
    const currentArticle = articlesData?.find(a => a.id === id);
    if (currentArticle) setArticle(currentArticle);

    // 2. Fetch Comments
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*, profiles(name, role)')
      .eq('article_id', id)
      .order('created_at', { ascending: true });
    if (commentsData) setComments(commentsData);
    
    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchArticleAndComments();
  }, [id]);

  if (loading) return <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>;
  if (!article) return <div>Article not found</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/articles" style={{ color: 'var(--text-muted)' }}>&larr; Back to Articles</Link>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
          <span className="badge badge-primary">{article.category}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(article.publication_date).toLocaleDateString()}</span>
        </div>
        
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{article.title}</h1>
        <div style={{ color: 'var(--accent-primary)', fontWeight: '500', marginBottom: '1.5rem' }}>Source: {article.source}</div>
        
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>{article.description}</p>
        
        <div className="flex justify-between items-center" style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div className="flex gap-4" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            <span>❤️ {article.like_count} Likes</span>
            <span>💬 {article.comment_count} Comments</span>
            <span>🔗 {article.share_count} Shares</span>
          </div>
          <a href={article.article_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Open Original Article &nearr;
          </a>
        </div>
      </div>

      <CommentSection 
        articleId={article.id} 
        comments={comments} 
        currentUserId={user?.id}
        onCommentAdded={fetchArticleAndComments} 
      />
    </div>
  );
}
