const RelatoriosPage = {
  async init() {
    try { await App.requireRoles(["administrador", "secretaria"]); }
    catch (e) { App.toast(e.message, "danger"); return; }
    const funcs =
      await App.getAll("funcionarios");
    const decls =
      await App.getAll("declaracoes");
    this.state = {
      funcionarios:
        funcs,
      declaracoes:
        decls,
      funcionarioId:
        "todos",
      pesquisaFuncionario:
        "",
      tipo:
        "todos",
      inicio:
        "",
      fim:
        "",
      ordenacao:
        "data_desc"
    };
    App.layout(
      "Relatórios",
      "Análise consolidada das declarações",
      `
      <style>
        .filter-card {
          background:#ffffff;
          border:1px solid #e5e7eb;
          border-radius:12px;
          padding:20px;
          box-shadow:
            0 1px 3px rgba(0,0,0,.05);
          margin-bottom:24px;
        }
        .filter-grid {
          display:grid;
          grid-template-columns:
            2fr
            1.5fr
            1fr
            1fr
            1.5fr;
          gap:16px;
          align-items:flex-end;
        }
        @media (max-width: 1200px) {
          .filter-grid {
            grid-template-columns:
              repeat(3, 1fr);
          }
        }
        @media (max-width: 992px) {
          .filter-grid {
            grid-template-columns:
              1fr 1fr;
          }
        }
        @media (max-width: 576px) {
          .filter-grid {
            grid-template-columns:
              1fr;
          }
        }
        .filter-group {
          display:flex;
          flex-direction:column;
          gap:6px;
        }
        .filter-label {
          font-size:13px;
          font-weight:600;
          color:#374151;
          margin:0;
        }
        .filter-control {
          width:100%;
          height:42px;
          padding:8px 12px;
          font-size:14px;
          color:#1f2937;
          background-color:#f9fafb;
          border:1px solid #d1d5db;
          border-radius:8px;
          outline:none;
          transition:all .2s ease;
          box-sizing:border-box;
        }
        .filter-control:focus {
          background-color:#ffffff;
          border-color:#2563eb;
          box-shadow:
            0 0 0 3px
            rgba(37,99,235,.1);
        }
        .rel-func-pesquisa { position:relative; min-width:0; }
        .rel-func-pesquisa input { padding-right:38px; }
        .rel-func-limpar {
          position:absolute; right:5px; top:5px; width:32px; height:32px;
          border:0; border-radius:5px; background:transparent;
          color:#475467; cursor:pointer; font-size:20px;
        }
        .rel-func-limpar:hover { background:#eaf0fa; }
        .rel-func-opcoes {
          position:absolute; top:calc(100% + 5px); left:0; right:0;
          max-height:280px; overflow-y:auto; z-index:50;
          background:#fff; border:1px solid #d1d5db; border-radius:8px;
          box-shadow:0 8px 24px #10182820;
        }
        .rel-func-opcoes[hidden], .rel-func-limpar[hidden] { display:none; }
        .rel-func-opcao { padding:10px 12px; cursor:pointer; overflow-wrap:anywhere; }
        .rel-func-opcao:hover, .rel-func-opcao.ativa { background:#eff6ff; color:#1d4ed8; }
        .rel-func-opcao small { display:block; color:#667085; margin-top:3px; }
        .rel-func-vazio { padding:12px; color:#667085; font-size:13px; }
        .rel-func-status { margin:10px 0 0; color:#667085; font-size:13px; }
        .stat-card-custom {
          background:#ffffff;
          border:1px solid #e5e7eb;
          border-radius:12px;
          padding:20px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          box-shadow:
            0 1px 3px rgba(0,0,0,.05);
        }
        .stat-card-custom .stat-label {
          font-size:13px;
          font-weight:500;
          color:#6b7280;
          margin-bottom:6px;
        }
        .stat-card-custom .stat-value {
          font-size:24px;
          font-weight:700;
          color:#111827;
        }
        .ordenacao-info {
          margin-top:12px;
          font-size:13px;
          color:#6b7280;
        }
        .ordem-badge {
          display:inline-block;
          margin-left:5px;
          font-weight:600;
          color:#2563eb;
        }
        @media print {
          .no-print {
            display:none !important;
          }
        }
      </style>
      <div
        class="page-header"
        style="margin-bottom:24px;"
      >
        <div>
          <h2
            style="
              margin:0;
              font-size:24px;
              color:#111827;
            "
          >
            Relatórios
          </h2>
          <p
            style="
              margin:4px 0 0;
              color:#6b7280;
              font-size:14px;
            "
          >
            Filtre os lançamentos e gere um resumo
            para impressão ou CSV.
          </p>
        </div>
        <div
          class="actions no-print"
          style="
            display:flex;
            gap:10px;
          "
        >
          <button
            class="btn btn-secondary"
            id="btnImprimir"
          >
            🖨 Imprimir relatório
          </button>
          <button data-write
            class="btn btn-primary"
            id="btnExportar"
          >
            ⬇ Exportar CSV
          </button>
        </div>
      </div>
      <!-- =========================================
           FILTROS
      ========================================== -->
      <div
        class="filter-card no-print"
      >
        <div class="filter-grid">
          <!-- FUNCIONÁRIO -->
          <div class="filter-group">
            <label
              class="filter-label"
              for="filtroFuncionario"
            >
              Funcionário
            </label>
            <div class="rel-func-pesquisa" id="pesquisaFuncionarioRelatorio">
              <input class="filter-control" id="filtroFuncionario" type="text"
                role="combobox" aria-autocomplete="list" aria-expanded="false"
                aria-controls="opcoesFuncionarioRelatorio" aria-describedby="statusPesquisaFuncionario"
                placeholder="Digite o nome ou matrícula..." autocomplete="off" maxlength="220">
              <button type="button" class="rel-func-limpar" id="limparFuncionarioRelatorio"
                aria-label="Mostrar todos os funcionários" hidden>×</button>
              <div class="rel-func-opcoes" id="opcoesFuncionarioRelatorio" role="listbox"
                aria-label="Funcionários encontrados" hidden></div>
            </div>
          </div>
          <!-- TIPO -->
          <div class="filter-group">
            <label
              class="filter-label"
              for="filtroTipo"
            >
              Tipo de Declaração
            </label>
            <select
              class="filter-control"
              id="filtroTipo"
            >
              <option value="todos">
                Todos os tipos
              </option>
              <option value="horas">
                Horas
              </option>
              <option value="dias">
                Dias
              </option>
            </select>
          </div>
          <!-- DATA INICIAL -->
          <div class="filter-group">
            <label
              class="filter-label"
              for="filtroInicio"
            >
              Data inicial
            </label>
            <input
              type="date"
              class="filter-control"
              id="filtroInicio"
            >
          </div>
          <!-- DATA FINAL -->
          <div class="filter-group">
            <label
              class="filter-label"
              for="filtroFim"
            >
              Data final
            </label>
            <input
              type="date"
              class="filter-control"
              id="filtroFim"
            >
          </div>
          <!-- ORDENAÇÃO -->
          <div class="filter-group">
            <label
              class="filter-label"
              for="filtroOrdenacao"
            >
              Ordenar por
            </label>
            <select
              class="filter-control"
              id="filtroOrdenacao"
            >
              <option
                value="data_desc"
              >
                Data / Período
                — mais recente
              </option>
              <option
                value="nome_asc"
              >
                Funcionário
                — A–Z
              </option>
            </select>
          </div>
        </div>
        <p class="rel-func-status" id="statusPesquisaFuncionario" role="status"
          aria-live="polite" aria-atomic="true">
          Todos os funcionários. Digite um nome ou matrícula para pesquisar.
        </p>
        <div
          class="ordenacao-info"
        >
          Ordenação atual:
          <span
            class="ordem-badge"
            id="ordemAtual"
          >
            Data / Período — mais recente
          </span>
        </div>
      </div>
      <!-- RESULTADO -->
      <div
        id="relatorioResultados"
      ></div>
      `
    );
    this.bindEvents();
    this.render();
  },
  /* ===================================================
     EVENTOS
  =================================================== */
  normalizarPesquisaFuncionario(texto) {
    return String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/\s+/g, " ").trim();
  },
  funcionariosEncontrados(texto) {
    const pesquisa = this.normalizarPesquisaFuncionario(texto);
    return this.state.funcionarios.filter(f =>
      this.normalizarPesquisaFuncionario(`${f.nome || ""} ${f.matricula || ""}`).includes(pesquisa)
    ).sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR", { sensitivity:"base" }));
  },
  configurarPesquisaFuncionario() {
    const campo = document.getElementById("filtroFuncionario");
    const lista = document.getElementById("opcoesFuncionarioRelatorio");
    const limpar = document.getElementById("limparFuncionarioRelatorio");
    const status = document.getElementById("statusPesquisaFuncionario");
    const grupo = document.getElementById("pesquisaFuncionarioRelatorio");
    let opcoes = [];
    let indice = -1;
    const fechar = () => {
      lista.hidden = true;
      campo.setAttribute("aria-expanded", "false");
      campo.removeAttribute("aria-activedescendant");
      indice = -1;
    };
    const mostrar = () => {
      const pesquisa = this.normalizarPesquisaFuncionario(this.state.pesquisaFuncionario);
      opcoes = this.funcionariosEncontrados(pesquisa);
      if (!pesquisa) opcoes.unshift({ id:"todos", nome:"Todos os funcionários" });
      indice = -1;
      campo.removeAttribute("aria-activedescendant");
      lista.innerHTML = opcoes.length ? opcoes.map((f, i) => {
        const detalhes = [f.matricula ? `Matrícula: ${f.matricula}` : "", f.cargo || ""].filter(Boolean).join(" · ");
        return `<div class="rel-func-opcao" id="rel-func-opcao-${i}" role="option"
          aria-selected="${String(f.id) === this.state.funcionarioId}" data-indice="${i}">
          ${App.escapeHTML(f.nome || "")}${detalhes ? `<small>${App.escapeHTML(detalhes)}</small>` : ""}</div>`;
      }).join("") : '<div class="rel-func-vazio">Nenhum funcionário encontrado.</div>';
      lista.hidden = false;
      campo.setAttribute("aria-expanded", "true");
      if (pesquisa) status.textContent = opcoes.length
        ? `${opcoes.length} funcionário(s) encontrado(s). Selecione uma pessoa para filtrar somente por ela.`
        : "Nenhum funcionário encontrado. Tente outro nome ou matrícula.";
    };
    const selecionar = opcao => {
      this.state.funcionarioId = String(opcao.id);
      this.state.pesquisaFuncionario = "";
      campo.value = opcao.id === "todos" ? "" : `${opcao.nome || ""}${opcao.matricula ? ` — ${opcao.matricula}` : ""}`;
      limpar.hidden = !campo.value;
      status.textContent = opcao.id === "todos"
        ? "Todos os funcionários. Digite um nome ou matrícula para pesquisar."
        : `Relatório de ${campo.value}.`;
      fechar();
      this.render();
    };
    campo.addEventListener("focus", mostrar);
    campo.addEventListener("input", () => {
      this.state.funcionarioId = "todos";
      this.state.pesquisaFuncionario = campo.value;
      limpar.hidden = !campo.value;
      if (!this.normalizarPesquisaFuncionario(campo.value)) {
        status.textContent = "Todos os funcionários. Digite um nome ou matrícula para pesquisar.";
      }
      mostrar();
      this.render();
    });
    campo.addEventListener("keydown", e => {
      if (e.isComposing) return;
      if (e.key === "Escape" || e.key === "Tab") { fechar(); return; }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (lista.hidden) mostrar();
        if (!opcoes.length) return;
        indice = e.key === "ArrowDown" ? (indice + 1) % opcoes.length
          : (indice <= 0 ? opcoes.length : indice) - 1;
        Array.from(lista.querySelectorAll('[role="option"]')).forEach((el, i) => {
          el.classList.toggle("ativa", i === indice);
          el.setAttribute("aria-selected", String(i === indice));
          if (i === indice) {
            campo.setAttribute("aria-activedescendant", el.id);
            el.scrollIntoView?.({ block:"nearest" });
          }
        });
      } else if (e.key === "Enter" && !lista.hidden) {
        e.preventDefault();
        if (indice >= 0) selecionar(opcoes[indice]);
        else if (opcoes.length === 1) selecionar(opcoes[0]);
      }
    });
    lista.addEventListener("pointerdown", e => e.preventDefault());
    lista.addEventListener("click", e => {
      const alvo = e.target.closest("[data-indice]");
      if (alvo && lista.contains(alvo)) selecionar(opcoes[Number(alvo.dataset.indice)]);
    });
    limpar.addEventListener("click", () => {
      selecionar({ id:"todos" });
      campo.focus();
    });
    grupo.addEventListener("focusout", e => { if (!grupo.contains(e.relatedTarget)) fechar(); });
    // Remove a escuta anterior se a página for inicializada novamente.
    this.pesquisaFuncionarioEventos?.abort();
    this.pesquisaFuncionarioEventos = new AbortController();
    document.addEventListener("pointerdown", e => { if (!grupo.contains(e.target)) fechar(); },
      { signal:this.pesquisaFuncionarioEventos.signal });
  },
  bindEvents() {
    this.configurarPesquisaFuncionario();
    document
      .getElementById(
        "filtroTipo"
      )
      ?.addEventListener(
        "change",
        e => {
          this.state.tipo =
            e.target.value;
          this.render();
        }
      );
    document
      .getElementById(
        "filtroInicio"
      )
      ?.addEventListener(
        "change",
        e => {
          this.state.inicio =
            e.target.value;
          this.render();
        }
      );
    document
      .getElementById(
        "filtroFim"
      )
      ?.addEventListener(
        "change",
        e => {
          this.state.fim =
            e.target.value;
          this.render();
        }
      );
    /* ============================================
       NOVO FILTRO DE ORDENAÇÃO
    ============================================= */
    document
      .getElementById(
        "filtroOrdenacao"
      )
      ?.addEventListener(
        "change",
        e => {
          this.state.ordenacao =
            e.target.value;
          this.atualizarTextoOrdenacao();
          this.render();
        }
      );
    document
      .getElementById(
        "btnImprimir"
      )
      ?.addEventListener(
        "click",
        () =>
          window.print()
      );
    document
      .getElementById(
        "btnExportar"
      )
      ?.addEventListener(
        "click",
        () =>
          this.exportCSV()
      );
  },
  /* ===================================================
     TEXTO DA ORDENAÇÃO
  =================================================== */
  atualizarTextoOrdenacao() {
    const elemento =
      document.getElementById(
        "ordemAtual"
      );
    if (!elemento) {
      return;
    }
    if (
      this.state.ordenacao ===
      "nome_asc"
    ) {
      elemento.textContent =
        "Funcionário — A–Z";
    } else {
      elemento.textContent =
        "Data / Período — mais recente";
    }
  },
  /* ===================================================
     FILTRO DOS DADOS
  =================================================== */
  getFiltered() {
    const {
      declaracoes,
      funcionarioId,
      tipo,
      inicio,
      fim
    } = this.state;
    const pesquisa = this.normalizarPesquisaFuncionario(this.state.pesquisaFuncionario);
    const idsPesquisa = pesquisa && funcionarioId === "todos"
      ? new Set(this.funcionariosEncontrados(pesquisa).map(f => String(f.id))) : null;
    return declaracoes.filter(
      d => {
        if (idsPesquisa && !idsPesquisa.has(String(d.funcionarioId))) return false;
        if (
          funcionarioId !==
          "todos"
          &&
          String(
            d.funcionarioId
          ) !==
          String(
            funcionarioId
          )
        ) {
          return false;
        }
        if (
          tipo !==
          "todos"
          &&
          d.tipo !==
          tipo
        ) {
          return false;
        }
        const dataRef =
          d.data ||
          d.dataInicial ||
          d.data_inicio ||
          d.dataFinal ||
          d.data_final ||
          "";
        if (
          inicio &&
          dataRef &&
          dataRef < inicio
        ) {
          return false;
        }
        if (
          fim &&
          dataRef &&
          dataRef > fim
        ) {
          return false;
        }
        return true;
      }
    );
  },
  /* ===================================================
     ORDENAR RESULTADOS
  =================================================== */
  getOrderedFiltered() {
    const lista =
      [...this.getFiltered()];
    const mapFunc =
      Object.fromEntries(
        this.state.funcionarios.map(
          f => [
            String(f.id),
            f
          ]
        )
      );
    /*
      ORDEM ALFABÉTICA
    */
    if (
      this.state.ordenacao ===
      "nome_asc"
    ) {
      lista.sort(
        (a, b) => {
          const fa =
            mapFunc[
              String(
                a.funcionarioId
              )
            ];
          const fb =
            mapFunc[
              String(
                b.funcionarioId
              )
            ];
          const nomeA =
            String(
              fa?.nome || ""
            ).trim();
          const nomeB =
            String(
              fb?.nome || ""
            ).trim();
          const comparacaoNome =
            nomeA.localeCompare(
              nomeB,
              "pt-BR",
              {
                sensitivity:
                  "base"
              }
            );
          if (
            comparacaoNome !== 0
          ) {
            return comparacaoNome;
          }
          /*
            Se os nomes forem iguais,
            ordena pela data mais recente.
          */
          const dataA =
            a.data ||
            a.dataInicial ||
            "";
          const dataB =
            b.data ||
            b.dataInicial ||
            "";
          return String(dataB)
            .localeCompare(
              String(dataA)
            );
        }
      );
      return lista;
    }
    /*
      ORDEM POR DATA
      MAIS RECENTE PRIMEIRO
    */
    lista.sort(
      (a, b) => {
        const dataA =
          a.data ||
          a.dataInicial ||
          a.data_inicio ||
          a.dataFinal ||
          a.data_final ||
          "";
        const dataB =
          b.data ||
          b.dataInicial ||
          b.data_inicio ||
          b.dataFinal ||
          b.data_final ||
          "";
        const comparacaoData =
          String(dataB)
            .localeCompare(
              String(dataA)
            );
        if (
          comparacaoData !== 0
        ) {
          return comparacaoData;
        }
        /*
          Se a data for igual,
          usa nome como segundo critério.
        */
        const fa =
          mapFunc[
            String(
              a.funcionarioId
            )
          ];
        const fb =
          mapFunc[
            String(
              b.funcionarioId
            )
          ];
        const nomeA =
          String(
            fa?.nome || ""
          ).trim();
        const nomeB =
          String(
            fb?.nome || ""
          ).trim();
        return nomeA.localeCompare(
          nomeB,
          "pt-BR",
          {
            sensitivity:
              "base"
          }
        );
      }
    );
    return lista;
  },
  /* ===================================================
     RENDER
  =================================================== */
  render() {
    const filtered =
      this.getOrderedFiltered();
    const mapFunc =
      Object.fromEntries(
        this.state.funcionarios.map(
          f => [
            String(f.id),
            f
          ]
        )
      );
    const totalHoras =
      filtered
        .filter(
          d =>
            d.tipo ===
            "horas"
        )
        .reduce(
          (
            acc,
            d
          ) =>
            acc +
            Number(
              d.quantidadeHoras ||
              0
            ),
          0
        );
    const totalDias =
      filtered
        .filter(
          d =>
            d.tipo ===
            "dias"
        )
        .reduce(
          (
            acc,
            d
          ) =>
            acc +
            Number(
              d.quantidadeDias ||
              0
            ),
          0
        );
    const funcsUnicos =
      new Set(
        filtered.map(
          d =>
            d.funcionarioId
        )
      ).size;
    const container =
      document.getElementById(
        "relatorioResultados"
      );
    if (!container) {
      return;
    }
    container.innerHTML = `
      <!-- ======================================
           CARDS RESUMO
      ======================================= -->
      <div
        style="
          display:grid;
          grid-template-columns:
            repeat(auto-fit,minmax(220px,1fr));
          gap:16px;
          margin-bottom:24px;
        "
      >
        <div
          class="stat-card-custom"
        >
          <div>
            <div
              class="stat-label"
            >
              Total de declarações
            </div>
            <div
              class="stat-value"
            >
              ${filtered.length}
            </div>
          </div>
        </div>
        <div
          class="stat-card-custom"
        >
          <div>
            <div
              class="stat-label"
            >
              Total de horas
            </div>
            <div
              class="stat-value"
            >
              ${totalHoras} h
            </div>
          </div>
        </div>
        <div
          class="stat-card-custom"
        >
          <div>
            <div
              class="stat-label"
            >
              Total de dias
            </div>
            <div
              class="stat-value"
            >
              ${totalDias} dia(s)
            </div>
          </div>
        </div>
        <div
          class="stat-card-custom"
        >
          <div>
            <div
              class="stat-label"
            >
              Funcionários com declarações
            </div>
            <div
              class="stat-value"
            >
              ${funcsUnicos}
            </div>
          </div>
        </div>
      </div>
      <!-- ======================================
           DETALHAMENTO
      ======================================= -->
      <div
        class="card panel"
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
            Detalhamento
          </h3>
          <span
            class="badge badge-hours"
          >
            ${filtered.length}
            registro(s)
          </span>
        </div>
        ${
          !filtered.length
            ?
            `
            <div
              class="empty"
            >
              <strong>
                Nenhum registro
              </strong>
              <p>
                Não há dados para os filtros selecionados.
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
                      Funcionário
                    </th>
                    <th>
                      Cargo / Setor
                    </th>
                    <th>
                      Tipo
                    </th>
                    <th>
                      Data / Período
                    </th>
                    <th>
                      Quantidade
                    </th>
                    <th>
                      Observação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    filtered.map(
                      d => {
                        const f =
                          mapFunc[
                            String(
                              d.funcionarioId
                            )
                          ];
                        const qtd =
                          d.tipo ===
                          "horas"
                            ?
                            `${Number(d.quantidadeHoras) || 0} h`
                            :
                            `${Number(d.quantidadeDias) || 0} dia(s)`;
                        const dataInicial =
                          d.dataInicial ||
                          d.data_inicio ||
                          d.data;
                        const dataFinal =
                          d.dataFinal ||
                          d.data_final ||
                          d.data;
                        const dataFmt =
                          d.tipo ===
                          "horas"
                            ?
                            App.formatDate(
                              d.data
                            )
                            :
                            `${App.formatDate(
                              dataInicial
                            )} até ${App.formatDate(
                              dataFinal
                            )}`;
                        return `
                          <tr>
                            <td>
                              <strong>
                                ${App.escapeHTML(
                                  f?.nome ||
                                  "Não encontrado"
                                )}
                              </strong>
                            </td>
                            <td>
                              ${App.escapeHTML(
                                f?.cargo ||
                                "—"
                              )}
                              /
                              ${App.escapeHTML(
                                f?.setor ||
                                "—"
                              )}
                            </td>
                            <td>
                              <span
                                class="
                                  badge
                                  ${
                                    d.tipo === "horas"
                                      ? "badge-hours"
                                      : "badge-days"
                                  }
                                "
                              >
                                ${
                                  d.tipo === "horas"
                                    ? "Horas"
                                    : "Dias"
                                }
                              </span>
                            </td>
                            <td>
                              ${dataFmt}
                            </td>
                            <td>
                              <strong>
                                ${qtd}
                              </strong>
                            </td>
                            <td>
                              ${App.escapeHTML(
                                d.observacoes ||
                                "—"
                              )}
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
        }
      </div>
    `;
  },
  /* ===================================================
     EXPORTAR CSV
  =================================================== */
  exportCSV() {
    const filtered =
      this.getOrderedFiltered();
    if (!filtered.length) {
      App.toast(
        "Nenhum dado para exportar.",
        "warning"
      );
      return;
    }
    const mapFunc =
      Object.fromEntries(
        this.state.funcionarios.map(
          f => [
            String(f.id),
            f
          ]
        )
      );
    const headers = [
      "Funcionario",
      "Cargo",
      "Setor",
      "Tipo",
      "Data_Inicial",
      "Data_Final",
      "Quantidade",
      "Observacoes"
    ];
    const rows =
      filtered.map(
        d => {
          const f =
            mapFunc[
              String(
                d.funcionarioId
              )
            ];
          const qtd =
            d.tipo ===
            "horas"
              ?
              `${Number(d.quantidadeHoras) || 0}h`
              :
              `${Number(d.quantidadeDias) || 0}d`;
          const dataInicial =
            d.data ||
            d.dataInicial ||
            d.data_inicio ||
            "";
          const dataFinal =
            d.dataFinal ||
            d.data_final ||
            "";
          return [f?.nome || "", f?.cargo || "", f?.setor || "", d.tipo || "", dataInicial, dataFinal, qtd, d.observacoes || ""].map(App.csvCell);
        }
      );
    const csvContent =
      "\uFEFF" +
      [
        headers.join(","),
        ...rows.map(
          e =>
            e.join(",")
        )
      ].join("\n");
    const blob =
      new Blob(
        [csvContent],
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
    link.setAttribute(
      "href",
      url
    );
    link.setAttribute(
      "download",
      `relatorio_declaracoes_${new Date()
        .toISOString()
        .slice(0,10)}.csv`
    );
    document.body.appendChild(
      link
    );
    link.click();
    document.body.removeChild(
      link
    );
    URL.revokeObjectURL(
      url
    );
  }
};

