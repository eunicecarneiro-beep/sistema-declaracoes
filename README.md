# Sistema de Declarações — E.M. Profª Eunice Carneiro

Aplicação estática em HTML, CSS e JavaScript com Supabase Auth, banco PostgreSQL
e Storage para o uso interno da escola. Publicação no Cloudflare Pages a partir do GitHub.

O login valida o usuário e seu perfil no servidor. Perfis previstos:
`administrador`, `secretaria` e `consulta`; somente contas ativas autorizadas.
A chave `sb_publishable_…` nos scripts é uma chave pública do navegador;
as permissões reais dependem dos privilégios e das políticas RLS do Supabase.
Nunca coloque `service_role` ou chaves secretas nos arquivos do site.

## Publicação

Mantenha os HTML na raiz, os scripts em `js/` e o CSS em `css/`.
Veja `CLOUDFLARE.md` para o build e a pasta de saída.
O comando `npm run build` compila os motores de IA e prepara `dist/`.
O Cloudflare instala as dependências fixadas antes do build. Não publique `node_modules`.

## Assistente documental e IA local

`DOCUMENTOS_ASSISTENTE.md` descreve os 58 modelos adicionais e os modelos
oficiais de servidores. `IA_LOCAL.md` explica o modelo de linguagem aberto,
ativação, requisitos, privacidade e teste de aceitação no computador da escola.
O uso dos modelos prontos dispensa download de pesos e WebGPU.
O modo de linguagem usa Qwen3 localmente, sem API de IA nem chave paga.
A ativação acontece no primeiro pedido. O modo automático escolhe WebGPU
ou WebAssembly pelo processador quando a GPU não está disponível. Arquivos
baixados podem ser reutilizados pelo cache do navegador. Falhas de carregamento
usam os modelos prontos e deixam isso explícito no resultado.

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

