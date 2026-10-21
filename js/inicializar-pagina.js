/* Inicialização externa, compatível com CSP sem JavaScript inline. */
"use strict";
document.addEventListener("DOMContentLoaded", async () => {
  const pagina = location.pathname.split("/").pop() || "index.html";
  const iniciar = {
    "index.html": () => DashboardPage.init(),
    "funcionarios.html": () => FuncionariosPage.init(),
    "funcionario.html": () => FuncionarioPage.init(),
    "novo-funcionario.html": () => NovoFuncionarioPage.init(),
    "declaracoes.html": () => DeclaracoesPage.init(),
    "nova-declaracao.html": () => NovaDeclaracaoPage.init(),
    "relatorios.html": () => RelatoriosPage.init(),
    "agenda.html": () => AgendaPage.init(),
    "faltas.html": () => FaltasPage.init(),
    "documentos-servidores.html": () => DocumentosServidoresPage.init()
  }[pagina];
  if (!iniciar) return;
  try {
    await iniciar();
  } catch (erro) {
    App.toast(erro?.message || "Não foi possível carregar esta página.", "danger");
  }
});
