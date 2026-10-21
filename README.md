# Sistema de Declarações — E.M. Profª Eunice Carneiro

Aplicação estática em HTML, CSS e JavaScript com Supabase Auth, banco PostgreSQL
e Storage para o uso interno da escola. Hospedagem atual: GitHub Pages.

O login valida o usuário e seu perfil no servidor. Perfis previstos:
`administrador`, `secretaria` e `consulta`; somente contas ativas autorizadas.
A chave `sb_publishable_…` nos scripts é uma chave pública do navegador;
as permissões reais dependem dos privilégios e das políticas RLS do Supabase.
Nunca coloque `service_role` ou chaves secretas nos arquivos do site.

## Publicação

Mantenha os HTML na raiz, os scripts em `js/` e o CSS em `css/`.
Publique na branch/pasta já configurada no GitHub Pages.
O pacote de 21/10/2026 contém `LEIA_PRIMEIRO.txt` com a ordem de aplicação.

`SQL_SUPABASE.sql` agora é um complemento para a estrutura existente,
com verificações e transação. Ele não é um instalador de banco vazio.
Ele preserva as políticas já instaladas e acrescenta condições restritivas;
não cria permissões permissivas que estejam faltando. Execute no SQL Editor
administrativo do projeto correto e teste com contas fictícias de cada perfil.

## Segurança e funcionamento

- Cadastro público deve permanecer desativado no painel do Auth.
- O bucket `declaracoes` deve ser privado; anexos usam download autenticado.
- Arquivos permitidos: PDF, PNG e JPEG, até o limite do bucket (máximo 10 MB).
- Tokens ficam em `sessionStorage`; a sessão é revalidada no servidor.
- A CSP das páginas bloqueia scripts inline e scripts externos.
- Os estilos inline são usados pelo layout e pelos documentos impressos.
- As páginas antigas `usuarios.html`, `acessos.html` e `historicos.html`
  encaminham ao Dashboard. Gestão de contas deve ser feita no Supabase.
- O histórico por funcionário continua em `funcionario.html`.

Os cabeçalhos HTTP completos, incluindo proteção contra incorporação em
outros sites, exigem configuração na hospedagem/proxy. GitHub Pages não
interpreta arquivos `_headers`.

As funções RPC e políticas efetivamente instaladas no banco precisam ser
conferidas antes de concluir uma aprovação de segurança. Testes locais
com dados fictícios não substituem a validação de sessões reais e permissões
no projeto. Não publique dados pessoais, anexos ou backups no repositório.
