-- Corrigir views de conversas para usar started_at em vez de created_at

-- 1. Recriar daily_conversations_view
DROP VIEW IF EXISTS public.daily_conversations_view;

CREATE OR REPLACE VIEW public.daily_conversations_view AS
WITH days_of_week AS (
  SELECT 
    generate_series(0, 6) AS day_order,
    CASE generate_series(0, 6)
      WHEN 0 THEN 'Dom'
      WHEN 1 THEN 'Seg'
      WHEN 2 THEN 'Ter'
      WHEN 3 THEN 'Qua'
      WHEN 4 THEN 'Qui'
      WHEN 5 THEN 'Sex'
      WHEN 6 THEN 'Sáb'
    END AS day_name
),
conversation_counts AS (
  SELECT 
    EXTRACT(DOW FROM started_at) AS day_order,
    COUNT(*) AS conversation_count
  FROM public.conversations
  WHERE started_at >= CURRENT_DATE - INTERVAL '7 days'
    AND status = 'active'
  GROUP BY EXTRACT(DOW FROM started_at)
)
SELECT 
  d.day_name,
  d.day_order,
  COALESCE(c.conversation_count, 0) AS conversation_count
FROM days_of_week d
LEFT JOIN conversation_counts c ON d.day_order = c.day_order
ORDER BY d.day_order;

-- 2. Recriar monthly_conversations_view
DROP VIEW IF EXISTS public.monthly_conversations_view;

CREATE OR REPLACE VIEW public.monthly_conversations_view AS
WITH months AS (
  SELECT 
    generate_series(1, 12) AS month_order,
    CASE generate_series(1, 12)
      WHEN 1 THEN 'Jan'
      WHEN 2 THEN 'Fev'
      WHEN 3 THEN 'Mar'
      WHEN 4 THEN 'Abr'
      WHEN 5 THEN 'Mai'
      WHEN 6 THEN 'Jun'
      WHEN 7 THEN 'Jul'
      WHEN 8 THEN 'Ago'
      WHEN 9 THEN 'Set'
      WHEN 10 THEN 'Out'
      WHEN 11 THEN 'Nov'
      WHEN 12 THEN 'Dez'
    END AS month_name
),
conversation_counts AS (
  SELECT 
    EXTRACT(MONTH FROM started_at) AS month_order,
    COUNT(*) AS conversation_count
  FROM public.conversations
  WHERE started_at >= CURRENT_DATE - INTERVAL '12 months'
    AND status = 'active'
  GROUP BY EXTRACT(MONTH FROM started_at)
)
SELECT 
  m.month_name,
  m.month_order,
  COALESCE(c.conversation_count, 0) AS conversation_count
FROM months m
LEFT JOIN conversation_counts c ON m.month_order = c.month_order
ORDER BY m.month_order;

-- 3. Comentários
COMMENT ON VIEW public.daily_conversations_view IS 'View para estatísticas diárias de conversas ativas usando started_at';
COMMENT ON VIEW public.monthly_conversations_view IS 'View para estatísticas mensais de conversas ativas usando started_at';