const AcessosPage = {

  async init() {

    let perfil =
      App.getProfile();


    if (!perfil) {

      perfil =
        await App
          .carregarPerfilAtual();

    }


    if (
      !perfil ||
      perfil.perfil !==
      "administrador"
    ) {

      App.toast(
        "Acesso restrito ao administrador.",
        "danger"
      );


      setTimeout(
        () =>
          location.href =
            "index.html",
        800
      );


      return;

    }


    try {

      const [
        usuarios,
        acessos
      ] = await Promise.all([

        App.rest(

          "/usuarios_perfis" +
          "?select=*" +
          "&order=nome.asc"

        ),

        App.rest(

          "/acessos" +
          "?select=*" +
          "&order=entrou_em.desc" +
          "&limit=500"

        )

      ]);


      this.usuarios =
        usuarios ||
        [];


      this.acessos =
        acessos ||
        [];


      this.map =
        Object.fromEntries(

          this.usuarios.map(
            u =>
              [
                u.id,
                u
              ]
          )

        );


      App.layout(

        "Acessos",

        "Acompanhe quem está utilizando o sistema e o histórico de entradas",

        `

          <style>

            .acc-online {

              color:#027a48;

              font-weight:700;

            }


            .acc-offline {

              color:#667085;

            }


            .acc-grid {

              display:grid;

              grid-template-columns:
                repeat(
                  3,
                  1fr
                );

              gap:12px;

              margin-bottom:16px;

            }


            .acc-card {

              background:#fff;

              border:
                1px solid
                #e4e7ec;

              border-radius:12px;

              padding:16px;

            }


            .acc-card b {

              font-size:24px;

              display:block;

              margin-top:4px;

            }


            .acc-filter {

              display:grid;

              grid-template-columns:
                2fr 1fr;

              gap:10px;

              margin-bottom:16px;

            }


            @media(
              max-width:700px
            ) {

              .acc-grid,
              .acc-filter {

                grid-template-columns:
                  1fr;

              }

            }

          </style>


          <div
            class="page-header"
          >

            <div>

              <h2>
                Monitoramento de acessos
              </h2>

              <p>
                Usuários online e histórico
                de utilização do sistema.
              </p>

            </div>


            <div
              class="actions no-print"
            >

              <a
                class="btn btn-secondary"
                href="usuarios.html"
              >
                👤 Usuários
              </a>


              <button
                class="btn btn-secondary"
                onclick="
                  AcessosPage.init()
                "
              >
                Atualizar
              </button>

            </div>

          </div>


          <div
            class="acc-grid"
          >

            <div
              class="acc-card"
            >

              Usuários cadastrados

              <b>
                ${this.usuarios.length}
              </b>

            </div>


            <div
              class="acc-card"
            >

              Online agora

              <b>
                ${this.onlineAgora().length}
              </b>

            </div>


            <div
              class="acc-card"
            >

              Registros exibidos

              <b>
                ${this.acessos.length}
              </b>

            </div>

          </div>


          <div
            class="card panel no-print"
            style="
              margin-bottom:
                16px
            "
          >

            <div
              class="acc-filter"
            >

              <div
                class="field"
              >

                <label>
                  Pesquisar usuário
                </label>

                <input
                  id="accBusca"
                  class="input"
                  placeholder="Digite o nome ou usuário..."
                >

              </div>


              <div
                class="field"
              >

                <label>
                  Status
                </label>

                <select
                  id="accStatus"
                  class="input"
                >

                  <option
                    value="todos"
                  >
                    Todos
                  </option>

                  <option
                    value="online"
                  >
                    Online
                  </option>

                  <option
                    value="offline"
                  >
                    Offline
                  </option>

                </select>

              </div>

            </div>

          </div>


          <div
            class="card panel"
          >

            <div
              class="panel-header"
            >

              <h3>
                Histórico de acessos
              </h3>

              <span
                class="
                  badge
                  badge-hours
                "
                id="accTotal"
              >

                ${this.acessos.length}
                registro(s)

              </span>

            </div>


            <div
              id="accTabela"
            ></div>

          </div>

        `

      );


      document
        .getElementById(
          "accBusca"
        )
        ?.addEventListener(
          "input",
          () =>
            this.render()
        );


      document
        .getElementById(
          "accStatus"
        )
        ?.addEventListener(
          "change",
          () =>
            this.render()
        );


      this.render();


    } catch (erro) {

      console.error(
        erro
      );


      App.toast(

        "Erro ao carregar acessos: " +
        (
          erro.message ||
          erro
        ),

        "danger"

      );

    }

  },


  online(acesso) {

    return !!(

      acesso &&

      !acesso.saiu_em &&

      acesso
        .ultima_atividade &&

      (
        Date.now() -

        new Date(
          acesso
            .ultima_atividade
        ).getTime()

        < 130000
      )

    );

  },


  onlineAgora() {

    const ultimo = {};


    for (
      const acesso
      of
      this.acessos
    ) {

      if (
        !ultimo[
          acesso.user_id
        ]
      ) {

        ultimo[
          acesso.user_id
        ] =
          acesso;

      }

    }


    return Object
      .values(
        ultimo
      )
      .filter(
        acesso =>
          this.online(
            acesso
          )
      );

  },


  dataHora(valor) {

    return valor

      ? new Date(
          valor
        )
          .toLocaleString(
            "pt-BR"
          )

      : "—";

  },


  render() {

    const busca =
      String(

        document
          .getElementById(
            "accBusca"
          )
          ?.value ||
        ""

      )
        .toLowerCase()
        .trim();


    const status =

      document
        .getElementById(
          "accStatus"
        )
        ?.value

      ||

      "todos";


    const lista =
      this.acessos.filter(
        acesso => {

          const usuario =
            this.map[
              acesso.user_id
            ] ||
            {};


          const texto =
            `${
              usuario.nome ||
              ""
            } ${
              usuario.username ||
              ""
            }`
              .toLowerCase();


          const online =
            this.online(
              acesso
            );


          return (

            (
              !busca ||

              texto.includes(
                busca
              )
            )

            &&

            (
              status ===
              "todos"

              ||

              (
                status ===
                "online"

                &&

                online
              )

              ||

              (
                status ===
                "offline"

                &&

                !online
              )
            )

          );

        }
      );


    document
      .getElementById(
        "accTotal"
      )
      .textContent =

        `${lista.length} registro(s)`;


    document
      .getElementById(
        "accTabela"
      )
      .innerHTML =

        lista.length

          ? `

            <div
              class="table-wrap"
            >

              <table>

                <thead>

                  <tr>

                    <th>
                      Usuário
                    </th>

                    <th>
                      Entrada
                    </th>

                    <th>
                      Última atividade
                    </th>

                    <th>
                      Saída
                    </th>

                    <th>
                      Página
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  ${
                    lista.map(
                      acesso => {

                        const usuario =
                          this.map[
                            acesso.user_id
                          ] ||
                          {};


                        const online =
                          this.online(
                            acesso
                          );


                        return `

                          <tr>

                            <td>

                              <strong>

                                ${App.escapeHTML(
                                  usuario.nome ||
                                  "Usuário"
                                )}

                              </strong>

                              <br>

                              <small>

                                ${App.escapeHTML(
                                  usuario.username ||
                                  ""
                                )}

                              </small>

                            </td>


                            <td>

                              ${this.dataHora(
                                acesso.entrou_em
                              )}

                            </td>


                            <td>

                              ${this.dataHora(
                                acesso
                                  .ultima_atividade
                              )}

                            </td>


                            <td>

                              ${this.dataHora(
                                acesso.saiu_em
                              )}

                            </td>


                            <td>

                              ${App.escapeHTML(
                                acesso
                                  .pagina_atual
                                ||
                                "—"
                              )}

                            </td>


                            <td
                              class="${
                                online
                                  ? "acc-online"
                                  : "acc-offline"
                              }"
                            >

                              ${
                                online
                                  ? "● Online"
                                  : "● Offline"
                              }

                            </td>

                          </tr>

                        `;

                      }

                    ).join("")
                  }

                </tbody>

              </table>

            </div>

          `

          : `

            <div
              class="empty"
            >

              <strong>
                Nenhum acesso encontrado
              </strong>

            </div>

          `;

  }

};