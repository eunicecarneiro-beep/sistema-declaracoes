/* APP.JS — E.M. PROFª EUNICE CARNEIRO
   Atualizado: Documentos de Servidores.
   Mantém integração Supabase, autenticação e Dashboard. */

const SUPABASE_URL = "https://cujlebxqqposqomtfvdk.supabase.co";
const SUPABASE_KEY = "sb_publishable_qgZR9bAPNGjYoG-2i_Z5Jg_1Rg3UzBx";

const AUTH_SESSION_KEY = "eunice_auth_session";
const AUTH_PROFILE_KEY = "eunice_auth_profile";
const AUTH_ACCESS_KEY = "eunice_access_id";

function authGetSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function authSetSession(v) {
  if (v) localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(v));
  else localStorage.removeItem(AUTH_SESSION_KEY);
}

function authGetProfile() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_PROFILE_KEY) || "null");
  } catch {
    return null;
  }
}

function authSetProfile(v) {
  if (v) localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(v));
  else localStorage.removeItem(AUTH_PROFILE_KEY);
}

function authGetAccessId() {
  return localStorage.getItem(AUTH_ACCESS_KEY) || "";
}

function authSetAccessId(v) {
  if (v) localStorage.setItem(AUTH_ACCESS_KEY, v);
  else localStorage.removeItem(AUTH_ACCESS_KEY);
}

function authToken() {
  return authGetSession()?.access_token || "";
}

(function protegerPaginaAgora() {
  const arquivo = (
    location.pathname.split("/").pop() || "index.html"
  ).toLowerCase();

  if (arquivo === "login.html") return;

  if (!authToken()) {
    const next = encodeURIComponent(
      (location.pathname.split("/").pop() || "index.html") +
      location.search
    );

    location.replace(`login.html?next=${next}`);
  }
})();

/* ===================================================
   APLICAÇÃO PRINCIPAL
=================================================== */

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
    const nav = [...NAV];
    const perfil = authGetProfile();

    if (
      ["administrador", "secretaria"].includes(perfil?.perfil) &&
      perfil?.ativo !== false
    ) {
      nav.push({
        key: "documentos-servidores",
        href: "documentos-servidores.html",
        icon: "📝",
        label: "Documentos de Servidores"
      });
    }

    if (perfil?.perfil === "administrador") {
      nav.push({
        key: "usuarios",
        href: "usuarios.html",
        icon: "👤",
        label: "Usuários"
      });

      nav.push({
        key: "acessos",
        href: "acessos.html",
        icon: "🔐",
        label: "Acessos"
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
    if (!v) return "—";

    const [a, m, d] = String(v).slice(0, 10).split("-");

    return a && m && d ? `${d}/${m}/${a}` : v;
  }

  function getPageKey() {
    return document.body.dataset.page || "";
  }

  /* LAYOUT */

  function layout(title, subtitle, content) {
    document.title = `${title} | Sistema de Declarações`;

    const root = document.getElementById("app");

    if (!root) {
      throw new Error("Elemento #app não encontrado.");
    }

    const pagina = getPageKey();

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
            <h3>${title}</h3>
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

    el.innerHTML = escapeHTML(message);

    root.appendChild(el);

    setTimeout(() => el.remove(), 3200);
  }

  /* SUPABASE */

  const API = SUPABASE_URL + "/rest/v1";

  async function refreshSession() {
    const atual = authGetSession();

    if (!atual?.refresh_token) return null;

    const r = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          refresh_token: atual.refresh_token
        })
      }
    );

    if (!r.ok) return null;

    const nova = await r.json();
    authSetSession(nova);

    return nova;
  }

  async function api(path, options = {}, retry = true) {
    const headers = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${authToken() || SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    const r = await fetch(API + path, {
      ...options,
      headers
    });

    if (r.status === 401 && retry) {
      const nova = await refreshSession();

      if (nova?.access_token) {
        return api(path, options, false);
      }

      await logout(false);

      throw new Error("Sessão expirada. Entre novamente.");
    }

    if (!r.ok) {
      throw new Error((await r.text()) || "Erro no Supabase");
    }

    const texto = await r.text();

    return texto ? JSON.parse(texto) : null;
  }

  /* AUTENTICAÇÃO E PERFIL */

  async function carregarPerfilAtual() {
    if (!authGetSession()?.access_token) return null;

    try {
      let token = authToken();

      let r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${token}`
        }
      });

      if (!r.ok) {
        const nova = await refreshSession();

        if (!nova?.access_token) return null;

        token = nova.access_token;

        r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${token}`
          }
        });
      }

      if (!r.ok) return null;

      const user = await r.json();

      authSetSession({
        ...authGetSession(),
        user
      });

      const dados = await api(
        `/usuarios_perfis?id=eq.${encodeURIComponent(user.id)}&select=*`
      );

      const perfil = dados?.[0] || null;

      if (perfil) authSetProfile(perfil);

      return perfil;
    } catch {
      return null;
    }
  }

  async function atualizarAtividade() {
    const id = authGetAccessId();

    if (!id || !authToken()) return;

    try {
      await api(`/acessos?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          ultima_atividade: new Date().toISOString(),
          pagina_atual:
            location.pathname.split("/").pop() || "index.html"
        })
      });

      const perfil = await carregarPerfilAtual();

      if (perfil?.ativo === false) {
        await logout(false);
        location.replace("login.html");
      }
    } catch {
      // Falha ao atualizar atividade não interrompe o sistema.
    }
  }

  async function logout(redirecionar = true) {
    const id = authGetAccessId();
    const token = authToken();

    try {
      if (id && token) {
        await api(
          `/acessos?id=eq.${encodeURIComponent(id)}`,
          {
            method: "PATCH",
            headers: {
              Prefer: "return=minimal"
            },
            body: JSON.stringify({
              saiu_em: new Date().toISOString(),
              ultima_atividade: new Date().toISOString()
            })
          },
          false
        );
      }
    } catch {}

    try {
      if (token) {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch {}

    authSetSession(null);
    authSetProfile(null);
    authSetAccessId("");

    if (redirecionar) location.replace("login.html");
  }

  /* BANCO DE DADOS */

  function generateId() {
    return (
      Math.floor(Date.now() / 1000) +
      Math.floor(Math.random() * 1000)
    );
  }

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
        dataInicial: x.data_inicial,
        dataFinal: x.data_final,
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
      id: String(x.id)
    };
  }

  function toDB(store, x) {
    if (store === "funcionarios") {
      return {
        id: x.id ? Number(x.id) : generateId(),
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
        id: x.id ? Number(x.id) : generateId(),
        funcionario_id: Number(x.funcionarioId),
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
        id: x.id ? Number(x.id) : generateId(),
        funcionario_id: x.funcionario_id || x.funcionarioId,
        data_falta: x.data_falta || x.data,
        motivo:
          x.motivo || x.tipo || "Falta Injustificada",
        justificativa: x.justificativa || null
      };
    }

    const payload = { ...x };

    if (!payload.id) payload.id = generateId();

    return payload;
  }

  async function add(store, value) {
    const d = toDB(store, value);

    const r = await api(`/${store}`, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(d)
    });

    return fromDB(
      store,
      (Array.isArray(r) ? r[0] : r) || d
    );
  }

  async function put(store, value) {
    if (!value.id) return add(store, value);

    const d = toDB(store, value);

    const r = await api(
      `/${store}?id=eq.${encodeURIComponent(value.id)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(d)
      }
    );

    return fromDB(
      store,
      (Array.isArray(r) ? r[0] : r) || value
    );
  }

  async function get(store, key) {
    const r = await api(
      `/${store}?id=eq.${encodeURIComponent(key)}&select=*`
    );

    return fromDB(store, r?.[0] || null);
  }

  async function getAll(store) {
    const r = await api(
      `/${store}?select=*&order=id.asc`
    );

    return (r || []).map(x => fromDB(store, x));
  }

  async function remove(store, key) {
    await api(
      `/${store}?id=eq.${encodeURIComponent(key)}`,
      { method: "DELETE" }
    );

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
    getProfile: authGetProfile,
    getAccessToken: authToken,
    carregarPerfilAtual,
    atualizarAtividade,
    logout
  };
})();

/* MANTER USUÁRIO ONLINE */

document.addEventListener("DOMContentLoaded", async () => {
  const perfil = await App.carregarPerfilAtual();

  if (!perfil || perfil.ativo === false) {
    await App.logout();
    return;
  }

  await App.atualizarAtividade();

  setInterval(() => App.atualizarAtividade(), 60000);
});

/* ===================================================
   DASHBOARD
=================================================== */

const DashboardPage = {
  async init() {
    try {
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