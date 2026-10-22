import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const code = name => fs.readFileSync(path.join(root, 'js', name), 'utf8');
const uid = '00000000-0000-4000-8000-000000000001';
const results = [];
const pages = {
  'index.html': 'DashboardPage', 'funcionarios.html': 'FuncionariosPage',
  'funcionario.html': 'FuncionarioPage', 'novo-funcionario.html': 'NovoFuncionarioPage',
  'declaracoes.html': 'DeclaracoesPage', 'nova-declaracao.html': 'NovaDeclaracaoPage',
  'relatorios.html': 'RelatoriosPage', 'agenda.html': 'AgendaPage',
  'faltas.html': 'FaltasPage', 'documentos-servidores.html': 'DocumentosServidoresPage'
};
function setup(pathname, session = true, search = '') {
  const calls = [], redirects = [], domReady = [], selected = [];
  const stored = new Map();
  if (session) {
    stored.set('eunice_auth_session', JSON.stringify({ access_token: 'synthetic-access', refresh_token: 'synthetic-refresh', expires_at: Math.floor(Date.now()/1000)+3600, user: { id: uid } }));
    stored.set('eunice_access_id', '00000000-0000-4000-8000-000000000002');
  }
  const json = data => new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } });
  const context = vm.createContext({
    URL, Headers, Response, AbortController, Blob, Uint8Array, TextEncoder,
    console: { log() {}, warn() {}, error() {} },
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0,
    localStorage: { removeItem() {} },
    sessionStorage: { getItem: k => stored.get(k) || null, setItem: (k,v) => stored.set(k,v), removeItem: k => stored.delete(k) },
    document: { body: { dataset: {} }, getElementById() { return null; }, addEventListener: (event, fn) => { if(event === 'DOMContentLoaded') domReady.push(fn); }, removeEventListener() {} },
    window: { addEventListener() {} },
    location: { pathname, search, href: 'https://escola.example'+pathname+search, origin: 'https://escola.example', replace: v => redirects.push(v) },
    fetch: async (url, options = {}) => {
      const u = new URL(url); calls.push({ path: u.pathname, body: options.body });
      if (u.pathname === '/auth/v1/user') return json({ id: uid });
      if (u.pathname === '/rest/v1/usuarios_perfis') return json([{ id: uid, nome: 'Pessoa fictícia', perfil: 'administrador', ativo: true }]);
      if (u.pathname === '/rest/v1/rpc/ec_atualizar_acesso') return json(true);
      throw new Error('Endpoint inesperado no teste isolado: '+u.pathname);
    }
  });
  vm.runInContext(code('app.js'), context);
  context.selectPageForTest = name => selected.push(name);
  for (const name of Object.values(pages)) {
    context[name] = { init() {} };
    vm.runInContext(`${name}.init = async () => selectPageForTest('${name}')`, context);
  }
  return { context, calls, redirects, domReady, selected };
}
async function test(name, fn) { await fn(); results.push({ teste: name, resultado: 'PASSOU' }); console.log('PASSOU: '+name); }

await test('Inicialização de dez páginas funciona com e sem .html e na raiz', async () => {
  for (const [file, handler] of Object.entries(pages)) {
    for (const route of ['/'+file, '/'+file.replace(/\.html$/, ''), ...(file === 'index.html' ? ['/','/sistema-declaracoes/'] : [])]) {
      const s = setup(route); vm.runInContext(code('inicializar-pagina.js'), s.context);
      await s.domReady.at(-1)(); assert.deepEqual(s.selected, [handler], route);
    }
  }
});
await test('Registro de atividade conserva os nomes .html esperados pelo banco', async () => {
  for (const route of ['/funcionarios', '/funcionario', '/agenda', '/', '/sistema-declaracoes/declaracoes.html']) {
    const s = setup(route); await vm.runInContext('App.atualizarAtividade()', s.context);
    const request = s.calls.find(x => x.path === '/rest/v1/rpc/ec_atualizar_acesso'); assert.ok(request, route);
    const name = route.split('/').pop() || 'index.html';
    assert.equal(JSON.parse(request.body).p_pagina, name.endsWith('.html') ? name : name+'.html');
  }
});
await test('Redirecionamento ao login preserva a página e os parâmetros em rotas limpas', async () => {
  const s = setup('/funcionario', false, '?id=ficticio');
  await assert.rejects(vm.runInContext('App.requireRoles()', s.context));
  const dest = new URL(s.redirects[0], s.context.location.href);
  assert.equal(dest.origin, 'https://escola.example');
  assert.equal(dest.searchParams.get('next'), 'funcionario.html?id=ficticio');
  assert.equal(s.calls.length, 0);
});
await test('Retorno do login aceita páginas autorizadas com e sem extensão', () => {
  const s = setup('/login'); vm.runInContext(code('login.js'), s.context);
  for (const file of Object.keys(pages)) {
    for (const value of [file, file.replace(/\.html$/, '')]) {
      s.context.value = value+'?id=ficticio';
      assert.equal(vm.runInContext('destinoLogin(value)', s.context), file+'?id=ficticio');
    }
  }
});
await test('Retorno do login continua recusando endereços externos e páginas fora da lista', () => {
  const s = setup('/login'); vm.runInContext(code('login.js'), s.context);
  for (const value of ['https://externo.invalid/', '//externo.invalid', 'javascript:alert(1)', '../funcionarios', '/funcionarios', 'funcionario#x', 'funcionario\\x', '%2f%2fexterno.invalid', 'usuarios', 'acessos', 'historicos', 'login', 'inexistente', 'funcionario\r\nX:1']) {
    s.context.value = value; assert.equal(vm.runInContext('destinoLogin(value)', s.context), 'index.html', value);
  }
});
await test('Build publica arquivos do site e exclui SQL, testes, documentação e Git', () => {
  execFileSync(process.execPath, [path.join(root, 'scripts/build-cloudflare.mjs')], { stdio: 'pipe' });
  const dir = path.join(root, 'dist');
  assert.ok(fs.existsSync(path.join(dir, 'index.html'))); assert.ok(fs.existsSync(path.join(dir, '404.html')));
  for (const name of ['SQL_SUPABASE.sql','supabase','scripts','.git','README.md','CLOUDFLARE.md']) assert.equal(fs.existsSync(path.join(dir,name)), false, name);
  const csp = fs.readFileSync(path.join(dir, '_headers'), 'utf8');
  for (const value of ["frame-ancestors 'none'", 'X-Frame-Options: DENY', 'X-Content-Type-Options: nosniff', 'Referrer-Policy: no-referrer']) assert.ok(csp.includes(value));
  assert.equal(fs.readFileSync(path.join(dir,'login.html'),'utf8'),fs.readFileSync(path.join(root,'login.html'),'utf8'));
});
await test('Sintaxe dos scripts JavaScript válida', () => {
  for (const name of fs.readdirSync(path.join(root,'js')).filter(x=>x.endsWith('.js'))) new vm.Script(code(name), { filename: name });
});
console.log(JSON.stringify({ ambiente: 'Node VM com HTTP simulado e build local; sem sessão nem alteração no Supabase.', grupos: results.length, testes: results }));
