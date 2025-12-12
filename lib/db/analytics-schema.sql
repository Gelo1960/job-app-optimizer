-- ============================================================================
-- SCHEMA ANALYTICS & A/B TESTING
-- ============================================================================
-- Extension du schema principal pour ajouter le tracking détaillé des candidatures
-- et les fonctionnalités A/B testing
-- ============================================================================

-- ============================================================================
-- TABLE: application_events
-- Tracking détaillé des événements liés aux candidatures
-- ============================================================================
CREATE TABLE IF NOT EXISTS application_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,

  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'created',
    'sent',
    'viewed',
    'response_received',
    'interview_scheduled',
    'interview_completed',
    'offer_received',
    'offer_accepted',
    'offer_rejected',
    'application_rejected',
    'withdrawn',
    'follow_up_sent',
    'contact_made',
    'other'
  )),

  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Métadonnées flexibles pour chaque type d'événement
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Exemples de metadata:
  -- Pour 'viewed': {"source": "email_tracker", "ip": "...", "location": "..."}
  -- Pour 'interview_scheduled': {"date": "2024-01-15", "type": "phone|video|onsite", "duration": 60}
  -- Pour 'response_received': {"sentiment": "positive|negative|neutral", "method": "email|phone|linkedin"}

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour requêtes rapides
CREATE INDEX IF NOT EXISTS idx_application_events_application ON application_events(application_id);
CREATE INDEX IF NOT EXISTS idx_application_events_type ON application_events(event_type);
CREATE INDEX IF NOT EXISTS idx_application_events_timestamp ON application_events(event_timestamp);

-- ============================================================================
-- TABLE: application_analytics (vue matérialisée enrichie)
-- Statistiques détaillées par candidature
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS application_analytics CASCADE;

CREATE MATERIALIZED VIEW application_analytics AS
SELECT
  a.id,
  a.user_profile_id,
  a.company,
  a.job_title,
  a.cv_variant,
  a.letter_variant,
  a.channel,
  a.status,
  a.applied_date,
  a.response_date,

  -- Calculs de durée
  CASE
    WHEN a.response_date IS NOT NULL
    THEN EXTRACT(DAY FROM (a.response_date - a.applied_date))
    ELSE NULL
  END as days_to_response,

  -- Statut booléens pour analytics
  CASE WHEN a.status IN ('response_positive', 'sent') THEN 1 ELSE 0 END as is_positive,
  CASE WHEN a.status = 'response_negative' THEN 1 ELSE 0 END as is_negative,
  CASE WHEN a.status = 'no_response' THEN 1 ELSE 0 END as is_no_response,
  CASE WHEN a.response_date IS NOT NULL THEN 1 ELSE 0 END as has_response,

  -- Comptage des événements
  (SELECT COUNT(*) FROM application_events WHERE application_id = a.id) as total_events,
  (SELECT COUNT(*) FROM application_events WHERE application_id = a.id AND event_type = 'interview_scheduled') as interview_count,
  (SELECT COUNT(*) FROM application_events WHERE application_id = a.id AND event_type = 'follow_up_sent') as follow_up_count,

  -- Métadonnées temporelles
  EXTRACT(DOW FROM a.applied_date) as day_of_week, -- 0=dimanche, 6=samedi
  EXTRACT(HOUR FROM a.created_at) as hour_of_day,
  EXTRACT(WEEK FROM a.applied_date) as week_number,
  EXTRACT(MONTH FROM a.applied_date) as month_number,
  EXTRACT(YEAR FROM a.applied_date) as year_number,

  a.created_at,
  a.updated_at
FROM applications a;

-- Index unique pour permettre REFRESH CONCURRENTLY
CREATE UNIQUE INDEX idx_application_analytics_id ON application_analytics(id);
CREATE INDEX idx_application_analytics_user ON application_analytics(user_profile_id);
CREATE INDEX idx_application_analytics_variant ON application_analytics(cv_variant);
CREATE INDEX idx_application_analytics_channel ON application_analytics(channel);
CREATE INDEX idx_application_analytics_date ON application_analytics(applied_date);

-- ============================================================================
-- VUE: variant_performance
-- Comparaison des performances par variante de CV
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS variant_performance CASCADE;

CREATE MATERIALIZED VIEW variant_performance AS
SELECT
  user_profile_id,
  cv_variant,

  -- Comptages
  COUNT(*) as total_sent,
  SUM(has_response) as total_responses,
  SUM(is_positive) as positive_responses,
  SUM(is_negative) as negative_responses,
  SUM(is_no_response) as no_responses,
  SUM(interview_count) as total_interviews,

  -- Taux (en pourcentage)
  ROUND(
    (SUM(has_response)::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 100,
    2
  ) as response_rate,

  ROUND(
    (SUM(is_positive)::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 100,
    2
  ) as positive_rate,

  ROUND(
    (SUM(interview_count)::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 100,
    2
  ) as interview_rate,

  -- Durées moyennes
  ROUND(AVG(days_to_response), 1) as avg_days_to_response,
  MIN(days_to_response) as fastest_response_days,
  MAX(days_to_response) as slowest_response_days,

  -- Analyse temporelle
  ROUND(AVG(CASE WHEN day_of_week IN (1,2,3,4,5) THEN has_response ELSE NULL END), 2) as weekday_response_rate,
  ROUND(AVG(CASE WHEN day_of_week IN (0,6) THEN has_response ELSE NULL END), 2) as weekend_response_rate,

  -- Date de dernière candidature
  MAX(applied_date) as last_application_date,
  MIN(applied_date) as first_application_date

FROM application_analytics
WHERE cv_variant IS NOT NULL
GROUP BY user_profile_id, cv_variant;

CREATE UNIQUE INDEX idx_variant_performance_user_variant ON variant_performance(user_profile_id, cv_variant);

-- ============================================================================
-- VUE: channel_performance
-- Performance par canal de candidature (LinkedIn, email, etc.)
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS channel_performance CASCADE;

CREATE MATERIALIZED VIEW channel_performance AS
SELECT
  user_profile_id,
  channel,

  COUNT(*) as total_sent,
  SUM(has_response) as total_responses,
  SUM(is_positive) as positive_responses,

  ROUND(
    (SUM(has_response)::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 100,
    2
  ) as response_rate,

  ROUND(AVG(days_to_response), 1) as avg_days_to_response

FROM application_analytics
WHERE channel IS NOT NULL
GROUP BY user_profile_id, channel;

CREATE UNIQUE INDEX idx_channel_performance_user_channel ON channel_performance(user_profile_id, channel);

-- ============================================================================
-- VUE: time_series_stats
-- Statistiques par semaine pour graphiques temporels
-- ============================================================================
DROP MATERIALIZED VIEW IF EXISTS time_series_stats CASCADE;

CREATE MATERIALIZED VIEW time_series_stats AS
SELECT
  user_profile_id,
  cv_variant,
  year_number,
  week_number,

  -- Date du lundi de cette semaine (pour le graphique)
  DATE_TRUNC('week', applied_date) as week_start,

  COUNT(*) as applications_count,
  SUM(has_response) as responses_count,
  SUM(is_positive) as positive_count,

  ROUND(
    (SUM(has_response)::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 100,
    2
  ) as weekly_response_rate

FROM application_analytics
GROUP BY user_profile_id, cv_variant, year_number, week_number, week_start
ORDER BY week_start DESC;

CREATE INDEX idx_time_series_user_week ON time_series_stats(user_profile_id, week_start);

-- ============================================================================
-- FONCTION: refresh_analytics_views
-- Rafraîchir toutes les vues matérialisées
-- ============================================================================
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY application_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY variant_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY channel_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY time_series_stats;

  -- Également rafraîchir la vue ab_test_results du schema principal
  REFRESH MATERIALIZED VIEW CONCURRENTLY ab_test_results;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION: get_user_statistics
-- Récupère toutes les statistiques pour un utilisateur
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_statistics(p_user_profile_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'overview', (
      SELECT json_build_object(
        'total_applications', COUNT(*),
        'total_responses', SUM(has_response),
        'positive_responses', SUM(is_positive),
        'negative_responses', SUM(is_negative),
        'no_responses', SUM(is_no_response),
        'response_rate', ROUND((SUM(has_response)::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 100, 2),
        'avg_days_to_response', ROUND(AVG(days_to_response), 1),
        'total_interviews', SUM(interview_count)
      )
      FROM application_analytics
      WHERE user_profile_id = p_user_profile_id
    ),
    'by_variant', (
      SELECT json_agg(row_to_json(vp))
      FROM variant_performance vp
      WHERE vp.user_profile_id = p_user_profile_id
    ),
    'by_channel', (
      SELECT json_agg(row_to_json(cp))
      FROM channel_performance cp
      WHERE cp.user_profile_id = p_user_profile_id
    ),
    'time_series', (
      SELECT json_agg(row_to_json(ts))
      FROM (
        SELECT * FROM time_series_stats
        WHERE user_profile_id = p_user_profile_id
        ORDER BY week_start DESC
        LIMIT 12  -- 3 derniers mois
      ) ts
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION: get_recommendations
-- Génère des recommandations basées sur les données
-- ============================================================================
CREATE OR REPLACE FUNCTION get_recommendations(p_user_profile_id UUID)
RETURNS JSON AS $$
DECLARE
  best_variant RECORD;
  best_channel RECORD;
  best_day INTEGER;
  best_hour INTEGER;
  total_apps INTEGER;
  result JSON;
BEGIN
  -- Compter le nombre total de candidatures
  SELECT COUNT(*) INTO total_apps
  FROM application_analytics
  WHERE user_profile_id = p_user_profile_id;

  -- Si pas assez de données, retourner recommandations génériques
  IF total_apps < 10 THEN
    RETURN json_build_object(
      'has_enough_data', false,
      'minimum_required', 10,
      'current_count', total_apps,
      'recommendations', json_build_array(
        json_build_object(
          'type', 'info',
          'title', 'Collectez plus de données',
          'description', format('Vous avez envoyé %s candidatures. Envoyez-en au moins 10 pour obtenir des recommandations personnalisées.', total_apps),
          'priority', 'high'
        )
      )
    );
  END IF;

  -- Trouver la meilleure variante
  SELECT * INTO best_variant
  FROM variant_performance
  WHERE user_profile_id = p_user_profile_id
  ORDER BY response_rate DESC NULLS LAST, positive_rate DESC NULLS LAST
  LIMIT 1;

  -- Trouver le meilleur canal
  SELECT * INTO best_channel
  FROM channel_performance
  WHERE user_profile_id = p_user_profile_id
  ORDER BY response_rate DESC NULLS LAST
  LIMIT 1;

  -- Trouver le meilleur jour de la semaine
  SELECT day_of_week INTO best_day
  FROM application_analytics
  WHERE user_profile_id = p_user_profile_id AND has_response = 1
  GROUP BY day_of_week
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- Trouver la meilleure heure
  SELECT hour_of_day INTO best_hour
  FROM application_analytics
  WHERE user_profile_id = p_user_profile_id AND has_response = 1
  GROUP BY hour_of_day
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- Construire les recommandations
  RETURN json_build_object(
    'has_enough_data', true,
    'data_points', total_apps,
    'recommendations', json_build_array(
      -- Variante recommandée
      CASE WHEN best_variant IS NOT NULL THEN
        json_build_object(
          'type', 'variant',
          'title', format('Utilisez la variante "%s"', best_variant.cv_variant),
          'description', format('Cette variante a un taux de réponse de %s%% contre une moyenne globale. Elle génère %s réponses positives pour %s candidatures.',
            best_variant.response_rate,
            best_variant.positive_responses,
            best_variant.total_sent
          ),
          'priority', 'high',
          'data', row_to_json(best_variant)
        )
      END,

      -- Canal recommandé
      CASE WHEN best_channel IS NOT NULL THEN
        json_build_object(
          'type', 'channel',
          'title', format('Privilégiez le canal "%s"', best_channel.channel),
          'description', format('Ce canal affiche un taux de réponse de %s%%, avec un délai moyen de %s jours.',
            best_channel.response_rate,
            best_channel.avg_days_to_response
          ),
          'priority', 'medium',
          'data', row_to_json(best_channel)
        )
      END,

      -- Timing recommandé
      CASE WHEN best_day IS NOT NULL THEN
        json_build_object(
          'type', 'timing',
          'title', format('Envoyez vos candidatures le %s',
            CASE best_day
              WHEN 0 THEN 'dimanche'
              WHEN 1 THEN 'lundi'
              WHEN 2 THEN 'mardi'
              WHEN 3 THEN 'mercredi'
              WHEN 4 THEN 'jeudi'
              WHEN 5 THEN 'vendredi'
              WHEN 6 THEN 'samedi'
            END
          ),
          'description', 'Basé sur vos candidatures passées, ce jour génère le plus de réponses.',
          'priority', 'low',
          'data', json_build_object('best_day', best_day, 'best_hour', best_hour)
        )
      END
    )
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Auto-refresh analytics on application changes
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_refresh_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Programmer un refresh asynchrone (nécessite pg_cron ou similaire)
  -- Pour l'instant, on peut le faire manuellement ou via une tâche cron
  -- PERFORM refresh_analytics_views();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur les mises à jour d'applications
CREATE TRIGGER application_changed_refresh_analytics
AFTER INSERT OR UPDATE OR DELETE ON applications
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_analytics();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- application_events: seulement pour l'utilisateur propriétaire
ALTER TABLE application_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own application events" ON application_events
  FOR SELECT USING (
    application_id IN (
      SELECT a.id FROM applications a
      JOIN user_profiles up ON a.user_profile_id = up.id
      WHERE up.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own application events" ON application_events
  FOR ALL USING (
    application_id IN (
      SELECT a.id FROM applications a
      JOIN user_profiles up ON a.user_profile_id = up.id
      WHERE up.user_id = auth.uid()
    )
  );

-- ============================================================================
-- DONNÉES DE TEST (optionnel, à commenter en production)
-- ============================================================================

-- Fonction pour générer des données de test
CREATE OR REPLACE FUNCTION generate_test_analytics_data(p_user_profile_id UUID, p_count INTEGER DEFAULT 50)
RETURNS void AS $$
DECLARE
  i INTEGER;
  app_id UUID;
  variant_names TEXT[] := ARRAY['mobile_developer', 'product_developer', 'project_manager'];
  channel_names TEXT[] := ARRAY['linkedin', 'direct_email', 'company_website'];
  status_names TEXT[] := ARRAY['pending', 'sent', 'response_positive', 'response_negative', 'no_response'];
BEGIN
  FOR i IN 1..p_count LOOP
    -- Créer une application
    INSERT INTO applications (
      user_profile_id,
      job_title,
      company,
      cv_variant,
      channel,
      status,
      applied_date,
      response_date
    ) VALUES (
      p_user_profile_id,
      'Test Job ' || i,
      'Test Company ' || i,
      variant_names[1 + (random() * (array_length(variant_names, 1) - 1))::INTEGER],
      channel_names[1 + (random() * (array_length(channel_names, 1) - 1))::INTEGER],
      status_names[1 + (random() * (array_length(status_names, 1) - 1))::INTEGER],
      CURRENT_DATE - (random() * 90)::INTEGER,
      CASE WHEN random() > 0.3
        THEN CURRENT_DATE - (random() * 60)::INTEGER
        ELSE NULL
      END
    )
    RETURNING id INTO app_id;

    -- Créer quelques événements
    IF random() > 0.5 THEN
      INSERT INTO application_events (application_id, event_type, metadata)
      VALUES (app_id, 'sent', '{"method": "email"}'::jsonb);
    END IF;

    IF random() > 0.7 THEN
      INSERT INTO application_events (application_id, event_type, metadata)
      VALUES (app_id, 'viewed', '{"source": "email_tracker"}'::jsonb);
    END IF;
  END LOOP;

  -- Rafraîchir les vues
  PERFORM refresh_analytics_views();

  RAISE NOTICE 'Generated % test applications for user %', p_count, p_user_profile_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INSTRUCTIONS D'UTILISATION
-- ============================================================================

-- 1. Exécuter ce script dans l'éditeur SQL Supabase
-- 2. Configurer un cron job pour rafraîchir les vues régulièrement:
--    SELECT cron.schedule('refresh-analytics', '*/15 * * * *', 'SELECT refresh_analytics_views()');
-- 3. Utiliser les fonctions pour récupérer les stats:
--    SELECT get_user_statistics('user-profile-uuid');
--    SELECT get_recommendations('user-profile-uuid');
-- 4. Pour générer des données de test:
--    SELECT generate_test_analytics_data('user-profile-uuid', 50);

COMMENT ON TABLE application_events IS 'Tracking détaillé des événements liés aux candidatures';
COMMENT ON MATERIALIZED VIEW application_analytics IS 'Vue matérialisée avec statistiques enrichies par candidature';
COMMENT ON MATERIALIZED VIEW variant_performance IS 'Performance comparée des différentes variantes de CV';
COMMENT ON MATERIALIZED VIEW channel_performance IS 'Performance des différents canaux de candidature';
COMMENT ON FUNCTION get_user_statistics IS 'Récupère toutes les statistiques pour un utilisateur';
COMMENT ON FUNCTION get_recommendations IS 'Génère des recommandations basées sur les données analytics';
