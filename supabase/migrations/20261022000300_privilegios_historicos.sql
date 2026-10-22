BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- Define somente as permissões de tabela necessárias ao aplicativo.
REVOKE ALL PRIVILEGES
ON TABLE public.historico_alunos, public.historico_resultados
FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.historico_alunos, public.historico_resultados
TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;

-- Conferência: apenas rls_habilitado deve aparecer como true.
SELECT
  n.nspname AS esquema,
  c.relname AS tabela,
  c.relrowsecurity AS rls_habilitado,
  has_table_privilege(
    'anon', c.oid,
    'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER'
  ) AS anon_tem_permissoes,
  has_table_privilege(
    'authenticated', c.oid, 'TRUNCATE'
  ) AS logado_pode_truncar,
  has_table_privilege(
    'authenticated', c.oid, 'REFERENCES'
  ) AS logado_pode_criar_referencia,
  has_table_privilege(
    'authenticated', c.oid, 'TRIGGER'
  ) AS logado_pode_criar_gatilho
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('historico_alunos', 'historico_resultados')
ORDER BY tabela;
