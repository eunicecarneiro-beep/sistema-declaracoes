# Complementos de segurança já aplicados

Estes arquivos registram os ajustes aplicados manualmente pelo responsável ao banco existente em 21–22/10/2026. O site depende também da estrutura, funções e políticas preexistentes; esta pasta não é um instalador de banco vazio.

Ordem original:

1. `SQL_SUPABASE.sql` da raiz, para a estrutura existente.
2. `20261022000100_fechar_documentos.sql`: bucket documentos privado e bloqueio anônimo.
3. `20261022000200_perfis_search_path.sql`: novos perfis consulta/inativos e search_path fixo.
4. `20261022000300_privilegios_historicos.sql`: remove privilégios de manutenção das tabelas históricas.

Os três complementos já foram aplicados no projeto pelo responsável. Foram versionados para conservar o histórico; o build do Cloudflare não os executa.

Para recriar um ambiente de homologação, obter primeiro uma cópia autorizada da estrutura completa e substituir os dados por registros fictícios. Não considerar os complementos como dump completo nem como backup dos anexos.
