-- Fecha o acesso anônimo ao bucket documentos.
-- Preserva arquivos, buckets e as regras de declaracoes.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

UPDATE storage.buckets
SET public = false
WHERE id = 'documentos';

DROP POLICY IF EXISTS "Acesso publico documentos"
ON storage.objects;

DROP POLICY IF EXISTS ec_guard_20261021_documentos_anon
ON storage.objects;

CREATE POLICY ec_guard_20261021_documentos_anon
ON storage.objects
AS RESTRICTIVE
FOR ALL
TO anon
USING (bucket_id <> 'documentos')
WITH CHECK (bucket_id <> 'documentos');

NOTIFY pgrst, 'reload schema';
COMMIT;

SELECT id AS bucket, public AS publico
FROM storage.buckets
WHERE id IN ('declaracoes', 'documentos')
ORDER BY id;
