/* ===============================================================
   APP.JS — E.M. PROFª EUNICE CARNEIRO
   Atualização: acesso ao módulo Históricos Escolares no menu.
   Mantém autenticação, Supabase, funcionários, declarações,
   faltas, agenda, relatórios e Dashboard.
   Os dados dos estudantes dependem de RLS no Supabase.
================================================================ */

const SUPABASE_URL = "https://cujlebxqqposqomtfvdk.supabase.co";
const SUPABASE_KEY = "sb_publishable_qgZR9bAPNGjYoG-2i_Z5Jg_1Rg3UzBx";
const AUTH_SESSION_KEY = "eunice_auth_session";
const AUTH_PROFILE_KEY = "eunice_auth_profile";
const AUTH_ACCESS_KEY = "eunice_access_id";

function authGetSession() {
  try { return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null"); }
  catch { return null; }
}

function authSetSession(x) {
  if (x) localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(x));
  else localStorage.removeItem(AUTH_SESSION_KEY);
}

function authGetProfile() {
  try { return JSON.parse(localStorage.getItem(AUTH_PROFILE_KEY) || "null"); }
  catch { return null; }
}

function authSetProfile(x) {
  if (x) localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(x));
  else localStorage.removeItem(AUTH_PROFILE_KEY);
}

function authGetAccessId() {
  return localStorage.getItem(AUTH_ACCESS_KEY) || "";
}

function authSetAccessId(id) {
  if (id) localStorage.setItem(AUTH_ACCESS_KEY, id);
  else localStorage.removeItem(AUTH_ACCESS_KEY);
}

function authToken() {
  return authGetSession()?.access_token || "";
}

/* ===============================================================
   PROTEÇÃO INICIAL DAS PÁGINAS
================================================================ */

(function protegerPaginaAgora() {
  const arquivo = (
    location.pathname.split("/").pop() || "index.html"
  ).toLowerCase();

  if (arquivo === "login.html") return;

  if (!authGetSession()?.access_token) {
    const next = encodeURIComponent(
      (location.pathname.split("/").pop() || "index.html")
      + location.search
    );

    location.replace(`login.html?next=${next}`);
  }
})();

/* ===============================================================
   APLICAÇÃO PRINCIPAL
================================================================ */

const App = (() => {

  /* =============================================================
     MENU LATERAL
  ============================================================= */

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

    /*
      NOVO MÓDULO: HISTÓRICOS ESCOLARES

      Visível apenas para:
      - Administrador
      - Secretaria

      A restrição real aos dados depende também
      das políticas RLS configuradas no Supabase.
    */

    if (
      ["administrador", "secretaria"].includes(perfil?.perfil)
      &&
      perfil?.ativo !== false
    ) {
      nav.push({
        key: "historicos",
        href: "historicos.html",
        icon: "🎓",
        label: "Históricos Escolares"
      });
    }

    /* MENU EXCLUSIVO DO ADMINISTRADOR */

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

  /* =============================================================
     UTILITÁRIOS
  ============================================================= */

  function escapeHTML(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(dateValue) {
    if (!dateValue) return "—";

    const [y, m, d] = String(dateValue)
      .slice(0, 10)
      .split("-");

    return y && m && d
      ? `${d}/${m}/${y}`
      : dateValue;
  }

  function getPageKey() {
    return document.body.dataset.page || "";
  }

  /* =============================================================
     LAYOUT GERAL DO SISTEMA
  ============================================================= */

  function layout(title, subtitle, content) {
    const page = getPageKey();

    document.title = `${title} | Sistema de Declarações`;

    document.getElementById("app").innerHTML = `
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
            ${getNav().map(item => `
              <a
                href="${item.href}"
                class="${item.key === page ? "active" : ""}"
              >
                <span class="nav-icon">${item.icon}</span>
                <span>${item.label}</span>
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
              >
                ☰
              </button>

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

    /* MENU MOBILE */

    document
      .getElementById("menuToggle")
      ?.addEventListener("click", () => {
        document
          .getElementById("sidebar")
          ?.classList.toggle("open");
      });

    /* BOTÃO SAIR */

    document
      .getElementById("btnSairSistema")
      ?.addEventListener("click", () => logout());
  }

  /* =============================================================
     MODAIS
  ============================================================= */

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
            >
              ×
            </button>

          </div>

          <div class="modal-body">
            ${body}
          </div>

          ${
            footer
              ? `<div class="modal-footer">${footer}</div>`
              : ""
          }

        </div>

      </div>
    `;

    root
      .querySelectorAll("[data-close-modal]")
      .forEach(b => b.addEventListener("click", closeModal));

    root
      .querySelector("#modalBackdrop")
      ?.addEventListener("click", e => {
        if (e.target.id === "modalBackdrop") {
          closeModal();
        }
      });

    document.addEventListener("keydown", escClose);
  }

  function escClose(e) {
    if (e.key === "Escape") {
      closeModal();
    }
  }

  function closeModal() {
    const root = document.getElementById("modalRoot");

    if (root) {
      root.innerHTML = "";
    }

    document.removeEventListener("keydown", escClose);
  }

  /* =============================================================
     NOTIFICAÇÕES
  ============================================================= */

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

    const item = document.createElement("div");

    const map = {
      success: "alert-success",
      warning: "alert-warning",
      danger: "alert-danger",
      info: "alert-info"
    };

    item.className = `alert ${map[type] || map.info}`;

    item.style.cssText +=
      "box-shadow:0 12px 30px rgba(16,24,40,.14);" +
      "max-width:360px;margin:0;";

    item.innerHTML = escapeHTML(message);

    root.appendChild(item);

    setTimeout(() => item.remove(), 3200);
  }

  /* =============================================================
     INTEGRAÇÃO COM SUPABASE
  ============================================================= */

  const API = SUPABASE_URL + "/rest/v1";

  async function refreshSession() {
    const atual = authGetSession();

    if (!atual?.refresh_token) {
      return null;
    }

    const res = await fetch(
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

    if (!res.ok) {
      return null;
    }

    const nova = await res.json();

    authSetSession(nova);

    return nova;
  }

  /* =============================================================
     REQUISIÇÕES
  ============================================================= */

  async function api(path, options = {}, retry = true) {
    const token = authToken();

    const headers = {
      apikey: SUPABASE_KEY,

      Authorization: `Bearer ${token || SUPABASE_KEY}`,

      "Content-Type": "application/json",

      ...(options.headers || {})
    };

    const res = await fetch(
      API + path,
      {
        ...options,
        headers
      }
    );

    if (res.status === 401 && retry) {
      const nova = await refreshSession();

      if (nova?.access_token) {
        return api(path, options, false);
      }

      await logout(false);

      throw new Error(
        "Sessão expirada. Entre novamente."
      );
    }

    if (!res.ok) {
      throw new Error(
        (await res.text()) || "Erro no Supabase"
      );
    }

    const texto = await res.text();

    return texto ? JSON.parse(texto) : null;
  }

  /* =============================================================
     PERFIL DO USUÁRIO
  ============================================================= */

  async function carregarPerfilAtual() {
    const sessao = authGetSession();

    if (!sessao?.access_token) {
      return null;
    }

    try {
      let token = authToken();

      let userRes = await fetch(
        `${SUPABASE_URL}/auth/v1/user`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!userRes.ok) {
        const nova = await refreshSession();

        if (!nova?.access_token) {
          return null;
        }

        token = nova.access_token;

        userRes = await fetch(
          `${SUPABASE_URL}/auth/v1/user`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${token}`
            }
          }
        );
      }

      if (!userRes.ok) {
        return null;
      }

      const user = await userRes.json();

      authSetSession({
        ...(authGetSession() || {}),
        user
      });

      const resposta = await api(
        `/usuarios_perfis?id=eq.${encodeURIComponent(user.id)}&select=*`
      );

      const perfil = resposta?.[0] || null;

      if (perfil) {
        authSetProfile(perfil);
      }

      return perfil;

    } catch {
      return null;
    }
  }

  /* =============================================================
     CONTROLE DE ATIVIDADE
  ============================================================= */

  async function atualizarAtividade() {
    const id = authGetAccessId();

    if (!id || !authToken()) {
      return;
    }

    try {
      await api(
        `/acessos?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",

          headers: {
            Prefer: "return=minimal"
          },

          body: JSON.stringify({
            ultima_atividade: new Date().toISOString(),

            pagina_atual:
              location.pathname.split("/").pop() ||
              "index.html"
          })
        }
      );

      const perfil = await carregarPerfilAtual();

      if (perfil && perfil.ativo === false) {
        await logout(false);

        location.replace("login.html");
      }

    } catch {
      /*
        Um erro ao atualizar a presença online
        não deve interromper a página.
      */
    }
  }

  /* =============================================================
     LOGOUT
  ============================================================= */

  async function logout(redirecionar = true) {
    const accessId = authGetAccessId();
    const token = authToken();

    try {
      if (accessId && token) {
        await api(
          `/acessos?id=eq.${encodeURIComponent(accessId)}`,
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
        await fetch(
          `${SUPABASE_URL}/auth/v1/logout`,
          {
            method: "POST",

            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
    } catch {}

    authSetSession(null);
    authSetProfile(null);
    authSetAccessId("");

    if (redirecionar) {
      location.replace("login.html");
    }
  }

  /* =============================================================
     GERADOR DE IDENTIFICADOR
  ============================================================= */

  function generateId() {
    return (
      Math.floor(Date.now() / 1000) +
      Math.floor(Math.random() * 1000)
    );
  }

  /* =============================================================
     CONVERTER DADOS DO BANCO PARA O SISTEMA
  ============================================================= */

  function fromDB(store, x) {
    if (!x) {
      return x;
    }

    /* FUNCIONÁRIOS */

    if (store === "funcionarios") {
      return {
        id: String(x.id),

        nome:
          x.nome_completo ||
          x.nome ||
          "",

        matricula: x.matricula || "",

        cargo:
          x.cargo_funcao ||
          x.cargo ||
          "",

        categoriaCargo: x.categoria_cargo || "",
        setor: x.setor || "",

        vinculo:
          x.tipo_vinculo ||
          x.vinculo ||
          "",

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

    /* DECLARAÇÕES */

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

    /* FALTAS */

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

    /* AGENDA E DEMAIS TABELAS */

    return {
      ...x,
      id: String(x.id)
    };
  }

  /* =============================================================
     CONVERTER DADOS DO SISTEMA PARA O BANCO
  ============================================================= */

  function toDB(store, x) {

    /* FUNCIONÁRIOS */

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

    /* DECLARAÇÕES */

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

    /* FALTAS */

    if (store === "faltas") {
      return {
        id: x.id ? Number(x.id) : generateId(),

        funcionario_id:
          x.funcionario_id ||
          x.funcionarioId,

        data_falta:
          x.data_falta ||
          x.data,

        motivo:
          x.motivo ||
          x.tipo ||
          "Falta Injustificada",

        justificativa: x.justificativa || null
      };
    }

    /* AGENDA E DEMAIS TABELAS */

    const payload = {
      ...x
    };

    if (!payload.id) {
      payload.id = generateId();
    }

    return payload;
  }

  /* =============================================================
     ADICIONAR REGISTRO
  ============================================================= */

  async function add(store, value) {
    const payload = toDB(store, value);

    const response = await api(
      `/${store}`,
      {
        method: "POST",

        headers: {
          Prefer: "return=representation"
        },

        body: JSON.stringify(payload)
      }
    );

    return fromDB(
      store,
      (Array.isArray(response) ? response[0] : response) ||
      payload
    );
  }

  /* =============================================================
     ATUALIZAR REGISTRO
  ============================================================= */

  async function put(store, value) {
    if (!value.id) {
      return add(store, value);
    }

    const payload = toDB(store, value);

    const response = await api(
      `/${store}?id=eq.${encodeURIComponent(value.id)}`,
      {
        method: "PATCH",

        headers: {
          Prefer: "return=representation"
        },

        body: JSON.stringify(payload)
      }
    );

    return fromDB(
      store,
      (Array.isArray(response) ? response[0] : response) ||
      value
    );
  }

  /* =============================================================
     BUSCAR UM REGISTRO
  ============================================================= */

  async function get(store, key) {
    const response = await api(
      `/${store}?id=eq.${encodeURIComponent(key)}&select=*`
    );

    return fromDB(
      store,
      response?.[0] || null
    );
  }

  /* =============================================================
     BUSCAR TODOS OS REGISTROS
  ============================================================= */

  async function getAll(store) {
    const response = await api(
      `/${store}?select=*&order=id.asc`
    );

    return (response || []).map(
      x => fromDB(store, x)
    );
  }

  /* =============================================================
     EXCLUIR REGISTRO
  ============================================================= */

  async function remove(store, key) {
    await api(
      `/${store}?id=eq.${encodeURIComponent(key)}`,
      {
        method: "DELETE"
      }
    );

    return true;
  }

  /* =============================================================
     CONTADORES
  ============================================================= */

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

  /* =============================================================
     FUNÇÕES DISPONÍVEIS PARA OUTRAS PÁGINAS
  ============================================================= */

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

    uid: () => generateId(),

    rest: api,

    getSession: authGetSession,
    getProfile: authGetProfile,
    getAccessToken: authToken,

    carregarPerfilAtual,
    atualizarAtividade,
    logout
  };

})();

/* ===============================================================
   VALIDAR SESSÃO E MANTER USUÁRIO ONLINE
================================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const perfil = await App.carregarPerfilAtual();

  if (!perfil || perfil.ativo === false) {
    await App.logout();
    return;
  }

  await App.atualizarAtividade();

  setInterval(
    () => App.atualizarAtividade(),
    60000
  );
});

/* ===============================================================
   DASHBOARD
   - Funcionários ativos
   - Declarações recentes
   - Faltas recentes
   - Próximos eventos
================================================================ */

const DashboardPage = {

  /* =============================================================
     INICIAR DASHBOARD
  ============================================================= */

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

      /* SOMENTE FUNCIONÁRIOS ATIVOS NO INDICADOR */

      const ativos = funcionarios.filter(
        f => String(f.status || "Ativo")
          .trim()
          .toLowerCase() === "ativo"
      );

      /* MAPA DOS FUNCIONÁRIOS */

      const mapa = Object.fromEntries(
        funcionarios.map(
          f => [String(f.id), f]
        )
      );

      /* PRÓXIMOS EVENTOS DA AGENDA */

      const hoje = this.dataHojeLocal();

      const eventos = agenda
        .filter(
          x => String(x.data || "")
            .slice(0, 10) >= hoje
        )
        .sort(
          (a, b) =>
            this.chaveAgenda(a).localeCompare(
              this.chaveAgenda(b)
            )
        );

      /* LAYOUT DO DASHBOARD */

      App.layout(
        "Dashboard",
        "Visão geral do sistema interno de declarações",
        `

        <style>

          .dashboard-resumo {
            display:grid;
            grid-template-columns:repeat(4,minmax(0,1fr));
            gap:16px;
            margin-bottom:22px;
          }

          .dashboard-conteudo {
            display:grid;
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:18px;
          }

          .dashboard-card {
            min-width:0;
          }

          .dashboard-card-agenda {
            grid-column:1/-1;
          }

          .dashboard-panel-header {
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:12px;
            margin-bottom:16px;
          }

          .dashboard-panel-header h3 {
            margin:0;
          }

          .dashboard-empty {
            padding:30px 15px;
            text-align:center;
            color:#667085;
          }

          .dashboard-eventos {
            display:grid;
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:10px;
          }

          .dashboard-evento {
            display:flex;
            gap:12px;
            align-items:flex-start;
            padding:14px;
            border:1px solid #e4e7ec;
            border-radius:10px;
            background:#fff;
            min-width:0;
          }

          .dashboard-evento-data {
            flex:0 0 auto;
            min-width:82px;
            padding:8px;
            border-radius:8px;
            background:#f2f4f7;
            color:#344054;
            text-align:center;
            font-size:12px;
            font-weight:700;
          }

          .dashboard-evento-info {
            min-width:0;
            flex:1;
          }

          .dashboard-evento-titulo {
            font-weight:700;
            color:#101828;
            word-break:break-word;
          }

          .dashboard-evento-detalhes {
            margin-top:5px;
            color:#667085;
            font-size:12px;
            line-height:1.5;
            word-break:break-word;
          }

          @media(max-width:1100px) {
            .dashboard-resumo {
              grid-template-columns:repeat(2,minmax(0,1fr));
            }
          }

          @media(max-width:850px) {
            .dashboard-conteudo,
            .dashboard-eventos {
              grid-template-columns:1fr;
            }

            .dashboard-card-agenda {
              grid-column:auto;
            }
          }

          @media(max-width:600px) {
            .dashboard-resumo {
              grid-template-columns:1fr;
            }
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

        <!-- INDICADORES -->

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

        <!-- CONTEÚDO -->

        <div class="dashboard-conteudo">

          <!-- DECLARAÇÕES RECENTES -->

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

            ${this.tabelaDeclaracoes(
              declaracoes,
              mapa
            )}

          </section>

          <!-- FALTAS RECENTES -->

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

            ${this.tabelaFaltas(
              faltas,
              mapa
            )}

          </section>

          <!-- AGENDA -->

          <section
            class="
              card
              panel
              dashboard-card
              dashboard-card-agenda
            "
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

  /* =============================================================
     DATA ATUAL LOCAL
  ============================================================= */

  dataHojeLocal() {
    const a = new Date();

    return (
      `${a.getFullYear()}-` +
      `${String(a.getMonth() + 1).padStart(2, "0")}-` +
      `${String(a.getDate()).padStart(2, "0")}`
    );
  },

  /* =============================================================
     CARTÃO DE INDICADOR
  ============================================================= */

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

  /* =============================================================
     NOME DO FUNCIONÁRIO
  ============================================================= */

  nomeFuncionario(f) {
    return (
      f?.nome ||
      f?.nome_completo ||
      "Funcionário não encontrado"
    );
  },

  /* =============================================================
     DATA DA DECLARAÇÃO
  ============================================================= */

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

  /* =============================================================
     DECLARAÇÕES RECENTES
  ============================================================= */

  tabelaDeclaracoes(declaracoes, mapa) {
    const registros = [...declaracoes]
      .sort((a, b) => {
        const delta = String(
          this.dataDeclaracao(b)
        ).localeCompare(
          String(this.dataDeclaracao(a))
        );

        return