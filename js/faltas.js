/* =====================================================
   CONTROLE DE FALTAS
   E.M. PROFª EUNICE CARNEIRO

   ALTERAÇÕES:
   - Pesquisa de funcionário digitando nome
   - Pesquisa também pela matrícula
   - Pesquisa no registro de falta
   - Pesquisa no relatório por funcionário
   - Mantém cadastro, exclusão, relatório e impressão
===================================================== */


/* =====================================================
   UTILITÁRIOS
===================================================== */

function escaparFalta(valor = "") {

  return String(valor)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


function normalizarFalta(falta) {

  if (!falta) {
    return {};
  }


  return {

    id:
      falta.id,

    funcionarioId:
      falta.funcionarioId ??
      falta.funcionario_id ??
      "",

    data:
      falta.data ??
      falta.data_falta ??
      "",

    tipo:
      falta.tipo ??
      falta.motivo ??
      "Falta Injustificada",

    justificativa:
      falta.justificativa ??
      "",

    observacoes:
      falta.observacoes ??
      "",

    createdAt:
      falta.createdAt ??
      falta.created_at ??
      ""

  };

}


function formatarDataFalta(data) {

  if (!data) {
    return "—";
  }


  const partes =
    String(data)
      .slice(0, 10)
      .split("-");


  if (partes.length !== 3) {
    return data;
  }


  return (
    `${partes[2]}/` +
    `${partes[1]}/` +
    `${partes[0]}`
  );

}


/* =====================================================
   FUNÇÕES DE FUNCIONÁRIO
===================================================== */

function obterNomeFuncionarioFalta(funcionario) {

  return (

    funcionario?.nome ||

    funcionario?.nome_completo ||

    "Funcionário"

  );

}


function obterRotuloFuncionarioFalta(funcionario) {

  const nome =
    obterNomeFuncionarioFalta(
      funcionario
    );


  const matricula =
    funcionario?.matricula;


  return matricula

    ? `${nome} — ${matricula}`

    : nome;

}


/* =====================================================
   NORMALIZA TEXTO PARA PESQUISA

   Remove:
   - maiúsculas/minúsculas
   - acentos
===================================================== */

function normalizarTextoPesquisaFalta(
  valor
) {

  return String(valor || "")

    .normalize("NFD")

    .replace(
      /[\u0300-\u036f]/g,
      ""
    )

    .toLowerCase()

    .trim();

}


/* =====================================================
   LOCALIZAR FUNCIONÁRIO PELO TEXTO DIGITADO
===================================================== */

function localizarFuncionarioDigitadoFalta(

  texto,

  funcionarios

) {

  const pesquisa =
    normalizarTextoPesquisaFalta(
      texto
    );


  if (!pesquisa) {
    return null;
  }


  /*
    Primeiro tenta localizar exatamente
    pelo nome + matrícula.
  */

  let encontrado =
    funcionarios.find(

      funcionario =>

        normalizarTextoPesquisaFalta(

          obterRotuloFuncionarioFalta(
            funcionario
          )

        ) === pesquisa

    );


  if (encontrado) {
    return encontrado;
  }


  /*
    Depois tenta nome exato.
  */

  encontrado =
    funcionarios.find(

      funcionario =>

        normalizarTextoPesquisaFalta(

          obterNomeFuncionarioFalta(
            funcionario
          )

        ) === pesquisa

    );


  if (encontrado) {
    return encontrado;
  }


  /*
    Depois matrícula exata.
  */

  encontrado =
    funcionarios.find(

      funcionario =>

        normalizarTextoPesquisaFalta(
          funcionario.matricula
        ) === pesquisa

    );


  return encontrado || null;

}


/* =====================================================
   PÁGINA
===================================================== */

const FaltasPage = {


  state: {

    funcionarios: [],

    faltas: []

  },


  /* ===================================================
     INICIAR
  =================================================== */

  async init() {

    try {


      const [

        funcionarios,

        faltas

      ] = await Promise.all([

        App.getAll(
          "funcionarios"
        ),

        App.getAll(
          "faltas"
        )

      ]);


      this.state = {

        funcionarios:

          Array.isArray(
            funcionarios
          )

            ? funcionarios

            : [],


        faltas:

          Array.isArray(
            faltas
          )

            ? faltas.map(
                normalizarFalta
              )

            : []

      };


      /*
        Ordena os funcionários
        alfabeticamente.
      */

      this.state.funcionarios.sort(

        (a, b) =>

          obterNomeFuncionarioFalta(a)

            .localeCompare(

              obterNomeFuncionarioFalta(b),

              "pt-BR"

            )

      );


      this.renderLayout();

      this.bindEvents();

      this.render();


    }

    catch (erro) {


      console.error(

        "Erro ao carregar faltas:",

        erro

      );


      App.layout(

        "Controle de Faltas",

        "Registre e consulte as faltas dos funcionários.",

        `

        <div class="alert alert-danger">

          Não foi possível carregar
          os registros de faltas.

          <br><br>

          ${escaparFalta(
            erro.message || erro
          )}

        </div>

        `

      );

    }

  },


  /* ===================================================
     LAYOUT
  =================================================== */

  renderLayout() {

    App.layout(

      "Controle de Faltas",

      "Registre e consulte as faltas dos funcionários.",

      `

      <style>


        /* =============================================
           TOOLBAR
        ============================================= */

        .faltas-toolbar {

          display:flex;

          gap:8px;

          flex-wrap:wrap;

        }


        /* =============================================
           RESUMO
        ============================================= */

        .faltas-resumo {

          display:grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap:12px;

          margin-bottom:20px;

        }


        .falta-resumo-card {

          background:#fff;

          border:1px solid #e5e7eb;

          border-radius:12px;

          padding:18px;

        }


        .falta-resumo-label {

          font-size:13px;

          color:#6b7280;

          margin-bottom:5px;

        }


        .falta-resumo-valor {

          font-size:26px;

          font-weight:700;

          color:#111827;

        }


        /* =============================================
           FORMULÁRIO
        ============================================= */

        .custom-modal-form {

          display:flex;

          flex-direction:column;

          gap:16px;

          padding:8px 4px;

        }


        .form-row {

          display:grid;

          grid-template-columns:
            1fr 1fr;

          gap:16px;

        }


        .form-field {

          display:flex;

          flex-direction:column;

          gap:6px;

          position:relative;

        }


        .form-field label {

          font-size:13px;

          font-weight:600;

          color:#374151;

        }


        .form-field input,

        .form-field select,

        .form-field textarea {

          width:100%;

          padding:10px 14px;

          font-size:14px;

          color:#1f2937;

          background:#f9fafb;

          border:1px solid #d1d5db;

          border-radius:8px;

          outline:none;

          box-sizing:border-box;

        }


        .form-field input:focus,

        .form-field select:focus,

        .form-field textarea:focus {

          border-color:#2563eb;

          box-shadow:
            0 0 0 3px
            rgba(37, 99, 235, 0.10);

          background:#fff;

        }


        .form-field textarea {

          resize:vertical;

          min-height:80px;

        }


        /* =============================================
           CAMPO PESQUISÁVEL
        ============================================= */

        .funcionario-search-wrap {

          position:relative;

          width:100%;

        }


        .funcionario-search-input {

          width:100%;

          padding:11px 42px 11px 14px !important;

          background:#fff !important;

        }


        .funcionario-search-icon {

          position:absolute;

          right:14px;

          top:50%;

          transform:
            translateY(-50%);

          color:#6b7280;

          pointer-events:none;

        }


        .funcionario-search-list {

          display:none;

          position:absolute;

          left:0;

          right:0;

          top:
            calc(100% + 5px);

          max-height:260px;

          overflow-y:auto;

          background:#fff;

          border:
            1px solid #d1d5db;

          border-radius:8px;

          box-shadow:
            0 10px 30px
            rgba(0,0,0,.12);

          z-index:99999;

        }


        .funcionario-search-list.aberto {

          display:block;

        }


        .funcionario-search-item {

          width:100%;

          border:0;

          border-bottom:
            1px solid #f3f4f6;

          background:#fff;

          padding:11px 14px;

          text-align:left;

          cursor:pointer;

          font-size:14px;

          color:#111827;

        }


        .funcionario-search-item:last-child {

          border-bottom:0;

        }


        .funcionario-search-item:hover {

          background:#f3f6fb;

        }


        .funcionario-search-item strong {

          display:block;

          font-size:14px;

        }


        .funcionario-search-matricula {

          display:block;

          margin-top:2px;

          font-size:12px;

          color:#6b7280;

        }


        .funcionario-search-vazio {

          padding:14px;

          color:#6b7280;

          text-align:center;

          font-size:13px;

        }


        .funcionario-search-ajuda {

          font-size:12px;

          color:#6b7280;

          margin-top:2px;

        }


        /* =============================================
           RELATÓRIO
        ============================================= */

        .relatorio-faltas {

          background:#fff;

          color:#111827;

        }


        .relatorio-cabecalho {

          border-bottom:
            2px solid #1f4b8f;

          padding-bottom:12px;

          margin-bottom:18px;

        }


        .relatorio-funcionario {

          background:#f8fafc;

          border:1px solid #e5e7eb;

          border-radius:10px;

          padding:15px;

          margin-bottom:18px;

        }


        .relatorio-cards {

          display:grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap:10px;

          margin-bottom:20px;

        }


        .relatorio-card {

          border:1px solid #e5e7eb;

          border-radius:10px;

          padding:14px;

          text-align:center;

        }


        .relatorio-card-label {

          font-size:12px;

          color:#6b7280;

        }


        .relatorio-card-value {

          font-size:24px;

          font-weight:700;

          margin-top:4px;

        }


        /* =============================================
           RESPONSIVO
        ============================================= */

        @media (
          max-width:768px
        ) {

          .faltas-resumo {

            grid-template-columns:1fr;

          }


          .relatorio-cards {

            grid-template-columns:1fr;

          }


          .form-row {

            grid-template-columns:1fr;

          }

        }


      </style>


      <div
        class="page-header"
        style="
          margin-bottom:24px;
        "
      >


        <div>


          <h2
            style="
              margin:0;
              font-size:24px;
              color:#111827;
            "
          >

            Controle de Faltas

          </h2>


          <p
            style="
              margin:4px 0 0;
              color:#6b7280;
              font-size:14px;
            "
          >

            Registre, consulte e gere relatórios
            de faltas por funcionário.

          </p>


        </div>


        <div
          class="
            faltas-toolbar
            no-print
          "
        >


          <button

            type="button"

            class="
              btn
              btn-secondary
            "

            id="btnRelatorioFaltas"

          >

            📊 Relatório por funcionário

          </button>


          <button

            type="button"

            class="
              btn
              btn-primary
            "

            id="btnNovaFalta"

          >

            ＋ Registrar falta

          </button>


        </div>


      </div>


      <div
        class="faltas-resumo"
      >


        <div
          class="falta-resumo-card"
        >


          <div
            class="falta-resumo-label"
          >

            Total de faltas

          </div>


          <div

            class="falta-resumo-valor"

            id="totalFaltas"

          >

            0

          </div>


        </div>


        <div
          class="falta-resumo-card"
        >


          <div
            class="falta-resumo-label"
          >

            Funcionários com faltas

          </div>


          <div

            class="falta-resumo-valor"

            id="funcionariosComFalta"

          >

            0

          </div>


        </div>


        <div
          class="falta-resumo-card"
        >


          <div
            class="falta-resumo-label"
          >

            Faltas justificadas

          </div>


          <div

            class="falta-resumo-valor"

            id="faltasJustificadas"

          >

            0

          </div>


        </div>


      </div>


      <div
        class="
          card
          panel
        "
      >


        <div

          class="panel-header"

          style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:16px;
          "

        >


          <h3
            style="
              margin:0;
              font-size:18px;
            "
          >

            Registros de Faltas

          </h3>


          <span

            class="
              badge
              badge-hours
            "

            id="badgeTotalFaltas"

          >

            0 no total

          </span>


        </div>


        <div
          id="tabelaFaltasContainer"
        ></div>


      </div>

      `

    );

  },


  /* ===================================================
     EVENTOS
  =================================================== */

  bindEvents() {


    document

      .getElementById(
        "btnNovaFalta"
      )

      ?.addEventListener(

        "click",

        () =>
          this.openModalFalta()

      );


    document

      .getElementById(
        "btnRelatorioFaltas"
      )

      ?.addEventListener(

        "click",

        () =>
          this.openModalRelatorio()

      );

  },


  /* ===================================================
     RENDERIZAR TABELA
  =================================================== */

  render() {


    const container =

      document.getElementById(
        "tabelaFaltasContainer"
      );


    if (!container) {
      return;
    }


    const faltas =
      this.state.faltas;


    const funcionarios =
      this.state.funcionarios;


    const mapaFuncionarios =

      Object.fromEntries(

        funcionarios.map(

          funcionario => [

            String(
              funcionario.id
            ),

            funcionario

          ]

        )

      );


    /* ===============================================
       CONTADORES
    =============================================== */

    const funcionariosComFalta =

      new Set(

        faltas.map(

          falta =>
            String(
              falta.funcionarioId
            )

        )

      ).size;


    const faltasJustificadas =

      faltas.filter(

        falta => {


          const tipo =

            String(
              falta.tipo || ""
            )

              .toLowerCase();


          return (

            tipo.includes(
              "justificada"
            )

            ||

            tipo.includes(
              "atestado"
            )

          );

        }

      ).length;


    document

      .getElementById(
        "totalFaltas"
      )

      .textContent =
        faltas.length;


    document

      .getElementById(
        "funcionariosComFalta"
      )

      .textContent =
        funcionariosComFalta;


    document

      .getElementById(
        "faltasJustificadas"
      )

      .textContent =
        faltasJustificadas;


    document

      .getElementById(
        "badgeTotalFaltas"
      )

      .textContent =
        `${faltas.length} no total`;


    if (
      faltas.length === 0
    ) {


      container.innerHTML = `

        <div class="empty">

          <strong>
            Nenhuma falta registrada
          </strong>

          <p>
            Clique em "Registrar falta"
            para adicionar o primeiro registro.
          </p>

        </div>

      `;


      return;

    }


    const ordenadas =

      [...faltas].sort(

        (a, b) =>

          String(
            b.data || ""
          )

            .localeCompare(

              String(
                a.data || ""
              )

            )

      );


    container.innerHTML = `


      <div class="table-wrap">


        <table>


          <thead>


            <tr>


              <th>
                ID
              </th>


              <th>
                Funcionário
              </th>


              <th>
                Data
              </th>


              <th>
                Motivo
              </th>


              <th>
                Justificativa / Observação
              </th>


              <th
                style="
                  text-align:right;
                "
              >

                Ações

              </th>


            </tr>


          </thead>


          <tbody>


            ${ordenadas.map(

              falta => {


                const funcionario =

                  mapaFuncionarios[

                    String(
                      falta.funcionarioId
                    )

                  ];


                return `


                  <tr>


                    <td>

                      <code
                        style="
                          background:#f3f4f6;
                          padding:2px 6px;
                          border-radius:4px;
                          font-size:12px;
                        "
                      >

                        #${escaparFalta(
                          falta.id
                        )}

                      </code>

                    </td>


                    <td>

                      <strong>

                        ${escaparFalta(

                          funcionario

                            ? obterNomeFuncionarioFalta(
                                funcionario
                              )

                            : "Funcionário removido"

                        )}

                      </strong>

                    </td>


                    <td>

                      ${formatarDataFalta(
                        falta.data
                      )}

                    </td>


                    <td>

                      <span
                        class="
                          badge
                          badge-days
                        "
                      >

                        ${escaparFalta(
                          falta.tipo ||
                          "Falta"
                        )}

                      </span>

                    </td>


                    <td>

                      ${escaparFalta(

                        falta.justificativa ||

                        falta.observacoes ||

                        "—"

                      )}

                    </td>


                    <td
                      style="
                        text-align:right;
                      "
                    >

                      <button

                        type="button"

                        class="
                          btn
                          btn-danger
                          btn-sm
                        "

                        onclick="
                          FaltasPage.excluir(
                            '${falta.id}'
                          )
                        "

                      >

                        Excluir

                      </button>

                    </td>


                  </tr>


                `;

              }

            ).join("")}


          </tbody>


        </table>


      </div>

    `;

  },


  /* ===================================================
     HTML DO PESQUISADOR

     tipo:
     falta
     relatorio
  =================================================== */

  htmlPesquisaFuncionario(
    tipo
  ) {


    const inputId =

      tipo === "falta"

        ? "faltaFuncionarioPesquisa"

        : "relatorioFuncionarioPesquisa";


    const hiddenId =

      tipo === "falta"

        ? "faltaFuncionario"

        : "relatorioFaltaFuncionario";


    const listaId =

      tipo === "falta"

        ? "listaFuncionariosFalta"

        : "listaFuncionariosRelatorio";


    return `


      <div
        class="funcionario-search-wrap"
      >


        <input

          type="text"

          id="${inputId}"

          class="funcionario-search-input"

          placeholder="
            Digite o nome ou matrícula...
          "

          autocomplete="off"

        >


        <span
          class="funcionario-search-icon"
        >

          🔎

        </span>


        <input

          type="hidden"

          id="${hiddenId}"

          value=""

        >


        <div

          id="${listaId}"

          class="funcionario-search-list"

        ></div>


      </div>


      <small
        class="funcionario-search-ajuda"
      >

        Digite parte do nome ou da matrícula
        e clique no servidor desejado.

      </small>

    `;

  },


  /* ===================================================
     CONFIGURAR CAMPO PESQUISÁVEL
  =================================================== */

  configurarPesquisaFuncionario(
    tipo
  ) {


    const inputId =

      tipo === "falta"

        ? "faltaFuncionarioPesquisa"

        : "relatorioFuncionarioPesquisa";


    const hiddenId =

      tipo === "falta"

        ? "faltaFuncionario"

        : "relatorioFaltaFuncionario";


    const listaId =

      tipo === "falta"

        ? "listaFuncionariosFalta"

        : "listaFuncionariosRelatorio";


    const input =
      document.getElementById(
        inputId
      );


    const hidden =
      document.getElementById(
        hiddenId
      );


    const lista =
      document.getElementById(
        listaId
      );


    if (
      !input ||
      !hidden ||
      !lista
    ) {

      return;

    }


    /* ===============================================
       RENDERIZAR RESULTADOS
    =============================================== */

    const renderizarResultados =
      () => {


        const pesquisa =

          normalizarTextoPesquisaFalta(
            input.value
          );


        /*
          Ao editar o texto depois de ter
          escolhido alguém, tira o ID antigo.
        */

        hidden.value =
          "";


        if (
          tipo === "relatorio"
        ) {

          this.gerarRelatorio(
            ""
          );

        }


        let encontrados =
          this.state.funcionarios;


        if (pesquisa) {


          encontrados =

            encontrados.filter(

              funcionario => {


                const nome =

                  normalizarTextoPesquisaFalta(

                    obterNomeFuncionarioFalta(
                      funcionario
                    )

                  );


                const matricula =

                  normalizarTextoPesquisaFalta(

                    funcionario.matricula

                  );


                const rotulo =

                  normalizarTextoPesquisaFalta(

                    obterRotuloFuncionarioFalta(
                      funcionario
                    )

                  );


                return (

                  nome.includes(
                    pesquisa
                  )

                  ||

                  matricula.includes(
                    pesquisa
                  )

                  ||

                  rotulo.includes(
                    pesquisa
                  )

                );

              }

            );

        }


        /*
          Limita a quantidade exibida.
          Continua pesquisando todos.
        */

        encontrados =
          encontrados.slice(
            0,
            30
          );


        if (
          encontrados.length === 0
        ) {


          lista.innerHTML = `

            <div
              class="
                funcionario-search-vazio
              "
            >

              Nenhum servidor encontrado.

            </div>

          `;


          lista.classList.add(
            "aberto"
          );


          return;

        }


        lista.innerHTML =

          encontrados.map(

            funcionario => {


              const nome =

                obterNomeFuncionarioFalta(
                  funcionario
                );


              const matricula =

                funcionario.matricula ||
                "";


              return `

                <button

                  type="button"

                  class="
                    funcionario-search-item
                  "

                  data-id="${
                    escaparFalta(
                      funcionario.id
                    )
                  }"

                >

                  <strong>

                    ${escaparFalta(
                      nome
                    )}

                  </strong>


                  ${

                    matricula

                      ?

                      `

                      <span
                        class="
                          funcionario-search-matricula
                        "
                      >

                        Matrícula:
                        ${escaparFalta(
                          matricula
                        )}

                      </span>

                      `

                      :

                      ""

                  }


                </button>

              `;

            }

          ).join("");


        lista.classList.add(
          "aberto"
        );


        /* =============================================
           CLIQUE NO RESULTADO
        =============================================== */

        lista

          .querySelectorAll(
            ".funcionario-search-item"
          )

          .forEach(

            botao => {


              botao.addEventListener(

                "click",

                () => {


                  const id =
                    botao.dataset.id;


                  const funcionario =

                    this.state.funcionarios.find(

                      f =>
                        String(
                          f.id
                        ) ===
                        String(
                          id
                        )

                    );


                  if (!funcionario) {
                    return;
                  }


                  input.value =

                    obterRotuloFuncionarioFalta(
                      funcionario
                    );


                  hidden.value =
                    funcionario.id;


                  lista.classList.remove(
                    "aberto"
                  );


                  if (
                    tipo === "relatorio"
                  ) {

                    this.gerarRelatorio(
                      funcionario.id
                    );

                  }

                }

              );

            }

          );

      };


    /* ===============================================
       DIGITAR
    =============================================== */

    input.addEventListener(

      "input",

      renderizarResultados

    );


    /* ===============================================
       FOCUS
    =============================================== */

    input.addEventListener(

      "focus",

      renderizarResultados

    );


    /* ===============================================
       FECHAR AO CLICAR FORA
    =============================================== */

    document.addEventListener(

      "click",

      evento => {


        if (

          !input.contains(
            evento.target
          )

          &&

          !lista.contains(
            evento.target
          )

        ) {

          lista.classList.remove(
            "aberto"
          );

        }

      }

    );

  },


  /* ===================================================
     MODAL REGISTRAR FALTA
  =================================================== */

  openModalFalta() {


    App.openModal({

      title:
        "Registrar falta",


      body:

        `


        <form

          id="formFalta"

          class="custom-modal-form"

        >


          <div
            class="form-field"
          >


            <label>

              Funcionário *

            </label>


            ${this.htmlPesquisaFuncionario(
              "falta"
            )}


          </div>


          <div
            class="form-row"
          >


            <div
              class="form-field"
            >


              <label
                for="faltaData"
              >

                Data da falta *

              </label>


              <input

                type="date"

                id="faltaData"

                value="${

                  new Date()

                    .toISOString()

                    .slice(
                      0,
                      10
                    )

                }"

                required

              >


            </div>


            <div
              class="form-field"
            >


              <label
                for="faltaMotivo"
              >

                Motivo *

              </label>


              <select

                id="faltaMotivo"

                required

              >


                <option
                  value="Falta Injustificada"
                >

                  Falta Injustificada

                </option>


                <option
                  value="Falta Justificada"
                >

                  Falta Justificada

                </option>


                <option
                  value="Atestado Médico"
                >

                  Atestado Médico

                </option>


                <option
                  value="Licença / Outros"
                >

                  Licença / Outros

                </option>


              </select>


            </div>


          </div>


          <div
            class="form-field"
          >


            <label
              for="faltaJustificativa"
            >

              Justificativa / Observação

            </label>


            <textarea

              id="faltaJustificativa"

              placeholder="
                Digite aqui os detalhes ou justificativa...
              "

            ></textarea>


          </div>


        </form>


        `,


      footer:

        `


        <button

          type="button"

          class="
            btn
            btn-secondary
          "

          data-close-modal

        >

          Cancelar

        </button>


        <button

          type="button"

          class="
            btn
            btn-primary
          "

          id="btnSalvarFalta"

        >

          Salvar Registro

        </button>


        `

    });


    /*
      Ativa pesquisa depois
      que o modal foi criado.
    */

    this.configurarPesquisaFuncionario(
      "falta"
    );


    document

      .getElementById(
        "btnSalvarFalta"
      )

      ?.addEventListener(

        "click",

        () =>
          this.salvar()

      );


    /*
      Dá foco automaticamente
      no campo de servidor.
    */

    setTimeout(

      () => {

        document

          .getElementById(
            "faltaFuncionarioPesquisa"
          )

          ?.focus();

      },

      50

    );

  },


  /* ===================================================
     SALVAR FALTA
  =================================================== */

  async salvar() {


    const funcionarioId =

      document.getElementById(
        "faltaFuncionario"
      )?.value;


    const campoPesquisa =

      document.getElementById(
        "faltaFuncionarioPesquisa"
      );


    const data =

      document.getElementById(
        "faltaData"
      )?.value;


    const tipo =

      document.getElementById(
        "faltaMotivo"
      )?.value;


    const justificativa =

      document.getElementById(
        "faltaJustificativa"
      )?.value ||

      "";


    /* ===============================================
       SE O USUÁRIO DIGITOU O NOME EXATO
       MAS NÃO CLICOU NO RESULTADO
    =============================================== */

    let idFinal =
      funcionarioId;


    if (
      !idFinal &&
      campoPesquisa?.value
    ) {


      const encontrado =

        localizarFuncionarioDigitadoFalta(

          campoPesquisa.value,

          this.state.funcionarios

        );


      if (encontrado) {

        idFinal =
          encontrado.id;

      }

    }


    if (
      !idFinal
    ) {


      App.toast(

        "Pesquise e selecione um funcionário.",

        "warning"

      );


      campoPesquisa?.focus();


      return;

    }


    if (!data) {


      App.toast(

        "Informe a data da falta.",

        "warning"

      );


      return;

    }


    const funcionarioIdNumerico =

      Number(
        idFinal
      );


    if (

      !Number.isInteger(
        funcionarioIdNumerico
      )

      ||

      funcionarioIdNumerico <= 0

    ) {


      App.toast(

        "O funcionário selecionado não possui um ID válido.",

        "danger"

      );


      return;

    }


    const botao =

      document.getElementById(
        "btnSalvarFalta"
      );


    if (botao) {

      botao.disabled =
        true;

      botao.textContent =
        "Salvando...";

    }


    try {


      await App.add(

        "faltas",

        {

          funcionarioId:
            funcionarioIdNumerico,

          data:
            data,

          tipo:
            tipo,

          justificativa:
            justificativa,

          observacoes:
            justificativa

        }

      );


      App.toast(

        "Falta registrada com sucesso!",

        "success"

      );


      App.closeModal();


      this.state.faltas =

        (

          await App.getAll(
            "faltas"
          )

        ).map(
          normalizarFalta
        );


      this.render();


    }

    catch (erro) {


      console.error(

        "Erro ao salvar falta:",

        erro

      );


      App.toast(

        "Erro ao salvar falta: " +

        (
          erro.message ||
          erro
        ),

        "danger"

      );


      if (botao) {

        botao.disabled =
          false;

        botao.textContent =
          "Salvar Registro";

      }

    }

  },


  /* ===================================================
     MODAL RELATÓRIO
  =================================================== */

  openModalRelatorio() {


    App.openModal({

      title:
        "Relatório de faltas por funcionário",


      body:

        `


        <div
          style="
            display:flex;
            flex-direction:column;
            gap:18px;
          "
        >


          <div
            class="form-field"
          >


            <label>

              Funcionário

            </label>


            ${this.htmlPesquisaFuncionario(
              "relatorio"
            )}


          </div>


          <div
            id="resultadoRelatorioFaltas"
          >


            <div

              class="empty"

              style="
                padding:30px 10px;
              "

            >


              <strong>

                Pesquise um funcionário

              </strong>


              <p>

                Digite o nome ou matrícula
                para gerar o relatório.

              </p>


            </div>


          </div>


        </div>


        `,


      footer:

        `


        <button

          type="button"

          class="
            btn
            btn-secondary
          "

          data-close-modal

        >

          Fechar

        </button>


        <button

          type="button"

          class="
            btn
            btn-primary
          "

          id="btnImprimirRelatorioFaltas"

        >

          🖨️ Imprimir

        </button>


        `

    });


    this.configurarPesquisaFuncionario(
      "relatorio"
    );


    document

      .getElementById(
        "btnImprimirRelatorioFaltas"
      )

      ?.addEventListener(

        "click",

        () =>
          this.imprimirRelatorio()

      );


    setTimeout(

      () => {

        document

          .getElementById(
            "relatorioFuncionarioPesquisa"
          )

          ?.focus();

      },

      50

    );

  },


  /* ===================================================
     GERAR RELATÓRIO
  =================================================== */

  gerarRelatorio(
    funcionarioId
  ) {


    const container =

      document.getElementById(
        "resultadoRelatorioFaltas"
      );


    if (!container) {
      return;
    }


    if (!funcionarioId) {


      container.innerHTML = `


        <div

          class="empty"

          style="
            padding:30px 10px;
          "

        >


          <strong>

            Pesquise um funcionário

          </strong>


          <p>

            O relatório será exibido aqui.

          </p>


        </div>


      `;


      return;

    }


    const funcionario =

      this.state.funcionarios.find(

        f =>

          String(
            f.id
          ) ===

          String(
            funcionarioId
          )

      );


    if (!funcionario) {


      container.innerHTML = `

        <div
          class="
            alert
            alert-danger
          "
        >

          Funcionário não encontrado.

        </div>

      `;


      return;

    }


    const faltas =

      this.state.faltas

        .filter(

          falta =>

            String(
              falta.funcionarioId
            ) ===

            String(
              funcionarioId
            )

        )

        .sort(

          (a, b) =>

            String(
              b.data || ""
            )

              .localeCompare(

                String(
                  a.data || ""
                )

              )

        );


    const total =
      faltas.length;


    const injustificadas =

      faltas.filter(

        falta =>

          String(
            falta.tipo || ""
          )

            .toLowerCase()

            .includes(
              "injustificada"
            )

      ).length;


    const justificadas =

      faltas.filter(

        falta => {


          const tipo =

            String(
              falta.tipo || ""
            )

              .toLowerCase();


          return (

            tipo.includes(
              "justificada"
            )

            ||

            tipo.includes(
              "atestado"
            )

          );

        }

      ).length;


    const licencas =

      faltas.filter(

        falta =>

          String(
            falta.tipo || ""
          )

            .toLowerCase()

            .includes(
              "licença"
            )

      ).length;


    const nomeFuncionario =

      obterNomeFuncionarioFalta(
        funcionario
      );


    const matricula =

      funcionario.matricula ||

      "—";


    container.innerHTML = `


      <div

        id="relatorioImpressaoFaltas"

        class="relatorio-faltas"

      >


        <div
          class="relatorio-cabecalho"
        >


          <h2
            style="
              margin:0 0 5px;
              color:#111827;
            "
          >

            Relatório de Faltas

          </h2>


          <div
            style="
              font-size:14px;
              color:#6b7280;
            "
          >

            E.M. Profª Eunice Carneiro

          </div>


        </div>


        <div
          class="relatorio-funcionario"
        >


          <div
            style="
              font-size:20px;
              font-weight:700;
              margin-bottom:5px;
            "
          >

            ${escaparFalta(
              nomeFuncionario
            )}

          </div>


          <div
            style="
              color:#6b7280;
              font-size:14px;
            "
          >

            Matrícula:

            ${escaparFalta(
              matricula
            )}

          </div>


          <div
            style="
              margin-top:8px;
              color:#6b7280;
              font-size:12px;
            "
          >

            Relatório gerado em:

            ${new Date()

              .toLocaleString(
                "pt-BR"
              )}

          </div>


        </div>


        <div
          class="relatorio-cards"
        >


          <div
            class="relatorio-card"
          >


            <div
              class="
                relatorio-card-label
              "
            >

              Total de faltas

            </div>


            <div
              class="
                relatorio-card-value
              "
            >

              ${total}

            </div>


          </div>


          <div
            class="relatorio-card"
          >


            <div
              class="
                relatorio-card-label
              "
            >

              Faltas injustificadas

            </div>


            <div
              class="
                relatorio-card-value
              "
            >

              ${injustificadas}

            </div>


          </div>


          <div
            class="relatorio-card"
          >


            <div
              class="
                relatorio-card-label
              "
            >

              Justificadas / Atestados

            </div>


            <div
              class="
                relatorio-card-value
              "
            >

              ${justificadas}

            </div>


          </div>


        </div>


        ${

          licencas > 0

            ?

            `

            <div

              class="
                alert
                alert-info
              "

              style="
                margin-bottom:18px;
              "

            >

              Registros de
              Licença / Outros:

              <strong>
                ${licencas}
              </strong>

            </div>

            `

            :

            ""

        }


        ${

          total === 0

            ?

            `


            <div

              class="empty"

              style="
                padding:30px 10px;
              "

            >


              <strong>

                Nenhuma falta registrada

              </strong>


              <p>

                Este funcionário não possui
                registros de faltas.

              </p>


            </div>


            `

            :

            `


            <div
              class="table-wrap"
            >


              <table>


                <thead>


                  <tr>


                    <th>
                      Data
                    </th>


                    <th>
                      Motivo
                    </th>


                    <th>
                      Justificativa / Observação
                    </th>


                  </tr>


                </thead>


                <tbody>


                  ${faltas.map(

                    falta => `


                      <tr>


                        <td>

                          ${formatarDataFalta(
                            falta.data
                          )}

                        </td>


                        <td>

                          <span
                            class="
                              badge
                              badge-days
                            "
                          >

                            ${escaparFalta(
                              falta.tipo
                            )}

                          </span>

                        </td>


                        <td>

                          ${escaparFalta(

                            falta.justificativa ||

                            falta.observacoes ||

                            "—"

                          )}

                        </td>


                      </tr>


                    `

                  ).join("")}


                </tbody>


              </table>


            </div>


            `

        }


        <div

          style="
            margin-top:25px;
            padding-top:15px;
            border-top:
              1px solid #e5e7eb;
            font-size:13px;
            color:#6b7280;
          "

        >

          <strong>

            Total de registros:
            ${total}

          </strong>

        </div>


      </div>


    `;

  },


  /* ===================================================
     IMPRIMIR
  =================================================== */

  imprimirRelatorio() {


    const relatorio =

      document.getElementById(
        "relatorioImpressaoFaltas"
      );


    if (!relatorio) {


      App.toast(

        "Pesquise e selecione um funcionário para gerar o relatório.",

        "warning"

      );


      return;

    }


    const janela =

      window.open(

        "",

        "_blank",

        "width=1000,height=800"

      );


    if (!janela) {


      App.toast(

        "O navegador bloqueou a janela de impressão.",

        "warning"

      );


      return;

    }


    janela.document.write(`


      <!DOCTYPE html>


      <html lang="pt-BR">


      <head>


        <meta charset="UTF-8">


        <title>
          Relatório de Faltas
        </title>


        <style>


          body {

            font-family:
              Arial,
              sans-serif;

            margin:30px;

            color:#111827;

          }


          h2 {

            margin-bottom:5px;

          }


          table {

            width:100%;

            border-collapse:
              collapse;

            margin-top:20px;

          }


          th,
          td {

            border:
              1px solid #d1d5db;

            padding:8px;

            text-align:left;

          }


          th {

            background:#f3f4f6;

          }


          .relatorio-cabecalho {

            border-bottom:
              2px solid #1f4b8f;

            padding-bottom:10px;

            margin-bottom:20px;

          }


          .relatorio-funcionario {

            background:#f8fafc;

            border:
              1px solid #ddd;

            padding:15px;

            margin-bottom:20px;

          }


          .relatorio-cards {

            display:grid;

            grid-template-columns:
              repeat(3,1fr);

            gap:10px;

            margin-bottom:20px;

          }


          .relatorio-card {

            border:
              1px solid #ddd;

            padding:15px;

            text-align:center;

          }


          .relatorio-card-label {

            font-size:12px;

            color:#666;

          }


          .relatorio-card-value {

            font-size:24px;

            font-weight:bold;

            margin-top:5px;

          }


          .badge {

            display:inline-block;

            padding:3px 7px;

            border-radius:6px;

            background:#f3f4f6;

          }


          @media print {

            body {

              margin:15px;

            }

          }


        </style>


      </head>


      <body>


        ${relatorio.innerHTML}


        <script>

          window.onload = function() {

            window.print();

          };

        <\/script>


      </body>


      </html>


    `);


    janela.document.close();

  },


  /* ===================================================
     EXCLUIR
  =================================================== */

  async excluir(
    id
  ) {


    if (

      !confirm(

        "Tem certeza que deseja excluir esta falta?"

      )

    ) {

      return;

    }


    try {


      await App.remove(

        "faltas",

        id

      );


      App.toast(

        "Falta removida com sucesso!",

        "info"

      );


      this.state.faltas =

        (

          await App.getAll(
            "faltas"
          )

        ).map(
          normalizarFalta
        );


      this.render();


    }

    catch (erro) {


      console.error(

        "Erro ao excluir:",

        erro

      );


      App.toast(

        "Erro ao excluir registro: " +

        (
          erro.message ||
          erro
        ),

        "danger"

      );

    }

  }

};