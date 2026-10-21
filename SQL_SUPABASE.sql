-- E.M. Profª Eunice Carneiro — complemento de segurança, 21/10/2026.
-- Executar o arquivo inteiro no SQL Editor do projeto cujlebxqqposqomtfvdk.
-- Aplicação existente: funcionarios, declaracoes, faltas, agenda,
-- usuarios_perfis e acessos; bucket declaracoes.
-- Não cria contas nem altera/apaga registros ou documentos.
-- Mantém as políticas existentes e acrescenta limites RESTRICTIVE (AND).
-- Não concede acesso que as políticas existentes negam.
-- Atenção: Auth > Allow new users to sign up deve ser desativado no painel.

BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

-- Primeiro verifica a estrutura. Se houver incompatibilidade, a transação
-- inteira será cancelada; não continue executando trechos isolados.
DO $preflight$
DECLARE
  tabela text;
  rel oid;
  dono oid;
  rls_forcada boolean;
  pode_ignorar_rls boolean;
  quantidade integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     OR NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    RAISE EXCEPTION 'Este arquivo deve ser executado no banco Supabase do sistema.';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles
             WHERE rolname IN ('anon', 'authenticated')
               AND (rolsuper OR rolbypassrls)) THEN
    RAISE EXCEPTION 'anon/authenticated possuem privilégios administrativos. Revisar os papéis antes de aplicar.';
  END IF;

  FOREACH tabela IN ARRAY ARRAY['funcionarios','declaracoes','faltas','agenda','usuarios_perfis','acessos']
  LOOP
    rel := to_regclass(format('public.%I', tabela));
    IF rel IS NULL OR NOT EXISTS (SELECT 1 FROM pg_class WHERE oid = rel AND relkind IN ('r','p')) THEN
      RAISE EXCEPTION 'Tabela public.% ausente ou incompatível. Nenhuma correção foi aplicada.', tabela;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class c
               WHERE c.oid = rel AND (
                 pg_has_role('anon', c.relowner, 'USAGE')
                 OR pg_has_role('authenticated', c.relowner, 'USAGE'))) THEN
      RAISE EXCEPTION 'Um papel da aplicação possui ou herda a propriedade de public.%. Revisar a propriedade antes de aplicar.', tabela;
    END IF;
  END LOOP;

  IF NOT EXISTS (SELECT 1 FROM pg_attribute
                 WHERE attrelid = 'public.usuarios_perfis'::regclass
                   AND attname = 'id' AND atttypid = 'uuid'::regtype AND NOT attisdropped)
     OR NOT EXISTS (SELECT 1 FROM pg_attribute
                     WHERE attrelid = 'public.usuarios_perfis'::regclass
                       AND attname = 'ativo' AND atttypid = 'boolean'::regtype AND NOT attisdropped)
     OR NOT EXISTS (SELECT 1 FROM pg_attribute
                     WHERE attrelid = 'public.usuarios_perfis'::regclass
                       AND attname = 'perfil' AND NOT attisdropped) THEN
    RAISE EXCEPTION 'usuarios_perfis deve ter id UUID, ativo boolean e perfil. Nenhuma correção foi aplicada.';
  END IF;

  SELECT relowner, relforcerowsecurity INTO dono, rls_forcada
    FROM pg_class WHERE oid = 'public.usuarios_perfis'::regclass;
  SELECT rolsuper OR rolbypassrls INTO pode_ignorar_rls
    FROM pg_roles WHERE rolname = current_user;
  IF NOT coalesce(pode_ignorar_rls, false)
     AND NOT (dono = (SELECT oid FROM pg_roles WHERE rolname = current_user) AND NOT rls_forcada) THEN
    RAISE EXCEPTION 'Use o papel administrativo do SQL Editor para criar a função de verificação de perfil.';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_namespace n JOIN pg_roles r ON r.oid = n.nspowner
              WHERE n.nspname = 'ec_seguranca' AND r.rolname <> current_user) THEN
    RAISE EXCEPTION 'O esquema ec_seguranca já existe com outro proprietário. Revisar antes de aplicar.';
  END IF;

  IF to_regclass('storage.buckets') IS NULL OR to_regclass('storage.objects') IS NULL THEN
    RAISE EXCEPTION 'Storage não está instalado neste projeto.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'declaracoes') THEN
    RAISE EXCEPTION 'O bucket declaracoes não foi encontrado. Confira o projeto no Supabase.';
  END IF;
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'storage.objects'::regclass) THEN
    RAISE EXCEPTION 'Ative RLS em storage.objects antes de aplicar este complemento.';
  END IF;

  SELECT count(*) INTO quantidade FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE p.proname = 'usuario_sistema_ativo' AND p.prokind = 'f'
     AND n.nspname NOT IN ('pg_catalog','information_schema');
  IF quantidade > 1 THEN
    RAISE EXCEPTION 'Há mais de uma função usuario_sistema_ativo. É necessário identificar a assinatura usada pela política.';
  END IF;

  -- O perfil consulta só recebe a projeção limitada de servidores por RPC.
  -- A função existente precisa executar com os privilégios de seu proprietário.
  IF NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
                  WHERE n.nspname = 'public' AND p.proname = 'ec_servidores_consulta'
                    AND p.prokind = 'f' AND p.prosecdef) THEN
    RAISE EXCEPTION 'A função ec_servidores_consulta SECURITY DEFINER não foi encontrada. Revisar esse RPC antes de aplicar.';
  END IF;
END
$preflight$;

-- O site não cria objetos SQL. Impede que papéis do navegador criem
-- objetos em public para interferir em funções SQL preexistentes.
REVOKE CREATE ON SCHEMA public FROM PUBLIC, anon, authenticated;

-- Esquema interno. Não o inclua em Settings > API > Exposed schemas.
CREATE SCHEMA IF NOT EXISTS ec_seguranca;
REVOKE ALL ON SCHEMA ec_seguranca FROM PUBLIC, anon;
REVOKE CREATE ON SCHEMA ec_seguranca FROM authenticated;
GRANT USAGE ON SCHEMA ec_seguranca TO authenticated;

-- A função não aceita ID de terceiros e consulta apenas o usuário da sessão.
-- search_path vazio e nomes qualificados impedem troca de objetos por nomes iguais.
CREATE OR REPLACE FUNCTION ec_seguranca.perfil_ativo()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $function$
  SELECT p.perfil::text
    FROM public.usuarios_perfis AS p
   WHERE p.id = (SELECT auth.uid())
     AND p.ativo IS TRUE
     AND p.perfil::text IN ('administrador','secretaria','consulta')
   LIMIT 1
$function$;
REVOKE ALL ON FUNCTION ec_seguranca.perfil_ativo() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION ec_seguranca.perfil_ativo() TO authenticated;

DO $tabelas$
DECLARE
  tabela text;
  privilegio text;
BEGIN
  FOREACH tabela IN ARRAY ARRAY['funcionarios','declaracoes','faltas','agenda','usuarios_perfis','acessos']
  LOOP
    -- Preserva apenas os privilégios CRUD que authenticated já possuía,
    -- inclusive se antes vinham de PUBLIC. Não usa GRANT ALL.
    FOREACH privilegio IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE'] LOOP
      IF has_table_privilege('authenticated', format('public.%I', tabela), privilegio) THEN
        EXECUTE format('GRANT %s ON TABLE public.%I TO authenticated', privilegio, tabela);
      END IF;
    END LOOP;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tabela);
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM anon, PUBLIC', tabela);
    EXECUTE format('REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLE public.%I FROM authenticated', tabela);
    EXECUTE format('DROP POLICY IF EXISTS ec_guard_20261021_anon ON public.%I', tabela);
    EXECUTE format('CREATE POLICY ec_guard_20261021_anon ON public.%I AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false)', tabela);
  END LOOP;
END
$tabelas$;

-- Administrador/secretaria leem e editam os dados sensíveis; só administrador
-- exclui registros. O perfil consulta utiliza ec_servidores_consulta.
DO $dados$
DECLARE
  tabela text;
  leitura text;
  escrita text := '(SELECT ec_seguranca.perfil_ativo()) IN (''administrador'',''secretaria'')';
  exclusao text := '(SELECT ec_seguranca.perfil_ativo()) = ''administrador''';
BEGIN
  FOREACH tabela IN ARRAY ARRAY['funcionarios','declaracoes','faltas','agenda']
  LOOP
    leitura := CASE WHEN tabela = 'agenda'
      THEN '(SELECT ec_seguranca.perfil_ativo()) IS NOT NULL'
      ELSE escrita END;
    EXECUTE format('DROP POLICY IF EXISTS ec_guard_20261021_select ON public.%I', tabela);
    EXECUTE format('DROP POLICY IF EXISTS ec_guard_20261021_insert ON public.%I', tabela);
    EXECUTE format('DROP POLICY IF EXISTS ec_guard_20261021_update ON public.%I', tabela);
    EXECUTE format('DROP POLICY IF EXISTS ec_guard_20261021_delete ON public.%I', tabela);
    EXECUTE format('CREATE POLICY ec_guard_20261021_select ON public.%I AS RESTRICTIVE FOR SELECT TO authenticated USING (%s)', tabela, leitura);
    EXECUTE format('CREATE POLICY ec_guard_20261021_insert ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (%s)', tabela, escrita);
    EXECUTE format('CREATE POLICY ec_guard_20261021_update ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING (%s) WITH CHECK (%s)', tabela, escrita, escrita);
    EXECUTE format('CREATE POLICY ec_guard_20261021_delete ON public.%I AS RESTRICTIVE FOR DELETE TO authenticated USING (%s)', tabela, exclusao);
  END LOOP;
END
$dados$;

-- O site lê somente o próprio perfil. A gestão de contas está desativada
-- no frontend; alterações administrativas continuam no painel/SQL Editor.
DROP POLICY IF EXISTS ec_guard_20261021_select ON public.usuarios_perfis;
DROP POLICY IF EXISTS ec_guard_20261021_insert ON public.usuarios_perfis;
DROP POLICY IF EXISTS ec_guard_20261021_update ON public.usuarios_perfis;
DROP POLICY IF EXISTS ec_guard_20261021_delete ON public.usuarios_perfis;
CREATE POLICY ec_guard_20261021_select ON public.usuarios_perfis AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) AND (SELECT ec_seguranca.perfil_ativo()) IS NOT NULL);
CREATE POLICY ec_guard_20261021_insert ON public.usuarios_perfis AS RESTRICTIVE
  FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY ec_guard_20261021_update ON public.usuarios_perfis AS RESTRICTIVE
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY ec_guard_20261021_delete ON public.usuarios_perfis AS RESTRICTIVE
  FOR DELETE TO authenticated USING (false);

-- Mantém o controle de propriedade e auditoria das políticas/RPCs já instalados.
-- Acrescenta bloqueio para contas inativas, sem perfil ou com perfil inválido.
DROP POLICY IF EXISTS ec_guard_20261021_ativo ON public.acessos;
CREATE POLICY ec_guard_20261021_ativo ON public.acessos AS RESTRICTIVE
  FOR ALL TO authenticated
  USING ((SELECT ec_seguranca.perfil_ativo()) IS NOT NULL)
  WITH CHECK ((SELECT ec_seguranca.perfil_ativo()) IS NOT NULL);

-- Corrige o erro informado: permission denied for function usuario_sistema_ativo.
-- Concede EXECUTE somente à função encontrada e somente a authenticated.
DO $anexos_funcao$
DECLARE
  funcao record;
BEGIN
  FOR funcao IN
    SELECT p.oid::regprocedure AS assinatura, n.nspname AS esquema
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE p.proname = 'usuario_sistema_ativo' AND p.prokind = 'f'
       AND n.nspname NOT IN ('pg_catalog','information_schema')
  LOOP
    EXECUTE format('GRANT USAGE ON SCHEMA %I TO authenticated', funcao.esquema);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', funcao.assinatura);
  END LOOP;
END
$anexos_funcao$;

-- O bucket privado exige sessão autorizada. Não move nem apaga objetos.
UPDATE storage.buckets
   SET public = false,
       file_size_limit = least(coalesce(file_size_limit, 10485760), 10485760),
       allowed_mime_types = ARRAY['application/pdf','image/jpeg','image/png']::text[]
 WHERE id = 'declaracoes';

-- Estas condições só restringem declaracoes; outros buckets conservam suas regras.
DROP POLICY IF EXISTS ec_guard_20261021_anexos_anon ON storage.objects;
DROP POLICY IF EXISTS ec_guard_20261021_anexos_select ON storage.objects;
DROP POLICY IF EXISTS ec_guard_20261021_anexos_insert ON storage.objects;
DROP POLICY IF EXISTS ec_guard_20261021_anexos_update ON storage.objects;
DROP POLICY IF EXISTS ec_guard_20261021_anexos_delete ON storage.objects;

CREATE POLICY ec_guard_20261021_anexos_anon ON storage.objects AS RESTRICTIVE
  FOR ALL TO anon
  USING (bucket_id <> 'declaracoes') WITH CHECK (bucket_id <> 'declaracoes');
CREATE POLICY ec_guard_20261021_anexos_select ON storage.objects AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (bucket_id <> 'declaracoes'
         OR (SELECT ec_seguranca.perfil_ativo()) IN ('administrador','secretaria'));
CREATE POLICY ec_guard_20261021_anexos_insert ON storage.objects AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id <> 'declaracoes' OR (
    (SELECT ec_seguranca.perfil_ativo()) IN ('administrador','secretaria')
    AND split_part(name, '/', 1) = (SELECT auth.uid())::text
    AND name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(pdf|png|jpe?g)$'
  ));
CREATE POLICY ec_guard_20261021_anexos_update ON storage.objects AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (bucket_id <> 'declaracoes') WITH CHECK (bucket_id <> 'declaracoes');
CREATE POLICY ec_guard_20261021_anexos_delete ON storage.objects AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (bucket_id <> 'declaracoes'
         OR (SELECT ec_seguranca.perfil_ativo()) IN ('administrador','secretaria'));

NOTIFY pgrst, 'reload schema';
COMMIT;

-- Resultado final: configurações e contagens, sem dados pessoais.
SELECT 'Complemento aplicado. Falta conferir as configurações de Auth e testar com contas de cada perfil.' AS resultado;
SELECT id, public AS bucket_publico, file_size_limit, allowed_mime_types
  FROM storage.buckets WHERE id = 'declaracoes';
SELECT schemaname, tablename, count(*) AS politicas_complementares
  FROM pg_policies WHERE policyname LIKE 'ec_guard_20261021_%'
 GROUP BY schemaname, tablename ORDER BY schemaname, tablename;
