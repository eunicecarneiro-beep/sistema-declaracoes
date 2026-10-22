# Publicação no Cloudflare Pages

Conecte este repositório ao Cloudflare Pages com:

| Campo | Valor |
| --- | --- |
| Branch de produção | `main` |
| Framework | None |
| Comando de build | `node scripts/build-cloudflare.mjs` |
| Diretório de saída | `dist` |
| Variáveis de ambiente do frontend | Nenhuma |

O Cloudflare publicará uma nova versão quando houver alteração na branch de produção. O build inclui somente HTML, JavaScript, CSS e `_headers`. SQLs, scripts de build, testes e metadados do Git ficam fora da pasta publicada.

O `_headers` conserva a política CSP das páginas e acrescenta proteção contra incorporação, `nosniff` e as demais políticas HTTP. Os scripts aceitam os endereços sem `.html` gerados pelo Cloudflare. O registro de acessos continua usando os nomes `.html` esperados pelo banco.

## Banco existente

O frontend continua usando o projeto Supabase configurado no código. A publicação não executa SQL, não cria contas e não modifica registros. A chave `sb_publishable` do frontend é pública; a proteção é feita por autenticação, privilégios e RLS.

Os arquivos em `supabase/migrations/` registram os três complementos de segurança já aplicados pelo responsável. São complementos para o banco existente; não instalam uma estrutura vazia. Veja o README dessa pasta antes de reutilizá-los.

Se houver uso de redirecionamentos do Supabase Auth por e-mail/OAuth, configure o endereço definitivo e os redirecionamentos autorizados no projeto. O login atual usa usuário/senha diretamente. A Edge Function legada `documentos-ia` tem controle de origem próprio; para utilizá-la no novo endereço, sua lista de origens precisa incluir o domínio definitivo. O assistente documental atual funciona localmente no navegador.

## Verificação

```bash
node scripts/test-cloudflare.mjs
node scripts/build-cloudflare.mjs
```

Depois de publicar, conferir os cabeçalhos HTTP no endereço retornado pelo Cloudflare, a navegação entre páginas, o login, a saída e os anexos com um arquivo fictício em ambiente de teste. Manter o cadastro público do Supabase desativado e os buckets privados.
