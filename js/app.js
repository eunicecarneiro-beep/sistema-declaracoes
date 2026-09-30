const SUPABASE_URL = "https://cujlebxqqposqomtfvdk.supabase.co";
const SUPABASE_KEY = "sb_publishable_qgZR9bAPNGjYoG-2i_Z5Jg_1Rg3UzBx";

const AUTH_SESSION_KEY = "eunice_auth_session";
const AUTH_PROFILE_KEY = "eunice_auth_profile";
const AUTH_ACCESS_KEY = "eunice_access_id";

function authGetSession() {
  try {
    return JSON.parse(
      localStorage.getItem(AUTH_SESSION_KEY) || "null"
    );
  } catch {
    return null;
  }
}

function authSetSession(session) {
  if (session) {
    localStorage.setItem(
      AUTH_SESSION_KEY,
      JSON.stringify(session)
    );
  } else {
    localStorage.removeItem(AUTH_SESSION_KEY);
  }
}

function authGetProfile() {
  try {
    return JSON.parse(
      localStorage.getItem(AUTH_PROFILE_KEY) || "null"
    );
  } catch {
    return null;
  }
}

function authSetProfile(profile) {
  if (profile) {
    localStorage.setItem(
      AUTH_PROFILE_KEY,
      JSON.stringify(profile)
    );
  } else {
    localStorage.removeItem(AUTH_PROFILE_KEY);
  }
}

function authGetAccessId() {
  return localStorage.getItem(AUTH_ACCESS_KEY) || "";
}

function authSetAccessId(id) {
  if (id) {
    localStorage.setItem(
      AUTH_ACCESS_KEY,
      id
    );
  } else {
    localStorage.removeItem(AUTH_ACCESS_KEY);
  }
}

function authToken() {
  return authGetSession()?.access_token || "";
}


/* =========================================================
   PROTEÇÃO DAS PÁGINAS
   ========================================================= */

(function protegerPaginaAgora() {

  const arquivo =
    (
      location.pathname
        .split("/")
        .pop()
      ||
      "index.html"
    ).toLowerCase();


  if (
    arquivo ===
    "login.html"
  ) {
    return;
  }


  const sessao =
    authGetSession();


  if (
    !sessao?.access_token
  ) {

    const next =
      encodeURIComponent(

        (
          location.pathname
            .split("/")
            .pop()
          ||
          "index.html"
        )

        +

        location.search

      );


    location.replace(
      `login.html?next=${next}`
    );

  }

})();


/* =========================================================
   APP
   ========================================================= */

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

    const nav =
      [...NAV];


    const perfil =
      authGetProfile();


    if (
      perfil?.perfil ===
      "administrador"
    ) {

      nav.push({

        key: "usuarios",

        href:
          "usuarios.html",

        icon:
          "👤",

        label:
          "Usuários"

      });


      nav.push({

        key:
          "acessos",

        href:
          "acessos.html",

        icon:
          "🔐",

        label:
          "Acessos"

      });

    }


    return nav;

  }


  function escapeHTML(
    value = ""
  ) {

    return String(value)

      .replace(
        /&/g,
        "&amp;"
      )

      .replace(
        /</g,
        "&lt;"
      )

      .replace(
        />/g,
        "&gt;"
      )

      .replace(
        /"/g,
        "&quot;"
      )

      .replace(
        /'/g,
        "&#039;"
      );

  }


  function formatDate(
    dateValue
  ) {

    if (!dateValue) {
      return "—";
    }


    const [
      y,
      m,
      d
    ] =
      String(dateValue)

        .slice(
          0,
          10
        )

        .split("-");


    if (
      !y ||
      !m ||
      !d
    ) {

      return dateValue;

    }


    return `${d}/${m}/${y}`;

  }


  function getPageKey() {

    return (
      document.body
        .dataset
        .page
      ||
      ""
    );

  }


  /* =======================================================
     LAYOUT GERAL
     ======================================================= */

  function layout(
    title,
    subtitle,
    content
  ) {

    const page =
      getPageKey();


    document.title =
      `${title} | Sistema de Declarações`;


    document
      .getElementById(
        "app"
      )
      .innerHTML = `

      <div class="app-shell">

        <aside
          class="sidebar"
          id="sidebar"
        >

          <div class="brand">

            <div class="brand-mark">
              EC
            </div>


            <div class="brand-text">

              <strong>
                Sistema de Declarações
              </strong>

              <span>
                E.M. Profª Eunice Carneiro
              </span>

            </div>

          </div>


          <nav class="nav">

            ${getNav().map(
              item => `

                <a

                  href="${item.href}"

                  class="${
                    item.key === page
                      ? "active"
                      : ""
                  }"

                >

                  <span
                    class="nav-icon"
                  >
                    ${item.icon}
                  </span>

                  <span>
                    ${item.label}
                  </span>

                </a>

              `
            ).join("")}

          </nav>


          <div
            class="sidebar-footer"
          >
            Banco de dados online • Supabase
          </div>

        </aside>


        <main class="main">


          <header class="topbar">


            <div
              style="
                display:flex;
                align-items:center;
                gap:12px;
              "
            >

              <button

                class="menu-toggle"

                id="menuToggle"

                aria-label="Abrir menu"

              >
                ☰
              </button>


              <div class="topbar-title">

                <h1>
                  ${escapeHTML(title)}
                </h1>

                <p>
                  ${escapeHTML(subtitle)}
                </p>

              </div>

            </div>


            <div

              class="no-print"

              style="
                display:flex;
                gap:8px;
                align-items:center;
              "

            >

              <span

                style="
                  font-size:13px;
                  color:#667085;
                "

              >

                👤 ${
                  escapeHTML(

                    authGetProfile()?.nome

                    ||

                    authGetProfile()?.username

                    ||

                    "Usuário"

                  )
                }

              </span>


              <a

                class="
                  btn
                  btn-secondary
                  btn-sm
                "

                href="nova-declaracao.html"

              >

                ＋ Nova declaração

              </a>


              <button

                class="
                  btn
                  btn-secondary
                  btn-sm
                "

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


    document

      .getElementById(
        "menuToggle"
      )

      ?.addEventListener(

        "click",

        () => {

          document
            .getElementById(
              "sidebar"
            )
            ?.classList.toggle(
              "open"
            );

        }

      );


    document

      .getElementById(
        "btnSairSistema"
      )

      ?.addEventListener(

        "click",

        () =>
          logout()

      );

  }


  /* =======================================================
     MODAL
     ======================================================= */

  function openModal({

    title,

    body,

    footer = ""

  }) {

    const root =
      document
        .getElementById(
          "modalRoot"
        );


    root.innerHTML = `

      <div

        class="
          modal-backdrop
          show
        "

        id="modalBackdrop"

      >

        <div

          class="modal"

          role="dialog"

          aria-modal="true"

        >


          <div class="modal-header">

            <h3>
              ${title}
            </h3>


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

              ? `

                <div class="modal-footer">

                  ${footer}

                </div>

              `

              : ""
          }


        </div>

      </div>

    `;


    root

      .querySelectorAll(
        "[data-close-modal]"
      )

      .forEach(

        btn =>

          btn.addEventListener(

            "click",

            closeModal

          )

      );


    root

      .querySelector(
        "#modalBackdrop"
      )

      ?.addEventListener(

        "click",

        e => {

          if (

            e.target.id ===
            "modalBackdrop"

          ) {

            closeModal();

          }

        }

      );


    document.addEventListener(

      "keydown",

      escClose

    );

  }


  function escClose(e) {

    if (
      e.key ===
      "Escape"
    ) {

      closeModal();

    }

  }


  function closeModal() {

    const root =
      document
        .getElementById(
          "modalRoot"
        );


    if (root) {

      root.innerHTML =
        "";

    }


    document.removeEventListener(

      "keydown",

      escClose

    );

  }


  /* =======================================================
     TOAST
     ======================================================= */

  function toast(
    message,
    type = "success"
  ) {

    const id =
      "toastRoot";


    let root =
      document
        .getElementById(
          id
        );


    if (!root) {

      root =
        document
          .createElement(
            "div"
          );


      root.id =
        id;


      root.style.cssText =
        "position:fixed;right:18px;bottom:18px;z-index:5000;display:flex;flex-direction:column;gap:10px";


      document.body
        .appendChild(
          root
        );

    }


    const item =
      document
        .createElement(
          "div"
        );


    const map = {

      success:
        "alert-success",

      warning:
        "alert-warning",

      danger:
        "alert-danger",

      info:
        "alert-info"

    };


    item.className =
      `alert ${
        map[type] ||
        map.info
      }`;


    item.style.cssText +=
      "box-shadow:0 12px 30px rgba(16,24,40,.14);max-width:360px;margin:0;";


    item.innerHTML =
      escapeHTML(
        message
      );


    root.appendChild(
      item
    );


    setTimeout(

      () =>
        item.remove(),

      3200

    );

  }


  const API =
    SUPABASE_URL +
    "/rest/v1";


  /* =======================================================
     RENOVAR SESSÃO
     ======================================================= */

  async function refreshSession() {

    const atual =
      authGetSession();


    if (
      !atual?.refresh_token
    ) {

      return null;

    }


    const res =
      await fetch(

        `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,

        {

          method:
            "POST",

          headers: {

            apikey:
              SUPABASE_KEY,

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              refresh_token:
                atual.refresh_token

            })

        }

      );


    if (!res.ok) {

      return null;

    }


    const nova =
      await res.json();


    authSetSession(
      nova
    );


    return nova;

  }


  /* =======================================================
     API SUPABASE
     ======================================================= */

  async function api(

    path,

    options = {},

    retry = true

  ) {

    const token =
      authToken();


    const headers = {

      apikey:
        SUPABASE_KEY,

      Authorization:
        `Bearer ${
          token ||
          SUPABASE_KEY
        }`,

      "Content-Type":
        "application/json",

      ...(options.headers || {})

    };


    const res =
      await fetch(

        API + path,

        {

          ...options,

          headers

        }

      );


    if (
      res.status ===
      401

      &&

      retry
    ) {

      const nova =
        await refreshSession();


      if (
        nova?.access_token
      ) {

        return api(
          path,
          options,
          false
        );

      }


      await logout(
        false
      );


      throw new Error(
        "Sessão expirada. Entre novamente."
      );

    }


    if (!res.ok) {

      const t =
        await res.text();


      throw new Error(

        t

        ||

        "Erro no Supabase"

      );

    }


    const text =
      await res.text();


    return text

      ? JSON.parse(text)

      : null;

  }


  /* =======================================================
     PERFIL DO USUÁRIO
     ======================================================= */

  async function carregarPerfilAtual() {

    const sessao =
      authGetSession();


    if (
      !sessao?.access_token
    ) {

      return null;

    }


    let uid =
      sessao?.user?.id;


    try {

      let token =
        authToken();


      let userRes =
        await fetch(

          `${SUPABASE_URL}/auth/v1/user`,

          {

            headers: {

              apikey:
                SUPABASE_KEY,

              Authorization:
                `Bearer ${token}`

            }

          }

        );


      if (!userRes.ok) {

        const nova =
          await refreshSession();


        if (
          !nova?.access_token
        ) {

          return null;

        }


        token =
          nova.access_token;


        userRes =
          await fetch(

            `${SUPABASE_URL}/auth/v1/user`,

            {

              headers: {

                apikey:
                  SUPABASE_KEY,

                Authorization:
                  `Bearer ${token}`

              }

            }

          );

      }


      if (!userRes.ok) {

        return null;

      }


      const user =
        await userRes.json();


      uid =
        user.id;


      const atual =
        authGetSession()
        ||
        {};


      atual.user =
        user;


      authSetSession(
        atual
      );


      const r =
        await api(

          `/usuarios_perfis?id=eq.${encodeURIComponent(uid)}&select=*`

        );


      const perfil =
        r?.[0]
        ||
        null;


      if (perfil) {

        authSetProfile(
          perfil
        );

      }


      return perfil;


    } catch {

      return null;

    }

  }


  /* =======================================================
     ATIVIDADE / ONLINE
     ======================================================= */

  async function atualizarAtividade() {

    const id =
      authGetAccessId();


    if (
      !id ||
      !authToken()
    ) {

      return;

    }


    try {

      await api(

        `/acessos?id=eq.${encodeURIComponent(id)}`,

        {

          method:
            "PATCH",

          headers: {

            Prefer:
              "return=minimal"

          },

          body:
            JSON.stringify({

              ultima_atividade:
                new Date()
                  .toISOString(),

              pagina_atual:
                location.pathname
                  .split("/")
                  .pop()
                ||
                "index.html"

            })

        }

      );


      const perfil =
        await carregarPerfilAtual();


      if (
        perfil &&
        perfil.ativo === false
      ) {

        await logout(
          false
        );

        location.replace(
          "login.html"
        );

      }


    } catch {

      // Não interrompe o uso da página
      // somente porque não conseguiu
      // atualizar o status online.

    }

  }


  /* =======================================================
     LOGOUT
     ======================================================= */

  async function logout(
    redirecionar = true
  ) {

    const accessId =
      authGetAccessId();


    const token =
      authToken();


    try {

      if (
        accessId &&
        token
      ) {

        await api(

          `/acessos?id=eq.${encodeURIComponent(accessId)}`,

          {

            method:
              "PATCH",

            headers: {

              Prefer:
                "return=minimal"

            },

            body:
              JSON.stringify({

                saiu_em:
                  new Date()
                    .toISOString(),

                ultima_atividade:
                  new Date()
                    .toISOString()

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

            method:
              "POST",

            headers: {

              apikey:
                SUPABASE_KEY,

              Authorization:
                `Bearer ${token}`

            }

          }

        );

      }

    } catch {}


    authSetSession(
      null
    );


    authSetProfile(
      null
    );


    authSetAccessId(
      ""
    );


    if (redirecionar) {

      location.replace(
        "login.html"
      );

    }

  }


  /* =======================================================
     GERAR ID
     ======================================================= */

  function generateId() {

    return (

      Math.floor(
        Date.now() / 1000
      )

      +

      Math.floor(
        Math.random() * 1000
      )

    );

  }


  /* =======================================================
     BANCO -> SISTEMA
     ======================================================= */

  function fromDB(
    store,
    x
  ) {

    if (!x) {

      return x;

    }


    /* =====================================================
       FUNCIONÁRIOS
       ===================================================== */

    if (
      store ===
      "funcionarios"
    ) {

      return {

        id:
          String(
            x.id
          ),


        nome:
          x.nome_completo
          ||
          x.nome
          ||
          "",


        matricula:
          x.matricula
          ||
          "",


        cargo:
          x.cargo_funcao
          ||
          x.cargo
          ||
          "",


        categoriaCargo:
          x.categoria_cargo
          ||
          "",


        setor:
          x.setor
          ||
          "",


        vinculo:
          x.tipo_vinculo
          ||
          x.vinculo
          ||
          "",


        status:
          x.status
          ||
          "Ativo",


        turno:
          x.turno
          ||
          "",


        cargaHoraria:
          x.carga_horaria
          ||
          "",


        dataAdmissao:
          x.data_admissao
          ||
          "",


        dataEntradaEscola:
          x.data_entrada_escola
          ||
          "",


        cpf:
          x.cpf
          ||
          "",


        telefone:
          x.telefone
          ||
          "",


        email:
          x.email
          ||
          "",


        endereco:
          x.endereco
          ||
          "",


        formacao:
          x.formacao
          ||
          "",


        especializacao:
          x.especializacao
          ||
          "",


        naturalidade:
          x.naturalidade
          ||
          "",


        dataNascimento:
          x.data_nascimento
          ||
          "",


        motivoInatividade:
          x.motivo_inatividade
          ||
          "",


        dataInatividade:
          x.data_inatividade
          ||
          "",


        observacoes:
          x.observacoes
          ||
          ""

      };

    }


    /* =====================================================
       DECLARAÇÕES
       ===================================================== */

    if (
      store ===
      "declaracoes"
    ) {

      return {

        id:
          String(
            x.id
          ),


        funcionarioId:
          String(
            x.funcionario_id
          ),


        tipo:
          x.tipo,


        data:
          x.data,


        dataInicial:
          x.data_inicial,


        dataFinal:
          x.data_final,


        horaInicial:
          x.hora_inicial,


        horaFinal:
          x.hora_final,


        quantidadeHoras:
          x.quantidade_horas,


        quantidadeDias:
          x.quantidade_dias,


        observacoes:
          x.observacoes

      };

    }


    /* =====================================================
       FALTAS
       ===================================================== */

    if (
      store ===
      "faltas"
    ) {

      return {

        id:
          String(
            x.id
          ),


        funcionario_id:
          String(
            x.funcionario_id
          ),


        data_falta:
          x.data_falta,


        motivo:
          x.motivo,


        justificativa:
          x.justificativa,


        createdAt:
          x.created_at

      };

    }


    return {

      ...x,

      id:
        String(
          x.id
        )

    };

  }


  /* =======================================================
     SISTEMA -> BANCO
     ======================================================= */

  function toDB(
    store,
    x
  ) {

    let payload =
      {};


    /* =====================================================
       FUNCIONÁRIOS
       ===================================================== */

    if (
      store ===
      "funcionarios"
    ) {

      payload = {

        id:

          x.id

            ? Number(
                x.id
              )

            : generateId(),


        nome_completo:

          x.nome
          ||
          null,


        matricula:

          x.matricula
          ||
          null,


        cargo_funcao:

          x.cargo
          ||
          null,


        categoria_cargo:

          x.categoriaCargo
          ||
          null,


        setor:

          x.setor
          ||
          null,


        tipo_vinculo:

          x.vinculo
          ||
          null,


        status:

          x.status
          ||
          "Ativo",


        turno:

          x.turno
          ||
          null,


        carga_horaria:

          x.cargaHoraria
          ||
          null,


        data_admissao:

          x.dataAdmissao
          ||
          null,


        data_entrada_escola:

          x.dataEntradaEscola
          ||
          null,


        cpf:

          x.cpf
          ||
          null,


        telefone:

          x.telefone
          ||
          null,


        email:

          x.email
          ||
          null,


        endereco:

          x.endereco
          ||
          null,


        formacao:

          x.formacao
          ||
          null,


        especializacao:

          x.especializacao
          ||
          null,


        naturalidade:

          x.naturalidade
          ||
          null,


        data_nascimento:

          x.dataNascimento
          ||
          null,


        motivo_inatividade:

          x.motivoInatividade
          ||
          null,


        data_inatividade:

          x.dataInatividade
          ||
          null,


        observacoes:

          x.observacoes
          ||
          null

      };

    }


    /* =====================================================
       DECLARAÇÕES
       ===================================================== */

    else if (
      store ===
      "declaracoes"
    ) {

      payload = {

        id:

          x.id

            ? Number(
                x.id
              )

            : generateId(),


        funcionario_id:

          Number(
            x.funcionarioId
          ),


        tipo:

          x.tipo,


        data:

          x.data
          ||
          null,


        data_inicial:

          x.dataInicial
          ||
          null,


        data_final:

          x.dataFinal
          ||
          null,


        hora_inicial:

          x.horaInicial
          ||
          null,


        hora_final:

          x.horaFinal
          ||
          null,


        quantidade_horas:

          x.quantidadeHoras
          ||
          0,


        quantidade_dias:

          x.quantidadeDias
          ||
          0,


        observacoes:

          x.observacoes
          ||
          null

      };

    }


    /* =====================================================
       FALTAS
       ===================================================== */

    else if (
      store ===
      "faltas"
    ) {

      payload = {

        id:

          x.id

            ? Number(
                x.id
              )

            : generateId(),


        funcionario_id:

          x.funcionario_id
          ||
          x.funcionarioId,


        data_falta:

          x.data_falta
          ||
          x.data,


        motivo:

          x.motivo
          ||
          x.tipo
          ||
          "Falta Injustificada",


        justificativa:

          x.justificativa
          ||
          null

      };

    }


    /* =====================================================
       AGENDA / OUTRAS TABELAS
       ===================================================== */

    else {

      payload = {
        ...x
      };


      if (
        !payload.id
      ) {

        payload.id =
          generateId();

      }

    }


    return payload;

  }


  /* =======================================================
     ADICIONAR
     ======================================================= */

  async function add(
    store,
    value
  ) {

    const dataToSend =
      toDB(
        store,
        value
      );


    const r =
      await api(

        `/${store}`,

        {

          method:
            "POST",

          headers: {

            "Prefer":
              "return=representation"

          },

          body:
            JSON.stringify(
              dataToSend
            )

        }

      );


    const item =

      Array.isArray(r)

        ? r[0]

        : r;


    return fromDB(

      store,

      item
      ||
      dataToSend

    );

  }


  /* =======================================================
     ATUALIZAR
     ======================================================= */

  async function put(
    store,
    value
  ) {

    if (
      value.id
    ) {

      const dataToSend =
        toDB(
          store,
          value
        );


      const r =
        await api(

          `/${store}?id=eq.${
            encodeURIComponent(
              value.id
            )
          }`,

          {

            method:
              "PATCH",

            headers: {

              "Prefer":
                "return=representation"

            },

            body:
              JSON.stringify(
                dataToSend
              )

          }

        );


      const item =

        Array.isArray(r)

          ? r[0]

          : r;


      return fromDB(

        store,

        item
        ||
        value

      );

    }


    return add(
      store,
      value
    );

  }


  /* =======================================================
     PEGAR UM REGISTRO
     ======================================================= */

  async function get(
    store,
    key
  ) {

    const r =
      await api(

        `/${store}?id=eq.${
          encodeURIComponent(
            key
          )
        }&select=*`

      );


    return fromDB(

      store,

      r?.[0]
      ||
      null

    );

  }


  /* =======================================================
     PEGAR TODOS
     ======================================================= */

  async function getAll(
    store
  ) {

    const r =
      await api(

        `/${store}?select=*&order=id.asc`

      );


    return (

      r
      ||
      []

    ).map(

      x =>
        fromDB(
          store,
          x
        )

    );

  }


  /* =======================================================
     REMOVER
     ======================================================= */

  async function remove(
    store,
    key
  ) {

    await api(

      `/${store}?id=eq.${
        encodeURIComponent(
          key
        )
      }`,

      {

        method:
          "DELETE"

      }

    );


    return true;

  }


  /* =======================================================
     CONTADORES
     ======================================================= */

  async function counts() {

    const funcionarios =
      await getAll(
        "funcionarios"
      );


    const declaracoes =
      await getAll(
        "declaracoes"
      );


    return {

      funcionarios:
        funcionarios.length,


      declaracoes:
        declaracoes.length,


      horas:

        declaracoes.filter(

          d =>
            d.tipo ===
            "horas"

        ).length,


      dias:

        declaracoes.filter(

          d =>
            d.tipo ===
            "dias"

        ).length,


      listaFuncionarios:
        funcionarios,


      listaDeclaracoes:
        declaracoes

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

    seedDemoData:
      async () => {},

    uid:
      () =>
        generateId(),

    rest:
      api,

    getSession:
      authGetSession,

    getProfile:
      authGetProfile,

    getAccessToken:
      authToken,

    carregarPerfilAtual,

    atualizarAtividade,

    logout

  };

})();


/* =========================================================
   VALIDAR SESSÃO / MANTER ONLINE
   ========================================================= */

document.addEventListener(

  "DOMContentLoaded",

  async () => {

    const perfil =
      await App
        .carregarPerfilAtual();


    if (
      !perfil
      ||
      perfil.ativo === false
    ) {

      await App.logout();

      return;

    }


    await App
      .atualizarAtividade();


    setInterval(

      () =>
        App.atualizarAtividade(),

      60000

    );

  }

);


/* =========================================================
   DASHBOARD
   ========================================================= */

const DashboardPage = {

  async init() {

    try {

      const stats =
        await App.counts();


      App.layout(

        "Dashboard",

        "Visão geral do sistema interno de declarações",

        `

          <div class="page-header">


            <div>

              <h2>
                Visão geral
              </h2>

              <p>
                Acompanhe funcionários
                e documentos cadastrados.
              </p>

            </div>


            <div
              class="actions no-print"
            >

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


          <div class="cards">


            ${this.statCard(

              "Funcionários",

              stats.funcionarios,

              "👥"

            )}


            ${this.statCard(

              "Declarações",

              stats.declaracoes,

              "📄"

            )}


            ${this.statCard(

              "Declarações de Horas",

              stats.horas,

              "◷"

            )}


            ${this.statCard(

              "Declarações de Dias",

              stats.dias,

              "▣"

            )}


          </div>


          <div class="grid-2">


            <section
              class="card panel"
            >


              <div
                class="panel-header"
              >

                <h3>
                  Declarações recentes
                </h3>


                <a

                  href="declaracoes.html"

                  class="
                    btn
                    btn-secondary
                    btn-sm
                  "

                >

                  Ver todas

                </a>

              </div>


              ${this.recentTable(

                stats.listaDeclaracoes,

                stats.listaFuncionarios

              )}


            </section>


            <section
              class="card panel"
            >


              <div
                class="panel-header"
              >

                <h3>
                  Ações rápidas
                </h3>

              </div>


              <div
                class="quick-actions"
              >


                <a
                  href="funcionarios.html"
                >
                  👥 Gerenciar funcionários
                </a>


                <a
                  href="declaracoes.html"
                >
                  📄 Consultar declarações
                </a>


                <a
                  href="agenda.html"
                >
                  🗓️ Abrir Agenda da Escola
                </a>


                <a
                  href="relatorios.html"
                >
                  ▥ Abrir relatórios
                </a>


                <a
                  href="nova-declaracao.html"
                >
                  ＋ Lançar documento
                </a>


              </div>


              <div

                style="margin-top:16px"

                class="alert alert-warning"

              >

                Dados salvos online
                no Supabase.

              </div>


            </section>


          </div>

        `

      );


    } catch (err) {

      console.error(
        err
      );


      App.toast(

        "Erro ao carregar o dashboard: "

        +

        (
          err.message
          ||
          err
        ),

        "danger"

      );

    }

  },


  statCard(
    label,
    value,
    icon
  ) {

    return `

      <div
        class="card stat-card"
      >

        <div>

          <div
            class="stat-label"
          >

            ${App.escapeHTML(
              label
            )}

          </div>


          <div
            class="stat-value"
          >

            ${value}

          </div>

        </div>


        <div
          class="stat-icon"
        >

          ${icon}

        </div>

      </div>

    `;

  },


  recentTable(
    list,
    funcs
  ) {

    const map =
      Object.fromEntries(

        funcs.map(

          f => [

            f.id,

            f

          ]

        )

      );


    const rows =
      [...list]

        .sort(

          (a,b) =>

            String(
              b.id ||
              ""
            )
              .localeCompare(

                String(
                  a.id ||
                  ""
                )

              )

        )

        .slice(
          0,
          8
        );


    if (
      !rows.length
    ) {

      return `

        <div
          class="empty"
        >

          <strong>
            Nenhuma declaração
          </strong>

          Cadastre a primeira declaração
          para começar.

        </div>

      `;

    }


    return `

      <div class="table-wrap">

        <table>


          <thead>

            <tr>

              <th>
                Funcionário
              </th>

              <th>
                Tipo
              </th>

              <th>
                Data
              </th>

              <th>
                Quantidade
              </th>

            </tr>

          </thead>


          <tbody>


            ${rows.map(

              d => {

                const f =
                  map[
                    d.funcionarioId
                  ];


                return `

                  <tr>


                    <td>

                      <strong>

                        ${App.escapeHTML(

                          f?.nome

                          ||

                          "Funcionário removido"

                        )}

                      </strong>

                    </td>


                    <td>

                      <span

                        class="
                          badge
                          ${
                            d.tipo ===
                            "horas"

                              ? "badge-hours"

                              : "badge-days"
                          }
                        "

                      >

                        ${
                          d.tipo ===
                          "horas"

                            ? "Horas"

                            : "Dias"
                        }

                      </span>

                    </td>


                    <td>

                      ${App.formatDate(

                        d.data

                        ||

                        d.dataInicial

                      )}

                    </td>


                    <td>

                      ${
                        d.tipo ===
                        "horas"

                          ? `${
                              d.quantidadeHoras
                              ||
                              0
                            } h`

                          : `${
                              d.quantidadeDias
                              ||
                              0
                            } dia(s)`
                      }

                    </td>


                  </tr>

                `;

              }

            ).join("")}


          </tbody>


        </table>

      </div>

    `;

  }

};