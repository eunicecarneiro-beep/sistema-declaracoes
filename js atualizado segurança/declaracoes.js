/* DECLARAÇÕES — aplicar também o SQL de RLS e Storage fornecido. */
"use strict";
const DECL_REST_URL = SUPABASE_URL + "/rest/v1";
const DECL_STORAGE_URL = SUPABASE_URL + "/storage/v1";
const DECL_BUCKET = "declaracoes";
const DECL_MAX_BYTES = 10 * 1024 * 1024;
function escaparDeclaracao(v = "") { return App.escapeHTML(v); }
function formatarDataDeclaracao(v) { return App.formatDate(v); }
function obterTokenDeclaracoes() {
  const t = App.getAccessToken();
  if (!t) throw new Error("Entre novamente no sistema.");
  return t;
}
function declaracoesHeaders(extra = {}) {
  return { ...extra, "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${obterTokenDeclaracoes()}` };
}
function declaracoesStorageHeaders(extra = {}) {
  return { ...extra, apikey: SUPABASE_KEY, Authorization: `Bearer ${obterTokenDeclaracoes()}` };
}
function extrairCaminhoArquivoDeclaracao(valor) {
  let s = String(valor || "").trim();
  if (!s || s.length > 1500 || /[\\\u0000-\u001f]/.test(s)) return null;
  if (s.includes("://")) {
    try {
      const u = new URL(s);
      if (u.origin !== SUPABASE_URL || u.username || u.password || u.hash) return null;
      const prefixos = ["/storage/v1/object/public/declaracoes/", "/storage/v1/object/authenticated/declaracoes/", "/storage/v1/object/sign/declaracoes/", "/storage/v1/object/declaracoes/"];
      const p = prefixos.find(x => u.pathname.startsWith(x));
      if (!p) return null;
      s = u.pathname.slice(p.length);
    } catch { return null; }
  }
  try { s = decodeURIComponent(s); } catch { return null; }
  const partes = s.split("/");
  if (!partes.length || partes.length > 3 || partes.some(x => !/^[a-z0-9_][a-z0-9._-]{0,254}$/i.test(x) || x === "." || x === "..")) return null;
  if (!/\.(pdf|png|jpe?g)$/i.test(s)) return null;
  return s;
}
function caminhoStorageCodificado(caminho) {
  const s = extrairCaminhoArquivoDeclaracao(caminho);
  if (!s) throw new Error("Caminho de anexo inválido.");
  return s.split("/").map(encodeURIComponent).join("/");
}
function detectarTipoDeclaracao(bytes) {
  const a = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (a.length >= 5 && [37,80,68,70,45].every((x,i) => a[i] === x)) return "application/pdf";
  if (a.length >= 8 && [137,80,78,71,13,10,26,10].every((x,i) => a[i] === x)) return "image/png";
  if (a.length >= 3 && a[0] === 255 && a[1] === 216 && a[2] === 255) return "image/jpeg";
  return "";
}
async function validarArquivoDeclaracao(file) {
  if (!file || file.size < 1 || file.size > DECL_MAX_BYTES) throw new Error("O arquivo deve ter conteúdo e no máximo 10 MB.");
  const ext = String(file.name || "").toLowerCase().split(".").pop();
  const tipo = { pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" }[ext];
  const detectado = detectarTipoDeclaracao(await file.slice(0, 16).arrayBuffer());
  if (!tipo || detectado !== tipo || (file.type && file.type.toLowerCase() !== tipo)) throw new Error("Use um PDF, PNG ou JPG válido. O conteúdo deve corresponder à extensão.");
  return tipo;
}
async function uploadArquivoDeclaracao(file) {
  if (!file) return null;
  const p = await App.requireRoles(["administrador", "secretaria"]);
  const tipo = await validarArquivoDeclaracao(file);
  const ext = { "application/pdf": "pdf", "image/png": "png", "image/jpeg": "jpg" }[tipo];
  const caminho = `${p.id}/${crypto.randomUUID()}.${ext}`;
  const resposta = await App.request(`/storage/v1/object/${DECL_BUCKET}/${caminhoStorageCodificado(caminho)}`, {
    method: "POST", headers: { "Content-Type": tipo, "x-upsert": "false", "cache-control": "private, no-store" }, body: file
  });
  if (!resposta.ok) throw App.erroHTTP(resposta);
  return { url: caminho, nome: String(file.name).slice(0,255), tipo, tamanho: file.size, caminho };
}
function prepararJanelaAnexo() {
  const aba = window.open("", "_blank");
  if (!aba) throw new Error("Permita pop-ups para visualizar o anexo.");
  aba.opener = null;
  aba.document.title = "Carregando documento";
  aba.document.body.textContent = "Carregando documento…";
  return aba;
}
async function bytesLimitadosDeclaracao(resposta) {
  if (Number(resposta.headers.get("content-length") || 0) > DECL_MAX_BYTES) throw new Error("Anexo acima do limite de 10 MB.");
  const leitor = resposta.body?.getReader();
  if (!leitor) throw new Error("Não foi possível ler o anexo com segurança. Atualize seu navegador.");
  let tamanho = 0;
  const partes = [];
  try {
    for (;;) {
      const {done, value} = await leitor.read();
      if (done) break;
      tamanho += value.byteLength;
      if (tamanho > DECL_MAX_BYTES) { await leitor.cancel(); throw new Error("Anexo acima do limite de 10 MB."); }
      partes.push(value);
    }
  } finally { leitor.releaseLock(); }
  const bytes = new Uint8Array(tamanho);
  let offset = 0;
  for (const parte of partes) { bytes.set(parte, offset); offset += parte.length; }
  return bytes;
}
async function abrirArquivoDeclaracao(valorArquivo, nomeArquivo = "declaracao", janelaReservada = null) {
  const caminho = extrairCaminhoArquivoDeclaracao(valorArquivo);
  if (!caminho) { janelaReservada?.close(); throw new Error("Caminho ou formato de anexo inválido."); }
  const aba = janelaReservada || prepararJanelaAnexo();
  try {
    await App.requireRoles(["administrador", "secretaria"]);
    const r = await App.request(`/storage/v1/object/authenticated/${DECL_BUCKET}/${caminhoStorageCodificado(caminho)}`);
    if (!r.ok) throw App.erroHTTP(r);
    const mime = String(r.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!["application/pdf", "image/jpeg", "image/png", "application/octet-stream"].includes(mime)) throw new Error("O servidor retornou um tipo de anexo não permitido.");
    const bytes = await bytesLimitadosDeclaracao(r);
    const tipo = detectarTipoDeclaracao(bytes);
    if (!tipo || (mime !== "application/octet-stream" && mime !== tipo)) throw new Error("O conteúdo do anexo não corresponde a um PDF ou imagem permitido.");
    const blobUrl = URL.createObjectURL(new Blob([bytes], { type: tipo }));
    aba.opener = null;
    aba.location.replace(blobUrl);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10 * 60 * 1000);
  } catch (e) { try { aba.close(); } catch { /* já fechada */ } throw e; }
}
async function excluirArquivoDeclaracao(valor) {
  if (!valor) return;
  const caminho = extrairCaminhoArquivoDeclaracao(valor);
  if (!caminho) throw new Error("Caminho do anexo inválido.");
  const r = await App.request(`/storage/v1/object/${DECL_BUCKET}`, { method: "DELETE", body: JSON.stringify({ prefixes: [caminho] }) });
  if (!r.ok) throw App.erroHTTP(r);
}
async function listarDadosDeclaracao(tabela, select, order) {
  const linhas = [];
  for (let offset = 0; offset < 50000; offset += 500) {
    const pagina = await App.rest(`/${tabela}?select=${select}&order=${order}&limit=500&offset=${offset}`);
    if (!Array.isArray(pagina)) throw new Error("Resposta inválida do banco.");
    linhas.push(...pagina);
    if (pagina.length < 500) return linhas;
  }
  throw new Error("Há muitos registros. Aplique filtros no servidor.");
}
async function buscarFuncionariosDeclaracao() { return listarDadosDeclaracao("funcionarios", "id,nome_completo,matricula", "nome_completo.asc,id.asc"); }
async function buscarTodasDeclaracoes() { return listarDadosDeclaracao("declaracoes", "*", "data.desc.nullslast,id.asc"); }
async function buscarDeclaracaoPorId(id) {
  const dados = await App.rest(`/declaracoes?id=eq.${App.idFilter(id, "declaracoes")}&select=*&limit=1`);
  return dados?.[0] || null;
}

const DeclaracoesPage = {
  /* ===================================================
     INICIAR
  =================================================== */
  async init() {
    try { await App.requireRoles(["administrador", "secretaria"]); } catch(e) { App.toast(e.message, "danger"); return; }
    try {
      const [
        declaracoes,
        funcionarios
      ] = await Promise.all([
        buscarTodasDeclaracoes(),
        buscarFuncionariosDeclaracao()
      ]);
      /* ===============================================
         MAPA DOS FUNCIONÁRIOS
      =============================================== */
      const mapaFuncionarios =
        {};
      funcionarios.forEach(
        funcionario => {
          mapaFuncionarios[
            String(
              funcionario.id
            )
          ] =
            funcionario;
        }
      );
      /* ===============================================
         LAYOUT
      =============================================== */
      App.layout(
        "Declarações",
        "Listagem de todas as declarações registradas",
        `
        <div class="page-header">
          <div>
            <h2>
              Lista de Declarações
            </h2>
            <p>
              Gerencie e consulte os documentos de horas e dias.
            </p>
          </div>
          <div class="actions no-print">
            <a data-write
              href="nova-declaracao.html"
              class="btn btn-primary"
            >
              ＋ Nova Declaração
            </a>
          </div>
        </div>
        <div class="card panel">
          <div class="panel-header">
            <h3>
              Registros
            </h3>
            <span
              class="badge badge-hours"
            >
              ${declaracoes.length}
              no total
            </span>
          </div>
          ${
            declaracoes.length === 0
              ?
              `
              <div class="empty">
                <strong>
                  Nenhuma declaração encontrada
                </strong>
                <p>
                  Cadastre a primeira declaração.
                </p>
              </div>
              `
              :
              `
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
                        Tipo
                      </th>
                      <th>
                        Data / Período
                      </th>
                      <th>
                        Qtd.
                      </th>
                      <th>
                        Anexo
                      </th>
                      <th>
                        Observações
                      </th>
                      <th>
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      declaracoes
                        .map(
                          declaracao => {
                            const funcionario =
                              mapaFuncionarios[
                                String(
                                  declaracao.funcionario_id
                                )
                              ];
                            const horas =
                              declaracao.tipo ===
                              "horas";
                            const dataInicial =
                              declaracao.data_inicio ||
                              declaracao.data_inicial ||
                              declaracao.data;
                            const dataFinal =
                              declaracao.data_fim ||
                              declaracao.data_final ||
                              declaracao.data;
                            const periodo =
                              horas
                                ?
                                formatarDataDeclaracao(
                                  declaracao.data
                                )
                                :
                                `${formatarDataDeclaracao(
                                  dataInicial
                                )} até ${formatarDataDeclaracao(
                                  dataFinal
                                )}`;
                            const quantidade =
                              horas
                                ?
                                `${Number(
                                  declaracao.quantidade_horas ||
                                  0
                                )}h`
                                :
                                `${Number(
                                  declaracao.quantidade_dias ||
                                  0
                                )} dia(s)`;
                            const idCodificado = App.escapeHTML(App.safeId(declaracao.id, "declaracoes"));
                            return `
                            <tr>
                              <td>
                                #${escaparDeclaracao(
                                  declaracao.id
                                )}
                              </td>
                              <td>
                                <strong>
                                  ${escaparDeclaracao(
                                    funcionario?.nome_completo ||
                                    "Funcionário não encontrado"
                                  )}
                                </strong>
                              </td>
                              <td>
                                <span
                                  class="badge ${
                                    horas
                                      ?
                                      "badge-hours"
                                      :
                                      "badge-days"
                                  }"
                                >
                                  ${
                                    horas
                                      ?
                                      "Horas"
                                      :
                                      "Dias"
                                  }
                                </span>
                              </td>
                              <td>
                                ${escaparDeclaracao(periodo)}
                              </td>
                              <td>
                                ${quantidade}
                              </td>
                              <td>
                                ${
                                  declaracao.arquivo_url
                                    ?
                                    `
                                    <button
                                      type="button"
                                      class="
                                        badge
                                        badge-hours
                                      "
                                      style="
                                        border:none;
                                        cursor:pointer;
                                      "
                                      data-acao-sistema="declaracao-anexo" data-id="${idCodificado}"
                                    >
                                      📎 Ver Anexo
                                    </button>
                                    `
                                    :
                                    `
                                    <span
                                      style="color:#888;"
                                    >
                                      Sem anexo
                                    </span>
                                    `
                                }
                              </td>
                              <td>
                                ${escaparDeclaracao(
                                  declaracao.observacoes ||
                                  declaracao.descricao ||
                                  "—"
                                )}
                              </td>
                              <td>
                                <a data-write
                                  href="nova-declaracao.html?id=${encodeURIComponent(
                                    declaracao.id
                                  )}"
                                  class="
                                    btn
                                    btn-secondary
                                    btn-sm
                                  "
                                >
                                  Editar
                                </a>
                                <button data-admin
                                  type="button"
                                  class="
                                    btn
                                    btn-danger
                                    btn-sm
                                  "
                                  data-acao-sistema="declaracao-excluir" data-id="${idCodificado}"
                                >
                                  Excluir
                                </button>
                              </td>
                            </tr>
                            `;
                          }
                        )
                        .join("")
                    }
                  </tbody>
                </table>
              </div>
              `
          }
        </div>
        `
      );
    }
    catch (erro) {
      console.error(
        "Erro ao carregar declarações:",
        erro
      );
      App.toast(
        erro.message ||
        "Erro ao carregar as declarações.",
        "danger"
      );
    }
  },
  /* ===================================================
     VER ANEXO
  =================================================== */
  async verAnexo(
    idCodificado
  ) {
    let janela;
    try {
      janela = prepararJanelaAnexo();
      const id = App.safeId(idCodificado, "declaracoes");
      const declaracao =
        await buscarDeclaracaoPorId(
          id
        );
      if (
        !declaracao ||
        !declaracao.arquivo_url
      ) {
        throw new Error(
          "Anexo não encontrado."
        );
      }
      await abrirArquivoDeclaracao(
        declaracao.arquivo_url,
        declaracao.arquivo_nome ||
        "declaracao", janela
      );
    }
    catch (erro) {
      janela?.close();
      console.error(
        erro
      );
      App.toast(
        erro.message ||
        "Erro ao abrir o anexo.",
        "danger"
      );
    }
  },
  /* ===================================================
     EXCLUIR DECLARAÇÃO
  =================================================== */
  async excluir(
    idCodificado
  ) {
    try { await App.requireRoles(["administrador"]); } catch(e) { App.toast(e.message, "danger"); return; }
    const id = App.safeId(idCodificado, "declaracoes");
    if (
      !confirm(
        "Tem certeza que deseja excluir esta declaração?"
      )
    ) {
      return;
    }
    try {
      const declaracao =
        await buscarDeclaracaoPorId(
          id
        );
      /* ===============================================
         PRIMEIRO EXCLUI O REGISTRO
      =============================================== */
      const resposta =
        await App.request(
          `/rest/v1/declaracoes` +
          `?id=eq.${App.idFilter(id, "declaracoes")}`,
          {
            method:
              "DELETE",
            headers:
              declaracoesHeaders({ Prefer: "return=representation" })
          }
        );
      if (
        !resposta.ok
      ) {
        throw App.erroHTTP(resposta);
      }
      if ((await resposta.json())?.length !== 1) throw new Error("Registro inexistente ou exclusão não autorizada.");
      /* ===============================================
         DEPOIS REMOVE O ARQUIVO
      =============================================== */
      if (
        declaracao?.arquivo_url
      ) {
        try {
          await excluirArquivoDeclaracao(
            declaracao.arquivo_url
          );
        }
        catch (erroStorage) {
          console.warn(
            "Registro excluído, mas houve erro ao excluir o anexo:",
            erroStorage
          );
        }
      }
      App.toast(
        "Declaração excluída com sucesso!"
      );
      await this.init();
    }
    catch (erro) {
      console.error(
        erro
      );
      App.toast(
        "Erro ao excluir: " +
        (
          erro.message ||
          erro
        ),
        "danger"
      );
    }
  }
};
/* =====================================================
   NOVA DECLARAÇÃO / EDITAR
===================================================== */
const NovaDeclaracaoPage = {
  funcionarios:
    [],
  declaracaoAtual:
    null,
  /* ===================================================
     INICIAR
  =================================================== */
  async init() {
    try { await App.requireRoles(["administrador", "secretaria"]); } catch(e) { App.toast(e.message, "danger"); return; }
    const parametros =
      new URLSearchParams(
        window.location.search
      );
    const id =
      parametros.get(
        "id"
      );
    try {
      this.funcionarios =
        await buscarFuncionariosDeclaracao();
      let declaracao =
        null;
      if (id) {
        declaracao =
          await buscarDeclaracaoPorId(
            id
          );
      }
      this.declaracaoAtual =
        declaracao;
      const editando =
        !!declaracao;
      /* ===============================================
         LAYOUT
      =============================================== */
      App.layout(
        editando
          ?
          "Editar Declaração"
          :
          "Nova Declaração",
        editando
          ?
          "Atualização dos dados da declaração"
          :
          "Lançamento e anexação do documento",
        `
        <div class="card panel">
          <form
            id="formDeclaracao"
            class="form"
          >
            <div class="grid-2">
              <div class="field">
                <label
                  for="funcionarioDeclaracao"
                >
                  Funcionário *
                </label>
                <select
                  id="funcionarioDeclaracao"
                  class="input"
                  required
                >
                  <option value="">
                    Selecione um funcionário...
                  </option>
                  ${
                    this.funcionarios
                      .map(
                        funcionario => {
                          const fid =
                            Number(
                              funcionario.id
                            );
                          if (
                            !Number.isInteger(
                              fid
                            )
                            ||
                            fid <= 0
                          ) {
                            return "";
                          }
                          const selecionado =
                            editando &&
                            Number(
                              declaracao.funcionario_id
                            ) === fid
                              ?
                              "selected"
                              :
                              "";
                          return `
                          <option
                            value="${escaparDeclaracao(fid)}"
                            ${selecionado}
                          >
                            ${escaparDeclaracao(
                              funcionario.nome_completo
                            )}
                            —
                            ${escaparDeclaracao(
                              funcionario.matricula ||
                              ""
                            )}
                          </option>
                          `;
                        }
                      )
                      .join("")
                  }
                </select>
              </div>
              <div class="field">
                <label
                  for="tipoDeclaracao"
                >
                  Tipo de declaração *
                </label>
                <select
                  id="tipoDeclaracao"
                  class="input"
                  required
                >
                  <option
                    value="horas"
                    ${
                      editando &&
                      declaracao.tipo ===
                      "horas"
                        ?
                        "selected"
                        :
                        ""
                    }
                  >
                    Declaração de Horas
                  </option>
                  <option
                    value="dias"
                    ${
                      editando &&
                      declaracao.tipo ===
                      "dias"
                        ?
                        "selected"
                        :
                        ""
                    }
                  >
                    Declaração de Dias
                  </option>
                </select>
              </div>
            </div>
            <div
              id="camposDeclaracao"
            ></div>
            <div class="field">
              <label
                for="observacoesDeclaracao"
              >
                Observações
              </label>
              <textarea
                id="observacoesDeclaracao"
                class="input"
                rows="3"
                placeholder="Informações adicionais..."
              >${escaparDeclaracao(
                declaracao?.observacoes ||
                declaracao?.descricao ||
                ""
              )}</textarea>
            </div>
            <div class="field">
              <label
                for="arquivoDeclaracao"
              >
                ${
                  editando
                    ?
                    "Substituir declaração (opcional)"
                    :
                    "Anexar declaração"
                }
              </label>
              <input
                type="file"
                id="arquivoDeclaracao"
                class="input-file"
                accept=".pdf,.jpg,.jpeg,.png"
              >
              <small
                style="
                  display:block;
                  margin-top:6px;
                  color:#666;
                "
              >
                Formatos aceitos:
                PDF, JPG, JPEG e PNG.
                Máximo: 10MB.
              </small>
              ${
                declaracao?.arquivo_url
                  ?
                  `
                  <p
                    style="
                      margin-top:10px;
                    "
                  >
                    <button
                      type="button"
                      class="
                        badge
                        badge-hours
                      "
                      style="
                        border:none;
                        cursor:pointer;
                      "
                      data-acao-sistema="declaracao-anexo-atual"
                    >
                      📎 Visualizar Anexo Atual
                    </button>
                  </p>
                  `
                  :
                  ""
              }
            </div>
            <div class="form-actions">
              <a
                href="declaracoes.html"
                class="btn btn-secondary"
              >
                Cancelar
              </a>
              <button
                type="submit"
                class="btn btn-primary"
              >
                ${
                  editando
                    ?
                    "Salvar Alterações"
                    :
                    "Salvar declaração"
                }
              </button>
            </div>
          </form>
        </div>
        `
      );
      this.configurarFormulario(
        declaracao
      );
    }
    catch (erro) {
      console.error(
        "Erro ao carregar formulário:",
        erro
      );
      App.toast(
        erro.message ||
        "Erro ao carregar o formulário.",
        "danger"
      );
    }
  },
  /* ===================================================
     VER ANEXO ATUAL
  =================================================== */
  async verAnexoAtual() {
    let janela;
    try {
      janela = prepararJanelaAnexo();
      const declaracao =
        this.declaracaoAtual;
      if (
        !declaracao ||
        !declaracao.arquivo_url
      ) {
        throw new Error(
          "Anexo não encontrado."
        );
      }
      await abrirArquivoDeclaracao(
        declaracao.arquivo_url,
        declaracao.arquivo_nome ||
        "declaracao", janela
      );
    }
    catch (erro) {
      janela?.close();
      console.error(
        erro
      );
      App.toast(
        erro.message ||
        "Erro ao abrir o anexo.",
        "danger"
      );
    }
  },
  /* ===================================================
     CONFIGURAR FORMULÁRIO
  =================================================== */
  configurarFormulario(
    declaracao
  ) {
    const tipo =
      document.getElementById(
        "tipoDeclaracao"
      );
    const campos =
      document.getElementById(
        "camposDeclaracao"
      );
    /* ===============================================
       RENDERIZAR
    =============================================== */
    const renderizar =
      () => {
        /* =============================================
           HORAS
        ============================================= */
        if (
          tipo.value ===
          "horas"
        ) {
          campos.innerHTML = `
            <div class="field">
              <label
                for="dataDeclaracao"
              >
                Data *
              </label>
              <input
                type="date"
                id="dataDeclaracao"
                class="input"
                value="${escaparDeclaracao(declaracao?.data ||
                  "")}"
                required
              >
            </div>
            <div class="field">
              <label
                for="horaInicialDeclaracao"
              >
                Horário inicial
              </label>
              <input
                type="time"
                id="horaInicialDeclaracao"
                class="input"
                value="${escaparDeclaracao(declaracao?.hora_inicial ||
                  "")}"
              >
            </div>
            <div class="field">
              <label
                for="horaFinalDeclaracao"
              >
                Horário final
              </label>
              <input
                type="time"
                id="horaFinalDeclaracao"
                class="input"
                value="${escaparDeclaracao(declaracao?.hora_final ||
                  "")}"
              >
            </div>
            <div class="field">
              <label
                for="quantidadeHorasDeclaracao"
              >
                Quantidade de horas
              </label>
              <input
                type="number"
                id="quantidadeHorasDeclaracao"
                class="input"
                min="0"
                step="0.5"
                value="${escaparDeclaracao(declaracao?.quantidade_horas ??
                  "")}"
              >
            </div>
          `;
        }
        /* =============================================
           DIAS
        ============================================= */
        else {
          campos.innerHTML = `
            <div class="field">
              <label
                for="dataInicialDeclaracao"
              >
                Data inicial *
              </label>
              <input
                type="date"
                id="dataInicialDeclaracao"
                class="input"
                value="${escaparDeclaracao(declaracao?.data_inicio ||
                  declaracao?.data_inicial ||
                  declaracao?.data ||
                  "")}"
                required
              >
            </div>
            <div class="field">
              <label
                for="dataFinalDeclaracao"
              >
                Data final
              </label>
              <input
                type="date"
                id="dataFinalDeclaracao"
                class="input"
                value="${escaparDeclaracao(declaracao?.data_fim ||
                  declaracao?.data_final ||
                  "")}"
              >
            </div>
            <div class="field">
              <label
                for="quantidadeDiasDeclaracao"
              >
                Quantidade de dias
              </label>
              <input
                type="number"
                id="quantidadeDiasDeclaracao"
                class="input"
                min="1"
                step="1"
                value="${escaparDeclaracao(declaracao?.quantidade_dias ??
                  "")}"
              >
            </div>
          `;
        }
        /* =============================================
           DATA PADRÃO
        ============================================= */
        const campoData =
          document.getElementById(
            "dataDeclaracao"
          )
          ||
          document.getElementById(
            "dataInicialDeclaracao"
          );
        if (
          campoData &&
          !campoData.value
        ) {
          campoData.value =
            new Date()
              .toISOString()
              .slice(
                0,
                10
              );
        }
      };
    tipo.addEventListener(
      "change",
      renderizar
    );
    renderizar();
    /* ===============================================
       SUBMIT
    =============================================== */
    document
      .getElementById(
        "formDeclaracao"
      )
      .addEventListener(
        "submit",
        evento =>
          this.salvar(
            evento,
            declaracao
          )
      );
  },
  /* ===================================================
     SALVAR
  =================================================== */
  async salvar(
    evento,
    declaracaoAntiga
  ) {
    evento.preventDefault();
    if (this.salvando) return;
    try { await App.requireRoles(["administrador", "secretaria"]); } catch(e) { App.toast(e.message, "danger"); return; }
    const select =
      document.getElementById(
        "funcionarioDeclaracao"
      );
    let funcionarioId;
    /* ===============================================
       VALIDAR FUNCIONÁRIO
    =============================================== */
    try {
      funcionarioId = App.safeId(select.value, "funcionarios");
    } catch {
      App.toast(
        "Selecione um funcionário válido.",
        "danger"
      );
      return;
    }
    const tipo =
      document.getElementById(
        "tipoDeclaracao"
      ).value;
    const observacoes =
      document.getElementById(
        "observacoesDeclaracao"
      ).value
      ||
      "";
    const arquivoInput =
      document.getElementById(
        "arquivoDeclaracao"
      );
    const botao =
      evento.target.querySelector(
        'button[type="submit"]'
      );
    const textoOriginal =
      botao.textContent;
    this.salvando = true;
    botao.disabled =
      true;
    let gravacaoTentada = false;
    let gravacaoConfirmada = false;
    let novoArquivoEnviado =
      null;
    try {
      const campo = id => document.getElementById(id)?.value || "";
      if (!["horas", "dias"].includes(tipo)) throw new Error("Tipo de declaração inválido.");
      if (!this.funcionarios.some(f => String(f.id) === funcionarioId)) throw new Error("Selecione um servidor do cadastro.");
      if (observacoes.length > 10000) throw new Error("Observações devem ter até 10.000 caracteres.");
      if (tipo === "horas") {
        if (!App.dataValida(campo("dataDeclaracao"))) throw new Error("Informe uma data válida.");
        const inicio = campo("horaInicialDeclaracao"), fim = campo("horaFinalDeclaracao");
        if ((inicio || fim) && (!inicio || !fim || fim <= inicio)) throw new Error("Confira os horários de início e fim.");
        const horas = Number(campo("quantidadeHorasDeclaracao"));
        if (!Number.isFinite(horas) || horas <= 0 || horas > 24) throw new Error("Informe a quantidade de horas, maior que zero e até 24.");
      } else {
        const inicio = campo("dataInicialDeclaracao"), fim = campo("dataFinalDeclaracao") || inicio;
        const dias = Number(campo("quantidadeDiasDeclaracao") || 1);
        if (!App.dataValida(inicio) || !App.dataValida(fim) || fim < inicio) throw new Error("Confira as datas inicial e final.");
        if (!Number.isSafeInteger(dias) || dias < 1 || dias > 3660) throw new Error("Informe uma quantidade de dias entre 1 e 3660.");
      }
      /* =============================================
         ARQUIVO ANTIGO
      ============================================= */
      let arquivoUrl =
        declaracaoAntiga?.arquivo_url
        ||
        null;
      let arquivoNome =
        declaracaoAntiga?.arquivo_nome
        ||
        null;
      let tipoArquivo =
        declaracaoAntiga?.tipo_arquivo
        ||
        null;
      let tamanhoArquivo =
        Number(
          declaracaoAntiga?.tamanho_arquivo
          ||
          0
        );
      const arquivoAntigo =
        declaracaoAntiga?.arquivo_url
        ||
        null;
      /* =============================================
         NOVO ARQUIVO
      ============================================= */
      if (
        arquivoInput &&
        arquivoInput.files &&
        arquivoInput.files.length > 0
      ) {
        botao.textContent =
          "Enviando arquivo...";
        novoArquivoEnviado =
          await uploadArquivoDeclaracao(
            arquivoInput.files[0]
          );
        arquivoUrl =
          novoArquivoEnviado.url;
        arquivoNome =
          novoArquivoEnviado.nome;
        tipoArquivo =
          novoArquivoEnviado.tipo;
        tamanhoArquivo =
          novoArquivoEnviado.tamanho;
      }
      /* =============================================
         DADOS
      ============================================= */
      const dados = {
        funcionario_id:
          funcionarioId,
        tipo:
          tipo,
        data:
          null,
        data_inicio:
          null,
        data_fim:
          null,
        data_inicial:
          null,
        data_final:
          null,
        hora_inicial:
          null,
        hora_final:
          null,
        quantidade_horas:
          0,
        quantidade_dias:
          0,
        observacoes:
          observacoes
          ||
          null,
        descricao:
          observacoes
          ||
          null,
        arquivo_url:
          arquivoUrl,
        arquivo_nome:
          arquivoNome,
        tipo_arquivo:
          tipoArquivo,
        tamanho_arquivo:
          tamanhoArquivo
      };
      /* =============================================
         HORAS
      ============================================= */
      if (
        tipo === "horas"
      ) {
        dados.data =
          document.getElementById(
            "dataDeclaracao"
          ).value;
        dados.hora_inicial =
          document.getElementById(
            "horaInicialDeclaracao"
          ).value
          ||
          null;
        dados.hora_final =
          document.getElementById(
            "horaFinalDeclaracao"
          ).value
          ||
          null;
        dados.quantidade_horas =
          Number(
            document.getElementById(
              "quantidadeHorasDeclaracao"
            ).value
          )
          ||
          0;
      }
      /* =============================================
         DIAS
      ============================================= */
      else {
        const dataInicial =
          document.getElementById(
            "dataInicialDeclaracao"
          ).value;
        const dataFinal =
          document.getElementById(
            "dataFinalDeclaracao"
          ).value
          ||
          dataInicial;
        dados.data =
          dataInicial;
        dados.data_inicio =
          dataInicial;
        dados.data_fim =
          dataFinal;
        dados.data_inicial =
          dataInicial;
        dados.data_final =
          dataFinal;
        dados.quantidade_dias =
          Number(
            document.getElementById(
              "quantidadeDiasDeclaracao"
            ).value
          )
          ||
          1;
      }
      botao.textContent =
        "Salvando...";
      gravacaoTentada = true;
      /* =============================================
         CRIAR
      ============================================= */
      if (
        !declaracaoAntiga
      ) {
        const resposta =
          await App.request(
            `/rest/v1/declaracoes`,
            {
              method:
                "POST",
              headers:
                declaracoesHeaders({
                  Prefer:
                    "return=representation"
                }),
              body:
                JSON.stringify(
                  dados
                )
            }
          );
        if (
          !resposta.ok
        ) {
          throw App.erroHTTP(resposta);
        }
        if ((await resposta.json())?.length !== 1) throw new Error("Gravação não confirmada. Confira os registros antes de tentar novamente.");
        gravacaoConfirmada = true;
      }
      /* =============================================
         EDITAR
      ============================================= */
      else {
        const resposta =
          await App.request(
            `/rest/v1/declaracoes` +
            `?id=eq.${App.idFilter(declaracaoAntiga.id, "declaracoes")}`,
            {
              method:
                "PATCH",
              headers:
                declaracoesHeaders({
                  Prefer:
                    "return=representation"
                }),
              body:
                JSON.stringify(
                  dados
                )
            }
          );
        if (
          !resposta.ok
        ) {
          throw App.erroHTTP(resposta);
        }
        if ((await resposta.json())?.length !== 1) throw new Error("Gravação não confirmada. Confira os registros antes de tentar novamente.");
        gravacaoConfirmada = true;
        /* ===========================================
           REMOVE ARQUIVO ANTIGO
        =========================================== */
        if (
          arquivoAntigo &&
          arquivoAntigo !==
            arquivoUrl
        ) {
          try {
            await excluirArquivoDeclaracao(
              arquivoAntigo
            );
          }
          catch (
            erroStorage
          ) {
            console.warn(
              "A declaração foi atualizada, mas o arquivo antigo não pôde ser removido:",
              erroStorage
            );
          }
        }
      }
      /* =============================================
         SUCESSO
      ============================================= */
      App.toast(
        declaracaoAntiga
          ?
          "Declaração atualizada com sucesso!"
          :
          "Declaração cadastrada com sucesso!"
      );
      setTimeout(
        () => {
          window.location.href =
            "declaracoes.html";
        },
        800
      );
    }
    catch (erro) {
      if (gravacaoTentada && !gravacaoConfirmada) {
        App.toast("A gravação não foi confirmada. Recarregue a lista antes de repetir; o anexo foi mantido.", "warning");
      }
      console.error(
        "ERRO AO SALVAR DECLARAÇÃO:",
        erro
      );
      /* =============================================
         SE O UPLOAD FUNCIONOU MAS
         O BANCO FALHOU, REMOVE O ARQUIVO
      ============================================= */
      if (
        novoArquivoEnviado?.url && !gravacaoTentada
      ) {
        try {
          await excluirArquivoDeclaracao(
            novoArquivoEnviado.url
          );
        }
        catch (_) {
          // não interrompe o tratamento
        }
      }
      App.toast(
        "Erro ao salvar: " +
        (
          erro.message ||
          erro
        ),
        "danger"
      );
      botao.disabled =
        false;
      botao.textContent =
        textoOriginal;
    } finally { this.salvando = false; }
  }
};
