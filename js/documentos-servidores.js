/* COLE ESTE BLOCO NO FINAL DE js/documentos-servidores.js. */
(function instalarIADeDocumentos() {
  'use strict';

  if (
    typeof DocumentosServidoresPage === 'undefined' ||
    window.__iaDocumentosExtra
  ) return;

  window.__iaDocumentosExtra = true;

  const $ = id => document.getElementById(id);
  const valor = id => String($(id)?.value || '').trim();

  const normalizar = x => String(x || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

  const tipos = [
    'declaracao', 'requerimento', 'prorrogacao',
    'substituicao', 'contratacao', 'calendario',
    'zeladoria', 'transporte', 'estagio', 'avanco',
    'memorando', 'comparecimento-responsavel'
  ];

  const campos = [
    'doc-numero', 'doc-data', 'doc-assunto', 'doc-cargo',
    'doc-inicio', 'doc-fim', 'doc-prazo', 'doc-afastamento',
    'doc-pedido', 'doc-motivo', 'doc-para', 'doc-ac',
    'doc-setor', 'doc-saudacao', 'doc-despedida', 'doc-qtd',
    'doc-alunos-num', 'doc-anos', 'doc-turno', 'doc-local',
    'doc-hora-inicio', 'doc-hora-fim', 'doc-saida',
    'doc-retorno', 'doc-instituicao', 'doc-horario',
    'doc-estudante', 'doc-turma-aluno', 'doc-anexos',
    'ds-nome', 'ds-estudante', 'ds-data',
    'ds-entrada', 'ds-saida'
  ];

  const formulario = [
    ...campos,
    'doc-principal', 'doc-secundario', 'doc-texto',
    'doc-assinante', 'doc-cargo-assinante', 'doc-destino',
    'ds-motivo', 'ds-assinante', 'ds-cargo'
  ];

  const fixos = new Set([
    'doc-numero', 'doc-data', 'doc-assinante',
    'doc-cargo-assinante', 'doc-para', 'doc-ac',
    'doc-setor', 'doc-saudacao', 'doc-despedida',
    'ds-assinante', 'ds-cargo'
  ]);

  function tipoAtual() {
    return valor('ds-modelo') === 'comparecimento-responsavel'
      ? 'comparecimento-responsavel'
      : valor('doc-tipo');
  }

  function capturar() {
    return {
      tipo: tipoAtual(),
      campos: Object.fromEntries(
        formulario
          .filter(id => $(id))
          .map(id => [id, valor(id)])
      )
    };
  }

  function mudarTipo(tipo) {
    if ($('ds-categoria') && $('ds-modelo')) {
      const categoria = [
        'declaracao',
        'requerimento',
        'comparecimento-responsavel'
      ].includes(tipo) ? 'declaracao' : 'memorando';

      if (valor('ds-categoria') !== categoria) {
        $('ds-categoria').value = categoria;
        $('ds-categoria').dispatchEvent(
          new Event('change', { bubbles: true })
        );
      }

      if (valor('ds-modelo') !== tipo) {
        const existe = [...$('ds-modelo').options]
          .some(o => o.value === tipo);

        if (!existe) {
          throw new Error(
            'Este modelo não está disponível no site.'
          );
        }

        $('ds-modelo').value = tipo;
        $('ds-modelo').dispatchEvent(
          new Event('change', { bubbles: true })
        );
      }
    } else if (valor('doc-tipo') !== tipo) {
      const existe = [...$('doc-tipo').options]
        .some(o => o.value === tipo);

      if (!existe) {
        throw new Error(
          'Este modelo não está disponível no site.'
        );
      }

      $('doc-tipo').value = tipo;
      $('doc-tipo').dispatchEvent(
        new Event('change', { bubbles: true })
      );
    }
  }

  function escrever(texto) {
    $('doc-texto').value = texto;
    $('doc-texto').dispatchEvent(
      new Event('input', { bubbles: true })
    );
  }

  function dataValida(x) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(x)) return false;

    const t = Date.parse(x + 'T12:00:00Z');

    return Number.isFinite(t) &&
      new Date(t).toISOString().slice(0, 10) === x;
  }

  async function montar() {
    if (
      !$('doc-texto') ||
      $('ia-titulo') ||
      $('ia-extra')
    ) return;

    const textoOriginal = $('doc-texto');
    let funcionarios = [];

    try {
      funcionarios = (
        await App.getAll('funcionarios')
      ).map(f => ({
        id: String(f.id),

        nome: String(
          f.nome || f.nome_completo || ''
        ).trim(),

        matricula: String(
          f.matricula ||
          f.matricula_funcional ||
          f.registro ||
          ''
        ).trim(),

        cargo: String(
          f.cargo ||
          f.cargo_funcao ||
          f.funcao ||
          ''
        ).trim()
      }));
    } catch {
      // O formulário continua disponível.
    }

    if (
      $('doc-texto') !== textoOriginal ||
      $('ia-titulo') ||
      $('ia-extra')
    ) return;

    const painel = document.createElement('section');
    painel.id = 'ia-extra';

    painel.innerHTML = `
      <style>
        #ia-extra {
          background: #f2f6ff;
          border: 1px solid #c8d8f4;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          color: #172033;
        }

        #ia-extra h3 {
          margin: 0 0 8px;
        }

        #ia-extra p {
          font-size: 13px;
          line-height: 1.5;
        }

        #ia-extra label {
          display: block;
          margin: 12px 0 5px;
          font-weight: 600;
        }

        #ia-extra textarea {
          box-sizing: border-box;
          width: 100%;
          min-height: 110px;
          padding: 10px;
          border: 1px solid #bdcde4;
          border-radius: 8px;
          font: inherit;
        }

        #ia-extra .ia-botoes {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        #ia-extra button {
          padding: 9px 12px;
          border: 1px solid #b6c8e4;
          border-radius: 7px;
          background: white;
          color: #153c78;
          cursor: pointer;
        }

        #ia-extra button[data-acao="gerar"] {
          background: #245bc5;
          color: white;
          border-color: #245bc5;
        }

        #ia-extra button:disabled {
          opacity: .55;
          cursor: wait;
        }

        #ia-extra-status {
          white-space: pre-line;
          margin-top: 12px;
          font-size: 13px;
          line-height: 1.5;
        }

        #ia-extra-perguntas button {
          display: block;
          text-align: left;
          margin-top: 8px;
        }

        #ia-extra [hidden] {
          display: none !important;
        }

        @media print {
          #ia-extra {
            display: none !important;
          }
        }
      </style>

      <h3>Assistente de documentos</h3>

      <p>
        Descreva o documento. A IA usa o cadastro e prepara
        a redação no modelo escolhido.
      </p>

      <label for="ia-extra-pedido">
        O que você precisa?
      </label>

      <textarea
        id="ia-extra-pedido"
        maxlength="12000"
        placeholder="Ex.: Faça um memorando prorrogando o contrato de [nome completo], em substituição a [nome completo] em readaptação, a partir de 20/10/2026 por 30 dias. Justificativa: manter o atendimento aos estudantes."
      ></textarea>

      <details>
        <summary>
          Informações ou texto de referência
        </summary>

        <label for="ia-extra-referencia">
          Referência opcional
        </label>

        <textarea
          id="ia-extra-referencia"
          maxlength="16000"
          placeholder="Cole informações que devem orientar a redação."
        ></textarea>
      </details>

      <div class="ia-botoes">
        <button type="button" data-acao="gerar">
          Preparar documento
        </button>

        <button type="button" data-acao="complementar">
          Complementar pedido
        </button>

        <button type="button" data-acao="melhorar">
          Melhorar texto
        </button>

        <button type="button" data-acao="resumir">
          Mais sucinto
        </button>

        <button type="button" data-acao="formalizar">
          Mais formal
        </button>

        <button type="button" id="ia-extra-verificar">
          Verificar dados
        </button>

        <button
          type="button"
          id="ia-extra-desfazer"
          disabled
        >
          Desfazer
        </button>

        <button type="button" id="ia-extra-novo">
          Novo pedido
        </button>

        <button
          type="button"
          id="ia-extra-cancelar"
          hidden
        >
          Cancelar
        </button>
      </div>

      <div
        id="ia-extra-status"
        role="status"
        aria-live="polite"
      ></div>

      <div id="ia-extra-perguntas"></div>

      <button
        type="button"
        id="ia-extra-aplicar"
        hidden
      >
        Aplicar sugestão recebida
      </button>
    `;

    textoOriginal.closest('.docs-panel').prepend(painel);

    if (!$('doc-afastamento')) {
      const bloco = document.createElement('div');
      bloco.className = 'docs-field full';

      bloco.innerHTML = `
        <label for="doc-afastamento">
          Motivo do afastamento / situação da vaga
        </label>

        <input
          id="doc-afastamento"
          maxlength="1000"
          placeholder="Ex.: LTS, readaptação, licença-maternidade"
        >
      `;

      $('doc-inicio')
        ?.closest('.docs-grid')
        ?.appendChild(bloco);
    }

    let pedidoAnterior = '';
    let controller = null;
    let pendente = null;

    const historico = [];

    const mensagem = texto => {
      if (painel.isConnected) {
        $('ia-extra-status').textContent = texto;
      }
    };

    const rotulo = f => f.nome + (
      f.matricula
        ? ' — Matrícula ' + f.matricula
        : ''
    );

    function pessoa(id) {
      const x = normalizar(valor(id));
      if (!x) return null;

      const encontrados = funcionarios.filter(f =>
        normalizar(rotulo(f)) === x ||
        normalizar(f.nome) === x ||
        (
          f.matricula &&
          normalizar(f.matricula) === x
        )
      );

      return encontrados.length === 1
        ? encontrados[0]
        : null;
    }

    function candidatos(texto) {
      const s = ' ' +
        normalizar(texto).replace(/[^a-z0-9]+/g, ' ') +
        ' ';

      const ignorar = new Set([
        'de', 'da', 'do', 'das', 'dos', 'e'
      ]);

      return funcionarios.map(f => {
        const nome = normalizar(f.nome);

        const partes = nome.split(' ')
          .filter(t => !ignorar.has(t));

        const n = partes.filter(t =>
          s.includes(' ' + t + ' ')
        ).length;

        const mat = f.matricula.replace(/\D/g, '');

        const score =
          mat.length >= 4 &&
          s.includes(' ' + mat + ' ')
            ? 120
            : nome && s.includes(' ' + nome + ' ')
              ? 110
              : n >= 2
                ? 70 + n
                : partes[0] &&
                  s.includes(' ' + partes[0] + ' ')
                  ? 30
                  : 0;

        return { id: f.id, score };
      })
        .filter(x => x.score)
        .sort((a, b) => b.score - a.score)
        .slice(0, 12)
        .map(x => x.id);
    }

    function perguntas(lista = []) {
      const area = $('ia-extra-perguntas');
      area.replaceChildren();

      for (const q of lista.slice(0, 12)) {
        const b = document.createElement('button');

        b.type = 'button';
        b.textContent = q.pergunta;

        b.onclick = () => {
          $(q.campo)?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });

          $(q.campo)?.focus();
        };

        area.appendChild(b);
      }
    }

    function pendencias() {
      const p = [];
      const tipo = tipoAtual();

      const exigir = (id, nome) => {
        if (!valor(id)) {
          p.push('Informe: ' + nome + '.');
        }
      };

      if (tipo === 'comparecimento-responsavel') {
        for (const [id, nome] of [
          ['ds-nome', 'responsável'],
          ['ds-data', 'data do comparecimento'],
          ['ds-entrada', 'entrada'],
          ['ds-saida', 'saída'],
          ['ds-assinante', 'assinante'],
          ['ds-cargo', 'cargo do assinante']
        ]) exigir(id, nome);

        if (
          valor('ds-saida') &&
          valor('ds-entrada') &&
          valor('ds-saida') <= valor('ds-entrada')
        ) {
          p.push('Confira os horários do comparecimento.');
        }
      } else {
        exigir('doc-data', 'data do documento');

        if (
          [
            'declaracao', 'requerimento', 'prorrogacao',
            'substituicao', 'estagio'
          ].includes(tipo) &&
          !pessoa('doc-principal')
        ) {
          p.push('Selecione o servidor no cadastro.');
        }

        if (tipo !== 'requerimento') {
          exigir('doc-assinante', 'assinante');
          exigir('doc-cargo-assinante', 'cargo do assinante');
        }

        if (!['declaracao', 'requerimento'].includes(tipo)) {
          exigir('doc-numero', 'número do memorando');
          exigir('doc-para', 'destinatário');
          exigir('doc-setor', 'setor');
        }

        if (
          ['prorrogacao', 'substituicao', 'calendario']
            .includes(tipo)
        ) {
          exigir('doc-inicio', 'data inicial');
          exigir('doc-fim', 'data final');
        }

        if (['memorando', 'requerimento'].includes(tipo)) {
          exigir('doc-pedido', 'pedido');
        }

        if (tipo !== 'declaracao') {
          exigir('doc-motivo', 'justificativa');
        }

        if (['substituicao', 'contratacao'].includes(tipo)) {
          exigir('doc-cargo', 'cargo a contratar');
        }

        if (tipo === 'zeladoria') {
          exigir('doc-qtd', 'quantidade de profissionais');
        }

        if (tipo === 'transporte') {
          for (const id of [
            'doc-alunos-num', 'doc-anos', 'doc-inicio',
            'doc-local', 'doc-saida', 'doc-retorno'
          ]) {
            exigir(id, id.replace('doc-', ''));
          }
        }

        if (tipo === 'avanco') {
          exigir('doc-estudante', 'estudante');
          exigir('doc-turma-aluno', 'turma');
        }

        if (
          ['prorrogacao', 'substituicao'].includes(tipo) &&
          valor('doc-inicio') &&
          valor('doc-fim') &&
          valor('doc-fim') < valor('doc-inicio')
        ) {
          p.push('Confira a ordem das datas.');
        }

        if (
          pessoa('doc-principal') &&
          pessoa('doc-principal') === pessoa('doc-secundario')
        ) {
          p.push(
            'Confira: titular e substituto são a mesma pessoa.'
          );
        }
      }

      if (!valor('doc-texto')) {
        p.push('O texto está vazio.');
      }

      if (/\[[^\]]+\]|\{\{[^}]+\}\}/.test(valor('doc-texto'))) {
        p.push('O texto contém informações a preencher.');
      }

      return p;
    }

    function validar(raw) {
      if (!raw || !tipos.includes(raw.tipo)) {
        throw new Error(
          'Tipo de documento inválido na resposta.'
        );
      }

      const entradas = Array.isArray(raw.campos)
        ? raw.campos.map(x => [x.campo, x.valor])
        : Object.entries(raw.campos || {});

      const dados = {};

      if (raw.assunto) {
        entradas.push(['doc-assunto', raw.assunto]);
      }

      for (const [id, v] of entradas) {
        if (!campos.includes(id)) continue;

        if (typeof v !== 'string' || v.length > 16000) {
          throw new Error('Campo inválido na resposta.');
        }

        if (
          v &&
          $(id)?.type === 'date' &&
          !dataValida(v)
        ) {
          throw new Error('Data inválida na resposta.');
        }

        if (
          v &&
          $(id)?.type === 'time' &&
          !/^([01]\d|2[0-3]):[0-5]\d$/.test(v)
        ) {
          throw new Error('Horário inválido na resposta.');
        }

        if (
          v &&
          $(id)?.type === 'number' &&
          (
            !/^\d+$/.test(v) ||
            Number(v) < 1 ||
            Number(v) > 100000
          )
        ) {
          throw new Error('Quantidade inválida na resposta.');
        }

        dados[id] = v;
      }

      for (const id of [
        raw.principal_id,
        raw.secundario_id
      ]) {
        if (
          id &&
          !funcionarios.some(f => f.id === String(id))
        ) {
          throw new Error(
            'A IA indicou uma pessoa fora do cadastro.'
          );
        }
      }

      if (
        !Array.isArray(raw.paragrafos) ||
        raw.paragrafos.length > 18 ||
        raw.paragrafos.some(p =>
          typeof p !== 'string' ||
          p.length > 12000 ||
          /<\/?[a-z]|```/i.test(p)
        )
      ) {
        throw new Error(
          'A redação recebida deve conter somente texto.'
        );
      }

      return {
        ...raw,
        campos: dados,

        perguntas: (raw.perguntas || [])
          .filter(q =>
            q &&
            formulario.includes(q.campo) &&
            typeof q.pergunta === 'string'
          )
          .slice(0, 12),

        avisos: (raw.avisos || [])
          .filter(x => typeof x === 'string')
          .slice(0, 12)
      };
    }

    function restaurar(s) {
      mudarTipo(s.tipo);

      for (const [id, v] of Object.entries(s.campos)) {
        if ($(id)) $(id).value = v;
      }

      escrever(s.campos['doc-texto'] || '');
    }

    function aplicar(plano, preservar) {
      const antes = capturar();

      try {
        mudarTipo(plano.tipo);

        if (!preservar) {
          for (const id of [
            ...campos,
            'doc-principal',
            'doc-secundario'
          ]) {
            if ($(id) && !fixos.has(id)) {
              $(id).value = '';
            }
          }
        }

        for (const [id, v] of Object.entries(plano.campos)) {
          if ($(id)) $(id).value = v;
        }

        for (const [chave, id] of [
          ['principal_id', 'doc-principal'],
          ['secundario_id', 'doc-secundario']
        ]) {
          const f = funcionarios.find(x =>
            x.id === String(plano[chave] || '')
          );

          if (f && $(id)) {
            $(id).value = rotulo(f);
          }
        }

        if (
          !valor('doc-cargo') &&
          pessoa('doc-principal')
        ) {
          $('doc-cargo').value =
            pessoa('doc-principal').cargo;
        }

        if (
          ['prorrogacao', 'substituicao']
            .includes(plano.tipo)
        ) {
          const inicio = valor('doc-inicio');
          const fim = valor('doc-fim');
          const dias = Number(valor('doc-prazo'));

          if (
            dataValida(inicio) &&
            !fim &&
            Number.isInteger(dias) &&
            dias >= 1 &&
            dias <= 3650
          ) {
            $('doc-fim').value = new Date(
              Date.parse(inicio + 'T12:00:00Z') +
              (dias - 1) * 86400000
            ).toISOString().slice(0, 10);
          } else if (
            dataValida(inicio) &&
            dataValida(fim) &&
            fim >= inicio
          ) {
            $('doc-prazo').value = String(
              Math.round(
                (
                  Date.parse(fim + 'T12:00:00Z') -
                  Date.parse(inicio + 'T12:00:00Z')
                ) / 86400000
              ) + 1
            );
          }
        }

        if (plano.paragrafos.length) {
          escrever(plano.paragrafos.join('\n\n'));
        } else {
          $('doc-atualizar').click();
        }
      } catch (e) {
        restaurar(antes);
        throw e;
      }

      historico.push(antes);

      if (historico.length > 6) {
        historico.shift();
      }

      $('ia-extra-desfazer').disabled = false;
      pendente = null;
      $('ia-extra-aplicar').hidden = true;

      perguntas(plano.perguntas);

      const avisos = [
        ...plano.avisos,
        ...pendencias()
      ];

      mensagem([
        'IA conectada: ' +
          (plano.resumo || 'documento preparado.'),
        ...avisos,
        'Confira a prévia antes de imprimir ou assinar.'
      ].join('\n'));
    }

    async function consultar(
      pedido,
      acao,
      preservar,
      signal
    ) {
      if (typeof App.carregarPerfilAtual === 'function') {
        await App.carregarPerfilAtual();
      }

      let token = typeof App.getAccessToken === 'function'
        ? await App.getAccessToken()
        : '';

      if (
        !token &&
        typeof authGetSession === 'function'
      ) {
        const sessao = await authGetSession();

        token =
          sessao?.access_token ||
          sessao?.data?.session?.access_token ||
          '';
      }

      if (!token) {
        throw new Error(
          'Entre novamente no site para usar a IA.'
        );
      }

      const base = typeof SUPABASE_URL !== 'undefined'
        ? SUPABASE_URL
        : 'https://cujlebxqqposqomtfvdk.supabase.co';

      const chave = typeof SUPABASE_KEY !== 'undefined'
        ? SUPABASE_KEY
        : '';

      const contexto = capturar();

      if (!preservar) {
        contexto.campos = Object.fromEntries(
          Object.entries(contexto.campos)
            .filter(([id]) => fixos.has(id))
        );
      }

      const ids = new Set(candidatos(pedido));

      if (preservar) {
        for (const id of [
          'doc-principal',
          'doc-secundario'
        ]) {
          const f = pessoa(id);
          if (f) ids.add(f.id);
        }
      }

      const resposta = await fetch(
        base.replace(/\/$/, '') +
          '/functions/v1/documentos-ia',
        {
          method: 'POST',
          signal,

          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
            ...(chave ? { apikey: chave } : {})
          },

          body: JSON.stringify({
            pedido,
            acao,
            referencia: valor('ia-extra-referencia'),
            contexto,
            funcionarios_ids: [...ids],

            principal_id: preservar
              ? pessoa('doc-principal')?.id || ''
              : '',

            secundario_id: preservar
              ? pessoa('doc-secundario')?.id || ''
              : '',

            modelo_base: preservar
              ? valor('doc-texto')
              : ''
          })
        }
      );

      let dados;

      try {
        dados = await resposta.json();
      } catch {
        throw new Error(
          'O serviço de IA não retornou uma resposta válida.'
        );
      }

      if (!resposta.ok) {
        throw new Error(
          dados.error ||
          'Não foi possível consultar a IA. Código ' +
            resposta.status + '.'
        );
      }

      return validar(dados);
    }

    async function executar(acao) {
      if (controller) return;

      const ajustar = [
        'melhorar',
        'resumir',
        'formalizar'
      ].includes(acao);

      const atual = valor('ia-extra-pedido');

      if (!atual && !ajustar) {
        mensagem('Escreva seu pedido ou complemento.');
        $('ia-extra-pedido').focus();
        return;
      }

      if (ajustar && !valor('doc-texto')) {
        mensagem(
          'Prepare ou escreva o texto antes de ajustar a redação.'
        );
        return;
      }

      const preservar = acao !== 'gerar';

      const pedido = preservar
        ? [pedidoAnterior, atual]
          .filter(Boolean)
          .join('\nComplemento: ')
        : atual;

      if (pedido.length > 12000) {
        mensagem(
          'O pedido acumulado ficou muito longo. ' +
          'Use Novo pedido e descreva as informações necessárias.'
        );
        return;
      }

      const antes = JSON.stringify(capturar());

      controller = new AbortController();
      const controle = controller;

      const timeout = setTimeout(
        () => controle.abort(),
        45000
      );

      const botoes = painel.querySelectorAll(
        '[data-acao],#ia-extra-novo,' +
        '#ia-extra-desfazer,#ia-extra-aplicar'
      );

      botoes.forEach(b => b.disabled = true);
      $('ia-extra-cancelar').hidden = false;

      mensagem('A IA está preparando o documento…');

      try {
        const plano = await consultar(
          pedido || 'Ajuste a redação atual.',
          acao,
          preservar,
          controle.signal
        );

        if (
          controle.signal.aborted ||
          !painel.isConnected ||
          $('doc-texto') !== textoOriginal
        ) return;

        pedidoAnterior = pedido;

        if (JSON.stringify(capturar()) !== antes) {
          pendente = { plano, preservar };
          $('ia-extra-aplicar').hidden = false;

          mensagem(
            'A sugestão está pronta. Você alterou o documento ' +
            'durante a consulta. Clique em Aplicar sugestão ' +
            'recebida para usá-la.'
          );
        } else {
          aplicar(plano, preservar);
        }
      } catch (e) {
        mensagem(
          controle.signal.aborted
            ? 'Consulta interrompida. Seu rascunho foi mantido.'
            : 'Não foi possível preparar o documento: ' +
              e.message
        );
      } finally {
        clearTimeout(timeout);
        controller = null;

        if (painel.isConnected) {
          botoes.forEach(b => b.disabled = false);

          $('ia-extra-desfazer').disabled =
            !historico.length;

          $('ia-extra-cancelar').hidden = true;
        }
      }
    }

    painel.querySelectorAll('[data-acao]')
      .forEach(b => {
        b.onclick = () => executar(b.dataset.acao);
      });

    $('ia-extra-cancelar').onclick = () => {
      controller?.abort();
    };

    $('ia-extra-aplicar').onclick = () => {
      if (pendente) {
        aplicar(pendente.plano, pendente.preservar);
      }
    };

    $('ia-extra-verificar').onclick = () => {
      mensagem(
        pendencias().join('\n') ||
        'Não encontrei pendências básicas. ' +
        'Confira os fatos e a prévia antes de emitir.'
      );
    };

    $('ia-extra-desfazer').onclick = () => {
      const anterior = historico.pop();
      if (!anterior) return;

      restaurar(anterior);
      pendente = null;
      $('ia-extra-aplicar').hidden = true;

      $('ia-extra-desfazer').disabled =
        !historico.length;

      perguntas();
      mensagem('Rascunho anterior restaurado.');
    };

    $('ia-extra-novo').onclick = () => {
      pedidoAnterior = '';
      pendente = null;

      $('ia-extra-pedido').value = '';
      $('ia-extra-referencia').value = '';
      $('ia-extra-aplicar').hidden = true;

      perguntas();

      mensagem(
        'Descreva o novo documento. O rascunho atual será ' +
        'mantido até você preparar o próximo.'
      );

      $('ia-extra-pedido').focus();
    };

    $('ia-extra-pedido').addEventListener('keydown', e => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === 'Enter'
      ) {
        e.preventDefault();
        executar('gerar');
      }
    });

    mensagem(
      funcionarios.length
        ? 'Pronta para ajudar. O formato oficial do documento será mantido.'
        : 'Pronta. O cadastro não pôde ser consultado; recarregue a página para preencher servidores.'
    );
  }

  const iniciarAnterior = DocumentosServidoresPage.init;

  DocumentosServidoresPage.init = async function (...args) {
    await iniciarAnterior.apply(this, args);
    await montar();
  };

  if ($('doc-texto')) {
    montar().catch(console.error);
  }
})();