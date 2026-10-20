const UsuariosPage = {
  async init() {
    try { await App.requireRoles(["administrador"]); }
    catch (e) { App.toast(e.message, "danger"); return; }
    try {
      const usuarios =
        await App.rest(
          "/usuarios_perfis" +
          "?select=*" +
          "&order=nome.asc"
        );
      const acessos =
        await App.rest(
          "/acessos" +
          "?select=*" +
          "&order=entrou_em.desc"
        );
      const ultimo = {};
      for (
        const acesso
        of
        acessos || []
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
      App.layout(
        "Usuários",
        "Gerencie os perfis autorizados a acessar o sistema",
        `
          <style>
            .usr-grid {
              display:grid;
              grid-template-columns:
                repeat(
                  4,
                  1fr
                );
              gap:12px;
              margin-bottom:16px;
            }
            .usr-card {
              background:#fff;
              border:
                1px solid
                #e4e7ec;
              border-radius:12px;
              padding:16px;
            }
            .usr-card b {
              font-size:24px;
              display:block;
              margin-top:4px;
            }
            .usr-online {
              color:#027a48;
            }
            .usr-offline {
              color:#667085;
            }
            .usr-actions {
              display:flex;
              gap:6px;
              flex-wrap:wrap;
            }
            .usr-select {
              min-width:130px;
              padding:7px;
              border:
                1px solid
                #d0d5dd;
              border-radius:8px;
              background:#fff;
            }
            .usr-note {
              background:#eff8ff;
              border:
                1px solid
                #b2ddff;
              color:#175cd3;
              border-radius:10px;
              padding:12px;
              margin-bottom:16px;
            }
            @media(
              max-width:900px
            ) {
              .usr-grid {
                grid-template-columns:
                  1fr 1fr;
              }
            }
          </style>
          <div
            class="page-header"
          >
            <div>
              <h2>
                Usuários do sistema
              </h2>
              <p>
                Ative, inative e defina
                o perfil de cada usuário.
              </p>
            </div>
            <div
              class="actions no-print"
            >
              <a
                class="btn btn-secondary"
                href="acessos.html"
              >
                🔐 Ver acessos
              </a>
            </div>
          </div>
          <div
            class="usr-note no-print"
          >
            Para criar um
            <strong>
              NOVO login
            </strong>,
            crie primeiro o usuário em
            <strong>
              Supabase →
              Authentication →
              Users
            </strong>
            usando
            <strong>
              usuario@eunicecarneiro.local
            </strong>.
            O perfil precisa ser autorizado pelo administrador. Se não aparecer, use o SQL 03_NOVOS_USUARIOS.sql incluído no pacote.
          </div>
          <div
            class="usr-grid"
          >
            <div
              class="usr-card"
            >
              Total
              <b>
                ${usuarios.length}
              </b>
            </div>
            <div
              class="usr-card"
            >
              Ativos
              <b>
                ${
                  usuarios.filter(
                    u =>
                      u.ativo !==
                      false
                  ).length
                }
              </b>
            </div>
            <div
              class="usr-card"
            >
              Inativos
              <b>
                ${
                  usuarios.filter(
                    u =>
                      u.ativo ===
                      false
                  ).length
                }
              </b>
            </div>
            <div
              class="usr-card"
            >
              Administradores
              <b>
                ${
                  usuarios.filter(
                    u =>
                      u.perfil ===
                      "administrador"
                  ).length
                }
              </b>
            </div>
          </div>
          <div
            class="card panel"
          >
            <div
              class="panel-header"
            >
              <h3>
                Usuários cadastrados
              </h3>
              <span
                class="
                  badge
                  badge-hours
                "
              >
                ${usuarios.length}
                no total
              </span>
            </div>
            <div
              class="table-wrap"
            >
              <table>
                <thead>
                  <tr>
                    <th>
                      Nome
                    </th>
                    <th>
                      Usuário
                    </th>
                    <th>
                      Perfil
                    </th>
                    <th>
                      Situação
                    </th>
                    <th>
                      Último acesso
                    </th>
                    <th
                      class="no-print"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    usuarios.map(
                      u => {
                        const acesso =
                          ultimo[
                            u.id
                          ];
                        const online =
                          acesso &&
                          !acesso.saiu_em &&
                          (
                            Date.now() -
                            new Date(
                              acesso
                                .ultima_atividade
                            ).getTime()
                            < 130000
                          );
                        return `
                          <tr>
                            <td>
                              <input
                                class="input"
                                id="nome_${App.safeUUID(u.id)}"
                                value="${App.escapeHTML(
                                  u.nome ||
                                  ""
                                )}"
                                style="
                                  min-width:
                                    190px
                                "
                              >
                            </td>
                            <td>
                              <strong>
                                ${App.escapeHTML(
                                  u.username ||
                                  ""
                                )}
                              </strong>
                            </td>
                            <td>
                              <select
                                class="usr-select"
                                id="perfil_${App.safeUUID(u.id)}"
                              >
                                <option
                                  value="administrador"
                                  ${
                                    u.perfil ===
                                    "administrador"
                                      ? "selected"
                                      : ""
                                  }
                                >
                                  Administrador
                                </option>
                                <option
                                  value="secretaria"
                                  ${
                                    u.perfil ===
                                    "secretaria"
                                      ? "selected"
                                      : ""
                                  }
                                >
                                  Secretaria
                                </option>
                                <option
                                  value="consulta"
                                  ${
                                    u.perfil ===
                                    "consulta"
                                      ? "selected"
                                      : ""
                                  }
                                >
                                  Consulta
                                </option>
                              </select>
                            </td>
                            <td>
                              <span
                                class="
                                  badge
                                  ${
                                    u.ativo ===
                                    false
                                      ? "badge-days"
                                      : "badge-hours"
                                  }
                                "
                              >
                                ${
                                  u.ativo ===
                                  false
                                    ? "Inativo"
                                    : "Ativo"
                                }
                              </span>
                              <br>
                              <small
                                class="${
                                  online
                                    ? "usr-online"
                                    : "usr-offline"
                                }"
                              >
                                ${
                                  online
                                    ? "● Online"
                                    : "● Offline"
                                }
                              </small>
                            </td>
                            <td>
                              ${
                                acesso
                                  ? this.dataHora(
                                      acesso
                                        .ultima_atividade
                                      ||
                                      acesso
                                        .entrou_em
                                    )
                                  : "—"
                              }
                            </td>
                            <td
                              class="no-print"
                            >
                              <div
                                class="usr-actions"
                              >
                                <button data-write
                                  class="
                                    btn
                                    btn-primary
                                    btn-sm
                                  "
                                  data-acao-sistema="usuario-salvar" data-id="${App.safeUUID(u.id)}"
                                >
                                  Salvar
                                </button>
                                <button data-write
                                  class="
                                    btn
                                    ${
                                      u.ativo ===
                                      false
                                        ? "btn-secondary"
                                        : "btn-danger"
                                    }
                                    btn-sm
                                  "
                                  data-acao-sistema="usuario-alternar" data-id="${App.safeUUID(u.id)}" data-ativo="${u.ativo === false ? "true" : "false"}"
                                >
                                  ${
                                    u.ativo ===
                                    false
                                      ? "Ativar"
                                      : "Inativar"
                                  }
                                </button>
                              </div>
                            </td>
                          </tr>
                        `;
                      }
                    ).join("")
                  }
                </tbody>
              </table>
            </div>
          </div>
        `
      );
    } catch (erro) {
      console.error(
        erro
      );
      App.toast(
        "Erro ao carregar usuários: " +
        (
          erro.message ||
          erro
        ),
        "danger"
      );
    }
  },
  dataHora(valor) {
    if (!valor) {
      return "—";
    }
    return new Date(
      valor
    ).toLocaleString(
      "pt-BR"
    );
  },
  async salvar(id) {
    try {
      const nome =
        document
          .getElementById(
            `nome_${id}`
          )
          .value
          .trim();
      const perfil =
        document
          .getElementById(
            `perfil_${id}`
          )
          .value;
      await App.rest("/rpc/ec_atualizar_usuario", { method: "POST", body: JSON.stringify({ p_id: id, p_nome: nome, p_perfil: perfil, p_ativo: null }) });
      App.toast(
        "Usuário atualizado com sucesso!"
      );
      await this.init();
    } catch (erro) {
      App.toast(
        "Erro ao atualizar usuário: " +
        (
          erro.message ||
          erro
        ),
        "danger"
      );
    }
  },
  async alternar(
    id,
    novoValor
  ) {
    try {
      if (typeof novoValor !== "boolean") throw new Error("Situação inválida.");
      await App.rest("/rpc/ec_atualizar_usuario", { method: "POST", body: JSON.stringify({ p_id: id, p_nome: null, p_perfil: null, p_ativo: novoValor }) });
      App.toast(
        novoValor
          ? "Usuário ativado!"
          : "Usuário inativado!"
      );
      await this.init();
    } catch (erro) {
      App.toast(
        "Erro ao alterar usuário: " +
        (
          erro.message ||
          erro
        ),
        "danger"
      );
    }
  }
};
