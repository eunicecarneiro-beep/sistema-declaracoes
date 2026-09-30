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


function emailInterno(usuario) {

  return (
    normalizarUsuario(usuario) +
    "@" +
    LOGIN_DOMAIN
  );

}


function mensagem(
  texto,
  tipo = "error"
) {

  const el =
    document.getElementById(
      "loginMsg"
    );

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

  el.className =
    "login-msg";

  el.textContent =
    "";

}


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


async function entrar(
  usuario,
  senha
) {

  const username =
    normalizarUsuario(
      usuario
    );


  if (!username) {

    throw new Error(
      "Informe um usuário válido."
    );

  }


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
              emailInterno(
                username
              ),

            password:
              senha

          })

      }

    );


  if (!resposta.ok) {

    throw new Error(
      "Usuário ou senha incorretos."
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

    await authLogout(
      token
    );

    throw new Error(
      "Seu perfil de acesso não foi encontrado."
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
      "Seu perfil de acesso não foi encontrado."
    );

  }


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

  }


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

  }


  const parametros =
    new URLSearchParams(
      location.search
    );


  const next =
    parametros.get(
      "next"
    );


  location.replace(

    next &&
    !next.includes(
      "login.html"
    )

      ? next

      : "index.html"

  );

}


document.addEventListener(

  "DOMContentLoaded",

  () => {


    try {

      const sessao =
        JSON.parse(

          localStorage.getItem(
            LOGIN_SESSION_KEY
          ) ||
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
            document.getElementById(
              "usuario"
            ).value;


          const senha =
            document.getElementById(
              "senha"
            ).value;


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

            mensagem(

              erro.message ||
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