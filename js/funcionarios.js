/* =========================================================
   FUNCIONÁRIOS
   E.M. PROFª EUNICE CARNEIRO

   - Cadastro completo
   - Pesquisa por nome
   - Filtro por cargo/função
   - Filtro por setor
   - Filtro por vínculo
   - Filtro por situação
   - Ativo / Inativo
   - Motivo da inativação
   - Data da inativação
   - Exportação para planilha
   - Impressão
   ========================================================= */


/* =========================================================
   LISTA DE FUNCIONÁRIOS
   ========================================================= */

const FuncionariosPage = {

  state: {

    funcionarios: [],

    busca: "",

    cargo: "todos",

    setor: "todos",

    vinculo: "todos",

    status: "todos"

  },


  async init() {

    try {

      this.state.funcionarios =
        await App.getAll(
          "funcionarios"
        ) || [];


      this.ordenar();


      App.layout(

        "Funcionários",

        "Cadastro, pesquisa e controle dos servidores da escola",

        this.layout()

      );


      this.bind();

      this.atualizarOpcoesCargo();

      this.render();


    } catch (err) {

      console.error(err);

      App.toast(

        "Erro ao carregar funcionários: " +
        (err.message || err),

        "danger"

      );

    }

  },


  /* =======================================================
     LAYOUT
     ======================================================= */

  layout() {

    return `

      <style>

        .fx-filtros {

          display:grid;

          grid-template-columns:
            minmax(280px, 2fr)
            repeat(4, minmax(150px, 1fr));

          gap:10px;

          align-items:end;

        }


        .fx-filtros .field {

          margin:0;

        }


        .fx-acoes {

          display:flex;

          gap:8px;

          flex-wrap:wrap;

        }


        .fx-cards {

          display:grid;

          grid-template-columns:
            repeat(7, minmax(105px, 1fr));

          gap:10px;

          margin:16px 0;

        }


        .fx-card {

          background:#fff;

          border:
            1px solid #e5e7eb;

          border-radius:12px;

          padding:13px;

        }


        .fx-label {

          font-size:12px;

          color:#667085;

        }


        .fx-num {

          font-size:23px;

          font-weight:800;

          margin-top:3px;

        }


        .fx-ativo {

          background:#ecfdf3 !important;

          color:#027a48 !important;

        }


        .fx-inativo {

          background:#fef3f2 !important;

          color:#b42318 !important;

        }


        .fx-info {

          font-size:13px;

          color:#667085;

          margin-top:5px;

        }


        .fx-inativo-info {

          margin-top:6px;

          font-size:12px;

          line-height:1.4;

          color:#b42318;

        }


        .fx-table-actions {

          display:flex;

          gap:6px;

          flex-wrap:wrap;

        }


        .fx-modal-danger {

          background:#fff7ed;

          border:
            1px solid #fed7aa;

          color:#9a3412;

          border-radius:10px;

          padding:12px;

          margin-bottom:14px;

        }


        .fx-modal-info {

          background:#f8fafc;

          border:
            1px solid #e4e7ec;

          border-radius:10px;

          padding:12px;

          margin-bottom:14px;

        }


        .fx-detalhe-inativo {

          background:#fff7ed;

          border:
            1px solid #fed7aa;

          color:#9a3412;

          border-radius:10px;

          padding:14px;

          margin-bottom:18px;

        }


        @media(max-width:1200px) {

          .fx-filtros {

            grid-template-columns:
              1fr 1fr;

          }


          .fx-cards {

            grid-template-columns:
              repeat(4,1fr);

          }

        }


        @media(max-width:700px) {

          .fx-filtros {

            grid-template-columns:
              1fr;

          }


          .fx-cards {

            grid-template-columns:
              repeat(2,1fr);

          }

        }


        @media print {

          .no-print {

            display:none !important;

          }


          .fx-filtros {

            display:none !important;

          }


          .fx-cards {

            grid-template-columns:
              repeat(4,1fr);

          }

        }

      </style>


      <div class="page-header">

        <div>

          <h2>
            Lista de Funcionários
          </h2>

          <p>
            Pesquise pelo nome e filtre os servidores por
            cargo/função, setor, vínculo e situação.
          </p>

        </div>


        <div class="fx-acoes no-print">

          <a
            href="novo-funcionario.html"
            class="btn btn-primary"
          >
            ＋ Novo Funcionário
          </a>


          <button
            id="fxExportar"
            class="btn btn-secondary"
            type="button"
          >
            📊 Exportar Planilha
          </button>


          <button
            id="fxImprimir"
            class="btn btn-secondary"
            type="button"
          >
            🖨️ Imprimir
          </button>

        </div>

      </div>


      <div
        class="card panel no-print"
      >

        <div class="panel-header">

          <div>

            <h3>
              Pesquisar e filtrar
            </h3>

            <div
              class="fx-info"
              id="fxResultados"
            ></div>

          </div>


          <button
            id="fxLimpar"
            class="btn btn-secondary btn-sm"
            type="button"
          >
            Limpar filtros
          </button>

        </div>


        <div class="fx-filtros">


          <!-- PESQUISA PELO NOME -->

          <div class="field">

            <label
              for="fxBusca"
            >
              Pesquisar por nome
            </label>

            <input
              id="fxBusca"
              class="input"
              type="text"
              placeholder="Digite o nome do servidor..."
              autocomplete="off"
            >

          </div>


          <!-- CARGO / FUNÇÃO -->

          <div class="field">

            <label
              for="fxCargo"
            >
              Cargo / Função
            </label>

            <select
              id="fxCargo"
              class="input"
            >

              <option
                value="todos"
              >
                Todos
              </option>

            </select>

          </div>


          <!-- SETOR -->

          <div class="field">

            <label
              for="fxSetor"
            >
              Setor
            </label>

            <select
              id="fxSetor"
              class="input"
            >

              <option
                value="todos"
              >
                Todos
              </option>

              <option
                value="Administrativo"
              >
                Administrativo
              </option>

              <option
                value="Pedagógico"
              >
                Pedagógico
              </option>

              <option
                value="Outro"
              >
                Outro
              </option>

            </select>

          </div>


          <!-- VÍNCULO -->

          <div class="field">

            <label
              for="fxVinculo"
            >
              Vínculo
            </label>

            <select
              id="fxVinculo"
              class="input"
            >

              <option
                value="todos"
              >
                Todos
              </option>

              <option
                value="Efetivo"
              >
                Efetivo
              </option>

              <option
                value="Contratado"
              >
                Contratado
              </option>

            </select>

          </div>


          <!-- SITUAÇÃO -->

          <div class="field">

            <label
              for="fxStatus"
            >
              Situação
            </label>

            <select
              id="fxStatus"
              class="input"
            >

              <option
                value="todos"
              >
                Todos
              </option>

              <option
                value="Ativo"
              >
                Ativos
              </option>

              <option
                value="Inativo"
              >
                Inativos
              </option>

            </select>

          </div>


        </div>

      </div>


      <div
        id="fxCards"
      ></div>


      <div
        class="card panel"
      >

        <div
          class="panel-header"
        >

          <h3>
            Servidores cadastrados
          </h3>


          <span
            class="badge badge-hours"
            id="fxBadge"
          >
            0 encontrados
          </span>

        </div>


        <div
          id="fxTabela"
        ></div>

      </div>

    `;

  },


  /* =======================================================
     EVENTOS
     ======================================================= */

  bind() {

    document
      .getElementById("fxBusca")
      ?.addEventListener(
        "input",
        e => {

          this.state.busca =
            e.target.value;

          this.render();

        }
      );


    document
      .getElementById("fxCargo")
      ?.addEventListener(
        "change",
        e => {

          this.state.cargo =
            e.target.value;

          this.render();

        }
      );


    document
      .getElementById("fxSetor")
      ?.addEventListener(
        "change",
        e => {

          this.state.setor =
            e.target.value;

          this.render();

        }
      );


    document
      .getElementById("fxVinculo")
      ?.addEventListener(
        "change",
        e => {

          this.state.vinculo =
            e.target.value;

          this.render();

        }
      );


    document
      .getElementById("fxStatus")
      ?.addEventListener(
        "change",
        e => {

          this.state.status =
            e.target.value;

          this.render();

        }
      );


    document
      .getElementById("fxLimpar")
      ?.addEventListener(
        "click",
        () =>
          this.limpar()
      );


    document
      .getElementById("fxExportar")
      ?.addEventListener(
        "click",
        () =>
          this.exportar()
      );


    document
      .getElementById("fxImprimir")
      ?.addEventListener(
        "click",
        () =>
          window.print()
      );

  },


  /* =======================================================
     OPÇÕES DE CARGO
     ======================================================= */

  cargosDisponiveis() {

    const cargos =
      this.state.funcionarios

        .map(
          f =>
            String(
              f.cargo ||
              ""
            ).trim()
        )

        .filter(
          cargo =>
            cargo !== ""
        );


    return [
      ...new Set(
        cargos
      )
    ]
      .sort(
        (a,b) =>
          a.localeCompare(
            b,
            "pt-BR",
            {
              sensitivity:
                "base"
            }
          )
      );

  },


  atualizarOpcoesCargo() {

    const select =
      document.getElementById(
        "fxCargo"
      );


    if (!select) {
      return;
    }


    const valorAtual =
      this.state.cargo ||
      "todos";


    const cargos =
      this.cargosDisponiveis();


    select.innerHTML = `

      <option
        value="todos"
      >
        Todos
      </option>

      ${
        cargos.map(
          cargo => `

            <option
              value="${App.escapeHTML(cargo)}"
            >
              ${App.escapeHTML(cargo)}
            </option>

          `
        ).join("")
      }

    `;


    const existe =
      cargos.some(
        cargo =>
          cargo ===
          valorAtual
      );


    select.value =
      valorAtual === "todos" ||
      existe

        ? valorAtual

        : "todos";


    if (
      !existe &&
      valorAtual !== "todos"
    ) {
      this.state.cargo =
        "todos";
    }

  },


  /* =======================================================
     LIMPAR FILTROS
     ======================================================= */

  limpar() {

    this.state.busca =
      "";

    this.state.cargo =
      "todos";

    this.state.setor =
      "todos";

    this.state.vinculo =
      "todos";

    this.state.status =
      "todos";


    const busca =
      document.getElementById(
        "fxBusca"
      );

    const cargo =
      document.getElementById(
        "fxCargo"
      );

    const setor =
      document.getElementById(
        "fxSetor"
      );

    const vinculo =
      document.getElementById(
        "fxVinculo"
      );

    const status =
      document.getElementById(
        "fxStatus"
      );


    if (busca) {
      busca.value =
        "";
    }


    if (cargo) {
      cargo.value =
        "todos";
    }


    if (setor) {
      setor.value =
        "todos";
    }


    if (vinculo) {
      vinculo.value =
        "todos";
    }


    if (status) {
      status.value =
        "todos";
    }


    this.render();

  },


  /* =======================================================
     ORDENAR
     ======================================================= */

  ordenar() {

    this.state.funcionarios.sort(

      (a,b) =>

        String(
          a.nome ||
          ""
        )
          .trim()
          .localeCompare(

            String(
              b.nome ||
              ""
            )
              .trim(),

            "pt-BR",

            {
              sensitivity:
                "base"
            }

          )

    );

  },


  /* =======================================================
     STATUS
     ======================================================= */

  statusFuncionario(f) {

    return (

      String(
        f?.status ||
        "Ativo"
      )
        .trim()

      || "Ativo"

    );

  },


  /* =======================================================
     SETOR
     ======================================================= */

  setorFuncionario(f) {

    const setor =
      String(
        f?.setor ||
        ""
      ).trim();


    if (!setor) {
      return "Outro";
    }


    const texto =
      setor.toLowerCase();


    if (
      texto.includes(
        "administr"
      )
    ) {

      return "Administrativo";

    }


    if (
      texto.includes(
        "pedag"
      )
    ) {

      return "Pedagógico";

    }


    return setor;

  },


  /* =======================================================
     FILTRAR
     ======================================================= */

  filtrados() {

    const busca =
      String(
        this.state.busca ||
        ""
      )
        .trim()
        .toLocaleLowerCase(
          "pt-BR"
        );


    return this.state.funcionarios

      .filter(
        f => {

          const nome =
            String(
              f.nome ||
              ""
            )
              .toLocaleLowerCase(
                "pt-BR"
              );


          const cargo =
            String(
              f.cargo ||
              ""
            ).trim();


          const vinculo =
            String(
              f.vinculo ||
              ""
            );


          return (

            (
              !busca ||

              nome.includes(
                busca
              )
            )

            &&

            (
              this.state.cargo ===
              "todos"

              ||

              cargo ===
              this.state.cargo
            )

            &&

            (
              this.state.setor ===
              "todos"

              ||

              this.setorFuncionario(f) ===
              this.state.setor
            )

            &&

            (
              this.state.vinculo ===
              "todos"

              ||

              vinculo ===
              this.state.vinculo
            )

            &&

            (
              this.state.status ===
              "todos"

              ||

              this.statusFuncionario(f) ===
              this.state.status
            )

          );

        }
      )

      .sort(

        (a,b) =>

          String(
            a.nome ||
            ""
          ).localeCompare(

            String(
              b.nome ||
              ""
            ),

            "pt-BR",

            {
              sensitivity:
                "base"
            }

          )

      );

  },


  /* =======================================================
     RENDERIZAÇÃO
     ======================================================= */

  render() {

    const list =
      this.filtrados();


    const all =
      this.state.funcionarios;


    const count =
      func =>
        all.filter(
          func
        ).length;


    const badge =
      document.getElementById(
        "fxBadge"
      );


    if (badge) {

      badge.textContent =
        `${list.length} encontrado(s)`;

    }


    const resultados =
      document.getElementById(
        "fxResultados"
      );


    if (resultados) {

      resultados.textContent =
        `Exibindo ${list.length} de ${all.length} servidor(es).`;

    }


    const cards =
      document.getElementById(
        "fxCards"
      );


    if (cards) {

      cards.innerHTML = `

        <div class="fx-cards">

          ${this.card(
            "Total",
            all.length
          )}

          ${this.card(
            "Ativos",
            count(
              f =>
                this.statusFuncionario(f) ===
                "Ativo"
            )
          )}

          ${this.card(
            "Inativos",
            count(
              f =>
                this.statusFuncionario(f) ===
                "Inativo"
            )
          )}

          ${this.card(
            "Efetivos",
            count(
              f =>
                String(
                  f.vinculo ||
                  ""
                ) ===
                "Efetivo"
            )
          )}

          ${this.card(
            "Contratados",
            count(
              f =>
                String(
                  f.vinculo ||
                  ""
                ) ===
                "Contratado"
            )
          )}

          ${this.card(
            "Administrativo",
            count(
              f =>
                this.setorFuncionario(f) ===
                "Administrativo"
            )
          )}

          ${this.card(
            "Pedagógico",
            count(
              f =>
                this.setorFuncionario(f) ===
                "Pedagógico"
            )
          )}

        </div>

      `;

    }


    const tabela =
      document.getElementById(
        "fxTabela"
      );


    if (tabela) {

      tabela.innerHTML =
        this.tabela(list);

    }

  },


  card(
    label,
    value
  ) {

    return `

      <div class="fx-card">

        <div class="fx-label">
          ${App.escapeHTML(label)}
        </div>

        <div class="fx-num">
          ${value}
        </div>

      </div>

    `;

  },


  /* =======================================================
     TABELA
     ======================================================= */

  tabela(list) {

    if (!list.length) {

      return `

        <div class="empty">

          <strong>
            Nenhum funcionário encontrado
          </strong>

          <p>
            Pesquise outro nome
            ou altere os filtros.
          </p>

        </div>

      `;

    }


    return `

      <div class="table-wrap">

        <table>

          <thead>

            <tr>

              <th>
                Nome
              </th>

              <th>
                Matrícula
              </th>

              <th>
                Cargo / Função
              </th>

              <th>
                Setor
              </th>

              <th>
                Vínculo
              </th>

              <th>
                Situação
              </th>

              <th class="no-print">
                Ações
              </th>

            </tr>

          </thead>


          <tbody>

            ${list.map(
              f => {

                const status =
                  this.statusFuncionario(f);


                const id =
                  String(
                    f.id
                  )
                    .replace(
                      /'/g,
                      "\\'"
                    );


                let detalhe =
                  "";


                if (
                  status ===
                  "Inativo"
                ) {

                  if (
                    f.dataInatividade ||
                    f.motivoInatividade
                  ) {

                    detalhe = `

                      <div
                        class="fx-inativo-info"
                      >

                        ${
                          f.dataInatividade

                            ? `Data: ${
                                App.formatDate(
                                  f.dataInatividade
                                )
                              }`

                            : ""
                        }

                        ${
                          f.dataInatividade &&
                          f.motivoInatividade

                            ? "<br>"

                            : ""
                        }

                        ${
                          f.motivoInatividade

                            ? `Motivo: ${App.escapeHTML(
                                f.motivoInatividade
                              )}`

                            : ""
                        }

                      </div>

                    `;

                  }

                }


                return `

                  <tr>

                    <td>

                      <strong>

                        ${App.escapeHTML(
                          f.nome ||
                          "Sem nome"
                        )}

                      </strong>

                    </td>


                    <td>

                      <code>

                        ${App.escapeHTML(
                          f.matricula ||
                          "—"
                        )}

                      </code>

                    </td>


                    <td>

                      ${App.escapeHTML(
                        f.cargo ||
                        "—"
                      )}

                    </td>


                    <td>

                      ${App.escapeHTML(
                        this.setorFuncionario(f)
                      )}

                    </td>


                    <td>

                      <span
                        class="
                          badge
                          badge-days
                        "
                      >

                        ${App.escapeHTML(
                          f.vinculo ||
                          "Servidor"
                        )}

                      </span>

                    </td>


                    <td>

                      <span
                        class="
                          badge
                          ${
                            status ===
                            "Inativo"

                              ? "fx-inativo"

                              : "fx-ativo"
                          }
                        "
                      >

                        ${App.escapeHTML(
                          status
                        )}

                      </span>


                      ${detalhe}

                    </td>


                    <td
                      class="no-print"
                    >

                      <div
                        class="fx-table-actions"
                      >

                        <a
                          class="
                            btn
                            btn-secondary
                            btn-sm
                          "
                          href="funcionario.html?id=${encodeURIComponent(f.id)}"
                        >
                          Ver / Editar
                        </a>


                        <button
                          type="button"
                          class="
                            btn
                            ${
                              status ===
                              "Inativo"

                                ? "btn-secondary"

                                : "btn-danger"
                            }
                            btn-sm
                          "
                          onclick="
                            FuncionariosPage.alternarStatus(
                              '${id}'
                            )
                          "
                        >

                          ${
                            status ===
                            "Inativo"

                              ? "Ativar"

                              : "Inativar"
                          }

                        </button>


                        <button
                          type="button"
                          class="
                            btn
                            btn-danger
                            btn-sm
                          "
                          onclick="
                            FuncionariosPage.deleteItem(
                              '${id}'
                            )
                          "
                        >

                          Excluir

                        </button>

                      </div>

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


  /* =======================================================
     ALTERNAR ATIVO / INATIVO
     ======================================================= */

  async alternarStatus(id) {

    try {

      const funcionario =
        await App.get(
          "funcionarios",
          id
        );


      if (!funcionario) {

        App.toast(
          "Funcionário não encontrado.",
          "danger"
        );

        return;

      }


      const atual =
        this.statusFuncionario(
          funcionario
        );


      /* ================================================
         ATIVAR
         ================================================ */

      if (
        atual ===
        "Inativo"
      ) {

        App.openModal({

          title:
            "Ativar servidor",

          body: `

            <div
              class="fx-modal-info"
            >

              <strong>
                ${App.escapeHTML(
                  funcionario.nome ||
                  "Servidor"
                )}
              </strong>

              <br><br>

              O servidor voltará
              para a situação
              <strong>Ativo</strong>.

            </div>


            <p>

              O motivo e a data da
              última inativação serão
              mantidos no cadastro
              para histórico.

            </p>

          `,

          footer: `

            <button
              type="button"
              class="btn btn-secondary"
              data-close-modal
            >
              Cancelar
            </button>


            <button
              type="button"
              class="btn btn-primary"
              id="fxConfirmarAtivacao"
            >
              Ativar servidor
            </button>

          `

        });


        document
          .getElementById(
            "fxConfirmarAtivacao"
          )
          ?.addEventListener(
            "click",
            async () => {

              await this.salvarStatus(

                funcionario,

                "Ativo",

                funcionario.motivoInatividade ||
                "",

                funcionario.dataInatividade ||
                ""

              );

            }
          );


        return;

      }


      /* ================================================
         INATIVAR
         ================================================ */

      App.openModal({

        title:
          "Inativar servidor",

        body: `

          <div
            class="fx-modal-danger"
          >

            <strong>

              ${App.escapeHTML(
                funcionario.nome ||
                "Servidor"
              )}

            </strong>

            <br><br>

            Para inativar o servidor,
            informe obrigatoriamente
            o motivo e a data.

          </div>


          <div
            class="field"
          >

            <label
              for="fxMotivoInatividade"
            >
              Motivo da inativação *
            </label>

            <textarea
              id="fxMotivoInatividade"
              class="input"
              rows="4"
              placeholder="Ex.: término de contrato, transferência, licença, afastamento, aposentadoria..."
            ></textarea>

          </div>


          <div
            class="field"
            style="margin-top:12px"
          >

            <label
              for="fxDataInatividade"
            >
              Data da inativação *
            </label>

            <input
              id="fxDataInatividade"
              class="input"
              type="date"
              value="${this.hojeISO()}"
            >

          </div>

        `,

        footer: `

          <button
            type="button"
            class="btn btn-secondary"
            data-close-modal
          >
            Cancelar
          </button>


          <button
            type="button"
            class="btn btn-danger"
            id="fxConfirmarInativacao"
          >
            Inativar servidor
          </button>

        `

      });


      document
        .getElementById(
          "fxConfirmarInativacao"
        )
        ?.addEventListener(
          "click",
          async () => {

            const motivoEl =
              document.getElementById(
                "fxMotivoInatividade"
              );


            const dataEl =
              document.getElementById(
                "fxDataInatividade"
              );


            const motivo =
              String(
                motivoEl?.value ||
                ""
              ).trim();


            const data =
              String(
                dataEl?.value ||
                ""
              ).trim();


            if (!motivo) {

              App.toast(
                "Informe o motivo da inativação.",
                "warning"
              );

              motivoEl?.focus();

              return;

            }


            if (!data) {

              App.toast(
                "Informe a data da inativação.",
                "warning"
              );

              dataEl?.focus();

              return;

            }


            await this.salvarStatus(

              funcionario,

              "Inativo",

              motivo,

              data

            );

          }
        );

    } catch (err) {

      console.error(err);

      App.toast(

        "Erro ao alterar situação: " +
        (err.message || err),

        "danger"

      );

    }

  },


  async salvarStatus(

    funcionario,

    status,

    motivo,
    data

  ) {

    try {

      await App.put(

        "funcionarios",

        {

          ...funcionario,

          status:
            status,

          motivoInatividade:
            motivo ||
            null,

          dataInatividade:
            data ||
            null

        }

      );


      App.closeModal();


      App.toast(

        status ===
        "Inativo"

          ? "Servidor inativado com sucesso!"

          : "Servidor ativado com sucesso!"

      );


      await this.init();


    } catch (err) {

      console.error(err);

      App.toast(

        "Erro ao salvar situação: " +
        (err.message || err),

        "danger"

      );

    }

  },


  hojeISO() {

    const data =
      new Date();


    const ano =
      data.getFullYear();


    const mes =
      String(
        data.getMonth() + 1
      )
        .padStart(
          2,
          "0"
        );


    const dia =
      String(
        data.getDate()
      )
        .padStart(
          2,
          "0"
        );


    return `${ano}-${mes}-${dia}`;

  },


  /* =======================================================
     EXCLUIR
     ======================================================= */

  async deleteItem(id) {

    const confirmou =
      confirm(

        "Tem certeza que deseja excluir este funcionário? Esta ação não poderá ser desfeita."

      );


    if (!confirmou) {
      return;
    }


    try {

      await App.remove(
        "funcionarios",
        id
      );


      App.toast(
        "Funcionário excluído com sucesso!"
      );


      await this.init();


    } catch (err) {

      console.error(err);

      App.toast(

        "Erro ao excluir: " +
        (err.message || err),

        "danger"

      );

    }

  },


  /* =======================================================
     CSV
     ======================================================= */

  csv(value) {

    return `"${String(
      value ?? ""
    ).replace(
      /"/g,
      '""'
    )}"`;

  },


  /* =======================================================
     EXPORTAR
     ======================================================= */

  exportar() {

    const list =
      this.filtrados();


    if (!list.length) {

      App.toast(
        "Não há funcionários para exportar.",
        "warning"
      );

      return;

    }


    const header = [

      "Nome completo",

      "Matrícula",

      "Cargo/Função",

      "Setor",

      "Vínculo",

      "Situação",

      "Motivo da inativação",

      "Data da inativação",

      "Turno",

      "Carga horária",

      "CPF",

      "Telefone",

      "E-mail",

      "Endereço",

      "Formação",

      "Especialização",

      "Naturalidade",

      "Data de nascimento",

      "Data de admissão",

      "Data de entrada na escola",

      "Observações"

    ];


    const rows =
      list.map(
        f => [

          f.nome,

          f.matricula,

          f.cargo,

          this.setorFuncionario(f),

          f.vinculo,

          this.statusFuncionario(f),

          f.motivoInatividade,

          f.dataInatividade,

          f.turno,

          f.cargaHoraria,

          f.cpf,

          f.telefone,

          f.email,

          f.endereco,

          f.formacao,

          f.especializacao,

          f.naturalidade,

          f.dataNascimento,

          f.dataAdmissao,

          f.dataEntradaEscola,

          f.observacoes

        ]
      );


    const csv = [

      header,

      ...rows

    ]

      .map(
        row =>
          row
            .map(
              value =>
                this.csv(value)
            )
            .join(";")
      )

      .join(
        "\r\n"
      );


    const blob =
      new Blob(

        [
          "\ufeff" +
          csv
        ],

        {
          type:
            "text/csv;charset=utf-8;"
        }

      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href =
      url;


    link.download =
      "funcionarios-eunice-carneiro.csv";


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
      url
    );


    App.toast(
      "Planilha exportada com sucesso!"
    );

  }

};


/* =========================================================
   DETALHES / EDIÇÃO
   ========================================================= */

const FuncionarioPage = {

  async init() {

    const id =
      new URLSearchParams(
        window.location.search
      ).get("id");


    if (!id) {

      window.location.href =
        "funcionarios.html";

      return;

    }


    try {

      const funcionario =
        await App.get(
          "funcionarios",
          id
        );


      if (!funcionario) {

        App.toast(
          "Funcionário não encontrado.",
          "danger"
        );


        setTimeout(
          () =>
            window.location.href =
              "funcionarios.html",

          1200
        );


        return;

      }


      App.layout(

        "Detalhes do Funcionário",

        "Ficha cadastral completa e edição dos dados",

        this.form(
          funcionario
        )

      );


      document
        .getElementById(
          "funcEditForm"
        )
        ?.addEventListener(
          "submit",
          e =>
            this.save(
              e,
              id
            )
        );


      document
        .getElementById(
          "status"
        )
        ?.addEventListener(
          "change",
          () =>
            this.atualizarBlocoInatividade()
        );


    } catch (err) {

      console.error(err);

      App.toast(

        "Erro ao carregar funcionário: " +
        (err.message || err),

        "danger"

      );

    }

  },


  esc(value = "") {

    return App.escapeHTML(
      value
    );

  },


  opcao(
    value,
    atual
  ) {

    return `

      <option
        value="${this.esc(value)}"
        ${
          String(
            atual ||
            ""
          ) ===
          value

            ? "selected"

            : ""
        }
      >
        ${this.esc(value)}
      </option>

    `;

  },


  form(f) {

    const status =
      f.status ||
      "Ativo";


    return `

      <style>

        .fxe-grid {

          display:grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                220px,
                1fr
              )
            );

          gap:14px;

        }


        .fxe-full {

          grid-column:
            1 / -1;

        }


        .fxe-section {

          font-weight:800;

          font-size:16px;

          margin:
            4px 0 12px;

          color:#101828;

        }


        .fxe-inativo {

          background:#fff7ed;

          border:
            1px solid #fed7aa;

          color:#9a3412;

          border-radius:10px;

          padding:14px;

          margin-bottom:18px;

        }


        @media(max-width:900px) {

          .fxe-grid {

            grid-template-columns:
              1fr 1fr;

          }

        }


        @media(max-width:620px) {

          .fxe-grid {

            grid-template-columns:
              1fr;

          }


          .fxe-full {

            grid-column:auto;

          }

        }

      </style>


      <div
        class="card panel"
      >

        <form
          id="funcEditForm"
          class="form"
        >


          ${
            status ===
            "Inativo"

              ? `

                <div
                  class="fxe-inativo"
                >

                  <strong>
                    Servidor inativo
                  </strong>

                  <br><br>

                  Data da inativação:
                  <strong>
                    ${this.esc(
                      App.formatDate(
                        f.dataInatividade
                      )
                    )}
                  </strong>

                  <br>

                  Motivo:
                  <strong>
                    ${this.esc(
                      f.motivoInatividade ||
                      "Não informado"
                    )}
                  </strong>

                </div>

              `

              : ""

          }


          <div
            class="fxe-section"
          >
            Dados pessoais
          </div>


          <div
            class="fxe-grid"
          >


            <div class="field">

              <label
                for="nome"
              >
                Nome Completo *
              </label>

              <input
                id="nome"
                class="input"
                required
                value="${this.esc(
                  f.nome
                )}"
              >

            </div>


            <div class="field">

              <label
                for="matricula"
              >
                Matrícula
              </label>

              <input
                id="matricula"
                class="input"
                value="${this.esc(
                  f.matricula
                )}"
              >

            </div>


            <div class="field">

              <label
                for="cpf"
              >
                CPF
              </label>

              <input
                id="cpf"
                class="input"
                value="${this.esc(
                  f.cpf
                )}"
              >

            </div>


            <div class="field">

              <label
                for="dataNascimento"
              >
                Data de nascimento
              </label>

              <input
                id="dataNascimento"
                class="input"
                type="date"
                value="${this.esc(
                  f.dataNascimento
                )}"
              >

            </div>


            <div class="field">

              <label
                for="naturalidade"
              >
                Naturalidade
              </label>

              <input
                id="naturalidade"
                class="input"
                value="${this.esc(
                  f.naturalidade
                )}"
              >

            </div>


            <div class="field">

              <label
                for="telefone"
              >
                Telefone
              </label>

              <input
                id="telefone"
                class="input"
                value="${this.esc(
                  f.telefone
                )}"
              >

            </div>


            <div class="field">

              <label
                for="email"
              >
                E-mail
              </label>

              <input
                id="email"
                class="input"
                type="email"
                value="${this.esc(
                  f.email
                )}"
              >

            </div>


            <div
              class="field fxe-full"
            >

              <label
                for="endereco"
              >
                Endereço
              </label>

              <input
                id="endereco"
                class="input"
                value="${this.esc(
                  f.endereco
                )}"
              >

            </div>


          </div>


          <div
            class="fxe-section"
            style="margin-top:20px"
          >
            Dados funcionais
          </div>


          <div
            class="fxe-grid"
          >


            <div class="field">

              <label
                for="cargo"
              >
                Cargo / Função
              </label>

              <input
                id="cargo"
                class="input"
                value="${this.esc(
                  f.cargo
                )}"
                placeholder="Ex.: PEB I REGENTE"
              >

            </div>


            <div class="field">

              <label
                for="setor"
              >
                Setor
              </label>

              <select
                id="setor"
                class="input"
              >

                <option value="">
                  Selecione
                </option>

                ${
                  [
                    "Administrativo",
                    "Pedagógico",
                    "Outro"
                  ]

                    .map(
                      valor =>
                        this.opcao(
                          valor,
                          f.setor
                        )
                    )

                    .join("")
                }

              </select>

            </div>


            <div class="field">

              <label
                for="vinculo"
              >
                Vínculo *
              </label>

              <select
                id="vinculo"
                class="input"
                required
              >

                <option
                  value="Efetivo"
                  ${
                    f.vinculo ===
                    "Efetivo"
                      ? "selected"
                      : ""
                  }
                >
                  Efetivo
                </option>

                <option
                  value="Contratado"
                  ${
                    f.vinculo ===
                    "Contratado"
                      ? "selected"
                      : ""
                  }
                >
                  Contratado
                </option>

              </select>

            </div>


            <div class="field">

              <label
                for="status"
              >
                Situação do servidor *
              </label>

              <select
                id="status"
                class="input"
                required
              >

                <option
                  value="Ativo"
                  ${
                    status ===
                    "Ativo"
                      ? "selected"
                      : ""
                  }
                >
                  Ativo
                </option>

                <option
                  value="Inativo"
                  ${
                    status ===
                    "Inativo"
                      ? "selected"
                      : ""
                  }
                >
                  Inativo
                </option>

              </select>

            </div>


            <div class="field">

              <label
                for="turno"
              >
                Turno
              </label>

              <select
                id="turno"
                class="input"
              >

                <option value="">
                  Selecione
                </option>

                ${
                  [
                    "Matutino",
                    "Vespertino",
                    "Integral",
                    "Noturno",
                    "Outro"
                  ]

                    .map(
                      valor =>
                        this.opcao(
                          valor,
                          f.turno
                        )
                    )

                    .join("")
                }

              </select>

            </div>


            <div class="field">

              <label
                for="cargaHoraria"
              >
                Carga horária
              </label>

              <input
                id="cargaHoraria"
                class="input"
                value="${this.esc(
                  f.cargaHoraria
                )}"
                placeholder="Ex.: 24h, 30h, 40h"
              >

            </div>


            <div class="field">

              <label
                for="dataAdmissao"
              >
                Data de admissão
              </label>

              <input
                id="dataAdmissao"
                class="input"
                type="date"
                value="${this.esc(
                  f.dataAdmissao
                )}"
              >

            </div>


            <div class="field">

              <label
                for="dataEntradaEscola"
              >
                Data de entrada na escola
              </label>

              <input
                id="dataEntradaEscola"
                class="input"
                type="date"
                value="${this.esc(
                  f.dataEntradaEscola
                )}"
              >

            </div>


          </div>


          <div
            id="blocoInatividade"
          >

            ${
              status ===
              "Inativo"

                ? this.blocoInatividade(
                    f
                  )

                : ""
            }

          </div>


          <div
            class="fxe-section"
            style="margin-top:20px"
          >
            Formação
          </div>


          <div
            class="fxe-grid"
          >


            <div class="field">

              <label
                for="formacao"
              >
                Formação
              </label>

              <input
                id="formacao"
                class="input"
                value="${this.esc(
                  f.formacao
                )}"
              >

            </div>


            <div class="field">

              <label
                for="especializacao"
              >
                Especialização
              </label>

              <input
                id="especializacao"
                class="input"
                value="${this.esc(
                  f.especializacao
                )}"
              >

            </div>


            <div
              class="field fxe-full"
            >

              <label
                for="observacoes"
              >
                Observações
              </label>

              <textarea
                id="observacoes"
                class="input"
                rows="4"
              >${this.esc(
                f.observacoes
              )}</textarea>

            </div>


          </div>


          <div
            class="form-actions"
          >

            <a
              href="funcionarios.html"
              class="btn btn-secondary"
            >
              Voltar
            </a>


            <button
              type="submit"
              class="btn btn-primary"
            >
              Salvar Alterações
            </button>

          </div>


        </form>

      </div>

    `;

  },


  blocoInatividade(f) {

    return `

      <div
        class="fxe-grid"
        style="margin-top:14px"
      >

        <div class="field">

          <label
            for="motivoInatividade"
          >
            Motivo da inativação *
          </label>

          <textarea
            id="motivoInatividade"
            class="input"
            rows="3"
          >${this.esc(
            f.motivoInatividade ||
            ""
          )}</textarea>

        </div>


        <div class="field">

          <label
            for="dataInatividade"
          >
            Data da inativação *
          </label>

          <input
            id="dataInatividade"
            class="input"
            type="date"
            value="${this.esc(
              f.dataInatividade ||
              ""
            )}"
          >

        </div>

      </div>

    `;

  },


  atualizarBlocoInatividade() {

    const status =
      document.getElementById(
        "status"
      )?.value;


    const bloco =
      document.getElementById(
        "blocoInatividade"
      );


    if (!bloco) {
      return;
    }


    if (
      status ===
      "Inativo"
    ) {

      bloco.innerHTML =
        this.blocoInatividade(
          {
            motivoInatividade:
              "",
            dataInatividade:
              this.hojeISO()
          }
        );

    } else {

      bloco.innerHTML =
        "";

    }

  },


  hojeISO() {

    const d =
      new Date();


    return (

      d.getFullYear() +

      "-" +

      String(
        d.getMonth() + 1
      ).padStart(
        2,
        "0"
      ) +

      "-" +

      String(
        d.getDate()
      ).padStart(
        2,
        "0"
      )

    );

  },


  async save(
    e,
    id
  ) {

    e.preventDefault();


    const btn =
      e.target.querySelector(
        'button[type="submit"]'
      );


    if (btn) {
      btn.disabled =
        true;
    }


    try {

      const get =
        idCampo =>
          document
            .getElementById(
              idCampo
            )
            ?.value ||
          "";


      const funcionarioAtual =
        await App.get(
          "funcionarios",
          id
        );


      const status =
        get(
          "status"
        ) ||
        "Ativo";


      let motivoInatividade =
        funcionarioAtual?.motivoInatividade ||
        null;


      let dataInatividade =
        funcionarioAtual?.dataInatividade ||
        null;


      if (
        status ===
        "Inativo"
      ) {

        motivoInatividade =
          get(
            "motivoInatividade"
          ).trim();


        dataInatividade =
          get(
            "dataInatividade"
          );


        if (
          !motivoInatividade
        ) {

          App.toast(
            "Informe o motivo da inativação.",
            "warning"
          );


          document
            .getElementById(
              "motivoInatividade"
            )
            ?.focus();


          if (btn) {
            btn.disabled =
              false;
          }


          return;

        }


        if (
          !dataInatividade
        ) {

          App.toast(
            "Informe a data da inativação.",
            "warning"
          );


          document
            .getElementById(
              "dataInatividade"
            )
            ?.focus();


          if (btn) {
            btn.disabled =
              false;
          }


          return;

        }

      }


      await App.put(

        "funcionarios",

        {

          id,

          nome:
            get("nome")
              .trim(),

          matricula:
            get("matricula")
              .trim(),

          cpf:
            get("cpf")
              .trim(),

          dataNascimento:
            get(
              "dataNascimento"
            ) || null,

          naturalidade:
            get(
              "naturalidade"
            ).trim(),

          telefone:
            get(
              "telefone"
            ).trim(),

          email:
            get(
              "email"
            ).trim(),

          endereco:
            get(
              "endereco"
            ).trim(),

          cargo:
            get(
              "cargo"
            ).trim(),

          setor:
            get(
              "setor"
            ),

          vinculo:
            get(
              "vinculo"
            ),

          status:

            status,

          motivoInatividade:

            motivoInatividade,

          dataInatividade:

            dataInatividade,

          turno:
            get(
              "turno"
            ),

          cargaHoraria:
            get(
              "cargaHoraria"
            ).trim(),

          dataAdmissao:
            get(
              "dataAdmissao"
            ) || null,

          dataEntradaEscola:
            get(
              "dataEntradaEscola"
            ) || null,

          formacao:
            get(
              "formacao"
            ).trim(),

          especializacao:
            get(
              "especializacao"
            ).trim(),

          observacoes:
            get(
              "observacoes"
            ).trim()

        }

      );


      App.toast(
        "Dados atualizados com sucesso!"
      );


      setTimeout(
        () =>
          window.location.href =
            "funcionarios.html",

        800
      );


    } catch (err) {

      console.error(err);


      App.toast(

        "Erro ao atualizar: " +
        (err.message || err),

        "danger"

      );


      if (btn) {
        btn.disabled =
          false;
      }

    }

  }

};


/* =========================================================
   NOVO FUNCIONÁRIO
   ========================================================= */

const NovoFuncionarioPage = {

  async init() {

    App.layout(

      "Novo Funcionário",

      "Cadastro completo de servidor da escola",

      this.form()

    );


    document
      .getElementById(
        "novoFuncForm"
      )
      ?.addEventListener(
        "submit",
        e =>
          this.save(e)
      );

  },


  esc(value = "") {

    return App.escapeHTML(
      value
    );

  },


  form() {

    return `

      <style>

        .fxn-grid {

          display:grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                220px,
                1fr
              )
            );

          gap:14px;

        }


        .fxn-full {

          grid-column:
            1 / -1;

        }


        .fxn-section {

          font-weight:800;

          font-size:16px;

          margin:
            4px 0 12px;

          color:#101828;

        }


        @media(max-width:900px) {

          .fxn-grid {

            grid-template-columns:
              1fr 1fr;

          }

        }


        @media(max-width:620px) {

          .fxn-grid {

            grid-template-columns:
              1fr;

          }


          .fxn-full {

            grid-column:auto;

          }

        }

      </style>


      <div
        class="card panel"
      >

        <form
          id="novoFuncForm"
          class="form"
        >


          <div
            class="fxn-section"
          >
            Dados pessoais
          </div>


          <div
            class="fxn-grid"
          >


            <div class="field">

              <label
                for="nome"
              >
                Nome Completo *
              </label>

              <input
                id="nome"
                class="input"
                required
                placeholder="Digite o nome completo"
              >

            </div>


            <div class="field">

              <label
                for="matricula"
              >
                Matrícula
              </label>

              <input
                id="matricula"
                class="input"
                placeholder="Ex.: 9801782"
              >

            </div>


            <div class="field">

              <label
                for="cpf"
              >
                CPF
              </label>

              <input
                id="cpf"
                class="input"
                placeholder="000.000.000-00"
              >

            </div>


            <div class="field">

              <label
                for="dataNascimento"
              >
                Data de nascimento
              </label>

              <input
                id="dataNascimento"
                class="input"
                type="date"
              >

            </div>


            <div class="field">

              <label
                for="naturalidade"
              >
                Naturalidade
              </label>

              <input
                id="naturalidade"
                class="input"
                placeholder="Ex.: Montes Claros - MG"
              >

            </div>


            <div class="field">

              <label
                for="telefone"
              >
                Telefone
              </label>

              <input
                id="telefone"
                class="input"
              >

            </div>


            <div class="field">

              <label
                for="email"
              >
                E-mail
              </label>

              <input
                id="email"
                class="input"
                type="email"
              >

            </div>


            <div
              class="field fxn-full"
            >

              <label
                for="endereco"
              >
                Endereço
              </label>

              <input
                id="endereco"
                class="input"
                placeholder="Rua, número, bairro..."
              >

            </div>


          </div>


          <div
            class="fxn-section"
            style="margin-top:20px"
          >
            Dados funcionais
          </div>


          <div
            class="fxn-grid"
          >


            <div class="field">

              <label
                for="cargo"
              >
                Cargo / Função
              </label>

              <input
                id="cargo"
                class="input"
                placeholder="Ex.: PEB I REGENTE"
              >

            </div>


            <div class="field">

              <label
                for="setor"
              >
                Setor
              </label>

              <select
                id="setor"
                class="input"
              >

                <option
                  value="Administrativo"
                >
                  Administrativo
                </option>

                <option
                  value="Pedagógico"
                >
                  Pedagógico
                </option>

                <option
                  value="Outro"
                >
                  Outro
                </option>

              </select>

            </div>


            <div class="field">

              <label
                for="vinculo"
              >
                Vínculo *
              </label>

              <select
                id="vinculo"
                class="input"
                required
              >

                <option
                  value="Efetivo"
                >
                  Efetivo
                </option>

                <option
                  value="Contratado"
                >
                  Contratado
                </option>

              </select>

            </div>


            <div class="field">

              <label
                for="status"
              >
                Situação do servidor *
              </label>

              <select
                id="status"
                class="input"
                required
              >

                <option
                  value="Ativo"
                  selected
                >
                  Ativo
                </option>

                <option
                  value="Inativo"
                >
                  Inativo
                </option>

              </select>

            </div>


            <div class="field">

              <label
                for="turno"
              >
                Turno
              </label>

              <select
                id="turno"
                class="input"
              >

                <option
                  value=""
                >
                  Selecione
                </option>

                <option>
                  Matutino
                </option>

                <option>
                  Vespertino
                </option>

                <option>
                  Integral
                </option>

                <option>
                  Noturno
                </option>

                <option>
                  Outro
                </option>

              </select>

            </div>


            <div class="field">

              <label
                for="cargaHoraria"
              >
                Carga horária
              </label>

              <input
                id="cargaHoraria"
                class="input"
                placeholder="Ex.: 24h, 30h, 40h"
              >

            </div>


            <div class="field">

              <label
                for="dataAdmissao"
              >
                Data de admissão
              </label>

              <input
                id="dataAdmissao"
                class="input"
                type="date"
              >

            </div>


            <div class="field">

              <label
                for="dataEntradaEscola"
              >
                Data de entrada na escola
              </label>

              <input
                id="dataEntradaEscola"
                class="input"
                type="date"
              >

            </div>


          </div>


          <div
            id="novoBlocoInatividade"
          ></div>


          <div
            class="fxn-section"
            style="margin-top:20px"
          >
            Formação
          </div>


          <div
            class="fxn-grid"
          >


            <div class="field">

              <label
                for="formacao"
              >
                Formação
              </label>

              <input
                id="formacao"
                class="input"
                placeholder="Ex.: Ensino Médio, Licenciatura..."
              >

            </div>


            <div class="field">

              <label
                for="especializacao"
              >
                Especialização
              </label>

              <input
                id="especializacao"
                class="input"
              >

            </div>


            <div
              class="field fxn-full"
            >

              <label
                for="observacoes"
              >
                Observações
              </label>

              <textarea
                id="observacoes"
                class="input"
                rows="4"
                placeholder="Informações adicionais..."
              ></textarea>

            </div>


          </div>


          <div
            class="form-actions"
          >

            <a
              href="funcionarios.html"
              class="btn btn-secondary"
            >
              Cancelar
            </a>


            <button
              type="submit"
              class="btn btn-primary"
            >
              Salvar Funcionário
            </button>

          </div>


        </form>

      </div>

    `;

  },


  async save(e) {

    e.preventDefault();


    const btn =
      e.target.querySelector(
        'button[type="submit"]'
      );


    if (btn) {
      btn.disabled =
        true;
    }


    try {

      const get =
        idCampo =>
          document
            .getElementById(
              idCampo
            )
            ?.value ||
          "";


      const status =
        get(
          "status"
        ) ||
        "Ativo";


      let motivoInatividade =
        null;


      let dataInatividade =
        null;


      if (
        status ===
        "Inativo"
      ) {

        App.openModal({

          title:
            "Inativar novo servidor",

          body: `

            <div
              class="fx-modal-danger"
            >

              O servidor está sendo
              cadastrado como
              <strong>Inativo</strong>.

              <br><br>

              Informe o motivo e a data
              da inativação.

            </div>


            <div class="field">

              <label
                for="novoMotivoInatividade"
              >
                Motivo da inativação *
              </label>

              <textarea
                id="novoMotivoInatividade"
                class="input"
                rows="4"
                placeholder="Informe o motivo..."
              ></textarea>

            </div>


            <div
              class="field"
              style="margin-top:12px"
            >

              <label
                for="novoDataInatividade"
              >
                Data da inativação *
              </label>

              <input
                id="novoDataInatividade"
                class="input"
                type="date"
                value="${FuncionariosPage.hojeISO()}"
              >

            </div>

          `,

          footer: `

            <button
              type="button"
              class="btn btn-secondary"
              data-close-modal
            >
              Cancelar
            </button>


            <button
              type="button"
              class="btn btn-danger"
              id="confirmarNovoInativo"
            >
              Continuar cadastro
            </button>

          `

        });


        document
          .getElementById(
            "confirmarNovoInativo"
          )
          ?.addEventListener(
            "click",
            async () => {

              const motivo =
                String(
                  document
                    .getElementById(
                      "novoMotivoInatividade"
                    )
                    ?.value ||
                  ""
                ).trim();


              const data =
                String(
                  document
                    .getElementById(
                      "novoDataInatividade"
                    )
                    ?.value ||
                  ""
                ).trim();


              if (!motivo) {

                App.toast(
                  "Informe o motivo da inativação.",
                  "warning"
                );

                return;

              }


              if (!data) {

                App.toast(
                  "Informe a data da inativação.",
                  "warning"
                );

                return;

              }


              motivoInatividade =
                motivo;


              dataInatividade =
                data;


              App.closeModal();


              await this.salvarNovo(
                get,
                status,
                motivoInatividade,
                dataInatividade,
                btn
              );

            }
          );


        return;

      }


      await this.salvarNovo(
        get,
        status,
        motivoInatividade,
        dataInatividade,
        btn
      );


    } catch (err) {

      console.error(err);

      App.toast(

        "Erro ao cadastrar funcionário: " +
        (err.message || err),

        "danger"

      );


      if (btn) {
        btn.disabled =
          false;
      }

    }

  },


  async salvarNovo(
    get,
    status,
    motivoInatividade,
    dataInatividade,
    btn
  ) {

    try {

      await App.add(

        "funcionarios",

        {

          nome:
            get("nome")
              .trim(),

          matricula:
            get("matricula")
              .trim(),

          cpf:
            get("cpf")
              .trim(),

          dataNascimento:
            get(
              "dataNascimento"
            ) || null,

          naturalidade:
            get(
              "naturalidade"
            ).trim(),

          telefone:
            get(
              "telefone"
            ).trim(),

          email:
            get(
              "email"
            ).trim(),

          endereco:
            get(
              "endereco"
            ).trim(),

          cargo:
            get(
              "cargo"
            ).trim(),

          setor:
            get(
              "setor"
            ),

          vinculo:
            get(
              "vinculo"
            ),

          status:
            status,

          motivoInatividade:
            motivoInatividade,

          dataInatividade:
            dataInatividade,

          turno:
            get(
              "turno"
            ),

          cargaHoraria:
            get(
              "cargaHoraria"
            ).trim(),

          dataAdmissao:
            get(
              "dataAdmissao"
            ) || null,

          dataEntradaEscola:
            get(
              "dataEntradaEscola"
            ) || null,

          formacao:
            get(
              "formacao"
            ).trim(),

          especializacao:
            get(
              "especializacao"
            ).trim(),

          observacoes:
            get(
              "observacoes"
            ).trim()

        }

      );


      App.toast(
        "Funcionário cadastrado com sucesso!"
      );


      setTimeout(
        () =>
          window.location.href =
            "funcionarios.html",

        800
      );


    } catch (err) {

      console.error(err);


      App.toast(

        "Erro ao cadastrar funcionário: " +
        (err.message || err),

        "danger"

      );


      if (btn) {
        btn.disabled =
          false;
      }

    }

  }

};