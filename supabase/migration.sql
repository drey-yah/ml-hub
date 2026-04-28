-- ============================================================
-- ML HUB — COMPLETE DATABASE MIGRATION
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 2. AUTO-CREATE PROFILE ON SIGNUP (Trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. ARTICLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General ML',
  publication_date DATE NOT NULL DEFAULT CURRENT_DATE,
  article_url TEXT NOT NULL,
  posted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Anyone can view articles
CREATE POLICY "Articles are viewable by everyone"
  ON public.articles FOR SELECT
  USING (true);

-- Only admins can insert articles
CREATE POLICY "Admins can insert articles"
  ON public.articles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update articles
CREATE POLICY "Admins can update articles"
  ON public.articles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete articles
CREATE POLICY "Admins can delete articles"
  ON public.articles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 4. LIKES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, article_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own likes"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 5. COMMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 6. SHARES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  share_platform TEXT NOT NULL DEFAULT 'link',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shares are viewable by everyone"
  ON public.shares FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert shares"
  ON public.shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 7. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Notifications can be inserted by authenticated users"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_posted_by ON public.articles(posted_by);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_article_id ON public.likes(article_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_shares_article_id ON public.shares(article_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- ============================================================
-- 9. UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_articles_updated_at ON public.articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 10. DATABASE FUNCTIONS
-- ============================================================

-- Function: Get Top Articles by engagement score
CREATE OR REPLACE FUNCTION public.get_top_articles(result_limit INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  source TEXT,
  category TEXT,
  publication_date DATE,
  article_url TEXT,
  posted_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  like_count BIGINT,
  comment_count BIGINT,
  share_count BIGINT,
  top_score BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.description,
    a.source,
    a.category,
    a.publication_date,
    a.article_url,
    a.posted_by,
    a.created_at,
    a.updated_at,
    COALESCE(l.cnt, 0)::BIGINT AS like_count,
    COALESCE(c.cnt, 0)::BIGINT AS comment_count,
    COALESCE(s.cnt, 0)::BIGINT AS share_count,
    (COALESCE(l.cnt, 0) + COALESCE(c.cnt, 0) + COALESCE(s.cnt, 0))::BIGINT AS top_score
  FROM public.articles a
  LEFT JOIN (
    SELECT article_id, COUNT(*)::BIGINT AS cnt FROM public.likes GROUP BY article_id
  ) l ON l.article_id = a.id
  LEFT JOIN (
    SELECT article_id, COUNT(*)::BIGINT AS cnt FROM public.comments GROUP BY article_id
  ) c ON c.article_id = a.id
  LEFT JOIN (
    SELECT article_id, COUNT(*)::BIGINT AS cnt FROM public.shares GROUP BY article_id
  ) s ON s.article_id = a.id
  ORDER BY top_score DESC, a.created_at DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get Recommended Articles for a User (personalized)
CREATE OR REPLACE FUNCTION public.get_recommended_articles(
  p_user_id UUID,
  result_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  source TEXT,
  category TEXT,
  publication_date DATE,
  article_url TEXT,
  posted_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  like_count BIGINT,
  comment_count BIGINT,
  share_count BIGINT,
  top_score BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_categories AS (
    -- Categories the user has liked
    SELECT DISTINCT a.category
    FROM public.likes lk
    JOIN public.articles a ON a.id = lk.article_id
    WHERE lk.user_id = p_user_id
    UNION
    -- Categories the user has commented on
    SELECT DISTINCT a.category
    FROM public.comments cm
    JOIN public.articles a ON a.id = cm.article_id
    WHERE cm.user_id = p_user_id
  ),
  user_interacted AS (
    -- Articles the user has already liked
    SELECT article_id FROM public.likes WHERE user_id = p_user_id
  ),
  scored AS (
    SELECT
      a.id,
      a.title,
      a.description,
      a.source,
      a.category,
      a.publication_date,
      a.article_url,
      a.posted_by,
      a.created_at,
      a.updated_at,
      COALESCE(l.cnt, 0)::BIGINT AS like_count,
      COALESCE(c.cnt, 0)::BIGINT AS comment_count,
      COALESCE(s.cnt, 0)::BIGINT AS share_count,
      (COALESCE(l.cnt, 0) + COALESCE(c.cnt, 0) + COALESCE(s.cnt, 0))::BIGINT AS top_score,
      CASE WHEN uc.category IS NOT NULL THEN 1 ELSE 0 END AS category_match
    FROM public.articles a
    LEFT JOIN (
      SELECT article_id, COUNT(*)::BIGINT AS cnt FROM public.likes GROUP BY article_id
    ) l ON l.article_id = a.id
    LEFT JOIN (
      SELECT article_id, COUNT(*)::BIGINT AS cnt FROM public.comments GROUP BY article_id
    ) c ON c.article_id = a.id
    LEFT JOIN (
      SELECT article_id, COUNT(*)::BIGINT AS cnt FROM public.shares GROUP BY article_id
    ) s ON s.article_id = a.id
    LEFT JOIN user_categories uc ON uc.category = a.category
    WHERE a.id NOT IN (SELECT article_id FROM user_interacted)
  )
  SELECT
    scored.id,
    scored.title,
    scored.description,
    scored.source,
    scored.category,
    scored.publication_date,
    scored.article_url,
    scored.posted_by,
    scored.created_at,
    scored.updated_at,
    scored.like_count,
    scored.comment_count,
    scored.share_count,
    scored.top_score
  FROM scored
  ORDER BY scored.category_match DESC, scored.top_score DESC, scored.created_at DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get article counts
CREATE OR REPLACE FUNCTION public.get_article_counts(p_article_id UUID)
RETURNS TABLE (
  like_count BIGINT,
  comment_count BIGINT,
  share_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::BIGINT FROM public.likes WHERE article_id = p_article_id) AS like_count,
    (SELECT COUNT(*)::BIGINT FROM public.comments WHERE article_id = p_article_id) AS comment_count,
    (SELECT COUNT(*)::BIGINT FROM public.shares WHERE article_id = p_article_id) AS share_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get dashboard stats for admin
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
  total_articles BIGINT,
  total_users BIGINT,
  total_likes BIGINT,
  total_comments BIGINT,
  total_shares BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::BIGINT FROM public.articles),
    (SELECT COUNT(*)::BIGINT FROM public.profiles WHERE role = 'user'),
    (SELECT COUNT(*)::BIGINT FROM public.likes),
    (SELECT COUNT(*)::BIGINT FROM public.comments),
    (SELECT COUNT(*)::BIGINT FROM public.shares);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 11. SEED DATA — 10 ML ARTICLES
-- ============================================================
-- Note: posted_by is NULL for seed data (no admin user yet)
INSERT INTO public.articles (title, description, source, category, publication_date, article_url) VALUES
(
  'Journal of Machine Learning Research',
  'The Journal of Machine Learning Research (JMLR) provides an international forum for the electronic and paper publication of high-quality scholarly articles in all areas of machine learning.',
  'JMLR',
  'Research',
  '2026-01-15',
  'https://www.jmlr.org/'
),
(
  'Machine Learning — arXiv',
  'Browse the latest machine learning research papers on arXiv, the premier open-access repository for scientific preprints covering computer science and AI.',
  'arXiv',
  'Research',
  '2026-04-01',
  'https://arxiv.org/list/cs.LG/current'
),
(
  'Machine Learning | MIT News',
  'Explore the latest machine learning news and breakthroughs from the Massachusetts Institute of Technology, one of the leading research institutions in AI.',
  'MIT News',
  'Research',
  '2026-03-20',
  'https://news.mit.edu/topic/machine-learning'
),
(
  'Apple Machine Learning Research',
  'Discover Apple''s machine learning research across computer vision, natural language processing, and more. Explore publications, models, and datasets from Apple researchers.',
  'Apple',
  'Deep Learning',
  '2026-02-10',
  'https://machinelearning.apple.com/'
),
(
  'Machine Learning — Latest Research and News | Nature',
  'Stay current with the latest machine learning research and news published in Nature, one of the world''s most cited scientific journals.',
  'Nature',
  'Research',
  '2026-04-15',
  'https://www.nature.com/subjects/machine-learning'
),
(
  'Recent Machine Learning Publications — CSIRO',
  'Explore recent machine learning publications from CSIRO, Australia''s national science agency, covering real-world applications in agriculture, healthcare, and environmental science.',
  'CSIRO Research',
  'General ML',
  '2026-03-05',
  'https://research.csiro.au/cor/machine-learning/ml-recent-publications/'
),
(
  'Top 10 AI & Machine Learning Research Articles',
  'A curated collection of the most important and influential AI and machine learning research articles, selected by KDnuggets editors for their impact on the field.',
  'KDnuggets',
  'General ML',
  '2025-01-10',
  'https://www.kdnuggets.com/2020/01/top-10-ai-ml-articles-to-know.html'
),
(
  'Machine Learning: Algorithms, Real-World Applications and Research Directions',
  'A comprehensive survey covering major machine learning algorithms, their real-world applications across industries, and future research directions in the field.',
  'Springer',
  'Tutorial',
  '2025-06-15',
  'https://link.springer.com/article/10.1007/s42979-021-00592-x'
),
(
  '10 Top Machine Learning Algorithms & Their Use-Cases',
  'An accessible guide to the top 10 machine learning algorithms including decision trees, neural networks, SVMs, and more — with practical use-case examples for each.',
  'DataCamp',
  'Tutorial',
  '2025-11-20',
  'https://www.datacamp.com/blog/top-machine-learning-use-cases-and-algorithms'
),
(
  'Most Influential ICML Papers — 2026 Edition',
  'Paper Digest''s annual compilation of the most influential papers presented at the International Conference on Machine Learning (ICML), ranked by citation impact.',
  'Paper Digest',
  'Research',
  '2026-03-01',
  'https://www.paperdigest.org/2026/03/most-influential-icml-papers-2026-03-version/'
);
