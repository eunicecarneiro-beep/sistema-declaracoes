/* Gestão de usuários desativada. Compatibilidade com HTMLs antigos. */
"use strict";
const UsuariosPage = Object.freeze({
  init() {
    location.replace("index.html");
  }
});
