-- ============================================================================
-- SCHEMA SUPABASE POUR SYSTÈME DE CANDIDATURES ADAPTATIVES
-- ============================================================================
-- Instructions: Exécuter ce script dans l'éditeur SQL de Supabase
-- ============================================================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: user_profiles
-- Stocke les profils utilisateurs et leurs variantes
-- ============================================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Informations de base
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  location VARCHAR(255),
  linkedin_url VARCHAR(500),
  github_url VARCHAR(500),
  portfolio_url VARCHAR(500),

  -- Profils variants (JSONB pour flexibilité)
  profile_variants JSONB DEFAULT '{}'::jsonb,

  -- Méta
  target_role VARCHAR(255),
  target_salary INTEGER,
  availability VARCHAR(100),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================================================
-- TABLE: projects
-- Projets personnels/professionnels
-- ============================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) CHECK (status IN ('live', 'development', 'completed', 'archived')),
  tech JSONB DEFAULT '[]'::jsonb,

  url VARCHAR(500),
  app_store_url VARCHAR(500),
  github_url VARCHAR(500),

  kpis JSONB DEFAULT '[]'::jsonb,
  highlights JSONB DEFAULT '[]'::jsonb,

  start_date DATE NOT NULL,
  end_date DATE,

  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE: experiences
-- Expériences professionnelles
-- ============================================================================
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  title_normalized VARCHAR(255), -- Version "optimisée"
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255),

  start_date DATE NOT NULL,
  end_date DATE, -- NULL si "present"
  date_format VARCHAR(20) DEFAULT 'full' CHECK (date_format IN ('full', 'year-only')),

  description TEXT,
  achievements JSONB DEFAULT '[]'::jsonb,
  tech JSONB DEFAULT '[]'::jsonb,

  risk_level VARCHAR(10) DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),

  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE: education
-- Formation académique
-- ============================================================================
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  degree VARCHAR(255) NOT NULL,
  institution VARCHAR(255) NOT NULL,
  field VARCHAR(255),
  location VARCHAR(255),

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  highlights JSONB DEFAULT '[]'::jsonb,

  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE: skills
-- Compétences techniques et business
-- ============================================================================
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  category VARCHAR(50) CHECK (category IN ('technical', 'business', 'language')),
  name VARCHAR(255) NOT NULL,
  level VARCHAR(50), -- Pour langues: "native", "fluent", "intermediate", etc.

  proficiency INTEGER CHECK (proficiency >= 1 AND proficiency <= 5), -- 1-5

  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE: job_analyses
-- Cache des analyses d'offres d'emploi
-- ============================================================================
CREATE TABLE job_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  job_url VARCHAR(500),
  job_text_hash VARCHAR(64) UNIQUE, -- SHA256 du texte pour éviter doublons

  company_name VARCHAR(255),
  job_title VARCHAR(255),

  -- Résultats d'analyse (JSONB pour flexibilité)
  keywords JSONB,
  keyword_context JSONB,
  formality_score INTEGER,
  seniority_level VARCHAR(50),
  company_type VARCHAR(50),
  problems_to_solve JSONB,
  ats_system_guess VARCHAR(50),

  salary_range JSONB,
  required_years_experience INTEGER,
  remote_policy VARCHAR(20),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Index pour recherche rapide
CREATE INDEX idx_job_analyses_hash ON job_analyses(job_text_hash);
CREATE INDEX idx_job_analyses_expires ON job_analyses(expires_at);

-- ============================================================================
-- TABLE: company_enrichments
-- Cache des données enrichies sur les entreprises
-- ============================================================================
CREATE TABLE company_enrichments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  cache_key VARCHAR(64) UNIQUE NOT NULL, -- SHA256 du nom normalisé
  company_name VARCHAR(255) NOT NULL,

  website VARCHAR(500),
  linkedin_url VARCHAR(500),

  recent_achievements JSONB DEFAULT '[]'::jsonb,
  pain_points JSONB DEFAULT '[]'::jsonb,
  culture_keywords JSONB DEFAULT '[]'::jsonb,
  notable_products JSONB DEFAULT '[]'::jsonb,
  recent_news JSONB DEFAULT '[]'::jsonb,

  employee_count INTEGER,
  funding VARCHAR(255),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_company_enrichments_cache_key ON company_enrichments(cache_key);
CREATE INDEX idx_company_enrichments_created_at ON company_enrichments(created_at);

-- ============================================================================
-- TABLE: applications
-- Tracking des candidatures
-- ============================================================================
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  job_title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  job_url VARCHAR(500),

  cv_variant VARCHAR(100), -- "mobile_developer", "product_developer", etc.
  letter_variant VARCHAR(100),

  channel VARCHAR(50) CHECK (channel IN ('linkedin', 'direct_email', 'company_website', 'other')),

  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'response_positive', 'response_negative', 'no_response')),

  applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
  response_date DATE,

  notes TEXT,

  -- Documents générés (stockés dans Supabase Storage)
  cv_file_path VARCHAR(500),
  letter_file_path VARCHAR(500),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour analytics
CREATE INDEX idx_applications_user_profile ON applications(user_profile_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_cv_variant ON applications(cv_variant);
CREATE INDEX idx_applications_applied_date ON applications(applied_date);

-- ============================================================================
-- TABLE: ab_test_results
-- Résultats A/B testing (vue matérialisée)
-- ============================================================================
CREATE MATERIALIZED VIEW ab_test_results AS
SELECT
  cv_variant,
  COUNT(*) as total_applications,
  COUNT(CASE WHEN status = 'response_positive' THEN 1 END) as positive_responses,
  ROUND(
    COUNT(CASE WHEN status = 'response_positive' THEN 1 END)::NUMERIC /
    NULLIF(COUNT(*)::NUMERIC, 0) * 100,
    2
  ) as response_rate,
  ROUND(
    AVG(CASE
      WHEN response_date IS NOT NULL AND applied_date IS NOT NULL
      THEN EXTRACT(DAY FROM (response_date - applied_date))
      ELSE NULL
    END),
    1
  ) as avg_days_to_response
FROM applications
WHERE cv_variant IS NOT NULL
GROUP BY cv_variant;

-- Créer un index unique pour permettre REFRESH CONCURRENTLY
CREATE UNIQUE INDEX idx_ab_test_results_variant ON ab_test_results(cv_variant);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour toutes les tables avec updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON experiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON education
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_enrichments_updated_at BEFORE UPDATE ON company_enrichments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs ne peuvent voir que leurs propres données
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour projects (via user_profile_id)
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (
    user_profile_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own projects" ON projects
  FOR ALL USING (
    user_profile_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Même logique pour experiences, education, skills, applications
CREATE POLICY "Users can view own experiences" ON experiences
  FOR SELECT USING (user_profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own experiences" ON experiences
  FOR ALL USING (user_profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own education" ON education
  FOR SELECT USING (user_profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own education" ON education
  FOR ALL USING (user_profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own skills" ON skills
  FOR SELECT USING (user_profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own skills" ON skills
  FOR ALL USING (user_profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (user_profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own applications" ON applications
  FOR ALL USING (user_profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()));

-- Les caches (job_analyses, company_enrichments) sont publics en lecture
ALTER TABLE job_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_enrichments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Job analyses are viewable by everyone" ON job_analyses
  FOR SELECT USING (true);

CREATE POLICY "Company enrichments are viewable by everyone" ON company_enrichments
  FOR SELECT USING (true);

-- ============================================================================
-- CLEANUP JOB (à configurer dans Supabase Dashboard > Database > Cron)
-- ============================================================================
-- Exemple de fonction pour nettoyer les caches expirés
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM job_analyses WHERE expires_at < NOW();
  -- Company enrichments: supprimer ceux de plus de 7 jours
  DELETE FROM company_enrichments WHERE created_at < NOW() - INTERVAL '7 days';
  REFRESH MATERIALIZED VIEW CONCURRENTLY ab_test_results;
END;
$$ LANGUAGE plpgsql;

-- À exécuter périodiquement via pg_cron (si disponible):
-- SELECT cron.schedule('cleanup-cache', '0 2 * * *', 'SELECT cleanup_expired_cache()');

-- ============================================================================
-- FIN DU SCHEMA
-- ============================================================================
