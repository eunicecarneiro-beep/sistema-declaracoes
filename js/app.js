/* Revisão de segurança — 20/10/2026. Adaptada aos IDs text/bigint/uuid do banco. Aplicar também o SQL incluído no pacote. */
"use strict";
const SUPABASE_URL = "https://cujlebxqqposqomtfvdk.supabase.co";
// Chave pública: a proteção dos dados é feita por Auth, permissões e RLS.
const SUPABASE_KEY = "sb_publishable_qgZR9bAPNGjYoG-2i_Z5Jg_1Rg3UzBx";
const AUTH_SESSION_KEY = "eunice_auth_session";
const AUTH_PROFILE_KEY = "eunice_auth_profile";
const AUTH_ACCESS_KEY = "eunice_access_id";
let perfilVerificado = null;
// Encerra a persistência antiga. Entre novamente após a troca.
for (const chave of [AUTH_SESSION_KEY, AUTH_PROFILE_KEY, AUTH_ACCESS_KEY]) {
  try { localStorage.removeItem(chave); } catch { /* armazenamento indisponível */ }
}
function authGetSession() {
  try {
    const s = JSON.parse(sessionStorage.getItem(AUTH_SESSION_KEY) || "null");
    return s && typeof s.access_token === "string" ? s : null;
  } catch { return null; }
}
function authSetSession(s) {
  if (s) {
    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
      access_token: s.access_token, refresh_token: s.refresh_token,
      expires_at: s.expires_at || Math.floor(Date.now() / 1000) + Number(s.expires_in || 0),
      user: { id: s.user?.id || "" }
    }));
  } else sessionStorage.removeItem(AUTH_SESSION_KEY);
}
function authGetProfile() { return perfilVerificado ? { ...perfilVerificado } : null; }
function authSetProfile(p) {
  perfilVerificado = p ? Object.freeze({ ...p }) : null;
  sessionStorage.removeItem(AUTH_PROFILE_KEY);
}
function authToken() { return authGetSession()?.access_token || ""; }
function authGetAccessId() { return sessionStorage.getItem(AUTH_ACCESS_KEY) || ""; }
function authSetAccessId(id) {
  if (id) sessionStorage.setItem(AUTH_ACCESS_KEY, String(id));
  else sessionStorage.removeItem(AUTH_ACCESS_KEY);
}

const App = (() => {
  const NAV = [
    {
      key: "dashboard",
      href: "index.html",
      icon: "⌂",
      label: "Dashboard"
    },
    {
      key: "funcionarios",
      href: "funcionarios.html",
      icon: "👥",
      label: "Funcionários"
    },
    {
      key: "declaracoes",
      href: "declaracoes.html",
      icon: "📄",
      label: "Declarações"
    },
    {
      key: "nova-declaracao",
      href: "nova-declaracao.html",
      icon: "＋",
      label: "Nova Declaração"
    },
    {
      key: "novo-funcionario",
      href: "novo-funcionario.html",
      icon: "＋",
      label: "Novo Funcionário"
    },
    {
      key: "faltas",
      href: "faltas.html",
      icon: "📅",
      label: "Faltas"
    },
    {
      key: "agenda",
      href: "agenda.html",
      icon: "🗓️",
      label: "Agenda"
    },
    {
      key: "relatorios",
      href: "relatorios.html",
      icon: "▥",
      label: "Relatórios"
    }
  ];
  function getNav() {
    const nav = NAV.filter(i => canWrite() || ["dashboard", "funcionarios", "agenda"].includes(i.key));
    const perfil = authGetProfile();
    if (
      ["administrador", "secretaria"].includes(perfil?.perfil) &&
      perfil?.ativo === true
    ) {
      nav.push({
        key: "documentos-servidores",
        href: "documentos-servidores.html",
        icon: "📝",
        label: "Documentos da Escola"
      });
    }
    return nav;
  }
  /* UTILITÁRIOS */
  function escapeHTML(v = "") {
    return String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  function formatDate(v) {
    const s = String(v || "").slice(0, 10);
    if (!dataValida(s)) return "—";
    const [a, m, d] = s.split("-");
    return `${d}/${m}/${a}`;
  }
  function getPageKey() {
    return document.body.dataset.page || "";
  }
  function getCurrentPageFile() {
    const arquivo = location.pathname.split("/").pop() || "index.html";
    return arquivo.includes(".") ? arquivo : `${arquivo}.html`;
  }
  /* LAYOUT */
  function layout(title, subtitle, content) {
    document.title = `${title} | Sistema de Declarações`;
    const root = document.getElementById("app");
    if (!root) {
      throw new Error("Elemento #app não encontrado.");
    }
    const pagina = getPageKey();
    if (!perfilVerificado || encerrando) throw new Error("Valide seu acesso antes de abrir a página.");
    root.innerHTML = `
      <div class="app-shell">
        <aside class="sidebar" id="sidebar">
          <div class="brand">
            <div class="brand-mark">EC</div>
            <div class="brand-text">
              <strong>Sistema de Declarações</strong>
              <span>E.M. Profª Eunice Carneiro</span>
            </div>
          </div>
          <nav class="nav">
            ${getNav().map(i => `
              <a
                href="${i.href}"
                class="${pagina === i.key ? "active" : ""}"
              >
                <span class="nav-icon">${i.icon}</span>
                <span>${i.label}</span>
              </a>
            `).join("")}
          </nav>
          <div class="sidebar-footer">
            Banco de dados online • Supabase
          </div>
        </aside>
        <main class="main">
          <header class="topbar">
            <div style="display:flex;align-items:center;gap:12px">
              <button
                class="menu-toggle"
                id="menuToggle"
                aria-label="Abrir menu"
              >☰</button>
              <div class="topbar-title">
                <h1>${escapeHTML(title)}</h1>
                <p>${escapeHTML(subtitle)}</p>
              </div>
            </div>
            <div
              class="no-print"
              style="display:flex;gap:8px;align-items:center"
            >
              <span style="font-size:13px;color:#667085">
                👤 ${escapeHTML(
                  authGetProfile()?.nome ||
                  authGetProfile()?.username ||
                  "Usuário"
                )}
              </span>
              <button
                class="btn btn-secondary btn-sm"
                type="button"
                id="btnSairSistema"
              >
                Sair
              </button>
            </div>
          </header>
          <section class="content">
            ${content}
          </section>
        </main>
      </div>
      <div id="modalRoot"></div>
    `;
    document.getElementById("menuToggle")
      ?.addEventListener("click", () => {
        document.getElementById("sidebar")
          ?.classList.toggle("open");
      });
    document.getElementById("btnSairSistema")
      ?.addEventListener("click", () => logout());
  }
  /* MODAIS */
  function escClose(e) {
    if (e.key === "Escape") closeModal();
  }
  function openModal({ title, body, footer = "" }) {
    const root = document.getElementById("modalRoot");
    root.innerHTML = `
      <div class="modal-backdrop show" id="modalBackdrop">
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal-header">
            <h3>${escapeHTML(title)}</h3>
            <button
              class="modal-close"
              aria-label="Fechar"
              data-close-modal
            >×</button>
          </div>
          <div class="modal-body">${body}</div>
          ${footer
            ? `<div class="modal-footer">${footer}</div>`
            : ""}
        </div>
      </div>
    `;
    root.querySelectorAll("[data-close-modal]").forEach(b => {
      b.addEventListener("click", closeModal);
    });
    root.querySelector("#modalBackdrop")
      ?.addEventListener("click", e => {
        if (e.target.id === "modalBackdrop") closeModal();
      });
    document.addEventListener("keydown", escClose);
  }
  function closeModal() {
    const root = document.getElementById("modalRoot");
    if (root) root.innerHTML = "";
    document.removeEventListener("keydown", escClose);
  }
  /* NOTIFICAÇÕES */
  function toast(message, type = "success") {
    let root = document.getElementById("toastRoot");
    if (!root) {
      root = document.createElement("div");
      root.id = "toastRoot";
      root.style.cssText =
        "position:fixed;right:18px;bottom:18px;" +
        "z-index:5000;display:flex;" +
        "flex-direction:column;gap:10px";
      document.body.appendChild(root);
    }
    const el = document.createElement("div");
    const classes = {
      success: "alert-success",
      warning: "alert-warning",
      danger: "alert-danger",
      info: "alert-info"
    };
    el.className = `alert ${classes[type] || classes.info}`;
    el.style.cssText +=
      "box-shadow:0 12px 30px rgba(16,24,40,.14);" +
      "max-width:360px;margin:0";
    el.textContent = String(message);
    root.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }
  /* AUTENTICAÇÃO E REQUISIÇÕES. O banco aplica as permissões reais. */
  const PERFIS = ["administrador", "secretaria", "consulta"];
  const ESCRITA = ["administrador", "secretaria"];
  const TABELAS = new Set(["funcionarios", "declaracoes", "faltas", "agenda", "usuarios_perfis", "acessos"]);
  const RPCS = new Set(["ec_registrar_acesso", "ec_atualizar_acesso", "ec_servidores_consulta"]);
  let renovacao = null;
  let verificacao = null;
  let perfilEm = 0;
  let encerrando = false;
  let atividadeEm = Date.now();
  let heartbeatOcupado = false;
  const LIMITE_INATIVIDADE = 20 * 60 * 1000;

  function erroHTTP(r) {
    const textos = {
      400: "Dados inválidos ou configuração do banco incompatível. Confira o guia.",
      401: "Sessão expirada. Entre novamente.",
      403: "Seu perfil não tem permissão para esta operação.",
      404: "Registro ou serviço não encontrado.",
      409: "O registro já existe ou está vinculado a outros dados.",
      413: "O arquivo excede o tamanho permitido.",
      415: "Tipo de arquivo não permitido.",
      429: "Muitas tentativas. Aguarde e tente novamente."
    };
    const e = new Error(textos[r.status] || "O serviço não pôde concluir a operação. Tente novamente.");
    e.status = r.status;
    return e;
  }
  async function fetchSeguro(url, options = {}, timeout = 25000) {
    const controller = new AbortController();
    const abortar = () => controller.abort();
    if (options.signal?.aborted) controller.abort();
    else options.signal?.addEventListener("abort", abortar, { once: true });
    const timer = setTimeout(abortar, timeout);
    try {
      return await fetch(url, { ...options, signal: controller.signal,
        cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer", redirect: "error" });
    } catch (e) {
      if (options.signal?.aborted) throw e;
      throw new Error(controller.signal.aborted
        ? "O serviço demorou para responder. Tente novamente."
        : "Não foi possível acessar o serviço. Confira sua conexão.");
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", abortar);
    }
  }
  async function refreshSession() {
    if (renovacao) return renovacao;
    const anterior = authGetSession();
    if (!anterior?.refresh_token || encerrando) return null;
    renovacao = (async () => {
      const r = await fetchSeguro(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST", headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: anterior.refresh_token })
      });
      if (!r.ok) return null;
      const nova = await r.json();
      if (!nova.access_token || !nova.refresh_token || encerrando ||
          authGetSession()?.refresh_token !== anterior.refresh_token) return null;
      authSetSession(nova);
      return nova;
    })();
    try { return await renovacao; } finally { renovacao = null; }
  }
  async function tokenValido() {
    if (encerrando || !authToken()) throw new Error("Entre no sistema para continuar.");
    const s = authGetSession();
    if (!s.expires_at || Number(s.expires_at) * 1000 <= Date.now() + 45000) {
      const nova = await refreshSession();
      if (!nova) throw new Error("Sessão expirada. Entre novamente.");
    }
    return authToken();
  }
  function validarDestino(path) {
    if (typeof path !== "string" || path.length > 12000 || /[\\\r\n#]/.test(path)) throw new Error("Endereço de serviço inválido.");
    const caminho = path.split("?")[0];
    if (/%(?:2e|2f|5c)/i.test(caminho) || caminho.split("/").some(s => s === "." || s === "..")) throw new Error("Endereço de serviço inválido.");
    const u = new URL(path, SUPABASE_URL);
    if (u.origin !== SUPABASE_URL || !/^\/(rest|storage|functions)\/v1\//.test(u.pathname)) throw new Error("Endereço de serviço inválido.");
    if (u.pathname.startsWith("/rest/v1/")) {
      const recurso = u.pathname.slice(9);
      if (!(TABELAS.has(recurso) || (recurso.startsWith("rpc/") && RPCS.has(recurso.slice(4))))) throw new Error("Recurso não autorizado pelo aplicativo.");
    } else if (u.pathname.startsWith("/functions/v1/")) {
      if (u.pathname !== "/functions/v1/documentos-ia") throw new Error("Função não autorizada.");
    } else if (!/^\/storage\/v1\/object\/(?:authenticated\/)?declaracoes(?:\/|$)/.test(u.pathname)) throw new Error("Recurso de arquivos inválido.");
    return u.href;
  }
  async function requestInterno(path, options = {}, retry = true) {
    const url = validarDestino(path);
    const token = await tokenValido();
    const headers = new Headers(options.headers || {});
    headers.set("apikey", SUPABASE_KEY);
    headers.set("Authorization", `Bearer ${token}`);
    if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const r = await fetchSeguro(url, { ...options, headers }, path.includes("/functions/") ? 90000 : 25000);
    if (r.status === 401 && retry) {
      const nova = authToken() !== token ? authGetSession() : await refreshSession();
      if (nova?.access_token) return requestInterno(path, options, false);
    }
    if (r.status === 401) {
      authSetProfile(null); authSetSession(null); authSetAccessId("");
      redirecionarLogin();
    }
    return r;
  }
  function redirecionarLogin() {
    const arquivo = getCurrentPageFile();
    if (arquivo.toLowerCase() !== "login.html") location.replace(`login.html?next=${encodeURIComponent(arquivo + location.search)}`);
  }
  async function carregarPerfilAtual() {
    if (verificacao) return verificacao;
    verificacao = (async () => {
      try {
        const token = await tokenValido();
        let r = await fetchSeguro(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } });
        if (r.status === 401) {
          const nova = await refreshSession();
          if (!nova) throw erroHTTP(r);
          r = await fetchSeguro(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${authToken()}` } });
        }
        if (!r.ok) throw erroHTTP(r);
        const user = await r.json();
        if (!/^[0-9a-f-]{36}$/i.test(user.id || "")) throw new Error("Login inválido.");
        r = await requestInterno(`/rest/v1/usuarios_perfis?id=eq.${encodeURIComponent(user.id)}&select=id,nome,username,perfil,ativo&limit=1`);
        if (!r.ok) throw erroHTTP(r);
        const p = (await r.json())?.[0];
        if (!p || p.id !== user.id || p.ativo !== true || !PERFIS.includes(p.perfil)) {
          const erro = new Error("Seu perfil está inativo ou não foi autorizado.");
          erro.code = "PERFIL_NAO_AUTORIZADO";
          throw erro;
        }
        if (encerrando) return null;
        authSetProfile(p); perfilEm = Date.now();
        document.body.dataset.perfil = p.perfil;
        return authGetProfile();
      } catch (e) {
        authSetProfile(null); perfilEm = 0;
        if (e.code === "PERFIL_NAO_AUTORIZADO" || e.status === 401 || e.status === 403) await logout();
        throw e;
      }
    })();
    try { return await verificacao; } finally { verificacao = null; }
  }
  async function requireRoles(perfis = PERFIS) {
    if (encerrando || !authToken()) { redirecionarLogin(); throw new Error("Entre no sistema para continuar."); }
    if (Date.now() - atividadeEm >= LIMITE_INATIVIDADE) { await logout(); throw new Error("Sessão encerrada por inatividade."); }
    const perfil = !perfilVerificado || Date.now() - perfilEm >= 30000 ? await carregarPerfilAtual() : authGetProfile();
    if (!perfil || perfil.ativo !== true || !perfis.includes(perfil.perfil)) throw new Error("Seu perfil não tem permissão para esta operação.");
    return perfil;
  }
  function canWrite() { return perfilVerificado?.ativo === true && ESCRITA.includes(perfilVerificado?.perfil); }
  function isAdmin() { return perfilVerificado?.ativo === true && perfilVerificado?.perfil === "administrador"; }
  async function request(path, options = {}) {
    await requireRoles();
    const method = String(options.method || "GET").toUpperCase();
    if (path.startsWith("/functions/")) await requireRoles(ESCRITA);
    if (path.startsWith("/storage/") && method !== "GET") await requireRoles(ESCRITA);
    return requestInterno(path, options);
  }
  async function api(path, options = {}) {
    const p = await requireRoles();
    const method = String(options.method || "GET").toUpperCase();
    const recurso = path.split("?")[0].slice(1);
    if (recurso.startsWith("rpc/")) {
      if (!RPCS.has(recurso.slice(4))) throw new Error("Operação inválida.");
    } else {
      if (!TABELAS.has(recurso)) throw new Error("Tabela inválida.");
      if (["usuarios_perfis", "acessos"].includes(recurso)) {
        throw new Error("A gestão de usuários e acessos foi desativada no site.");
      } else if (p.perfil === "consulta" && recurso !== "agenda") throw new Error("Seu perfil não tem acesso a estes dados.");
      if (method !== "GET") await requireRoles(method === "DELETE" ? ["administrador"] : ESCRITA);
    }
    if (recurso === "agenda") {
      // O bigint chega como texto para não perder precisão no JSON do navegador.
      const url = new URL(path, SUPABASE_URL);
      const select = url.searchParams.get("select");
      if (!select || select === "*") {
        url.searchParams.set("select", "id::text,created_at,titulo,data,hora_inicio,hora_fim,local,responsavel,categoria,descricao");
      }
      path = url.pathname + url.search;
    }
    const r = await requestInterno("/rest/v1" + path, options);
    if (!r.ok) throw erroHTTP(r);
    const texto = await r.text();
    return texto ? JSON.parse(texto) : null;
  }
  async function atualizarAtividade() {
    if (heartbeatOcupado || encerrando) return;
    heartbeatOcupado = true;
    try {
      if (Date.now() - atividadeEm >= LIMITE_INATIVIDADE) return await logout();
      await requireRoles();
      const id = authGetAccessId();
      if (id) await api("/rpc/ec_atualizar_acesso", { method: "POST", body: JSON.stringify({ p_id: id, p_pagina: getCurrentPageFile(), p_sair: false }) });
    } catch {
      if (!perfilVerificado) toast("Não foi possível validar seu acesso. Entre novamente se o problema persistir.", "warning");
    } finally { heartbeatOcupado = false; }
  }
  async function logout(redirecionar = true) {
    if (encerrando) return;
    const token = authToken(); const id = authGetAccessId(); encerrando = true;
    authSetSession(null); authSetProfile(null); authSetAccessId(""); perfilEm = 0;
    const root = document.getElementById("app"); if (root) root.replaceChildren();
    const tarefas = [];
    if (token && id) tarefas.push(fetchSeguro(`${SUPABASE_URL}/rest/v1/rpc/ec_atualizar_acesso`, { method: "POST", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ p_id: id, p_pagina: "login.html", p_sair: true }) }, 5000));
    if (token) tarefas.push(fetchSeguro(`${SUPABASE_URL}/auth/v1/logout?scope=local`, { method: "POST", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } }, 5000));
    await Promise.allSettled(tarefas);
    if (redirecionar) location.replace("login.html");
  }
  function safeUUID(valor) {
    const s = String(valor || "");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) throw new Error("Identificador de usuário inválido.");
    return s;
  }
  function safeId(valor, tabela = "funcionarios") {
    if (!["string", "number", "bigint"].includes(typeof valor) ||
        (typeof valor === "number" && !Number.isSafeInteger(valor))) {
      throw new Error("Identificador inválido.");
    }
    const id = String(valor);
    if (tabela === "agenda") {
      if (!/^-?(?:0|[1-9]\d{0,18})$/.test(id) ||
          BigInt(id) < -9223372036854775808n || BigInt(id) > 9223372036854775807n) {
        throw new Error("Identificador da agenda inválido.");
      }
      return BigInt(id).toString();
    }
    if (!["funcionarios", "declaracoes", "faltas"].includes(tabela) ||
        !id.length || id.length > 10000 || /[\u0000-\u001f\u007f]/.test(id)) {
      throw new Error("Identificador inválido.");
    }
    return id;
  }
  function idFilter(valor, tabela = "funcionarios") {
    const id = safeId(valor, tabela);
    // No filtro eq direto, aspas adicionais passam a fazer parte do ID.
    // Codificar o valor preserva o ID e impede a criação de novos parâmetros.
    return encodeURIComponent(id);
  }
  function dataValida(valor) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(valor))) return false;
    const t = Date.parse(valor + "T12:00:00Z");
    return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === valor;
  }
  function csvCell(valor) {
    let s = String(valor ?? "").replace(/\u0000/g, "");
    if (/^[\s\uFEFF]*[=+\-@]/u.test(s) || /^[\t\r\n]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }
  function generateId() { const n = new Uint32Array(1); crypto.getRandomValues(n); return (n[0] & 0x7fffffff) || 1; }
  function validarDados(store, dados) {
    for (const [k, v] of Object.entries(dados)) {
      if (typeof v === "string" && (v.includes("\u0000") || v.length > 10000)) throw new Error("Texto inválido ou muito longo.");
      if (k.startsWith("data") && v && !dataValida(v)) throw new Error("Informe uma data válida.");
    }
    if (store === "funcionarios") {
      if (!String(dados.nome_completo || "").trim() || String(dados.nome_completo).length > 200) throw new Error("Informe o nome completo, com até 200 caracteres.");
      if (!["Ativo", "Inativo"].includes(dados.status)) throw new Error("Situação inválida.");
      if (dados.status === "Inativo" && (!dados.motivo_inatividade || !dados.data_inatividade)) throw new Error("Informe motivo e data da inativação.");
      if (dados.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) throw new Error("E-mail inválido.");
    }
    if (store === "faltas") { safeId(dados.funcionario_id); if (!dataValida(dados.data_falta) || !dados.motivo) throw new Error("Informe a data e o motivo da falta."); }
    if (store === "agenda") {
      if (!dados.titulo?.trim() || dados.titulo.length > 200 || !dataValida(dados.data)) throw new Error("Confira o título e a data do compromisso.");
      if (!["Reunião", "Evento", "Prazo", "Visita", "Monitoramento", "Atendimento", "Formação", "Outro"].includes(dados.categoria)) throw new Error("Categoria inválida.");
      for (const k of ["hora_inicio", "hora_fim"]) if (dados[k] && !/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(dados[k])) throw new Error("Horário inválido.");
      if (dados.hora_inicio && dados.hora_fim && dados.hora_fim < dados.hora_inicio) throw new Error("Confira os horários.");
    }
    return dados;
  }
  ["pointerdown", "keydown", "input", "scroll"].forEach(tipo => {
    document.addEventListener(tipo, e => {
      if (!e.isTrusted) return;
      if (Date.now() - atividadeEm >= LIMITE_INATIVIDADE) { void logout(); return; }
      atividadeEm = Date.now();
    }, { passive: true });
  });

  function fromDB(store, x) {
    if (!x) return x;
    if (store === "funcionarios") {
      return {
        id: String(x.id),
        nome: x.nome_completo || x.nome || "",
        matricula: x.matricula || "",
        cargo: x.cargo_funcao || x.cargo || "",
        categoriaCargo: x.categoria_cargo || "",
        setor: x.setor || "",
        vinculo: x.tipo_vinculo || x.vinculo || "",
        status: x.status || "Ativo",
        turno: x.turno || "",
        cargaHoraria: x.carga_horaria || "",
        dataAdmissao: x.data_admissao || "",
        dataEntradaEscola: x.data_entrada_escola || "",
        cpf: x.cpf || "",
        telefone: x.telefone || "",
        email: x.email || "",
        endereco: x.endereco || "",
        formacao: x.formacao || "",
        especializacao: x.especializacao || "",
        naturalidade: x.naturalidade || "",
        dataNascimento: x.data_nascimento || "",
        motivoInatividade: x.motivo_inatividade || "",
        dataInatividade: x.data_inatividade || "",
        observacoes: x.observacoes || ""
      };
    }
    if (store === "declaracoes") {
      return {
        id: String(x.id),
        funcionarioId: String(x.funcionario_id),
        tipo: x.tipo,
        data: x.data,
        dataInicial: x.data_inicial || x.data_inicio || x.data,
        dataFinal: x.data_final || x.data_fim || x.data,
        horaInicial: x.hora_inicial,
        horaFinal: x.hora_final,
        quantidadeHoras: x.quantidade_horas,
        quantidadeDias: x.quantidade_dias,
        observacoes: x.observacoes
      };
    }
    if (store === "faltas") {
      return {
        id: String(x.id),
        funcionario_id: String(x.funcionario_id),
        data_falta: x.data_falta,
        motivo: x.motivo,
        justificativa: x.justificativa,
        createdAt: x.created_at
      };
    }
    return {
      ...x,
      id: store === "agenda" ? safeId(x.id, "agenda") : String(x.id)
    };
  }
  function toDB(store, x) {
    if (store === "funcionarios") {
      return {
        ...(x.id ? { id: safeId(x.id, store) } : {}),
        nome_completo: x.nome || null,
        matricula: x.matricula || null,
        cargo_funcao: x.cargo || null,
        categoria_cargo: x.categoriaCargo || null,
        setor: x.setor || null,
        tipo_vinculo: x.vinculo || null,
        status: x.status || "Ativo",
        turno: x.turno || null,
        carga_horaria: x.cargaHoraria || null,
        data_admissao: x.dataAdmissao || null,
        data_entrada_escola: x.dataEntradaEscola || null,
        cpf: x.cpf || null,
        telefone: x.telefone || null,
        email: x.email || null,
        endereco: x.endereco || null,
        formacao: x.formacao || null,
        especializacao: x.especializacao || null,
        naturalidade: x.naturalidade || null,
        data_nascimento: x.dataNascimento || null,
        motivo_inatividade: x.motivoInatividade || null,
        data_inatividade: x.dataInatividade || null,
        observacoes: x.observacoes || null
      };
    }
    if (store === "declaracoes") {
      return {
        ...(x.id ? { id: safeId(x.id, store) } : {}),
        funcionario_id: safeId(x.funcionarioId ?? x.funcionario_id, "funcionarios"),
        tipo: x.tipo,
        data: x.data || null,
        data_inicial: x.dataInicial || null,
        data_final: x.dataFinal || null,
        hora_inicial: x.horaInicial || null,
        hora_final: x.horaFinal || null,
        quantidade_horas: x.quantidadeHoras || 0,
        quantidade_dias: x.quantidadeDias || 0,
        observacoes: x.observacoes || null
      };
    }
    if (store === "faltas") {
      return {
        ...(x.id ? { id: safeId(x.id, store) } : {}),
        funcionario_id: safeId(x.funcionario_id ?? x.funcionarioId, "funcionarios"),
        data_falta: x.data_falta || x.data,
        motivo:
          x.motivo || x.tipo || "Falta Injustificada",
        justificativa: x.justificativa || null
      };
    }
    if (store === "agenda") {
      return Object.fromEntries(["id", "titulo", "data", "hora_inicio", "hora_fim", "categoria", "local", "responsavel", "descricao"]
        .filter(k => x[k] !== undefined).map(k => [k, x[k]]));
    }
    throw new Error("Tabela inválida.");
  }
  async function add(store, value) {
    await requireRoles(ESCRITA);
    const d = validarDados(store, toDB(store, value));
    // O banco atribui a chave primária. Não usa timestamp nem Math.random.
    delete d.id;
    const r = await api(`/${store}`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(d) });
    if (!Array.isArray(r) || r.length !== 1) throw new Error("Não foi possível confirmar a gravação.");
    return fromDB(store, r[0]);
  }
  async function put(store, value) {
    if (value.id === undefined || value.id === null || value.id === "") return add(store, value);
    await requireRoles(ESCRITA);
    const id = idFilter(value.id, store);
    const d = validarDados(store, toDB(store, value));
    if (store === "funcionarios" && !Object.prototype.hasOwnProperty.call(value, "categoriaCargo")) delete d.categoria_cargo;
    delete d.id;
    const r = await api(`/${store}?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(d) });
    if (!Array.isArray(r) || r.length !== 1) throw new Error("Registro inexistente ou alteração não autorizada.");
    return fromDB(store, r[0]);
  }
  async function get(store, key) {
    const id = safeId(key, store);
    const p = await requireRoles();
    if (store === "funcionarios" && p.perfil === "consulta") return (await getAll(store)).find(x => x.id === id) || null;
    const r = await api(`/${store}?id=eq.${idFilter(id, store)}&select=*&limit=1`);
    return fromDB(store, r?.[0] || null);
  }
  async function getAll(store) {
    const p = await requireRoles();
    if (store === "funcionarios" && p.perfil === "consulta") {
      const rows = await api("/rpc/ec_servidores_consulta", { method: "POST", body: "{}" });
      return (rows || []).map(x => fromDB(store, x));
    }
    if (!TABELAS.has(store)) throw new Error("Tabela inválida.");
    const rows = [];
    const size = 500;
    for (let offset = 0; offset < 50000; offset += size) {
      const page = await api(`/${store}?select=*&order=id.asc&limit=${size}&offset=${offset}`);
      if (!Array.isArray(page)) throw new Error("Resposta inválida do banco.");
      rows.push(...page);
      if (page.length < size) return rows.map(x => fromDB(store, x));
    }
    throw new Error("Há muitos registros. Aplique filtros no servidor antes de continuar.");
  }
  async function remove(store, key) {
    await requireRoles(["administrador"]);
    const id = idFilter(key, store);
    const r = await api(`/${store}?id=eq.${id}`, { method: "DELETE", headers: { Prefer: "return=representation" } });
    if (!Array.isArray(r) || r.length !== 1) throw new Error("Registro inexistente ou exclusão não autorizada.");
    return true;
  }
  async function counts() {
    const funcionarios = await getAll("funcionarios");
    const declaracoes = await getAll("declaracoes");
    return {
      funcionarios: funcionarios.length,
      declaracoes: declaracoes.length,
      horas: declaracoes.filter(
        x => x.tipo === "horas"
      ).length,
      dias: declaracoes.filter(
        x => x.tipo === "dias"
      ).length,
      listaFuncionarios: funcionarios,
      listaDeclaracoes: declaracoes
    };
  }
  return {
    requireRoles, canWrite, isAdmin, safeId, idFilter, safeUUID, dataValida, csvCell, request, erroHTTP,
    escapeHTML,
    formatDate,
    getPageKey,
    layout,
    openModal,
    closeModal,
    toast,
    add,
    put,
    get,
    getAll,
    remove,
    counts,
    seedDemoData: async () => {},
    uid: generateId,
    rest: api,
    getSession: authGetSession,
    getCurrentPageFile,
    getProfile: authGetProfile,
    getAccessToken: authToken,
    carregarPerfilAtual,
    atualizarAtividade,
    logout
  };
})();
/* A autenticação é aguardada também por todas as chamadas à API. */
document.addEventListener("DOMContentLoaded", async () => {
  if (App.getCurrentPageFile().toLowerCase() === "login.html") return;
  if (["usuarios", "acessos"].includes(document.body.dataset.page)) {
    location.replace("index.html");
    return;
  }
  const estilo = document.createElement("style");
  estilo.textContent = 'body[data-perfil="consulta"] [data-write],body:not([data-perfil="administrador"]) [data-admin]{display:none!important}';
  document.head.appendChild(estilo);
  try {
    const p = await App.requireRoles();
    document.body.dataset.perfil = p.perfil;
    await App.atualizarAtividade();
    setInterval(() => App.atualizarAtividade(), 60000);
  } catch (e) {
    App.toast(e.message, "danger");
    if (!authToken()) location.replace("login.html");
  }
});
window.addEventListener("pageshow", e => {
  if (e.persisted) location.reload();
});
const DashboardPage = {
  async consulta() {
    const [funcionarios, agenda] = await Promise.all([App.getAll("funcionarios"), App.getAll("agenda")]);
    const eventos = agenda.filter(x => String(x.data || "") >= this.dataHojeLocal()).sort((a,b) => this.chaveAgenda(a).localeCompare(this.chaveAgenda(b)));
    App.layout("Dashboard", "Consulta da agenda e do quadro de servidores",
      `<div class="card panel"><h2>Consulta</h2><p>${funcionarios.length} servidores cadastrados.</p>
      <a class="btn btn-secondary" href="funcionarios.html">Servidores</a></div>
      <div class="card panel"><h3>Próximos eventos</h3>${this.listaAgenda(eventos)}</div>`);
  },
  async init() {
    try {
      await App.requireRoles();
      if (!App.canWrite()) return this.consulta();
      const [
        funcionarios,
        declaracoes,
        faltas,
        agenda
      ] = await Promise.all([
        App.getAll("funcionarios"),
        App.getAll("declaracoes"),
        App.getAll("faltas"),
        App.getAll("agenda")
      ]);
      const ativos = funcionarios.filter(
        f => String(f.status || "Ativo")
          .trim()
          .toLowerCase() === "ativo"
      );
      const mapa = Object.fromEntries(
        funcionarios.map(f => [String(f.id), f])
      );
      const hoje = this.dataHojeLocal();
      const eventos = agenda
        .filter(
          x => String(x.data || "").slice(0, 10) >= hoje
        )
        .sort(
          (a, b) => this.chaveAgenda(a).localeCompare(
            this.chaveAgenda(b)
          )
        );
      App.layout(
        "Dashboard",
        "Visão geral do sistema interno de declarações",
        `
        <style>
          .dashboard-resumo{
            display:grid;
            grid-template-columns:repeat(4,minmax(0,1fr));
            gap:16px;
            margin-bottom:22px
          }
          .dashboard-conteudo{
            display:grid;
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:18px
          }
          .dashboard-card{min-width:0}
          .dashboard-card-agenda{grid-column:1/-1}
          .dashboard-panel-header{
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:12px;
            margin-bottom:16px
          }
          .dashboard-panel-header h3{margin:0}
          .dashboard-empty{
            padding:30px 15px;
            text-align:center;
            color:#667085
          }
          .dashboard-eventos{
            display:grid;
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:10px
          }
          .dashboard-evento{
            display:flex;
            gap:12px;
            align-items:flex-start;
            padding:14px;
            border:1px solid #e4e7ec;
            border-radius:10px;
            background:#fff;
            min-width:0
          }
          .dashboard-evento-data{
            flex:0 0 auto;
            min-width:82px;
            padding:8px;
            border-radius:8px;
            background:#f2f4f7;
            color:#344054;
            text-align:center;
            font-size:12px;
            font-weight:700
          }
          .dashboard-evento-info{min-width:0;flex:1}
          .dashboard-evento-titulo{
            font-weight:700;
            color:#101828;
            word-break:break-word
          }
          .dashboard-evento-detalhes{
            margin-top:5px;
            color:#667085;
            font-size:12px;
            line-height:1.5;
            word-break:break-word
          }
          @media(max-width:1100px){
            .dashboard-resumo{
              grid-template-columns:repeat(2,minmax(0,1fr))
            }
          }
          @media(max-width:850px){
            .dashboard-conteudo,.dashboard-eventos{
              grid-template-columns:1fr
            }
            .dashboard-card-agenda{grid-column:auto}
          }
          @media(max-width:600px){
            .dashboard-resumo{grid-template-columns:1fr}
          }
        </style>
        <div class="page-header">
          <div>
            <h2>Visão geral</h2>
            <p>
              Acompanhe funcionários ativos, declarações,
              faltas e compromissos da agenda.
            </p>
          </div>
          <div class="actions no-print">
            <a
              class="btn btn-primary"
              href="nova-declaracao.html"
            >
              ＋ Nova Declaração
            </a>
            <a
              class="btn btn-secondary"
              href="novo-funcionario.html"
            >
              ＋ Novo Funcionário
            </a>
          </div>
        </div>
        <div class="dashboard-resumo">
          ${this.statCard(
            "Funcionários ativos",
            ativos.length,
            "👥"
          )}
          ${this.statCard(
            "Declarações",
            declaracoes.length,
            "📄"
          )}
          ${this.statCard(
            "Faltas registradas",
            faltas.length,
            "📅"
          )}
          ${this.statCard(
            "Próximos eventos",
            eventos.length,
            "🗓️"
          )}
        </div>
        <div class="dashboard-conteudo">
          <section class="card panel dashboard-card">
            <div class="dashboard-panel-header">
              <h3>📄 Declarações recentes</h3>
              <a
                class="btn btn-secondary btn-sm"
                href="declaracoes.html"
              >
                Ver todas
              </a>
            </div>
            ${this.tabelaDeclaracoes(declaracoes, mapa)}
          </section>
          <section class="card panel dashboard-card">
            <div class="dashboard-panel-header">
              <h3>📅 Faltas recentes</h3>
              <a
                class="btn btn-secondary btn-sm"
                href="faltas.html"
              >
                Ver todas
              </a>
            </div>
            ${this.tabelaFaltas(faltas, mapa)}
          </section>
          <section
            class="card panel dashboard-card dashboard-card-agenda"
          >
            <div class="dashboard-panel-header">
              <h3>🗓️ Próximos eventos da agenda</h3>
              <a
                class="btn btn-secondary btn-sm"
                href="agenda.html"
              >
                Abrir agenda
              </a>
            </div>
            ${this.listaAgenda(eventos)}
          </section>
        </div>
        `
      );
    } catch (erro) {
      console.error(erro);
      App.toast(
        "Erro ao carregar o dashboard: " +
        (erro.message || erro),
        "danger"
      );
    }
  },
  dataHojeLocal() {
    const a = new Date();
    return (
      `${a.getFullYear()}-` +
      `${String(a.getMonth() + 1).padStart(2, "0")}-` +
      `${String(a.getDate()).padStart(2, "0")}`
    );
  },
  statCard(label, value, icon) {
    return `
      <div class="card stat-card">
        <div>
          <div class="stat-label">
            ${App.escapeHTML(label)}
          </div>
          <div class="stat-value">
            ${value}
          </div>
        </div>
        <div class="stat-icon">
          ${icon}
        </div>
      </div>
    `;
  },
  nomeFuncionario(f) {
    return f?.nome || f?.nome_completo || "Funcionário não encontrado";
  },
  dataDeclaracao(x) {
    return (
      x.data ||
      x.dataInicio ||
      x.data_inicio ||
      x.dataInicial ||
      x.data_inicial ||
      ""
    );
  },
  tabelaDeclaracoes(declaracoes, mapa) {
    const registros = [...declaracoes]
      .sort((a, b) => {
        const dataA = String(this.dataDeclaracao(a));
        const dataB = String(this.dataDeclaracao(b));
        return (
          dataB.localeCompare(dataA) ||
          String(b.id || "").localeCompare(String(a.id || ""))
        );
      })
      .slice(0, 6);
    if (!registros.length) {
      return `
        <div class="dashboard-empty">
          Nenhuma declaração registrada.
        </div>
      `;
    }
    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Funcionário</th>
              <th>Tipo</th>
              <th>Data</th>
              <th>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            ${registros.map(x => {
              const f = mapa[
                String(x.funcionarioId ?? x.funcionario_id)
              ];
              const horas = String(x.tipo || "").toLowerCase() === "horas";
              const qtd = horas
                ? `${Number(
                    x.quantidadeHoras ?? x.quantidade_horas ?? 0
                  )} h`
                : `${Number(
                    x.quantidadeDias ?? x.quantidade_dias ?? 0
                  )} dia(s)`;
              return `
                <tr>
                  <td>
                    <strong>
                      ${App.escapeHTML(this.nomeFuncionario(f))}
                    </strong>
                  </td>
                  <td>
                    <span class="badge ${
                      horas ? "badge-hours" : "badge-days"
                    }">
                      ${horas ? "Horas" : "Dias"}
                    </span>
                  </td>
                  <td>
                    ${App.formatDate(this.dataDeclaracao(x))}
                  </td>
                  <td>${qtd}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  },
  tabelaFaltas(faltas, mapa) {
    const registros = [...faltas]
      .sort((a, b) => {
        return (
          String(b.data ?? b.data_falta ?? "")
            .localeCompare(String(a.data ?? a.data_falta ?? "")) ||
          String(b.id || "").localeCompare(String(a.id || ""))
        );
      })
      .slice(0, 6);
    if (!registros.length) {
      return `
        <div class="dashboard-empty">
          Nenhuma falta registrada.
        </div>
      `;
    }
    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Funcionário</th>
              <th>Data</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            ${registros.map(x => {
              const f = mapa[
                String(x.funcionarioId ?? x.funcionario_id)
              ];
              return `
                <tr>
                  <td>
                    <strong>
                      ${App.escapeHTML(this.nomeFuncionario(f))}
                    </strong>
                  </td>
                  <td>
                    ${App.formatDate(x.data ?? x.data_falta)}
                  </td>
                  <td>
                    <span class="badge badge-days">
                      ${App.escapeHTML(
                        x.tipo ?? x.motivo ?? "Falta"
                      )}
                    </span>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  },
  chaveAgenda(x) {
    return (
      `${String(x.data || "9999-12-31").slice(0, 10)} ` +
      `${String(x.hora_inicio || "23:59:59")}`
    );
  },
  horaAgenda(v) {
    return v ? String(v).slice(0, 5) : "";
  },
  listaAgenda(eventos) {
    const registros = [...eventos].slice(0, 6);
    if (!registros.length) {
      return `
        <div class="dashboard-empty">
          Nenhum evento futuro cadastrado na agenda.
        </div>
      `;
    }
    return `
      <div class="dashboard-eventos">
        ${registros.map(x => {
          const inicio = this.horaAgenda(x.hora_inicio);
          const fim = this.horaAgenda(x.hora_fim);
          const horario = inicio && fim
            ? `${inicio} às ${fim}`
            : inicio || "Horário não informado";
          return `
            <div class="dashboard-evento">
              <div class="dashboard-evento-data">
                ${App.formatDate(x.data)}
              </div>
              <div class="dashboard-evento-info">
                <div class="dashboard-evento-titulo">
                  ${App.escapeHTML(x.titulo || "Evento")}
                </div>
                <div class="dashboard-evento-detalhes">
                  🕒 ${App.escapeHTML(horario)}
                  ${x.local
                    ? ` &nbsp; • &nbsp; 📍 ${App.escapeHTML(x.local)}`
                    : ""}
                  ${x.categoria
                    ? ` &nbsp; • &nbsp; ${App.escapeHTML(x.categoria)}`
                    : ""}
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }
};

/* Ações delegadas: dados nunca são transformados em código JavaScript inline. */
document.addEventListener("click", async e => {
  const b = e.target?.closest?.("[data-acao-sistema]");
  if (!b || b.disabled) return;
  e.preventDefault();
  const id = b.dataset.id;
  b.disabled = true;
  try {
    switch (b.dataset.acaoSistema) {
      case "funcionario-status": await FuncionariosPage.alternarStatus(App.safeId(id, "funcionarios")); break;
      case "funcionario-excluir": await FuncionariosPage.deleteItem(App.safeId(id, "funcionarios")); break;
      case "falta-excluir": await FaltasPage.excluir(App.safeId(id, "faltas")); break;
      case "declaracao-anexo": await DeclaracoesPage.verAnexo(App.safeId(id, "declaracoes")); break;
      case "declaracao-excluir": await DeclaracoesPage.excluir(App.safeId(id, "declaracoes")); break;
      case "declaracao-anexo-atual": await NovaDeclaracaoPage.verAnexoAtual(); break;
    }
  } catch (erro) { App.toast(erro.message || "Operação não concluída.", "danger"); }
  finally { b.disabled = false; }
});



