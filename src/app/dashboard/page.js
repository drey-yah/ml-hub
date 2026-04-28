"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useAuth } from "@/app/context/AuthProvider";
import ArticleCard from "@/app/components/ArticleCard";
import TopArticles from "@/app/components/TopArticles";
import RecommendedArticles from "@/app/components/RecommendedArticles";

export default function UserDashboard() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [topArticles, setTopArticles] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user) return;

    // 1. Fetch Feed (All Articles) with like status
    const { data: feedData } = await supabase.rpc('get_top_articles', { result_limit: 100 });
    
    // Check which ones the user liked
    const { data: userLikes } = await supabase.from('likes').select('article_id').eq('user_id', user.id);
    const likedSet = new Set((userLikes || []).map(l => l.article_id));
    
    if (feedData) {
      setArticles(feedData.map(a => ({ ...a, user_has_liked: likedSet.has(a.id) })));
      // Use top 5 for the Top Articles widget
      setTopArticles(feedData.slice(0, 5));
    }

    // 2. Fetch Personalized Recommendations
    const { data: recData } = await supabase.rpc('get_recommended_articles', { p_user_id: user.id, result_limit: 5 });
    if (recData) setRecommended(recData);

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  if (loading) return <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
      <div>
        <h2 style={{ marginBottom: '1.5rem' }}>Your Feed</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {articles.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              No articles published yet.
            </div>
          ) : (
            articles.map(article => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                currentUserId={user?.id}
                onLikeToggle={fetchDashboardData}
              />
            ))
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <RecommendedArticles articles={recommended} />
        <TopArticles articles={topArticles} />
      </div>
    </div>
  );
}
