-- ============================================================================
-- MIGRATION: Ajout/Mise à jour de la table company_enrichments
-- ============================================================================
-- Cette migration ajoute ou met à jour la table company_enrichments
-- pour supporter le système d'enrichissement automatique des entreprises
-- ============================================================================

-- Si la table existe déjà, la supprimer pour la recréer avec la bonne structure
-- (seulement en développement, en production utiliser ALTER TABLE)
DROP TABLE IF EXISTS company_enrichments CASCADE;

-- Créer la table company_enrichments
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

-- Créer les index
CREATE INDEX idx_company_enrichments_cache_key ON company_enrichments(cache_key);
CREATE INDEX idx_company_enrichments_created_at ON company_enrichments(created_at);

-- Activer RLS
ALTER TABLE company_enrichments ENABLE ROW LEVEL SECURITY;

-- Politique: lecture publique (cache partagé)
CREATE POLICY "Company enrichments are viewable by everyone" ON company_enrichments
  FOR SELECT USING (true);

-- Politique: écriture depuis le serveur uniquement (via service role)
CREATE POLICY "Company enrichments insertable by service" ON company_enrichments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Company enrichments updatable by service" ON company_enrichments
  FOR UPDATE USING (true);

-- Créer le trigger pour updated_at
CREATE TRIGGER update_company_enrichments_updated_at BEFORE UPDATE ON company_enrichments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
