"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function ArticleCard({ article, currentUserId, onLikeToggle }) {
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(article.user_has_liked || false);
  const [likeCount, setLikeCount] = useState(parseInt(article.like_count) || 0);

  const formattedDate = new Date(article.publication_date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const handleLike = async () => {
    if (!currentUserId || isLiking) return;
    
    setIsLiking(true);
    
    try {
      if (hasLiked) {
        // Unlike
        await supabase
          .from("likes")
          .delete()
          .eq("user_id", currentUserId)
          .eq("article_id", article.id);
          
        setHasLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        // Like
        await supabase
          .from("likes")
          .insert({ user_id: currentUserId, article_id: article.id });
          
        setHasLiked(true);
        setLikeCount(prev => prev + 1);
      }
      
      if (onLikeToggle) onLikeToggle();
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
        <span className="badge badge-primary">{article.category}</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formattedDate}</span>
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {article.title}
      </h3>

      <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '1rem', fontWeight: '500' }}>
        Source: {article.source}
      </div>

      <p style={{ fontSize: '0.95rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {article.description}
      </p>

      <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="flex gap-4">
          <button 
            onClick={handleLike} 
            disabled={isLiking}
            style={{ background: 'none', border: 'none', color: hasLiked ? 'var(--danger)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}
          >
            {hasLiked ? '❤️' : '🤍'} {likeCount}
          </button>
          
          <Link href={`/dashboard/articles/${article.id}`} style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
            💬 {article.comment_count || 0}
          </Link>
          
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
            🔗 {article.share_count || 0}
          </span>
        </div>

        <a 
          href={article.article_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
        >
          Read &nearr;
        </a>
      </div>
    </div>
  );
}
