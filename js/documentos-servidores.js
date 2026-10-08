/* ==========================================================
   DOCUMENTOS DE SERVIDORES
   E.M. PROFª EUNICE CARNEIRO

   Declarações funcionais, requerimentos e memorandos.
   Utiliza o cadastro de funcionários existente.
   Não grava novos registros no Supabase.
   Revise o documento antes de imprimir ou protocolar.
========================================================== */

const DocumentosServidoresPage = (() => {

  const S = {
    funcionarios: [],
    textoEditado: false,
    paginaPronta: false
  };

  const $ = id => document.getElementById(id);

  const esc = value =>
    App.escapeHTML(String(value ?? ""));

  const limpa = value =>
    String(value ?? "").trim();

  const normaliza = value =>
    limpa(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ");

  const rotulo = f =>
    `${f.nome}${
      f.matricula
        ? ` — Matrícula ${f.matricula}`
        : ""
    }`;

  const pad = (valor, rot) =>
    limpa(valor) || `[INFORMAR ${rot}]`;

  const dataLocal = () => {
    const x = new Date();

    return `${x.getFullYear()}-${
      String(x.getMonth() + 1).padStart(2, "0")
    }-${
      String(x.getDate()).padStart(2, "0")
    }`;
  };

  const tipos = [
    ["declaracao", "Declaração funcional do servidor"],
    ["requerimento", "Requerimento do servidor"],
    ["prorrogacao", "Memorando — prorrogação de contrato"],
    ["substituicao", "Memorando — substituição por licença (LTS)"],
    ["contratacao", "Memorando — contratação / reposição de vaga"],
    ["memorando", "Memorando administrativo geral"]
  ];

  /* ========================================================
     DADOS E DATAS
  ======================================================== */

  function valor(id) {
    return limpa($(id)?.value);
  }

  function dt(valorData) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valorData || "")) {
      return "";
    }

    const [a, m, d] = valorData.split("-");

    return `${d}/${m}/${a}`;
  }

  function dataExtenso(valorData) {
    if (!dt(valorData)) {
      return "[INFORMAR DATA]";
    }

    const [a, m, d] = valorData.split("-").map(Number);

    const meses = [
      "janeiro",
      "fevereiro",
      "março",
      "abril",
      "maio",
      "junho",
      "julho",
      "agosto",
      "setembro",
      "outubro",
      "novembro",
      "dezembro"
    ];

    return `${d} de ${meses[m - 1]} de ${a}`;
  }

  function servidor(campo) {
    const digitado = valor(campo);

    if (!digitado) return null;

    const matches = S.funcionarios.filter(
      f => rotulo(f) === digitado
    );

    return matches.length === 1 ? matches[0] : null;
  }

  function nome(f, rot = "NOME DO SERVIDOR") {
    return pad(f?.nome, rot);
  }

  function matricula(f) {
    return pad(f?.matricula, "MATRÍCULA");
  }

  function cargo(f) {
    return pad(
      f?.cargo || valor("doc-cargo"),
      "CARGO/FUNÇÃO"
    );
  }

  function assinatura() {
    if (valor("doc-tipo") === "requerimento") {
      const f = servidor("doc-principal");

      return {
        nome: f?.nome || "NOME DO(A) REQUERENTE",
        cargo: "Servidor(a) requerente"
      };
    }

    return {
      nome: valor("doc-assinante"),
      cargo: valor("doc-cargo-assinante")
    };
  }

  function cabecalho() {
    const tipo = valor("doc-tipo");

    const ehMemo = [
      "prorrogacao",
      "substituicao",
      "contratacao",
      "memorando"
    ].includes(tipo);

    const titulo = {
      declaracao: "DECLARAÇÃO",
      requerimento: "REQUERIMENTO",
      prorrogacao: "MEMORANDO",
      substituicao: "MEMORANDO",
      contratacao: "MEMORANDO",
      memorando: "MEMORANDO"
    }[tipo] || "DOCUMENTO";

    const numero = ehMemo
      ? ` Nº ${valor("doc-numero") || "____"}/${
          valor("doc-data").slice(0, 4) ||
          new Date().getFullYear()
        }`
      : "";

    return {
      titulo: titulo + numero,
      ehMemo
    };
  }

  /* ========================================================
     MODELOS DE TEXTOS ADMINISTRATIVOS
  ======================================================== */

  function modeloTexto() {
    const tipo = valor("doc-tipo");

    const f = servidor("doc-principal");
    const outro = servidor("doc-secundario");

    const n = nome(f);
    const mat = matricula(f);
    const cg = cargo(f);

    const inicio = pad(
      dt(valor("doc-inicio")),
      "DATA INICIAL"
    );

    const fim = pad(
      dt(valor("doc-fim")),
      "DATA FINAL"
    );

    const obs = valor("doc-motivo");

    const just = pad(
      obs,
      "JUSTIFICATIVA / MOTIVO"
    );

    const cargoVaga = pad(
      valor("doc-cargo"),
      "CARGO/FUNÇÃO"
    );

    switch (tipo) {

      /* DECLARAÇÃO FUNCIONAL */

      case "declaracao":
        return `Declaramos, para os devidos fins, que ${n}, matrícula nº ${mat}, ${pad(cg, "CARGO/FUNÇÃO")}, possui registro funcional nesta unidade escolar, E.M. Prof.ª Eunice Carneiro, conforme os dados constantes do cadastro da escola.${f?.vinculo ? ` O vínculo informado no cadastro é: ${f.vinculo}.` : ""}${f?.dataAdmissao ? ` A data de admissão registrada é ${dt(f.dataAdmissao) || f.dataAdmissao}.` : ""}

${obs || "A presente declaração é expedida a pedido do(a) interessado(a), para os fins que se fizerem necessários."}

Por ser expressão das informações registradas, firmamos a presente declaração, sujeita à conferência dos documentos funcionais.`;

      /* REQUERIMENTO */

      case "requerimento":
        return `Eu, ${n}, matrícula nº ${mat}, ocupante do cargo/função de ${cg}, venho, respeitosamente, requerer o seguinte: ${pad(valor("doc-pedido"), "OBJETO DO REQUERIMENTO")}.

${just}

Diante do exposto, solicito a análise do pedido e as providências administrativas cabíveis.

Nestes termos, peço deferimento.`;

      /* PRORROGAÇÃO DE CONTRATO */

      case "prorrogacao":
        return `Cumprimentando-os cordialmente, vimos, por meio deste, solicitar a prorrogação do contrato do(a) servidor(a) ${n}, matrícula nº ${mat}, que exerce a função de ${cg} nesta unidade escolar.

O término contratual informado está previsto para ${inicio}, e solicita-se, se administrativamente possível, a prorrogação até ${fim}.

A solicitação fundamenta-se na necessidade de ${just}.

Diante do exposto, solicitamos a análise do pedido e as providências necessárias para assegurar a continuidade das atividades da unidade escolar.`;

      /* SUBSTITUIÇÃO POR LTS */

      case "substituicao":
        return `Cumprimentando-os cordialmente, vimos solicitar a contratação de um(a) profissional para exercer a função de ${cargoVaga}, em substituição ao(à) servidor(a) ${n}, matrícula nº ${mat}, que se encontra afastado(a) por licença para tratamento de saúde (LTS), conforme documentação administrativa a ser conferida.

O afastamento informado tem início em ${inicio}${valor("doc-fim") ? `, com término previsto para ${fim}` : ""}${valor("doc-prazo") ? `, pelo período de ${valor("doc-prazo")} dias` : ""}.

${outro ? `Caso seja cabível, indicamos para análise a continuidade ou contratação do(a) servidor(a) ${nome(outro)}, matrícula nº ${matricula(outro)}, sem prejuízo dos procedimentos legais de contratação.

` : ""}A substituição se faz necessária para ${just}.

Solicitamos as providências administrativas cabíveis, a fim de assegurar a continuidade do atendimento aos estudantes e das atividades pedagógicas.`;

      /* SOLICITAÇÃO DE CONTRATAÇÃO */

      case "contratacao":
        return `Cumprimentando-os cordialmente, vimos solicitar a contratação de um(a) profissional para o cargo/função de ${cargoVaga}, tendo em vista a necessidade de reposição de pessoal nesta unidade escolar.

${f
  ? `A necessidade decorre da situação funcional do(a) servidor(a) ${n}, matrícula nº ${mat}.`
  : "A vaga e a situação funcional que motivam o pedido deverão ser confirmadas nos registros da unidade escolar."
} ${valor("doc-inicio")
  ? `A data informada para a ocorrência é ${inicio}.`
  : ""}

Justificativa: ${just}.

Diante da necessidade de manter a continuidade das atividades e o atendimento aos alunos, solicitamos a análise e autorização das providências de contratação cabíveis.`;

      /* MEMORANDO GERAL */

      case "memorando":
        return `Cumprimentando-os cordialmente, encaminhamos, para conhecimento e providências, a seguinte solicitação: ${pad(valor("doc-pedido"), "DESCRIÇÃO DA SOLICITAÇÃO")}.

${just}

Diante do exposto, solicitamos a análise da demanda e as providências administrativas cabíveis.`;

      default:
        return "";
    }
  }

  /* ========================================================
     CAMPOS QUE APARECEM CONFORME DOCUMENTO
  ======================================================== */

  function camposDinamicos() {
    const tipo = valor("doc-tipo");

    const dicas = {
      declaracao:
        "Selecione o servidor e informe a finalidade. Confira os dados funcionais antes de assinar.",

      requerimento:
        "Documento em primeira pessoa, assinado pelo próprio servidor.",

      prorrogacao:
        "Informe o encerramento atual do contrato, a nova data pretendida e a justificativa.",

      substituicao:
        "Selecione primeiro o servidor afastado por LTS. O segundo servidor é opcional.",

      contratacao:
        "Se houver servidor desligado, selecione-o. Informe o cargo solicitado e o motivo da vaga.",

      memorando:
        "Memorando livre, com assunto, pedido e justificativa editáveis."
    };

    $("doc-dica").textContent = dicas[tipo] || "";

    $("doc-principal-legenda").textContent =
      tipo === "substituicao"
        ? "Servidor afastado (LTS)"
        : tipo === "requerimento"
        ? "Servidor requerente"
        : tipo === "contratacao"
        ? "Servidor desligado / que gerou a vaga (opcional)"
        : "Servidor interessado";

    $("doc-secundario-bloco").hidden =
      tipo !== "substituicao";

    $("doc-inicio-bloco").hidden =
      !["prorrogacao", "substituicao", "contratacao"]
        .includes(tipo);

    $("doc-fim-bloco").hidden =
      !["prorrogacao", "substituicao"].includes(tipo);

    $("doc-prazo-bloco").hidden =
      tipo !== "substituicao";

    $("doc-cargo-bloco").hidden =
      !["substituicao", "contratacao"].includes(tipo);

    $("doc-pedido-bloco").hidden =
      !["memorando", "requerimento"].includes(tipo);

    $("doc-numero-bloco").hidden =
      ![
        "prorrogacao",
        "substituicao",
        "contratacao",
        "memorando"
      ].includes(tipo);

    $("doc-motivo-legenda").textContent =
      tipo === "declaracao"
        ? "Finalidade ou observação da declaração"
        : tipo === "requerimento"
        ? "Fundamentação / justificativa"
        : "Justificativa da solicitação";

    $("doc-inicio-legenda").textContent =
      tipo === "prorrogacao"
        ? "Término atual do contrato"
        : tipo === "substituicao"
        ? "Início da licença (LTS)"
        : "Data da vacância / rescisão";

    $("doc-fim-legenda").textContent =
      tipo === "prorrogacao"
        ? "Prorrogar até"
        : "Fim previsto da licença";
  }

  /* ========================================================
     ASSUNTOS PADRÃO
  ======================================================== */

  function assuntoPadrao(tipo) {
    return {
      declaracao: "Declaração funcional",
      requerimento: "Requerimento administrativo",
      prorrogacao: "Solicitação de prorrogação contratual",
      substituicao:
        "Solicitação de contratação para substituição durante licença para tratamento de saúde",
      contratacao: "Solicitação de contratação de servidor(a)",
      memorando: "Assunto do memorando"
    }[tipo] || "";
  }

  /* ========================================================
     ATUALIZAR TEXTO
  ======================================================== */

  function atualizarModelo(force = false) {
    if (force || !S.textoEditado) {
      $("doc-texto").value = modeloTexto();

      S.textoEditado = false;

      $("doc-edicao").textContent =
        "Texto gerado automaticamente; você pode editar antes de emitir.";
    } else {
      $("doc-edicao").textContent =
        "Texto editado manualmente. Use “Atualizar texto” para recompor com os dados do formulário.";
    }

    visualizar();
  }

  /* ========================================================
     FORMATAÇÃO DO DOCUMENTO
  ======================================================== */

  function htmlBody(txt) {
    return limpa(txt)
      .split(/\n\s*\n/)
      .filter(Boolean)
      .map(
        p => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`
      )
      .join("");
  }

  function corpoDocumento() {
    const cab = cabecalho();
    const sig = assinatura();

    const destino = valor("doc-destino");
    const assunto = valor("doc-assunto");

    const destinoHtml =
      cab.ehMemo || valor("doc-tipo") === "requerimento"
        ? `
          <div class="docs-destination">
            ${destino
              ? `<div><strong>A/C:</strong> ${esc(destino)}</div>`
              : ""}

            ${assunto
              ? `<div><strong>Assunto:</strong> ${esc(assunto)}</div>`
              : ""}
          </div>
        `
        : "";

    return `
      <div class="docs-letterhead">
        <b>PREFEITURA MUNICIPAL DE MONTES CLAROS</b>
        <b>SECRETARIA MUNICIPAL DE EDUCAÇÃO</b>
        <b>ESCOLA MUNICIPAL PROFESSORA EUNICE CARNEIRO</b>
        <small>Montes Claros – Minas Gerais</small>
      </div>

      <div class="docs-doc-title">
        ${esc(cab.titulo)}
      </div>

      <div class="docs-place-date">
        Montes Claros/MG, ${esc(
          dataExtenso(valor("doc-data"))
        )}.
      </div>

      ${destinoHtml}

      <div class="docs-body">
        ${htmlBody(valor("doc-texto"))}
      </div>

      <div class="docs-signature">
        <div class="docs-signature-line">
          <strong>
            ${esc(pad(sig.nome, "ASSINANTE"))}
          </strong>
        </div>

        <div>
          ${esc(pad(sig.cargo, "CARGO DO ASSINANTE"))}
        </div>
      </div>
    `;
  }

  function visualizar() {
    $("doc-preview").innerHTML = corpoDocumento();
  }

  /* ========================================================
     CONFERIR CAMPOS OBRIGATÓRIOS
  ======================================================== */

  function temPendencias() {
    const tipo = valor("doc-tipo");

    const requerServidor = [
      "declaracao",
      "requerimento",
      "prorrogacao",
      "substituicao"
    ].includes(tipo);

    const avisos = [];

    if (
      requerServidor &&
      !servidor("doc-principal")
    ) {
      avisos.push(
        "Selecione um servidor válido na lista."
      );
    }

    if (!valor("doc-data")) {
      avisos.push(
        "Informe a data do documento."
      );
    }

    if (
      tipo === "prorrogacao" &&
      (!valor("doc-inicio") || !valor("doc-fim"))
    ) {
      avisos.push(
        "Informe as duas datas da prorrogação."
      );
    }

    if (
      tipo === "substituicao" &&
      !valor("doc-inicio")
    ) {
      avisos.push(
        "Informe o início da licença."
      );
    }

    if (
      ["substituicao", "contratacao"].includes(tipo) &&
      !valor("doc-cargo")
    ) {
      avisos.push(
        "Informe o cargo a contratar."
      );
    }

    if (
      ["memorando", "requerimento"].includes(tipo) &&
      !valor("doc-pedido")
    ) {
      avisos.push(
        "Informe o pedido do documento."
      );
    }

    if (
      [
        "memorando",
        "requerimento",
        "prorrogacao",
        "substituicao",
        "contratacao"
      ].includes(tipo) &&
      !valor("doc-motivo")
    ) {
      avisos.push(
        "Informe a justificativa."
      );
    }

    if (
      tipo !== "requerimento" &&
      (
        !valor("doc-assinante") ||
        !valor("doc-cargo-assinante")
      )
    ) {
      avisos.push(
        "Confira os dados do assinante."
      );
    }

    if (
      /\[INFORMAR [^\]]+\]/i.test(valor("doc-texto"))
    ) {
      avisos.push(
        "O texto ainda contém campos [INFORMAR ...]."
      );
    }

    if (!valor("doc-texto")) {
      avisos.push(
        "O texto está vazio."
      );
    }

    return avisos;
  }

  function situacao(txt, classe = "") {
    $("doc-status").textContent = txt;
    $("doc-status").className =
      `docs-status ${classe}`;
  }

  /* ========================================================
     HTML PARA WORD / IMPRESSÃO
  ======================================================== */

  function documentoHTML(imprimir = false) {
    const folha = corpoDocumento();

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${esc(cabecalho().titulo)}</title>

<style>
  @page {
    size: A4;
    margin: 20mm 20mm 18mm 20mm;
  }

  body {
    color: #111;
    font: 12pt/1.55 "Times New Roman",serif;
    margin: 0;
  }

  .docs-letterhead {
    text-align: center;
    border-bottom: 1px solid #222;
    padding-bottom: 11px;
    margin-bottom: 28px;
    line-height: 1.35;
  }

  .docs-letterhead b {
    display: block;
  }

  .docs-letterhead small {
    font-size: 9pt;
  }

  .docs-doc-title {
    text-align: center;
    font-weight: bold;
    font-size: 13pt;
    margin-bottom: 24px;
  }

  .docs-place-date {
    text-align: right;
    margin: 0 0 20px;
  }

  .docs-destination {
    margin-bottom: 22px;
  }

  .docs-destination div {
    margin-bottom: 5px;
  }

  .docs-body {
    text-align: justify;
  }

  .docs-body p {
    margin: 0 0 16px;
    text-indent: 1.2cm;
    white-space: pre-wrap;
  }

  .docs-signature {
    text-align: center;
    max-width: 100mm;
    margin: 30mm auto 0;
    page-break-inside: avoid;
  }

  .docs-signature-line {
    border-top: 1px solid #111;
    padding-top: 6px;
  }

  .actions {
    display: flex;
    gap: 12px;
    padding: 16px;
    justify-content: center;
    background: #edf2f7;
  }

  .actions button {
    cursor: pointer;
    padding: 10px 15px;
  }

  @media print {
    .actions {
      display: none !important;
    }
  }
</style>
</head>

<body>
  ${
    imprimir
      ? `<div class="actions">
           <button onclick="window.print()">
             Imprimir / salvar PDF
           </button>

           <button onclick="window.close()">
             Fechar
           </button>
         </div>`
      : ""
  }

  ${folha}
</body>
</html>`;
  }

  /* ========================================================
     IMPRIMIR / SALVAR PDF
  ======================================================== */

  function emitir() {
    const pend = temPendencias();

    if (pend.length) {
      situacao(
        "Revise antes de imprimir: " +
        pend.join(" "),
        "error"
      );

      return;
    }

    const win = window.open("", "_blank");

    if (!win) {
      situacao(
        "O navegador bloqueou a nova aba. Permita pop-ups para este site.",
        "error"
      );

      return;
    }

    win.document.open();
    win.document.write(documentoHTML(true));
    win.document.close();

    situacao(
      "Documento aberto para revisão final e impressão. Use “Salvar como PDF” no navegador.",
      "ok"
    );
  }

  /* ========================================================
     COPIAR TEXTO PARA O 1DOC
  ======================================================== */

  async function copiar() {
    const text = `${
      cabecalho().titulo
    }
Montes Claros/MG, ${
      dataExtenso(valor("doc-data"))
    }
${valor("doc-destino")}
Assunto: ${valor("doc-assunto")}

${valor("doc-texto")}

${assinatura().nome}
${assinatura().cargo}`;

    try {
      await navigator.clipboard.writeText(text);

      situacao(
        "Texto copiado. Você pode colá-lo no 1Doc, Word ou e-mail.",
        "ok"
      );
    } catch {
      const t = $("doc-texto");

      t.focus();
      t.select();

      situacao(
        "Selecionei o texto; pressione Ctrl+C para copiar.",
        "warn"
      );
    }
  }

  /* ========================================================
     BAIXAR DOCUMENTO COMPATÍVEL COM WORD
  ======================================================== */

  function baixarWord() {
    const pend = temPendencias();

    if (pend.length) {
      situacao(
        "Revise antes de gerar Word: " +
        pend.join(" "),
        "error"
      );

      return;
    }

    const blob = new Blob(
      ["\ufeff", documentoHTML(false)],
      {
        type: "application/msword;charset=utf-8"
      }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `DOCUMENTO_SERVIDOR_${
      valor("doc-data") || dataLocal()
    }.doc`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 60000);

    situacao(
      "Arquivo .doc compatível com Word criado. Confira a formatação ao abrir.",
      "ok"
    );
  }

  /* ========================================================
     INTERFACE DO MÓDULO
  ======================================================== */

  function interfaceModulo() {
    return `
      <div class="page-header">
        <div>
          <h2>Documentos de Servidores</h2>
          <p>
            Emita declarações, requerimentos e memorandos
            com os dados do cadastro da escola.
          </p>
        </div>

        <span class="docs-badge">
          Conferir antes de assinar
        </span>
      </div>

      <div class="docs-layout">

        <section class="docs-panel">
          <h3>1. Preencher o documento</h3>

          <div class="docs-grid">

            <div class="docs-field full">
              <label>Tipo de documento</label>

              <select id="doc-tipo">
                ${
                  tipos.map(
                    ([v, n]) => `
                      <option value="${v}">
                        ${esc(n)}
                      </option>
                    `
                  ).join("")
                }
              </select>
            </div>

            <div class="docs-field full">
              <div
                class="docs-typehint"
                id="doc-dica"
              ></div>
            </div>

            <div class="docs-field full">
              <label id="doc-principal-legenda">
                Servidor interessado
              </label>

              <input
                list="doc-funcionarios"
                id="doc-principal"
                autocomplete="off"
                placeholder="Digite o nome ou matrícula e selecione uma opção"
              >
            </div>

            <div
              class="docs-field full"
              id="doc-secundario-bloco"
              hidden
            >
              <label>
                Profissional sugerido / substituto (opcional)
              </label>

              <input
                list="doc-funcionarios"
                id="doc-secundario"
                autocomplete="off"
                placeholder="Pesquise pelo nome ou matrícula"
              >
            </div>

            <datalist id="doc-funcionarios">
              ${
                S.funcionarios.map(
                  f => `
                    <option
                      value="${esc(rotulo(f))}"
                    ></option>
                  `
                ).join("")
              }
            </datalist>

            <div class="docs-field">
              <label>Data do documento</label>

              <input
                id="doc-data"
                type="date"
                value="${dataLocal()}"
              >
            </div>

            <div
              class="docs-field"
              id="doc-numero-bloco"
            >
              <label>
                Número do memorando (opcional)
              </label>

              <input
                id="doc-numero"
                placeholder="Ex.: 025"
              >
            </div>

            <div class="docs-field full">
              <label>Destinatário / A/C</label>

              <input
                id="doc-destino"
                value="Inspeção Escolar"
              >
            </div>

            <div class="docs-field full">
              <label>Assunto</label>

              <input id="doc-assunto">
            </div>

            <div
              class="docs-field"
              id="doc-cargo-bloco"
              hidden
            >
              <label>Cargo/função a contratar</label>

              <input
                id="doc-cargo"
                placeholder="Ex.: Professor(a) PEB I"
              >
            </div>

            <div
              class="docs-field"
              id="doc-inicio-bloco"
              hidden
            >
              <label id="doc-inicio-legenda">
                Data inicial
              </label>

              <input
                id="doc-inicio"
                type="date"
              >
            </div>

            <div
              class="docs-field"
              id="doc-fim-bloco"
              hidden
            >
              <label id="doc-fim-legenda">
                Data final
              </label>

              <input
                id="doc-fim"
                type="date"
              >
            </div>

            <div
              class="docs-field"
              id="doc-prazo-bloco"
              hidden
            >
              <label>
                Período em dias (opcional)
              </label>

              <input
                id="doc-prazo"
                type="number"
                min="1"
                placeholder="Ex.: 60"
              >
            </div>

            <div
              class="docs-field full"
              id="doc-pedido-bloco"
              hidden
            >
              <label>
                Pedido / objeto do requerimento
              </label>

              <textarea
                id="doc-pedido"
                placeholder="Descreva objetivamente o que está sendo solicitado."
              ></textarea>
            </div>

            <div class="docs-field full">
              <label id="doc-motivo-legenda">
                Justificativa / observações
              </label>

              <textarea
                id="doc-motivo"
                placeholder="Ex.: assegurar a continuidade das atividades pedagógicas e do atendimento aos alunos."
              ></textarea>
            </div>

            <div class="docs-field">
              <label>Nome do assinante</label>

              <input
                id="doc-assinante"
                value="Anderson Santos Silva"
              >
            </div>

            <div class="docs-field">
              <label>Cargo do assinante</label>

              <input
                id="doc-cargo-assinante"
                value="Diretor de Unidade Escolar"
              >
            </div>
          </div>

          <h4>2. Texto do documento (editável)</h4>

          <div class="docs-field">
            <textarea
              id="doc-texto"
              style="min-height:290px"
            ></textarea>

            <small
              class="docs-hint"
              id="doc-edicao"
            ></small>
          </div>

          <div class="docs-actions">
            <button
              type="button"
              id="doc-atualizar"
              class="btn btn-secondary"
            >
              Atualizar texto
            </button>

            <button
              type="button"
              id="doc-copiar"
              class="btn btn-secondary"
            >
              Copiar texto
            </button>
          </div>
        </section>

        <section class="docs-panel">
          <div class="docs-previewbar">
            <h3>Pré-visualização do documento</h3>

            <span class="docs-badge">
              Folha A4
            </span>
          </div>

          <div
            id="doc-preview"
            class="docs-page"
          ></div>

          <div class="docs-actions">
            <button
              type="button"
              class="btn btn-primary"
              id="doc-imprimir"
            >
              Imprimir / Salvar PDF
            </button>

            <button
              type="button"
              class="btn btn-secondary"
              id="doc-word"
            >
              Baixar Word (.doc)
            </button>
          </div>

          <div
            id="doc-status"
            role="status"
            class="docs-status"
          ></div>

          <p class="docs-hint">
            Os textos são modelos administrativos.
            Confira datas, situação funcional, cargo e
            informações do processo antes do protocolo
            ou assinatura. Nenhum documento é salvo
            automaticamente no banco.
          </p>
        </section>
      </div>
    `;
  }

  /* ========================================================
     INICIAR O MÓDULO
  ======================================================== */

  async function init() {
    const perfil = await App.carregarPerfilAtual();

    if (
      !perfil ||
      perfil.ativo === false ||
      !["administrador", "secretaria"].includes(
        perfil.perfil
      )
    ) {
      App.layout(
        "Documentos de Servidores",
        "Acesso restrito",
        `
          <div class="docs-panel">
            Acesso permitido apenas aos perfis
            Secretaria e Administrador.
          </div>
        `
      );

      return;
    }

    try {
      S.funcionarios = await App.getAll("funcionarios");

      S.funcionarios.sort(
        (a, b) =>
          normaliza(a.nome).localeCompare(
            normaliza(b.nome),
            "pt-BR"
          )
      );
    } catch (err) {
      App.layout(
        "Documentos de Servidores",
        "Falha na consulta de funcionários",
        `
          <div class="docs-panel">
            Não foi possível carregar os funcionários:
            ${esc(err.message)}
          </div>
        `
      );

      return;
    }

    App.layout(
      "Documentos de Servidores",
      "Declarações • Requerimentos • Memorandos",
      interfaceModulo()
    );

    $("doc-assunto").value =
      assuntoPadrao("declaracao");

    camposDinamicos();
    atualizarModelo(true);

    /* ALTERAR TIPO DE DOCUMENTO */

    $("doc-tipo").addEventListener("change", () => {
      $("doc-assunto").value =
        assuntoPadrao(valor("doc-tipo"));

      S.textoEditado = false;

      camposDinamicos();
      atualizarModelo(true);
    });

    /* ATUALIZAR CAMPOS AUTOMATICAMENTE */

    const camposMonitorados = [
      "doc-principal",
      "doc-secundario",
      "doc-data",
      "doc-numero",
      "doc-destino",
      "doc-assunto",
      "doc-cargo",
      "doc-inicio",
      "doc-fim",
      "doc-prazo",
      "doc-pedido",
      "doc-motivo",
      "doc-assinante",
      "doc-cargo-assinante"
    ];

    for (const id of camposMonitorados) {
      $(id).addEventListener(
        "input",
        () => atualizarModelo(false)
      );

      $(id).addEventListener(
        "change",
        () => atualizarModelo(false)
      );
    }

    /* EDIÇÃO MANUAL */

    $("doc-texto").addEventListener("input", () => {
      S.textoEditado = true;

      $("doc-edicao").textContent =
        "Texto personalizado; a edição será mantida até clicar em Atualizar texto.";

      visualizar();
    });

    /* BOTÕES */

    $("doc-atualizar").onclick =
      () => atualizarModelo(true);

    $("doc-copiar").onclick =
      copiar;

    $("doc-imprimir").onclick =
      emitir;

    $("doc-word").onclick =
      baixarWord;

    situacao(
      `${
        S.funcionarios.length
      } funcionários disponíveis para pesquisa. Selecione o tipo de documento.`,
      "ok"
    );
  }

  return {
    init
  };

})();