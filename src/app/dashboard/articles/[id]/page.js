"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import CommentSection from "@/app/components/CommentSection";
import ShareModal from "@/app/components/ShareModal";
import { useAuth } from "@/app/context/AuthProvider";

export default function UserArticleDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchArticleAndComments = async () => {
    if (!user) return;

    // 1. Fetch Article with Stats
    const { data: articlesData } = await supabase.rpc('get_top_articles', { result_limit: 100 });
    const currentArticle = articlesData?.find(a => a.id === id);
    if (currentArticle) setArticle(currentArticle);

    // 2. Fetch Like Status
    const { data: likeData } = await supabase.from('likes').select('id').eq('user_id', user.id).eq('article_id', id).single();
    setHasLiked(!!likeData);

    // 3. Fetch Comments
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*, profiles(name, role)')
      .eq('article_id', id)
      .order('created_at', { ascending: true });
    if (commentsData) setComments(commentsData);
    
    setLoading(false);
  };

  useEffect(() => {
    if (id && user) fetchArticleAndComments();
  }, [id, user]);

  const handleLike = async () => {
    if (!user?.id || isLiking || !article) return;
    setIsLiking(true);
    
    try {
      if (hasLiked) {
        await supabase.from("likes").delete().eq("user_id", user.id).eq("article_id", article.id);
        setHasLiked(false);
        setArticle(prev => ({ ...prev, like_count: String(Math.max(0, parseInt(prev.like_count || 0) - 1)) }));
      } else {
        await supabase.from("likes").insert({ user_id: user.id, article_id: article.id });
        setHasLiked(true);
        setArticle(prev => ({ ...prev, like_count: String(parseInt(prev.like_count || 0) + 1) }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLiking(false);
    }
  };

  if (loading) return <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>;
  if (!article) return <div>Article not found</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/dashboard" style={{ color: 'var(--text-muted)' }}>&larr; Back to Feed</Link>
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
          <div className="flex gap-4">
            <button onClick={handleLike} disabled={isLiking} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {hasLiked ? '❤️' : '🤍'} {article.like_count}
            </button>
            <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'default' }}>
              💬 {article.comment_count}
            </button>
            <button onClick={() => setIsShareOpen(true)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              🔗 Share
            </button>
          </div>
          <a href={article.article_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Read Full Article &nearr;
          </a>
        </div>
      </div>

      <CommentSection 
        articleId={article.id} 
        comments={comments} 
        currentUserId={user?.id}
        onCommentAdded={fetchArticleAndComments} 
      />

      <ShareModal 
        isOpen={isShareOpen} 
        onClose={() => { setIsShareOpen(false); fetchArticleAndComments(); }} 
        article={article} 
        currentUserId={user?.id} 
      />
    </div>
  );
}
