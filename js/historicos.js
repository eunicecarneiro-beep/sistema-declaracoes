
/* ==============================================================
   HISTÓRICOS ESCOLARES — E.M. PROFª EUNICE CARNEIRO
   Etapa 1: cadastro, atas SAEWEB, conferência, geração ODS.
   NUNCA emite histórico incompleto como documento oficial.
   Requer o app.js da escola + RLS em SQL_HISTORICOS.sql.
============================================================== */

const HistoricosPage = (() => {
  const S = {
    alunos: [],
    resultados: [],
    linhas: [],
    colunas: [],
    mapa: {},
    rascunhos: [],
    paginaPDF: 0,
    atual: null,
    arquivoModelo: null
  };

  const DISC = [
    ['portugues', 'Língua Portuguesa'],
    ['literatura', 'Experiências Literárias'],
    ['arte', 'Arte'],
    ['educacao_fisica', 'Educação Física'],
    ['ingles', 'Língua Inglesa'],
    ['matematica', 'Matemática'],
    ['ciencias', 'Ciências'],
    ['geografia', 'Geografia'],
    ['historia', 'História'],
    ['ensino_religioso', 'Ensino Religioso']
  ];

  const XNOTAS = [
    [228, 248],
    [278, 294],
    [327, 344],
    [375, 390],
    [428, 450],
    [488, 510],
    [539, 555],
    [586, 601],
    [633, 650],
    [680, 695]
  ];

  const $ = id => document.getElementById(id);

  const esc = v => App.escapeHTML(String(v ?? ''));

  const norm = v => String(v ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const today = () => new Date().toLocaleDateString('sv-SE');

  const sleep = () => new Promise(resolve => setTimeout(resolve, 0));

  const ano = () => new Date().getFullYear();

  const data = v => {
    const s = String(v ?? '').trim();

    if (/^\d{4}-\d\d-\d\d/.test(s)) {
      return s.slice(0, 10);
    }

    const m = s.match(/^(\d\d?)\/(\d\d?)\/(\d{4})$/);

    if (m) {
      return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }

    return '';
  };

  const msg = (texto, tipo = 'hist-alert') => {
    const e = $('hist-status');

    if (!e) return;

    e.className = tipo;
    e.textContent = texto;
  };

  const api = (p, opt) => App.rest(p, opt);

  const qs = v => encodeURIComponent(String(v));

  /* =========================================================
     CONSULTAS AO BANCO
  ========================================================= */

  async function todos(tabela, ordem = 'id.asc') {
    let lista = [];

    for (let offset = 0; offset < 60000; offset += 1000) {
      const bloco = await api(
        `/${tabela}?select=*&order=${ordem}&limit=1000&offset=${offset}`
      );

      if (!Array.isArray(bloco)) {
        throw new Error(`Erro ao ler ${tabela}`);
      }

      lista.push(...bloco);

      if (bloco.length < 1000) break;
    }

    return lista;
  }

  async function atualizar() {
    [S.alunos, S.resultados] = await Promise.all([
      todos('historico_alunos', 'nome.asc'),
      todos('historico_resultados', 'ano_letivo.desc')
    ]);

    estatisticas();
    renderAlunos();

    if (S.atual) {
      const a = S.alunos.find(x => x.id === S.atual);

      if (a) mostrarAluno(a.id);
    }
  }

  /* =========================================================
     ESTATÍSTICAS
  ========================================================= */

  function estatisticas() {
    const concl = S.alunos.filter(
      x => Number(x.serie_atual) === 5 &&
           Number(x.ano_atual) === 2026
    );

    const completos = concl.filter(
      a => pendencias(a).length === 0
    );

    $('his-total').textContent = S.alunos.length;
    $('his-5ano').textContent = concl.length;
    $('his-prontos').textContent = completos.length;
    $('his-pendencias').textContent = concl.length - completos.length;
  }

  /* =========================================================
     INTERFACE PRINCIPAL
  ========================================================= */

  function painel() {
    return `
      <div class="page-header">
        <div>
          <h2>Históricos Escolares</h2>
          <p>
            Preparação antecipada dos históricos
            dos concluintes do 5º ano
          </p>
        </div>

        <span class="hist-tag">
          Documentos sempre sujeitos a conferência
        </span>
      </div>

      <div class="hist-grid">
        <div class="hist-stat">
          <small>Alunos cadastrados</small>
          <strong id="his-total">—</strong>
        </div>

        <div class="hist-stat">
          <small>5º ano em 2026</small>
          <strong id="his-5ano">—</strong>
        </div>

        <div class="hist-stat">
          <small>Prontos para emissão</small>
          <strong id="his-prontos">—</strong>
        </div>

        <div class="hist-stat">
          <small>Com pendências</small>
          <strong id="his-pendencias">—</strong>
        </div>
      </div>

      <div class="hist-tabs">
        <button type="button" data-tab="alunos" class="on">
          1. Alunos
        </button>

        <button type="button" data-tab="cadastro">
          2. Importar cadastro
        </button>

        <button type="button" data-tab="atas">
          3. Importar atas
        </button>

        <button type="button" data-tab="emissao">
          4. Emitir históricos
        </button>
      </div>

      <section id="his-alunos" class="hist-section on hist-panel">
        <div class="hist-toolbar">
          <div class="hist-field">
            <label>Buscar aluno ou matrícula</label>
            <input
              id="his-busca"
              placeholder="Comece a digitar..."
            >
          </div>

          <div class="hist-field">
            <label>Filtro</label>

            <select id="his-filtro">
              <option value="quinto">5º ano de 2026</option>
              <option value="todos">Todos os alunos</option>
              <option value="pendentes">5º ano com pendências</option>
            </select>
          </div>

          <button
            class="btn btn-secondary"
            id="his-recarregar"
          >
            Atualizar dados
          </button>
        </div>

        <div id="his-lista"></div>
        <div id="his-perfil"></div>
      </section>

      <section id="his-cadastro" class="hist-section hist-panel">
        <h3>Importar alunos do Consulte</h3>

        <p class="hist-muted">
          Aceita .xls, .xlsx ou .csv.
          Os dados são lidos no navegador;
          a base só é enviada ao Supabase ao confirmar.
        </p>

        <div class="hist-toolbar">
          <div class="hist-field">
            <label>Arquivo de alunos</label>
            <input
              id="his-planilha"
              type="file"
              accept=".xls,.xlsx,.csv"
            >
          </div>

          <div class="hist-field">
            <label>Planilha/aba</label>
            <select id="his-aba"></select>
          </div>

          <button
            id="his-ler-planilha"
            class="btn btn-secondary"
          >
            Ler e conferir colunas
          </button>
        </div>

        <div id="his-mapeamento"></div>
        <div id="his-prev-planilha"></div>

        <button
          id="his-salvar-planilha"
          class="btn btn-primary"
          disabled
        >
          Confirmar e importar cadastro
        </button>
      </section>

      <section id="his-atas" class="hist-section hist-panel">
        <h3>Importar atas de resultado final</h3>

        <p class="hist-muted">
          Leitor para PDFs textuais no formato SAEWEB
          semelhante à ata de 2025.
          Nenhuma nota entra no banco antes da conferência.
        </p>

        <div class="hist-toolbar">
          <div class="hist-field">
            <label>PDF das atas</label>
            <input
              id="his-pdf"
              type="file"
              accept=".pdf"
            >
          </div>

          <button
            id="his-ler-pdf"
            class="btn btn-secondary"
          >
            Ler as atas
          </button>

          <label>
            <input
              type="checkbox"
              id="his-so-pend"
            >
            Mostrar apenas pendentes
          </label>
        </div>

        <div id="his-prev-pdf"></div>

        <label class="hist-check">
          <input
            type="checkbox"
            id="his-conferi-pdf"
          >

          <span>
            Conferi os resultados com a ata oficial.
            Autorizo a gravação dos registros identificados
            sem ambiguidade. Registros já existentes não
            serão sobrescritos.
          </span>
        </label>

        <button
          id="his-salvar-atas"
          class="btn btn-primary"
          disabled
        >
          Salvar registros conferidos
        </button>
      </section>

      <section id="his-emissao" class="hist-section hist-panel">
        <h3>Emissão conforme o modelo oficial ODS</h3>

        <p class="hist-muted">
          Selecione localmente uma cópia do modelo
          "AAA - MODELO HISTORICO - Apartir 2025.ods".
          O modelo não é armazenado no GitHub.
        </p>

        <div class="hist-toolbar">
          <div class="hist-field">
            <label>Modelo ODS original</label>
            <input
              id="his-modelo"
              type="file"
              accept=".ods"
            >
          </div>

          <button
            id="his-lote"
            class="btn btn-primary"
          >
            Gerar lote: 5º ano 2026
          </button>
        </div>

        <div class="hist-alert">
          Só são emitidos documentos com dados pessoais
          obrigatórios e resultados do 1º ao 5º ano
          individualmente conferidos.

          O lote é uma pasta ZIP com os arquivos
          ODS originais preenchidos.
        </div>

        <p class="hist-muted">
          Para gerar um aluno específico, abra seu cadastro
          na guia "Alunos". Antes da assinatura,
          confira visualmente o arquivo e as observações.
        </p>
      </section>

      <div id="hist-status"></div>
    `;
  }

  function aba(nome) {
    document.querySelectorAll('[data-tab]').forEach(
      x => x.classList.toggle(
        'on',
        x.dataset.tab === nome
      )
    );

    document.querySelectorAll('.hist-section').forEach(
      x => x.classList.toggle(
        'on',
        x.id === `his-${nome}`
      )
    );
  }

  /* =========================================================
     VERIFICAÇÃO DE PENDÊNCIAS
  ========================================================= */

  function pendencias(a) {
    const l = [];

    for (const [k, r] of [
      ['nascimento', 'Nascimento'],
      ['naturalidade', 'Naturalidade'],
      ['uf_naturalidade', 'UF'],
      ['sexo', 'Sexo'],
      ['nacionalidade', 'Nacionalidade'],
      ['mae', 'Filiação (mãe)'],
      ['identidade', 'Identidade'],
      ['orgao_expedidor', 'Órgão expedidor'],
      ['data_conclusao', 'Data de conclusão']
    ]) {
      if (!a[k]) l.push(r);
    }

    for (let serie = 1; serie <= 5; serie++) {
      const anos = S.resultados.filter(
        r => r.aluno_id === a.id &&
             Number(r.serie) === serie &&
             r.conferido
      );

      if (anos.length !== 1) {
        l.push(`${serie}º ano não conferido ou duplicado`);
      } else {
        const v = anos[0];

        if (!v.situacao) {
          l.push(`${serie}º ano sem situação final`);
        }

        if (!v.carga_horaria) {
          l.push(`${serie}º ano sem carga horária`);
        }

        if (!v.dias_letivos) {
          l.push(`${serie}º ano sem dias letivos`);
        }

        if (
          v.faltas_horas === null ||
          v.faltas_horas === undefined ||
          v.faltas_horas === ''
        ) {
          l.push(`${serie}º ano sem faltas em horas`);
        }

        if (
          !Object.values(v.notas || {}).some(Boolean) &&
          /^APROVAD/i.test(norm(v.situacao))
        ) {
          l.push(`${serie}º ano sem notas registradas`);
        }

        if (/^TRANSFER/i.test(norm(v.situacao))) {
          l.push(`${serie}º ano marcado como transferência`);
        }
      }
    }

    const quinto = S.resultados.find(
      r => r.aluno_id === a.id &&
           Number(r.serie) === 5 &&
           r.conferido
    );

    if (
      quinto &&
      !/^APROVAD|^CONCLU/i.test(norm(quinto.situacao))
    ) {
      l.push('5º ano sem situação de conclusão');
    }

    return l;
  }

  /* =========================================================
     LISTAGEM DOS ALUNOS
  ========================================================= */

  function renderAlunos() {
    const filtro = $('his-filtro').value;
    const q = norm($('his-busca').value);

    let a = S.alunos.filter(
      x => !q ||
           norm(x.nome).includes(q) ||
           norm(x.matricula).includes(q)
    );

    if (filtro !== 'todos') {
      a = a.filter(
        x => Number(x.serie_atual) === 5 &&
             Number(x.ano_atual) === 2026
      );
    }

    if (filtro === 'pendentes') {
      a = a.filter(x => pendencias(x).length);
    }

    const vistos = a.slice(0, 120);

    $('his-lista').innerHTML = `
      <p class="hist-muted">
        ${a.length} aluno(s) encontrados.
        Exibindo ${vistos.length};
        refine a pesquisa se necessário.
      </p>

      <div class="hist-table">
        <table>
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Matrícula</th>
              <th>Turma</th>
              <th>Histórico</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            ${vistos.map(x => `
              <tr>
                <td>
                  <strong>${esc(x.nome)}</strong>
                </td>

                <td>${esc(x.matricula || '—')}</td>
                <td>${esc(x.turma_atual || '—')}</td>

                <td>
                  ${
                    pendencias(x).length
                      ? '<span class="hist-tag">Pendente</span>'
                      : '<span class="hist-tag">Pronto para conferir</span>'
                  }
                </td>

                <td>
                  <button
                    class="btn btn-secondary btn-sm"
                    data-aluno="${esc(x.id)}"
                  >
                    Abrir
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.querySelectorAll('[data-aluno]').forEach(
      b => b.onclick = () => mostrarAluno(
        b.dataset.aluno
      )
    );
  }

  /* =========================================================
     CADASTRO INDIVIDUAL DO ALUNO
  ========================================================= */

  function dadosAlunoForm(a) {
    return [
      ['nome', 'Nome completo'],
      ['matricula', 'Matrícula'],
      ['nascimento', 'Nascimento (AAAA-MM-DD)'],
      ['sexo', 'Sexo'],
      ['naturalidade', 'Naturalidade'],
      ['uf_naturalidade', 'UF de nascimento'],
      ['nacionalidade', 'Nacionalidade'],
      ['mae', 'Nome da mãe'],
      ['pai', 'Nome do pai'],
      ['identidade', 'Identidade'],
      ['orgao_expedidor', 'Órgão expedidor/UF'],
      ['cpf', 'CPF (se necessário)'],
      ['serie_atual', 'Série atual'],
      ['turma_atual', 'Turma atual'],
      ['ano_atual', 'Ano da turma'],
      ['data_conclusao', 'Conclusão (AAAA-MM-DD)'],
      ['observacoes', 'Observações']
    ].map(
      ([k, n]) => `
        <div class="hist-field">
          <label>${n}</label>
          <input
            data-dado="${k}"
            value="${esc(a[k] ?? '')}"
          >
        </div>
      `
    ).join('');
  }

  function mostrarAluno(id) {
    const a = S.alunos.find(x => x.id === id);

    if (!a) return;

    S.atual = id;

    const p = pendencias(a);

    const resultados = S.resultados.filter(
      r => r.aluno_id === id
    ).sort(
      (a, b) => a.serie - b.serie ||
                a.ano_letivo - b.ano_letivo
    );

    $('his-perfil').innerHTML = `
      <div
        class="hist-panel"
        style="margin-top:18px;border:2px solid #b4c7e7"
      >
        <h3>${esc(a.nome)}</h3>

        ${
          p.length
            ? `
              <div class="hist-alert">
                <b>Pendências:</b>
                ${p.map(esc).join('; ')}
              </div>
            `
            : `
              <div class="hist-success">
                Cinco anos e dados essenciais conferidos.
                Pronto para a revisão final.
              </div>
            `
        }

        <h4>Cadastro pessoal</h4>

        <div class="hist-form">
          ${dadosAlunoForm(a)}
        </div>

        <button
          class="btn btn-primary"
          id="his-salvar-aluno"
        >
          Salvar cadastro
        </button>

        <h4 style="margin-top:25px">
          Resultados escolares
        </h4>

        <div class="hist-table">
          <table>
            <thead>
              <tr>
                <th>Ano</th>
                <th>Série</th>
                <th>Turma</th>
                <th>Situação</th>
                <th>Notas</th>
                <th>Conferido</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              ${resultados.map(r => `
                <tr>
                  <td>${esc(r.ano_letivo)}</td>
                  <td>${esc(r.serie)}º</td>
                  <td>${esc(r.turma || '—')}</td>
                  <td>${esc(r.situacao || '—')}</td>

                  <td>
                    ${
                      Object.values(r.notas || {})
                        .filter(Boolean).length
                    } disciplina(s)
                  </td>

                  <td>
                    ${r.conferido ? 'Sim' : 'Não'}
                  </td>

                  <td>
                    <button
                      class="btn btn-secondary btn-sm"
                      data-resultado="${esc(r.id)}"
                    >
                      Revisar
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div
          class="hist-toolbar"
          style="margin-top:16px"
        >
          <button
            id="his-add-resultado"
            class="btn btn-secondary"
          >
            + Lançar ano anterior
          </button>

          <button
            id="his-gerar-aluno"
            class="btn btn-primary"
            ${p.length ? 'disabled' : ''}
          >
            Gerar ODS deste aluno
          </button>
        </div>
      </div>
    `;

    $('his-salvar-aluno').onclick = () => salvarAluno(a);

    $('his-add-resultado').onclick = () => editarResultado(
      null,
      a.id
    );

    $('his-gerar-aluno').onclick = () => emitirUm(a);

    document.querySelectorAll('[data-resultado]').forEach(
      b => b.onclick = () => editarResultado(
        S.resultados.find(
          r => r.id === b.dataset.resultado
        ),
        a.id
      )
    );
  }

  async function salvarAluno(a) {
    const corpo = {};

    document.querySelectorAll('[data-dado]').forEach(
      x => corpo[x.dataset.dado] = x.value.trim() || null
    );

    if (!corpo.nome) {
      return msg(
        'Preencha o nome do aluno.',
        'hist-error'
      );
    }

    corpo.nome_busca = norm(corpo.nome);

    ['serie_atual', 'ano_atual'].forEach(k => {
      corpo[k] = corpo[k] ? Number(corpo[k]) : null;
    });

    for (const k of ['nascimento', 'data_conclusao']) {
      if (corpo[k] && !data(corpo[k])) {
        return msg(
          `Data inválida no campo ${k}.`,
          'hist-error'
        );
      }
    }

    try {
      await api(
        `/historico_alunos?id=eq.${qs(a.id)}`,
        {
          method: 'PATCH',
          headers: {
            Prefer: 'return=minimal'
          },
          body: JSON.stringify(corpo)
        }
      );

      msg(
        'Dados do aluno salvos.',
        'hist-success'
      );

      await atualizar();
    } catch (e) {
      msg(
        `Erro: ${e.message}`,
        'hist-error'
      );
    }
  }

  /* =========================================================
     CADASTRO E CONFERÊNCIA DE RESULTADOS
  ========================================================= */

  function editarResultado(r, alunoId) {
    const inicial = r || {
      ano_letivo: ano() - 1,
      serie: 4,
      turma: '',
      turno: '',
      escola: 'E. M. PROFª EUNICE CARNEIRO',
      municipio_uf: 'MONTES CLAROS/MG',
      dias_letivos: 200,
      carga_horaria: '',
      faltas_horas: '',
      situacao: '',
      notas: {},
      conferido: false
    };

    const campo = (k, rot) => `
      <div class="hist-field">
        <label>${rot}</label>
        <input
          data-rcampo="${k}"
          value="${esc(inicial[k] ?? '')}"
        >
      </div>
    `;

    App.openModal({
      title: r
        ? 'Revisar resultado'
        : 'Lançar resultado escolar',

      body: `
        <div class="hist-form">
          ${campo('ano_letivo', 'Ano letivo')}
          ${campo('serie', 'Série (1 a 5)')}
          ${campo('turma', 'Turma')}
          ${campo('turno', 'Turno')}
          ${campo('dias_letivos', 'Dias letivos')}
          ${campo('carga_horaria', 'Carga horária (HH:MM)')}
          ${campo('faltas_horas', 'Faltas em horas (HH:MM)')}
          ${campo('escola', 'Estabelecimento')}
          ${campo('municipio_uf', 'Município/UF')}
          ${campo('situacao', 'Situação final')}
        </div>

        <h4>
          Notas finais (coluna N da ata;
          verifique cada valor)
        </h4>

        <div class="hist-form">
          ${DISC.map(([k, n]) => `
            <div class="hist-field">
              <label>${n}</label>
              <input
                data-nota="${k}"
                value="${esc(inicial.notas?.[k] ?? '')}"
              >
            </div>
          `).join('')}
        </div>

        <label class="hist-check">
          <input
            id="his-ano-conferido"
            type="checkbox"
            ${inicial.conferido ? 'checked' : ''}
          >

          Conferi este registro com a documentação
          escolar original.
        </label>

        <p class="hist-muted">
          Fonte: ${esc(inicial.origem_arquivo || 'lançamento manual')}
          ${
            inicial.origem_pagina
              ? ' — pág. ' + esc(inicial.origem_pagina)
              : ''
          }.
          Confirme apenas dados sustentados por documentos.
        </p>
      `,

      footer: `
        <button
          class="btn btn-secondary"
          data-close-modal
        >
          Cancelar
        </button>

        <button
          class="btn btn-primary"
          id="his-gravar-resultado"
        >
          Salvar resultado
        </button>
      `
    });

    $('his-gravar-resultado').onclick = async () => {
      const body = {
        aluno_id: alunoId
      };

      document.querySelectorAll('[data-rcampo]').forEach(
        x => body[x.dataset.rcampo] = x.value.trim() || null
      );

      body.ano_letivo = Number(body.ano_letivo);
      body.serie = Number(body.serie);

      body.dias_letivos = body.dias_letivos
        ? Number(body.dias_letivos)
        : null;

      body.notas = {};

      document.querySelectorAll('[data-nota]').forEach(
        x => {
          if (x.value.trim()) {
            body.notas[x.dataset.nota] =
              x.value.trim().replace(',', '.');
          }
        }
      );

      body.conferido = $('his-ano-conferido').checked;

      if (
        !Number.isInteger(body.ano_letivo) ||
        body.ano_letivo < 1990 ||
        body.ano_letivo > 2100 ||
        ![1, 2, 3, 4, 5].includes(body.serie) ||
        !body.situacao
      ) {
        return msg(
          'Informe ano válido, série (1–5) e situação final.',
          'hist-error'
        );
      }

      try {
        if (r) {
          await api(
            `/historico_resultados?id=eq.${qs(r.id)}`,
            {
              method: 'PATCH',
              headers: {
                Prefer: 'return=minimal'
              },
              body: JSON.stringify(body)
            }
          );
        } else {
          await api(
            '/historico_resultados',
            {
              method: 'POST',
              headers: {
                Prefer: 'return=minimal'
              },
              body: JSON.stringify(body)
            }
          );
        }

        App.closeModal();

        msg(
          'Resultado salvo e conferência registrada.',
          'hist-success'
        );

        await atualizar();
      } catch (e) {
        msg(
          `Erro: ${e.message}`,
          'hist-error'
        );
      }
    };
  }

  /* =========================================================
     IMPORTAR PLANILHA DE CADASTRO
  ========================================================= */

  const campos = [
    ['nome', 'Nome do aluno *'],
    ['matricula', 'Matrícula'],
    ['nascimento', 'Nascimento'],
    ['mae', 'Mãe'],
    ['pai', 'Pai'],
    ['sexo', 'Sexo'],
    ['naturalidade', 'Naturalidade'],
    ['uf_naturalidade', 'UF'],
    ['nacionalidade', 'Nacionalidade'],
    ['identidade', 'Identidade'],
    ['orgao_expedidor', 'Órgão expedidor'],
    ['cpf', 'CPF'],
    ['serie_atual', 'Série'],
    ['turma_atual', 'Turma'],
    ['ano_atual', 'Ano']
  ];

  const aliases = {
    nome: [
      'nome do aluno',
      'nome do estudante',
      'estudante',
      'aluno',
      'nome'
    ],

    matricula: [
      'matricula',
      'codigo do aluno',
      'código aluno',
      'cod aluno',
      'numero matricula'
    ],

    nascimento: [
      'data de nascimento',
      'nascimento',
      'data nasc'
    ],

    mae: [
      'nome da mae',
      'mae',
      'filiacao 1'
    ],

    pai: [
      'nome do pai',
      'pai',
      'filiacao 2'
    ],

    sexo: [
      'sexo',
      'genero'
    ],

    naturalidade: [
      'naturalidade',
      'cidade nascimento'
    ],

    uf_naturalidade: [
      'uf nascimento',
      'uf naturalidade'
    ],

    nacionalidade: [
      'nacionalidade'
    ],

    identidade: [
      'identidade',
      'rg',
      'carteira identidade'
    ],

    orgao_expedidor: [
      'orgao expedidor'
    ],

    cpf: [
      'cpf'
    ],

    serie_atual: [
      'serie',
      'ano escolar',
      'etapa',
      'serie atual'
    ],

    turma_atual: [
      'turma'
    ],

    ano_atual: [
      'ano letivo',
      'ano'
    ]
  };

  async function lerPlanilha() {
    const f = $('his-planilha').files[0];

    if (!f) {
      return msg(
        'Selecione a planilha antes de ler.',
        'hist-error'
      );
    }

    if (!window.XLSX) {
      return msg(
        'Biblioteca de Excel não carregou.',
        'hist-error'
      );
    }

    try {
      S.workbook = XLSX.read(
        await f.arrayBuffer(),
        {
          type: 'array',
          cellDates: false
        }
      );

      $('his-aba').innerHTML =
        S.workbook.SheetNames.map(
          x => `<option value="${esc(x)}">${esc(x)}</option>`
        ).join('');

      escolherAba();

      msg(
        'Planilha lida no navegador. Confira o mapeamento antes de salvar.',
        'hist-success'
      );
    } catch (e) {
      msg(
        `Não foi possível ler a planilha: ${e.message}`,
        'hist-error'
      );
    }
  }

  function escolherAba() {
    if (!S.workbook) return;

    const matriz = XLSX.utils.sheet_to_json(
      S.workbook.Sheets[$('his-aba').value],
      {
        header: 1,
        defval: '',
        raw: false
      }
    );

    let idx = 0;
    let best = -1;

    for (let i = 0; i < Math.min(35, matriz.length); i++) {
      const row = matriz[i].map(norm);

      const score = row.filter(
        x => /ALUNO|ESTUDANTE|MATRICULA|NASCIMENTO|FILIACAO|TURMA/.test(x)
      ).length;

      if (score > best) {
        best = score;
        idx = i;
      }
    }

    S.colunas = matriz[idx].map(
      (x, i) => String(x || `Coluna ${i + 1}`).trim()
    );

    S.linhas = matriz.slice(idx + 1).filter(
      r => r.some(x => String(x ?? '').trim())
    );

    $('his-mapeamento').innerHTML = `
      <h4>
        Associe cada informação à coluna correspondente
      </h4>

      <div class="hist-form">
        ${campos.map(([key, label]) => {
          const options = [
            '<option value="">Não importar</option>',
            ...S.colunas.map(
              (c, i) => `
                <option value="${i}">
                  ${esc(c)} (#${i + 1})
                </option>
              `
            )
          ].join('');

          return `
            <div class="hist-field">
              <label>${label}</label>

              <select data-map="${key}">
                ${options}
              </select>
            </div>
          `;
        }).join('')}
      </div>
    `;

    document.querySelectorAll('[data-map]').forEach(el => {
      const key = el.dataset.map;
      const list = aliases[key] || [];

      let found = S.colunas.findIndex(
        c => list.some(v => norm(c) === norm(v))
      );

      if (found < 0) {
        found = S.colunas.findIndex(
          c => list.some(v => norm(c).includes(norm(v)))
        );
      }

      el.value = found < 0 ? '' : String(found);
      el.onchange = prevPlanilha;
    });

    prevPlanilha();

    $('his-salvar-planilha').disabled = false;
  }

  function linhasPlanilha() {
    const map = {};

    document.querySelectorAll('[data-map]').forEach(x => {
      if (x.value !== '') {
        map[x.dataset.map] = Number(x.value);
      }
    });

    if (map.nome === undefined) return [];

    return S.linhas.map(r => {
      const a = {};

      for (const [k, i] of Object.entries(map)) {
        a[k] = String(r[i] ?? '').trim() || null;
      }

      if (!a.nome) return null;

      a.nome_busca = norm(a.nome);
      a.nascimento = data(a.nascimento) || null;

      for (const k of ['serie_atual', 'ano_atual']) {
        a[k] = a[k]
          ? Number(String(a[k]).replace(/\D/g, '')) || null
          : null;
      }

      return a;
    }).filter(Boolean);
  }

  function prevPlanilha() {
    const dados = linhasPlanilha();

    $('his-prev-planilha').innerHTML = `
      <p class="hist-muted">
        ${dados.length} linhas com nome de aluno.
        Os primeiros registros para conferência:
      </p>

      <div class="hist-table">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Matrícula</th>
              <th>Nascimento</th>
              <th>Série</th>
              <th>Turma</th>
            </tr>
          </thead>

          <tbody>
            ${dados.slice(0, 8).map(x => `
              <tr>
                <td>${esc(x.nome)}</td>
                <td>${esc(x.matricula)}</td>
                <td>${esc(x.nascimento)}</td>
                <td>${esc(x.serie_atual)}</td>
                <td>${esc(x.turma_atual)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  async function importarPlanilha() {
    const dados = linhasPlanilha();

    if (!dados.length) {
      return msg(
        'Associe corretamente a coluna Nome do aluno.',
        'hist-error'
      );
    }

    if (!confirm(
      `Importar ${dados.length} linhas? Dados duvidosos ou duplicados serão ignorados para conferência.`
    )) {
      return;
    }

    $('his-salvar-planilha').disabled = true;

    let novos = [];
    let atualizarReg = [];
    let ignorados = 0;

    const porMat = new Map(
      S.alunos.filter(x => x.matricula).map(
        x => [norm(x.matricula), x]
      )
    );

    const porIdent = new Map();

    for (const a of S.alunos) {
      const key = norm(a.nome) + '|' + (a.nascimento || '');

      if (!porIdent.has(key)) {
        porIdent.set(key, []);
      }

      porIdent.get(key).push(a);
    }

    const vistos = new Set();

    for (const item of dados) {
      const key = item.matricula
        ? 'M' + norm(item.matricula)
        : 'N' + item.nome_busca + '|' + (item.nascimento || '');

      if (vistos.has(key)) {
        ignorados++;
        continue;
      }

      vistos.add(key);

      const achou = item.matricula
        ? porMat.get(norm(item.matricula))
        : null;

      const semelhantes = porIdent.get(
        item.nome_busca + '|' + (item.nascimento || '')
      ) || [];

      const match = achou || (
        semelhantes.length === 1
          ? semelhantes[0]
          : null
      );

      if (semelhantes.length > 1 && !achou) {
        ignorados++;
        continue;
      }

      if (match) {
        if (
          norm(match.nome) !== item.nome_busca &&
          item.matricula
        ) {
          ignorados++;
          continue;
        }

        const patch = {};

        for (const [k, v] of Object.entries(item)) {
          if (
            v !== null &&
            v !== '' &&
            match[k] !== v &&
            (
              !match[k] ||
              ['serie_atual', 'turma_atual', 'ano_atual'].includes(k)
            )
          ) {
            patch[k] = v;
          }
        }

        if (Object.keys(patch).length) {
          atualizarReg.push({
            id: match.id,
            patch
          });
        }
      } else {
        novos.push(item);
      }
    }

    try {
      for (let i = 0; i < novos.length; i += 80) {
        await api(
          '/historico_alunos',
          {
            method: 'POST',
            headers: {
              Prefer: 'return=minimal'
            },
            body: JSON.stringify(
              novos.slice(i, i + 80)
            )
          }
        );

        msg(
          `Inserindo alunos: ${Math.min(i + 80, novos.length)}/${novos.length}`
        );

        await sleep();
      }

      for (let i = 0; i < atualizarReg.length; i++) {
        const a = atualizarReg[i];

        await api(
          `/historico_alunos?id=eq.${qs(a.id)}`,
          {
            method: 'PATCH',
            headers: {
              Prefer: 'return=minimal'
            },
            body: JSON.stringify(a.patch)
          }
        );

        if (i % 50 === 0) {
          msg(
            `Atualizando cadastros existentes: ${i + 1}/${atualizarReg.length}`
          );

          await sleep();
        }
      }

      await atualizar();

      msg(
        `Concluído: ${novos.length} novos; ${atualizarReg.length} atualizados; ${ignorados} duplicados/divergentes ignorados.`,
        'hist-success'
      );
    } catch (e) {
      msg(
        `Importação interrompida: ${e.message}. Atualize antes de tentar novamente.`,
        'hist-error'
      );
    } finally {
      $('his-salvar-planilha').disabled = false;
    }
  }

  /* =========================================================
     IMPORTAR ATA PDF
     Primeira versão para SAEWEB textual.
     Notas são sugestões que exigem revisão humana.
  ========================================================= */

  function textoPerto(lista, inf, sup, y, delta = 2.9) {
    return lista.filter(
      x => x.x >= inf &&
           x.x < sup &&
           Math.abs(x.y - y) < delta
    )
    .sort((a, b) => a.x - b.x)
    .map(x => x.s)
    .join(' ')
    .trim();
  }

  function metadadosPDF(items) {
    const faixa = items.filter(
      x => x.y > 112 && x.y < 140
    )
    .sort((a, b) => a.x - b.x)
    .map(x => x.s)
    .join(' ');

    const pagina = items.map(x => x.s).join(' ');

    const yy = pagina.match(
      /ATA DE RESULTADO FINAL DE APROVEITAMENTO\s*-\s*ANO:\s*(\d{4})/i
    ) || pagina.match(
      /ANO:\s*(20\d{2})/i
    );

    const turma = faixa.match(
      /Turma:\s*(.*?)\s+Ensino:/i
    );

    const serie = faixa.match(
      /Série\/Etapa:\s*(\d)[º°]?/i
    );

    const turno = faixa.match(
      /Turno:\s*(.*?)\s+Dias letivos:/i
    );

    const dias = faixa.match(
      /Dias letivos:\s*(\d+)/i
    );

    const ch = faixa.match(
      /Carga horária:\s*([\d:]+)/i
    );

    return {
      ano_letivo: yy ? Number(yy[1]) : null,
      serie: serie ? Number(serie[1]) : null,
      turma: turma?.[1]?.trim() || '',
      turno: turno?.[1]?.trim() || '',
      dias_letivos: dias ? Number(dias[1]) : null,
      carga_horaria: ch?.[1] || ''
    };
  }

  function linhasPDF(
    items,
    pgHeight,
    meta,
    numPagina,
    nomeArquivo
  ) {
    const marcas = items.filter(
      x => x.x >= 19 &&
           x.x < 35 &&
           /^\d{1,2}$/.test(x.s) &&
           x.y > 211 &&
           x.y < pgHeight - 25
    ).sort((a, b) => a.y - b.y);

    const saida = [];

    for (let i = 0; i < marcas.length; i++) {
      const m = marcas[i];
      const n = marcas[i + 1];

      const nome = textoPerto(
        items,
        35,
        176,
        m.y,
        3.2
      ).replace(/\s*\*\s*$/, '').trim();

      if (
        nome.length < 5 ||
        !/[A-Za-zÀ-ÿ]/.test(nome)
      ) {
        continue;
      }

      const notas = {};

      DISC.forEach(([chave], j) => {
        const v = textoPerto(
          items,
          XNOTAS[j][0],
          XNOTAS[j][1],
          m.y,
          3.1
        ).replace(',', '.');

        if (/^\d+(?:\.\d+)?$/.test(v)) {
          notas[chave] = v;
        }
      });

      const status = items.filter(
        t => t.x >= 727 &&
             t.x < 839 &&
             t.y >= m.y - 9 &&
             t.y < (
               n ? n.y - 8 : pgHeight - 15
             )
      )
      .sort(
        (a, b) => a.y - b.y || a.x - b.x
      )
      .map(t => t.s)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

      saida.push({
        ...meta,
        nome,
        nome_busca: norm(nome),
        notas,
        situacao: status,
        origem_pagina: numPagina,
        origem_arquivo: nomeArquivo,
        aluno_id: null
      });
    }

    return saida;
  }

  function associar(d) {
    const iguais = S.alunos.filter(
      x => x.nome_busca === d.nome_busca
    );

    d.aluno_id = iguais.length === 1
      ? iguais[0].id
      : null;

    d.problema =
      !d.ano_letivo || !d.serie
        ? 'Cabeçalho ilegível'
        : !d.aluno_id
          ? (
              iguais.length > 1
                ? 'Nome duplicado'
                : 'Aluno não encontrado'
            )
          : (
              !d.situacao
                ? 'Situação final ilegível'
                : Object.keys(d.notas).length < 4 &&
                  !/TRANSFER|DESIST|CANCEL/i.test(
                    norm(d.situacao)
                  )
                  ? 'Notas incompletas'
                  : ''
            );
  }

  async function lerAtas() {
    const f = $('his-pdf').files[0];

    if (!f) {
      return msg(
        'Selecione o PDF das atas.',
        'hist-error'
      );
    }

    if (!window.pdfjsLib) {
      return msg(
        'Biblioteca de PDF não foi carregada.',
        'hist-error'
      );
    }

    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const pdf = await pdfjsLib.getDocument({
        data: await f.arrayBuffer()
      }).promise;

      const arr = [];

      for (let p = 1; p <= pdf.numPages; p++) {
        const pg = await pdf.getPage(p);

        const v = pg.getViewport({
          scale: 1
        });

        const cnt = await pg.getTextContent();

        const items = cnt.items.filter(
          x => String(x.str).trim()
        ).map(x => ({
          x: x.transform[4],
          y: v.height - x.transform[5],
          s: String(x.str).trim()
        }));

        const meta = metadadosPDF(items);

        arr.push(
          ...linhasPDF(
            items,
            v.height,
            meta,
            p,
            f.name
          )
        );

        if (p % 3 === 0) {
          msg(
            `Lendo atas: ${p}/${pdf.numPages} páginas`
          );

          await sleep();
        }
      }

      S.rascunhos = arr;
      S.paginaPDF = 0;

      S.rascunhos.forEach(associar);

      renderAtas();

      $('his-salvar-atas').disabled = !arr.length;

      msg(
        `PDF lido: ${arr.length} registros propostos. Confira o quadro e resolva os pendentes antes de gravar.`,
        'hist-success'
      );
    } catch (e) {
      msg(
        `Erro ao ler PDF: ${e.message}`,
        'hist-error'
      );
    }
  }

  function renderAtas() {
    const falhas = S.rascunhos.filter(
      x => x.problema
    );

    const vis = $('his-so-pend').checked
      ? falhas
      : S.rascunhos;

    S.paginaPDF = Math.max(
      0,
      Math.min(
        S.paginaPDF,
        Math.max(
          0,
          Math.ceil(vis.length / 100) - 1
        )
      )
    );

    const trecho = vis.slice(
      S.paginaPDF * 100,
      (S.paginaPDF + 1) * 100
    );

    const jaExiste = r => S.resultados.some(
      x => x.aluno_id === r.aluno_id &&
           Number(x.ano_letivo) === r.ano_letivo &&
           Number(x.serie) === r.serie
    );

    $('his-prev-pdf').innerHTML = `
      <p class="hist-muted">
        <b>${S.rascunhos.length}</b> registros extraídos •
        <b>${falhas.length}</b> com pendência •
        <b>${S.rascunhos.length - falhas.length}</b>
        aptos a conferir.

        Página ${S.paginaPDF + 1} de
        ${Math.max(1, Math.ceil(vis.length / 100))};
        mostrando ${trecho.length} registros.
      </p>

      <div class="hist-table">
        <table>
          <thead>
            <tr>
              <th>pág.</th>
              <th>Aluno na ata</th>
              <th>Ano/turma</th>
              <th>Notas</th>
              <th>Situação</th>
              <th>Vinculação</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            ${trecho.map(d => {
              const i = S.rascunhos.indexOf(d);

              return `
                <tr>
                  <td>${esc(d.origem_pagina)}</td>
                  <td>${esc(d.nome)}</td>

                  <td>
                    ${esc(d.ano_letivo)} /
                    ${esc(d.turma)}
                  </td>

                  <td>
                    ${Object.keys(d.notas).length} de 10
                  </td>

                  <td>${esc(d.situacao || '—')}</td>

                  <td>
                    ${
                      d.problema
                        ? `<span class="hist-tag">
                             ${esc(d.problema)}
                           </span>`
                        : jaExiste(d)
                          ? '<span class="hist-tag">Já cadastrado</span>'
                          : 'Vínculo exato'
                    }
                  </td>

                  <td class="hist-actions">
                    <button
                      class="btn btn-secondary btn-sm"
                      data-editar-ata="${i}"
                    >
                      Ver notas
                    </button>

                    ${
                      d.problema
                        ? `
                          <button
                            class="btn btn-secondary btn-sm"
                            data-vincular="${i}"
                          >
                            Vincular
                          </button>
                        `
                        : ''
                    }
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div
        class="hist-toolbar"
        style="margin-top:12px"
      >
        <button
          class="btn btn-secondary btn-sm"
          id="his-pdf-ant"
          ${S.paginaPDF === 0 ? 'disabled' : ''}
        >
          Anterior
        </button>

        <button
          class="btn btn-secondary btn-sm"
          id="his-pdf-prox"
          ${
            (S.paginaPDF + 1) * 100 >= vis.length
              ? 'disabled'
              : ''
          }
        >
          Próxima
        </button>
      </div>
    `;

    $('his-pdf-ant').onclick = () => {
      S.paginaPDF--;
      renderAtas();
    };

    $('his-pdf-prox').onclick = () => {
      S.paginaPDF++;
      renderAtas();
    };

    document.querySelectorAll('[data-editar-ata]').forEach(
      b => b.onclick = () => editarAta(
        Number(b.dataset.editarAta)
      )
    );

    document.querySelectorAll('[data-vincular]').forEach(
      b => b.onclick = () => vincularAta(
        Number(b.dataset.vincular)
      )
    );
  }

  function vincularAta(i) {
    const d = S.rascunhos[i];

    const busca = prompt(
      `Vincular: ${d.nome}\nDigite a MATRÍCULA exata do aluno cadastrado:`
    );

    if (!busca) return;

    const iguais = S.alunos.filter(
      x => norm(x.matricula) === norm(busca)
    );

    if (iguais.length !== 1) {
      return msg(
        'Matrícula não encontrada ou ambígua. Verifique no cadastro.',
        'hist-error'
      );
    }

    if (
      norm(iguais[0].nome) !== norm(d.nome) &&
      !confirm(
        `Os nomes diferem:\nAta: ${d.nome}\nCadastro: ${iguais[0].nome}\nVocê confirmou a identidade nos documentos?`
      )
    ) {
      return;
    }

    d.aluno_id = iguais[0].id;

    associar(d);

    d.aluno_id = iguais[0].id;

    if (
      d.problema === 'Nome duplicado' ||
      d.problema === 'Aluno não encontrado'
    ) {
      d.problema = '';
    }

    if (!d.situacao) {
      d.problema = 'Situação final ilegível';
    }

    if (
      Object.keys(d.notas).length < 4 &&
      !/TRANSFER|DESIST|CANCEL/i.test(norm(d.situacao))
    ) {
      d.problema = 'Notas incompletas';
    }

    renderAtas();
  }

  function editarAta(i) {
    const d = S.rascunhos[i];

    App.openModal({
      title: `Conferir ata — pág. ${d.origem_pagina}`,

      body: `
        <p>
          <b>${esc(d.nome)}</b> —
          ${esc(d.turma)} /
          ${esc(d.ano_letivo)}
        </p>

        <div class="hist-form">
          ${DISC.map(([k, n]) => `
            <div class="hist-field">
              <label>${n}</label>

              <input
                data-nota-ata="${k}"
                value="${esc(d.notas[k] || '')}"
              >
            </div>
          `).join('')}

          <div class="hist-field">
            <label>Situação final</label>

            <input
              id="his-sit-ata"
              value="${esc(d.situacao)}"
            >
          </div>
        </div>

        <p class="hist-muted">
          Compare com o PDF original antes de salvar.
          Os valores aqui são sugestões
          extraídas automaticamente.
        </p>
      `,

      footer: `
        <button
          class="btn btn-secondary"
          data-close-modal
        >
          Cancelar
        </button>

        <button
          class="btn btn-primary"
          id="his-aplicar-ata"
        >
          Atualizar rascunho
        </button>
      `
    });

    $('his-aplicar-ata').onclick = () => {
      d.notas = {};

      document.querySelectorAll('[data-nota-ata]').forEach(
        x => {
          const n = x.value.trim().replace(',', '.');

          if (n) {
            d.notas[x.dataset.notaAta] = n;
          }
        }
      );

      d.situacao = $('his-sit-ata').value.trim();

      associar(d);
      App.closeModal();
      renderAtas();
    };
  }

  async function gravarAtas() {
    if (!$('his-conferi-pdf').checked) {
      return msg(
        'Marque a confirmação após conferir o PDF com os resultados.',
        'hist-error'
      );
    }

    const validas = S.rascunhos.filter(
      x => !x.problema && x.aluno_id
    );

    const existentes = new Set(
      S.resultados.map(
        x => `${x.aluno_id}|${x.ano_letivo}|${x.serie}`
      )
    );

    const paraSalvar = validas.filter(
      x => !existentes.has(
        `${x.aluno_id}|${x.ano_letivo}|${x.serie}`
      )
    );

    if (!paraSalvar.length) {
      return msg(
        'Nenhum resultado novo apto para salvar. Os pendentes exigem revisão.',
        'hist-alert'
      );
    }

    if (!confirm(
      `Você conferiu ${paraSalvar.length} registros com a ata oficial?\nSalvar somente os identificados sem pendência?`
    )) {
      return;
    }

    $('his-salvar-atas').disabled = true;

    try {
      for (let i = 0; i < paraSalvar.length; i += 70) {
        const corpo = paraSalvar.slice(i, i + 70).map(
          d => ({
            aluno_id: d.aluno_id,
            ano_letivo: d.ano_letivo,
            serie: d.serie,
            turma: d.turma,
            turno: d.turno,
            dias_letivos: d.dias_letivos,
            carga_horaria: d.carga_horaria,
            notas: d.notas,
            situacao: d.situacao,
            origem_arquivo: d.origem_arquivo,
            origem_pagina: d.origem_pagina,
            conferido: true
          })
        );

        await api(
          '/historico_resultados',
          {
            method: 'POST',
            headers: {
              Prefer: 'return=minimal'
            },
            body: JSON.stringify(corpo)
          }
        );

        msg(
          `Gravando resultados conferidos: ${
            Math.min(i + 70, paraSalvar.length)
          }/${paraSalvar.length}`
        );

        await sleep();
      }

      await atualizar();
      renderAtas();

      msg(
        `${paraSalvar.length} resultados conferidos salvos. ${
          S.rascunhos.length - validas.length
        } pendências não foram importadas.`,
        'hist-success'
      );
    } catch (e) {
      msg(
        `Erro ao salvar resultados: ${e.message}. Atualize antes de repetir.`,
        'hist-error'
      );
    } finally {
      $('his-salvar-atas').disabled = false;
    }
  }

  /* =========================================================
     MODELO OFICIAL ODS
     Preserva a estrutura e os estilos do arquivo ZIP/ODS.
     Altera somente valores de células específicas.
  ========================================================= */

  const O =
    'urn:oasis:names:tc:opendocument:xmlns:office:1.0';

  const T =
    'urn:oasis:names:tc:opendocument:xmlns:table:1.0';

  const TX =
    'urn:oasis:names:tc:opendocument:xmlns:text:1.0';

  function tableChildren(node, name) {
    return Array.from(node.childNodes).filter(
      n => n.nodeType === 1 &&
           n.namespaceURI === T &&
           n.localName === name
    );
  }

  function linha(tabela, n) {
    let pos = 1;

    for (const row of tableChildren(tabela, 'table-row')) {
      const rep = Number(
        row.getAttributeNS(T, 'number-rows-repeated') || 1
      );

      if (n >= pos && n < pos + rep) {
        if (rep !== 1) {
          throw Error(
            'O modelo contém linha repetida na área preenchível; revise o modelo.'
          );
        }

        return row;
      }

      pos += rep;
    }

    throw Error(`Linha ${n} inexistente no modelo`);
  }

  function celula(row, n) {
    let pos = 1;

    const filhos = Array.from(row.childNodes).filter(
      x => x.nodeType === 1 &&
           x.namespaceURI === T &&
           [
             'table-cell',
             'covered-table-cell'
           ].includes(x.localName)
    );

    for (const el of filhos) {
      const rep = Number(
        el.getAttributeNS(T, 'number-columns-repeated') || 1
      );

      if (n >= pos && n < pos + rep) {
        if (el.localName === 'covered-table-cell') {
          throw Error(
            `Célula mesclada não editável na coluna ${n}`
          );
        }

        if (rep === 1) {
          return el;
        }

        const antes = n - pos;
        const depois = rep - antes - 1;

        if (antes) {
          const a = el.cloneNode(true);

          a.setAttributeNS(
            T,
            'table:number-columns-repeated',
            antes
          );

          row.insertBefore(a, el);
        }

        const alvo = el.cloneNode(true);

        alvo.removeAttributeNS(
          T,
          'number-columns-repeated'
        );

        row.insertBefore(alvo, el);

        if (depois) {
          el.setAttributeNS(
            T,
            'table:number-columns-repeated',
            depois
          );
        } else {
          row.removeChild(el);
        }

        return alvo;
      }

      pos += rep;
    }

    throw Error(`Coluna ${n} inexistente no modelo`);
  }

  function preencher(doc, tabela, r, c, valor) {
    const target = celula(
      linha(tabela, r),
      c
    );

    while (target.firstChild) {
      target.removeChild(target.firstChild);
    }

    target.setAttributeNS(
      O,
      'office:value-type',
      'string'
    );

    [
      'value',
      'date-value',
      'time-value',
      'boolean-value',
      'currency'
    ].forEach(
      k => target.removeAttributeNS(O, k)
    );

    const p = doc.createElementNS(
      TX,
      'text:p'
    );

    p.textContent = String(valor ?? '');

    target.appendChild(p);
  }

  function anoDados(a, serie) {
    return S.resultados.find(
      x => x.aluno_id === a.id &&
           Number(x.serie) === serie &&
           x.conferido
    );
  }

  const mes = [
    'JANEIRO',
    'FEVEREIRO',
    'MARÇO',
    'ABRIL',
    'MAIO',
    'JUNHO',
    'JULHO',
    'AGOSTO',
    'SETEMBRO',
    'OUTUBRO',
    'NOVEMBRO',
    'DEZEMBRO'
  ];

  async function construirODS(a, buffer) {
    const zip = await JSZip.loadAsync(buffer);

    const xml = await zip.file('content.xml')?.async('string');

    if (!xml) {
      throw Error(
        'Modelo ODS sem content.xml'
      );
    }

    const doc = new DOMParser().parseFromString(
      xml,
      'application/xml'
    );

    if (doc.querySelector('parsererror')) {
      throw Error(
        'XML do modelo ODS inválido'
      );
    }

    const tabela =
      doc.getElementsByTagNameNS(T, 'table')[0];

    if (!tabela) {
      throw Error(
        'Planilha não encontrada no ODS'
      );
    }

    const f = (r, c, v) => preencher(
      doc,
      tabela,
      r,
      c,
      v
    );

    f(6, 4, a.nome);
    f(7, 4, a.naturalidade);
    f(7, 13, a.uf_naturalidade);
    f(7, 17, a.nacionalidade || '');
    f(7, 21, a.sexo);

    const [y, m, d] = a.nascimento.split('-');

    f(8, 4, Number(d));
    f(8, 7, mes[Number(m) - 1]);
    f(8, 12, y);

    f(8, 17, a.pai || '');
    f(9, 2, a.mae || '');
    f(9, 22, a.identidade || '');
    f(10, 5, a.orgao_expedidor || '');

    f(
      10,
      14,
      a.data_conclusao.split('-').reverse().join('/')
    );

    for (let serie = 1; serie <= 5; serie++) {
      const r = 17 + (serie - 1) * 5;

      const v = anoDados(a, serie);

      if (!v) {
        throw Error(
          `Resultado do ${serie}º ano não conferido`
        );
      }

      f(
        r,
        2,
        `${serie}º ANO: ${v.ano_letivo}`
      );

      f(r, 6, '');

      DISC.forEach(
        ([key], i) => f(
          r,
          7 + i,
          v.notas?.[key] ?? ''
        )
      );

      f(
        r,
        18,
        v.situacao || ''
      );

      f(
        r + 1,
        6,
        v.carga_horaria || ''
      );

      f(
        r + 2,
        6,
        v.faltas_horas ?? ''
      );

      f(
        r + 3,
        3,
        'ESTABELECIMENTO: ' + (v.escola || '')
      );

      f(
        r + 3,
        13,
        'MUNICÍPIO/ESTADO: ' + (v.municipio_uf || '')
      );

      f(
        r + 4,
        3,
        'DIAS LETIVOS ANUAIS: ' + (v.dias_letivos ?? '')
      );

      f(
        r + 4,
        13,
        'CARGA HORÁRIA ANUAL: ' + (v.carga_horaria || '')
      );
    }

    f(
      46,
      10,
      `MONTES CLAROS/MG, ${
        new Date().toLocaleDateString('pt-BR')
      }.`
    );

    zip.file(
      'content.xml',
      new XMLSerializer().serializeToString(doc)
    );

    return zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.oasis.opendocument.spreadsheet',
      compression: 'DEFLATE'
    });
  }

  /* =========================================================
     BAIXAR ARQUIVOS GERADOS
  ========================================================= */

  function baixar(blob, nome) {
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;
    a.download = nome;

    document.body.appendChild(a);

    a.click();
    a.remove();

    setTimeout(
      () => URL.revokeObjectURL(url),
      120000
    );
  }

  function modelo() {
    const f = $('his-modelo').files[0];

    if (
      !f ||
      !f.name.toLowerCase().endsWith('.ods')
    ) {
      throw Error(
        'Escolha o modelo oficial .ods na guia Emissão.'
      );
    }

    return f;
  }

  /* =========================================================
     EMITIR HISTÓRICO INDIVIDUAL
  ========================================================= */

  async function emitirUm(a) {
    try {
      const p = pendencias(a);

      if (p.length) {
        throw Error(
          'Histórico pendente: ' + p.join('; ')
        );
      }

      const f = modelo();

      const blob = await construirODS(
        a,
        await f.arrayBuffer()
      );

      baixar(
        blob,
        `HISTORICO_${norm(a.nome).replace(/ /g, '_')}.ods`
      );

      msg(
        'ODS gerado. Abra, confira o layout e os dados antes de imprimir e assinar.',
        'hist-success'
      );
    } catch (e) {
      msg(
        e.message,
        'hist-error'
      );

      aba('emissao');
    }
  }

  /* =========================================================
     EMITIR HISTÓRICOS EM LOTE
  ========================================================= */

  async function emitirLote() {
    try {
      const f = modelo();

      const c = S.alunos.filter(
        a => Number(a.serie_atual) === 5 &&
             Number(a.ano_atual) === 2026
      );

      const aprovados = c.filter(
        a => !pendencias(a).length
      );

      if (!aprovados.length) {
        throw Error(
          'Nenhum aluno do 5º ano de 2026 possui histórico totalmente conferido.'
        );
      }

      if (!confirm(
        `Gerar ${aprovados.length} históricos completos em arquivo ZIP? Confira cada ODS antes da assinatura.`
      )) {
        return;
      }

      $('his-lote').disabled = true;

      const modeloArray = await f.arrayBuffer();
      const out = new JSZip();

      for (let i = 0; i < aprovados.length; i++) {
        const a = aprovados[i];

        const ods = await construirODS(
          a,
          modeloArray
        );

        out.file(
          `HISTORICO_${
            String(i + 1).padStart(3, '0')
          }_${
            norm(a.nome).replace(/ /g, '_')
          }.ods`,
          ods
        );

        if (i % 5 === 0) {
          msg(
            `Gerando lote: ${i + 1}/${aprovados.length}`
          );

          await sleep();
        }
      }

      baixar(
        await out.generateAsync({
          type: 'blob',
          compression: 'DEFLATE'
        }),
        'HISTORICOS_5_ANO_2026.zip'
      );

      msg(
        `${aprovados.length} históricos ODS incluídos no ZIP. Conferência visual e assinatura obrigatórias.`,
        'hist-success'
      );
    } catch (e) {
      msg(
        e.message,
        'hist-error'
      );
    } finally {
      $('his-lote').disabled = false;
    }
  }

  /* =========================================================
     INICIALIZAÇÃO DO MÓDULO
  ========================================================= */

  async function init() {
    const perfil = App.getProfile?.();

    if (
      !perfil ||
      ![
        'administrador',
        'secretaria'
      ].includes(perfil.perfil) ||
      perfil.ativo === false
    ) {
      App.layout(
        'Históricos Escolares',
        'Acesso restrito',
        '<div class="hist-error">Esta área exige um usuário ativo com perfil de administrador ou secretaria.</div>'
      );

      return;
    }

    App.layout(
      'Históricos Escolares',
      'Secretaria escolar — emissão em lote',
      painel()
    );

    document.querySelectorAll('[data-tab]').forEach(
      b => b.onclick = () => aba(b.dataset.tab)
    );

    $('his-busca').oninput = renderAlunos;
    $('his-filtro').onchange = renderAlunos;

    $('his-recarregar').onclick = () =>
      atualizar().catch(
        e => msg(e.message, 'hist-error')
      );

    $('his-ler-planilha').onclick = lerPlanilha;

    $('his-aba').onchange = escolherAba;

    $('his-salvar-planilha').onclick = importarPlanilha;

    $('his-ler-pdf').onclick = lerAtas;

    $('his-so-pend').onchange = () => {
      S.paginaPDF = 0;
      renderAtas();
    };

    $('his-salvar-atas').onclick = gravarAtas;

    $('his-lote').onclick = emitirLote;

    try {
      await atualizar();

      msg(
        'Módulo carregado. Importe os alunos e, depois, as atas.',
        'hist-success'
      );
    } catch (e) {
      msg(
        `Não foi possível conectar às tabelas de históricos: ${e.message}. Confira se executou o SQL e as permissões.`,
        'hist-error'
      );
    }
  }

  return {
    init
  };
})();
