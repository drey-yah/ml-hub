"use client";

import { useState } from "react";
import Modal from "./Modal";
import { supabase } from "@/app/lib/supabaseClient";

export default function ShareModal({ isOpen, onClose, article, currentUserId }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform) => {
    // Record the share in the database
    if (currentUserId && article?.id) {
      try {
        await supabase.from("shares").insert({
          user_id: currentUserId,
          article_id: article.id,
          share_platform: platform
        });
      } catch (err) {
        console.error("Error recording share:", err);
      }
    }

    // Perform the share action
    const shareUrl = `${window.location.origin}/dashboard/articles/${article?.id}`;
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => { setCopied(false); onClose(); }, 1500);
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out this ML article: ${article?.title}`)}`, '_blank');
      onClose();
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Article">
      <div className="flex flex-col gap-4">
        <button className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }} onClick={() => handleShare('copy')}>
          📋 {copied ? "Copied!" : "Copy Link"}
        </button>
        <button className="btn btn-primary" style={{ background: '#1DA1F2', display: 'flex', justifyContent: 'center', gap: '0.5rem' }} onClick={() => handleShare('twitter')}>
          🐦 Share on Twitter (X)
        </button>
        <button className="btn btn-primary" style={{ background: '#0A66C2', display: 'flex', justifyContent: 'center', gap: '0.5rem' }} onClick={() => handleShare('linkedin')}>
          💼 Share on LinkedIn
        </button>
      </div>
    </Modal>
  );
}
