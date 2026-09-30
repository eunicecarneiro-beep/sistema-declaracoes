const LOGIN_SUPABASE_URL =
  "https://cujlebxqqposqomtfvdk.supabase.co";

const LOGIN_SUPABASE_KEY =
  "sb_publishable_qgZR9bAPNGjYoG-2i_Z5Jg_1Rg3UzBx";

const LOGIN_SESSION_KEY =
  "eunice_auth_session";

const LOGIN_PROFILE_KEY =
  "eunice_auth_profile";

const LOGIN_ACCESS_KEY =
  "eunice_access_id";

const LOGIN_DOMAIN =
  "eunicecarneiro.local";


/* =========================================================
   NORMALIZAR USUÁRIO
   ========================================================= */

function normalizarUsuario(valor) {

  return String(
    valor || ""
  )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /\s+/g,
      "."
    )
    .replace(
      /[^a-z0-9._-]/g,
      ""
    );

}


/* =========================================================
   DESCOBRIR E-MAIL DE LOGIN

   Permite:
   admin

   OU:

   e.eunicecarneiro@edu.montesclaros.mg.gov.br
   ========================================================= */

function obterEmailLogin(valor) {

  const texto =
    String(
      valor || ""
    )
      .trim()
      .toLowerCase();


  if (
    texto.includes("@")
  ) {

    return texto;

  }


  const usuario =
    normalizarUsuario(
      texto
    );


  return (
    usuario +
    "@" +
    LOGIN_DOMAIN
  );

}


/* =========================================================
   MENSAGENS
   ========================================================= */

function mensagem(
  texto,
  tipo = "error"
) {

  const el =
    document.getElementById(
      "loginMsg"
    );


  if (!el) {
    return;
  }


  el.textContent =
    texto;


  el.className =
    `login-msg show ${tipo}`;

}


function limparMensagem() {

  const el =
    document.getElementById(
      "loginMsg"
    );


  if (!el) {
    return;
  }


  el.className =
    "login-msg";


  el.textContent =
    "";

}


/* =========================================================
   LOGOUT AUXILIAR
   ========================================================= */

async function authLogout(
  token
) {

  try {

    await fetch(

      `${LOGIN_SUPABASE_URL}/auth/v1/logout`,

      {

        method:
          "POST",

        headers: {

          apikey:
            LOGIN_SUPABASE_KEY,

          Authorization:
            `Bearer ${token}`

        }

      }

    );

  } catch {}

}


/* =========================================================
   ENTRAR
   ========================================================= */

async function entrar(
  usuarioOuEmail,
  senha
) {

  const identificacao =
    String(
      usuarioOuEmail ||
      ""
    ).trim();


  if (!identificacao) {

    throw new Error(
      "Informe seu usuário ou e-mail."
    );

  }


  if (!senha) {

    throw new Error(
      "Informe sua senha."
    );

  }


  const email =
    obterEmailLogin(
      identificacao
    );


  console.log(
    "Tentativa de login:",
    email
  );


  /* =======================================================
     LOGIN SUPABASE AUTH
     ======================================================= */

  const resposta =
    await fetch(

      `${LOGIN_SUPABASE_URL}/auth/v1/token?grant_type=password`,

      {

        method:
          "POST",

        headers: {

          apikey:
            LOGIN_SUPABASE_KEY,

          "Content-Type":
            "application/json"

        },

        body:
          JSON.stringify({

            email:
              email,

            password:
              senha

          })

      }

    );


  if (!resposta.ok) {

    let detalhe =
      "";


    try {

      detalhe =
        await resposta.text();

      console.error(
        "Erro Supabase Auth:",
        detalhe
      );

    } catch {}


    throw new Error(
      "Usuário/e-mail ou senha incorretos."
    );

  }


  const sessao =
    await resposta.json();


  const token =
    sessao.access_token;


  const userId =
    sessao.user?.id;


  if (
    !token ||
    !userId
  ) {

    throw new Error(
      "Não foi possível iniciar a sessão."
    );

  }


  /* =======================================================
     BUSCAR PERFIL
     ======================================================= */

  const perfilResp =
    await fetch(

      `${LOGIN_SUPABASE_URL}/rest/v1/usuarios_perfis` +
      `?id=eq.${encodeURIComponent(userId)}` +
      `&select=*`,

      {

        headers: {

          apikey:
            LOGIN_SUPABASE_KEY,

          Authorization:
            `Bearer ${token}`

        }

      }

    );


  if (!perfilResp.ok) {

    console.error(
      await perfilResp.text()
    );


    await authLogout(
      token
    );


    throw new Error(
      "Seu login existe, mas o perfil de acesso ainda não foi configurado."
    );

  }


  const perfis =
    await perfilResp.json();


  const perfil =
    perfis[0];


  if (!perfil) {

    await authLogout(
      token
    );


    throw new Error(
      "Seu login existe, mas o perfil de acesso ainda não foi cadastrado."
    );

  }


  /* =======================================================
     USUÁRIO INATIVO
     ======================================================= */

  if (
    perfil.ativo ===
    false
  ) {

    await authLogout(
      token
    );


    throw new Error(
      "Este usuário está inativo. Procure o administrador do sistema."
    );

  }


  /* =======================================================
     REGISTRAR ACESSO
     ======================================================= */

  const acessoResp =
    await fetch(

      `${LOGIN_SUPABASE_URL}/rest/v1/acessos`,

      {

        method:
          "POST",

        headers: {

          apikey:
            LOGIN_SUPABASE_KEY,

          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json",

          Prefer:
            "return=representation"

        },

        body:
          JSON.stringify({

            user_id:
              userId,

            entrou_em:
              new Date()
                .toISOString(),

            ultima_atividade:
              new Date()
                .toISOString(),

            pagina_atual:
              "login.html",

            navegador:
              navigator.userAgent

          })

      }

    );


  let acessoId =
    "";


  if (
    acessoResp.ok
  ) {

    const dadosAcesso =
      await acessoResp.json();


    acessoId =
      dadosAcesso?.[0]?.id ||
      "";

  } else {

    console.warn(

      "Não foi possível registrar o acesso:",

      await acessoResp.text()

    );

  }


  /* =======================================================
     SALVAR SESSÃO
     ======================================================= */

  localStorage.setItem(

    LOGIN_SESSION_KEY,

    JSON.stringify(
      sessao
    )

  );


  localStorage.setItem(

    LOGIN_PROFILE_KEY,

    JSON.stringify(
      perfil
    )

  );


  if (acessoId) {

    localStorage.setItem(

      LOGIN_ACCESS_KEY,

      acessoId

    );

  } else {

    localStorage.removeItem(
      LOGIN_ACCESS_KEY
    );

  }


  /* =======================================================
     REDIRECIONAR
     ======================================================= */

  const parametros =
    new URLSearchParams(
      location.search
    );


  const next =
    parametros.get(
      "next"
    );


  if (
    next &&
    !next.includes(
      "login.html"
    )
  ) {

    location.replace(
      next
    );

  } else {

    location.replace(
      "index.html"
    );

  }

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(

  "DOMContentLoaded",

  () => {


    /* =====================================================
       JÁ ESTÁ LOGADO
       ===================================================== */

    try {

      const sessao =
        JSON.parse(

          localStorage.getItem(
            LOGIN_SESSION_KEY
          )

          ||

          "null"

        );


      if (
        sessao?.access_token
      ) {

        location.replace(
          "index.html"
        );


        return;

      }

    } catch {}


    /* =====================================================
       MOSTRAR / OCULTAR SENHA
       ===================================================== */

    document
      .getElementById(
        "toggleSenha"
      )
      ?.addEventListener(

        "click",

        () => {

          const senha =
            document.getElementById(
              "senha"
            );


          const botao =
            document.getElementById(
              "toggleSenha"
            );


          if (
            !senha ||
            !botao
          ) {

            return;

          }


          const mostrar =
            senha.type ===
            "password";


          senha.type =

            mostrar

              ? "text"

              : "password";


          botao.textContent =

            mostrar

              ? "Ocultar"

              : "Mostrar";

        }

      );


    /* =====================================================
       FORMULÁRIO
       ===================================================== */

    document
      .getElementById(
        "loginForm"
      )
      ?.addEventListener(

        "submit",

        async e => {

          e.preventDefault();


          limparMensagem();


          const btn =
            document.getElementById(
              "btnEntrar"
            );


          const usuario =
            document
              .getElementById(
                "usuario"
              )
              .value;


          const senha =
            document
              .getElementById(
                "senha"
              )
              .value;


          btn.disabled =
            true;


          btn.textContent =
            "Entrando...";


          try {

            await entrar(
              usuario,
              senha
            );

          } catch (erro) {

            console.error(
              erro
            );


            mensagem(

              erro.message

              ||

              "Não foi possível entrar no sistema."

            );


            btn.disabled =
              false;


            btn.textContent =
              "Entrar no sistema";

          }

        }

      );

  }

);