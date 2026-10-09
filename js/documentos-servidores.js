/* ====================================================================
  DOCUMENTOS DE SERVIDORES — E.M. PROFª EUNICE CARNEIRO
  Declarações, requerimentos e memorandos com dados do cadastro existente.
  Não grava novos dados nem requer alterações no SQL do Supabase.
  Revise antes de imprimir, assinar ou protocolar.
==================================================================== */
const DocumentosServidoresPage = (() => {
  const S = { funcionarios: [], textoEditado: false, paginaPronta: false };
  const $ = id => document.getElementById(id);

  const BRASAO = "data:image/jpeg;base64,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";
  const MEMO_CSS = '\n/* Página em A4 com o mesmo arranjo da referência da Secretaria. */\n.memo-sheet{box-sizing:border-box;width:210mm;min-height:297mm;padding:38mm 13mm 17mm;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.22;position:relative}\n.memo-header{width:100%;border-collapse:collapse;table-layout:fixed;font-size:10pt;line-height:1.15;margin:0}\n.memo-header td{border:1px solid #222;padding:1.5mm 1mm;vertical-align:middle}\n.memo-header .memo-top td{height:19mm}\n.memo-header .memo-title td{height:4.2mm;text-align:center;font-weight:700;padding:.8mm}\n.memo-header .memo-address td{height:15.4mm}\n.memo-logo{text-align:center}\n.memo-logo img{display:block;width:16mm;height:15.5mm;object-fit:contain;margin:0 auto}\n.memo-school{text-align:center;line-height:1.18}\n.memo-school div{margin:0}\n.memo-school strong{font-size:14pt;font-weight:700;line-height:1.25;display:block}\n.memo-control{text-align:center;vertical-align:top!important;line-height:1.3}\n.memo-control .memo-num{margin-top:5mm}\n.memo-from{vertical-align:middle!important}\n.memo-to{vertical-align:top!important}\n.memo-to .memo-sector{margin-top:5mm}\n.memo-subject{margin:5.2mm 2.5mm 0;font-size:11pt;font-weight:700;line-height:1.3}\n.memo-content{margin:14mm 2.5mm 0;min-height:108.6mm;line-height:1.2;font-size:11pt}\n.memo-content .memo-greeting{margin:0 0 5.2mm}\n.memo-content .memo-paragraph{margin:0 0 5.2mm;text-align:left;white-space:pre-line}\n.memo-content .memo-farewell{margin:5.5mm 0 0}\n.memo-signature{width:112mm;max-width:100%;margin:0 auto;text-align:center;font-size:11pt;line-height:1.6;break-inside:avoid;page-break-inside:avoid}\n.memo-signature .memo-signature-line{border-top:1px solid #111;padding-top:1.8mm}\n.memo-viewport{position:relative;overflow:hidden;width:100%;background:#fff}\n.memo-viewport .memo-sheet{transform-origin:left top;box-shadow:none}\n@media print{\n  @page{size:A4;margin:0}\n  html,body{margin:0!important;padding:0!important;background:#fff!important}\n  .memo-viewport{overflow:visible!important;width:auto!important;height:auto!important}\n  .memo-viewport .memo-sheet{transform:none!important}\n  .memo-sheet{break-after:auto;page-break-after:auto;box-shadow:none!important}\n}\n';
  function ehMemo() {
    return valor('doc-tipo') !== 'declaracao' && valor('doc-tipo') !== 'requerimento';
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
    const numeracao = pad(valor('doc-numero'),'Nº DO MEMORANDO');
    const anoMemo = valor('doc-data').slice(0,4) || String(new Date().getFullYear());
    const parags = limpa(valor('doc-texto')).split(/\n\s*\n/).filter(Boolean);
    return `<article class="memo-sheet">
      <table class="memo-header"><colgroup><col style="width:20%"><col style="width:30%"><col style="width:29%"><col style="width:21%"></colgroup>
        <tbody>
          <tr class="memo-top">
            <td class="memo-logo"><img src="${BRASAO}" alt="Brasão da Prefeitura de Montes Claros"></td>
            <td colspan="2" class="memo-school">
              <div>PREFEITURA MUNICIPAL DE MONTES CLAROS</div>
              <div>SECRETARIA MUNICIPAL DE EDUCAÇÃO</div>
              <strong>E. M. PROFª EUNICE CARNEIRO</strong>
              <div>Rua D, 300 – José Correia Machado</div>
              <div>Montes Claros – MG – (38) 2211-8332</div>
            </td>
            <td class="memo-control"><div>Data: ${esc(dt(valor('doc-data'))||'[DATA]')}</div><div class="memo-num">Nº ${esc(numeracao)}/${esc(anoMemo)}</div></td>
          </tr>
          <tr class="memo-title"><td colspan="4">MEMORANDO</td></tr>
          <tr class="memo-address">
            <td colspan="2" class="memo-from">De: ${esc(pad(sig.nome,'REMETENTE'))}<div>${esc(pad(sig.cargo,'CARGO DO REMETENTE'))}</div></td>
            <td colspan="2" class="memo-to">Para: ${esc(pad(valor('doc-para'),'DESTINATÁRIO'))}<div>A/C: ${esc(pad(valor('doc-ac'),'RESPONSÁVEL'))}</div><div class="memo-sector">${esc(pad(valor('doc-setor'),'SETOR'))}</div></td>
          </tr>
        </tbody>
      </table>
      <div class="memo-subject">ASSUNTO: ${esc(pad(valor('doc-assunto'),'ASSUNTO'))}</div>
      <section class="memo-content">
        <p class="memo-greeting">${esc(pad(valor('doc-saudacao'),'SAUDAÇÃO'))}</p>
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
  const rotulo = f => `${f.nome}${f.matricula ? ` — Matrícula ${f.matricula}` : ''}`;
  const pad = (valor, rot) => limpa(valor) || `[INFORMAR ${rot}]`;
  const dataLocal = () => {
    const x = new Date();
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  };
  const tipos = [
    ['declaracao', 'Declaração funcional do servidor'],
    ['requerimento', 'Requerimento do servidor'],
    ['prorrogacao', 'Memorando — prorrogação de contrato'],
    ['substituicao', 'Memorando — substituição por licença (LTS)'],
    ['contratacao', 'Memorando — contratação / reposição de vaga'],
    ['calendario', 'Memorando — alteração de calendário escolar'],
    ['zeladoria', 'Memorando — solicitação de zeladoria'],
    ['transporte', 'Memorando — transporte para visita escolar'],
    ['estagio', 'Memorando — análise de estágio de servidor(a)'],
    ['avanco', 'Memorando — parecer sobre avanço de nível'],
    ['memorando', 'Memorando personalizado (livre)']
  ];

  // Destinatários retirados de memorandos reais. Confirme os nomes atuais antes do envio.
  const ENDERECAMENTO = {
    prorrogacao: ['Polyana Ferreira Da Silva', 'Coordenadoria de Gestão Pessoal'],
    substituicao: ['Polyana Ferreira Da Silva', 'Coordenadoria de Gestão Pessoal'],
    contratacao: ['Polyana Ferreira Da Silva', 'Coordenadoria de Gestão Pessoal'],
    calendario: ['Domingas Darc Mendes', 'Inspeção Escolar – Secretaria Municipal de Educação'],
    zeladoria: ['Girlene Miranda de Melo', 'Coordenadoria de Gerência Administrativa'],
    transporte: ['Soraya Figueiredo', 'Coordenadoria de Infraestrutura, Transporte e Logística'],
    estagio: ['Nilza Pereira Dias', 'Coordenadoria de Avaliação e Capacitação de Servidores'],
    avanco: ['Ana Cristina Fonseca de Vasconcelos', 'Coordenadora de Educação Inclusiva – Analistas / SME'],
    memorando: ['', '']
  };

  const EXTRA_CAMPOS = [
    ['doc-qtd', 'Quantidade de profissionais solicitados', 'zeladoria', 'number', 'Ex.: 2'],
    ['doc-alunos-num', 'Quantidade de estudantes', 'transporte', 'number', 'Ex.: 40'],
    ['doc-anos', 'Turmas ou anos escolares', 'transporte', 'text', 'Ex.: 1º e 2º anos'],
    ['doc-turno', 'Turno', 'transporte', 'text', 'Ex.: matutino'],
    ['doc-local', 'Local de destino', 'transporte', 'text', 'Ex.: Parque de Exposições'],
    ['doc-hora-inicio', 'Início da visita', 'transporte', 'time', ''],
    ['doc-hora-fim', 'Fim da visita', 'transporte', 'time', ''],
    ['doc-saida', 'Horário de embarque', 'transporte', 'time', ''],
    ['doc-retorno', 'Horário do retorno', 'transporte', 'time', ''],
    ['doc-instituicao', 'Instituição / local do estágio (opcional)', 'estagio', 'text', ''],
    ['doc-horario', 'Compatibilidade de horários (confirme)', 'estagio', 'text', 'Ex.: Fora da jornada de trabalho'],
    ['doc-estudante', 'Nome do(a) estudante', 'avanco', 'text', 'Digite apenas se necessário'],
    ['doc-turma-aluno', 'Turma / ano escolar', 'avanco', 'text', 'Ex.: 2º ano C'],
    ['doc-anexos', 'Documentos anexos', 'avanco', 'text', 'Ex.: relatório pedagógico e requerimento']
  ];

  function definirDestinatario(tipo) {
    if (!ENDERECAMENTO[tipo]) return;
    $('doc-para').value = 'Charles Gutemberg Alencar Soares';
    $('doc-ac').value = ENDERECAMENTO[tipo][0];
    $('doc-setor').value = ENDERECAMENTO[tipo][1];
  }

  function periodoVisita() {
    const ini = valor('doc-hora-inicio'), fim = valor('doc-hora-fim');
    return ini && fim ? `das ${ini} às ${fim}` : (ini ? `a partir de ${ini}` : 'em horário a informar');
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
    const mes = ['janeiro','fevereiro','março','abril','maio','junho',
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
  function matricula(f) { return pad(f?.matricula, 'MATRÍCULA'); }
  function cargo(f) { return pad(f?.cargo || valor('doc-cargo'), 'CARGO/FUNÇÃO'); }
  function assinatura() {
    if (valor('doc-tipo') === 'requerimento') {
      const f = servidor('doc-principal');
      return { nome: f?.nome || 'NOME DO(A) REQUERENTE', cargo: 'Servidor(a) requerente' };
    }
    return { nome: valor('doc-assinante'), cargo: valor('doc-cargo-assinante') };
  }
  function cabecalho() {
    const tipo = valor('doc-tipo');
    const ehMemo = ['prorrogacao','substituicao','contratacao','memorando'].includes(tipo);
    const titulo = {
      declaracao:'DECLARAÇÃO', requerimento:'REQUERIMENTO',
      prorrogacao:'MEMORANDO', substituicao:'MEMORANDO',
      contratacao:'MEMORANDO', memorando:'MEMORANDO'
    }[tipo] || 'DOCUMENTO';
    const numero = ehMemo ? ` Nº ${valor('doc-numero') || '____'}/${valor('doc-data').slice(0, 4) || new Date().getFullYear()}` : '';
    return { titulo: titulo + numero, ehMemo };
  }

  function modeloTexto() {
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
    const cargoVaga = pad(valor('doc-cargo'), 'CARGO/FUNÇÃO');
    switch (tipo) {
      case 'declaracao':
        return `Declaramos, para os devidos fins, que ${n}, matrícula nº ${mat}, ${pad(cg, 'CARGO/FUNÇÃO')}, possui registro funcional nesta unidade escolar, E.M. Prof.ª Eunice Carneiro, conforme os dados constantes do cadastro da escola.${f?.vinculo ? ` O vínculo informado no cadastro é: ${f.vinculo}.` : ''}${f?.dataAdmissao ? ` A data de admissão registrada é ${dt(f.dataAdmissao) || f.dataAdmissao}.` : ''}\n\n${obs || 'A presente declaração é expedida a pedido do(a) interessado(a), para os fins que se fizerem necessários.'}\n\nPor ser expressão das informações registradas, firmamos a presente declaração, sujeita à conferência dos documentos funcionais.`;
      case 'requerimento':
        return `Eu, ${n}, matrícula nº ${mat}, ocupante do cargo/função de ${cg}, venho, respeitosamente, requerer o seguinte: ${pad(valor('doc-pedido'), 'OBJETO DO REQUERIMENTO')}.\n\n${just}\n\nDiante do exposto, solicito a análise do pedido e as providências administrativas cabíveis.\n\nNestes termos, peço deferimento.`;
      case 'prorrogacao':
        if (outro) return `Vimos, por meio deste, solicitar a prorrogação do contrato do(a) servidor(a) ${n}, matrícula nº ${mat}, ${cg}, que atua em substituição ao(à) servidor(a) ${nome(outro)}, matrícula nº ${matricula(outro)}, afastado(a) em Licença para Tratamento de Saúde (LTS).\n\nConforme documentação do afastamento a ser conferida, ${nome(outro)} encontra-se em LTS${valor('doc-prazo') ? ` pelo período de ${valor('doc-prazo')} dias` : ''}${valor('doc-inicio') ? `, a partir de ${inicio}` : ''}.\n\nDiante da continuidade do afastamento, solicitamos a prorrogação do contrato de ${n}${valor('doc-fim') ? ` até ${fim}` : ' durante o período de substituição'}, a fim de ${just}.`;
        return `Vimos, por meio deste, solicitar a prorrogação do contrato do(a) servidor(a) ${n}, matrícula nº ${mat}, ${cg}, que atua nesta unidade escolar.\n\nO término contratual informado está previsto para ${inicio}, e solicita-se a análise da prorrogação até ${fim}.\n\nA solicitação fundamenta-se na necessidade de ${just}, a fim de assegurar a continuidade das atividades da unidade escolar.`;
      case 'substituicao':
        return `Cumprimentando-os cordialmente, vimos solicitar a contratação de um(a) profissional para exercer a função de ${cargoVaga}, em substituição ao(à) servidor(a) ${n}, matrícula nº ${mat}, que se encontra afastado(a) por licença para tratamento de saúde (LTS), conforme documentação administrativa a ser conferida.\n\nO afastamento informado tem início em ${inicio}${valor('doc-fim') ? `, com término previsto para ${fim}` : ''}${valor('doc-prazo') ? `, pelo período de ${valor('doc-prazo')} dias` : ''}.\n\n${outro ? `Caso seja cabível, indicamos para análise a continuidade ou contratação do(a) servidor(a) ${nome(outro)}, matrícula nº ${matricula(outro)}, sem prejuízo dos procedimentos legais de contratação.\n\n` : ''}A substituição se faz necessária para ${just}.\n\nSolicitamos as providências administrativas cabíveis, a fim de assegurar a continuidade do atendimento aos estudantes e das atividades pedagógicas.`;
      case 'contratacao':
        return `Cumprimentando-os cordialmente, vimos solicitar a contratação de um(a) profissional para o cargo/função de ${cargoVaga}, tendo em vista a necessidade de reposição de pessoal nesta unidade escolar.\n\n${f ? `A necessidade decorre da situação funcional do(a) servidor(a) ${n}, matrícula nº ${mat}.` : 'A vaga e a situação funcional que motivam o pedido deverão ser confirmadas nos registros da unidade escolar.'} ${valor('doc-inicio') ? `A data informada para a ocorrência é ${inicio}.` : ''}\n\nJustificativa: ${just}.\n\nDiante da necessidade de manter a continuidade das atividades e o atendimento aos alunos, solicitamos a análise e autorização das providências de contratação cabíveis.`;
      case 'calendario': {
        const anterior = pad(dt(valor('doc-inicio')), 'DATA ORIGINAL');
        const proposta = pad(dt(valor('doc-fim')), 'DATA PROPOSTA');
        return `Solicitamos autorização para alterar a data do sábado letivo originalmente previsto para ${anterior}, propondo sua realização em ${proposta}.\n\nA solicitação fundamenta-se em: ${just}. Ressaltamos que a alteração deverá respeitar o calendário escolar aprovado, os dias letivos e a carga horária anual obrigatória.\n\nCertos da atenção e da análise dessa Coordenadoria, aguardamos manifestação quanto à alteração solicitada.`;
      }
      case 'zeladoria': {
        const qtd = pad(valor('doc-qtd'), 'QUANTIDADE DE SERVIDORES');
        const adicional = valor('doc-pedido');
        return `Vimos, respeitosamente, solicitar a disponibilização de ${qtd} profissional(is) de servente de zeladoria para atender às necessidades desta unidade escolar.${adicional ? ` Solicitamos também ${adicional}.` : ''}\n\nJustificamos o pedido em razão de ${just}. A medida se faz necessária para assegurar a higienização adequada dos ambientes e a continuidade dos serviços de apoio escolar.\n\nSolicitamos a análise da demanda e a adoção das providências administrativas cabíveis.`;
      }
      case 'transporte': {
        const q = pad(valor('doc-alunos-num'), 'NÚMERO DE ESTUDANTES');
        const turmas = pad(valor('doc-anos'), 'TURMAS / ANOS');
        const destino = pad(valor('doc-local'), 'DESTINO');
        const dia = pad(dt(valor('doc-inicio')), 'DATA DA VISITA');
        const turno = pad(valor('doc-turno'), 'TURNO');
        const embarque = pad(valor('doc-saida'), 'HORÁRIO DE EMBARQUE');
        const retorno = pad(valor('doc-retorno'), 'HORÁRIO DO RETORNO');
        return `Vimos, por meio deste, solicitar a disponibilização de transporte escolar para ${q} estudante(s) das turmas ${turmas}, no dia ${dia}, no turno ${turno}, com destino a ${destino}, para realização de atividade pedagógica extraclasse.\n\nA visita está prevista para o período ${periodoVisita()}. Solicitamos embarque na escola a partir de ${embarque} e retorno previsto a partir de ${retorno}.\n\nA atividade tem por finalidade ${just}. Agradecemos a atenção e aguardamos a análise da solicitação.`;
      }
      case 'estagio': {
        const instituicao = valor('doc-instituicao');
        const horario = valor('doc-horario');
        return `Vimos, por meio deste, solicitar análise e parecer dessa Coordenadoria quanto à possibilidade de o(a) servidor(a) ${n}, matrícula nº ${mat}, ocupante da função de ${cg}, realizar estágio supervisionado${instituicao ? ` na instituição ${instituicao}` : ''}.\n\n${horario ? `Informações apresentadas sobre a compatibilidade dos horários: ${horario}. ` : ''}Justificativa e demais esclarecimentos: ${just}.\n\nSolicitamos orientação sobre os requisitos e procedimentos aplicáveis, antes de qualquer autorização pela unidade escolar. Colocamo-nos à disposição para encaminhar os documentos complementares necessários.`;
      }
      case 'avanco': {
        const aluno = pad(valor('doc-estudante'), 'NOME DO(A) ESTUDANTE');
        const turma = pad(valor('doc-turma-aluno'), 'ANO / TURMA');
        const anexos = valor('doc-anexos');
        return `Vimos, por meio deste, solicitar análise e parecer da Coordenadoria de Educação Inclusiva acerca do pedido de avaliação para possível avanço de nível do(a) estudante ${aluno}, matriculado(a) no(a) ${turma}.\n\nContextualização apresentada pela unidade escolar: ${just}. O encaminhamento não pressupõe o deferimento do avanço, ficando sujeito à avaliação técnica e aos procedimentos pertinentes.\n\n${anexos ? `Encaminhamos em anexo: ${anexos}. ` : ''}Solicitamos orientação e parecer quanto às providências educacionais cabíveis.`;
      }
      case 'memorando':
        return `${pad(valor('doc-pedido'), 'DESCRIÇÃO DA SOLICITAÇÃO')}\n\n${just}\n\nDiante do exposto, solicitamos a análise e as providências administrativas cabíveis.`;
      default:
        return '';
    }
  }

  function camposDinamicos() {
    const tipo = valor('doc-tipo');
    const dicas = {
      declaracao: 'Declaração funcional. Confirme os registros antes da assinatura.',
      requerimento: 'Requerimento em primeira pessoa, assinado pelo próprio servidor.',
      prorrogacao: 'Prorrogação de contrato: confirme o término, o período solicitado e eventual LTS.',
      substituicao: 'Contratação de substituto em LTS. Verifique o afastamento e a função.',
      contratacao: 'Solicitação de contratação por vacância ou necessidade de pessoal.',
      calendario: 'Modelo do Memorando 13: alteração de sábado letivo, sujeita à autorização.',
      zeladoria: 'Modelo do Memorando 12: solicitação de serventes de zeladoria.',
      transporte: 'Modelo do Memorando 16: transporte para visita pedagógica.',
      estagio: 'Modelo do Memorando 7: pedido de parecer sobre estágio supervisionado.',
      avanco: 'Modelo do Memorando 25: solicitação de análise e parecer sobre possível avanço de nível. Dados de estudantes não são salvos.',
      memorando: 'Modelo personalizado: escolha destinatário, assunto, pedido e justificativa; todo o texto pode ser editado.'
    };
    $('doc-dica').textContent = dicas[tipo] || '';
    const semServidor = ['calendario','zeladoria','transporte','avanco','memorando'].includes(tipo);
    $('doc-principal-bloco').hidden = semServidor;
    $('doc-principal-legenda').textContent = ({
      substituicao: 'Servidor afastado por LTS',
      requerimento: 'Servidor requerente',
      contratacao: 'Servidor desligado / vaga (opcional)',
      estagio: 'Servidor solicitante de estágio'
    })[tipo] || 'Servidor interessado';
    $('doc-secundario-bloco').hidden = !['substituicao','prorrogacao'].includes(tipo);
    $('doc-secundario-legenda').textContent = tipo === 'prorrogacao'
      ? 'Servidor titular afastado por LTS (opcional)'
      : 'Profissional sugerido para substituição (opcional)';
    $('doc-destino-simples').hidden = ehMemo();
    $('doc-memorando-cabecalho').hidden = !ehMemo();
    $('doc-inicio-bloco').hidden = !['prorrogacao','substituicao','contratacao','calendario','transporte'].includes(tipo);
    $('doc-fim-bloco').hidden = !['prorrogacao','substituicao','calendario'].includes(tipo);
    $('doc-prazo-bloco').hidden = !['substituicao','prorrogacao'].includes(tipo);
    $('doc-cargo-bloco').hidden = !['substituicao','contratacao'].includes(tipo);
    $('doc-pedido-bloco').hidden = !['memorando','requerimento','zeladoria'].includes(tipo);
    $('doc-numero-bloco').hidden = !ehMemo();
    $('doc-motivo-legenda').textContent = ({
      declaracao: 'Finalidade da declaração',
      requerimento: 'Fundamentação do requerimento',
      calendario: 'Motivo da alteração do calendário',
      zeladoria: 'Necessidades de limpeza e manutenção',
      transporte: 'Objetivo pedagógico da visita',
      estagio: 'Contexto e justificativa do pedido de estágio',
      avanco: 'Contextualização pedagógica (evite detalhes médicos sensíveis)',
      memorando: 'Justificativa / fundamentação'
    })[tipo] || 'Justificativa da solicitação';
    $('doc-inicio-legenda').textContent = ({
      prorrogacao: 'Início da LTS ou término do contrato',
      substituicao: 'Início da licença (LTS)',
      contratacao: 'Data da vacância / rescisão',
      calendario: 'Data original do sábado letivo',
      transporte: 'Data da visita'
    })[tipo] || 'Data inicial';
    $('doc-fim-legenda').textContent = ({
      prorrogacao: 'Prorrogar até (se definido)',
      substituicao: 'Fim previsto da licença',
      calendario: 'Nova data proposta'
    })[tipo] || 'Data final';
    $('doc-pedido-legenda').textContent = tipo === 'zeladoria'
      ? 'Solicitação adicional (opcional; ex.: ampliação de carga horária)'
      : 'Pedido / objeto do documento';
    for (const [id,,fieldTipo] of EXTRA_CAMPOS) {
      $(id + '-bloco').hidden = fieldTipo !== tipo;
    }
  }

  function assuntoPadrao(tipo) {
    return {
      declaracao:'Declaração funcional',
      requerimento:'Requerimento administrativo',
      prorrogacao:'Solicitação de prorrogação de contrato',
      substituicao:'Solicitação de contratação para substituição por LTS',
      contratacao:'Solicitação de contratação de servidor(a)',
      calendario:'Solicitação de alteração de data de sábado letivo no calendário escolar',
      zeladoria:'Solicitação de serventes de zeladoria',
      transporte:'Solicitação de transporte para estudantes',
      estagio:'Solicitação de parecer sobre estágio supervisionado',
      avanco:'Solicitação de análise e parecer sobre avanço de nível',
      memorando:''
    }[tipo] || '';
  }

  function atualizarModelo(force = false) {
    if (force || !S.textoEditado) {
      $('doc-texto').value = modeloTexto();
      S.textoEditado = false;
      $('doc-edicao').textContent = 'Texto gerado automaticamente; você pode editar antes de emitir.';
    } else {
      $('doc-edicao').textContent = 'Texto editado manualmente. Use “Atualizar texto” para recompor com os dados do formulário.';
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
    const destinoHtml = cab.ehMemo || valor('doc-tipo') === 'requerimento' ? `
      <div class="docs-destination">
        ${destino ? `<div><strong>A/C:</strong> ${esc(destino)}</div>` : ''}
        ${assunto ? `<div><strong>Assunto:</strong> ${esc(assunto)}</div>` : ''}
      </div>` : '';
    return `
      <div class="docs-letterhead">
        <b>PREFEITURA MUNICIPAL DE MONTES CLAROS</b>
        <b>SECRETARIA MUNICIPAL DE EDUCAÇÃO</b>
        <b>ESCOLA MUNICIPAL PROFESSORA EUNICE CARNEIRO</b>
        <small>Montes Claros – Minas Gerais</small>
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
    const tipo = valor('doc-tipo');
    const requerServidor = ['declaracao','requerimento','prorrogacao','substituicao','estagio'].includes(tipo);
    const avisos = [];
    if (requerServidor && !servidor('doc-principal')) avisos.push('Selecione um servidor válido na lista.');
    if (!valor('doc-data')) avisos.push('Informe a data do documento.');
    if (tipo === 'prorrogacao' && (!valor('doc-inicio') || (!valor('doc-fim') && !servidor('doc-secundario')))) avisos.push('Informe data inicial e data final ou selecione a pessoa afastada para prorrogação por LTS.');
    if (tipo === 'substituicao' && !valor('doc-inicio')) avisos.push('Informe o início da licença.');
    if (['substituicao','contratacao'].includes(tipo) && !valor('doc-cargo')) avisos.push('Informe o cargo a contratar.');
    if (['memorando','requerimento'].includes(tipo) && !valor('doc-pedido')) avisos.push('Informe o pedido do documento.');
    if (['memorando','requerimento','prorrogacao','substituicao','contratacao','calendario','zeladoria','transporte','estagio','avanco'].includes(tipo) && !valor('doc-motivo')) avisos.push('Informe a justificativa.');
    if (tipo !== 'requerimento' && (!valor('doc-assinante') || !valor('doc-cargo-assinante'))) avisos.push('Confira os dados do assinante.');
    if (/\[INFORMAR [^\]]+\]/i.test(valor('doc-texto'))) avisos.push('O texto ainda contém campos [INFORMAR ...].');
    if (!valor('doc-texto')) avisos.push('O texto está vazio.');
    if (tipo === 'calendario' && (!valor('doc-inicio') || !valor('doc-fim'))) avisos.push('Informe data original e nova data proposta.');
    if (tipo === 'zeladoria' && (!valor('doc-qtd') || Number(valor('doc-qtd')) < 1)) avisos.push('Informe o número de profissionais solicitados.');
    if (tipo === 'transporte') {
      for (const [id,rot] of [['doc-alunos-num','Quantidade de estudantes'],['doc-anos','Turmas'],['doc-inicio','Data da visita'],['doc-turno','Turno'],['doc-local','Destino'],['doc-saida','Embarque'],['doc-retorno','Retorno']]) {
        if (!valor(id)) avisos.push('Preencha: ' + rot + '.');
      }
    }
    if (tipo === 'avanco' && (!valor('doc-estudante') || !valor('doc-turma-aluno'))) avisos.push('Informe estudante e turma para solicitar o parecer.');
    if (ehMemo()) {
      for(const [id,rot] of [['doc-numero','Número do memorando'],['doc-para','Para'],['doc-ac','A/C'],['doc-setor','Coordenadoria/Setor'],['doc-assunto','Assunto'],['doc-saudacao','Saudação'],['doc-despedida','Despedida']]) {
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
      ${imprimir?'<div class="actions"><button onclick="window.print()">Imprimir / Salvar PDF</button><button onclick="window.close()">Fechar</button></div>':''}
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
      ${imprimir ? '<div class="actions"><button onclick="window.print()">Imprimir / salvar PDF</button><button onclick="window.close()">Fechar</button></div>' : ''}
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
    win.document.open();
    win.document.write(documentoHTML(true));
    win.document.close();
    situacao('Documento aberto para revisão final e impressão. Use “Salvar como PDF” no navegador.', 'ok');
  }
  async function copiar() {
    const text = ehMemo() ? `MEMORANDO Nº ${valor('doc-numero')}/${valor('doc-data').slice(0,4)}\nData: ${dt(valor('doc-data'))}\nDe: ${assinatura().nome} — ${assinatura().cargo}\nPara: ${valor('doc-para')}\nA/C: ${valor('doc-ac')}\n${valor('doc-setor')}\nASSUNTO: ${valor('doc-assunto')}\n\n${valor('doc-saudacao')}\n\n${valor('doc-texto')}\n\n${valor('doc-despedida')}\n\n${assinatura().nome}\n${assinatura().cargo}` : `${cabecalho().titulo}\nMontes Claros/MG, ${dataExtenso(valor('doc-data'))}\n${valor('doc-destino')}\nAssunto: ${valor('doc-assunto')}\n\n${valor('doc-texto')}\n\n${assinatura().nome}\n${assinatura().cargo}`;
    try {
      await navigator.clipboard.writeText(text);
      situacao('Texto copiado. Você pode colá-lo no 1Doc, Word ou e-mail.', 'ok');
    } catch {
      const t = $('doc-texto'); t.focus(); t.select();
      situacao('Selecionei o texto; pressione Ctrl+C para copiar.', 'warn');
    }
  }

  // Exportador DOCX nativo. Reaproveita o arquivo Word fornecido pela escola:
  // preserva sua tabela, brasão, estilos, margens e estrutura do documento.
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
    if(end<0)throw new Error('Modelo Word não é um ZIP válido.');
    const total=read16(dv,end+10), start=read32(dv,end+16);
    let at=start;
    const files=new Map();
    for(let i=0;i<total;i++) {
      if(read32(dv,at)!==0x02014b50)throw new Error('ZIP do modelo está corrompido.');
      const method=read16(dv,at+10);
      const size=read32(dv,at+20);
      const nameLen=read16(dv,at+28);
      const extraLen=read16(dv,at+30);
      const commentLen=read16(dv,at+32);
      const local=read32(dv,at+42);
      const name=readText.decode(bytes.subarray(at+46,at+46+nameLen));
      if(read32(dv,local)!==0x04034b50)throw new Error('Cabeçalho do arquivo inválido.');
      const pos=local+30+read16(dv,local+26)+read16(dv,local+28);
      const comp=bytes.slice(pos,pos+size);
      let data;
      if(method===0){data=comp;}
      else if(method===8){
        if(typeof DecompressionStream==='undefined')throw new Error('Navegador sem suporte à descompactação Word. Use Chrome atualizado.');
        const stream=new Blob([comp]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
        data=new Uint8Array(await new Response(stream).arrayBuffer());
      } else throw new Error('Método ZIP não suportado: '+method);
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
    if(doc.getElementsByTagName('parsererror').length)throw new Error('XML do modelo Word inválido.');
    const sig=assinatura();
    const replacements={
      '{{DATA}}':dt(valor('doc-data')),
      '{{NUMERO}}':valor('doc-numero'),
      '{{ANO}}':valor('doc-data').slice(0,4),
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
    if(target.some(p=>!p))throw new Error('Parágrafos do modelo Word ausentes.');
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
      if(!original)throw new Error('Documento do modelo não encontrado.');
      const resultado=preencherDocxXML(readText.decode(original));
      files.set('word/document.xml',textCodec.encode(resultado));
      const blob=zipStored(files);
      const url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;
      a.download=`MEMORANDO_${valor('doc-numero')}_${valor('doc-data').slice(0,4)}.docx`;
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),60000);
      situacao('Word .docx gerado a partir do modelo original. Confira dados, assinatura e quebras de página antes do protocolo.','ok');
    }catch(err){situacao('Não foi possível gerar o .docx: '+err.message,'error');}
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
    situacao('Arquivo .doc HTML gerado. Para preservar o memorando exatamente como aparece, prefira Imprimir / Salvar PDF; o Word pode reorganizar o layout e não incorporar o brasão.', 'ok');
  }

  function interface() {
    return `<div class="page-header"><div><h2>Documentos de Servidores</h2>
      <p>Modelos para a Secretaria: pessoal, calendário, zeladoria, transporte, estágio, inclusão e memorando livre.</p></div>
      <span class="docs-badge">Conferir antes de assinar</span></div>
    <div class="docs-layout">
      <section class="docs-panel"><h3>1. Preencher o documento</h3>
        <div class="docs-grid">
          <div class="docs-field full"><label>Tipo de documento</label>
            <select id="doc-tipo">${tipos.map(([v,n])=>`<option value="${v}">${esc(n)}</option>`).join('')}</select></div>
          <div class="docs-field full"><div class="docs-typehint" id="doc-dica"></div></div>
          <div class="docs-field full" id="doc-principal-bloco"><label id="doc-principal-legenda">Servidor interessado</label>
            <input list="doc-funcionarios" id="doc-principal" autocomplete="off" placeholder="Digite o nome ou matrícula e selecione uma opção"></div>
          <div class="docs-field full" id="doc-secundario-bloco" hidden><label id="doc-secundario-legenda">Profissional sugerido / substituto (opcional)</label>
            <input list="doc-funcionarios" id="doc-secundario" autocomplete="off" placeholder="Pesquise pelo nome ou matrícula"></div>
          <datalist id="doc-funcionarios">${S.funcionarios.map(f=>`<option value="${esc(rotulo(f))}"></option>`).join('')}</datalist>
          <div class="docs-field"><label>Data do documento</label><input id="doc-data" type="date" value="${dataLocal()}"></div>
          <div class="docs-field" id="doc-numero-bloco"><label>Número do memorando (opcional)</label>
            <input id="doc-numero" placeholder="Ex.: 025"></div>
          <div class="docs-field full" id="doc-destino-simples"><label>Destinatário / A/C</label>
            <input id="doc-destino" value="Inspeção Escolar"></div>
          <div class="docs-field full" id="doc-memorando-cabecalho" hidden>
            <div class="docs-grid">
              <div class="docs-field full"><label>Para (nome completo)</label>
                <input id="doc-para" value="Charles Gutemberg Alencar Soares"></div>
              <div class="docs-field full"><label>A/C (responsável)</label>
                <input id="doc-ac" value="Polyana Ferreira Da Silva"></div>
              <div class="docs-field full"><label>Coordenadoria / Setor</label>
                <input id="doc-setor" value="Coordenadoria de Gestão Pessoal"></div>
              <div class="docs-field"><label>Saudação</label><input id="doc-saudacao" value="Prezada Senhora,"></div>
              <div class="docs-field"><label>Despedida</label><input id="doc-despedida" value="Atenciosamente,"></div>
            </div>
          </div>
          <div class="docs-field full"><label>Assunto</label><input id="doc-assunto"></div>
          <div class="docs-field" id="doc-cargo-bloco" hidden><label>Cargo/função a contratar</label>
            <input id="doc-cargo" placeholder="Ex.: Professor(a) PEB I"></div>
          <div class="docs-field" id="doc-inicio-bloco" hidden><label id="doc-inicio-legenda">Data inicial</label>
            <input id="doc-inicio" type="date"></div>
          <div class="docs-field" id="doc-fim-bloco" hidden><label id="doc-fim-legenda">Data final</label>
            <input id="doc-fim" type="date"></div>
          <div class="docs-field" id="doc-prazo-bloco" hidden><label>Período em dias (opcional)</label>
            <input id="doc-prazo" type="number" min="1" placeholder="Ex.: 60"></div>
          <div class="docs-field full" id="doc-pedido-bloco" hidden><label id="doc-pedido-legenda">Pedido / objeto do requerimento</label>
            <textarea id="doc-pedido" placeholder="Descreva objetivamente o que está sendo solicitado."></textarea></div>
          <div class="docs-field full"><label id="doc-motivo-legenda">Justificativa / observações</label>
            <textarea id="doc-motivo" placeholder="Ex.: assegurar a continuidade das atividades pedagógicas e do atendimento aos alunos."></textarea></div>
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
        <h4>2. Texto do documento (editável)</h4>
        <div class="docs-field"><textarea id="doc-texto" style="min-height:290px"></textarea>
          <small class="docs-hint" id="doc-edicao"></small></div>
        <div class="docs-actions">
          <button type="button" id="doc-atualizar" class="btn btn-secondary">Atualizar texto</button>
          <button type="button" id="doc-copiar" class="btn btn-secondary">Copiar texto</button>
        </div>
      </section>
      <section class="docs-panel">
        <div class="docs-previewbar"><h3>Pré-visualização do documento</h3><span class="docs-badge">Folha A4</span></div>
        <div id="doc-preview" class="docs-page"></div>
        <div class="docs-actions">
          <button type="button" class="btn btn-primary" id="doc-imprimir">Imprimir / Salvar PDF</button>
          <button type="button" class="btn btn-secondary" id="doc-word">Baixar Word (.doc)</button>
        </div>
        <div id="doc-status" role="status" class="docs-status"></div>
        <p class="docs-hint">Os textos são modelos administrativos. Confira datas, situação funcional,
        cargo e informações do processo antes do protocolo ou assinatura. Nenhum documento é salvo automaticamente no banco.</p>
      </section>
    </div>`;
  }

  async function init() {
    const perfil = await App.carregarPerfilAtual();
    if (!perfil || perfil.ativo === false || !['administrador','secretaria'].includes(perfil.perfil)) {
      App.layout('Documentos de Servidores','Acesso restrito',
        '<div class="docs-panel">Acesso permitido apenas aos perfis Secretaria e Administrador.</div>');
      return;
    }
    try {
      S.funcionarios = await App.getAll('funcionarios');
      S.funcionarios.sort((a,b) => normaliza(a.nome).localeCompare(normaliza(b.nome), 'pt-BR'));
    } catch(err) {
      App.layout('Documentos de Servidores','Falha na consulta de funcionários',
        `<div class="docs-panel">Não foi possível carregar os funcionários: ${esc(err.message)}</div>`);
      return;
    }
    App.layout('Documentos de Servidores', 'Declarações • Requerimentos • Memorandos', interface());
    $('doc-assunto').value = assuntoPadrao('declaracao');
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
    $('doc-texto').addEventListener('input', () => {
      S.textoEditado = true;
      $('doc-edicao').textContent = 'Texto personalizado; a edição será mantida até clicar em Atualizar texto.';
      visualizar();
    });
    $('doc-atualizar').onclick = () => atualizarModelo(true);
    $('doc-copiar').onclick = copiar;
    $('doc-imprimir').onclick = emitir;
    $('doc-word').onclick = baixarWord;
    $('doc-tipo').addEventListener('change',()=>{$('doc-word').textContent=ehMemo()?'Baixar Word (.docx oficial)':'Baixar Word (.doc)';});
    window.addEventListener('resize',()=>{if(ehMemo())ajustarVisualMemorando();});
    situacao(`${S.funcionarios.length} funcionários disponíveis para pesquisa. Selecione o tipo de documento.`, 'ok');
  }
  return {init};
})();

/* ============================================================
   MELHORIA DA TELA — CATEGORIAS E DECLARAÇÃO DE COMPARECIMENTO
   Cole TODO este bloco no FINAL do documentos-servidores.js.
   Mantém as funções originais e todos os modelos anteriores.
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
      ['declaracao', 'Declaração funcional do servidor'],
      ['comparecimento-responsavel', 'Comparecimento de pai, mãe ou responsável']
    ],
    requerimento: [
      ['requerimento', 'Requerimento do servidor']
    ],
    memorando: [
      ['prorrogacao', 'Prorrogação de contrato'],
      ['substituicao', 'Substituição por licença (LTS)'],
      ['contratacao', 'Contratação / reposição de vaga'],
      ['calendario', 'Alteração de calendário escolar'],
      ['zeladoria', 'Solicitação de zeladoria'],
      ['transporte', 'Transporte para visita escolar'],
      ['estagio', 'Parecer sobre estágio de servidor(a)'],
      ['avanco', 'Parecer sobre avanço de nível'],
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
          Declaração para apresentar ao empregador, comprovando o
          comparecimento de pai, mãe ou responsável à escola.
          Preencha somente informações confirmadas pela secretaria.
        </div>

        <div class="docs-grid" style="margin-top:14px">
          <div class="docs-field full">
            <label>Nome completo do(a) responsável *</label>
            <input
              id="ds-nome"
              autocomplete="off"
              placeholder="Nome do pai, da mãe ou responsável"
            >
          </div>

          <div class="docs-field full">
            <label>Nome do(a) estudante (opcional)</label>
            <input
              id="ds-estudante"
              autocomplete="off"
              placeholder="Deixe em branco se não for necessário informar"
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
              <option value="reunião pedagógica">Reunião pedagógica</option>
              <option value="atendimento na secretaria">Atendimento na secretaria</option>
              <option value="atendimento com a direção">Atendimento com a direção</option>
              <option value="retirada do(a) estudante">Retirada do(a) estudante</option>
              <option value="outros assuntos escolares">Outros assuntos escolares</option>
            </select>
          </div>

          <div class="docs-field">
            <label>Entrada *</label>
            <input id="ds-entrada" type="time">
          </div>

          <div class="docs-field">
            <label>Saída *</label>
            <input id="ds-saida" type="time">
          </div>

          <div class="docs-field full">
            <label>Nome de quem assinará *</label>
            <input
              id="ds-assinante"
              value="Anderson Santos Silva"
            >
          </div>

          <div class="docs-field full">
            <label>Cargo de quem assinará *</label>
            <input
              id="ds-cargo"
              value="Diretor de Unidade Escolar"
            >
          </div>
        </div>
      </div>`;
  }

  function textoPais() {
    const resp = valor('ds-nome') || '[NOME DO(A) RESPONSÁVEL]';
    const aluno = valor('ds-estudante');
    const dia = dataBr(valor('ds-data'));
    const ini = valor('ds-entrada') || '[ENTRADA]';
    const fim = valor('ds-saida') || '[SAÍDA]';
    const motivo = valor('ds-motivo');
    const objetivo = motivo || 'tratar de assuntos escolares';

    return `Declaramos, para os devidos fins e especialmente para apresentação no local de trabalho, que ${resp} compareceu à Escola Municipal Professora Eunice Carneiro, no dia ${dia}, no período das ${ini} às ${fim}, para ${objetivo}${aluno ? ', em assunto relacionado ao(à) estudante ' + aluno : ''}.

A presente declaração refere-se exclusivamente ao comparecimento registrado na unidade escolar, não representando, por si só, abono de jornada de trabalho.

Por ser verdade, firmamos a presente declaração.`;
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
        <b>SECRETARIA MUNICIPAL DE EDUCAÇÃO</b>
        <b>ESCOLA MUNICIPAL PROFESSORA EUNICE CARNEIRO</b>
        <small>Rua D, 300 – José Correia Machado – Montes Claros/MG</small>
      </div>

      <div class="docs-doc-title">
        DECLARAÇÃO DE COMPARECIMENTO
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
      : 'Texto gerado automaticamente. Você pode ajustá-lo antes de emitir.';

    mostrarPais();
  }

  function validarPais() {
    const erros = [];

    if (!valor('ds-nome')) {
      erros.push('Nome do responsável');
    }

    if (!valor('ds-data')) {
      erros.push('Data do comparecimento');
    }

    if (!valor('ds-entrada')) {
      erros.push('Horário de entrada');
    }

    if (!valor('ds-saida')) {
      erros.push('Horário de saída');
    }

    if (
      valor('ds-saida') &&
      valor('ds-entrada') &&
      valor('ds-saida') < valor('ds-entrada')
    ) {
      erros.push('Saída não pode ser anterior à entrada');
    }

    if (!valor('ds-assinante') || !valor('ds-cargo')) {
      erros.push('Identificação de quem assinará');
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
<title>Declaração de comparecimento</title>

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
           <button onclick="window.print()">
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

    aba.document.open();
    aba.document.write(htmlPais(true));
    aba.document.close();

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
        'Preencha o comparecimento e confira os horários.'
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
        <option value="declaracao">Declaração</option>
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

    // Atualiza a prévia específica da declaração para pais.
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
        'Declarações, requerimentos e memorandos — escolha a categoria e depois o modelo.';
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
   CORREÇÃO DEFINITIVA DA EXIBIÇÃO DOS SELETORES

   Remove visualmente o campo antigo "Tipo de documento".
   Mantém apenas:
   1. O que deseja emitir?
   2. Modelo

   Os valores antigos permanecem disponíveis internamente
   para não prejudicar a geração dos documentos.
======================================================== */

(function corrigirSeletoresDuplicados() {

  const iniciarAnterior = DocumentosServidoresPage.init;

  DocumentosServidoresPage.init = async function (...args) {

    await iniciarAnterior.apply(this, args);

    const seletorAntigo = document.getElementById("doc-tipo");

    if (!seletorAntigo) return;

    const blocoAntigo = seletorAntigo.closest(".docs-field");

    if (!blocoAntigo) return;

    // Identifica o bloco antigo para mantê-lo oculto,
    // mesmo quando o usuário troca de categoria ou modelo.

    blocoAntigo.classList.add(
      "ds-seletor-antigo-oculto"
    );

    // Evita a duplicação da regra CSS.

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

    // Ajusta a descrição do módulo.

    const descricao = document.querySelector(
      ".page-header p"
    );

    if (descricao) {
      descricao.textContent =
        "Escolha Declarações ou Memorandos e selecione o modelo desejado.";
    }

  };

})();

/* ===============================================================
   CORREÇÃO: REQUERIMENTO DENTRO DE DECLARAÇÕES
   E CÁLCULO AUTOMÁTICO DOS DIAS DE LICENÇA/PRORROGAÇÃO
   Cole no FINAL de js/documentos-servidores.js.
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
      console.warn('Documentos: campos esperados não encontrados.');
      return;
    }

    // 1) Somente duas categorias principais.
    for (const opcao of Array.from(categoria.options)) {
      if (opcao.value === 'requerimento') opcao.remove();
      if (opcao.value === 'declaracao') opcao.textContent = 'Declarações';
      if (opcao.value === 'memorando') opcao.textContent = 'Memorandos';
    }

    function ajustarModelos() {
      if (categoria.value === 'declaracao') {
        if (!Array.from(modelo.options).some(o => o.value === 'requerimento')) {
          modelo.add(new Option('Requerimento do servidor', 'requerimento'));
        }
      } else {
        // O requerimento não deve aparecer nos modelos de memorando.
        for (const opcao of Array.from(modelo.options)) {
          if (opcao.value === 'requerimento') opcao.remove();
        }
      }
    }

    // O seletor original atualiza a lista primeiro.
    // Depois adicionamos o requerimento em Declarações.
    categoria.addEventListener('change', ajustarModelos);
    ajustarModelos();

    // Mantém o seletor antigo oculto.
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
        'Escolha Declarações ou Memorandos e, em seguida, o modelo desejado.';
    }

    // 2) Contagem de dias corridos, incluindo início e fim.
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
          etiqueta.textContent = 'Período em dias (opcional)';
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
          'A data final deve ser igual ou posterior à inicial.';

        ajuda.style.color = '#b42318';

        return;
      }

      // Preenche automaticamente o período.
      ultimoAutomatico = String(dias);

      prazo.readOnly = true;
      prazo.value = ultimoAutomatico;

      if (etiqueta) {
        etiqueta.textContent =
          'Período em dias (automático)';
      }

      ajuda.style.color = '#067647';
      ajuda.textContent =
        `${dias} dia(s) corrido(s), contando início e fim.`;

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
