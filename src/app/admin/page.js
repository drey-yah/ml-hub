"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import StatsCard from "@/app/components/StatsCard";
import TopArticles from "@/app/components/TopArticles";
import RecommendedArticles from "@/app/components/RecommendedArticles";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [topArticles, setTopArticles] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      // 1. Fetch Stats
      const { data: statsData, error: statsError } = await supabase.rpc('get_admin_stats');
      if (!statsError && statsData?.length) setStats(statsData[0]);

      // 2. Fetch Top Articles
      const { data: topData, error: topError } = await supabase.rpc('get_top_articles', { result_limit: 5 });
      if (!topError) setTopArticles(topData || []);

      // 3. Fetch Recent Articles (for Recommendations section in admin)
      const { data: recentData, error: recentError } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (!recentError) setRecentArticles(recentData || []);

      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
        <h2>Overview</h2>
        <Link href="/admin/articles/new" className="btn btn-primary">
          + Publish New Article
        </Link>
      </div>

      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1.5rem', marginBottom: '2rem' 
      }}>
        <StatsCard title="Total Articles" value={stats?.total_articles || 0} icon="📚" trend="+3" />
        <StatsCard title="Total Users" value={stats?.total_users || 0} icon="👥" trend="+12" />
        <StatsCard title="Total Likes" value={stats?.total_likes || 0} icon="❤️" trend="+45" />
        <StatsCard title="Total Comments" value={stats?.total_comments || 0} icon="💬" trend="+8" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <TopArticles articles={topArticles} />
        <RecommendedArticles articles={recentArticles} />
      </div>
    </div>
  );
}
