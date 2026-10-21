/* LOGIN — sessão por aba e redirecionamento limitado às páginas do sistema. */
"use strict";
const LOGIN_SUPABASE_URL = "https://cujlebxqqposqomtfvdk.supabase.co";
const LOGIN_SUPABASE_KEY = "sb_publishable_qgZR9bAPNGjYoG-2i_Z5Jg_1Rg3UzBx";
const LOGIN_SESSION_KEY = "eunice_auth_session";
const LOGIN_PROFILE_KEY = "eunice_auth_profile";
const LOGIN_ACCESS_KEY = "eunice_access_id";
const LOGIN_DOMAIN = "eunicecarneiro.local";
const LOGIN_PAGINAS = new Set([
  "index.html", "funcionarios.html", "funcionario.html", "novo-funcionario.html",
  "declaracoes.html", "nova-declaracao.html", "faltas.html", "agenda.html",
  "relatorios.html", "documentos-servidores.html"
]);
let loginOcupado = false;
function normalizarUsuario(v) {
  return String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim().replace(/\s+/g, ".").replace(/[^a-z0-9._-]/g, "");
}
function obterEmailLogin(v) {
  const texto = String(v || "").trim().toLowerCase();
  if (texto.length > 254) throw new Error("Usuário ou e-mail inválido.");
  if (texto.includes("@")) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)) throw new Error("Usuário ou e-mail inválido.");
    return texto;
  }
  const usuario = normalizarUsuario(texto);
  if (!/^[a-z0-9][a-z0-9._-]{0,79}$/.test(usuario)) throw new Error("Usuário inválido.");
  return usuario + "@" + LOGIN_DOMAIN;
}
function destinoLogin(valor) {
  const s = String(valor || "");
  if (!/^[a-z0-9-]+\.html(?:\?[^#\\\r\n]*)?$/i.test(s) || s.length > 2000) return "index.html";
  const u = new URL(s, location.href);
  if (u.origin !== location.origin || !LOGIN_PAGINAS.has(s.split("?")[0].toLowerCase())) return "index.html";
  return s;
}
function limparCredenciais() {
  for (const chave of [LOGIN_SESSION_KEY, LOGIN_PROFILE_KEY, LOGIN_ACCESS_KEY]) {
    try { localStorage.removeItem(chave); } catch { /* sem persistência antiga */ }
    sessionStorage.removeItem(chave);
  }
}
function mensagem(texto, tipo = "error") {
  const el = document.getElementById("loginMsg");
  if (el) { el.textContent = texto; el.className = `login-msg show ${tipo === "success" ? "success" : "error"}`; }
}
function limparMensagem() {
  const el = document.getElementById("loginMsg");
  if (el) { el.className = "login-msg"; el.textContent = ""; }
}
async function loginFetch(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    return await fetch(LOGIN_SUPABASE_URL + path, { ...options, signal: controller.signal,
      credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer", redirect: "error",
      headers: { "Content-Type": "application/json", ...options.headers, apikey: LOGIN_SUPABASE_KEY } });
  } catch { throw new Error("Não foi possível acessar o serviço. Confira sua conexão e tente novamente."); }
  finally { clearTimeout(timer); }
}
async function authLogout(token) {
  if (!token) return;
  try { await loginFetch("/auth/v1/logout?scope=local", { method: "POST", headers: { Authorization: `Bearer ${token}` } }); } catch { /* sessão local é apagada */ }
}
async function perfilDoLogin(token, id) {
  const h = { Authorization: `Bearer ${token}` };
  const u = await loginFetch("/auth/v1/user", { headers: h });
  if (!u.ok || (await u.json()).id !== id) throw new Error("Não foi possível validar seu acesso.");
  const r = await loginFetch(`/rest/v1/usuarios_perfis?id=eq.${encodeURIComponent(id)}&select=id,nome,username,perfil,ativo&limit=1`, { headers: h });
  if (!r.ok) throw new Error("Não foi possível validar o perfil de acesso. Procure o administrador.");
  const perfil = (await r.json())?.[0];
  if (!perfil || perfil.id !== id || perfil.ativo !== true || !["administrador", "secretaria", "consulta"].includes(perfil.perfil)) {
    throw new Error("Acesso não autorizado. Procure o administrador do sistema.");
  }
  return perfil;
}
async function entrar(usuarioOuEmail, senha) {
  if (loginOcupado) return;
  if (!String(usuarioOuEmail || "").trim() || !senha) throw new Error("Informe seu usuário e sua senha.");
  if (typeof senha !== "string" || senha.length > 1024) throw new Error("Senha inválida.");
  const email = obterEmailLogin(usuarioOuEmail);
  loginOcupado = true;
  let token = "";
  limparCredenciais();
  try {
    const r = await loginFetch("/auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password: senha }) });
    if (!r.ok) throw new Error(r.status === 429 ? "Muitas tentativas. Aguarde alguns minutos e tente novamente." : "Não foi possível entrar. Confira o usuário e a senha.");
    const s = await r.json();
    token = s.access_token || "";
    if (!token || !s.refresh_token || !/^[0-9a-f-]{36}$/i.test(s.user?.id || "")) throw new Error("Não foi possível iniciar a sessão.");
    await perfilDoLogin(token, s.user.id);
    // Registro de acesso obrigatório, com usuário e horários definidos pelo banco.
    const a = await loginFetch("/rest/v1/rpc/ec_registrar_acesso", {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ p_pagina: "login.html", p_navegador: navigator.userAgent.slice(0, 500) })
    });
    if (!a.ok) throw new Error("Não foi possível registrar o acesso. Confira se o SQL de segurança foi aplicado.");
    const id = await a.json();
    if (typeof id !== "string" && typeof id !== "number") throw new Error("Registro de acesso inválido.");
    sessionStorage.setItem(LOGIN_SESSION_KEY, JSON.stringify({
      access_token: s.access_token, refresh_token: s.refresh_token,
      expires_at: s.expires_at || Math.floor(Date.now() / 1000) + Number(s.expires_in || 0),
      user: { id: s.user.id }
    }));
    sessionStorage.setItem(LOGIN_ACCESS_KEY, String(id));
    location.replace(destinoLogin(new URLSearchParams(location.search).get("next")));
  } catch (e) {
    limparCredenciais();
    await authLogout(token);
    throw e;
  } finally { loginOcupado = false; }
}
document.addEventListener("DOMContentLoaded", async () => {
  for (const chave of [LOGIN_SESSION_KEY, LOGIN_PROFILE_KEY, LOGIN_ACCESS_KEY]) {
    try { localStorage.removeItem(chave); } catch { /* sem persistência antiga */ }
  }
  document.getElementById("toggleSenha")?.addEventListener("click", () => {
    const senha = document.getElementById("senha");
    const b = document.getElementById("toggleSenha");
    if (!senha || !b) return;
    const mostrar = senha.type === "password";
    senha.type = mostrar ? "text" : "password";
    b.textContent = mostrar ? "Ocultar" : "Mostrar";
    b.setAttribute("aria-pressed", String(mostrar));
  });
  document.getElementById("usuario")?.setAttribute("autocomplete", "username");
  document.getElementById("senha")?.setAttribute("autocomplete", "current-password");
  document.getElementById("loginForm")?.addEventListener("submit", async e => {
    e.preventDefault();
    if (loginOcupado) return;
    limparMensagem();
    const btn = document.getElementById("btnEntrar");
    const senha = document.getElementById("senha");
    if (btn) { btn.disabled = true; btn.textContent = "Entrando..."; }
    try { await entrar(document.getElementById("usuario")?.value, senha?.value); }
    catch (erro) { mensagem(erro.message || "Não foi possível entrar no sistema."); }
    finally {
      if (senha) { senha.value = ""; senha.type = "password"; }
      if (btn) { btn.disabled = false; btn.textContent = "Entrar no sistema"; }
    }
  });
  // Uma sessão gravada só produz redirecionamento depois da validação no servidor.
  try {
    const s = JSON.parse(sessionStorage.getItem(LOGIN_SESSION_KEY) || "null");
    if (s?.access_token && s.user?.id && Number(s.expires_at) * 1000 > Date.now()) {
      await perfilDoLogin(s.access_token, s.user.id);
      location.replace(destinoLogin(new URLSearchParams(location.search).get("next")));
    }
  } catch { limparCredenciais(); }
});

