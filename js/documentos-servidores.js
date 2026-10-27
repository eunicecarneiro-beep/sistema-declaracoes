/* Página de documentos da escola. Carregue js/assistente-documental.js antes deste arquivo. */
/* ====================================================================
  DOCUMENTOS DE SERVIDORES \u2014 E.M. PROF\u00aa EUNICE CARNEIRO
  Declara\u00e7\u00f5es, requerimentos e memorandos com dados do cadastro existente.
  N\u00e3o grava novos dados nem requer altera\u00e7\u00f5es no SQL do Supabase.
  Revise antes de imprimir, assinar ou protocolar.
==================================================================== */
const DocumentosServidoresPage = (() => {
  const S = { funcionarios: [], textoEditado: false, paginaPronta: false };
  const $ = id => document.getElementById(id);

  const BRASAO = "data:image/jpeg;base64,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";
  const MEMO_CSS = '\n/* P\u00e1gina em A4 com o mesmo arranjo da refer\u00eancia da Secretaria. */\n.memo-sheet{box-sizing:border-box;width:210mm;min-height:297mm;padding:38mm 13mm 17mm;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.22;position:relative}\n.memo-header{width:100%;border-collapse:collapse;table-layout:fixed;font-size:10pt;line-height:1.15;margin:0}\n.memo-header td{border:1px solid #222;padding:1.5mm 1mm;vertical-align:middle}\n.memo-header .memo-top td{height:19mm}\n.memo-header .memo-title td{height:4.2mm;text-align:center;font-weight:700;padding:.8mm}\n.memo-header .memo-address td{height:15.4mm}\n.memo-logo{text-align:center}\n.memo-logo img{display:block;width:16mm;height:15.5mm;object-fit:contain;margin:0 auto}\n.memo-school{text-align:center;line-height:1.18}\n.memo-school div{margin:0}\n.memo-school strong{font-size:14pt;font-weight:700;line-height:1.25;display:block}\n.memo-control{text-align:center;vertical-align:top!important;line-height:1.3}\n.memo-control .memo-num{margin-top:5mm}\n.memo-from{vertical-align:middle!important}\n.memo-to{vertical-align:top!important}\n.memo-to .memo-sector{margin-top:5mm}\n.memo-subject{margin:5.2mm 2.5mm 0;font-size:11pt;font-weight:700;line-height:1.3}\n.memo-content{margin:14mm 2.5mm 0;min-height:108.6mm;line-height:1.2;font-size:11pt}\n.memo-content .memo-greeting{margin:0 0 5.2mm}\n.memo-content .memo-paragraph{margin:0 0 5.2mm;text-align:left;white-space:pre-line}\n.memo-content .memo-farewell{margin:5.5mm 0 0}\n.memo-signature{width:112mm;max-width:100%;margin:0 auto;text-align:center;font-size:11pt;line-height:1.6;break-inside:avoid;page-break-inside:avoid}\n.memo-signature .memo-signature-line{border-top:1px solid #111;padding-top:1.8mm}\n.memo-viewport{position:relative;overflow:hidden;width:100%;background:#fff}\n.memo-viewport .memo-sheet{transform-origin:left top;box-shadow:none}\n@media print{\n  @page{size:A4;margin:0}\n  html,body{margin:0!important;padding:0!important;background:#fff!important}\n  .memo-viewport{overflow:visible!important;width:auto!important;height:auto!important}\n  .memo-viewport .memo-sheet{transform:none!important}\n  .memo-sheet{break-after:auto;page-break-after:auto;box-shadow:none!important}\n}\n';
  function ehMemo() {
    if (modeloAmplo()) return valor('doc-genero-amplo') === 'memorando';
    return !['declaracao', 'declaracao-livre', 'requerimento'].includes(valor('doc-tipo'));
  }
  function modeloAmplo() {
    return globalThis.AssistenteDocumentalAmplo?.porId(valor('doc-modelo-amplo'));
  }
  function camposAmplo() {
    return Object.fromEntries((globalThis.AssistenteDocumentalAmplo?.campos || []).map(id => [id, valor(id)]));
  }
  function numeracaoAtual() {
    return globalThis.AssistenteDocumentalAmplo?.numeracao(valor('doc-numero'),valor('doc-data')) || {numero:valor('doc-numero'),ano:valor('doc-data').slice(0,4)||String(new Date().getFullYear())};
  }
  function ensureMemoStyle() {
    if (document.getElementById('estilo-memorando-oficial')) return;
    const s = document.createElement('style');
    s.id = 'estilo-memorando-oficial';
    s.textContent = MEMO_CSS;
    document.head.appendChild(s);
  }
  function realcarNomes(texto) {
    let s = esc(texto);
    const pessoas = [servidor('doc-principal'),servidor('doc-secundario')].filter(Boolean);
    const nomes = pessoas.flatMap(p=>[p.nome,p.matricula]).filter(Boolean).sort((a,b)=>b.length-a.length);
    for (const val of nomes) {
      const e = esc(val);
      const rx = new RegExp(e.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g');
      s = s.replace(rx,(m)=>'<strong>'+m+'</strong>');
    }
    return s;
  }
  function corpoMemorando() {
    const sig = assinatura();
    const numeracao = pad(numeracaoAtual().numero,'N\u00ba DO MEMORANDO');
    const anoMemo = numeracaoAtual().ano;
    const parags = limpa(valor('doc-texto')).split(/\n\s*\n/).filter(Boolean);
    return `<article class="memo-sheet">
      <table class="memo-header"><colgroup><col style="width:20%"><col style="width:30%"><col style="width:29%"><col style="width:21%"></colgroup>
        <tbody>
          <tr class="memo-top">
            <td class="memo-logo"><img src="${BRASAO}" alt="Bras\u00e3o da Prefeitura de Montes Claros"></td>
            <td colspan="2" class="memo-school">
              <div>PREFEITURA MUNICIPAL DE MONTES CLAROS</div>
              <div>SECRETARIA MUNICIPAL DE EDUCA\u00c7\u00c3O</div>
              <strong>E. M. PROF\u00aa EUNICE CARNEIRO</strong>
              <div>Rua D, 300 \u2013 Jos\u00e9 Correia Machado</div>
              <div>Montes Claros \u2013 MG \u2013 (38) 2211-8332</div>
            </td>
            <td class="memo-control"><div>Data: ${esc(dt(valor('doc-data'))||'[DATA]')}</div><div class="memo-num">N\u00ba ${esc(numeracao)}/${esc(anoMemo)}</div></td>
          </tr>
          <tr class="memo-title"><td colspan="4">MEMORANDO</td></tr>
          <tr class="memo-address">
            <td colspan="2" class="memo-from">De: ${esc(pad(sig.nome,'REMETENTE'))}<div>${esc(pad(sig.cargo,'CARGO DO REMETENTE'))}</div></td>
            <td colspan="2" class="memo-to">Para: ${esc(pad(valor('doc-para'),'DESTINAT\u00c1RIO'))}<div>A/C: ${esc(pad(valor('doc-ac'),'RESPONS\u00c1VEL'))}</div><div class="memo-sector">${esc(pad(valor('doc-setor'),'SETOR'))}</div></td>
          </tr>
        </tbody>
      </table>
      <div class="memo-subject">ASSUNTO: ${esc(pad(valor('doc-assunto'),'ASSUNTO'))}</div>
      <section class="memo-content">
        <p class="memo-greeting">${esc(pad(valor('doc-saudacao'),'SAUDA\u00c7\u00c3O'))}</p>
        ${parags.map(p=>`<p class="memo-paragraph">${realcarNomes(p).replace(/\n/g,'<br>')}</p>`).join('')}
        <p class="memo-farewell">${esc(pad(valor('doc-despedida'),'DESPEDIDA'))}</p>
      </section>
      <div class="memo-signature"><div class="memo-signature-line">${esc(pad(sig.nome,'ASSINANTE'))}</div><div>${esc(pad(sig.cargo,'CARGO DO ASSINANTE'))}</div></div>
    </article>`;
  }
  function ajustarVisualMemorando(){
    const preview=$('doc-preview');
    if(!preview || !ehMemo())return;
    const cont=preview.querySelector('.memo-viewport');
    const folha=cont?.querySelector('.memo-sheet');
    if(!cont||!folha)return;
    const largura=folha.offsetWidth;
    const e=Math.min(1, preview.clientWidth/largura);
    folha.style.transform=`scale(${e})`;
    cont.style.height=`${folha.offsetHeight*e}px`;
  }

  const esc = value => App.escapeHTML(String(value ?? ''));
  const limpa = value => String(value ?? '').trim();
  const normaliza = value => limpa(value).normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ');
  const rotulo = f => `${f.nome}${f.matricula ? ` \u2014 Matr\u00edcula ${f.matricula}` : ''}`;
  const pad = (valor, rot) => limpa(valor) || `[INFORMAR ${rot}]`;
  const dataLocal = () => {
    const x = new Date();
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  };
  const tipos = [
    ['declaracao-livre', 'Declaração institucional, escolar ou personalizada'],
    ['declaracao', 'Declara\u00e7\u00e3o funcional do servidor'],
    ['requerimento', 'Requerimento do servidor'],
    ['prorrogacao', 'Memorando \u2014 prorroga\u00e7\u00e3o de contrato'],
    ['substituicao', 'Memorando \u2014 substitui\u00e7\u00e3o por afastamento'],
    ['contratacao', 'Memorando \u2014 contrata\u00e7\u00e3o / reposi\u00e7\u00e3o de vaga'],
    ['calendario', 'Memorando \u2014 altera\u00e7\u00e3o de calend\u00e1rio escolar'],
    ['zeladoria', 'Memorando \u2014 solicita\u00e7\u00e3o de zeladoria'],
    ['transporte', 'Memorando \u2014 transporte para visita escolar'],
    ['estagio', 'Memorando \u2014 an\u00e1lise de est\u00e1gio de servidor(a)'],
    ['avanco', 'Memorando \u2014 parecer sobre avan\u00e7o de n\u00edvel'],
    ['memorando', 'Memorando personalizado (livre)']
  ];

  // Destinat\u00e1rios retirados de memorandos reais. Confirme os nomes atuais antes do envio.
  const ENDERECAMENTO = {
    prorrogacao: ['Polyana Ferreira Da Silva', 'Coordenadoria de Gest\u00e3o Pessoal'],
    substituicao: ['Polyana Ferreira Da Silva', 'Coordenadoria de Gest\u00e3o Pessoal'],
    contratacao: ['Polyana Ferreira Da Silva', 'Coordenadoria de Gest\u00e3o Pessoal'],
    calendario: ['Domingas Darc Mendes', 'Inspe\u00e7\u00e3o Escolar \u2013 Secretaria Municipal de Educa\u00e7\u00e3o'],
    zeladoria: ['Girlene Miranda de Melo', 'Coordenadoria de Ger\u00eancia Administrativa'],
    transporte: ['Soraya Figueiredo', 'Coordenadoria de Infraestrutura, Transporte e Log\u00edstica'],
    estagio: ['Nilza Pereira Dias', 'Coordenadoria de Avalia\u00e7\u00e3o e Capacita\u00e7\u00e3o de Servidores'],
    avanco: ['Ana Cristina Fonseca de Vasconcelos', 'Coordenadora de Educa\u00e7\u00e3o Inclusiva \u2013 Analistas / SME'],
    memorando: ['', '']
  };

  const EXTRA_CAMPOS = [
    ['doc-qtd', 'Quantidade de profissionais solicitados', 'zeladoria', 'number', 'Ex.: 2'],
    ['doc-alunos-num', 'Quantidade de estudantes', 'transporte', 'number', 'Ex.: 40'],
    ['doc-anos', 'Turmas ou anos escolares', 'transporte', 'text', 'Ex.: 1\u00ba e 2\u00ba anos'],
    ['doc-turno', 'Turno', 'transporte', 'text', 'Ex.: matutino'],
    ['doc-local', 'Local de destino', 'transporte', 'text', 'Ex.: Parque de Exposi\u00e7\u00f5es'],
    ['doc-hora-inicio', 'In\u00edcio da visita', 'transporte', 'time', ''],
    ['doc-hora-fim', 'Fim da visita', 'transporte', 'time', ''],
    ['doc-saida', 'Hor\u00e1rio de embarque', 'transporte', 'time', ''],
    ['doc-retorno', 'Hor\u00e1rio do retorno', 'transporte', 'time', ''],
    ['doc-instituicao', 'Institui\u00e7\u00e3o / local do est\u00e1gio (opcional)', 'estagio', 'text', ''],
    ['doc-horario', 'Compatibilidade de hor\u00e1rios (confirme)', 'estagio', 'text', 'Ex.: Fora da jornada de trabalho'],
    ['doc-estudante', 'Nome do(a) estudante', 'avanco', 'text', 'Digite apenas se necess\u00e1rio'],
    ['doc-turma-aluno', 'Turma / ano escolar', 'avanco', 'text', 'Ex.: 2\u00ba ano C'],
    ['doc-anexos', 'Documentos anexos', 'avanco', 'text', 'Ex.: relat\u00f3rio pedag\u00f3gico e requerimento']
  ];

  function definirDestinatario(tipo) {
    if (!ENDERECAMENTO[tipo]) return;
    $('doc-para').value = 'Charles Gutemberg Alencar Soares';
    $('doc-ac').value = ENDERECAMENTO[tipo][0];
    $('doc-setor').value = ENDERECAMENTO[tipo][1];
  }

  function periodoVisita() {
    const ini = valor('doc-hora-inicio'), fim = valor('doc-hora-fim');
    return ini && fim ? `das ${ini} \u00e0s ${fim}` : (ini ? `a partir de ${ini}` : 'em hor\u00e1rio a informar');
  }

  function valor(id) { return limpa($(id)?.value); }
  function dt(valorData) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valorData || '')) return '';
    const [a, m, d] = valorData.split('-');
    return `${d}/${m}/${a}`;
  }
  function dataExtenso(valorData) {
    const s = dt(valorData);
    if (!s) return '[INFORMAR DATA]';
    const [a, m, d] = valorData.split('-').map(Number);
    const mes = ['janeiro','fevereiro','mar\u00e7o','abril','maio','junho',
      'julho','agosto','setembro','outubro','novembro','dezembro'][m - 1];
    return `${d} de ${mes} de ${a}`;
  }
  function servidor(campo) {
    const digitado = valor(campo);
    if (!digitado) return null;
    const matches = S.funcionarios.filter(f => rotulo(f) === digitado);
    return matches.length === 1 ? matches[0] : null;
  }
  function nome(f, rot = 'NOME DO SERVIDOR') { return pad(f?.nome, rot); }
  function matricula(f) { return pad(f?.matricula, 'MATR\u00cdCULA'); }
  function cargo(f) { return pad(f?.cargo || valor('doc-cargo'), 'CARGO/FUN\u00c7\u00c3O'); }
  function assinatura() {
    const amplo = modeloAmplo();
    if (amplo?.genero === 'requerimento') return {nome:valor('doc-pessoa'),cargo:valor('doc-qualificacao') || 'Pessoa requerente'};
    if (amplo?.genero === 'autorizacao') return {nome:valor('doc-responsavel-amplo'),cargo:'Responsável pela autorização'};
    if (valor('doc-tipo') === 'requerimento') {
      const f = servidor('doc-principal');
      return { nome: f?.nome || 'NOME DO(A) REQUERENTE', cargo: 'Servidor(a) requerente' };
    }
    return { nome: valor('doc-assinante'), cargo: valor('doc-cargo-assinante') };
  }
  function cabecalho() {
    const amplo = modeloAmplo();
    if (amplo) {
      const titulo = amplo.genero === 'termo' ? amplo.nome.toLocaleUpperCase('pt-BR') : AssistenteDocumentalAmplo.generos[amplo.genero];
      const numero = ['memorando','oficio'].includes(amplo.genero) && valor('doc-numero') ? ` Nº ${numeracaoAtual().numero}/${numeracaoAtual().ano}` : '';
      return {titulo:titulo+numero,ehMemo:amplo.genero==='memorando'};
    }
    const tipo = valor('doc-tipo');
    const ehMemo = ['prorrogacao','substituicao','contratacao','memorando'].includes(tipo);
    const titulo = {
      declaracao:'DECLARA\u00c7\u00c3O', 'declaracao-livre':'DECLARAÇÃO', requerimento:'REQUERIMENTO',
      prorrogacao:'MEMORANDO', substituicao:'MEMORANDO',
      contratacao:'MEMORANDO', memorando:'MEMORANDO'
    }[tipo] || 'DOCUMENTO';
    const numero = ehMemo ? ` N\u00ba ${numeracaoAtual().numero || '____'}/${numeracaoAtual().ano}` : '';
    return { titulo: titulo + numero, ehMemo };
  }

  function modeloTexto() {
    if (modeloAmplo()) {
      try {
        const plano = AssistenteDocumentalLocal.preparar({acao:'gerar',pedido:'',somente_campos:true,contexto:{tipo:valor('doc-tipo'),campos:camposAmplo()}});
        $('doc-texto-gerado').value = plano.paragrafos.join('\n\n');
        for(const id of ['doc-fatos','doc-dados-reconhecidos']) if($(id)&&plano.campos[id]) $(id).value=plano.campos[id];
        return plano.paragrafos.join('\n\n');
      } catch(e) { situacao(e.message,'error'); return valor('doc-texto'); }
    }
    const tipo = valor('doc-tipo');
    const f = servidor('doc-principal');
    const outro = servidor('doc-secundario');
    const n = nome(f);
    const mat = matricula(f);
    const cg = cargo(f);
    const inicio = pad(dt(valor('doc-inicio')), 'DATA INICIAL');
    const fim = pad(dt(valor('doc-fim')), 'DATA FINAL');
    const obs = valor('doc-motivo');
    const just = pad(obs, 'JUSTIFICATIVA / MOTIVO');
    const cargoVaga = pad(valor('doc-cargo'), 'CARGO/FUN\u00c7\u00c3O');
    const afastamento = pad(valor('doc-afastamento'), 'MOTIVO DO AFASTAMENTO');
    switch (tipo) {
      case 'declaracao-livre':
        return RedacaoLivre.preparar({ pedido: valor('doc-pedido'), hoje: dataLocal(), campos: {
          'doc-inicio': valor('doc-inicio'), 'doc-instituicao': valor('doc-instituicao'),
          'doc-assunto': valor('doc-assunto'), 'doc-motivo': valor('doc-motivo')
        } }).paragrafos.join('\n\n');
      case 'declaracao':
        return `Declaramos, para os devidos fins, que ${n}, matr\u00edcula n\u00ba ${mat}, ${pad(cg, 'CARGO/FUN\u00c7\u00c3O')}, possui registro funcional nesta unidade escolar, E.M. Prof.\u00aa Eunice Carneiro, conforme os dados constantes do cadastro da escola.${f?.vinculo ? ` O v\u00ednculo informado no cadastro \u00e9: ${f.vinculo}.` : ''}${f?.dataAdmissao ? ` A data de admiss\u00e3o registrada \u00e9 ${dt(f.dataAdmissao) || f.dataAdmissao}.` : ''}\n\n${obs || 'A presente declara\u00e7\u00e3o \u00e9 expedida a pedido do(a) interessado(a), para os fins que se fizerem necess\u00e1rios.'}\n\nPor ser express\u00e3o das informa\u00e7\u00f5es registradas, firmamos a presente declara\u00e7\u00e3o, sujeita \u00e0 confer\u00eancia dos documentos funcionais.`;
      case 'requerimento':
        return `Eu, ${n}, matr\u00edcula n\u00ba ${mat}, ocupante do cargo/fun\u00e7\u00e3o de ${cg}, venho, respeitosamente, requerer o seguinte: ${pad(valor('doc-pedido'), 'OBJETO DO REQUERIMENTO')}.\n\n${just}\n\nDiante do exposto, solicito a an\u00e1lise do pedido e as provid\u00eancias administrativas cab\u00edveis.\n\nNestes termos, pe\u00e7o deferimento.`;
      case 'prorrogacao':
        if (outro) return `Vimos, por meio deste, solicitar a prorroga\u00e7\u00e3o do contrato do(a) servidor(a) ${n}, matr\u00edcula n\u00ba ${mat}, ${cg}, que atua em substitui\u00e7\u00e3o ao(\u00e0) servidor(a) ${nome(outro)}, matr\u00edcula n\u00ba ${matricula(outro)}, com afastamento informado por ${afastamento}.\n\nConforme documenta\u00e7\u00e3o do afastamento a ser conferida, ${nome(outro)} tem afastamento informado por ${afastamento}${valor('doc-prazo') ? ` pelo per\u00edodo de ${valor('doc-prazo')} dias` : ''}${valor('doc-inicio') ? `, a partir de ${inicio}` : ''}.\n\nDiante da continuidade do afastamento, solicitamos a prorroga\u00e7\u00e3o do contrato de ${n}${valor('doc-fim') ? ` at\u00e9 ${fim}` : ' durante o per\u00edodo de substitui\u00e7\u00e3o'}, a fim de ${just}.`;
        return `Vimos, por meio deste, solicitar a prorroga\u00e7\u00e3o do contrato do(a) servidor(a) ${n}, matr\u00edcula n\u00ba ${mat}, ${cg}, que atua nesta unidade escolar.\n\nO t\u00e9rmino contratual informado est\u00e1 previsto para ${inicio}, e solicita-se a an\u00e1lise da prorroga\u00e7\u00e3o at\u00e9 ${fim}.\n\nA solicita\u00e7\u00e3o fundamenta-se na necessidade de ${just}, a fim de assegurar a continuidade das atividades da unidade escolar.`;
      case 'substituicao':
        return `Cumprimentando-os cordialmente, vimos solicitar a contrata\u00e7\u00e3o de um(a) profissional para exercer a fun\u00e7\u00e3o de ${cargoVaga}, em substitui\u00e7\u00e3o ao(\u00e0) servidor(a) ${n}, matr\u00edcula n\u00ba ${mat}, que se encontra com afastamento informado por ${afastamento}, conforme documenta\u00e7\u00e3o administrativa a ser conferida.\n\nO afastamento informado tem in\u00edcio em ${inicio}${valor('doc-fim') ? `, com t\u00e9rmino previsto para ${fim}` : ''}${valor('doc-prazo') ? `, pelo per\u00edodo de ${valor('doc-prazo')} dias` : ''}.\n\n${outro ? `Caso seja cab\u00edvel, indicamos para an\u00e1lise a continuidade ou contrata\u00e7\u00e3o do(a) servidor(a) ${nome(outro)}, matr\u00edcula n\u00ba ${matricula(outro)}, sem preju\u00edzo dos procedimentos legais de contrata\u00e7\u00e3o.\n\n` : ''}A substitui\u00e7\u00e3o se faz necess\u00e1ria para ${just}.\n\nSolicitamos as provid\u00eancias administrativas cab\u00edveis, a fim de assegurar a continuidade do atendimento aos estudantes e das atividades pedag\u00f3gicas.`;
      case 'contratacao':
        return `Cumprimentando-os cordialmente, vimos solicitar a contrata\u00e7\u00e3o de um(a) profissional para o cargo/fun\u00e7\u00e3o de ${cargoVaga}, tendo em vista a necessidade de reposi\u00e7\u00e3o de pessoal nesta unidade escolar.\n\n${f ? `A necessidade decorre da situa\u00e7\u00e3o funcional do(a) servidor(a) ${n}, matr\u00edcula n\u00ba ${mat}.` : 'A vaga e a situa\u00e7\u00e3o funcional que motivam o pedido dever\u00e3o ser confirmadas nos registros da unidade escolar.'} ${valor('doc-inicio') ? `A data informada para a ocorr\u00eancia \u00e9 ${inicio}.` : ''}\n\nJustificativa: ${just}.\n\nDiante da necessidade de manter a continuidade das atividades e o atendimento aos alunos, solicitamos a an\u00e1lise e autoriza\u00e7\u00e3o das provid\u00eancias de contrata\u00e7\u00e3o cab\u00edveis.`;
      case 'calendario': {
        const anterior = pad(dt(valor('doc-inicio')), 'DATA ORIGINAL');
        const proposta = pad(dt(valor('doc-fim')), 'DATA PROPOSTA');
        return `Solicitamos autoriza\u00e7\u00e3o para alterar a data do s\u00e1bado letivo originalmente previsto para ${anterior}, propondo sua realiza\u00e7\u00e3o em ${proposta}.\n\nA solicita\u00e7\u00e3o fundamenta-se em: ${just}. Ressaltamos que a altera\u00e7\u00e3o dever\u00e1 respeitar o calend\u00e1rio escolar aprovado, os dias letivos e a carga hor\u00e1ria anual obrigat\u00f3ria.\n\nCertos da aten\u00e7\u00e3o e da an\u00e1lise dessa Coordenadoria, aguardamos manifesta\u00e7\u00e3o quanto \u00e0 altera\u00e7\u00e3o solicitada.`;
      }
      case 'zeladoria': {
        const qtd = pad(valor('doc-qtd'), 'QUANTIDADE DE SERVIDORES');
        const adicional = valor('doc-pedido');
        return `Vimos, respeitosamente, solicitar a disponibiliza\u00e7\u00e3o de ${qtd} profissional(is) de servente de zeladoria para atender \u00e0s necessidades desta unidade escolar.${adicional ? ` Solicitamos tamb\u00e9m ${adicional}.` : ''}\n\nJustificamos o pedido em raz\u00e3o de ${just}. A medida se faz necess\u00e1ria para assegurar a higieniza\u00e7\u00e3o adequada dos ambientes e a continuidade dos servi\u00e7os de apoio escolar.\n\nSolicitamos a an\u00e1lise da demanda e a ado\u00e7\u00e3o das provid\u00eancias administrativas cab\u00edveis.`;
      }
      case 'transporte': {
        const q = pad(valor('doc-alunos-num'), 'N\u00daMERO DE ESTUDANTES');
        const turmas = pad(valor('doc-anos'), 'TURMAS / ANOS');
        const destino = pad(valor('doc-local'), 'DESTINO');
        const dia = pad(dt(valor('doc-inicio')), 'DATA DA VISITA');
        const turno = pad(valor('doc-turno'), 'TURNO');
        const embarque = pad(valor('doc-saida'), 'HOR\u00c1RIO DE EMBARQUE');
        const retorno = pad(valor('doc-retorno'), 'HOR\u00c1RIO DO RETORNO');
        return `Vimos, por meio deste, solicitar a disponibiliza\u00e7\u00e3o de transporte escolar para ${q} estudante(s) das turmas ${turmas}, no dia ${dia}, no turno ${turno}, com destino a ${destino}, para realiza\u00e7\u00e3o de atividade pedag\u00f3gica extraclasse.\n\nA visita est\u00e1 prevista para o per\u00edodo ${periodoVisita()}. Solicitamos embarque na escola a partir de ${embarque} e retorno previsto a partir de ${retorno}.\n\nA atividade tem por finalidade ${just}. Agradecemos a aten\u00e7\u00e3o e aguardamos a an\u00e1lise da solicita\u00e7\u00e3o.`;
      }
      case 'estagio': {
        const instituicao = valor('doc-instituicao');
        const horario = valor('doc-horario');
        return `Vimos, por meio deste, solicitar an\u00e1lise e parecer dessa Coordenadoria quanto \u00e0 possibilidade de o(a) servidor(a) ${n}, matr\u00edcula n\u00ba ${mat}, ocupante da fun\u00e7\u00e3o de ${cg}, realizar est\u00e1gio supervisionado${instituicao ? ` na institui\u00e7\u00e3o ${instituicao}` : ''}.\n\n${horario ? `Informa\u00e7\u00f5es apresentadas sobre a compatibilidade dos hor\u00e1rios: ${horario}. ` : ''}Justificativa e demais esclarecimentos: ${just}.\n\nSolicitamos orienta\u00e7\u00e3o sobre os requisitos e procedimentos aplic\u00e1veis, antes de qualquer autoriza\u00e7\u00e3o pela unidade escolar. Colocamo-nos \u00e0 disposi\u00e7\u00e3o para encaminhar os documentos complementares necess\u00e1rios.`;
      }
      case 'avanco': {
        const aluno = pad(valor('doc-estudante'), 'NOME DO(A) ESTUDANTE');
        const turma = pad(valor('doc-turma-aluno'), 'ANO / TURMA');
        const anexos = valor('doc-anexos');
        return `Vimos, por meio deste, solicitar an\u00e1lise e parecer da Coordenadoria de Educa\u00e7\u00e3o Inclusiva acerca do pedido de avalia\u00e7\u00e3o para poss\u00edvel avan\u00e7o de n\u00edvel do(a) estudante ${aluno}, matriculado(a) no(a) ${turma}.\n\nContextualiza\u00e7\u00e3o apresentada pela unidade escolar: ${just}. O encaminhamento n\u00e3o pressup\u00f5e o deferimento do avan\u00e7o, ficando sujeito \u00e0 avalia\u00e7\u00e3o t\u00e9cnica e aos procedimentos pertinentes.\n\n${anexos ? `Encaminhamos em anexo: ${anexos}. ` : ''}Solicitamos orienta\u00e7\u00e3o e parecer quanto \u00e0s provid\u00eancias educacionais cab\u00edveis.`;
      }
      case 'memorando':
        return `${pad(valor('doc-pedido'), 'DESCRI\u00c7\u00c3O DA SOLICITA\u00c7\u00c3O')}\n\n${just}\n\nDiante do exposto, solicitamos a an\u00e1lise e as provid\u00eancias administrativas cab\u00edveis.`;
      default:
        return '';
    }
  }

  function camposDinamicos() {
    const tipo = valor('doc-tipo');
    const dicas = {
      'declaracao-livre': 'Recebimentos, projetos, acontecimentos e declarações escolares. Descreva os fatos confirmados.',
      declaracao: 'Declara\u00e7\u00e3o funcional. Confirme os registros antes da assinatura.',
      requerimento: 'Requerimento em primeira pessoa, assinado pelo pr\u00f3prio servidor.',
      prorrogacao: 'Prorroga\u00e7\u00e3o de contrato: confirme o t\u00e9rmino, o per\u00edodo solicitado e eventual LTS.',
      substituicao: 'Substitui\u00e7\u00e3o por afastamento. Informe a situa\u00e7\u00e3o confirmada e a fun\u00e7\u00e3o.',
      contratacao: 'Solicita\u00e7\u00e3o de contrata\u00e7\u00e3o por vac\u00e2ncia ou necessidade de pessoal.',
      calendario: 'Modelo do Memorando 13: altera\u00e7\u00e3o de s\u00e1bado letivo, sujeita \u00e0 autoriza\u00e7\u00e3o.',
      zeladoria: 'Modelo do Memorando 12: solicita\u00e7\u00e3o de serventes de zeladoria.',
      transporte: 'Modelo do Memorando 16: transporte para visita pedag\u00f3gica.',
      estagio: 'Modelo do Memorando 7: pedido de parecer sobre est\u00e1gio supervisionado.',
      avanco: 'Modelo do Memorando 25: solicita\u00e7\u00e3o de an\u00e1lise e parecer sobre poss\u00edvel avan\u00e7o de n\u00edvel. Dados de estudantes n\u00e3o s\u00e3o salvos.',
      memorando: 'Modelo personalizado: escolha destinat\u00e1rio, assunto, pedido e justificativa; todo o texto pode ser editado.'
    };
    $('doc-dica').textContent = dicas[tipo] || '';
    const semServidor = ['declaracao-livre','calendario','zeladoria','transporte','avanco','memorando'].includes(tipo);
    $('doc-principal-bloco').hidden = semServidor;
    $('doc-principal-legenda').textContent = ({
      substituicao: 'Servidor afastado',
      requerimento: 'Servidor requerente',
      contratacao: 'Servidor desligado / vaga (opcional)',
      estagio: 'Servidor solicitante de est\u00e1gio'
    })[tipo] || 'Servidor interessado';
    $('doc-secundario-bloco').hidden = !['substituicao','prorrogacao'].includes(tipo);
    $('doc-secundario-legenda').textContent = tipo === 'prorrogacao'
      ? 'Servidor titular afastado (opcional)'
      : 'Profissional sugerido para substitui\u00e7\u00e3o (opcional)';
    $('doc-destino-simples').hidden = ehMemo();
    $('doc-memorando-cabecalho').hidden = !ehMemo();
    $('doc-inicio-bloco').hidden = !['declaracao-livre','prorrogacao','substituicao','contratacao','calendario','transporte'].includes(tipo);
    $('doc-fim-bloco').hidden = !['prorrogacao','substituicao','calendario'].includes(tipo);
    $('doc-prazo-bloco').hidden = !['substituicao','prorrogacao'].includes(tipo);
    $('doc-cargo-bloco').hidden = !['substituicao','contratacao'].includes(tipo);
    $('doc-pedido-bloco').hidden = !['declaracao-livre','memorando','requerimento','zeladoria'].includes(tipo);
    $('doc-numero-bloco').hidden = !ehMemo();
    $('doc-motivo-legenda').textContent = ({
      declaracao: 'Finalidade da declara\u00e7\u00e3o',
      requerimento: 'Fundamenta\u00e7\u00e3o do requerimento',
      calendario: 'Motivo da altera\u00e7\u00e3o do calend\u00e1rio',
      zeladoria: 'Necessidades de limpeza e manuten\u00e7\u00e3o',
      transporte: 'Objetivo pedag\u00f3gico da visita',
      estagio: 'Contexto e justificativa do pedido de est\u00e1gio',
      avanco: 'Contextualiza\u00e7\u00e3o pedag\u00f3gica (evite detalhes m\u00e9dicos sens\u00edveis)',
      memorando: 'Justificativa / fundamenta\u00e7\u00e3o'
    })[tipo] || 'Justificativa da solicita\u00e7\u00e3o';
    $('doc-inicio-legenda').textContent = ({
      prorrogacao: 'In\u00edcio do per\u00edodo informado',
      substituicao: 'In\u00edcio do afastamento',
      contratacao: 'Data da vac\u00e2ncia / rescis\u00e3o',
      calendario: 'Data original do s\u00e1bado letivo',
      transporte: 'Data da visita'
    })[tipo] || 'Data inicial';
    $('doc-fim-legenda').textContent = ({
      prorrogacao: 'Prorrogar at\u00e9 (se definido)',
      substituicao: 'Fim previsto do afastamento',
      calendario: 'Nova data proposta'
    })[tipo] || 'Data final';
    $('doc-pedido-legenda').textContent = tipo === 'zeladoria'
      ? 'Solicita\u00e7\u00e3o adicional (opcional; ex.: amplia\u00e7\u00e3o de carga hor\u00e1ria)'
      : 'Pedido / objeto do documento';
    for (const [id,,fieldTipo] of EXTRA_CAMPOS) {
      $(id + '-bloco').hidden = fieldTipo !== tipo;
    }
    const livre = tipo === 'declaracao-livre';
    $('doc-instituicao-bloco').hidden = !livre && tipo !== 'estagio';
    $('doc-instituicao-bloco').querySelector('label').textContent = livre ? 'Pessoa, projeto ou instituição responsável (se houver)' : 'Instituição / local do estágio (opcional)';
    if (livre) {
      $('doc-pedido-legenda').textContent = 'Fatos a declarar';
      $('doc-inicio-legenda').textContent = 'Data do acontecimento / recebimento (se houver)';
      $('doc-motivo-legenda').textContent = 'Finalidade ou observações (opcional)';
    }
    const amplo = modeloAmplo();
    if ($('doc-amplo-bloco')) $('doc-amplo-bloco').hidden = !amplo;
    if (amplo) {
      for (const id of ['doc-principal-bloco','doc-secundario-bloco','doc-cargo-bloco','doc-prazo-bloco','doc-inicio-bloco','doc-fim-bloco','doc-pedido-bloco']) $(id).hidden = true;
      $('doc-motivo').closest('.docs-field').hidden = true;
      const usados = new Set([...amplo.campos,'doc-fatos','doc-complementos','doc-finalidade-ampla','doc-documentos-amplos']);
      for (const id of Object.keys(AssistenteDocumentalAmplo.definicoes)) if ($(id+'-amplo-bloco')) $(id+'-amplo-bloco').hidden = !usados.has(id);
      $('doc-amplo-nome').textContent = amplo.nome;
      $('doc-dica').textContent = amplo.nome + '. Preencha os dados reconhecidos e confira o texto antes de emitir.';
      $('doc-numero-bloco').hidden = !['memorando','oficio'].includes(amplo.genero);
      $('doc-destino-simples').hidden = amplo.genero === 'memorando';
      $('doc-memorando-cabecalho').hidden = amplo.genero !== 'memorando';
      if ($('ds-modelo')) { const opt = [...$('ds-modelo').options].find(o=>o.value===tipo); if(opt)opt.textContent=amplo.nome; }
    } else {
      $('doc-motivo').closest('.docs-field').hidden = false;
    }
    if ($('doc-word')) $('doc-word').textContent = ehMemo() ? 'Baixar Word (.docx oficial)' : 'Baixar Word (.doc)';
  }

  function assuntoPadrao(tipo) {
    return {
      'declaracao-livre':'Declaração institucional',
      declaracao:'Declara\u00e7\u00e3o funcional',
      requerimento:'Requerimento administrativo',
      prorrogacao:'Solicita\u00e7\u00e3o de prorroga\u00e7\u00e3o de contrato',
      substituicao:'Solicita\u00e7\u00e3o de contrata\u00e7\u00e3o para substitui\u00e7\u00e3o',
      contratacao:'Solicita\u00e7\u00e3o de contrata\u00e7\u00e3o de servidor(a)',
      calendario:'Solicita\u00e7\u00e3o de altera\u00e7\u00e3o de data de s\u00e1bado letivo no calend\u00e1rio escolar',
      zeladoria:'Solicita\u00e7\u00e3o de serventes de zeladoria',
      transporte:'Solicita\u00e7\u00e3o de transporte para estudantes',
      estagio:'Solicita\u00e7\u00e3o de parecer sobre est\u00e1gio supervisionado',
      avanco:'Solicita\u00e7\u00e3o de an\u00e1lise e parecer sobre avan\u00e7o de n\u00edvel',
      memorando:''
    }[tipo] || '';
  }

  function atualizarModelo(force = false) {
    if (force || !S.textoEditado) {
      $('doc-texto').value = modeloTexto();
      S.textoEditado = false;
      $('doc-edicao').textContent = 'Texto gerado automaticamente; voc\u00ea pode editar antes de emitir.';
    } else {
      $('doc-edicao').textContent = 'Texto editado manualmente. Use \u201cAtualizar texto\u201d para recompor com os dados do formul\u00e1rio.';
    }
    visualizar();
  }

  function htmlBody(txt) {
    return limpa(txt).split(/\n\s*\n/).filter(Boolean).map(p =>
      `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
  }
  function corpoDocumento() {
    if (ehMemo()) return corpoMemorando();
    const cab = cabecalho();
    const sig = assinatura();
    const destino = valor('doc-destino');
    const assunto = valor('doc-assunto');
    const destinoHtml = cab.ehMemo || valor('doc-tipo') === 'requerimento' || modeloAmplo() && ['oficio','comunicado','convocacao'].includes(valor('doc-genero-amplo')) ? `
      <div class="docs-destination">
        ${destino ? `<div><strong>A/C:</strong> ${esc(destino)}</div>` : ''}
        ${assunto ? `<div><strong>Assunto:</strong> ${esc(assunto)}</div>` : ''}
      </div>` : '';
    return `
      <div class="docs-letterhead">
        <b>PREFEITURA MUNICIPAL DE MONTES CLAROS</b>
        <b>SECRETARIA MUNICIPAL DE EDUCA\u00c7\u00c3O</b>
        <b>ESCOLA MUNICIPAL PROFESSORA EUNICE CARNEIRO</b>
        <small>Montes Claros \u2013 Minas Gerais</small>
      </div>
      <div class="docs-doc-title">${esc(cab.titulo)}</div>
      <div class="docs-place-date">Montes Claros/MG, ${esc(dataExtenso(valor('doc-data')))}.</div>
      ${destinoHtml}
      <div class="docs-body">${htmlBody(valor('doc-texto'))}</div>
      <div class="docs-signature">
        <div class="docs-signature-line"><strong>${esc(pad(sig.nome, 'ASSINANTE'))}</strong></div>
        <div>${esc(pad(sig.cargo, 'CARGO DO ASSINANTE'))}</div>
      </div>`;
  }
  function visualizar() {
    const preview=$('doc-preview');
    if(ehMemo()) {
      preview.style.padding='0';
      preview.style.minHeight='0';
      preview.innerHTML=`<div class="memo-viewport">${corpoMemorando()}</div>`;
      ajustarVisualMemorando();
    } else {
      preview.style.padding='';
      preview.style.minHeight='';
      preview.innerHTML=corpoDocumento();
    }
  }
  function temPendencias() {
    if (modeloAmplo()) {
      const avisos = AssistenteDocumentalAmplo.pendencias(camposAmplo()).map(q=>q.pergunta);
      if (!valor('doc-data')) avisos.push('Informe a data do documento.');
      const sig=assinatura();if(!sig.nome||!sig.cargo)avisos.push('Confira o nome e a identificação do assinante.');
      if (ehMemo()) for(const [id,rot] of [['doc-numero','número do memorando'],['doc-para','destinatário'],['doc-setor','setor']]) if(!valor(id)) avisos.push('Informe: '+rot+'.');
      if (!valor('doc-texto')) avisos.push('O texto está vazio.');
      if (/\[[^\]]+\]/.test(valor('doc-texto'))) avisos.push('O texto contém dados a preencher.');
      return avisos;
    }
    const tipo = valor('doc-tipo');
    const requerServidor = ['declaracao','requerimento','prorrogacao','substituicao','estagio'].includes(tipo);
    const avisos = [];
    if (requerServidor && !servidor('doc-principal')) avisos.push('Selecione um servidor v\u00e1lido na lista.');
    if (!valor('doc-data')) avisos.push('Informe a data do documento.');
    if (tipo === 'prorrogacao' && (!valor('doc-inicio') || (!valor('doc-fim') && !servidor('doc-secundario')))) avisos.push('Informe data inicial e data final ou selecione a pessoa afastada para prorroga\u00e7\u00e3o por LTS.');
    if (tipo === 'substituicao' && !valor('doc-inicio')) avisos.push('Informe o in\u00edcio da licen\u00e7a.');
    if (['substituicao','contratacao'].includes(tipo) && !valor('doc-cargo')) avisos.push('Informe o cargo a contratar.');
    if (['memorando','requerimento'].includes(tipo) && !valor('doc-pedido')) avisos.push('Informe o pedido do documento.');
    if (['memorando','requerimento','prorrogacao','substituicao','contratacao','calendario','zeladoria','transporte','estagio','avanco'].includes(tipo) && !valor('doc-motivo')) avisos.push('Informe a justificativa.');
    if (tipo !== 'requerimento' && (!valor('doc-assinante') || !valor('doc-cargo-assinante'))) avisos.push('Confira os dados do assinante.');
    if (/\[INFORMAR [^\]]+\]/i.test(valor('doc-texto'))) avisos.push('O texto ainda cont\u00e9m campos [INFORMAR ...].');
    if (!valor('doc-texto')) avisos.push('O texto est\u00e1 vazio.');
    if (tipo === 'calendario' && (!valor('doc-inicio') || !valor('doc-fim'))) avisos.push('Informe data original e nova data proposta.');
    if (tipo === 'zeladoria' && (!valor('doc-qtd') || Number(valor('doc-qtd')) < 1)) avisos.push('Informe o n\u00famero de profissionais solicitados.');
    if (tipo === 'transporte') {
      for (const [id,rot] of [['doc-alunos-num','Quantidade de estudantes'],['doc-anos','Turmas'],['doc-inicio','Data da visita'],['doc-turno','Turno'],['doc-local','Destino'],['doc-saida','Embarque'],['doc-retorno','Retorno']]) {
        if (!valor(id)) avisos.push('Preencha: ' + rot + '.');
      }
    }
    if (tipo === 'avanco' && (!valor('doc-estudante') || !valor('doc-turma-aluno'))) avisos.push('Informe estudante e turma para solicitar o parecer.');
    if (ehMemo()) {
      for(const [id,rot] of [['doc-numero','N\u00famero do memorando'],['doc-para','Para'],['doc-ac','A/C'],['doc-setor','Coordenadoria/Setor'],['doc-assunto','Assunto'],['doc-saudacao','Sauda\u00e7\u00e3o'],['doc-despedida','Despedida']]) {
        if(!valor(id)) avisos.push('Preencha: '+rot+'.');
      }
    }
    return avisos;
  }
  function situacao(txt, classe = '') {
    $('doc-status').textContent = txt;
    $('doc-status').className = `docs-status ${classe}`;
  }
  function documentoHTML(imprimir = false) {
    const folha = corpoDocumento();
    if(ehMemo()) {
      return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Memorando ${esc(valor('doc-numero'))}</title><style>${MEMO_CSS}
      body{margin:0;padding:0;background:#fff}
      .actions{background:#eef2f7;padding:12px;display:flex;gap:10px;justify-content:center;font:14px Arial,sans-serif}
      .actions button{font:14px Arial,sans-serif;padding:9px 12px;cursor:pointer}
      @media print {.actions{display:none!important}}
      </style></head><body>
      ${imprimir?'<div class="actions"><button type="button" data-doc-print>Imprimir / Salvar PDF</button><button type="button" data-doc-close>Fechar</button></div>':''}
      ${folha}</body></html>`;
    }
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${esc(cabecalho().titulo)}</title>
      <style>
      @page {size:A4;margin:20mm 20mm 18mm 20mm}
      body{color:#111;font:12pt/1.55 'Times New Roman',serif;margin:0}
      .docs-letterhead{text-align:center;border-bottom:1px solid #222;padding-bottom:11px;margin-bottom:28px;line-height:1.35}
      .docs-letterhead b{display:block}.docs-letterhead small{font-size:9pt}
      .docs-doc-title{text-align:center;font-weight:bold;font-size:13pt;margin-bottom:24px}
      .docs-place-date{text-align:right;margin:0 0 20px}
      .docs-destination{margin-bottom:22px}.docs-destination div{margin-bottom:5px}
      .docs-body{text-align:justify}.docs-body p{margin:0 0 16px;text-indent:1.2cm;white-space:pre-wrap}
      .docs-signature{text-align:center;max-width:100mm;margin:30mm auto 0;page-break-inside:avoid}
      .docs-signature-line{border-top:1px solid #111;padding-top:6px}
      .actions{display:flex;gap:12px;padding:16px;justify-content:center;background:#edf2f7}
      .actions button{cursor:pointer;padding:10px 15px}
      @media print {.actions{display:none!important}}
      </style></head><body>
      ${imprimir ? '<div class="actions"><button type="button" data-doc-print>Imprimir / salvar PDF</button><button type="button" data-doc-close>Fechar</button></div>' : ''}
      ${folha}</body></html>`;
  }

  function emitir() {
    const pend = temPendencias();
    if (pend.length) {
      situacao('Revise antes de imprimir: ' + pend.join(' '), 'error');
      return;
    }
    const win = window.open('', '_blank');
    if (!win) { situacao('O navegador bloqueou a nova aba. Permita pop-ups para este site.', 'error'); return; }
    win.opener = null;
    win.document.open();
    win.document.write(documentoHTML(true));
    win.document.close();
    win.document.querySelectorAll('[data-doc-print]').forEach(button => {
      button.addEventListener('click', () => win.print());
    });
    win.document.querySelectorAll('[data-doc-close]').forEach(button => {
      button.addEventListener('click', () => win.close());
    });
    situacao('Documento aberto para revis\u00e3o final e impress\u00e3o. Use \u201cSalvar como PDF\u201d no navegador.', 'ok');
  }
  async function copiar() {
    const text = ehMemo() ? `MEMORANDO N\u00ba ${numeracaoAtual().numero}/${numeracaoAtual().ano}\nData: ${dt(valor('doc-data'))}\nDe: ${assinatura().nome} \u2014 ${assinatura().cargo}\nPara: ${valor('doc-para')}\nA/C: ${valor('doc-ac')}\n${valor('doc-setor')}\nASSUNTO: ${valor('doc-assunto')}\n\n${valor('doc-saudacao')}\n\n${valor('doc-texto')}\n\n${valor('doc-despedida')}\n\n${assinatura().nome}\n${assinatura().cargo}` : `${cabecalho().titulo}\nMontes Claros/MG, ${dataExtenso(valor('doc-data'))}\n${valor('doc-destino')}\nAssunto: ${valor('doc-assunto')}\n\n${valor('doc-texto')}\n\n${assinatura().nome}\n${assinatura().cargo}`;
    try {
      await navigator.clipboard.writeText(text);
      situacao('Texto copiado. Voc\u00ea pode col\u00e1-lo no 1Doc, Word ou e-mail.', 'ok');
    } catch {
      const t = $('doc-texto'); t.focus(); t.select();
      situacao('Selecionei o texto; pressione Ctrl+C para copiar.', 'warn');
    }
  }

  // Exportador DOCX nativo. Reaproveita o arquivo Word fornecido pela escola:
  // preserva sua tabela, bras\u00e3o, estilos, margens e estrutura do documento.
  const MODELO_WORD = "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";
  const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const textCodec = new TextEncoder();
  const readText = new TextDecoder();

  function base64Bytes(b64) {
    const binary = atob(b64);
    const out = new Uint8Array(binary.length);
    for (let i=0;i<binary.length;i++) out[i] = binary.charCodeAt(i);
    return out;
  }
  function read16(v, pos) {return v.getUint16(pos,true);}
  function read32(v, pos) {return v.getUint32(pos,true);}

  async function unzipOriginal(bytes) {
    const dv = new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
    let end = bytes.length-22;
    while(end>=0 && read32(dv,end)!==0x06054b50) end--;
    if(end<0)throw new Error('Modelo Word n\u00e3o \u00e9 um ZIP v\u00e1lido.');
    const total=read16(dv,end+10), start=read32(dv,end+16);
    let at=start;
    const files=new Map();
    for(let i=0;i<total;i++) {
      if(read32(dv,at)!==0x02014b50)throw new Error('ZIP do modelo est\u00e1 corrompido.');
      const method=read16(dv,at+10);
      const size=read32(dv,at+20);
      const nameLen=read16(dv,at+28);
      const extraLen=read16(dv,at+30);
      const commentLen=read16(dv,at+32);
      const local=read32(dv,at+42);
      const name=readText.decode(bytes.subarray(at+46,at+46+nameLen));
      if(read32(dv,local)!==0x04034b50)throw new Error('Cabe\u00e7alho do arquivo inv\u00e1lido.');
      const pos=local+30+read16(dv,local+26)+read16(dv,local+28);
      const comp=bytes.slice(pos,pos+size);
      let data;
      if(method===0){data=comp;}
      else if(method===8){
        if(typeof DecompressionStream==='undefined')throw new Error('Navegador sem suporte \u00e0 descompacta\u00e7\u00e3o Word. Use Chrome atualizado.');
        const stream=new Blob([comp]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
        data=new Uint8Array(await new Response(stream).arrayBuffer());
      } else throw new Error('M\u00e9todo ZIP n\u00e3o suportado: '+method);
      files.set(name,data);
      at+=46+nameLen+extraLen+commentLen;
    }
    return files;
  }
  const crcTable=(()=>{
    const t=new Uint32Array(256);
    for(let i=0;i<256;i++){
      let c=i;
      for(let j=0;j<8;j++) c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);
      t[i]=c>>>0;
    }
    return t;
  })();
  function crc32(bytes) {
    let crc=0xffffffff;
    for(const b of bytes)crc=crcTable[(crc^b)&255]^(crc>>>8);
    return (crc^0xffffffff)>>>0;
  }
  function zipStored(files) {
    const local=[], central=[];
    let off=0, dirSize=0;
    for(const [name,data] of files) {
      const n=textCodec.encode(name), crc=crc32(data);
      const lh=new Uint8Array(30+n.length);
      const l=new DataView(lh.buffer);
      l.setUint32(0,0x04034b50,true);l.setUint16(4,20,true);
      l.setUint16(6,0x0800,true);l.setUint32(14,crc,true);
      l.setUint32(18,data.length,true);l.setUint32(22,data.length,true);
      l.setUint16(26,n.length,true);lh.set(n,30);
      local.push(lh,data);
      const ch=new Uint8Array(46+n.length);
      const c=new DataView(ch.buffer);
      c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);
      c.setUint16(6,20,true);c.setUint16(8,0x0800,true);
      c.setUint32(16,crc,true);c.setUint32(20,data.length,true);
      c.setUint32(24,data.length,true);c.setUint16(28,n.length,true);
      c.setUint32(42,off,true);ch.set(n,46);
      central.push(ch);dirSize+=ch.length;
      off+=lh.length+data.length;
    }
    const end=new Uint8Array(22);
    const e=new DataView(end.buffer);
    e.setUint32(0,0x06054b50,true);
    e.setUint16(8,files.size,true);e.setUint16(10,files.size,true);
    e.setUint32(12,dirSize,true);e.setUint32(16,off,true);
    return new Blob([...local,...central,end],{
      type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
  }
  function allEls(node,local){return Array.from(node.getElementsByTagNameNS(W_NS,local));}
  function markParagraph(root,marker){
    return allEls(root,'p').find(p=>allEls(p,'t').some(t=>t.textContent===marker));
  }
  function resetParagraph(p,str,boldValues=[]) {
    const oldRun=Array.from(p.childNodes).find(c=>c.nodeType===1&&c.localName==='r');
    const oldStyle=oldRun?allEls(oldRun,'rPr')[0]:null;
    for(const r of Array.from(p.childNodes)){
      if(r.nodeType===1&&r.namespaceURI===W_NS&&r.localName==='r')p.removeChild(r);
    }
    const values=[...new Set(boldValues.filter(Boolean))].sort((a,b)=>b.length-a.length);
    const rx=values.length?new RegExp(values.map(v=>v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g'):null;
    let parts=[];
    if(rx){let last=0,m;while((m=rx.exec(str))){
      if(m.index>last)parts.push([str.slice(last,m.index),false]);
      parts.push([m[0],true]);last=m.index+m[0].length;
    } if(last<str.length)parts.push([str.slice(last),false]);}
    else parts=[[str,false]];
    if(parts.length===0)parts=[['',false]];
    for(const [fragment,isBold] of parts){
      const r=p.ownerDocument.createElementNS(W_NS,'w:r');
      if(oldStyle||isBold){
        const rPr=oldStyle?oldStyle.cloneNode(true):p.ownerDocument.createElementNS(W_NS,'w:rPr');
        if(isBold){
          let b=allEls(rPr,'b')[0];
          if(!b){b=p.ownerDocument.createElementNS(W_NS,'w:b');rPr.appendChild(b);}
          b.setAttributeNS(W_NS,'w:val','1');
        }
        r.appendChild(rPr);
      }
      const t=p.ownerDocument.createElementNS(W_NS,'w:t');
      t.setAttribute('xml:space','preserve');
      t.textContent=fragment;
      r.appendChild(t);p.appendChild(r);
    }
  }
  function preencherDocxXML(xml){
    const doc=new DOMParser().parseFromString(xml,'application/xml');
    if(doc.getElementsByTagName('parsererror').length)throw new Error('XML do modelo Word inv\u00e1lido.');
    const sig=assinatura();
    const replacements={
      '{{DATA}}':dt(valor('doc-data')),
      '{{NUMERO}}':numeracaoAtual().numero,
      '{{ANO}}':numeracaoAtual().ano,
      '{{ASSINANTE}}':sig.nome,
      '{{CARGO_ASSINANTE}}':sig.cargo,
      '{{PARA}}':valor('doc-para'),
      '{{AC}}':valor('doc-ac'),
      '{{SETOR}}':valor('doc-setor'),
      '{{ASSUNTO}}':valor('doc-assunto'),
      '{{SAUDACAO}}':valor('doc-saudacao'),
      '{{DESPEDIDA}}':valor('doc-despedida')
    };
    for(const t of allEls(doc,'t')){
      let v=t.textContent;
      for(const [k,r] of Object.entries(replacements))v=v.split(k).join(r);
      t.textContent=v;
    }
    const paras=limpa(valor('doc-texto')).split(/\n\s*\n/).filter(Boolean);
    const target=[1,2,3].map(i=>markParagraph(doc,`{{CORPO${i}}}`));
    if(target.some(p=>!p))throw new Error('Par\u00e1grafos do modelo Word ausentes.');
    let anchor=target[2];
    if(paras.length>3){
      for(let i=3;i<paras.length;i++){
        const clone=target[2].cloneNode(true);
        anchor.parentNode.insertBefore(clone,anchor.nextSibling);
        target.push(clone);anchor=clone;
      }
    }
    const bold=[servidor('doc-principal'),servidor('doc-secundario')]
      .filter(Boolean).flatMap(f=>[f.nome,f.matricula]);
    target.forEach((p,i)=>{
      if(i>=paras.length){p.parentNode.removeChild(p);return;}
      resetParagraph(p,paras[i],bold);
    });
    return new XMLSerializer().serializeToString(doc);
  }
  async function baixarDocxOficial(){
    const pend=temPendencias();
    if(pend.length){situacao('Revise antes de gerar o Word: '+pend.join(' '),'error');return;}
    try{
      situacao('Preparando o Word com o modelo original da escola...','');
      const files=await unzipOriginal(base64Bytes(MODELO_WORD));
      const original=files.get('word/document.xml');
      if(!original)throw new Error('Documento do modelo n\u00e3o encontrado.');
      const resultado=preencherDocxXML(readText.decode(original));
      files.set('word/document.xml',textCodec.encode(resultado));
      const blob=zipStored(files);
      const url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;
      a.download=`MEMORANDO_${numeracaoAtual().numero}_${numeracaoAtual().ano}.docx`;
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),60000);
      situacao('Word .docx gerado a partir do modelo original. Confira dados, assinatura e quebras de p\u00e1gina antes do protocolo.','ok');
    }catch(err){situacao('N\u00e3o foi poss\u00edvel gerar o .docx: '+err.message,'error');}
  }

  function baixarWord() {
    if(ehMemo())return baixarDocxOficial();
    const pend = temPendencias();
    if (pend.length) { situacao('Revise antes de gerar Word: ' + pend.join(' '), 'error'); return; }
    const blob = new Blob(['\ufeff', documentoHTML(false)], {type:'application/msword;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DOCUMENTO_SERVIDOR_${valor('doc-data') || dataLocal()}.doc`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    situacao('Arquivo .doc HTML gerado. Para preservar o memorando exatamente como aparece, prefira Imprimir / Salvar PDF; o Word pode reorganizar o layout e n\u00e3o incorporar o bras\u00e3o.', 'ok');
  }

  function interface() {
    return `<div class="page-header"><div><h2>Documentos da Escola</h2>
      <p>Modelos para a Secretaria: pessoal, calend\u00e1rio, zeladoria, transporte, est\u00e1gio, inclus\u00e3o e memorando livre.</p></div>
      <span class="docs-badge">Conferir antes de assinar</span></div>
    <div class="docs-layout">
      <section class="docs-panel"><h3>1. Preencher o documento</h3>
        <div class="docs-grid">
          <div class="docs-field full"><label>Tipo de documento</label>
            <select id="doc-tipo">${tipos.map(([v,n])=>`<option value="${v}">${esc(n)}</option>`).join('')}</select></div>
          <div class="docs-field full"><div class="docs-typehint" id="doc-dica"></div></div>
          <div class="docs-field full" id="doc-principal-bloco"><label id="doc-principal-legenda">Servidor interessado</label>
            <input list="doc-funcionarios" id="doc-principal" autocomplete="off" placeholder="Digite o nome ou matr\u00edcula e selecione uma op\u00e7\u00e3o"></div>
          <div class="docs-field full" id="doc-secundario-bloco" hidden><label id="doc-secundario-legenda">Profissional sugerido / substituto (opcional)</label>
            <input list="doc-funcionarios" id="doc-secundario" autocomplete="off" placeholder="Pesquise pelo nome ou matr\u00edcula"></div>
          <datalist id="doc-funcionarios">${S.funcionarios.map(f=>`<option value="${esc(rotulo(f))}"></option>`).join('')}</datalist>
          <div class="docs-field"><label>Data do documento</label><input id="doc-data" type="date" value="${dataLocal()}"></div>
          <div class="docs-field" id="doc-numero-bloco"><label>N\u00famero do memorando (opcional)</label>
            <input id="doc-numero" placeholder="Ex.: 025"></div>
          <div class="docs-field full" id="doc-destino-simples"><label>Destinat\u00e1rio / A/C</label>
            <input id="doc-destino" value="Inspe\u00e7\u00e3o Escolar"></div>
          <div class="docs-field full" id="doc-memorando-cabecalho" hidden>
            <div class="docs-grid">
              <div class="docs-field full"><label>Para (nome completo)</label>
                <input id="doc-para" value="Charles Gutemberg Alencar Soares"></div>
              <div class="docs-field full"><label>A/C (respons\u00e1vel)</label>
                <input id="doc-ac" value="Polyana Ferreira Da Silva"></div>
              <div class="docs-field full"><label>Coordenadoria / Setor</label>
                <input id="doc-setor" value="Coordenadoria de Gest\u00e3o Pessoal"></div>
              <div class="docs-field"><label>Sauda\u00e7\u00e3o</label><input id="doc-saudacao" value="Prezada Senhora,"></div>
              <div class="docs-field"><label>Despedida</label><input id="doc-despedida" value="Atenciosamente,"></div>
            </div>
          </div>
          <div class="docs-field full"><label>Assunto</label><input id="doc-assunto"></div>
          <div class="docs-field full" id="doc-amplo-bloco" hidden>
            <h4 id="doc-amplo-nome">Dados do documento</h4>
            <input id="doc-modelo-amplo" type="hidden"><input id="doc-genero-amplo" type="hidden"><input id="doc-texto-gerado" type="hidden"><input id="doc-dados-reconhecidos" type="hidden">
            <div class="docs-grid">${Object.entries(globalThis.AssistenteDocumentalAmplo?.definicoes || {}).filter(([id])=>!['doc-destino','doc-assunto','doc-data','doc-numero','doc-para','doc-ac','doc-setor'].includes(id)).map(([id,[label,type]])=>`<div class="docs-field ${type==='textarea'?'full':''}" id="${id}-amplo-bloco"><label for="${id}">${esc(label)}</label>${type==='textarea'?`<textarea id="${id}" maxlength="16000"></textarea>`:`<input id="${id}" type="${type}" maxlength="1000">`}</div>`).join('')}</div>
          </div>
          <div class="docs-field" id="doc-cargo-bloco" hidden><label>Cargo/fun\u00e7\u00e3o a contratar</label>
            <input id="doc-cargo" placeholder="Ex.: Professor(a) PEB I"></div>
          <div class="docs-field" id="doc-inicio-bloco" hidden><label id="doc-inicio-legenda">Data inicial</label>
            <input id="doc-inicio" type="date"></div>
          <div class="docs-field" id="doc-fim-bloco" hidden><label id="doc-fim-legenda">Data final</label>
            <input id="doc-fim" type="date"></div>
          <div class="docs-field" id="doc-prazo-bloco" hidden><label>Per\u00edodo em dias (opcional)</label>
            <input id="doc-prazo" type="number" min="1" placeholder="Ex.: 60"></div>
          <div class="docs-field full" id="doc-pedido-bloco" hidden><label id="doc-pedido-legenda">Pedido / objeto do requerimento</label>
            <textarea id="doc-pedido" placeholder="Descreva objetivamente o que est\u00e1 sendo solicitado."></textarea></div>
          <div class="docs-field full"><label id="doc-motivo-legenda">Justificativa / observa\u00e7\u00f5es</label>
            <textarea id="doc-motivo" placeholder="Ex.: assegurar a continuidade das atividades pedag\u00f3gicas e do atendimento aos alunos."></textarea></div>
          ${EXTRA_CAMPOS.map(([id,label,kind,inputType,placeholder])=>`
            <div class="docs-field ${['doc-local','doc-instituicao','doc-horario','doc-estudante','doc-anexos'].includes(id)?'full':''}" id="${id}-bloco" hidden>
              <label>${esc(label)}</label>
              <input id="${id}" type="${inputType}" ${inputType==='number'?'min="1"':''} placeholder="${esc(placeholder)}">
            </div>
          `).join('')}
          <div class="docs-field"><label>Nome do assinante</label>
            <input id="doc-assinante" value="Anderson Santos Silva"></div>
          <div class="docs-field"><label>Cargo do assinante</label>
            <input id="doc-cargo-assinante" value="Diretor de Unidade Escolar"></div>
        </div>
        <h4>2. Texto do documento (edit\u00e1vel)</h4>
        <div class="docs-field"><textarea id="doc-texto" style="min-height:290px"></textarea>
          <small class="docs-hint" id="doc-edicao"></small></div>
        <div class="docs-actions">
          <button type="button" id="doc-atualizar" class="btn btn-secondary">Atualizar texto</button>
          <button type="button" id="doc-copiar" class="btn btn-secondary">Copiar texto</button>
        </div>
      </section>
      <section class="docs-panel">
        <div class="docs-previewbar"><h3>Pr\u00e9-visualiza\u00e7\u00e3o do documento</h3><span class="docs-badge">Folha A4</span></div>
        <div id="doc-preview" class="docs-page"></div>
        <div class="docs-actions">
          <button type="button" class="btn btn-primary" id="doc-imprimir">Imprimir / Salvar PDF</button>
          <button type="button" class="btn btn-secondary" id="doc-word">Baixar Word (.doc)</button>
        </div>
        <div id="doc-status" role="status" class="docs-status"></div>
        <p class="docs-hint">Os textos s\u00e3o modelos administrativos. Confira datas, situa\u00e7\u00e3o funcional,
        cargo e informa\u00e7\u00f5es do processo antes do protocolo ou assinatura. Nenhum documento \u00e9 salvo automaticamente no banco.</p>
      </section>
    </div>`;
  }

  async function init() {
    try {
      await App.requireRoles(['administrador', 'secretaria']);
    } catch {
      App.layout('Documentos da Escola', 'Acesso restrito',
        '<div class="docs-panel">Acesso permitido apenas aos perfis Secretaria e Administrador ativos.</div>');
      return;
    }
    try {
      S.funcionarios = await App.getAll('funcionarios');
      S.funcionarios.sort((a,b) => normaliza(a.nome).localeCompare(normaliza(b.nome), 'pt-BR'));
    } catch(err) {
      S.funcionarios = [];
    }
    App.layout('Documentos da Escola', 'Declara\u00e7\u00f5es \u2022 Requerimentos \u2022 Memorandos', interface());
    $('doc-assunto').value = assuntoPadrao(valor('doc-tipo'));
    ensureMemoStyle();
    camposDinamicos();
    atualizarModelo(true);
    $('doc-tipo').addEventListener('change', () => {
      $('doc-assunto').value = assuntoPadrao(valor('doc-tipo'));
      definirDestinatario(valor('doc-tipo'));
      S.textoEditado = false;
      camposDinamicos();
      atualizarModelo(true);
    });
    for (const id of ['doc-principal','doc-secundario','doc-data','doc-numero','doc-destino','doc-assunto',
      'doc-cargo','doc-inicio','doc-fim','doc-prazo','doc-pedido','doc-motivo','doc-assinante','doc-cargo-assinante',
      'doc-para','doc-ac','doc-setor','doc-saudacao','doc-despedida']) {
      $(id).addEventListener('input', () => atualizarModelo(false));
      $(id).addEventListener('change', () => atualizarModelo(false));
    }
    for (const [id] of EXTRA_CAMPOS) {
      $(id).addEventListener('input', () => atualizarModelo(false));
      $(id).addEventListener('change', () => atualizarModelo(false));
    }
    for (const id of Object.keys(globalThis.AssistenteDocumentalAmplo?.definicoes || {})) {
      if (!$(id) || !$(id+'-amplo-bloco')) continue;
      $(id).addEventListener('input',()=>{ if(modeloAmplo()) atualizarModelo(false); });
      $(id).addEventListener('change',()=>{ if(modeloAmplo()) atualizarModelo(false); });
    }
    $('doc-texto').addEventListener('input', () => {
      S.textoEditado = true;
      $('doc-edicao').textContent = 'Texto personalizado; a edi\u00e7\u00e3o ser\u00e1 mantida at\u00e9 clicar em Atualizar texto.';
      visualizar();
    });
    $('doc-atualizar').onclick = () => atualizarModelo(true);
    $('doc-copiar').onclick = copiar;
    $('doc-imprimir').onclick = emitir;
    $('doc-word').onclick = baixarWord;
    $('doc-tipo').addEventListener('change',()=>{$('doc-word').textContent=ehMemo()?'Baixar Word (.docx oficial)':'Baixar Word (.doc)';});
    window.addEventListener('resize',()=>{if(ehMemo())ajustarVisualMemorando();});
    situacao(`${S.funcionarios.length} funcion\u00e1rios dispon\u00edveis para pesquisa. Selecione o tipo de documento.`, 'ok');
  }
  return {init, sincronizarCampos:camposDinamicos};
})();

/* ============================================================
   MELHORIA DA TELA \u2014 CATEGORIAS E DECLARA\u00c7\u00c3O DE COMPARECIMENTO
   Mant\u00e9m as fun\u00e7\u00f5es originais e todos os modelos anteriores.
============================================================ */

(function instalarTelaSimplificada() {
  const originalInit = DocumentosServidoresPage.init;
  const $ = id => document.getElementById(id);
  const limpo = v => String(v ?? '').trim();
  const esc = v => App.escapeHTML(limpo(v));
  const dataBr = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '')
    ? d.slice(8, 10) + '/' + d.slice(5, 7) + '/' + d.slice(0, 4)
    : '[DATA]';

  const grupos = {
    declaracao: [
      ['declaracao-livre', 'Declaração institucional, escolar ou personalizada'],
      ['declaracao', 'Declara\u00e7\u00e3o funcional do servidor'],
      ['comparecimento-responsavel', 'Comparecimento de pai, m\u00e3e ou respons\u00e1vel']
    ],
    requerimento: [
      ['requerimento', 'Requerimento do servidor']
    ],
    memorando: [
      ['prorrogacao', 'Prorroga\u00e7\u00e3o de contrato'],
      ['substituicao', 'Substitui\u00e7\u00e3o por afastamento'],
      ['contratacao', 'Contrata\u00e7\u00e3o / reposi\u00e7\u00e3o de vaga'],
      ['calendario', 'Altera\u00e7\u00e3o de calend\u00e1rio escolar'],
      ['zeladoria', 'Solicita\u00e7\u00e3o de zeladoria'],
      ['transporte', 'Transporte para visita escolar'],
      ['estagio', 'Parecer sobre est\u00e1gio de servidor(a)'],
      ['avanco', 'Parecer sobre avan\u00e7o de n\u00edvel'],
      ['memorando', 'Personalizado (texto livre)']
    ]
  };

  const estado = {
    pais: false,
    editado: false,
    impOriginal: null,
    wordOriginal: null,
    atualizarOriginal: null,
    renderizado: false
  };

  const valor = id => limpo($(id)?.value);

  function mensagem(texto, erro = false) {
    if (!$('doc-status')) return;
    $('doc-status').textContent = texto;
    $('doc-status').className = 'docs-status ' + (erro ? 'error' : 'ok');
  }

  function camposPais() {
    return `
      <div class="docs-field full" id="ds-pais-bloco" hidden>
        <div class="docs-typehint">
          Declara\u00e7\u00e3o para apresentar ao empregador, comprovando o
          comparecimento de pai, m\u00e3e ou respons\u00e1vel \u00e0 escola.
          Preencha somente informa\u00e7\u00f5es confirmadas pela secretaria.
        </div>

        <div class="docs-grid" style="margin-top:14px">
          <div class="docs-field full">
            <label>Nome completo do(a) respons\u00e1vel *</label>
            <input
              id="ds-nome"
              autocomplete="off"
              placeholder="Nome do pai, da m\u00e3e ou respons\u00e1vel"
            >
          </div>

          <div class="docs-field full">
            <label>Nome do(a) estudante (opcional)</label>
            <input
              id="ds-estudante"
              autocomplete="off"
              placeholder="Deixe em branco se n\u00e3o for necess\u00e1rio informar"
            >
          </div>

          <div class="docs-field">
            <label>Data do comparecimento *</label>
            <input id="ds-data" type="date">
          </div>

          <div class="docs-field">
            <label>Finalidade (opcional)</label>
            <select id="ds-motivo">
              <option value="">Assuntos escolares</option>
              <option value="reuni\u00e3o pedag\u00f3gica">Reuni\u00e3o pedag\u00f3gica</option>
              <option value="atendimento na secretaria">Atendimento na secretaria</option>
              <option value="atendimento com a dire\u00e7\u00e3o">Atendimento com a dire\u00e7\u00e3o</option>
              <option value="retirada do(a) estudante">Retirada do(a) estudante</option>
              <option value="outros assuntos escolares">Outros assuntos escolares</option>
            </select>
          </div>

          <div class="docs-field">
            <label>Entrada *</label>
            <input id="ds-entrada" type="time">
          </div>

          <div class="docs-field">
            <label>Sa\u00edda *</label>
            <input id="ds-saida" type="time">
          </div>

          <div class="docs-field full">
            <label>Nome de quem assinar\u00e1 *</label>
            <input
              id="ds-assinante"
              value="Anderson Santos Silva"
            >
          </div>

          <div class="docs-field full">
            <label>Cargo de quem assinar\u00e1 *</label>
            <input
              id="ds-cargo"
              value="Diretor de Unidade Escolar"
            >
          </div>
        </div>
      </div>`;
  }

  function textoPais() {
    const resp = valor('ds-nome') || '[NOME DO(A) RESPONS\u00c1VEL]';
    const aluno = valor('ds-estudante');
    const dia = dataBr(valor('ds-data'));
    const ini = valor('ds-entrada') || '[ENTRADA]';
    const fim = valor('ds-saida') || '[SA\u00cdDA]';
    const motivo = valor('ds-motivo');
    const objetivo = motivo || 'tratar de assuntos escolares';

    return `Declaramos, para os devidos fins e especialmente para apresenta\u00e7\u00e3o no local de trabalho, que ${resp} compareceu \u00e0 Escola Municipal Professora Eunice Carneiro, no dia ${dia}, no per\u00edodo das ${ini} \u00e0s ${fim}, para ${objetivo}${aluno ? ', em assunto relacionado ao(\u00e0) estudante ' + aluno : ''}.

A presente declara\u00e7\u00e3o refere-se exclusivamente ao comparecimento registrado na unidade escolar, n\u00e3o representando, por si s\u00f3, abono de jornada de trabalho.

Por ser verdade, firmamos a presente declara\u00e7\u00e3o.`;
  }

  function conteudoPais() {
    const texto = valor('doc-texto');

    const parags = texto
      .split(/\n\s*\n/)
      .filter(Boolean)
      .map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`)
      .join('');

    return `
      <div class="docs-letterhead">
        <b>PREFEITURA MUNICIPAL DE MONTES CLAROS</b>
        <b>SECRETARIA MUNICIPAL DE EDUCA\u00c7\u00c3O</b>
        <b>ESCOLA MUNICIPAL PROFESSORA EUNICE CARNEIRO</b>
        <small>Rua D, 300 \u2013 Jos\u00e9 Correia Machado \u2013 Montes Claros/MG</small>
      </div>

      <div class="docs-doc-title">
        DECLARA\u00c7\u00c3O DE COMPARECIMENTO
      </div>

      <div class="docs-place-date">
        Montes Claros/MG, ${esc(dataBr(valor('ds-data')))}.
      </div>

      <div class="docs-body">
        ${parags}
      </div>

      <div class="docs-signature">
        <div class="docs-signature-line">
          <strong>${esc(valor('ds-assinante') || '[ASSINANTE]')}</strong>
        </div>

        <div>${esc(valor('ds-cargo') || '[CARGO]')}</div>
      </div>`;
  }

  function mostrarPais() {
    const p = $('doc-preview');

    if (!p || !estado.pais) return;

    p.style.padding = '';
    p.style.minHeight = '';
    p.innerHTML = conteudoPais();
  }

  function atualizarPais(force = false) {
    if (!estado.pais) return;

    if (force || !estado.editado) {
      $('doc-texto').value = textoPais();
      estado.editado = false;
    }

    $('doc-edicao').textContent = estado.editado
      ? 'Texto personalizado. Clique em Atualizar texto para refazer o modelo.'
      : 'Texto gerado automaticamente. Voc\u00ea pode ajust\u00e1-lo antes de emitir.';

    mostrarPais();
  }

  function validarPais() {
    const erros = [];

    if (!valor('ds-nome')) {
      erros.push('Nome do respons\u00e1vel');
    }

    if (!valor('ds-data')) {
      erros.push('Data do comparecimento');
    }

    if (!valor('ds-entrada')) {
      erros.push('Hor\u00e1rio de entrada');
    }

    if (!valor('ds-saida')) {
      erros.push('Hor\u00e1rio de sa\u00edda');
    }

    if (
      valor('ds-saida') &&
      valor('ds-entrada') &&
      valor('ds-saida') < valor('ds-entrada')
    ) {
      erros.push('Sa\u00edda n\u00e3o pode ser anterior \u00e0 entrada');
    }

    if (!valor('ds-assinante') || !valor('ds-cargo')) {
      erros.push('Identifica\u00e7\u00e3o de quem assinar\u00e1');
    }

    if (
      !valor('doc-texto') ||
      /\[[^\]]+\]/.test(valor('doc-texto'))
    ) {
      erros.push('Texto incompleto');
    }

    return erros;
  }

  function htmlPais(acoes = false) {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Declara\u00e7\u00e3o de comparecimento</title>

<style>
  @page {
    size: A4;
    margin: 20mm;
  }

  body {
    font: 12pt/1.55 "Times New Roman", serif;
    color: #111;
    margin: 0;
  }

  .docs-letterhead {
    text-align: center;
    border-bottom: 1px solid #222;
    padding-bottom: 11px;
    margin-bottom: 28px;
    line-height: 1.4;
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
    margin-bottom: 25px;
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
    max-width: 105mm;
    margin: 30mm auto 0;
    page-break-inside: avoid;
  }

  .docs-signature-line {
    border-top: 1px solid #111;
    padding-top: 6px;
  }

  .ds-print-actions {
    padding: 12px;
    text-align: center;
    background: #eef2f7;
    font: 14px Arial;
  }

  @media print {
    .ds-print-actions {
      display: none;
    }
  }
</style>
</head>

<body>
  ${
    acoes
      ? `<div class="ds-print-actions">
           <button type="button" data-doc-print>
             Imprimir / Salvar PDF
           </button>
         </div>`
      : ''
  }

  ${conteudoPais()}
</body>
</html>`;
  }

  function imprimirPais() {
    const erros = validarPais();

    if (erros.length) {
      return mensagem(
        'Confira: ' + erros.join('; '),
        true
      );
    }

    const aba = window.open('', '_blank');

    if (!aba) {
      return mensagem(
        'Permita a abertura de uma nova aba no navegador.',
        true
      );
    }

    aba.opener = null;
    aba.document.open();
    aba.document.write(htmlPais(true));
    aba.document.close();
    aba.document.querySelectorAll('[data-doc-print]').forEach(button => {
      button.addEventListener('click', () => aba.print());
    });

    mensagem(
      'Documento aberto. Confira antes de imprimir ou salvar em PDF.'
    );
  }

  function wordPais() {
    const erros = validarPais();

    if (erros.length) {
      return mensagem(
        'Confira: ' + erros.join('; '),
        true
      );
    }

    const blob = new Blob(
      ['\ufeff', htmlPais(false)],
      {
        type: 'application/msword;charset=utf-8'
      }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download =
      'DECLARACAO_COMPARECIMENTO_' +
      valor('ds-data') +
      '.doc';

    document.body.appendChild(a);

    a.click();
    a.remove();

    setTimeout(
      () => URL.revokeObjectURL(url),
      60000
    );

    mensagem(
      'Arquivo .doc criado. Confira no Word antes de utilizar.'
    );
  }

  function opcoesGrupo(categoria, escolhida = '') {
    const lista = grupos[categoria];

    $('ds-modelo').innerHTML = lista
      .map(([v, nome]) => `
        <option value="${esc(v)}">
          ${esc(nome)}
        </option>
      `)
      .join('');

    $('ds-modelo').value = lista.some(
      x => x[0] === escolhida
    )
      ? escolhida
      : lista[0][0];

    $('ds-modelo-bloco').hidden =
      categoria === 'requerimento';
  }

  function usarModelo() {
    for(const id of ['doc-modelo-amplo','doc-genero-amplo','doc-texto-gerado']) if($(id)) $(id).value='';
    const id = valor('ds-modelo');
    const pais = id === 'comparecimento-responsavel';

    estado.pais = pais;
    estado.editado = false;

    const original = $('doc-tipo');

    original.value = pais
      ? 'declaracao'
      : id;

    original.dispatchEvent(
      new Event('change', { bubbles: true })
    );

    for (
      const item of $('doc-tipo')
        .closest('.docs-grid')
        .children
    ) {
      if (
        item.id === 'ds-categoria-bloco' ||
        item.id === 'ds-modelo-bloco' ||
        item.id === 'ds-pais-bloco'
      ) {
        continue;
      }

      item.style.display = pais
        ? 'none'
        : '';
    }

    $('ds-pais-bloco').hidden = !pais;

    if (pais) {
      $('ds-data').value = $('doc-data').value;

      $('doc-word').textContent =
        'Baixar Word (.doc)';

      atualizarPais(true);

      mensagem(
        'Preencha o comparecimento e confira os hor\u00e1rios.'
      );
    } else {
      mensagem(
        'Selecione o modelo e preencha os dados do documento.'
      );
    }
  }

  async function montarInterfaceSimplificada() {
    if (!$('doc-tipo')) return;

    const tipo = $('doc-tipo');
    const grid = tipo.closest('.docs-grid');

    if (!grid || estado.renderizado) return;

    estado.renderizado = true;

    const rotuloAntigo = tipo.parentElement;

    rotuloAntigo.style.display = 'none';

    const categoria = document.createElement('div');

    categoria.className = 'docs-field full';
    categoria.id = 'ds-categoria-bloco';

    categoria.innerHTML = `
      <label>O que deseja emitir?</label>

      <select id="ds-categoria">
        <option value="declaracao">Declara\u00e7\u00e3o</option>
        <option value="requerimento">Requerimento</option>
        <option value="memorando">Memorando</option>
      </select>`;

    grid.insertBefore(
      categoria,
      rotuloAntigo
    );

    const modelo = document.createElement('div');

    modelo.className = 'docs-field full';
    modelo.id = 'ds-modelo-bloco';

    modelo.innerHTML = `
      <label>Modelo</label>
      <select id="ds-modelo"></select>`;

    grid.insertBefore(
      modelo,
      rotuloAntigo
    );

    const holder = document.createElement('div');

    holder.innerHTML = camposPais();

    grid.insertBefore(
      holder.firstElementChild,
      rotuloAntigo
    );

    // Preserva os geradores originais para os demais documentos.
    estado.impOriginal =
      $('doc-imprimir').onclick;

    estado.wordOriginal =
      $('doc-word').onclick;

    estado.atualizarOriginal =
      $('doc-atualizar').onclick;

    $('doc-imprimir').onclick = () =>
      estado.pais
        ? imprimirPais()
        : estado.impOriginal();

    $('doc-word').onclick = () =>
      estado.pais
        ? wordPais()
        : estado.wordOriginal();

    $('doc-atualizar').onclick = () =>
      estado.pais
        ? atualizarPais(true)
        : estado.atualizarOriginal();

    // Atualiza a pr\u00e9via espec\u00edfica da declara\u00e7\u00e3o para pais.
    $('doc-texto').addEventListener(
      'input',
      () => {
        if (!estado.pais) return;

        estado.editado = true;
        mostrarPais();
      }
    );

    for (
      const id of [
        'ds-nome',
        'ds-estudante',
        'ds-data',
        'ds-motivo',
        'ds-entrada',
        'ds-saida',
        'ds-assinante',
        'ds-cargo'
      ]
    ) {
      $(id).addEventListener(
        'input',
        () => atualizarPais()
      );

      $(id).addEventListener(
        'change',
        () => atualizarPais()
      );
    }

    $('ds-categoria').addEventListener(
      'change',
      () => {
        opcoesGrupo(valor('ds-categoria'));
        usarModelo();
      }
    );

    $('ds-modelo').addEventListener(
      'change',
      usarModelo
    );

    const descricao =
      document.querySelector('.page-header p');

    if (descricao) {
      descricao.textContent =
        'Declara\u00e7\u00f5es, requerimentos e memorandos \u2014 escolha a categoria e depois o modelo.';
    }

    opcoesGrupo(
      'declaracao',
      tipo.value
    );

    usarModelo();
  }

  DocumentosServidoresPage.init = async function () {
    await originalInit();
    await montarInterfaceSimplificada();
  };

})();

/* ========================================================
   CORRE\u00c7\u00c3O DEFINITIVA DA EXIBI\u00c7\u00c3O DOS SELETORES

   Remove visualmente o campo antigo "Tipo de documento".
   Mant\u00e9m apenas:
   1. O que deseja emitir?
   2. Modelo

   Os valores antigos permanecem dispon\u00edveis internamente
   para n\u00e3o prejudicar a gera\u00e7\u00e3o dos documentos.
======================================================== */

(function corrigirSeletoresDuplicados() {

  const iniciarAnterior = DocumentosServidoresPage.init;

  DocumentosServidoresPage.init = async function (...args) {

    await iniciarAnterior.apply(this, args);

    const seletorAntigo = document.getElementById("doc-tipo");

    if (!seletorAntigo) return;

    const blocoAntigo = seletorAntigo.closest(".docs-field");

    if (!blocoAntigo) return;

    // Identifica o bloco antigo para mant\u00ea-lo oculto,
    // mesmo quando o usu\u00e1rio troca de categoria ou modelo.

    blocoAntigo.classList.add(
      "ds-seletor-antigo-oculto"
    );

    // Evita a duplica\u00e7\u00e3o da regra CSS.

    if (!document.getElementById("ds-correcao-seletor-css")) {

      const estilo = document.createElement("style");

      estilo.id = "ds-correcao-seletor-css";

      estilo.textContent = `
        .ds-seletor-antigo-oculto {
          display: none !important;
        }
      `;

      document.head.appendChild(estilo);
    }

    // Ajusta a descri\u00e7\u00e3o do m\u00f3dulo.

    const descricao = document.querySelector(
      ".page-header p"
    );

    if (descricao) {
      descricao.textContent =
        "Escolha Declara\u00e7\u00f5es ou Memorandos e selecione o modelo desejado.";
    }

  };

})();

/* ===============================================================
   CORRE\u00c7\u00c3O: REQUERIMENTO DENTRO DE DECLARA\u00c7\u00d5ES
   E C\u00c1LCULO AUTOM\u00c1TICO DOS DIAS DE LICEN\u00c7A/PRORROGA\u00c7\u00c3O
================================================================ */
(function corrigirCategoriasEPeriodo() {
  const inicializarAnterior = DocumentosServidoresPage.init;

  DocumentosServidoresPage.init = async function (...args) {
    await inicializarAnterior.apply(this, args);

    const categoria = document.getElementById('ds-categoria');
    const modelo = document.getElementById('ds-modelo');
    const tipo = document.getElementById('doc-tipo');
    const inicio = document.getElementById('doc-inicio');
    const fim = document.getElementById('doc-fim');
    const prazo = document.getElementById('doc-prazo');
    const blocoPrazo = document.getElementById('doc-prazo-bloco');

    if (!categoria || !modelo || !tipo || !inicio || !fim || !prazo) {
      console.warn('Documentos: campos esperados n\u00e3o encontrados.');
      return;
    }

    // 1) Somente duas categorias principais.
    for (const opcao of Array.from(categoria.options)) {
      if (opcao.value === 'requerimento') opcao.remove();
      if (opcao.value === 'declaracao') opcao.textContent = 'Declara\u00e7\u00f5es';
      if (opcao.value === 'memorando') opcao.textContent = 'Memorandos';
    }

    function ajustarModelos() {
      if (categoria.value === 'declaracao') {
        if (!Array.from(modelo.options).some(o => o.value === 'requerimento')) {
          modelo.add(new Option('Requerimento do servidor', 'requerimento'));
        }
      } else {
        // O requerimento n\u00e3o deve aparecer nos modelos de memorando.
        for (const opcao of Array.from(modelo.options)) {
          if (opcao.value === 'requerimento') opcao.remove();
        }
      }
    }

    // O seletor original atualiza a lista primeiro.
    // Depois adicionamos o requerimento em Declara\u00e7\u00f5es.
    categoria.addEventListener('change', ajustarModelos);
    ajustarModelos();

    // Mant\u00e9m o seletor antigo oculto.
    const antigo = document.getElementById('doc-tipo');
    const campoAntigo = antigo?.closest('.docs-field');

    if (campoAntigo) {
      campoAntigo.classList.add('ds-original-oculto-permanente');

      if (!document.getElementById('ds-css-original-oculto-permanente')) {
        const css = document.createElement('style');
        css.id = 'ds-css-original-oculto-permanente';
        css.textContent =
          '.ds-original-oculto-permanente{display:none!important}';

        document.head.appendChild(css);
      }
    }

    const descricao = document.querySelector('.page-header p');

    if (descricao) {
      descricao.textContent =
        'Escolha Declara\u00e7\u00f5es ou Memorandos e, em seguida, o modelo desejado.';
    }

    // 2) Contagem de dias corridos, incluindo in\u00edcio e fim.
    let ultimoAutomatico = null;

    const etiqueta = blocoPrazo?.querySelector('label');

    const ajuda = document.createElement('small');
    ajuda.style.cssText =
      'display:block;margin-top:5px;color:#667085;font-size:12px';

    ajuda.textContent =
      'Selecione as duas datas para calcular automaticamente.';

    blocoPrazo?.appendChild(ajuda);

    function diaUTC(str) {
      const partes = str.split('-').map(Number);

      if (
        partes.length !== 3 ||
        partes.some(n => !Number.isFinite(n))
      ) {
        return NaN;
      }

      return Date.UTC(
        partes[0],
        partes[1] - 1,
        partes[2]
      );
    }

    function dispararMudanca() {
      prazo.dispatchEvent(
        new Event('input', { bubbles: true })
      );
    }

    function atualizarPeriodo() {
      const aplicavel = [
        'substituicao',
        'prorrogacao'
      ].includes(tipo.value);

      if (!aplicavel) return;

      // Quando faltar alguma data, permite digitar manualmente.
      if (!inicio.value || !fim.value) {
        if (
          ultimoAutomatico !== null &&
          prazo.value === ultimoAutomatico
        ) {
          prazo.value = '';
          dispararMudanca();
        }

        ultimoAutomatico = null;
        prazo.readOnly = false;

        if (etiqueta) {
          etiqueta.textContent = 'Per\u00edodo em dias (opcional)';
        }

        ajuda.textContent =
          'Selecione as duas datas para calcular automaticamente.';

        return;
      }

      // Conta o dia inicial e o dia final.
      const dias = Math.round(
        (diaUTC(fim.value) - diaUTC(inicio.value)) / 86400000
      ) + 1;

      // Impede resultado negativo ou zero.
      if (!Number.isFinite(dias) || dias <= 0) {
        if (prazo.value === ultimoAutomatico) {
          prazo.value = '';
          dispararMudanca();
        }

        ultimoAutomatico = null;
        prazo.readOnly = false;

        ajuda.textContent =
          'A data final deve ser igual ou posterior \u00e0 inicial.';

        ajuda.style.color = '#b42318';

        return;
      }

      // Preenche automaticamente o per\u00edodo.
      ultimoAutomatico = String(dias);

      prazo.readOnly = true;
      prazo.value = ultimoAutomatico;

      if (etiqueta) {
        etiqueta.textContent =
          'Per\u00edodo em dias (autom\u00e1tico)';
      }

      ajuda.style.color = '#067647';
      ajuda.textContent =
        `${dias} dia(s) corrido(s), contando in\u00edcio e fim.`;

      // Atualiza o texto do memorando automaticamente.
      dispararMudanca();
    }

    // Recalcula sempre que uma data for alterada.
    for (const campo of [inicio, fim]) {
      campo.addEventListener('input', atualizarPeriodo);
      campo.addEventListener('change', atualizarPeriodo);
    }

    tipo.addEventListener('change', atualizarPeriodo);
    modelo.addEventListener('change', atualizarPeriodo);

    atualizarPeriodo();
  };
})();
/* ============================================================
   LTS: DATAS E PER\u00cdODO EM DOIS SENTIDOS
   Cole este bloco ao FINAL de js/documentos-servidores.js.
   Compat\u00edvel com a corre\u00e7\u00e3o anterior de dias inclusivos.
============================================================ */
(function instalarLtsBidirecional() {
  const iniciarAnterior = DocumentosServidoresPage.init;

  DocumentosServidoresPage.init = async function (...args) {
    await iniciarAnterior.apply(this, args);

    const $ = id => document.getElementById(id);
    const inicio = $('doc-inicio');
    const fim = $('doc-fim');
    const dias = $('doc-prazo');
    const tipo = $('doc-tipo');
    const modelo = $('ds-modelo');
    const titular = $('doc-secundario');
    const bloco = $('doc-prazo-bloco');

    if (!inicio || !fim || !dias || !tipo || !bloco) return;

    const DIA = 24 * 60 * 60 * 1000;
    const etiqueta = bloco.querySelector('label');
    const retorno = document.createElement('div');

    retorno.id = 'ds-retorno-licenca';

    retorno.style.cssText =
      'margin-top:9px;padding:10px 12px;border-radius:8px;' +
      'background:#eff6ff;color:#1e40af;font-size:13px;font-weight:600;';

    bloco.appendChild(retorno);

    let ocupado = false;
    let ultimaOrigem = 'fim';
    let diasMemorizados = null;
    let fimAutomatico = '';

    function utc(data) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data || '')) return null;

      const t = Date.parse(data + 'T00:00:00Z');

      if (!Number.isFinite(t)) return null;

      return new Date(t).toISOString().slice(0, 10) === data
        ? t
        : null;
    }

    function iso(t) {
      return new Date(t).toISOString().slice(0, 10);
    }

    function br(data) {
      return data
        ? data.slice(8, 10) + '/' +
          data.slice(5, 7) + '/' +
          data.slice(0, 4)
        : '\u2014';
    }

    function numeroValido() {
      const n = Number(dias.value);

      return dias.value !== '' &&
        Number.isInteger(n) &&
        n >= 1 &&
        n <= 3650
          ? n
          : null;
    }

    function aplicavel() {
      return ['substituicao', 'prorrogacao'].includes(tipo.value);
    }

    function notificar(campo) {
      campo.dispatchEvent(
        new Event('input', { bubbles: true })
      );
    }

    /* IN\u00cdCIO + DIAS = \u00daLTIMO DIA DA LICEN\u00c7A */

    function calcularFim(n) {
      const t = utc(inicio.value);

      if (t === null || !n) return false;

      // O primeiro dia j\u00e1 \u00e9 o dia 1 da LTS.
      const novoFim = iso(t + (n - 1) * DIA);

      if (fim.value !== novoFim) {
        fim.value = novoFim;
        notificar(fim);
      }

      fimAutomatico = novoFim;
      dias.value = String(n);
      diasMemorizados = n;

      notificar(dias);

      return true;
    }

    /* IN\u00cdCIO + \u00daLTIMO DIA = TOTAL DE DIAS */

    function calcularDias() {
      const a = utc(inicio.value);
      const b = utc(fim.value);

      if (a === null || b === null) return false;

      // +1: inclui o primeiro e o \u00faltimo dia.
      const n = Math.round((b - a) / DIA) + 1;

      if (n < 1 || n > 3650) return false;

      dias.value = String(n);
      diasMemorizados = n;

      notificar(dias);

      return true;
    }

    /* RETORNO PREVISTO = DIA SEGUINTE AO FIM */

    function mostrarRetorno() {
      if (!aplicavel()) {
        retorno.hidden = true;
        return;
      }

      retorno.hidden = false;

      const ini = utc(inicio.value);
      const ult = utc(fim.value);

      if (ini === null || ult === null || ult < ini) {
        retorno.textContent =
          'Retorno: informe um in\u00edcio e um t\u00e9rmino v\u00e1lidos.';

        retorno.style.color = '#b42318';
        return;
      }

      const diaSeguinte = br(iso(ult + DIA));

      const eLts =
        tipo.value === 'substituicao' ||
        (
          tipo.value === 'prorrogacao' &&
          !!titular?.value.trim()
        );

      if (eLts) {
        retorno.textContent =
          '\u00daltimo dia do per\u00edodo informado: ' + br(fim.value) +
          '  \u2022  Dia seguinte ao per\u00edodo: ' + diaSeguinte;
      } else {
        retorno.textContent =
          '\u00daltimo dia do per\u00edodo informado: ' +
          br(fim.value) +
          '  \u2022  Dia seguinte: ' + diaSeguinte;
      }

      retorno.style.color = '#1e40af';
    }

    /* SINCRONIZAR OS TR\u00caS CAMPOS */

    function sincronizar(origem) {
      if (ocupado) return;

      ocupado = true;

      try {
        // O c\u00f3digo antigo bloqueava a edi\u00e7\u00e3o dos dias.
        // Agora o campo permanece edit\u00e1vel.
        dias.readOnly = false;

        if (etiqueta) {
          etiqueta.textContent =
            'Per\u00edodo em dias (edit\u00e1vel)';
        }

        if (!aplicavel()) {
          retorno.hidden = true;
          return;
        }

        if (origem === 'dias') {
          ultimaOrigem = 'dias';

          const n = numeroValido();

          if (n !== null) {
            diasMemorizados = n;
            calcularFim(n);
          } else if (!dias.value && fimAutomatico === fim.value) {
            fim.value = '';
            fimAutomatico = '';
            diasMemorizados = null;

            notificar(fim);
          } else if (dias.value) {
            retorno.hidden = false;
            retorno.textContent =
              'Informe um per\u00edodo inteiro de 1 a 3650 dias.';
            retorno.style.color = '#b42318';
            return;
          }

        } else if (origem === 'inicio') {
          // Se o usu\u00e1rio definiu o per\u00edodo, preservamos
          // essa dura\u00e7\u00e3o ao trocar a data inicial.
          if (
            ultimaOrigem === 'dias' &&
            diasMemorizados !== null
          ) {
            calcularFim(diasMemorizados);
          } else if (fim.value) {
            calcularDias();
          } else if (numeroValido() !== null) {
            calcularFim(numeroValido());
          }

        } else if (origem === 'fim') {
          // O usu\u00e1rio alterou a data final:
          // recalculamos a quantidade de dias.
          ultimaOrigem = 'fim';
          fimAutomatico = '';

          if (
            !calcularDias() &&
            inicio.value &&
            fim.value
          ) {
            dias.value = '';
            diasMemorizados = null;
            notificar(dias);
          }

        } else if (inicio.value && fim.value) {
          calcularDias();
        }

        mostrarRetorno();

      } finally {
        // Garante que a quantidade continue edit\u00e1vel.
        dias.readOnly = false;
        ocupado = false;
      }
    }

    /* EVENTOS */

    inicio.addEventListener(
      'input',
      () => sincronizar('inicio')
    );

    inicio.addEventListener(
      'change',
      () => sincronizar('inicio')
    );

    fim.addEventListener(
      'input',
      () => sincronizar('fim')
    );

    fim.addEventListener(
      'change',
      () => sincronizar('fim')
    );

    dias.addEventListener(
      'input',
      () => sincronizar('dias')
    );

    dias.addEventListener(
      'change',
      () => sincronizar('dias')
    );

    tipo.addEventListener(
      'change',
      () => sincronizar('modelo')
    );

    modelo?.addEventListener(
      'change',
      () => sincronizar('modelo')
    );

    titular?.addEventListener(
      'input',
      mostrarRetorno
    );

    sincronizar('modelo');
  };
})();
/* =========================================================
   AUTO PREENCHER "CARGO/FUN\u00c7\u00c3O A CONTRATAR"
   COM O CARGO DO SERVIDOR SUBSTITU\u00cdDO
   Cole ao FINAL de js/documentos-servidores.js
========================================================= */
(function instalarAutoCargoSubstituicao() {
  const initAnterior = DocumentosServidoresPage.init;

  DocumentosServidoresPage.init = async function (...args) {
    await initAnterior.apply(this, args);

    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    function normalizar(txt) {
      return String(txt || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    }

    function extrairMatricula(texto) {
      const limpo = String(texto || '');
      const match = limpo.match(/(\d{4,})/);
      return match ? match[1] : '';
    }

    function encontrarCampoPorLabel(texto) {
      const labels = $$('label');

      for (const label of labels) {
        if (normalizar(label.textContent).includes(normalizar(texto))) {
          const forId = label.getAttribute('for');

          if (forId) {
            const el = document.getElementById(forId);
            if (el) return el;
          }

          const container = label.parentElement;
          if (!container) continue;

          const campo = container.querySelector('input, select, textarea');
          if (campo) return campo;
        }
      }

      return null;
    }

    function obterSupabase() {
      return (
        window.supabaseClient ||
        window.supabase ||
        window.sb ||
        null
      );
    }

    let cacheFuncionarios = [];

    async function carregarFuncionarios() {
      if (cacheFuncionarios.length) return cacheFuncionarios;

      const sb = obterSupabase();
      if (!sb) return [];

      try {
        const { data, error } = await sb
          .from('funcionarios')
          .select('*')
          .limit(5000);

        if (error) throw error;

        cacheFuncionarios = Array.isArray(data) ? data : [];
        return cacheFuncionarios;
      } catch (err) {
        console.error('Erro ao carregar funcion\u00e1rios:', err);
        return [];
      }
    }

    function obterCargoFuncionario(funcionario) {
      if (!funcionario) return '';

      return (
        funcionario.cargo_funcao ||
        funcionario.cargoFuncao ||
        funcionario.cargo ||
        funcionario.funcao ||
        funcionario.cargo_nome ||
        funcionario.cargoNome ||
        ''
      );
    }

    async function aplicarNoFormulario() {
      const campoServidor =
        encontrarCampoPorLabel('Servidor interessado') ||
        encontrarCampoPorLabel('Servidor substitu\u00eddo') ||
        encontrarCampoPorLabel('Servidor a ser substitu\u00eddo');

      const campoCargo =
        encontrarCampoPorLabel('Cargo/fun\u00e7\u00e3o a contratar') ||
        encontrarCampoPorLabel('Cargo / fun\u00e7\u00e3o a contratar');

      if (!campoServidor || !campoCargo) return;

      campoCargo.placeholder = 'Ser\u00e1 preenchido automaticamente ao selecionar o servidor';

      let temporizador = null;

      async function preencherCargoAutomaticamente() {
        const valor = String(campoServidor.value || '').trim();

        if (!valor) return;

        const funcionarios = await carregarFuncionarios();
        if (!funcionarios.length) return;

        const matricula = extrairMatricula(valor);
        const nomeDigitado = normalizar(
          valor.split('\u2014')[0].split('-')[0].trim()
        );

        let encontrado = null;

        if (matricula) {
          encontrado = funcionarios.find((f) => {
            const mat = String(
              f.matricula ||
              f.matricula_funcional ||
              f.registro ||
              ''
            ).replace(/\D/g, '');

            return mat === matricula;
          });
        }

        if (!encontrado && nomeDigitado) {
          encontrado =
            funcionarios.find((f) => normalizar(f.nome) === nomeDigitado) ||
            funcionarios.find((f) => normalizar(f.nome_completo) === nomeDigitado) ||
            funcionarios.find((f) => normalizar(f.nome).includes(nomeDigitado)) ||
            funcionarios.find((f) => nomeDigitado.includes(normalizar(f.nome)));
        }

        const cargo = obterCargoFuncionario(encontrado);

        if (cargo) {
          campoCargo.value = cargo;
          campoCargo.dispatchEvent(new Event('input', { bubbles: true }));
          campoCargo.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      campoServidor.addEventListener('change', preencherCargoAutomaticamente);
      campoServidor.addEventListener('blur', preencherCargoAutomaticamente);

      campoServidor.addEventListener('input', () => {
        clearTimeout(temporizador);
        temporizador = setTimeout(preencherCargoAutomaticamente, 300);
      });

      await preencherCargoAutomaticamente();
    }

    await aplicarNoFormulario();
  };
})();

/* ============================================================
   CARGO AUTOM\u00c1TICO PELO CADASTRO DE FUNCION\u00c1RIOS

   Busca os dados na MESMA tabela utilizada pela p\u00e1gina
   Funcion\u00e1rios, por meio de App.getAll("funcionarios").

   Ao selecionar o servidor afastado por LTS:
   - Identifica nome e matr\u00edcula.
   - Consulta o cargo/fun\u00e7\u00e3o j\u00e1 cadastrado.
   - Preenche automaticamente o cargo a contratar.
   - Atualiza o texto e a pr\u00e9via do memorando.

   N\u00e3o altera nem grava dados do servidor.
============================================================ */

(function integrarCargoAoCadastro() {

  const iniciarAnterior = DocumentosServidoresPage.init;

  DocumentosServidoresPage.init = async function (...args) {

    await iniciarAnterior.apply(this, args);

    const campoServidor = document.getElementById(
      "doc-principal"
    );

    const campoCargo = document.getElementById(
      "doc-cargo"
    );

    const campoTipo = document.getElementById(
      "doc-tipo"
    );

    const campoModelo = document.getElementById(
      "ds-modelo"
    );

    if (!campoServidor || !campoCargo || !campoTipo) {
      return;
    }

    // Carrega os mesmos funcion\u00e1rios da p\u00e1gina Funcion\u00e1rios.

    let funcionarios = [];

    try {
      funcionarios = await App.getAll("funcionarios");
    } catch (erro) {
      console.error(
        "Erro ao consultar o cadastro de funcion\u00e1rios:",
        erro
      );

      return;
    }

    function normalizar(valor) {
      return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/\s+/g, " ")
        .trim();
    }

    function obterCargo(funcionario) {
      return String(
        funcionario?.cargo ||
        funcionario?.cargo_funcao ||
        ""
      ).trim();
    }

    function localizarServidor() {

      const selecionado = normalizar(
        campoServidor.value
      );

      if (!selecionado) return null;

      // Mesmo formato utilizado pela lista de servidores.
      // Exemplo: NOME COMPLETO \u2014 Matr\u00edcula 123456

      const encontrados = funcionarios.filter(
        funcionario => {

          const nome = normalizar(
            funcionario.nome
          );

          const matricula = String(
            funcionario.matricula || ""
          ).trim();

          const opcao = normalizar(
            funcionario.nome +
            (
              matricula
                ? " \u2014 Matr\u00edcula " + matricula
                : ""
            )
          );

          return (
            selecionado === opcao ||
            selecionado === nome ||
            (
              matricula &&
              selecionado === normalizar(matricula)
            )
          );
        }
      );

      // N\u00e3o preenche automaticamente se houver
      // dois servidores com identifica\u00e7\u00e3o amb\u00edgua.

      return encontrados.length === 1
        ? encontrados[0]
        : null;
    }

    function preencherCargo() {

      const tipoAtual = campoTipo.value;

      if (
        tipoAtual !== "substituicao" &&
        tipoAtual !== "contratacao"
      ) {
        return;
      }

      const funcionario = localizarServidor();

      if (!funcionario) return;

      const cargo = obterCargo(funcionario);

      if (!cargo) return;

      // Usa o cargo exatamente como est\u00e1 cadastrado.

      if (campoCargo.value !== cargo) {

        campoCargo.value = cargo;

        // Atualiza a pr\u00e9via e o memorando.

        campoCargo.dispatchEvent(
          new Event("input", {
            bubbles: true
          })
        );

        campoCargo.dispatchEvent(
          new Event("change", {
            bubbles: true
          })
        );
      }
    }

    // Informa que o campo ser\u00e1 preenchido automaticamente.

    campoCargo.placeholder =
      "Preenchido pelo cadastro do servidor";

    const blocoCargo = document.getElementById(
      "doc-cargo-bloco"
    );

    if (
      blocoCargo &&
      !document.getElementById("ds-ajuda-cargo")
    ) {

      const ajuda = document.createElement("small");

      ajuda.id = "ds-ajuda-cargo";

      ajuda.style.cssText = `
        display:block;
        margin-top:5px;
        color:#667085;
        font-size:12px;
      `;

      ajuda.textContent =
        "Cargo preenchido automaticamente conforme o cadastro de Funcion\u00e1rios. Pode ser editado.";

      blocoCargo.appendChild(ajuda);
    }

    // Preenche ao selecionar um servidor.

    campoServidor.addEventListener(
      "change",
      preencherCargo
    );

    campoServidor.addEventListener(
      "input",
      preencherCargo
    );

    campoServidor.addEventListener(
      "blur",
      preencherCargo
    );

    // Preenche tamb\u00e9m ao trocar de modelo.

    campoTipo.addEventListener(
      "change",
      preencherCargo
    );

    campoModelo?.addEventListener(
      "change",
      preencherCargo
    );

    preencherCargo();

  };

})();


/* ASSISTENTE DOCUMENTAL LOCAL \u2014 JavaScript, sem API de IA.
   Reda\u00e7\u00e3o por regras e modelos; n\u00e3o \u00e9 um modelo de linguagem treinado.
   N\u00e3o faz requisi\u00e7\u00f5es, n\u00e3o executa comandos do pedido e n\u00e3o grava dados. */
const AssistenteDocumentalLegado = (() => {
  'use strict';
  const TIPOS = ['declaracao-livre', 'declaracao', 'requerimento', 'prorrogacao', 'substituicao',
    'contratacao', 'calendario', 'zeladoria', 'transporte', 'estagio', 'avanco',
    'memorando', 'comparecimento-responsavel'];
  const ASSUNTOS = {
    'declaracao-livre': 'Declaração institucional',
    declaracao: 'Declara\u00e7\u00e3o funcional', requerimento: 'Requerimento administrativo',
    prorrogacao: 'Solicita\u00e7\u00e3o de prorroga\u00e7\u00e3o de contrato',
    substituicao: 'Solicita\u00e7\u00e3o de substitui\u00e7\u00e3o de servidor(a)',
    contratacao: 'Solicita\u00e7\u00e3o de contrata\u00e7\u00e3o de profissional',
    calendario: 'Solicita\u00e7\u00e3o de altera\u00e7\u00e3o do calend\u00e1rio escolar',
    zeladoria: 'Solicita\u00e7\u00e3o de profissionais de zeladoria',
    transporte: 'Solicita\u00e7\u00e3o de transporte para atividade escolar',
    estagio: 'Solicita\u00e7\u00e3o de parecer sobre est\u00e1gio supervisionado',
    avanco: 'Solicita\u00e7\u00e3o de an\u00e1lise sobre avan\u00e7o de n\u00edvel',
    memorando: 'Solicita\u00e7\u00e3o administrativa',
    'comparecimento-responsavel': 'Declara\u00e7\u00e3o de comparecimento'
  };
  const ALIASES = {
    'doc-numero': ['numero do memorando', 'numero do documento', 'memorando numero', 'numero'],
    'doc-data': ['data do documento', 'data de emissao', 'emissao'],
    'doc-assunto': ['assunto'], 'doc-cargo': ['cargo a contratar', 'cargo funcao', 'cargo', 'funcao'],
    'doc-inicio': ['data inicial', 'data de inicio', 'data original', 'inicio', 'data da visita', 'data do recebimento', 'data do acontecimento', 'data do evento'],
    'doc-fim': ['data final', 'data de termino', 'nova data', 'fim', 'termino'],
    'doc-prazo': ['quantidade de dias', 'prazo em dias', 'duracao em dias', 'prazo'],
    'doc-afastamento': ['motivo do afastamento', 'situacao da vaga', 'afastamento', 'licenca'],
    'doc-pedido': ['solicitacao adicional', 'pedido', 'solicitacao', 'objeto', 'fatos', 'fatos a declarar', 'texto a declarar'],
    'doc-motivo': ['justificativa', 'fundamentacao', 'objetivo pedagogico', 'motivo', 'finalidade'],
    'doc-para': ['destinatario', 'para'], 'doc-ac': ['a/c', 'aos cuidados de'],
    'doc-setor': ['coordenadoria', 'setor'],
    'doc-qtd': ['quantidade de profissionais', 'quantidade de serventes'],
    'doc-alunos-num': ['quantidade de alunos', 'quantidade de estudantes', 'numero de estudantes'],
    'doc-anos': ['turmas', 'anos escolares'], 'doc-turno': ['turno'],
    'doc-local': ['local de destino', 'destino da visita', 'local', 'destino'],
    'doc-hora-inicio': ['inicio da visita', 'hora inicial da visita'],
    'doc-hora-fim': ['fim da visita', 'hora final da visita'],
    'doc-saida': ['horario de embarque', 'embarque', 'saida da escola'],
    'doc-retorno': ['horario de retorno', 'retorno'],
    'doc-instituicao': ['instituicao do estagio', 'instituicao', 'fornecedor', 'projeto', 'instituicao responsavel'],
    'doc-horario': ['compatibilidade de horarios', 'horario do estagio'],
    'doc-estudante': ['nome do estudante', 'nome do aluno', 'estudante', 'aluno'],
    'doc-turma-aluno': ['turma do estudante', 'turma do aluno', 'turma'],
    'doc-anexos': ['documentos anexos', 'anexos'],
    'ds-nome': ['nome do responsavel', 'responsavel', 'nome da mae', 'nome do pai'],
    'ds-estudante': ['estudante no comparecimento'],
    'ds-data': ['data do comparecimento', 'data da reuniao'],
    'ds-entrada': ['horario de entrada', 'entrada'], 'ds-saida': ['horario de saida', 'saida'],
    '@tipo': ['tipo de documento', 'tipo', 'modelo'],
    '@principal': ['servidor principal', 'servidor interessado', 'requerente', 'servidor', 'principal'],
    '@titular': ['servidor titular', 'servidor afastado', 'titular', 'afastado'],
    '@substituto': ['servidor substituto', 'profissional sugerido', 'substituto', 'contratado']
  };
  const CAMPOS = new Set(Object.keys(ALIASES).filter(x => !x.startsWith('@')));
  const DATAS = new Set(['doc-data', 'doc-inicio', 'doc-fim', 'ds-data']);
  const HORAS = new Set(['doc-hora-inicio', 'doc-hora-fim', 'doc-saida',
    'doc-retorno', 'ds-entrada', 'ds-saida']);
  const NUMEROS = new Set(['doc-qtd', 'doc-alunos-num', 'doc-prazo']);
  const MESES = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const UNIDADES = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5,
    seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12, treze: 13,
    catorze: 14, quatorze: 14, quinze: 15, dezesseis: 16, dezassete: 17,
    dezessete: 17, dezoito: 18, dezenove: 19, vinte: 20, trinta: 30, quarenta: 40,
    cinquenta: 50, sessenta: 60, setenta: 70, oitenta: 80, noventa: 90, cem: 100,
    cento: 100, duzentos: 200, trezentos: 300, quatrocentos: 400, quinhentos: 500,
    seiscentos: 600, setecentos: 700, oitocentos: 800, novecentos: 900, mil: 1000 };
  const DIA = 86400000;
  const limpo = x => String(x ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, '').trim();
  const norm = x => limpo(x).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const chave = x => norm(x).replace(/[^a-z0-9]+/g, ' ').trim();
  const rx = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const frase = x => {
    const s = limpo(x).replace(/[ \t]+/g, ' ').replace(/[.;:,]+$/, '');
    return s ? s[0].toLocaleUpperCase('pt-BR') + s.slice(1) + '.' : '';
  };
  function textoSeguro(x, max, rotulo) {
    if (typeof x !== 'string' || x.length > max) throw new Error('Confira o tamanho de ' + rotulo + '.');
    if (/<\/?[a-z]|```/i.test(x)) throw new Error('Use somente texto, sem HTML ou blocos de c\u00f3digo, em ' + rotulo + '.');
    return limpo(x);
  }
  function dataValida(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number(s.slice(0, 4)) < 1900 || Number(s.slice(0, 4)) > 2199) return false;
    const t = Date.parse(s + 'T12:00:00Z');
    return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === s;
  }
  const iso = (a, m, d) => `${a}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const br = s => dataValida(s) ? `${s.slice(8)}/${s.slice(5, 7)}/${s.slice(0, 4)}` : s;
  const somarDias = (s, n) => new Date(Date.parse(s + 'T12:00:00Z') + n * DIA).toISOString().slice(0, 10);
  function hojeBrasil() {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date()).map(x => [x.type, x.value]));
    return `${p.year}-${p.month}-${p.day}`;
  }
  function datasNoTexto(texto, hoje) {
    const n = norm(texto), lista = [];
    const adicionar = (m, valor) => {
      if (!dataValida(valor)) throw new Error('Data inv\u00e1lida: ' + m[0] + '. Confira dia, m\u00eas e ano.');
      lista.push({ valor, inicio: m.index, fim: m.index + m[0].length, texto: m[0] });
    };
    for (const m of n.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) adicionar(m, iso(m[1], m[2], m[3]));
    for (const m of n.matchAll(/\b(\d{1,2})[/.](\d{1,2})[/.](\d{4})\b/g)) adicionar(m, iso(m[3], m[2], m[1]));
    const meses = new RegExp('\\b(\\d{1,2})\\s+de\\s+(' + MESES.join('|') + ')\\s+de\\s+(\\d{4})\\b', 'g');
    for (const m of n.matchAll(meses)) adicionar(m, iso(m[3], MESES.indexOf(m[2]) + 1, m[1]));
    if (dataValida(hoje)) for (const m of n.matchAll(/\b(hoje|amanha|ontem)\b/g)) {
      adicionar(m, somarDias(hoje, m[1] === 'amanha' ? 1 : m[1] === 'ontem' ? -1 : 0));
    }
    return lista.sort((a, b) => a.inicio - b.inicio);
  }
  function numero(texto, max = 100000) {
    const t = norm(texto).replace(/\s+dias?(?:\s+corridos?)?$/, '').trim();
    let n;
    if (/^\d+$/.test(t)) n = Number(t);
    else {
      const p = t.split(/\s+/).filter(x => x !== 'e');
      if (!p.length || p.some(x => !Object.hasOwn(UNIDADES, x))) return '';
      let total = 0, grupo = 0, anterior = 3, milhares = false;
      for (const x of p) {
        const v = UNIDADES[x];
        if (v === 1000) {
          if (milhares) return '';
          total += (grupo || 1) * 1000; grupo = 0; anterior = 3; milhares = true;
        } else {
          const ordem = v >= 100 ? 2 : v >= 20 ? 1 : 0;
          if (ordem >= anterior) return '';
          grupo += v; anterior = ordem;
        }
      }
      n = total + grupo;
    }
    return Number.isInteger(n) && n >= 1 && n <= max ? String(n) : '';
  }
  function hora(texto) {
    const n = norm(texto).replace(/^(?:as|a partir das|das)\s+/, '');
    const m = n.match(/^(\d{1,2})(?:(?::|h)(\d{2})?)?(?:\s*horas?)?$/);
    if (!m || Number(m[1]) > 23 || Number(m[2] || 0) > 59) return '';
    return m[1].padStart(2, '0') + ':' + (m[2] || '00');
  }
  function rotulos(texto) {
    const n = norm(texto);
    const mapa = new Map(Object.entries(ALIASES).flatMap(([campo, nomes]) => nomes.map(nome => [nome, campo])));
    const re = new RegExp('(?:^|[\\n;]|[.!?]\\s+|\\s{2,})\\s*(' + [...mapa.keys()].sort((a, b) => b.length - a.length).map(rx).join('|') + ')\\s*:\\s*', 'g');
    const achados = [...n.matchAll(re)], saida = {}, intervalos = [];
    achados.forEach((m, i) => {
      const inicio = m.index + m[0].length;
      const fim = i + 1 < achados.length ? achados[i + 1].index : texto.length;
      const trecho = texto.slice(inicio, fim).split('\n')[0].trim().replace(/;$/, '').trim();
      saida[mapa.get(m[1])] = trecho;
      intervalos.push([m.index, Math.min(fim, inicio + texto.slice(inicio, fim).split('\n')[0].length)]);
    });
    return { valores: saida, intervalos };
  }
  function tipoDoPedido(texto, atual) {
    const n = norm(texto);
    const comparecimentoPais = /\b(?:comparecimento|compareceu|comparecer)\b/.test(n) && /\b(?:responsavel|mae|pai|genitor)\b/.test(n);
    if (!comparecimentoPais && RedacaoLivre.reconhecer(texto)) return { tipo: 'declaracao-livre', reconhecido: true };
    const genero = /^(?:(?:por favor[,]?)\s+)?(?:(?:faca|crie|elabore|prepare|redija|gere|quero)\s+)?(?:um[ae]?\s+)?(declaracao|requerimento)\b/.exec(n)?.[1];
    if (genero === 'requerimento') return { tipo: genero, reconhecido: true };
    if (genero === 'declaracao' && !/(?:comparecimento|declaracao)[^\n.;]{0,90}\b(?:responsavel|mae|pai|genitor)/.test(n)) return { tipo: genero, reconhecido: true };
    const regras = [
      ['comparecimento-responsavel', /(?:comparecimento|declaracao)[^\n.;]{0,90}\b(?:responsavel|mae|pai|genitor)|\b(?:responsavel|mae|pai)\b[^\n.;]{0,90}comparec/],
      ['prorrogacao', /\bprorrog|\brenova\w*[^\n.;]{0,45}contrat/],
      ['calendario', /\bcalendario|\bsabado letivo|\balter\w*[^\n.;]{0,30}dia letivo/],
      ['transporte', /\btransporte|\bonibus|\bexcursao/],
      ['zeladoria', /\bzeladoria|\bserventes?\b/],
      ['estagio', /\bestagio\b/],
      ['avanco', /\bavanco de nivel|\baceleracao[^\n.;]{0,35}(?:aluno|estudante)/],
      ['substituicao', /\bsubstituicao\b|\bsubstituir(?=[^\n.;]{0,90}(?:servidor|profissional|licenca|afastamento))|\bcontratar[^\n.;]{0,100}substituir|\bcobrir[^\n.;]{0,35}(?:licenca|afastamento)/],
      ['contratacao', /\bcontrata|\breposicao de (?:vaga|pessoal)|\bvacancia/],
      ['requerimento', /\brequerimento|\brequerer\b/],
      ['declaracao', /\bdeclaracao|\bdeclarar\b/],
      ['memorando', /\bmemorando\b/]
    ];
    for (const [tipo, re] of regras) {
      const m = re.exec(n);
      if (m && !/\b(?:nao|sem)\s+(?:(?:faca|fazer|quero|solicitar|ha|houve)\s+){0,2}$/.test(n.slice(Math.max(0, m.index - 40), m.index))) return { tipo, reconhecido: true };
    }
    return { tipo: TIPOS.includes(atual) ? atual : 'memorando', reconhecido: atual === 'declaracao-livre' };
  }
  function selecionarPessoas(texto, cadastro, valores, tipo, idsAtuais, avisar, perguntar) {
    const s = ' ' + chave(texto) + ' ';
    const lista = cadastro.map(f => ({ id: limpo(f.id), nome: limpo(f.nome || f.nome_completo),
      matricula: limpo(f.matricula), cargo: limpo(f.cargo || f.cargo_funcao) })).filter(f => f.id && f.nome);
    const porId = id => lista.find(f => f.id === id) || null;
    function localizar(trecho, campo) {
      const t = chave(trecho);
      if (!t) return null;
      const tokens = ' ' + t + ' ';
      let candidatos = lista.filter(f => tokens.includes(' ' + chave(f.nome) + ' '));
      const mats = [...norm(trecho).matchAll(/\bmatricula\s*(?:n[\u00bao\u00b0.]?\s*)?[:#-]?\s*([a-z0-9][a-z0-9./-]*)/g)].map(m => m[1]);
      if (/^[\d./-]+$/.test(limpo(trecho))) mats.push(norm(trecho));
      if (mats.length) {
        const pelaMat = lista.filter(f => mats.includes(norm(f.matricula)));
        if (candidatos.length && pelaMat.length && !pelaMat.some(f => candidatos.some(c => c.id === f.id))) {
          perguntar(campo, 'O nome e a matr\u00edcula informados n\u00e3o correspondem. Confira o cadastro.');
          return null;
        }
        candidatos = candidatos.length ? candidatos.filter(f => pelaMat.some(c => c.id === f.id)) : pelaMat;
      }
      if (!candidatos.length) {
        const ignorar = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
        const dados = t.split(' ').filter(x => !ignorar.has(x));
        if (dados.length >= 2) candidatos = lista.filter(f => {
          const partes = chave(f.nome).split(' ').filter(x => !ignorar.has(x));
          return dados.length <= partes.length && dados.every(x => partes.includes(x));
        });
        if (candidatos.length === 1) avisar('Nome parcial identificado como ' + candidatos[0].nome + '; confira a sele\u00e7\u00e3o.');
      }
      const unicos = [...new Map(candidatos.map(f => [f.id, f])).values()];
      if (unicos.length === 1) return unicos[0];
      if (unicos.length > 1) perguntar(campo, 'H\u00e1 mais de um servidor compat\u00edvel. Selecione o nome com a matr\u00edcula no cadastro.');
      else perguntar(campo, 'N\u00e3o foi poss\u00edvel identificar esse servidor. Informe o nome completo e a matr\u00edcula ou selecione no formul\u00e1rio.');
      return null;
    }
    const obrigatorio = ['declaracao', 'requerimento', 'prorrogacao', 'substituicao', 'contratacao', 'estagio'].includes(tipo);
    let principal = porId(idsAtuais.principal), secundario = porId(idsAtuais.secundario);
    const campoPrim = 'doc-principal', campoSec = 'doc-secundario';
    const prim = valores['@principal'] || (tipo === 'substituicao' ? valores['@titular'] : tipo === 'prorrogacao' ? valores['@substituto'] : '');
    const sec = tipo === 'substituicao' ? valores['@substituto'] : tipo === 'prorrogacao' ? valores['@titular'] : '';
    if (prim) principal = localizar(prim, campoPrim);
    if (sec) secundario = localizar(sec, campoSec);
    const mencoes = lista.filter(f => s.includes(' ' + chave(f.nome) + ' '));
    const n = norm(texto);
    if (!prim && ['declaracao', 'requerimento'].includes(tipo)) {
      const m = /\b(?:declaracao(?: funcional)?|requerimento)\s+(?:para|do|da|de)\s+([^.;\n]+?)(?=,\s*(?:que|pois)|[.;\n]|$)/.exec(n);
      if (m) principal = localizar(m[1], campoPrim);
    }
    if (['substituicao', 'prorrogacao'].includes(tipo)) {
      const m = /\b(?:em substituicao (?:ao|a|do|da)|substituir|servidor(?:a)? afastad[oa])\s*[:,-]?\s*([^.;\n]+)/.exec(n);
      if (m && !/\b(?:nao|sem)\s+(?:(?:ira|vai|ha|houve)\s+)?$/.test(n.slice(Math.max(0, m.index - 25), m.index))) {
        const alvo = localizar(m[1], tipo === 'substituicao' ? campoPrim : campoSec);
        if (tipo === 'substituicao' && !prim) principal = alvo;
        if (tipo === 'prorrogacao' && !sec) secundario = alvo;
      }
      if (tipo === 'prorrogacao' && !prim) {
        const m2 = /\bcontrato\s+(?:d[oa]\s+)?(?:(?:servidor|servidora|profissional)\s+)?([^.;\n]+?)(?=\s+em substituicao|[.;\n]|$)/.exec(n);
        if (m2) principal = localizar(m2[1], campoPrim);
      }
      if (tipo === 'substituicao' && !sec) {
        const m2 = /\b(?:indicamos|indicar|sugerimos|sugerir|contratar)\s+(?:(?:o|a)\s+)?(?:(?:servidor|servidora|profissional)\s+)?([^.;\n]+?)(?=\s+para substituir|\s+em substituicao|[.;\n]|$)/.exec(n);
        if (m2) secundario = localizar(m2[1], campoSec);
      }
    }
    if (!principal && !prim && obrigatorio) {
      const restantes = mencoes.filter(f => f.id !== secundario?.id);
      if (restantes.length === 1) principal = localizar(restantes[0].nome, campoPrim);
      else if (restantes.length > 1) {
        if (new Set(restantes.map(f => chave(f.nome))).size === 1) principal = localizar(restantes[0].nome, campoPrim);
        else perguntar(campoPrim, 'Identifique quem \u00e9 o servidor principal e quem \u00e9 o titular ou substituto.');
      }
      else {
        const m = /\bmatricula\s*(?:n[\u00bao\u00b0.]?\s*)?[:#-]?\s*([a-z0-9][a-z0-9./-]*)/.exec(n);
        if (m && !sec) principal = localizar('matricula ' + m[1], campoPrim);
      }
    }
    if (principal && secundario && principal.id === secundario.id) throw new Error('O servidor principal e o secund\u00e1rio devem ser pessoas diferentes.');
    return { principal, secundario };
  }
  function revisar(texto, acao, cadastro = [], campos = {}) {
    let t = textoSeguro(texto, 24000, 'texto do documento');
    if (!t) throw new Error('Escreva ou prepare o documento antes de revisar.');
    const protecoes = [];
    const guardar = valor => { const i = protecoes.push(valor) - 1; return `\uE000${String.fromCharCode(0xE100 + (i >>> 8), 0xE100 + (i & 255))}\uE001`; };
    // Protege nomes, identificadores, datas, quantidades e trechos entre aspas.
    const nomes = [...cadastro.map(f => limpo(f.nome || f.nome_completo)),...['doc-pessoa','doc-responsavel-amplo','doc-projeto','doc-identificacao'].map(id=>limpo(campos[id]))].filter(Boolean).sort((a, b) => b.length - a.length);
    if (nomes.length) t = t.replace(new RegExp(nomes.map(rx).join('|'), 'gi'), guardar);
    t = t.replace(/\[[^\]]*\]|\{\{[^}]*\}\}|https?:\/\/\S+|\b[^\s@]+@[^\s@]+\.[^\s@]+\b|[\u201c"][^\u201d"\n]+[\u201d"]|\b\d[\d./:,-]*\b/g, guardar);
    const trocas = [
      [/\bvenho,?\s+por meio deste,?\s+requerer\b/gi, 'requeiro'],
      [/\bvimos,?\s+por meio deste,?\s+solicitar\b/gi, 'solicitamos'],
      [/\bvimos,?\s+respeitosamente,?\s+solicitar\b/gi, 'solicitamos'],
      [/\ba fim de\b/gi, 'para'], [/\bcom a finalidade de\b/gi, 'para'],
      [/\bno sentido de\b/gi, 'para'], [/\bneste momento atual\b/gi, 'neste momento'],
      [/\batravez\b/gi, 'atrav\u00e9s'], [/\bexcessao\b/gi, 'exce\u00e7\u00e3o'],
      [/\bnescessidade\b/gi, 'necessidade'], [/\bsolicita\u00e7ao\b/gi, 'solicita\u00e7\u00e3o']
    ];
    if (acao === 'formalizar') trocas.push([/\ba gente solicita\b/gi, 'solicitamos'],
      [/\bpra\b/gi, 'para'], [/\bpro\b/gi, 'para o']);
    if (acao !== 'resumir') trocas.push(
      [/(^|\n\s*\n)(?:a gente precisa de|precisamos de|estamos precisando de|gostar[ií]amos de pedir|gostaria de pedir|venho pedir)\s+/gi, '$1Solicitamos '],
      [/\bapartir\b/gi, 'a partir'], [/\ba partir da data de\b/gi, 'a partir de'],
      [/\bcontinuidade de atividades administrativas\b/gi, 'continuidade das atividades administrativas'],
      [/\bpra\b/gi, 'para'], [/\bpro\b/gi, 'para o'], [/\bt[aá](?=\s)/gi, 'está'],
      [/(^|\n\s*\n)(?:pedimos|solicitamos)\s+(?:que\s+)?(?:arrumem|consertem|reparem)\s+(o|a|os|as)\s+/gi, (_m,borda,a)=>borda+'Solicitamos o reparo '+({o:'do',a:'da',os:'dos',as:'das'}[a.toLowerCase()])+' ']
    );
    if (acao === 'formalizar') trocas.push(
      [/(^|\n\s*\n)Solicitamos a renova[cç][aã]o do contrato\b/gi, '$1Solicitamos a análise e a adoção das providências administrativas necessárias à renovação do contrato'],
      [/(^|\n\s*\n)A gente informa\b/gi, '$1Informamos'],
      [/(^|\n\s*\n)A gente pede\b/gi, '$1Solicitamos'],
      [/(^|\n\s*\n)Informações complementares:\s*/gi, '$1Informações adicionais: ']
    );
    for (const [re, v] of trocas) t = t.replace(re, v);
    t = t.replace(/[ \t]+/g, ' ').replace(/ +([,;.!?])/g, '$1').replace(/\n{3,}/g, '\n\n');
    let partes = t.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    if (acao === 'resumir') partes = [...new Set(partes)];
    t = partes.map(p => p[0]?.toLocaleUpperCase('pt-BR') + p.slice(1)).join('\n\n');
    t = t.replace(/\uE000([\s\S])([\s\S])\uE001/g, (m, a, b) => protecoes[((a.charCodeAt(0) - 0xE100) << 8) + b.charCodeAt(0) - 0xE100] ?? m);
    if (acao === 'resumir') t = [...new Set(t.split(/\n\s*\n/))].join('\n\n');
    return t;
  }
  function preparar(entrada) {
    if (!entrada || typeof entrada !== 'object') throw new Error('Pedido inv\u00e1lido.');
    const acao = entrada.acao || 'gerar';
    if (!['gerar', 'complementar', 'melhorar', 'resumir', 'formalizar'].includes(acao)) throw new Error('A\u00e7\u00e3o n\u00e3o reconhecida.');
    const pedido = textoSeguro(entrada.pedido || '', 12000, 'pedido');
    const referencia = textoSeguro(entrada.referencia || '', 16000, 'refer\u00eancia');
    const cadastro = Array.isArray(entrada.funcionarios) ? entrada.funcionarios : [];
    const contexto = entrada.contexto || {}, base = contexto.campos || {};
    const avisos = [], perguntas = [], dados = Object.create(null), alterados = new Set();
    const avisar = s => { if (!avisos.includes(s) && avisos.length < 12) avisos.push(s); };
    const perguntar = (campo, pergunta) => {
      if (!perguntas.some(q => q.campo === campo && q.pergunta === pergunta) && perguntas.length < 12) perguntas.push({ campo, pergunta });
    };
    const retornar = (tipo, texto, pessoas, resumo) => {
      const paragrafos = texto.split(/\n\s*\n/).map(limpo).filter(Boolean);
      if (!paragrafos.length || paragrafos.length > 18 || paragrafos.some(p => p.length > 12000) || paragrafos.reduce((s, p) => s + p.length, 0) > 24000) throw new Error('O texto ficou longo. Reduza o pedido ou a refer\u00eancia antes de preparar.');
      const campos = Object.fromEntries(Object.entries(dados).filter(([id]) => CAMPOS.has(id)));
      for (const id of ['doc-para', 'doc-ac', 'doc-setor']) if (!alterados.has(id)) delete campos[id];
      const idAtual = id => cadastro.some(f => limpo(f.id) === id) ? id : '';
      return { tipo, campos, principal_id: Object.hasOwn(pessoas, 'principal') ? pessoas.principal?.id || '' : idAtual(entrada.principal_id || ''),
        secundario_id: Object.hasOwn(pessoas, 'secundario') ? pessoas.secundario?.id || '' : idAtual(entrada.secundario_id || ''),
        paragrafos, perguntas, avisos, resumo };
    };
    for (const [id, valor] of Object.entries(base)) if (CAMPOS.has(id) && typeof valor === 'string') dados[id] = textoSeguro(valor, 16000, 'campo ' + id);
    if (['melhorar', 'resumir', 'formalizar'].includes(acao)) {
      const original = textoSeguro(entrada.modelo_base || '', 24000, 'texto do documento');
      const texto = revisar(original, acao, cadastro, base);
      avisar(acao === 'resumir' ? 'A redu\u00e7\u00e3o \u00e9 conservadora: preserva as informa\u00e7\u00f5es e encurta express\u00f5es de reda\u00e7\u00e3o.' : 'A revis\u00e3o local aplica ajustes limitados de reda\u00e7\u00e3o. Confira a gram\u00e1tica e os fatos.');
      if (texto === original) avisar('N\u00e3o encontrei ajustes autom\u00e1ticos seguros para esse texto. Voc\u00ea pode edit\u00e1-lo no formul\u00e1rio.');
      return retornar(TIPOS.includes(contexto.tipo) ? contexto.tipo : 'memorando', texto, {}, 'Revis\u00e3o local conclu\u00edda.');
    }
    if (!pedido) throw new Error('Descreva o documento ou o complemento.');
    const extraido = rotulos(pedido), valores = extraido.valores;
    const semRotulos = pedido.split('').map((c, i) => extraido.intervalos.some(([a, b]) => i >= a && i < b) ? (c === '\n' ? '\n' : ' ') : c).join('').trim();
    const natural = norm(semRotulos);
    const tipoExplicito = valores['@tipo'] ? tipoDoPedido(valores['@tipo'], contexto.tipo) : null;
    const escolha = tipoExplicito?.reconhecido ? tipoExplicito : tipoDoPedido(semRotulos, contexto.tipo);
    let tipo = acao === 'complementar' ? contexto.tipo : escolha.tipo;
    if (acao === 'gerar' && !escolha.reconhecido) {
      tipo = 'memorando';
      avisar('N\u00e3o reconheci um modelo espec\u00edfico. Preparei um memorando livre com o texto fornecido; confira a adapta\u00e7\u00e3o.');
    }
    if (!TIPOS.includes(tipo)) tipo = 'memorando';
    if (acao === 'complementar' && escolha.reconhecido && escolha.tipo !== tipo && escolha.tipo !== 'memorando') avisar('O complemento manteve o modelo atual. Use Preparar documento para iniciar outro tipo.');
    const hoje = dataValida(entrada.hoje || '') ? entrada.hoje : hojeBrasil();
    function gravar(id, valor) {
      let v = limpo(valor);
      if (!v) return;
      if (DATAS.has(id)) {
        const d = datasNoTexto(v, hoje);
        if (d.length !== 1) throw new Error('Informe uma data completa e v\u00e1lida em ' + id + '.');
        v = d[0].valor;
      }
      if (HORAS.has(id)) { v = hora(v); if (!v) throw new Error('Hor\u00e1rio inv\u00e1lido em ' + id + '. Use HH:MM.'); }
      if (NUMEROS.has(id)) { v = numero(v, id === 'doc-prazo' ? 3650 : 100000); if (!v) throw new Error('Quantidade inv\u00e1lida em ' + id + '.'); }
      if (id === 'doc-numero') {
        if (!/^\d{1,8}(?:\s*\/\s*\d{4})?$/.test(v)) throw new Error('Informe o n\u00famero do memorando com at\u00e9 8 algarismos e, opcionalmente, o ano.');
        const ano = v.match(/\/\s*(\d{4})$/)?.[1];
        if (ano && ano !== (dados['doc-data'] || hoje).slice(0, 4)) avisar('Confira o ano do memorando e a data de emiss\u00e3o.');
        v = v.split('/')[0].trim();
      }
      dados[id] = v; alterados.add(id);
    }
    for (const [id, v] of Object.entries(valores)) if (CAMPOS.has(id)) gravar(id, v);
    if (tipo === 'declaracao-livre') {
      const plano = RedacaoLivre.preparar({ pedido, referencia, campos: dados, hoje });
      Object.assign(dados, plano.campos);
      plano.perguntas.forEach(q => perguntar(q.campo, q.pergunta));
      plano.avisos.forEach(avisar);
      return retornar(tipo, plano.paragrafos.join('\n\n'), { principal: null, secundario: null }, plano.resumo);
    }
    const datas = datasNoTexto(semRotulos, hoje);
    if (/\b(?:hoje|amanha|ontem)\b/.test(natural)) avisar('Datas relativas foram interpretadas no hor\u00e1rio de Bras\u00edlia. Confira as datas preenchidas.');
    if (/\b\d{1,2}\/\d{1,2}(?![\d/])\b/.test(natural.replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, ''))) avisar('H\u00e1 uma data sem ano. Informe dia, m\u00eas e ano para evitar ambiguidade.');
    if (tipo === 'comparecimento-responsavel') {
      if (!alterados.has('ds-data') && datas.length === 1) gravar('ds-data', datas[0].valor);
      else if (datas.length > 1) perguntar('ds-data', 'Informe a data do comparecimento no campo pr\u00f3prio.');
    } else if (['prorrogacao', 'substituicao', 'calendario', 'contratacao', 'transporte'].includes(tipo)) {
      if (datas.length <= 2) {
        for (let i = 0; i < datas.length; i++) {
          const d = datas[i], antes = natural.slice(Math.max(0, d.inicio - 55), d.inicio);
          let id = /(?:ate|termino(?: previsto)?(?: em)?|fim(?: em)?|prorrogar ate)\s*$/.test(antes) ? 'doc-fim' : 'doc-inicio';
          if (tipo === 'calendario' && i === 1) id = 'doc-fim';
          else if (i === 1 && tipo !== 'transporte') id = 'doc-fim';
          if (!alterados.has(id)) gravar(id, d.valor);
        }
      } else perguntar('doc-inicio', 'O pedido cont\u00e9m v\u00e1rias datas. Identifique Data inicial e Data final com esses r\u00f3tulos.');
    }
    const palavrasNumeros = Object.keys(UNIDADES).sort((a, b) => b.length - a.length).join('|');
    const numeroPalavra = '(?:\\d+|(?:' + palavrasNumeros + ')(?:\\s+(?:e\\s+)?(?:' + palavrasNumeros + ')){0,7})';
    const prazo = new RegExp('\\b(?:por|durante|periodo de|prazo de)\\s+(' + numeroPalavra + ')\\s+dias?(?!\\w)', 'g');
    const prazos = [...natural.matchAll(prazo)];
    const uteis = /\bdias? uteis\b|\bmeses\b|\bmes\b/.test(natural) || /\buteis\b|\bmes(?:es)?\b/.test(norm(valores['doc-prazo'] || ''));
    if (uteis) avisar('N\u00e3o calculei dias \u00fateis ou meses automaticamente. Informe as datas completas; feriados e regras do per\u00edodo precisam de confer\u00eancia.');
    if (!alterados.has('doc-prazo') && prazos.length === 1 && !uteis && ['prorrogacao', 'substituicao'].includes(tipo)) gravar('doc-prazo', prazos[0][1]);
    else if (prazos.length > 1) perguntar('doc-prazo', 'H\u00e1 mais de um prazo no pedido. Informe o per\u00edodo solicitado no campo pr\u00f3prio.');
    if (['prorrogacao', 'substituicao'].includes(tipo)) {
      const inicio = dados['doc-inicio'], dias = Number(dados['doc-prazo']);
      if (alterados.has('doc-prazo') && !alterados.has('doc-fim') && dataValida(inicio) && !uteis) {
        dados['doc-fim'] = somarDias(inicio, dias - 1);
        avisar('Per\u00edodo calculado em dias corridos, incluindo o primeiro e o \u00faltimo dia.');
      }
      const fim = dados['doc-fim'];
      if (dataValida(inicio) && dataValida(fim)) {
        const n = Math.round((Date.parse(fim + 'T12:00:00Z') - Date.parse(inicio + 'T12:00:00Z')) / DIA) + 1;
        if (n < 1 || n > 3650) throw new Error('Confira a ordem das datas e o limite de 3650 dias.');
        if (alterados.has('doc-prazo') && dias !== n) throw new Error('O prazo informado n\u00e3o corresponde \u00e0s duas datas. Confira o per\u00edodo.');
        dados['doc-prazo'] = String(n);
      }
    }
    const intervaloHora = /\b(?:das|de)\s*(\d{1,2}(?:(?::|h)\d{2})?h?)\s*(?:as|a|ate(?: as)?)\s*(\d{1,2}(?:(?::|h)\d{2})?h?)\b/.exec(natural);
    if (intervaloHora) {
      const ids = tipo === 'comparecimento-responsavel' ? ['ds-entrada', 'ds-saida'] : ['doc-hora-inicio', 'doc-hora-fim'];
      if (['comparecimento-responsavel', 'transporte'].includes(tipo)) ids.forEach((id, i) => { if (!alterados.has(id)) gravar(id, intervaloHora[i + 1]); });
    }
    if (tipo === 'transporte') {
      const q = new RegExp('\\b(' + numeroPalavra + ')\\s+(?:alunos?|estudantes?)\\b').exec(natural);
      if (q && !alterados.has('doc-alunos-num')) gravar('doc-alunos-num', q[1]);
      for (const [id, re] of [['doc-saida', /\b(?:embarque|saida)(?: da escola)?\s*(?:as|a partir das|:)?\s*(\d{1,2}(?:(?::|h)\d{2})?h?)\b/], ['doc-retorno', /\bretorno\s*(?:previsto)?\s*(?:as|a partir das|:)?\s*(\d{1,2}(?:(?::|h)\d{2})?h?)\b/]]) {
        const m = re.exec(natural); if (m && !alterados.has(id)) gravar(id, m[1]);
      }
      const turno = /\b(matutino|vespertino|noturno|integral)\b/.exec(natural);
      if (turno && !alterados.has('doc-turno')) gravar('doc-turno', turno[1]);
      const destino = /\b(?:com destino (?:a|ao)|para (?:o|a) (?:museu|parque)|visita (?:ao|a))\s*([^.;\n]+?)(?=,|\s+(?:no dia|em \d|com \d|das \d|para realizar)|$)/.exec(natural);
      if (destino && !alterados.has('doc-local')) {
        const inicio = destino.index + destino[0].length - destino[1].length;
        gravar('doc-local', semRotulos.slice(inicio, inicio + destino[1].length));
      }
    }
    if (tipo === 'zeladoria' && !alterados.has('doc-qtd')) {
      const m = new RegExp('\\b(' + numeroPalavra + ')\\s+(?:serventes?|profissionais|zeladores?)\\b').exec(natural);
      if (m) gravar('doc-qtd', m[1]);
    }
    if (!dados['doc-afastamento']) {
      for (const [re, nome] of [[/\breadaptacao\b/, 'readapta\u00e7\u00e3o'], [/\blicenca[ -]maternidade\b/, 'licen\u00e7a-maternidade'],
        [/\blicenca para tratamento de saude\b|\blts\b/, 'licen\u00e7a para tratamento de sa\u00fade (LTS)'], [/\blicenca[ -]paternidade\b/, 'licen\u00e7a-paternidade']]) {
        const m = re.exec(natural);
        if (m && !/\b(?:nao|sem)\b[^.;\n]{0,35}$/.test(natural.slice(Math.max(0, m.index - 45), m.index))) { gravar('doc-afastamento', nome); break; }
      }
    }
    const pessoas = selecionarPessoas(semRotulos, cadastro, valores, tipo, {
      principal: entrada.principal_id || '', secundario: entrada.secundario_id || ''
    }, avisar, perguntar);
    if (pessoas.principal && !dados['doc-cargo']) dados['doc-cargo'] = pessoas.principal.cargo;
    if (tipo === 'comparecimento-responsavel' && !dados['ds-nome']) {
      const m = /\b(?:respons[a\u00e1]vel|m[a\u00e3]e|pai)\s+([\p{L}][\p{L}'\u2019 -]+?)(?=\s+(?:compareceu|esteve|no dia|das|em \d)|[,.;\n]|$)/iu.exec(semRotulos);
      if (m) gravar('ds-nome', m[1]);
    }
    if (tipo === 'comparecimento-responsavel' && dados['doc-estudante']) dados['ds-estudante'] = dados['doc-estudante'];
    const justificativa = /(?:\bjustificativa\s*:?|\bporque\s+|\bpois\s+|\bpara garantir\s+|\ba fim de\s+)([^\n]+)$/i.exec(semRotulos);
    if (!alterados.has('doc-motivo') && justificativa) {
      const prefixo = /^para garantir/i.test(justificativa[0]) ? 'garantir ' : '';
      gravar('doc-motivo', prefixo + justificativa[1].replace(/[.;]+$/, ''));
    }
    if (referencia) avisar('A refer\u00eancia foi mantida como informa\u00e7\u00e3o complementar; o assistente local n\u00e3o verifica a veracidade desse texto.');
    const precisar = (id, nome) => {
      if (dados[id]) return dados[id];
      perguntar(id, 'Informe: ' + nome + '.');
      return '[INFORMAR ' + nome.toLocaleUpperCase('pt-BR') + ']';
    };
    const servidor = f => {
      if (!f) { perguntar('doc-principal', 'Selecione o servidor correto no cadastro.'); return '[INFORMAR SERVIDOR E MATR\u00cdCULA]'; }
      if (!f.matricula) perguntar('doc-principal', 'Confira a matr\u00edcula no cadastro do servidor.');
      if (!f.cargo) perguntar('doc-cargo', 'Confira o cargo/fun\u00e7\u00e3o do servidor.');
      return `${f.nome}, matr\u00edcula n\u00ba ${f.matricula || '[INFORMAR MATR\u00cdCULA]'}${f.cargo ? ', ' + f.cargo : ''}`;
    };
    const periodo = () => {
      const ini = precisar('doc-inicio', tipo === 'calendario' ? 'data original' : 'data inicial');
      const fim = precisar('doc-fim', tipo === 'calendario' ? 'nova data proposta' : 'data final');
      return `de ${br(ini)} a ${br(fim)}${dados['doc-prazo'] ? ` (${dados['doc-prazo']} dias corridos, incluindo in\u00edcio e fim)` : ''}`;
    };
    const motivo = () => frase(precisar('doc-motivo', tipo === 'transporte' ? 'objetivo pedag\u00f3gico' : 'justificativa'));
    const pedidoLivre = () => {
      if (dados['doc-pedido']) return dados['doc-pedido'];
      let s = semRotulos.replace(/^\s*(?:por favor[, ]*|preciso que\s+)?(?:faca|fa\u00e7a|crie|elabore|prepare|redija|gere)\s+(?:um[ae]?\s+)?(?:memorando|requerimento|documento|oficio|of\u00edcio)\s*(?:personalizado|livre)?\s*(?:para\s+)?/i, '').trim();
      s = s.replace(/\s*(?:Justificativa\s*:|porque\s+|pois\s+)[\s\S]*$/i, '').trim();
      if (!s || /^(?:memorando|documento|requerimento)[.!]?$/i.test(s)) return precisar('doc-pedido', 'pedido');
      return s;
    };
    const solicitar = s => {
      const atos = [
        [/^(?:comunique|comunicar|comunicando|comunico)\s+/i, 'Comunicamos '],
        [/^(?:informe|informar|informando|informo)\s+/i, 'Informamos '],
        [/^(?:encaminhe|encaminhar|encaminhando|encaminho)\s+/i, 'Encaminhamos '],
        [/^(?:convocar|convoque|convocando|convoco)\s+/i, 'Convocamos ']
      ];
      for (const [re, v] of atos) if (re.test(limpo(s))) return frase(limpo(s).replace(re, v));
      const t = limpo(s).replace(/^(?:solicite|solicitar|solicitando|solicito|pedir|peca|pe\u00e7a)\s+/i, '');
      if (t !== s) return frase('Solicitamos ' + t);
      if (/^solicitamos\b/i.test(t)) return frase(t);
      if (/^(?:a|o|que|os|as|um|uma)\s+/i.test(t)) return frase('Solicitamos ' + t);
      return frase('Apresentamos a seguinte demanda para an\u00e1lise: ' + t);
    };
    let partes;
    switch (tipo) {
      case 'declaracao':
        partes = [`Declaramos, para os devidos fins, que ${servidor(pessoas.principal)} consta no cadastro funcional desta unidade escolar, E.M. Prof.\u00aa Eunice Carneiro.`,
          dados['doc-motivo'] ? 'Finalidade informada: ' + frase(dados['doc-motivo']) : 'A presente declara\u00e7\u00e3o \u00e9 expedida a pedido da pessoa interessada, com base nas informa\u00e7\u00f5es do cadastro e sujeita \u00e0 confer\u00eancia dos registros funcionais.'];
        break;
      case 'requerimento':
        dados['doc-pedido'] = pedidoLivre();
        partes = [`Eu, ${servidor(pessoas.principal)}, venho, respeitosamente, apresentar o seguinte requerimento: ${frase(dados['doc-pedido'])}`,
          motivo(), 'Solicito a an\u00e1lise do pedido e as provid\u00eancias administrativas cab\u00edveis.', 'Nestes termos, pe\u00e7o deferimento.'];
        break;
      case 'prorrogacao':
        partes = [`Solicitamos a an\u00e1lise da prorroga\u00e7\u00e3o do contrato de ${servidor(pessoas.principal)}, para o per\u00edodo ${periodo()}.`];
        if (pessoas.secundario) partes.push(`A atua\u00e7\u00e3o em substitui\u00e7\u00e3o refere-se a ${servidor(pessoas.secundario)}. Situa\u00e7\u00e3o informada para o afastamento: ${frase(precisar('doc-afastamento', 'motivo do afastamento'))}`);
        partes.push('Justificativa: ' + motivo(), 'Solicitamos a an\u00e1lise e as provid\u00eancias administrativas cab\u00edveis.');
        break;
      case 'substituicao':
        partes = [`Solicitamos a contrata\u00e7\u00e3o de profissional para o cargo/fun\u00e7\u00e3o de ${precisar('doc-cargo', 'cargo/fun\u00e7\u00e3o a contratar')}, em substitui\u00e7\u00e3o a ${servidor(pessoas.principal)}.`,
          `Situa\u00e7\u00e3o informada para o afastamento: ${frase(precisar('doc-afastamento', 'motivo do afastamento'))} Per\u00edodo informado: ${periodo()}.`];
        if (pessoas.secundario) partes.push(`Indicamos para an\u00e1lise o nome de ${servidor(pessoas.secundario)}, sujeito aos procedimentos administrativos de contrata\u00e7\u00e3o.`);
        partes.push('Justificativa: ' + motivo(), 'Solicitamos a an\u00e1lise e as provid\u00eancias cab\u00edveis.');
        break;
      case 'contratacao':
        partes = [`Solicitamos a an\u00e1lise da contrata\u00e7\u00e3o de profissional para o cargo/fun\u00e7\u00e3o de ${precisar('doc-cargo', 'cargo/fun\u00e7\u00e3o a contratar')}, para atendimento \u00e0 demanda desta unidade escolar.`];
        if (pessoas.principal) partes.push('Servidor relacionado \u00e0 situa\u00e7\u00e3o da vaga: ' + frase(servidor(pessoas.principal)));
        if (dados['doc-inicio']) partes.push('Data informada para a ocorr\u00eancia: ' + br(dados['doc-inicio']) + '.');
        if (dados['doc-afastamento']) partes.push('Situa\u00e7\u00e3o informada da vaga: ' + frase(dados['doc-afastamento']));
        partes.push('Justificativa: ' + motivo(), 'Solicitamos a an\u00e1lise da demanda e as provid\u00eancias administrativas cab\u00edveis.');
        break;
      case 'calendario':
        partes = [`Solicitamos autoriza\u00e7\u00e3o para alterar a data prevista no calend\u00e1rio escolar, ${br(precisar('doc-inicio', 'data original'))}, propondo sua realiza\u00e7\u00e3o em ${br(precisar('doc-fim', 'nova data proposta'))}.`,
          'Justificativa: ' + motivo(), 'A proposta fica sujeita \u00e0 an\u00e1lise e \u00e0 autoriza\u00e7\u00e3o do setor respons\u00e1vel, com confer\u00eancia do calend\u00e1rio e da carga hor\u00e1ria.'];
        break;
      case 'zeladoria':
        partes = [`Solicitamos a disponibiliza\u00e7\u00e3o de ${precisar('doc-qtd', 'quantidade de profissionais')} profissional(is) de zeladoria para atender \u00e0s necessidades desta unidade escolar.`,
          'Justificativa: ' + motivo()];
        if (dados['doc-pedido']) partes.push('Solicita\u00e7\u00e3o adicional: ' + frase(dados['doc-pedido']));
        partes.push('Solicitamos a an\u00e1lise da demanda e as provid\u00eancias cab\u00edveis.');
        break;
      case 'transporte':
        partes = [`Solicitamos transporte para ${precisar('doc-alunos-num', 'quantidade de estudantes')} estudante(s) das turmas ${precisar('doc-anos', 'turmas/anos')}, no dia ${br(precisar('doc-inicio', 'data da visita'))}, com destino a ${precisar('doc-local', 'local de destino')}${dados['doc-turno'] ? ', no turno ' + dados['doc-turno'] : ''}.`,
          `Embarque na escola \u00e0s ${precisar('doc-saida', 'hor\u00e1rio de embarque')}, com retorno previsto \u00e0s ${precisar('doc-retorno', 'hor\u00e1rio de retorno')}.`];
        if (dados['doc-hora-inicio'] || dados['doc-hora-fim']) partes.push(`A visita est\u00e1 prevista das ${precisar('doc-hora-inicio', 'in\u00edcio da visita')} \u00e0s ${precisar('doc-hora-fim', 'fim da visita')}.`);
        partes.push('Objetivo pedag\u00f3gico: ' + motivo(), 'Solicitamos a an\u00e1lise e a confirma\u00e7\u00e3o da disponibilidade do transporte.');
        break;
      case 'estagio':
        partes = [`Solicitamos an\u00e1lise e parecer sobre a possibilidade de ${servidor(pessoas.principal)} realizar est\u00e1gio supervisionado${dados['doc-instituicao'] ? ' na institui\u00e7\u00e3o ' + dados['doc-instituicao'] : ''}.`,
          'Justificativa e contexto: ' + motivo()];
        if (dados['doc-horario']) partes.push('Informa\u00e7\u00e3o apresentada sobre hor\u00e1rios: ' + frase(dados['doc-horario']));
        partes.push('Solicitamos orienta\u00e7\u00e3o sobre os requisitos, a compatibilidade de hor\u00e1rios e os procedimentos aplic\u00e1veis, antes de eventual autoriza\u00e7\u00e3o.');
        break;
      case 'avanco':
        partes = [`Solicitamos an\u00e1lise e parecer sobre o pedido de avalia\u00e7\u00e3o para poss\u00edvel avan\u00e7o de n\u00edvel de ${precisar('doc-estudante', 'nome do estudante')}, matriculado(a) na turma ${precisar('doc-turma-aluno', 'turma/ano')}.`,
          'Contextualiza\u00e7\u00e3o fornecida: ' + motivo()];
        if (dados['doc-anexos']) partes.push('Documentos informados como anexos: ' + frase(dados['doc-anexos']));
        partes.push('O encaminhamento fica sujeito \u00e0 avalia\u00e7\u00e3o t\u00e9cnica e \u00e0 an\u00e1lise do setor respons\u00e1vel.');
        break;
      case 'comparecimento-responsavel': {
        const entradaHora = precisar('ds-entrada', 'hor\u00e1rio de entrada'), saidaHora = precisar('ds-saida', 'hor\u00e1rio de sa\u00edda');
        if (dados['ds-entrada'] && dados['ds-saida'] && saidaHora <= entradaHora) throw new Error('A sa\u00edda do comparecimento deve ser posterior \u00e0 entrada.');
        const aluno = dados['ds-estudante'] || limpo(base['ds-estudante']);
        partes = [`Declaramos, para os devidos fins, que ${precisar('ds-nome', 'nome do respons\u00e1vel')} compareceu \u00e0 Escola Municipal Professora Eunice Carneiro, no dia ${br(precisar('ds-data', 'data do comparecimento'))}, no per\u00edodo das ${entradaHora} \u00e0s ${saidaHora}, para tratar de assuntos escolares${aluno ? ', relacionados ao(\u00e0) estudante ' + aluno : ''}.`,
          'A presente declara\u00e7\u00e3o refere-se ao comparecimento informado, sujeito \u00e0 confer\u00eancia nos registros da unidade escolar.'];
        if (dados['doc-motivo']) partes.push('Finalidade informada: ' + frase(dados['doc-motivo']));
        break;
      }
      default:
        dados['doc-pedido'] = pedidoLivre();
        partes = [solicitar(dados['doc-pedido']), motivo(), 'Solicitamos a an\u00e1lise e as provid\u00eancias administrativas cab\u00edveis.'];
    }
    const marcador = 'Informa\u00e7\u00f5es complementares fornecidas:\n';
    if (referencia) partes.push(marcador + referencia);
    else if (acao === 'complementar') {
      const original = limpo(entrada.modelo_base), indice = original.indexOf(marcador);
      if (indice >= 0) partes.push(original.slice(indice));
    }
    dados['doc-assunto'] ||= ASSUNTOS[tipo];
    if (tipo === 'memorando' && !alterados.has('doc-assunto')) avisar('O assunto gen\u00e9rico pode ser ajustado no formul\u00e1rio.');
    if (perguntas.length) avisar('H\u00e1 dados a preencher ou confirmar. Os campos pendentes permanecem destacados no texto.');
    avisar('Confira se todos os detalhes do pedido constam no rascunho. Informa\u00e7\u00f5es fora das regras podem precisar de edi\u00e7\u00e3o manual.');
    return retornar(tipo, partes.join('\n\n'), pessoas, 'Rascunho preparado no navegador.');
  }
  return Object.freeze({ preparar, revisar, versao: '20261023-local-3' });
})();


/* Integra\u00e7\u00e3o do assistente local, inclu\u00edda uma \u00fanica vez. */
const AssistenteDocumentalLocal = Object.freeze({
  preparar: entrada => {
    const pronto = (entrada.acao || 'gerar') === 'gerar' && (!entrada.modelo_escolhido || entrada.modelo_escolhido === 'auto') && /^\s*(?:\*\*)?Declaramos\b/i.test(entrada.pedido || '');
    if (pronto) return AssistenteDocumentalLegado.preparar(entrada);
    return globalThis.AssistenteDocumentalAmplo
      ? AssistenteDocumentalAmplo.preparar(entrada, AssistenteDocumentalLegado)
      : AssistenteDocumentalLegado.preparar(entrada);
  },
  revisar: AssistenteDocumentalLegado.revisar,
  versao: '20261023-amplo-1'
});

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
    'declaracao-livre', 'declaracao', 'requerimento', 'prorrogacao',
    'substituicao', 'contratacao', 'calendario',
    'zeladoria', 'transporte', 'estagio', 'avanco',
    'memorando', 'comparecimento-responsavel'
  ];
  const campos = [
    ...(globalThis.AssistenteDocumentalAmplo?.campos || []),
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
    'ia-extra-pedido',
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
        'declaracao-livre', 'declaracao',
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
            'Este modelo n\u00e3o est\u00e1 dispon\u00edvel no site.'
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
          'Este modelo n\u00e3o est\u00e1 dispon\u00edvel no site.'
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
    await App.requireRoles(["administrador", "secretaria"]);
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
      // O formul\u00e1rio continua dispon\u00edvel.
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
        #ia-extra select {
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          max-width: 100%;
          padding: 9px;
          font: inherit;
        }
        #ia-extra-entendimento {
          overflow-wrap: anywhere;
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
      <h3>Assistente de documentos da escola</h3>
      <div id="ia-local-painel" style="border:1px solid #adc7df;border-radius:9px;padding:12px;margin:12px 0">
        <strong>Prepare o documento pelo seu pedido</strong>
        <p>O modo Rápido interpreta os pedidos conhecidos e monta a minuta sem baixar um modelo de IA. Você pode escrever “memorando número 30” no pedido. Em Complementar pedido, escreva a alteração ou informação nova: “mude o número para 31”, “altere o prazo para 365 dias” ou “deixe o texto mais formal”. Confira os dados identificados e a prévia.</p>
        <label for="ia-local-modo">Como preparar o texto</label>
        <select id="ia-local-modo"><option value="modelos">Rápido — interpretação e modelos locais (recomendado)</option><option value="ia">IA local — redação livre, mais demorada</option></select>
        <div class="ia-botoes"><button type="button" id="ia-local-refinar">Refinar documento com IA</button></div>
        <p>A revisão por IA é opcional e usa o documento atual. O primeiro uso baixa cerca de 630 MB no processador ou alguns GB na GPU; pode levar minutos. O modelo leve pode errar. Confira os fatos antes de emitir.</p>
        <details><summary>Configurar IA de linguagem</summary>
        <label for="ia-local-perfil">Como executar a IA</label>
        <select id="ia-local-perfil"><option value="auto">Automático — escolher para este computador</option><option value="cpu">Qwen3 0.6B — processador, sem GPU</option><option value="leve">Qwen3 1.7B — GPU, menor consumo</option><option value="qualidade">Qwen3 4B — GPU, maior capacidade</option></select>
        <details><summary>Opções de instalação</summary>
          <label for="ia-local-origem">Origem dos arquivos do modelo</label>
          <select id="ia-local-origem"><option value="publica">Baixar os arquivos das fontes oficiais</option><option value="escola">Usar arquivos hospedados pela escola</option></select>
          <p>Use a segunda opção somente se a equipe técnica já instalou os modelos no endereço da escola. Os modelos não acompanham a atualização do site. A geração dos textos acontece neste computador em ambas as opções.</p>
        </details>
        <div class="ia-botoes"><button type="button" id="ia-local-ativar">Preparar IA agora</button><button type="button" id="ia-local-parar">Parar / liberar memória</button></div>
        <div id="ia-local-situacao" role="status" aria-live="polite">Modo rápido disponível. A IA de linguagem só é carregada ao escolher usá-la.</div>
        <progress id="ia-local-progresso" max="1" hidden style="width:100%" aria-label="Download do arquivo do modelo"></progress>
        </details>
        <details><summary>Conversar com a IA</summary>
          <label for="ia-local-pergunta">Pergunta ou pedido livre</label><textarea id="ia-local-pergunta" maxlength="8000" placeholder="Peça uma explicação, ideias ou ajuda com um texto."></textarea>
          <label><input type="checkbox" id="ia-local-incluir" style="width:auto"> Incluir o documento atual como referência</label>
          <div class="ia-botoes"><button type="button" id="ia-local-conversar">Enviar à IA local</button><button type="button" id="ia-local-nova-conversa">Nova conversa</button></div>
          <div id="ia-local-resposta" role="log" aria-live="polite" style="white-space:pre-wrap;margin-top:12px;line-height:1.6"></div>
        </details>
      </div>
      <label for="ia-extra-modelo">Assunto / modelo</label>
      <select id="ia-extra-modelo" style="width:100%;padding:10px"><option value="auto">Identificar pelo pedido</option>${Object.entries(AssistenteDocumentalAmplo.generos).map(([g,n])=>`<optgroup label="${n}">${AssistenteDocumentalAmplo.modelos.filter(m=>m.genero===g).map(m=>`<option value="${m.id}">${m.nome}</option>`).join('')}</optgroup>`).join('')}<optgroup label="MODELOS OFICIAIS DE SERVIDORES"><option value="legado:declaracao">Declaração funcional de servidor</option><option value="legado:requerimento">Requerimento do servidor</option><option value="legado:prorrogacao">Prorrogação de contrato</option><option value="legado:substituicao">Substituição por afastamento</option><option value="legado:contratacao">Contratação / reposição de vaga</option><option value="legado:calendario">Alteração de calendário</option><option value="legado:transporte">Transporte escolar</option><option value="legado:zeladoria">Zeladoria</option><option value="legado:estagio">Estágio de servidor</option><option value="legado:avanco">Parecer sobre avanço de nível</option></optgroup></select>
      <p>Descreva os fatos ou escolha um modelo: recebimento de materiais de um projeto, matrícula de aluno, comparecimento, manutenção e outros assuntos. Alunos e pessoas externas podem ser informados diretamente.</p>
      <p>
        Descreva os fatos e escolha o modo de preparação. Os modelos prontos usam regras locais.
        Use Refinar documento com IA quando quiser uma nova sugestão de redação.
        Confira o resultado antes de emitir. Não há envio do texto para um serviço externo de IA.
      </p>
      <label for="ia-extra-pedido">
        O que voc\u00ea precisa?
      </label>
      <p>Voc\u00ea pode pedir declara\u00e7\u00f5es sobre projetos, recebimentos,
        acontecimentos e estudantes. Informe o que ocorreu, quando e quem participou.
        Para documentos funcionais, informe o nome completo ou a matr\u00edcula do servidor.
        Tamb\u00e9m pode usar: Fatos:, Data do acontecimento:, Fornecedor:,
        Servidor:, Titular:, Data inicial:, Data final: e Justificativa:.</p>
      <textarea
        id="ia-extra-pedido"
        maxlength="12000"
        placeholder="Ex.: Fa\u00e7a uma declara\u00e7\u00e3o de que a escola recebeu 6 lixeiras para coleta seletiva do Projeto Montesul em 23/10/2026, ap\u00f3s uma palestra. Voc\u00ea tamb\u00e9m pode colar um texto para organizar."
      ></textarea>
      <details>
        <summary>
          Informa\u00e7\u00f5es complementares
        </summary>
        <label for="ia-extra-referencia">
          Informa\u00e7\u00f5es complementares opcionais
        </label>
        <textarea
          id="ia-extra-referencia"
          maxlength="16000"
          placeholder="Cole informa\u00e7\u00f5es confirmadas que devem orientar a reda\u00e7\u00e3o do documento."
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
      <div id="ia-extra-entendimento" role="status" aria-live="polite" style="white-space:pre-line;margin-top:10px" hidden></div>
      <div id="ia-extra-perguntas"></div>
      <button
        type="button"
        id="ia-extra-aplicar"
        hidden
      >
        Aplicar sugest\u00e3o recebida
      </button>
    `;
    const container = textoOriginal.closest('.docs-panel');
    if (!container) return;
    container.prepend(painel);
    const descricao = document.querySelector('.page-header p');
    if(descricao)descricao.textContent='Documentos para alunos, responsáveis, servidores, projetos e outras situações da escola. Escolha um assunto no assistente ou descreva os fatos.';
    if (!$('doc-afastamento')) {
      const bloco = document.createElement('div');
      bloco.className = 'docs-field full';
      bloco.innerHTML = `
        <label for="doc-afastamento">
          Motivo do afastamento / situa\u00e7\u00e3o da vaga
        </label>
        <input
          id="doc-afastamento"
          maxlength="1000"
          placeholder="Ex.: LTS, readapta\u00e7\u00e3o, licen\u00e7a-maternidade"
        >
      `;
      $('doc-inicio')
        ?.closest('.docs-grid')
        ?.appendChild(bloco);
    }
    $('doc-afastamento')?.addEventListener('input', () => {
      $('doc-status').textContent = 'Motivo do afastamento alterado. Confira a reda\u00e7\u00e3o ou use Atualizar texto.';
    });
    let pedidoAnterior = '';
    let controller = null;
    let pendente = null;
    const historico = [];
    const iaLinguagem=()=>valor('ia-local-modo')==='ia';
    let controladorConversa=null;
    let ativacaoIA=null;
    async function garantirIA(signal){
      if(signal?.aborted)throw new DOMException('Operação interrompida.','AbortError');
      if(!globalThis.IAInternaLocal)throw new Error('O módulo de IA não está disponível.');
      if(!ativacaoIA)ativacaoIA=IAInternaLocal.cliente.carregar(valor('ia-local-perfil'),{origem:valor('ia-local-origem'),signal}).finally(()=>{ativacaoIA=null;});
      await ativacaoIA;
      if(signal?.aborted)throw new DOMException('Operação interrompida.','AbortError');
    }
    if(globalThis.IAInternaLocal){
      const local=IAInternaLocal;
      const idsPreferencias=['ia-local-perfil','ia-local-origem','ia-local-modo'];
      // Guarda somente opções de execução; pedidos e dados escolares não são persistidos aqui.
      try{
        const versaoAtual=globalThis.localStorage?.getItem('ia-documentos-preferencias-v3');
        const salvo=JSON.parse(versaoAtual||globalThis.localStorage?.getItem('ia-documentos-preferencias-v2')||'{}');
        for(const id of idsPreferencias){
          if(!versaoAtual&&id==='ia-local-modo')continue;
          if([...$(id).options].some(o=>o.value===salvo[id]))$(id).value=salvo[id];
        }
      }catch{}
      for(const id of idsPreferencias)$(id).addEventListener('change',()=>{try{globalThis.localStorage?.setItem('ia-documentos-preferencias-v3',JSON.stringify(Object.fromEntries(idsPreferencias.map(x=>[x,valor(x)]))));}catch{}});
      local.cliente.observar(s=>{
        if(!$('ia-local-situacao'))return;
        $('ia-local-situacao').textContent=s.detalhe||s.estado;
        $('ia-local-ativar').disabled=['carregando','gerando'].includes(s.estado);
        for(const id of idsPreferencias)$(id).disabled=['carregando','gerando'].includes(s.estado);
        const progresso=$('ia-local-progresso');
        progresso.hidden=s.estado!=='carregando'||!Number.isFinite(s.progresso);
        if(!progresso.hidden)progresso.value=s.progresso;
      });
      $('ia-local-ativar').onclick=async()=>{
        try{await App.requireRoles(['administrador','secretaria']);await garantirIA();$('ia-local-modo').value='ia';}
        catch(e){if(e.name!=='AbortError')$('ia-local-situacao').textContent='A IA não pôde ser preparada. Os modelos prontos continuam disponíveis. '+e.message;}
      };
      $('ia-local-parar').onclick=()=>{controller?.abort();controladorConversa?.abort();local.cliente.descarregar();};
      $('ia-local-refinar').onclick=()=>executar('melhorar','Melhore a redação mantendo os fatos e as alterações do documento atual.',true);
      $('ia-local-conversar').onclick=async()=>{
        if(controladorConversa)return;
        controladorConversa=new AbortController();const atual=controladorConversa;
        $('ia-local-conversar').disabled=true;
        $('ia-local-resposta').textContent='Pensando neste computador…';
        try{
          await App.requireRoles(['administrador','secretaria']);
          await garantirIA(atual.signal);
          const resposta=await local.conversar(valor('ia-local-pergunta'),{signal:atual.signal,documento:$('ia-local-incluir').checked?valor('doc-texto'):''});
          if(!atual.signal.aborted)$('ia-local-resposta').textContent=resposta;
        }catch(e){if(!atual.signal.aborted)$('ia-local-resposta').textContent='Não foi possível responder: '+e.message;}
        finally{controladorConversa=null;$('ia-local-conversar').disabled=false;}
      };
      $('ia-local-nova-conversa').onclick=()=>{controladorConversa?.abort();local.novaConversa();$('ia-local-pergunta').value='';$('ia-local-resposta').textContent='Nova conversa. O histórico anterior foi descartado deste atendimento.';};
      const atualizarOriginal=$('doc-atualizar').onclick;
      $('doc-atualizar').onclick=()=>iaLinguagem()?executar('complementar','Atualize a redação com os dados atuais do formulário. Preserve os demais fatos confirmados e as alterações manuais.'):atualizarOriginal();
    }else{
      $('ia-local-ativar').disabled=true;
      $('ia-local-refinar').disabled=true;
      $('ia-local-situacao').textContent='O módulo de IA de linguagem não foi carregado. Confira se js/ia-local.js foi enviado ao site.';
    }
    const mensagem = texto => {
      if (painel.isConnected) {
        $('ia-extra-status').textContent = texto;
      }
    };
    function mostrarEntendimento(){
      const area=$('ia-extra-entendimento'),modelo=AssistenteDocumentalAmplo.porId(valor('doc-modelo-amplo'));
      const linhas=[modelo?.nome||[...$('doc-tipo').options].find(o=>o.value===valor('doc-tipo'))?.textContent||'Documento escolar'];
      for(const [id,nome]of [['doc-numero','Número'],['doc-para','Destinatário'],['doc-setor','Setor'],['doc-assunto','Assunto'],['doc-pessoa','Pessoa'],['doc-responsavel-amplo','Responsável'],['doc-turma','Turma'],['doc-turno-amplo','Turno'],['doc-data-fato','Data do fato'],['doc-periodo-inicio','Início'],['doc-periodo-fim','Término'],['doc-prazo-amplo','Prazo'],['doc-projeto','Projeto / origem'],['doc-bens','Materiais']]){
        let v=valor(id);if(!v||(!['doc-numero','doc-para','doc-setor','doc-assunto'].includes(id)&&!modelo?.campos.includes(id)))continue;
        if(/^\d{4}-\d{2}-\d{2}$/.test(v))v=v.slice(8)+'/'+v.slice(5,7)+'/'+v.slice(0,4);
        linhas.push(nome+': '+v);
      }
      area.textContent='Dados identificados nos campos:\n'+linhas.join('\n');area.hidden=false;
    }
    const rotulo = f => f.nome + (
      f.matricula
        ? ' \u2014 Matr\u00edcula ' + f.matricula
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
      if(AssistenteDocumentalAmplo.porId(valor('doc-modelo-amplo'))) {
        const c=Object.fromEntries(campos.map(id=>[id,valor(id)]));
        const p=AssistenteDocumentalAmplo.pendencias(c).map(q=>q.pergunta);
        if(!valor('doc-data'))p.push('Informe a data do documento.');
        const g=valor('doc-genero-amplo');
        if(g==='requerimento'&&!valor('doc-pessoa'))p.push('Informe o nome de quem requer.');
        else if(g==='autorizacao'&&!valor('doc-responsavel-amplo'))p.push('Informe quem assina a autorização.');
        else if(!['requerimento','autorizacao'].includes(g)&&(!valor('doc-assinante')||!valor('doc-cargo-assinante')))p.push('Confira os dados do assinante.');
        if(g==='memorando')for(const[id,n]of[['doc-numero','número do memorando'],['doc-para','destinatário'],['doc-setor','setor']])if(!valor(id))p.push('Informe: '+n+'.');
        if(!valor('doc-texto'))p.push('O texto está vazio.');
        if(/\[[^\]]+\]/.test(valor('doc-texto')))p.push('O texto contém dados a preencher.');
        return p;
      }
      const p = [];
      const tipo = tipoAtual();
      const exigir = (id, nome) => {
        if (!valor(id)) {
          p.push('Informe: ' + nome + '.');
        }
      };
      if (tipo === 'comparecimento-responsavel') {
        for (const [id, nome] of [
          ['ds-nome', 'respons\u00e1vel'],
          ['ds-data', 'data do comparecimento'],
          ['ds-entrada', 'entrada'],
          ['ds-saida', 'sa\u00edda'],
          ['ds-assinante', 'assinante'],
          ['ds-cargo', 'cargo do assinante']
        ]) exigir(id, nome);
        if (
          valor('ds-saida') &&
          valor('ds-entrada') &&
          valor('ds-saida') <= valor('ds-entrada')
        ) {
          p.push('Confira os hor\u00e1rios do comparecimento.');
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
        if (!['declaracao-livre', 'declaracao', 'requerimento'].includes(tipo)) {
          exigir('doc-numero', 'n\u00famero do memorando');
          exigir('doc-para', 'destinat\u00e1rio');
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
        if (!['declaracao', 'declaracao-livre'].includes(tipo)) {
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
            'Confira: titular e substituto s\u00e3o a mesma pessoa.'
          );
        }
      }
      if (['prorrogacao', 'substituicao'].includes(tipo) &&
          (tipo === 'substituicao' || pessoa('doc-secundario')) && !valor('doc-afastamento')) {
        p.push('Informe o motivo confirmado do afastamento.');
      }
      if (!valor('doc-texto')) {
        p.push('O texto est\u00e1 vazio.');
      }
      if (/\[[^\]]+\]|\{\{[^}]+\}\}/.test(valor('doc-texto'))) {
        p.push('O texto cont\u00e9m informa\u00e7\u00f5es a preencher.');
      }
      return p;
    }
    function validar(raw) {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !tipos.includes(raw.tipo)) {
        throw new Error(
          'Tipo de documento inv\u00e1lido na resposta.'
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
        if (typeof v !== 'string' || v.length > (id === 'doc-texto-gerado' ? 24000 : 16000)) {
          throw new Error('Campo inv\u00e1lido na resposta.');
        }
        if (
          v &&
          $(id)?.type === 'date' &&
          !dataValida(v)
        ) {
          throw new Error('Data inv\u00e1lida na resposta.');
        }
        if (
          v &&
          $(id)?.type === 'time' &&
          !/^([01]\d|2[0-3]):[0-5]\d$/.test(v)
        ) {
          throw new Error('Hor\u00e1rio inv\u00e1lido na resposta.');
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
          throw new Error('Quantidade inv\u00e1lida na resposta.');
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
            'O servidor indicado n\u00e3o foi localizado no cadastro.'
          );
        }
      }
      if (
        !Array.isArray(raw.paragrafos) ||
        raw.paragrafos.length < 1 || raw.paragrafos.length > 40 ||
        raw.paragrafos.reduce((n,p) => n + (typeof p === "string" ? p.length : 0),0) > 24000 ||
        raw.paragrafos.some(p =>
          typeof p !== 'string' ||
          p.length > 16000 ||
          /<\/?[a-z]|```/i.test(p)
        )
      ) {
        throw new Error(
          'A reda\u00e7\u00e3o recebida deve conter somente texto.'
        );
      }
      return {
        tipo: raw.tipo,
        resumo: typeof raw.resumo === 'string' ? raw.resumo.slice(0, 300) : '',
        principal_id: raw.principal_id ? String(raw.principal_id) : '',
        secundario_id: raw.secundario_id ? String(raw.secundario_id) : '',
        paragrafos: raw.paragrafos,

        campos: dados,
        perguntas: (Array.isArray(raw.perguntas) ? raw.perguntas : [])
          .filter(q =>
            q &&
            formulario.includes(q.campo) &&
            typeof q.pergunta === 'string' && q.pergunta.length <= 1000
          )
          .slice(0, 12),
        avisos: (Array.isArray(raw.avisos) ? raw.avisos : [])
          .filter(x => typeof x === 'string' && x.length <= 1000)
          .slice(0, 12)
      };
    }
    function restaurar(s) {
      mudarTipo(s.tipo);
      for (const [id, v] of Object.entries(s.campos)) {
        if ($(id)) $(id).value = v;
      }
      DocumentosServidoresPage.sincronizarCampos();
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
          if ($(id)) {
            $(id).value = f ? rotulo(f) : '';
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
          DocumentosServidoresPage.sincronizarCampos();
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
      mostrarEntendimento();
      pendente = null;
      $('ia-extra-aplicar').hidden = true;
      perguntas(plano.perguntas);
      const avisos = [
        ...plano.avisos,
        ...pendencias()
      ];
      mensagem([
        'Assistente local: ' +
          (plano.resumo || 'documento preparado.'),
        ...avisos,
        'Confira a pr\u00e9via antes de imprimir ou assinar.'
      ].join('\n'));
    }
    async function consultar(pedido, acao, preservar, signal, forcarIA=false) {
      await App.requireRoles(["administrador", "secretaria"]);
      if (signal.aborted) throw new DOMException('Opera\u00e7\u00e3o interrompida.', 'AbortError');
      const contexto = capturar();
      if (!preservar) {
        contexto.campos = Object.fromEntries(
          Object.entries(contexto.campos).filter(([id]) => fixos.has(id))
        );
      }
      const entrada = {
        pedido, acao, referencia: valor('ia-extra-referencia'), contexto,
        modelo_escolhido: valor('ia-extra-modelo'),
        funcionarios,
        principal_id: preservar ? pessoa('doc-principal')?.id || '' : '',
        secundario_id: preservar ? pessoa('doc-secundario')?.id || '' : '',
        modelo_base: preservar ? valor('doc-texto') : ''
      };
      let plano;
      if(iaLinguagem()||forcarIA){
        let falhaAtivacao='';
        try{await garantirIA(signal);}
        catch(e){if(signal.aborted||e.name==='AbortError')throw e;falhaAtivacao=e.message;}
        if(falhaAtivacao){
          plano=AssistenteDocumentalLocal.preparar(entrada);
          plano.avisos.unshift('A IA não foi carregada. Este rascunho usa os modelos e regras locais. Motivo: '+falhaAtivacao);
        }else plano=await IAInternaLocal.redigir(entrada,{signal});
      }else plano=AssistenteDocumentalLocal.preparar(entrada);
      if (signal.aborted) throw new DOMException('Opera\u00e7\u00e3o interrompida.', 'AbortError');
      return validar(plano);
    }
    async function executar(acao, pedidoExplicito, forcarIA=false) {
      if (controller) return;
      const ajustar = [
        'melhorar',
        'resumir',
        'formalizar'
      ].includes(acao);
      const atual = pedidoExplicito ?? valor('ia-extra-pedido');
      if (!atual && !ajustar && valor('ia-extra-modelo') === 'auto') {
        mensagem('Escreva seu pedido ou complemento.');
        $('ia-extra-pedido').focus();
        return;
      }
      if (ajustar && !valor('doc-texto')) {
        mensagem(
          'Prepare ou escreva o texto antes de ajustar a reda\u00e7\u00e3o.'
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
          'Use Novo pedido e descreva as informa\u00e7\u00f5es necess\u00e1rias.'
        );
        return;
      }
      const antes = JSON.stringify(capturar());
      controller = new AbortController();
      const controle = controller;
      const timeout = setTimeout(
        () => controle.abort(),
        iaLinguagem()||forcarIA ? 2400000 : 45000
      );
      const botoes = painel.querySelectorAll(
        '[data-acao],#ia-extra-novo,' +
        '#ia-extra-desfazer,#ia-extra-aplicar,#ia-local-refinar'
      );
      botoes.forEach(b => b.disabled = true);
      $('ia-extra-cancelar').hidden = false;
      mensagem('Preparando o rascunho no navegador\u2026');
      try {
        const plano = await consultar(
          atual || (ajustar ? 'Ajuste a redação atual.' : ''),
          acao,
          preservar,
          controle.signal,
          forcarIA
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
            'A sugest\u00e3o est\u00e1 pronta. Voc\u00ea alterou o documento ' +
            'durante a consulta. Clique em Aplicar sugest\u00e3o ' +
            'recebida para us\u00e1-la.'
          );
        } else {
          aplicar(plano, preservar);
        }
      } catch (e) {
        mensagem(
          controle.signal.aborted
            ? 'Consulta interrompida. Seu rascunho foi mantido.'
            : 'N\u00e3o foi poss\u00edvel preparar o documento: ' +
              e.message
        );
      } finally {
        clearTimeout(timeout);
        controller = null;
        if (painel.isConnected) {
          botoes.forEach(b => b.disabled = false);
          $('ia-extra-desfazer').disabled =
            !historico.length;
          $('ia-local-refinar').disabled=!globalThis.IAInternaLocal;
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
        'N\u00e3o encontrei pend\u00eancias b\u00e1sicas. ' +
        'Confira os fatos e a pr\u00e9via antes de emitir.'
      );
    };
    $('ia-extra-desfazer').onclick = () => {
      const anterior = historico.pop();
      if (!anterior) return;
      restaurar(anterior);
      mostrarEntendimento();
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
      $('ia-extra-modelo').value = 'auto';
      $('ia-extra-aplicar').hidden = true;
      perguntas();
      mensagem(
        'Descreva o novo documento. O rascunho atual ser\u00e1 ' +
        'mantido at\u00e9 voc\u00ea preparar o pr\u00f3ximo.'
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
        ? 'Assistente local pronto. Confira os dados reconhecidos e a pr\u00e9via antes de emitir.'
        : 'Declara\u00e7\u00f5es institucionais e escolares dispon\u00edveis. Para documentos funcionais, \u00e9 necess\u00e1rio consultar o cadastro de servidores.'
    );
  }
  const iniciarAnterior = DocumentosServidoresPage.init;
  DocumentosServidoresPage.init = async function (...args) {
    await App.requireRoles(["administrador", "secretaria"]);
    await iniciarAnterior.apply(this, args);
    await montar();
  };
  if ($('doc-texto')) {
    montar().catch(console.error);
  }
})();



