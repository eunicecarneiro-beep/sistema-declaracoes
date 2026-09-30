/* =====================================================
   DECLARAÇÕES — VERSÃO SEGURA

   Requer app.js com:
   - SUPABASE_KEY
   - App.getAccessToken()
   - App.layout()
   - App.toast()

   SEGURANÇA:
   - bucket "declaracoes" PRIVADO;
   - usa JWT do usuário logado;
   - NÃO usa SUPABASE_KEY como token Bearer;
   - anexos não possuem URL pública permanente;
   - leitura, envio, alteração e exclusão exigem login.
===================================================== */

const DECL_REST_URL =
  "https://cujlebxqqposqomtfvdk.supabase.co/rest/v1";

const DECL_STORAGE_URL =
  "https://cujlebxqqposqomtfvdk.supabase.co/storage/v1";

const DECL_BUCKET =
  "declaracoes";


/* =====================================================
   AUTENTICAÇÃO
===================================================== */

function obterTokenDeclaracoes() {

  const token =
    typeof App !== "undefined" &&
    typeof App.getAccessToken === "function"
      ? App.getAccessToken()
      : null;


  if (!token) {

    throw new Error(
      "Sua sessão expirou. Entre novamente no sistema."
    );

  }


  return token;

}


/* =====================================================
   HEADERS DO BANCO
===================================================== */

function declaracoesHeaders(extra = {}) {

  return {

    apikey:
      SUPABASE_KEY,

    Authorization:
      `Bearer ${obterTokenDeclaracoes()}`,

    "Content-Type":
      "application/json",

    ...extra

  };

}


/* =====================================================
   HEADERS DO STORAGE
===================================================== */

function declaracoesStorageHeaders(extra = {}) {

  return {

    apikey:
      SUPABASE_KEY,

    Authorization:
      `Bearer ${obterTokenDeclaracoes()}`,

    ...extra

  };

}


/* =====================================================
   ESCAPAR HTML
===================================================== */

function escaparDeclaracao(valor = "") {

  return String(valor)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


/* =====================================================
   FORMATAR DATA
===================================================== */

function formatarDataDeclaracao(data) {

  if (!data) {

    return "—";

  }


  const partes =
    String(data)
      .substring(0, 10)
      .split("-");


  if (
    partes.length !== 3
  ) {

    return data;

  }


  return (

    `${partes[2]}/` +
    `${partes[1]}/` +
    `${partes[0]}`

  );

}


/* =====================================================
   EXTRAIR CAMINHO DO ARQUIVO

   Serve tanto para os NOVOS registros
   quanto para os arquivos ANTIGOS que
   possuíam URL pública.
===================================================== */

function extrairCaminhoArquivoDeclaracao(
  valor
) {

  if (!valor) {

    return null;

  }


  const texto =
    String(valor).trim();


  if (!texto) {

    return null;

  }


  const marcadores = [

    `/object/public/${DECL_BUCKET}/`,

    `/object/authenticated/${DECL_BUCKET}/`,

    `/object/sign/${DECL_BUCKET}/`,

    `/object/${DECL_BUCKET}/`

  ];


  for (
    const marcador
    of marcadores
  ) {

    const posicao =
      texto.indexOf(
        marcador
      );


    if (
      posicao !== -1
    ) {

      let caminho =
        texto
          .substring(
            posicao +
            marcador.length
          )
          .split("?")[0];


      try {

        caminho =
          decodeURIComponent(
            caminho
          );

      } catch (_) {

        // mantém o caminho original

      }


      return caminho;

    }

  }


  /*
    REGISTROS NOVOS:

    arquivo_url não guarda mais
    uma URL.

    Guarda somente:
    123456_nome-do-arquivo.pdf
  */

  if (
    !texto.includes("://")
  ) {

    return texto.replace(
      /^\/+/,
      ""
    );

  }


  return null;

}


/* =====================================================
   CODIFICAR CAMINHO DO STORAGE
===================================================== */

function caminhoStorageCodificado(
  caminho
) {

  return String(caminho)

    .split("/")

    .map(
      parte =>
        encodeURIComponent(
          parte
        )
    )

    .join("/");

}


/* =====================================================
   UPLOAD DE ARQUIVO PRIVADO
===================================================== */

async function uploadArquivoDeclaracao(
  file
) {

  if (!file) {

    return null;

  }


  /* ===================================================
     LIMITE DE 10 MB
  =================================================== */

  if (
    file.size >
    10 * 1024 * 1024
  ) {

    throw new Error(
      "O arquivo deve ter no máximo 10MB."
    );

  }


  /* ===================================================
     FORMATOS PERMITIDOS
  =================================================== */

  const tiposPermitidos = [

    "application/pdf",

    "image/jpeg",

    "image/png"

  ];


  if (

    file.type &&

    !tiposPermitidos.includes(
      file.type
    )

  ) {

    throw new Error(
      "Formato não permitido. Use PDF, JPG, JPEG ou PNG."
    );

  }


  /* ===================================================
     NOME SEGURO
  =================================================== */

  const nomeSeguro =
    file.name

      .normalize("NFD")

      .replace(
        /[\u0300-\u036f]/g,
        ""
      )

      .replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );


  /* ===================================================
     NOME ÚNICO
  =================================================== */

  const caminho =

    `${Date.now()}_` +

    `${Math.random()
      .toString(36)
      .substring(2, 9)}_` +

    `${nomeSeguro}`;


  /* ===================================================
     URL DE UPLOAD
  =================================================== */

  const urlUpload =

    `${DECL_STORAGE_URL}/object/` +

    `${DECL_BUCKET}/` +

    `${caminhoStorageCodificado(
      caminho
    )}`;


  /* ===================================================
     ENVIO
  =================================================== */

  const resposta =
    await fetch(

      urlUpload,

      {

        method:
          "POST",


        headers:

          declaracoesStorageHeaders({

            "Content-Type":

              file.type ||

              "application/octet-stream",


            "x-upsert":
              "false"

          }),


        body:
          file

      }

    );


  /* ===================================================
     ERRO
  =================================================== */

  if (
    !resposta.ok
  ) {

    const erro =
      await resposta.text();


    console.error(
      "Erro no upload:",
      erro
    );


    if (

      resposta.status === 401 ||

      resposta.status === 403

    ) {

      throw new Error(
        "Você não tem permissão para enviar o arquivo ou sua sessão expirou."
      );

    }


    throw new Error(

      "Não foi possível enviar o arquivo: " +

      erro

    );

  }


  /* ===================================================
     IMPORTANTE:

     NÃO CRIA URL PÚBLICA.

     Somente o caminho interno é salvo.
  =================================================== */

  return {

    url:
      caminho,

    nome:
      file.name,

    tipo:
      file.type,

    tamanho:
      file.size,

    caminho:
      caminho

  };

}


/* =====================================================
   ABRIR ARQUIVO PRIVADO
===================================================== */

async function abrirArquivoDeclaracao(

  valorArquivo,

  nomeArquivo =
    "declaracao"

) {

  const caminho =

    extrairCaminhoArquivoDeclaracao(
      valorArquivo
    );


  if (!caminho) {

    throw new Error(
      "Anexo não encontrado."
    );

  }


  /* ===================================================
     ENDPOINT AUTENTICADO
  =================================================== */

  const urlDownload =

    `${DECL_STORAGE_URL}/object/authenticated/` +

    `${DECL_BUCKET}/` +

    `${caminhoStorageCodificado(
      caminho
    )}`;


  const resposta =
    await fetch(

      urlDownload,

      {

        method:
          "GET",

        headers:
          declaracoesStorageHeaders()

      }

    );


  /* ===================================================
     ERRO
  =================================================== */

  if (
    !resposta.ok
  ) {

    const erro =
      await resposta.text();


    console.error(
      "Erro ao abrir anexo:",
      erro
    );


    if (

      resposta.status === 401 ||

      resposta.status === 403

    ) {

      throw new Error(
        "Você não tem permissão para visualizar este anexo ou sua sessão expirou."
      );

    }


    throw new Error(
      "Não foi possível abrir o anexo."
    );

  }


  /* ===================================================
     TRANSFORMA EM BLOB
  =================================================== */

  const blob =
    await resposta.blob();


  const blobUrl =
    URL.createObjectURL(
      blob
    );


  /* ===================================================
     ABRIR
  =================================================== */

  const novaAba =

    window.open(

      blobUrl,

      "_blank",

      "noopener,noreferrer"

    );


  /* ===================================================
     CASO POPUP SEJA BLOQUEADO
  =================================================== */

  if (!novaAba) {

    const link =
      document.createElement(
        "a"
      );


    link.href =
      blobUrl;


    link.download =
      nomeArquivo ||
      "declaracao";


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();

  }


  /* ===================================================
     LIBERAR MEMÓRIA
  =================================================== */

  setTimeout(

    () =>
      URL.revokeObjectURL(
        blobUrl
      ),

    60000

  );

}


/* =====================================================
   EXCLUIR ARQUIVO PRIVADO
===================================================== */

async function excluirArquivoDeclaracao(
  valorArquivo
) {

  if (!valorArquivo) {

    return;

  }


  const caminho =

    extrairCaminhoArquivoDeclaracao(
      valorArquivo
    );


  if (!caminho) {

    return;

  }


  const urlDelete =

    `${DECL_STORAGE_URL}/object/` +

    `${DECL_BUCKET}/` +

    `${caminhoStorageCodificado(
      caminho
    )}`;


  const resposta =
    await fetch(

      urlDelete,

      {

        method:
          "DELETE",

        headers:
          declaracoesStorageHeaders()

      }

    );


  if (
    !resposta.ok
  ) {

    console.warn(

      "Não foi possível excluir o arquivo antigo:",

      await resposta.text()

    );

  }

}


/* =====================================================
   BUSCAR FUNCIONÁRIOS
===================================================== */

async function buscarFuncionariosDeclaracao() {

  const resposta =
    await fetch(

      `${DECL_REST_URL}/funcionarios` +

      `?select=id,nome_completo,matricula` +

      `&order=nome_completo.asc`,

      {

        headers:
          declaracoesHeaders()

      }

    );


  if (
    !resposta.ok
  ) {

    throw new Error(
      await resposta.text()
    );

  }


  return await resposta.json();

}


/* =====================================================
   BUSCAR TODAS AS DECLARAÇÕES
===================================================== */

async function buscarTodasDeclaracoes() {

  const resposta =
    await fetch(

      `${DECL_REST_URL}/declaracoes` +

      `?select=*` +

      `&order=data.desc.nullslast`,

      {

        headers:
          declaracoesHeaders()

      }

    );


  if (
    !resposta.ok
  ) {

    throw new Error(
      await resposta.text()
    );

  }


  return await resposta.json();

}


/* =====================================================
   BUSCAR DECLARAÇÃO PELO ID
===================================================== */

async function buscarDeclaracaoPorId(
  id
) {

  const resposta =
    await fetch(

      `${DECL_REST_URL}/declaracoes` +

      `?id=eq.${encodeURIComponent(
        id
      )}` +

      `&select=*`,

      {

        headers:
          declaracoesHeaders()

      }

    );


  if (
    !resposta.ok
  ) {

    throw new Error(
      await resposta.text()
    );

  }


  const dados =
    await resposta.json();


  return dados[0] || null;

}


/* =====================================================
   PÁGINA DECLARAÇÕES
===================================================== */

const DeclaracoesPage = {


  /* ===================================================
     CARREGAR
  =================================================== */

  async init() {

    try {


      const [

        declaracoes,

        funcionarios

      ] = await Promise.all([

        buscarTodasDeclaracoes(),

        buscarFuncionariosDeclaracao()

      ]);


      /* ===============================================
         MAPA DE FUNCIONÁRIOS
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

            <a
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


                            const idCodificado =

                              encodeURIComponent(

                                String(
                                  declaracao.id
                                )

                              );


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

                                ${periodo}

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

                                      onclick="
                                        DeclaracoesPage.verAnexo(
                                          '${idCodificado}'
                                        )
                                      "

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


                                <a

                                  href="
                                    nova-declaracao.html?id=${
                                      encodeURIComponent(
                                        declaracao.id
                                      )
                                    }
                                  "

                                  class="
                                    btn
                                    btn-secondary
                                    btn-sm
                                  "

                                >

                                  Editar

                                </a>


                                <button

                                  type="button"

                                  class="
                                    btn
                                    btn-danger
                                    btn-sm
                                  "

                                  onclick="
                                    DeclaracoesPage.excluir(
                                      '${idCodificado}'
                                    )
                                  "

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


    } catch (erro) {


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
     VISUALIZAR ANEXO
  =================================================== */

  async verAnexo(
    idCodificado
  ) {

    try {


      const id =

        decodeURIComponent(
          idCodificado
        );


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

        "declaracao"

      );


    } catch (erro) {


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


    const id =

      decodeURIComponent(
        idCodificado
      );


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
         EXCLUI REGISTRO DO BANCO
      =============================================== */

      const resposta =

        await fetch(

          `${DECL_REST_URL}/declaracoes` +

          `?id=eq.${encodeURIComponent(
            id
          )}`,

          {

            method:
              "DELETE",

            headers:
              declaracoesHeaders()

          }

        );


      if (
        !resposta.ok
      ) {

        throw new Error(
          await resposta.text()
        );

      }


      /* ===============================================
         EXCLUI ANEXO DO STORAGE
      =============================================== */

      if (
        declaracao?.arquivo_url
      ) {

        try {


          await excluirArquivoDeclaracao(

            declaracao.arquivo_url

          );


        } catch (
          erroStorage
        ) {


          console.warn(

            "O registro foi excluído, mas o anexo não pôde ser removido:",

            erroStorage

          );

        }

      }


      App.toast(
        "Declaração excluída com sucesso!"
      );


      await this.init();


    } catch (erro) {


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
   NOVA / EDITAR DECLARAÇÃO
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
                            ) ||

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

                            value="${fid}"

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

                placeholder="
                  Informações adicionais...
                "

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

                accept="
                  .pdf,
                  .jpg,
                  .jpeg,
                  .png
                "

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

                      onclick="
                        NovaDeclaracaoPage.verAnexoAtual()
                      "

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


    } catch (erro) {


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
     VISUALIZAR ANEXO ATUAL
  =================================================== */

  async verAnexoAtual() {

    try {


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

        "declaracao"

      );


    } catch (erro) {


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
       RENDERIZAR CAMPOS
    =============================================== */

    const renderizar = () => {


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

              value="${
                declaracao?.data ||
                ""
              }"

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

              value="${
                declaracao?.hora_inicial ||
                ""
              }"

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

              value="${
                declaracao?.hora_final ||
                ""
              }"

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

              value="${
                declaracao?.quantidade_horas ??
                ""
              }"

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

              value="${

                declaracao?.data_inicio ||

                declaracao?.data_inicial ||

                declaracao?.data ||

                ""

              }"

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

              value="${

                declaracao?.data_fim ||

                declaracao?.data_final ||

                ""

              }"

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

              value="${
                declaracao?.quantidade_dias ??
                ""
              }"

            >

          </div>


        `;

      }


      /* =============================================
         DATA ATUAL AUTOMÁTICA
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


    const select =

      document.getElementById(
        "funcionarioDeclaracao"
      );


    const funcionarioId =

      Number(
        select.value
      );


    /* ===============================================
       VALIDAR FUNCIONÁRIO
    =============================================== */

    if (

      !Number.isInteger(
        funcionarioId
      )

      ||

      funcionarioId <= 0

    ) {


      App.toast(

        "Selecione um funcionário válido.",

        "danger"

      );


      return;

    }


    /* ===============================================
       TIPO
    =============================================== */

    const tipo =

      document.getElementById(
        "tipoDeclaracao"
      ).value;


    /* ===============================================
       OBSERVAÇÕES
    =============================================== */

    const observacoes =

      document.getElementById(
        "observacoesDeclaracao"
      ).value

      ||

      "";


    /* ===============================================
       ARQUIVO
    =============================================== */

    const arquivoInput =

      document.getElementById(
        "arquivoDeclaracao"
      );


    /* ===============================================
       BOTÃO
    =============================================== */

    const botao =

      evento.target.querySelector(

        'button[type="submit"]'

      );


    const textoOriginal =
      botao.textContent;


    botao.disabled =
      true;


    /*
      Usado para apagar o novo arquivo
      caso o upload funcione mas o banco
      rejeite o registro.
    */

    let novoArquivoEnviado =
      null;


    try {


      /* =============================================
         DADOS DO ANEXO ANTIGO
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
         OBJETO PARA O BANCO
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


      /* =============================================
         NOVA DECLARAÇÃO
      ============================================= */

      if (
        !declaracaoAntiga
      ) {


        const resposta =

          await fetch(

            `${DECL_REST_URL}/declaracoes`,

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

          throw new Error(
            await resposta.text()
          );

        }

      }


      /* =============================================
         EDITAR DECLARAÇÃO
      ============================================= */

      else {


        const resposta =

          await fetch(

            `${DECL_REST_URL}/declaracoes` +

            `?id=eq.${encodeURIComponent(
              declaracaoAntiga.id
            )}`,

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

          throw new Error(
            await resposta.text()
          );

        }


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


          } catch (
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


    } catch (erro) {


      console.error(

        "ERRO AO SALVAR DECLARAÇÃO:",

        erro

      );


      /* =============================================
         EVITA ARQUIVO ÓRFÃO

         Se upload funcionou mas o banco
         rejeitou o lançamento, remove
         o arquivo recém-enviado.
      ============================================= */

      if (
        novoArquivoEnviado?.url
      ) {


        try {


          await excluirArquivoDeclaracao(

            novoArquivoEnviado.url

          );


        } catch (_) {

          // não impede o tratamento principal

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

    }

  }

};