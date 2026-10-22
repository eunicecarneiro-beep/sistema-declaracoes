BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- Novos perfis aguardam a liberação administrativa.
CREATE OR REPLACE FUNCTION public.criar_perfil_novo_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_username text;
  v_nome text;
BEGIN
  v_username := lower(split_part(NEW.email, '@', 1));
  v_nome := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'nome', ''),
    v_username
  );

  INSERT INTO public.usuarios_perfis (
    id, username, nome, perfil, ativo
  )
  VALUES (
    NEW.id, v_username, v_nome, 'consulta', false
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.criar_perfil_novo_usuario()
FROM PUBLIC, anon, authenticated;

-- As referências a tabelas dessas funções já incluem o esquema.
ALTER FUNCTION public.usuario_sistema_ativo()
  SET search_path = '';

ALTER FUNCTION public.usuario_atual_e_admin()
  SET search_path = '';

ALTER FUNCTION public.historico_conferencia_trg()
  SET search_path = '';

NOTIFY pgrst, 'reload schema';

COMMIT;

-- Inventário de configurações; não lê os registros dessas tabelas.
SELECT
  n.nspname AS esquema,
  c.relname AS objeto,
  c.relkind AS tipo,
  c.relrowsecurity AS rls_habilitado,
  ARRAY(
    SELECT privilegio
    FROM unnest(ARRAY[
      'SELECT', 'INSERT', 'UPDATE', 'DELETE',
      'TRUNCATE', 'REFERENCES', 'TRIGGER'
    ]) AS permissoes(privilegio)
    WHERE has_table_privilege('anon', c.oid, privilegio)
  ) AS permissoes_anon,
  ARRAY(
    SELECT privilegio
    FROM unnest(ARRAY[
      'SELECT', 'INSERT', 'UPDATE', 'DELETE',
      'TRUNCATE', 'REFERENCES', 'TRIGGER'
    ]) AS permissoes(privilegio)
    WHERE has_table_privilege('authenticated', c.oid, privilegio)
  ) AS permissoes_logado,
  (
    SELECT jsonb_agg(jsonb_build_object(
      'nome', t.tgname,
      'estado', t.tgenabled,
      'definicao', pg_get_triggerdef(t.oid, true)
    ) ORDER BY t.tgname)
    FROM pg_trigger t
    WHERE t.tgrelid = c.oid
      AND NOT t.tgisinternal
  ) AS gatilhos,
  (
    SELECT jsonb_agg(jsonb_build_object(
      'nome', pol.policyname,
      'tipo', pol.permissive,
      'papeis', pol.roles,
      'operacao', pol.cmd,
      'leitura', pol.qual,
      'gravacao', pol.with_check
    ) ORDER BY pol.policyname)
    FROM pg_policies pol
    WHERE pol.schemaname = n.nspname
      AND pol.tablename = c.relname
      AND NOT (
        n.nspname = 'public'
        AND c.relname IN (
          'funcionarios', 'declaracoes', 'faltas',
          'agenda', 'usuarios_perfis', 'acessos'
        )
      )
  ) AS politicas_adicionais,
  CASE WHEN c.relkind IN ('v', 'm')
    THEN pg_get_viewdef(c.oid, true)
  END AS definicao_view
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind IN ('r', 'p', 'v', 'm', 'f')
  AND (
    n.nspname IN ('public', 'private', 'ec_seguranca')
    OR (n.nspname = 'auth' AND c.relname = 'users')
  )
  AND NOT EXISTS (
    SELECT 1
    FROM pg_depend d
    WHERE d.classid = 'pg_class'::regclass
      AND d.objid = c.oid
      AND d.refclassid = 'pg_extension'::regclass
      AND d.deptype = 'e'
  )
ORDER BY esquema, objeto;
