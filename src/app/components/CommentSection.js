"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function CommentSection({ articleId, comments, currentUserId, onCommentAdded }) {
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null); // ID of parent comment
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from("comments").insert({
        user_id: currentUserId,
        article_id: articleId,
        comment_text: newComment.trim(),
        parent_comment_id: replyTo
      });

      if (error) throw error;
      
      setNewComment("");
      setReplyTo(null);
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Failed to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Organize comments into threads
  const parentComments = comments.filter(c => !c.parent_comment_id);
  const replies = comments.filter(c => c.parent_comment_id);

  return (
    <div className="card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem' }}>💬 Comments ({comments.length})</h3>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        {replyTo && (
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Replying to a comment...</span>
            <button type="button" onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>Cancel Reply</button>
          </div>
        )}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <textarea
            className="form-input"
            rows="3"
            placeholder={replyTo ? "Write your reply..." : "Add a comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSubmitting}
            style={{ resize: 'vertical' }}
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting || !newComment.trim()}>
          {isSubmitting ? "Posting..." : (replyTo ? "Post Reply" : "Post Comment")}
        </button>
      </form>

      <div className="flex flex-col gap-4">
        {parentComments.map(comment => (
          <div key={comment.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{comment.profiles?.name || 'User'}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {comment.comment_text}
            </p>
            <button onClick={() => setReplyTo(comment.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
              Reply
            </button>

            {/* Render Replies */}
            <div style={{ marginTop: '1rem', marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {replies.filter(r => r.parent_comment_id === comment.id).map(reply => (
                <div key={reply.id} style={{ padding: '0.75rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--border-color)' }}>
                  <div className="flex justify-between" style={{ marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {reply.profiles?.name || 'User'} {reply.profiles?.role === 'admin' && <span className="badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', marginLeft: '0.25rem' }}>Admin</span>}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(reply.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-secondary)' }}>
                    {reply.comment_text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {parentComments.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem 0' }}>
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
}
