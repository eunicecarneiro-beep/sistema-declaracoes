/* Assistente documental local: modelos explícitos, fatos livres e revisão humana.
   Não consulta serviços de IA nem confirma fatos em nome da escola. */
(function (global) {
  'use strict';
  const ESCOLA = 'Escola Municipal Professora Eunice Carneiro';
  const limpar = x => String(x ?? '').normalize('NFC').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, '').trim();
  const normalizar = x => limpar(x).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const terminar = x => { const s = limpar(x).replace(/[;,. ]+$/, ''); return s ? s + (/[!?]$/.test(s) ? '' : '.') : ''; };
  const frase = x => { const s = terminar(x); return s ? s[0].toLocaleUpperCase('pt-BR') + s.slice(1) : ''; };
  const F = Object.freeze({
    'doc-pessoa': ['Nome da pessoa interessada', 'text', ['nome completo', 'pessoa', 'interessado', 'interessada', 'nome do aluno', 'nome da aluna', 'aluno', 'aluna', 'estudante', 'participante', 'requerente', 'servidor', 'servidora']],
    'doc-identificacao': ['Identificação da pessoa (opcional)', 'text', ['identificacao', 'matricula escolar', 'registro escolar']],
    'doc-qualificacao': ['Qualificação / vínculo (opcional)', 'text', ['qualificacao', 'vinculo']],
    'doc-turma': ['Ano / turma', 'text', ['turma', 'turma do aluno', 'turma da aluna', 'ano turma', 'serie']],
    'doc-ano-letivo': ['Ano letivo', 'text', ['ano letivo']],
    'doc-turno-amplo': ['Turno', 'text', ['turno']],
    'doc-responsavel-amplo': ['Nome do responsável (opcional)', 'text', ['responsavel', 'mae', 'pai', 'genitor', 'genitora']],
    'doc-data-fato': ['Data do fato / atividade', 'date', ['data do fato', 'data do recebimento', 'data da entrega', 'data do evento', 'data da atividade', 'data do comparecimento', 'data da reuniao', 'data']],
    'doc-periodo-inicio': ['Início do período (se aplicável)', 'date', ['data inicial', 'data de inicio', 'inicio do periodo', 'inicio']],
    'doc-periodo-fim': ['Fim do período (se aplicável)', 'date', ['data final', 'data de termino', 'fim do periodo', 'fim']],
    'doc-prazo-amplo': ['Prazo solicitado em dias (opcional)', 'text', ['prazo em dias', 'prazo solicitado', 'duracao em dias', 'prazo']],
    'doc-entrada-amplo': ['Horário inicial (se aplicável)', 'time', ['horario de entrada', 'hora inicial', 'entrada']],
    'doc-saida-amplo': ['Horário final (se aplicável)', 'time', ['horario de saida', 'hora final', 'saida']],
    'doc-projeto': ['Projeto / instituição / fornecedor', 'text', ['projeto', 'programa', 'instituicao', 'fornecedor', 'origem', 'doador', 'cedente']],
    'doc-recebedor': ['Destinatário dos materiais', 'text', ['recebedor', 'beneficiario', 'destinatario dos materiais']],
    'doc-bens': ['Descrição dos materiais / bens / documentos', 'text', ['materiais', 'bens', 'itens', 'produto', 'objeto recebido', 'objeto entregue', 'documentos entregues']],
    'doc-quantidade-ampla': ['Quantidade e unidade (opcional)', 'text', ['quantidade', 'unidades']],
    'doc-atividade': ['Atividade / evento / serviço', 'text', ['atividade', 'evento', 'palestra', 'reuniao', 'servico', 'curso']],
    'doc-local-amplo': ['Local (opcional)', 'text', ['local da atividade', 'local do fato', 'local']],
    'doc-finalidade-ampla': ['Finalidade / justificativa (opcional)', 'textarea', ['finalidade', 'objetivo', 'justificativa', 'motivo']],
    'doc-situacao-ampla': ['Situação / resultado confirmado', 'textarea', ['situacao', 'resultado', 'situacao da transferencia', 'frequencia', 'escolaridade', 'situacao da vaga']],
    'doc-demanda': ['Pedido / providência / assunto', 'textarea', ['pedido', 'providencia', 'demanda', 'solicitacao', 'objeto']],
    'doc-fatos': ['Fatos e informações que devem constar', 'textarea', ['fatos', 'informacoes', 'descricao', 'contexto', 'texto', 'conteudo']],
    'doc-complementos': ['Detalhes adicionais confirmados (opcional)', 'textarea', ['complemento', 'complementos', 'observacoes', 'detalhes']],
    'doc-documentos-amplos': ['Documentos anexos / referência (opcional)', 'textarea', ['anexos', 'documentos anexos', 'referencia documental']],
    'doc-acoes': ['Encaminhamentos / decisões informadas', 'textarea', ['encaminhamentos', 'decisoes', 'providencias adotadas']],
    'doc-destino': ['Destinatário', 'text', ['destinatario', 'a quem se destina']],
    'doc-assunto': ['Assunto', 'text', ['assunto']],
    'doc-data': ['Data de emissão', 'date', ['data do documento', 'data de emissao', 'emissao']],
    'doc-numero': ['Número do documento', 'text', ['numero do documento', 'numero do memorando', 'numero']],
    'doc-para': ['Para', 'text', ['para']],
    'doc-ac': ['A/C', 'text', ['a/c', 'aos cuidados de']],
    'doc-setor': ['Setor', 'text', ['setor', 'coordenadoria']]
  });
  const modelos = [];
  function add(id, nome, genero, estrutura, campos, assunto = nome) {
    modelos.push(Object.freeze({ id, nome, genero, tipo: genero === 'memorando' ? 'memorando' : genero === 'requerimento' ? 'requerimento' : 'declaracao', estrutura, campos: Object.freeze(campos.split(' ').filter(Boolean)), assunto }));
  }
  const aluno = 'doc-pessoa doc-identificacao doc-turma doc-ano-letivo doc-turno-amplo';
  const pessoa = 'doc-pessoa doc-identificacao doc-qualificacao';
  const evento = 'doc-atividade doc-data-fato doc-local-amplo doc-projeto';
  const material = 'doc-bens doc-quantidade-ampla doc-projeto doc-data-fato doc-recebedor';
  add('matricula', 'Matrícula de aluno', 'declaracao', 'matricula', aluno);
  add('frequencia', 'Frequência de aluno', 'declaracao', 'frequencia', aluno + ' doc-situacao-ampla doc-periodo-inicio doc-periodo-fim');
  add('matricula-frequencia', 'Matrícula e frequência', 'declaracao', 'matricula-frequencia', aluno + ' doc-situacao-ampla doc-periodo-inicio doc-periodo-fim');
  add('escolaridade', 'Escolaridade / etapa cursada', 'declaracao', 'escolaridade', aluno + ' doc-situacao-ampla');
  add('conclusao', 'Conclusão de etapa escolar', 'declaracao', 'conclusao', aluno + ' doc-situacao-ampla');
  add('transferencia', 'Situação de transferência', 'declaracao', 'transferencia', aluno + ' doc-situacao-ampla');
  add('vaga', 'Situação de vaga escolar', 'declaracao', 'vaga', aluno + ' doc-situacao-ampla');
  add('turno', 'Turno e horário escolar', 'declaracao', 'turno', aluno + ' doc-entrada-amplo doc-saida-amplo');
  add('comparecimento-aluno', 'Comparecimento de aluno', 'declaracao', 'comparecimento', aluno + ' doc-data-fato doc-entrada-amplo doc-saida-amplo');
  add('comparecimento-responsavel-amplo', 'Comparecimento de responsável', 'declaracao', 'comparecimento', pessoa + ' doc-responsavel-amplo doc-data-fato doc-entrada-amplo doc-saida-amplo');
  add('comparecimento-pessoa', 'Comparecimento de pessoa / visitante', 'declaracao', 'comparecimento', pessoa + ' doc-data-fato doc-entrada-amplo doc-saida-amplo');
  add('participacao', 'Participação em projeto, evento ou curso', 'declaracao', 'participacao', pessoa + ' ' + evento + ' doc-periodo-inicio doc-periodo-fim');
  add('realizacao', 'Realização de projeto, palestra ou atividade', 'declaracao', 'realizacao', evento);
  add('recebimento', 'Recebimento de materiais, doações ou documentos', 'declaracao', 'recebimento', material);
  add('entrega', 'Entrega de materiais ou documentos', 'declaracao', 'entrega', material);
  add('devolucao', 'Devolução de materiais ou documentos', 'declaracao', 'devolucao', material);
  add('doacao', 'Doação de bens / materiais', 'declaracao', 'doacao', material);
  add('atendimento', 'Atendimento realizado na escola', 'declaracao', 'atendimento', pessoa + ' ' + evento + ' doc-entrada-amplo doc-saida-amplo');
  add('servico', 'Realização de serviço', 'declaracao', 'servico', pessoa + ' ' + evento + ' doc-periodo-inicio doc-periodo-fim');
  add('reuniao', 'Participação em reunião / conselho', 'declaracao', 'participacao', pessoa + ' ' + evento);
  add('declaracao-livre', 'Declaração institucional / outro assunto', 'declaracao', 'livre', 'doc-fatos');
  const demandas = [
    ['materiais','Solicitação de materiais e suprimentos'], ['equipamentos','Solicitação de equipamentos / mobiliário'],
    ['manutencao','Manutenção / reparo / infraestrutura'], ['informatica','Informática / internet / suporte técnico'],
    ['alimentacao','Alimentação escolar / merenda'], ['agua','Abastecimento de água / energia'],
    ['seguranca','Segurança / vigilância / controle de acesso'], ['acessibilidade','Acessibilidade / adaptações'],
    ['formacao','Formação / capacitação de profissionais'], ['remanejamento','Remanejamento / lotação de pessoal'],
    ['carga-horaria','Alteração de jornada / carga horária'], ['abono','Solicitação de análise de abono de ponto'],
    ['documentacao','Regularização / solicitação de documentos'], ['recursos','Solicitação de apoio / recursos'],
    ['projeto-escolar','Solicitação relativa a projeto / evento'], ['inclusao','Atendimento e apoio educacional'],
    ['busca-ativa','Busca ativa / acompanhamento de frequência']
  ];
  for (const [id,nome] of demandas) add('memo-' + id, nome, 'memorando', 'solicitacao', 'doc-demanda doc-fatos doc-finalidade-ampla doc-documentos-amplos');
  add('memo-encaminhamento','Encaminhamento de documentos / informações','memorando','encaminhamento','doc-demanda doc-documentos-amplos doc-fatos');
  add('memo-resposta','Resposta a solicitação / diligência','memorando','resposta','doc-demanda doc-fatos doc-documentos-amplos');
  add('memo-informacao','Comunicação de fato / ocorrência','memorando','informacao','doc-fatos doc-data-fato doc-acoes');
  add('memo-prestacao','Prestação de informações / contas','memorando','informacao','doc-fatos doc-documentos-amplos doc-acoes');
  add('memo-livre','Memorando de assunto livre','memorando','livre','doc-fatos doc-demanda');
  add('memo-renovacao','Solicitação de renovação de contrato','memorando','renovacao','doc-pessoa doc-identificacao doc-qualificacao doc-periodo-inicio doc-periodo-fim doc-prazo-amplo doc-finalidade-ampla');
  add('requerimento-amplo','Requerimento de aluno, responsável ou outra pessoa','requerimento','requerimento',pessoa + ' doc-demanda doc-finalidade-ampla doc-documentos-amplos');
  add('oficio-solicitacao','Ofício de solicitação','oficio','solicitacao','doc-demanda doc-fatos doc-finalidade-ampla doc-documentos-amplos');
  add('oficio-encaminhamento','Ofício de encaminhamento','oficio','encaminhamento','doc-demanda doc-fatos doc-documentos-amplos');
  add('oficio-resposta','Ofício de resposta','oficio','resposta','doc-demanda doc-fatos doc-documentos-amplos');
  add('oficio-livre','Ofício de assunto livre','oficio','livre','doc-fatos doc-demanda');
  add('comunicado','Comunicado / aviso','comunicado','informacao','doc-fatos doc-data-fato doc-local-amplo doc-acoes');
  add('convocacao','Convocação / convite para reunião','convocacao','convocacao',evento + ' doc-entrada-amplo doc-fatos');
  add('relatorio','Relatório de atividade / ocorrência','relatorio','relatorio',evento + ' doc-fatos doc-acoes');
  add('ata','Minuta de ata de reunião','ata','ata',evento + ' doc-pessoa doc-entrada-amplo doc-fatos doc-acoes');
  add('termo-recebimento','Termo de recebimento','termo','recebimento',material);
  add('termo-entrega','Termo de entrega','termo','entrega',material);
  add('termo-devolucao','Termo de devolução','termo','devolucao',material);
  add('termo-livre','Termo de assunto livre','termo','livre','doc-fatos doc-pessoa');
  add('autorizacao','Autorização para atividade (minuta para assinatura)','autorizacao','autorizacao',pessoa + ' doc-responsavel-amplo ' + evento + ' doc-fatos');
  add('recibo','Recibo de materiais / documentos','recibo','recebimento',material + ' doc-pessoa');
  const catalogo = Object.freeze(modelos);
  const indiceModelos = new Map(catalogo.map(m => [m.id,m]));
  const porId = id => indiceModelos.get(id);
  const CAMPOS = Object.freeze([...Object.keys(F), 'doc-modelo-amplo','doc-genero-amplo','doc-texto-gerado','doc-dados-reconhecidos']);
  const generos = Object.freeze({ declaracao:'DECLARAÇÃO', memorando:'MEMORANDO', requerimento:'REQUERIMENTO', oficio:'OFÍCIO', comunicado:'COMUNICADO', convocacao:'CONVOCAÇÃO', relatorio:'RELATÓRIO', ata:'ATA', termo:'TERMO', autorizacao:'AUTORIZAÇÃO', recibo:'RECIBO' });
  const MESES = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  function dataValida(s) { if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || +s.slice(0,4)<1900 || +s.slice(0,4)>2199) return false; const t=Date.parse(s+'T12:00:00Z'); return Number.isFinite(t) && new Date(t).toISOString().slice(0,10)===s; }
  function hojeBrasil() { const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value])); return p.year+'-'+p.month+'-'+p.day; }
  const br = s => dataValida(s) ? s.slice(8)+'/'+s.slice(5,7)+'/'+s.slice(0,4) : s;
  function datas(texto, hoje) {
    const n=normalizar(texto), lista=[];
    const inserir=(m,s)=>{if(!dataValida(s))throw new Error('Data inválida: '+m[0]+'. Confira dia, mês e ano.');lista.push({valor:s,index:m.index,fim:m.index+m[0].length});};
    const iso=(a,m,d)=>`${a}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    for(const m of n.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g))inserir(m,iso(m[1],m[2],m[3]));
    for(const m of n.matchAll(/\b(\d{1,2})[/.](\d{1,2})[/.](\d{4})\b/g))inserir(m,iso(m[3],m[2],m[1]));
    for(const m of n.matchAll(new RegExp('\\b(\\d{1,2}) de ('+MESES.join('|')+') de (\\d{4})\\b','g')))inserir(m,iso(m[3],MESES.indexOf(m[2])+1,m[1]));
    for(const m of n.matchAll(/\b(hoje|ontem|amanha)\b/g))inserir(m,new Date(Date.parse(hoje+'T12:00:00Z')+(m[1]==='hoje'?0:m[1]==='ontem'?-1:1)*86400000).toISOString().slice(0,10));
    return lista.sort((a,b)=>a.index-b.index);
  }
  function seguro(x,max,rotulo) { if(typeof x!=='string'||x.length>max)throw new Error('Confira o tamanho de '+rotulo+'.'); if(/<\/?[a-z]|```/i.test(x))throw new Error('Use somente texto, sem HTML ou código, em '+rotulo+'.');return limpar(x); }
  const escaparRegex=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const aliases=new Map(Object.entries(F).flatMap(([id,d])=>d[2].map(a=>[a,id])));
  const padraoRotulos='(^|[\\n;,]|[.!?]\\s+|\\s{2,})[ \\t]*('+[...aliases.keys()].sort((a,b)=>b.length-a.length).map(escaparRegex).join('|')+')[ \\t]*:[ \\t]*';
  function extrairRotulos(texto) {
    const re=new RegExp(padraoRotulos,'gm');
    const encontrados=[...normalizar(texto).matchAll(re)], campos={}, intervalos=[];
    encontrados.forEach((m,i)=>{const ini=m.index+m[0].length;const fim=Math.min(i+1<encontrados.length?encontrados[i+1].index:texto.length, texto.indexOf('\n',ini)<0?texto.length:texto.indexOf('\n',ini));campos[aliases.get(m[2])]=texto.slice(ini,fim).trim().replace(/[;,.]+$/,'').trim();intervalos.push([m.index,fim]);});
    let livre='',inicio=0; for(const[a,b]of intervalos){livre+=texto.slice(inicio,a)+'\n';inicio=b;} livre+=texto.slice(inicio);
    return {campos,livre:limpar(livre)};
  }
  function tirarInicioPedido(texto) {
    let t=limpar(texto).replace(/^(?:(?:oi|ol[aá]|chat|bom dia|boa tarde|boa noite|por favor|pfv)[,!:. ]+)*/iu,'');
    t=t.replace(/^(?:(?:voc[eê]|vc)\s+)?(?:pode|poderia|consegue)\s+(?:me\s+)?/iu,'')
      .replace(/^(?:eu\s+)?(?:preciso|quero|gostaria)(?:\s+de|\s+que\s+(?:(?:voc[eê]|vc)\s+)?)?\s+/iu,'')
      .replace(/^(?:me\s+)?(?:fa[cç]a|fazer|crie|criar|elabore|elaborar|prepare|preparar|redija|redigir|gere|gerar|monte|montar|mand[ae]r?)\s+(?:(?:para|pra)\s+mim\s+)?/iu,'');
    return t;
  }
  function cabecalhoNatural(texto) {
    const t=tirarInicioPedido(texto);
    // Só a identificação inicial do documento, nunca números citados em referências.
    const m=/^(?:um(?:a)?\s+)?(memorando|memo|of[ií]cio|documento)\s*(?:(?:de\s+)?(?:n[uú]mero|n[º°o]?\.?|nro\.?|num\.?|#)\s*[:.º°-]?\s*)?(\d{1,8}(?:\s*\/\s*\d{4})?)(?=$|[\s,;.])/iu.exec(t);
    return m?{numero:m[2].replace(/\s/g,''),livre:m[1]+' '+t.slice(m[0].length).replace(/^[,;: ]+/,'')}:{numero:'',livre:texto};
  }
  function numeracao(numero,data) {
    const partes=limpar(numero).split(/\s*\/\s*/);
    return {numero:partes[0],ano:partes[1]||data?.slice(0,4)||hojeBrasil().slice(0,4)};
  }
  function tirarInstrucao(texto) {
    let t=tirarInicioPedido(texto);
    t=t.replace(/^(?:um(?:a)?\s+)?(?:declara[cç][aã]o|memorando|memo|of[ií]cio|requerimento|comprovante|comunicado|aviso|convoca[cç][aã]o|relat[oó]rio|ata|termo|autoriza[cç][aã]o|recibo)(?:\s+(?:institucional|personalizad[oa]|livre))?(?:\s+(?:(?:falando|tratando)\s+sobre|sobre|informando|declarando|dizendo|comprovando|para (?:declarar|informar|comprovar))(?=\s|$)|\s*[:,-])?\s*/iu,'');
    t=t.replace(/^(?:comprovar|declarar|atestar|confirmar)\s+(?=que\b)/iu,'');
    return t.replace(/^(?:de\s+)?que\s+/iu,'que ').trim();
  }
  function reconhecer(pedido, campos = {}) {
    const n=normalizar(pedido).replace(/\b(?:declaracoa|declarasao)\b/g,'declaracao').replace(/\b(?:memoradno|memo)\b/g,'memorando'), explicito=/\b(declaracao|memorando|requerimento|oficio|comunicado|aviso|convocacao|relatorio|ata|termo|autorizacao|recibo)\b/.exec(n)?.[1];
    const negacao=/\b(?:nao|nunca|sem)\b/.test(n);
    if(explicito==='requerimento'&&!/\bservidor|\bfuncional/.test(n))return 'requerimento-amplo';
    if(explicito==='recibo')return 'recibo';
    if(explicito==='ata')return 'ata';
    if(explicito==='relatorio')return 'relatorio';
    if(explicito==='autorizacao')return 'autorizacao';
    if(explicito==='convocacao')return 'convocacao';
    if(explicito==='comunicado'||explicito==='aviso')return 'comunicado';
    if(explicito==='termo')return /devol/.test(n)?'termo-devolucao':/entreg/.test(n)?'termo-entrega':/receb/.test(n)?'termo-recebimento':'termo-livre';
    if(explicito==='oficio')return /encaminh/.test(n)?'oficio-encaminhamento':/respost|respond/.test(n)?'oficio-resposta':/solicit|pedid|pedind|requer|providenc/.test(n)?'oficio-solicitacao':'oficio-livre';
    const declaracao=explicito==='declaracao'||(!explicito&&/\b(?:declarar|declaramos|comprovante|comprovar|comprovando|atestar|recebeu|recebemos|ganhamos|compareceu|matriculad[oa])\b/.test(n));
    if(declaracao) {
      if(negacao)return 'declaracao-livre';
      if(/\bfuncional\b/.test(n))return 'legado:declaracao';
      if(/\b(?:recebimento|recebeu|recebemos|ganhamos|recebid[oa]s?)\b/.test(n))return 'recebimento';
      if(/\b(?:devolucao|devolveu|devolvemos)\b/.test(n))return 'devolucao';
      if(/\b(?:entrega|entregou|entregamos|entregue)\b/.test(n))return 'entrega';
      if(/\bdoacao\b/.test(n))return 'doacao';
      if(/\bcomparec|\bpresenca|\b(?:veio|esteve)\s+(?:aqui|na escola|a escola)\b/.test(n))return /\b(?:responsavel|mae|pai|genitor)\b/.test(n)?'comparecimento-responsavel-amplo':/\balun[oa]|\bestudante/.test(n)?'comparecimento-aluno':'comparecimento-pessoa';
      if(/\bservidor|\bcontratad[oa]\b/.test(n)&&!/\balun[oa]|\bestudante/.test(n))return 'legado:declaracao';
      if(/\bmatricula|\bmatriculad/.test(n)&&/\bfrequencia|\bfrequenta/.test(n))return 'matricula-frequencia';
      if(/\bfrequencia|\bfrequenta/.test(n))return 'frequencia';
      if(/\btransferencia/.test(n))return 'transferencia';
      if(/\bconclu/.test(n))return 'conclusao';
      if(/\bescolaridade/.test(n))return 'escolaridade';
      if(/\bvaga\b/.test(n))return 'vaga';
      if(/\bturno|\bhorario escolar/.test(n)&&!/\bmatricula|\bmatriculad/.test(n))return 'turno';
      if(/\bmatricula|\bmatriculad/.test(n))return 'matricula';
      if(/\b(?:alun[oa]|estudante)\b/.test(n)&&/\b(?:estuda|estudando|cursa)\b/.test(n))return 'matricula';
      if(/\bparticip/.test(n))return /\breuniao|\bconselho/.test(n)?'reuniao':'participacao';
      if(/\b(?:realizacao|realizou|promoveu|palestra)\b/.test(n))return 'realizacao';
      if(/\bservico|\bmanutencao/.test(n))return 'servico';
      if(/\batendimento/.test(n))return 'atendimento';
      if(/\bfuncional\b|\bservidor|\bcontratad[oa]\b/.test(n))return 'legado:declaracao';
      return 'declaracao-livre';
    }
    if(explicito==='requerimento')return 'legado:requerimento';
    if(/\brenova\w*\s+(?:d[eo]\s+)?(?:o\s+)?contrato\b|\bcontrato\b[^.;\n]{0,50}\brenova/.test(n)&&!negacao)return 'memo-renovacao';
    // Os modelos oficiais de pessoal, transporte e calendário continuam no motor original.
    if(/\bprorrog|\bsubstituicao|\bcontratacao|\bcontratar|\bcalendario|\bsabado letivo|\bzeladoria|\bserventes?\b|\btransporte|\bonibus|\bexcursao|\bestagio|\bavanco de nivel/.test(n))return 'legado:auto';
    for(const[id,re]of [
      ['memo-resposta',/\brespost|\brespond|\bdiligencia/],['memo-encaminhamento',/\bencaminh/],['memo-prestacao',/\bprestacao|\bcontas\b/],
      ['memo-informacao',/\binformar|\bcomunicar|\bocorrencia/],['memo-busca-ativa',/\bbusca ativa|\bevasao/],
      ['memo-abono',/\babono|\babonar/],['memo-manutencao',/\bmanutencao|\breparo|\bconserto|\btelhado|\binfiltracao/],
      ['memo-informatica',/\binformatica|\binternet|\bcomputador|\bimpressora|\bsuporte tecnico/],['memo-alimentacao',/\bmerenda|\balimentacao/],
      ['memo-agua',/\bagua\b|\benergia|\beletric/],['memo-seguranca',/\bseguranca|\bvigilancia/],['memo-acessibilidade',/\bacessibilidade|\brampa/],
      ['memo-formacao',/\bcapacitacao|\bformacao/],['memo-remanejamento',/\bremanejamento|\blotacao/],['memo-carga-horaria',/\bcarga horaria|\bjornada/],
      ['memo-documentacao',/\bdocumentacao|\bregularizacao|\bcertidao/],['memo-equipamentos',/\bequipamento|\bmobiliario|\bcarteiras|\bmesas/],
      ['memo-materiais',/\bmateriais|\bsuprimentos|\bpapel\b/],['memo-inclusao',/\binclusao|\bapoio educacional/],['memo-projeto-escolar',/\bprojeto|\bevento/],['memo-recursos',/\brecursos|\bapoio/]
    ])if(re.test(n))return id;
    if(campos['doc-pessoa'] && campos['doc-turma'] && !explicito)return 'declaracao-livre';
    return 'memo-livre';
  }
  function extrairNaturais(texto, c, hoje, avisos, modelo) {
    const n=normalizar(texto), pegar=(id,re)=>{if(c[id])return;const m=re.exec(texto);if(m)c[id]=limpar(m[1]).replace(/[,.; ]+$/,'');};
    if(['memorando','oficio'].includes(modelo?.genero)){
      const destinatario=/^(?:para\s+|à\s+|ao\s+)(.+?)\s*,?\s+(?=(?:solicitando|pedindo|requerendo|encaminhando)\b)/iu.exec(texto);
      const id=modelo.genero==='memorando'?'doc-para':'doc-destino';
      if(destinatario&&!c[id]){
        c[id]=limpar(destinatario[1]).replace(/,$/,'');
        if(c['doc-fatos']?.startsWith(destinatario[0]))c['doc-fatos']=c['doc-fatos'].slice(destinatario[0].length).replace(/^(?:solicitando|pedindo|requerendo)\s+/iu,'solicitar ').replace(/^encaminhando\s+/iu,'encaminhar ');
      }
    }
    if(modelo?.estrutura==='renovacao'){
      pegar('doc-pessoa',/\b(?:servidor(?:a)?|profissional)\s+([\p{L}][\p{L}'’ -]{2,120}?)(?=\s+(?:a partir|apartir|por|pelo prazo|com in[ií]cio|com dura[cç][aã]o|matr[ií]cula|ocupante)|[,;\n.]|$)/iu);
      pegar('doc-pessoa',/\bcontrato\s+(?:de|da|do)\s+([\p{L}][\p{L}'’ -]{2,120}?)(?=\s+(?:a partir|apartir|por|pelo prazo|com in[ií]cio|com dura[cç][aã]o)|[,;\n.]|$)/iu);
      if(!c['doc-qualificacao']){const m=/\b(servidora|servidor|profissional)\s+/iu.exec(texto);if(m)c['doc-qualificacao']=m[1].toLocaleLowerCase('pt-BR');}
      pegar('doc-identificacao',/\bmatr[ií]cula\s*(?:n[º°o.]?\s*)?[:#-]?\s*([\d./-]+)\b/iu);
      for(const d of datas(texto,hoje)){
        const antes=normalizar(texto.slice(Math.max(0,d.index-60),d.index));
        if(/(?:a partir|apartir)(?:\s+(?:da )?data)?\s+de\s*$|(?:inici[oa]|iniciando)(?:\s+em)?\s*$/.test(antes))c['doc-periodo-inicio']||=d.valor;
        if(/(?:ate|termino|fim)(?:\s+(?:em|do periodo))?\s*$/.test(antes))c['doc-periodo-fim']||=d.valor;
      }
      const prazos=[...texto.matchAll(/\b(?:por|durante|prazo\s+de)\s+(?:mais\s+)?(\d{1,4})\s+dias?(?:\s+(corridos|[uú]teis))?\b/giu)];
      if(!c['doc-prazo-amplo']&&prazos.length===1)c['doc-prazo-amplo']=prazos[0][1]+' dias'+(prazos[0][2]?' '+prazos[0][2]:'');
      if(prazos.length>1)avisos.push('Há vários prazos no pedido. Informe o prazo solicitado no campo próprio.');
      pegar('doc-finalidade-ampla',/\b(?:sendo\s+necess[aá]ri[oa]|necess[aá]ri[oa])\s+(.+?)\s*[.!]?$/iu);
    }
    if(['memorando','oficio'].includes(modelo?.genero))pegar('doc-finalidade-ampla',/\b(?:porque|pois|uma vez que|tendo em vista que)\s+(.+?)\s*[.!]?$/iu);
    pegar('doc-pessoa',/\b(?:alun[oa]|estudante|participante|visitante)\s*(?:de nome|chamad[oa]|:)?\s+([\p{L}][\p{L}'’ -]{2,120}?)(?=\s+(?:do|da|no|na)\s+(?:\d|primeir|segund|terceir|quart|quint)|\s+(?:que\s+)?(?:est[aá]|encontra|matriculad|compareceu|participou|frequenta|concluiu|recebeu|esteve|estuda|cursa|veio|no dia|nascid)|[,;\n.]|$)/iu);
    pegar('doc-pessoa',/^(?:que\s+)?([\p{L}][\p{L}'’ -]{2,100}?)\s+(?:est[aá]|encontra-se)\s+matriculad[oa]\b/iu);
    pegar('doc-responsavel-amplo',/\b(?:respons[aá]vel|m[aã]e|pai)\s+([\p{L}][\p{L}'’ -]{2,120}?)(?=\s+(?:compareceu|participou|esteve|veio|pelo|pela|do aluno|da aluna)|[,;\n.]|$)/iu);
    pegar('doc-turma',/\b(?:turma|matriculad[oa]\s+n[oa]|d[oa])\s*(\d{1,2}\s*[º°ªo]?\s*(?:ano|s[eé]rie)\s*(?:[A-F]\b)?)/iu);
    pegar('doc-turma',/\b(?:turma|d[oa]|n[oa])\s*(\d\s*[A-F])\b/iu);
    if(!c['doc-turma']){
      const m=/\b(primeir[oa]|segund[oa]|terceir[oa]|quart[oa]|quint[oa])\s+(?:ano|s[eé]rie)(?:\s+([A-F])\b)?/iu.exec(texto);
      if(m){const numero={primeiro:1,segundo:2,terceiro:3,quarto:4,quinto:5}[normalizar(m[1]).replace(/a$/,'o')];c['doc-turma']=numero+'º ano'+(m[2]?' '+m[2].toUpperCase():'');}
    }
    pegar('doc-ano-letivo',/\bano letivo\s*(?:de|:)?\s*(\d{4})\b/iu);
    if(!c['doc-ano-letivo']&&/\b(?:neste|nesse|este|esse) ano\b/.test(n))c['doc-ano-letivo']=hoje.slice(0,4);
    pegar('doc-turno-amplo',/\bturno\s+(matutino|vespertino|noturno|integral)\b/iu);
    if(!c['doc-turno-amplo'])pegar('doc-turno-amplo',/\b(matutino|vespertino|noturno|integral)\b/iu);
    if(!c['doc-turno-amplo']){const m=/\b(?:de|da|pela|a|à)\s+(manh[aã]|tarde|noite)\b/iu.exec(texto);if(m)c['doc-turno-amplo']={manha:'matutino',tarde:'vespertino',noite:'noturno'}[normalizar(m[1])];}
    pegar('doc-finalidade-ampla',/\bpara\s+(apresenta[cç][aã]o\s+[^.;\n]+|comprova[cç][aã]o\s+[^.;\n]+|fins\s+de\s+[^.;\n]+|instruir\s+[^.;\n]+)/iu);
    if(!c['doc-situacao-ampla']&&/\bfrequenta(?:ndo)? regularmente\b/.test(n))c['doc-situacao-ampla']='Frequenta regularmente as atividades escolares';
    if(!c['doc-situacao-ampla'])pegar('doc-situacao-ampla',/\bfrequ[eê]ncia\s*(?:de|:)\s*(\d{1,3}(?:[,.]\d{1,2})?\s*%)/iu);
    if(!c['doc-situacao-ampla'])pegar('doc-situacao-ampla',/\bconcluiu\s+([^.;\n]{3,160})/iu);
    if(!c['doc-situacao-ampla'])pegar('doc-situacao-ampla',/\btransfer[eê]ncia\s+((?:foi\s+)?(?:solicitada|conclu[ií]da|efetivada|emitida|pendente)[^.;\n]*)/iu);
    pegar('doc-projeto',/\b((?:Projeto|Programa)\s+[\p{L}0-9][\p{L}0-9 ()'’–-]{1,150}?)(?=,|;|\n|\.|\s+(?:no dia|em decorr[eê]ncia|para|que|ap[oó]s|realizad|fornec|entreg|receb|durante|em\s+\d)|$)/iu);
    if(!c['doc-data-fato']){const d=datas(texto,hoje);if(d.length===1)c['doc-data-fato']=d[0].valor;else if(d.length>1)avisos.push('Há várias datas no pedido. Confira a data do fato e o período nos campos próprios.');}
    if(/\b(?:hoje|ontem|amanha)\b/.test(n))avisos.push('Datas relativas interpretadas no horário de Brasília. Confira a data do fato.');
    const h=/\b(?:das|de)\s*(\d{1,2}(?:(?::|h)\d{2})?h?)\s*(?:às|as|a|at[eé](?: as| às)?)\s*(\d{1,2}(?:(?::|h)\d{2})?h?)\b/iu.exec(texto);
    if(h){c['doc-entrada-amplo']||=h[1];c['doc-saida-amplo']||=h[2];}
    if(!c['doc-bens']) {
      const m=/\b(?:recebeu|recebemos|ganhamos|recebimento\s+de|entregou|entregamos|entrega\s+de|devolveu|devolvemos|devolu[cç][aã]o\s+de|doa[cç][aã]o\s+de)\s*(?:,\s*(?:no dia\s+)?[^,]+,\s*)?(.{2,240}?)(?=,\s*(?:fornecid|entreg|doad|cedid|pelo|pela|do Projeto|da Associa|em decorr)|\s+(?:fornecid|doad|cedid|pelo Projeto|pela Associa|do Projeto|da Associa|no dia|em\s+\d|em decorr)|[;\n]|$)/iu.exec(texto);
      if(m)c['doc-bens']=m[1].replace(/[. ]+$/,'');
    }
    // Extrai apenas trechos com forma reconhecida. O texto livre é preservado no documento.
    pegar('doc-atividade',/\b(?:participou\s+(?:da|do|de)|realizou\s+(?:uma?|a|o))\s+([^.;\n]{3,180}?)(?=\s+(?:no dia|em\s+\d|promovid|realizad)|[,;\n.]|$)/iu);
    if(!c['doc-atividade'] && /\bpalestra\b/.test(n))c['doc-atividade']='palestra';
  }
  function validarValores(c,hoje) {
    for(const[id,d]of Object.entries(F)){
      if(!c[id])continue;
      if(d[1]==='date') {const lista=datas(c[id],hoje);if(lista.length!==1)throw new Error('Informe uma data completa em '+d[0]+'.');c[id]=lista[0].valor;}
      if(d[1]==='time') {const m=/^(\d{1,2})(?:(?::|h)(\d{2})?)?h?$/.exec(normalizar(c[id]));if(!m||+m[1]>23||+(m[2]||0)>59)throw new Error('Horário inválido em '+d[0]+'. Use HH:MM.');c[id]=m[1].padStart(2,'0')+':'+(m[2]||'00');}
    }
    if(c['doc-ano-letivo']&&!/^(19|20|21)\d{2}$/.test(c['doc-ano-letivo']))throw new Error('Informe o ano letivo com quatro algarismos.');
    if(c['doc-periodo-inicio']&&c['doc-periodo-fim']&&c['doc-periodo-fim']<c['doc-periodo-inicio'])throw new Error('O fim do período deve ser igual ou posterior ao início.');
    if(c['doc-entrada-amplo']&&c['doc-saida-amplo']&&c['doc-saida-amplo']<=c['doc-entrada-amplo'])throw new Error('Confira os horários: a saída deve ser posterior à entrada. Para períodos que atravessam a meia-noite, descreva as datas e horários em Fatos.');
    if(c['doc-numero']){c['doc-numero']=c['doc-numero'].replace(/\s/g,'');if(!/^\d{1,8}(?:\/(?:19|20|21)\d{2})?$/.test(c['doc-numero']))throw new Error('Informe um número de documento válido, com até oito algarismos e, opcionalmente, o ano.');}
    if(c['doc-prazo-amplo']&&!/^(?:[1-9]\d{0,3})(?:\s+dias?(?:\s+(?:corridos|úteis|uteis))?)?$/.test(c['doc-prazo-amplo']))throw new Error('Informe um prazo de 1 a 9999 dias e indique se são úteis, quando aplicável.');
  }
  function organizarRelato(texto){
    return limpar(texto).replace(/^(?:de\s+)?que\s+/iu,'')
      .replace(/^(?:de\s+)?recebimento\s+de\s+/iu,'a '+ESCOLA+' recebeu ')
      .replace(/^(?:(?:n[oó]s|a gente)\s+)?(?:recebemos|ganhamos)\s+/iu,'a '+ESCOLA+' recebeu ')
      .replace(/^a gente\s+(?:recebeu|ganhou)\s+/iu,'a '+ESCOLA+' recebeu ')
      .replace(/^(?:(?:a\s+)?(?:nossa|esta|essa)\s+escola|a escola(?!\s+municipal))\b/iu,'a '+ESCOLA);
  }
  function substituirTrecho(texto,anterior,novo){
    if(!anterior)return texto;
    return texto.replace(new RegExp('(^|[^\\p{L}\\p{N}])'+escaparRegex(anterior)+'(?=$|[^\\p{L}\\p{N}])','gu'),(_m,borda)=>borda+novo);
  }
  function substituirCampo(texto,id,anterior,novo,hoje){
    if(['doc-data','doc-numero','doc-para','doc-ac','doc-setor','doc-assunto'].includes(id))return texto; // Cabeçalho separado do corpo.
    if(F[id]?.[1]==='date'&&dataValida(anterior)){
      for(const d of datas(texto,hoje).filter(d=>d.valor===anterior).reverse())texto=texto.slice(0,d.index)+br(novo)+texto.slice(d.fim);
      return texto;
    }
    return substituirTrecho(texto,anterior,novo);
  }
  function acrescentarAntesFecho(texto,adicional){
    const fecho=/(?:\n\s*\n)?(?:Por ser express[aã]o da verdade[^\n]*|Nestes termos, pe[cç]o deferimento\.?)(?:\s*)$/iu.exec(texto);
    return fecho?texto.slice(0,fecho.index).trim()+'\n\n'+frase(adicional)+'\n\n'+fecho[0].trim():texto.trim()+'\n\n'+frase(adicional);
  }
  function intencaoRevisao(texto){
    const n=normalizar(texto).replace(/^[, ]*(?:por favor[, ]*|(?:voce |vc )?(?:pode|consegue)\s+)*/,'').replace(/[, .!?]+$/,'').replace(/\s+(?:por favor|pfv)$/,'');
    if(/^(?:(?:deix[ae]|deixar|torne|tornar)\s+)(?:(?:o|esse|este|meu)\s+)?(?:(?:texto|documento|memorando|pedido|ele)\s+)?(?:mais|bem)\s+formal$|^formaliz(?:e|a|ar)(?:\s+(?:(?:o|esse|este)\s+)?(?:texto|documento|memorando|pedido|ele))?$/.test(n))return 'formalizar';
    if(/^(?:(?:deix[ae]|deixar|torne|tornar)\s+)(?:(?:o|esse|este|meu)\s+)?(?:(?:texto|documento|memorando|pedido|ele)\s+)?(?:mais|bem)\s+(?:completo|detalhado)$|^(?:complement[ae]|complemente|completar|complet[ae]|desenvolva)(?:\s+(?:(?:o|esse|este)\s+)?(?:texto|documento|memorando|pedido|ele))?$/.test(n))return 'completar';
    if(/^(?:melhor[ae]|melhorar|revise|reescreva|aperfeicoe)(?:\s+(?:(?:o|esse|este)\s+)?(?:texto|documento|memorando|pedido|ele))?$/.test(n))return 'melhorar';
    return '';
  }
  function justificativa(texto){
    const t=limpar(texto).replace(/^para\s+a\s+continuidade\s+de\s+atividades\b/iu,'assegurar a continuidade das atividades').replace(/^para\s+(?=assegurar|garantir|manter)/iu,'');
    return /^(?:assegurar|garantir|manter|viabilizar)\b/iu.test(t)?'A solicitação tem por finalidade '+terminar(t):'A solicitação justifica-se pelo seguinte motivo: '+frase(t);
  }
  function organizarDemanda(texto){
    let t=limpar(texto).replace(/\s*,?\s*(?:porque|pois|uma vez que|tendo em vista que)\s+[\s\S]*$/iu,'');
    t=t.replace(/^(?:(?:a gente|n[oó]s)\s+)?(?:precisa(?:mos)?|estamos precisando)\s+(?:de|que)\s+/iu,'').replace(/^(?:solicitar|solicite|solicitando|solicitamos|solicito|pedir|pedindo|pe[cç]o|requerer|requerendo|requeiro|encaminhar|encaminhe|encaminhando|encaminhamos)\s+/iu,'').replace(/^para\s+(?:solicitar|pedir|requerer|encaminhar)\s+/iu,'');
    t=t.replace(/^(?:arrum(?:ar|e|em)|consert(?:ar|e|em)|repar(?:ar|e|em))\s+(o|a|os|as)\s+/iu,(_m,a)=>'o reparo '+({o:'do',a:'da',os:'dos',as:'das'}[a.toLowerCase()])+' ');
    return t;
  }
  function revisarDocumento(entrada,legado,campos,acao){
    let texto=legado.revisar(entrada.modelo_base||'',acao==='completar'?'melhorar':acao,entrada.funcionarios||[],campos);
    const m=porId(campos['doc-modelo-amplo']);
    if(acao==='completar'&&m?.genero==='memorando'&&!/\b(?:provid[eê]ncias\s+(?:administrativas\s+)?cab[ií]veis|[àa]\s+disposi[cç][aã]o)\b/iu.test(texto))texto=acrescentarAntesFecho(texto,'Diante do exposto, solicitamos a análise do pedido e a adoção das providências administrativas cabíveis');
    return texto;
  }
  function interpretarComplemento(pedido,campos,corpo,hoje){
    const alterados={},substituicoes=[],perguntas=[],livres=[];
    const perguntar=pergunta=>perguntas.push({campo:'ia-extra-pedido',pergunta});
    const mapa={nome:'doc-pessoa','nome do aluno':'doc-pessoa','nome da aluna':'doc-pessoa','nome do servidor':'doc-pessoa','nome da servidora':'doc-pessoa',aluno:'doc-pessoa',aluna:'doc-pessoa',estudante:'doc-pessoa','nome do responsavel':'doc-responsavel-amplo','nome da responsavel':'doc-responsavel-amplo',turma:'doc-turma',data:campos['doc-periodo-inicio']?'doc-periodo-inicio':'doc-data-fato','data do fato':'doc-data-fato','data inicial':'doc-periodo-inicio','data de inicio':'doc-periodo-inicio','data final':'doc-periodo-fim','data de termino':'doc-periodo-fim','data de emissao':'doc-data',turno:'doc-turno-amplo',projeto:'doc-projeto',finalidade:'doc-finalidade-ampla',quantidade:'doc-bens',numero:'doc-numero','numero do memorando':'doc-numero','numero do documento':'doc-numero',destinatario:'doc-para',para:'doc-para',setor:'doc-setor',assunto:'doc-assunto','a/c':'doc-ac',prazo:'doc-prazo-amplo'};
    const nomes=Object.keys(mapa).sort((a,b)=>b.length-a.length).join('|');
    let detectado=false,revisao='';
    for(const parte of pedido.split(/[;\n]+|\s+e\s+(?=(?:troque|altere|mude|corrija|inclua|adicione|acrescente|deixe|melhore|complete|complemente|formalize)\b)/iu).map(limpar).filter(Boolean)){
      const n=normalizar(parte);
      const estilo=intencaoRevisao(parte);if(estilo){detectado=true;revisao=estilo;continue;}
      const rotulo=/^([^:]+):/.exec(n);if(rotulo&&aliases.has(rotulo[1].trim())){livres.push(parte);continue;}
      const literal=/^(?:troque|substitua|altere)\s+["“'](.+?)["”']\s+(?:por|para)\s+["“'](.+?)["”']\s*[.!]?$/iu.exec(parte);
      if(literal){detectado=true;if(substituirTrecho(corpo,literal[1],'')===corpo)perguntar('Não encontrei “'+literal[1]+'” no documento atual. Confira o trecho que deseja substituir.');else substituicoes.push({antes:literal[1],depois:literal[2]});continue;}
      const m=new RegExp('^(?:(?:na verdade|corrigindo)[, ]+)?(?:(?:troque|altere|mude|corrija|atualize|coloque)\\s+)?(?:o |a )?('+nomes+')(?:\\s+(?:correto|correta|certo|certa))?\\s*(?:para|por|e|:|=)\\s+(.+?)\\s*[.!]?$','iu').exec(n);
      const quantidade=/^(?:na verdade[, ]*)?(?:foram|s[aã]o)\s+(\d+\s+[^,;.]+?)\s*[.!]?$/iu.exec(parte);
      if(m||quantidade){
        detectado=true;
        const chave=m?.[1]||'quantidade',id=mapa[chave];
        let valor=m?parte.slice(m.index+m[0].lastIndexOf(m[2])).replace(/[.!]+$/,'').trim():quantidade[1];
        let quantidadeNova='';
        if(chave==='nome'&&campos['doc-responsavel-amplo']&&campos['doc-pessoa']){perguntar('Qual nome deseja corrigir? Use “nome do aluno” ou “nome do responsável”.');continue;}
        const anterior=campos[id];
        const cabecalho=['doc-data','doc-numero','doc-para','doc-ac','doc-setor','doc-assunto'].includes(id);
        if(!anterior&&!cabecalho){perguntar('Não identifiquei o valor atual de '+(F[id]?.[0]||chave)+'. Preencha o campo correspondente ou indique o trecho entre aspas.');continue;}
        if(id==='doc-bens'){
          const atual=/^\d+(?:\s*\([\p{L} ]+\))?/u.exec(anterior),novo=/^(\d+)(?:\s+(.+))?$/u.exec(valor);
          if(!atual||!novo){perguntar('Informe a quantidade em algarismos e, se necessário, o material.');continue;}
          const sufixo=limpar(anterior.slice(atual[0].length));
          if(novo[2]&&!normalizar(sufixo).startsWith(normalizar(novo[2]))){perguntar('O material informado é diferente do atual. Indique o trecho completo entre aspas para substituí-lo.');continue;}
          valor=novo[1]+' '+sufixo;
          if(campos['doc-quantidade-ampla'])quantidadeNova=novo[1];
        }
        const constaNoCorpo=cabecalho||(F[id]?.[1]==='date'?datas(corpo,hoje).some(d=>d.valor===anterior):substituirTrecho(corpo,anterior,'')!==corpo);
        if(!constaNoCorpo){perguntar('O valor atual de '+F[id][0]+' nos campos difere do texto. Indique o trecho do documento entre aspas para corrigi-lo.');continue;}
        if(quantidadeNova)alterados['doc-quantidade-ampla']=quantidadeNova;
        alterados[id]=valor;continue;
      }
      if(/^(?:troque|altere|mude|corrija|substitua|na verdade|corrigindo)\b/iu.test(parte)){detectado=true;perguntar('Indique o que deve mudar, por exemplo: “mude a data para 24/10/2026” ou “troque "texto atual" por "novo texto"”.');continue;}
      const livre=parte.replace(/^(?:inclua|adicione|acrescente|complemente|complete)\s+(?:tamb[eé]m\s+)?(?:a informa[cç][aã]o de\s+|com\s+)?(?:que\s+)?/iu,'');
      if(!corpo.includes(frase(livre)))livres.push(livre);
    }
    return{campos:alterados,substituicoes,perguntas,livre:livres.join('\n'),detectado,revisao};
  }
  function redigir(modelo, c, perguntar) {
    const obter=(id,rotulo)=>c[id]||(perguntar(id,rotulo||F[id][0]),'[INFORMAR '+(rotulo||F[id][0]).toLocaleUpperCase('pt-BR')+']');
    const data=()=>br(obter('doc-data-fato'));
    const nome=()=>obter('doc-pessoa')+(c['doc-identificacao']?', identificação: '+c['doc-identificacao']:'');
    const turma=()=>obter('doc-turma');
    const ano=()=>c['doc-ano-letivo']?', no ano letivo de '+c['doc-ano-letivo']:'';
    const turno=()=>c['doc-turno-amplo']?', no turno '+c['doc-turno-amplo']:'';
    const periodo=()=>c['doc-periodo-inicio']&&c['doc-periodo-fim']?' no período de '+br(c['doc-periodo-inicio'])+' a '+br(c['doc-periodo-fim']):c['doc-periodo-inicio']?' a partir de '+br(c['doc-periodo-inicio']):c['doc-periodo-fim']?' até '+br(c['doc-periodo-fim']):'';
    const horario=()=>c['doc-entrada-amplo']&&c['doc-saida-amplo']?', das '+c['doc-entrada-amplo']+' às '+c['doc-saida-amplo']:c['doc-entrada-amplo']?', a partir das '+c['doc-entrada-amplo']:'';
    const local=()=>c['doc-local-amplo']?', em '+c['doc-local-amplo']:'';
    const atividade=()=>obter('doc-atividade');
    const bens=()=>{const b=obter('doc-bens');const q=c['doc-quantidade-ampla'];return q&&!normalizar(b).startsWith(normalizar(q))?q+' '+b:b;};
    const origem=()=>c['doc-projeto']?', com origem em '+c['doc-projeto']:'';
    let p=[], fatosUsados=false;
    switch(modelo.estrutura) {
      case 'matricula':p=[`Declaramos, para os devidos fins, que ${nome()} está matriculado(a) na ${ESCOLA}, na turma ${turma()}${ano()}${turno()}.`];break;
      case 'frequencia':p=[`Declaramos, para os devidos fins, que a situação de frequência escolar de ${nome()}, da turma ${turma()}${ano()}, na ${ESCOLA}${periodo()}, é a seguinte: ${terminar(obter('doc-situacao-ampla','situação de frequência conforme os registros escolares'))}`];break;
      case 'matricula-frequencia':p=[`Declaramos, para os devidos fins, que ${nome()} está matriculado(a) na ${ESCOLA}, na turma ${turma()}${ano()}${turno()}.`,`Quanto à frequência${periodo()}, registra-se: ${terminar(obter('doc-situacao-ampla','situação de frequência conforme os registros escolares'))}`];break;
      case 'escolaridade':p=[`Declaramos, para os devidos fins, que a situação de escolaridade de ${nome()} nesta unidade escolar é: ${terminar(obter('doc-situacao-ampla','etapa cursada e situação escolar confirmada'))}`];break;
      case 'conclusao':p=[`Declaramos, para os devidos fins, que ${nome()} concluiu ${obter('doc-situacao-ampla','etapa / ano concluído e ano de conclusão')}, nesta unidade escolar.`];break;
      case 'transferencia':p=[`Declaramos, para os devidos fins, que a situação relativa à transferência escolar de ${nome()} é: ${terminar(obter('doc-situacao-ampla','situação da transferência e data, conforme os registros'))}`];break;
      case 'vaga':p=[`Declaramos, para os devidos fins, a seguinte situação referente à vaga escolar${c['doc-pessoa']?' de '+c['doc-pessoa']:''}: ${terminar(obter('doc-situacao-ampla','disponibilidade / reserva de vaga, turma e ano letivo'))}`];break;
      case 'turno':p=[`Declaramos, para os devidos fins, que ${nome()}, da turma ${turma()}${ano()}, possui atividades escolares nesta unidade no turno ${obter('doc-turno-amplo')}, das ${obter('doc-entrada-amplo')} às ${obter('doc-saida-amplo')}.`];break;
      case 'comparecimento': {
        const interessado=modelo.id==='comparecimento-responsavel-amplo'?(c['doc-responsavel-amplo']||obter('doc-pessoa','nome do responsável')):nome();
        p=[`Declaramos, para os devidos fins, que ${interessado} compareceu à ${ESCOLA}, no dia ${data()}${horario()}${c['doc-finalidade-ampla']?', para '+c['doc-finalidade-ampla']:''}.`];
        if(modelo.id==='comparecimento-responsavel-amplo'&&c['doc-pessoa']&&c['doc-responsavel-amplo'])p.push('O comparecimento refere-se a assuntos relacionados ao(à) estudante '+c['doc-pessoa']+'.');break;
      }
      case 'participacao':p=[`Declaramos, para os devidos fins, que ${nome()} participou da seguinte atividade: ${atividade()}, em ${data()}${periodo()}${local()}${c['doc-projeto']?', vinculada a '+c['doc-projeto']:''}.`];break;
      case 'realizacao':p=[`Declaramos, para os devidos fins, que a ${ESCOLA} realizou a atividade ${atividade()}, em ${data()}${local()}${c['doc-projeto']?', vinculada a '+c['doc-projeto']:''}.`];break;
      case 'recebimento':p=[`Declaramos, para os devidos fins, que ${c['doc-recebedor']||'a '+ESCOLA} recebeu, no dia ${data()}, os seguintes itens: ${terminar(bens())}${origem()? ' Origem informada: '+terminar(c['doc-projeto']):''}`];break;
      case 'entrega':p=[`Declaramos, para os devidos fins, que a ${ESCOLA} entregou, no dia ${data()}, a ${obter('doc-recebedor','destinatário dos materiais')}, os seguintes itens: ${terminar(bens())}`];break;
      case 'devolucao':p=[`Declaramos, para os devidos fins, que a ${ESCOLA} devolveu, no dia ${data()}, a ${obter('doc-recebedor','destinatário da devolução')}, os seguintes itens: ${terminar(bens())}`];break;
      case 'doacao':p=[`Declaramos, para os devidos fins, o recebimento, por esta unidade escolar, da doação de ${bens()}, proveniente de ${obter('doc-projeto','nome do doador / instituição')}, em ${data()}.`];break;
      case 'atendimento':p=[`Declaramos, para os devidos fins, que ${nome()} recebeu atendimento nesta unidade escolar, em ${data()}${horario()}${c['doc-atividade']?', referente a '+c['doc-atividade']:''}.`];break;
      case 'servico':p=[`Declaramos, para os devidos fins, a realização do seguinte serviço nesta unidade escolar: ${atividade()}, em ${data()}${periodo()}${c['doc-pessoa']?', por '+c['doc-pessoa']:''}.`];break;
      case 'solicitacao':p=[`Solicitamos ${terminar(obter('doc-demanda','providência / pedido detalhado'))}`];break;
      case 'renovacao': {
        const vinculo=/^servidor(?:a)?$/iu.test(c['doc-qualificacao']||'')?(c['doc-qualificacao']==='servidora'?'da servidora ':'do servidor '):'de ';
        p=[`Solicitamos a renovação do contrato ${vinculo}${nome()}${c['doc-prazo-amplo']?', pelo prazo de '+c['doc-prazo-amplo'].replace(/^(\d+)$/,'$1 dias'):''}, a partir de ${br(obter('doc-periodo-inicio','data inicial da renovação'))}${c['doc-periodo-fim']?', com término em '+br(c['doc-periodo-fim']):''}.`];
        break;
      }
      case 'encaminhamento':p=[`Encaminhamos ${terminar(c['doc-demanda']||obter('doc-documentos-amplos','documentos / informações a encaminhar'))}`];break;
      case 'resposta':p=[`Em resposta a ${obter('doc-demanda','identificação da solicitação / documento respondido')}, prestamos as seguintes informações:`,frase(obter('doc-fatos','informações da resposta'))];break;
      case 'informacao':p=[frase(obter('doc-fatos','fato / informação a comunicar'))];break;
      case 'requerimento':p=[`Eu, ${nome()}${c['doc-qualificacao']?', '+c['doc-qualificacao']:''}, venho, respeitosamente, requerer ${terminar(obter('doc-demanda','objeto do requerimento'))}`];break;
      case 'convocacao':p=[`Solicitamos o comparecimento ${c['doc-pessoa']?'de '+c['doc-pessoa']:'das pessoas destinatárias'} para ${atividade()}, em ${data()}${c['doc-entrada-amplo']?', às '+c['doc-entrada-amplo']:''}${local()}.`];break;
      case 'relatorio':p=[`Registro da atividade / ocorrência: ${atividade()}.`,`Data: ${data()}${local()}.`,frase(obter('doc-fatos','descrição dos fatos observados'))];break;
      case 'ata':p=[`Em ${data()}${c['doc-entrada-amplo']?', às '+c['doc-entrada-amplo']:''}${local()}, realizou-se ${atividade()}${c['doc-pessoa']?', com a participação de '+c['doc-pessoa']:''}.`,`Pauta e registros: ${terminar(obter('doc-fatos','pauta e fatos da reunião'))}`];break;
      case 'autorizacao':p=[`Eu, ${obter('doc-responsavel-amplo','nome de quem autoriza')}, autorizo a participação de ${nome()} em ${atividade()}, em ${data()}${local()}.`];break;
      default: {
        const fatos=obter('doc-fatos','fatos que devem constar no documento');
        const relato=organizarRelato(fatos);
        const narrativo=/\b(?:recebeu|recebemos|receber[aá]|realizou|realizar[aá]|participou|compareceu|est[aá]|esteve|foi|ser[aá]|houve|ocorreu|aconteceu)\b/iu.test(relato);
        p=[modelo.genero==='declaracao'&&!/^declaramos\b/i.test(fatos)?(/^que\s/i.test(fatos)||narrativo?'Declaramos, para os devidos fins, que '+terminar(relato):'Declaramos, para os devidos fins, o seguinte: '+frase(fatos)):frase(fatos)];
      }
    }
    // Para pedidos narrativos completos, conserva a descrição e dá a ela forma de declaração.
    // Isso evita repetir o pedido e mantém os detalhes que não têm campo específico.
    if(c['doc-fatos']&&modelo.genero==='declaracao'&&['recebimento','entrega','devolucao'].includes(modelo.estrutura)) {
      const verbo={recebimento:'recebeu',entrega:'entregou',devolucao:'devolveu'}[modelo.estrutura];
      const re=new RegExp('^(?:de\\s+)?'+(modelo.estrutura==='devolucao'?'devolu[cç][aã]o':modelo.estrutura)+'\\s+(?:de|dos|das)\\s+','i');
      let relato=organizarRelato(c['doc-fatos'].replace(/^declaramos,?\s*(?:para os devidos fins,?\s*)?/i,''));
      if(re.test(relato)) {
        relato='a '+ESCOLA+' '+verbo+' '+relato.replace(re,'');
        p[0]='Declaramos, para os devidos fins, que '+terminar(relato);fatosUsados=true;
      } else if(new RegExp('\\b'+verbo+'\\b','i').test(relato)&&!/^(?:para|de)\b/i.test(relato)) {
        relato=relato.replace(/^a escola(?!\s+municipal)\b/i,'a '+ESCOLA);
        p[0]='Declaramos, para os devidos fins, que '+terminar(relato);fatosUsados=true;
      }
    }
    if(c['doc-fatos']&&!fatosUsados&&!['livre','resposta','informacao','relatorio','ata'].includes(modelo.estrutura)) {
      const normal=s=>normalizar(s).replace(/\b(\d{1,2})h(\d{2})?\b/g,(_m,h,min)=>h+':'+(min||'00')).replace(/\b0+(\d+)/g,'$1').replace(/[^a-z0-9%]+/g,' ').split(' ');
      const cobertos=new Set(normal(p.join(' ')+Object.values(c).filter((v,i,a)=>v!==c['doc-fatos']&&v!==c['doc-texto-gerado']).join(' ')));
      const termosAdministrativos=new Set(normal('a o as os um uma de do da dos das no na nos nas para por pelo pela pelos pelas em e que esta esta nesta neste escola aluno aluna estudante declaracao matricula matriculado matriculada ano letivo turma turno frequencia escolar seu sua com ao aos precisa preciso quero faca fazer sobre favor solicitar solicite solicitacao pedir'));
      if(c['doc-pessoa']&&['matricula','matricula-frequencia'].includes(modelo.estrutura))for(const t of ['estuda','estudando','cursa','aqui'])termosAdministrativos.add(t);
      if(c['doc-turno-amplo'])for(const t of ['manha','tarde','noite'])termosAdministrativos.add(t);
      if(c['doc-turma']){const numero=/^\d+/.exec(c['doc-turma'])?.[0],ordinais=['','primeiro','segundo','terceiro','quarto','quinto'];if(ordinais[+numero])for(const t of [ordinais[+numero],ordinais[+numero].replace(/o$/,'a')])termosAdministrativos.add(t);}
      if(c['doc-data-fato'])for(const t of ['hoje','ontem','amanha'])termosAdministrativos.add(t);
      if(modelo.estrutura==='comparecimento')for(const t of ['veio','aqui'])termosAdministrativos.add(t);
      if(modelo.id==='comparecimento-responsavel-amplo')for(const t of ['mae','pai','responsavel'])termosAdministrativos.add(t);
      if(modelo.estrutura==='renovacao')for(const t of ['apartir','data','mais','sendo','necessario','necessaria'])termosAdministrativos.add(t);
      const faltantes=normal(c['doc-fatos']).filter(t=>t.length>2&&!cobertos.has(t)&&!termosAdministrativos.has(t));
      if(faltantes.length)p.push('Informações complementares: '+frase(c['doc-fatos']));
    }
    if(c['doc-finalidade-ampla']&&modelo.estrutura!=='comparecimento')p.push(['memorando','oficio'].includes(modelo.genero)?justificativa(c['doc-finalidade-ampla']):'Finalidade / justificativa: '+frase(c['doc-finalidade-ampla']));
    if(c['doc-complementos'])p.push(frase(c['doc-complementos']));
    if(c['doc-acoes'])p.push('Encaminhamentos informados: '+frase(c['doc-acoes']));
    if(c['doc-documentos-amplos']&&modelo.estrutura!=='encaminhamento')p.push('Documentos / referências informados: '+frase(c['doc-documentos-amplos']));
    if(modelo.genero==='declaracao')p.push('Por ser expressão da verdade, firmamos a presente declaração.');
    if(modelo.genero==='requerimento')p.push('Nestes termos, peço deferimento.');
    return p.filter(Boolean);
  }
  function pendencias(campos) {
    const m=porId(campos['doc-modelo-amplo']);if(!m)return [];
    const p=[];redigir(m,campos,(campo,nome)=>{if(!p.some(x=>x.campo===campo))p.push({campo,pergunta:'Informe: '+nome+'.'});});
    return p;
  }
  function preparar(entrada, legado) {
    if(!entrada||typeof entrada!=='object')throw new Error('Pedido inválido.');
    const acao=entrada.acao||'gerar';if(!['gerar','complementar','melhorar','resumir','formalizar'].includes(acao))throw new Error('Ação não reconhecida.');
    const pedido=seguro(entrada.pedido||'',12000,'pedido'), referencia=seguro(entrada.referencia||'',16000,'referência');
    const base=entrada.contexto?.campos||{}, hoje=dataValida(entrada.hoje||'')?entrada.hoje:hojeBrasil();
    const c={};for(const id of CAMPOS)if(typeof base[id]==='string')c[id]=seguro(base[id],id==='doc-texto-gerado'?24000:16000,'campo '+id);
    const correcao=acao==='complementar'?interpretarComplemento(pedido,c,entrada.modelo_base||'',hoje):{campos:{},substituicoes:[],perguntas:[],livre:pedido,detectado:false};
    const extra=extrairRotulos(correcao.livre), avisos=[], perguntas=[...correcao.perguntas];
    const cabecalho=cabecalhoNatural(extra.livre);
    if(cabecalho.numero){extra.campos['doc-numero']||=cabecalho.numero;extra.livre=cabecalho.livre;}
    Object.assign(extra.campos,correcao.campos);
    const perguntar=(campo,nome)=>{if(!perguntas.some(x=>x.campo===campo))perguntas.push({campo,pergunta:'Informe: '+nome+'.'});};
    const selecionado=limpar(entrada.modelo_escolhido||'');
    if(acao==='complementar'&&!porId(c['doc-modelo-amplo'])) {
      const plano=legado.preparar(entrada);
      return {...plano,campos:{...plano.campos,'doc-modelo-amplo':'','doc-genero-amplo':'','doc-texto-gerado':''}};
    }
    let id=entrada.somente_campos?c['doc-modelo-amplo']:acao==='complementar'?c['doc-modelo-amplo']||reconhecer(pedido,extra.campos):selecionado&&selecionado!=='auto'?selecionado:reconhecer(pedido,extra.campos);
    if(acao==='gerar'&&(!pedido&&!entrada.somente_campos)&&!selecionado)throw new Error('Descreva os fatos do documento.');
    if(!porId(id)&&!String(id).startsWith('legado:'))throw new Error('Selecione um modelo disponível.');
    if(['melhorar','resumir','formalizar'].includes(acao)) {
      if(!c['doc-numero']&&cabecalho.numero)c['doc-numero']=cabecalho.numero;
      validarValores(c,hoje);
      const texto=revisarDocumento(entrada,legado,c,acao);
      return {tipo:entrada.contexto?.tipo||'declaracao',campos:{...c,'doc-texto-gerado':texto},principal_id:entrada.principal_id||'',secundario_id:entrada.secundario_id||'',paragrafos:texto.split(/\n\s*\n/).filter(Boolean),perguntas:[],avisos:[texto===entrada.modelo_base?'Não encontrei outros ajustes seguros de redação neste texto.':'A redação foi ajustada preservando os dados do documento. Confira o resultado.'],resumo:texto===entrada.modelo_base?'Texto mantido após a revisão.':'Redação revisada.'};
    }
    if(String(id).startsWith('legado:')) {
      const tipo=id.slice(7), contexto={...(entrada.contexto||{})};if(tipo!=='auto')contexto.tipo=tipo;
      const nomes={declaracao:'Declaração funcional',requerimento:'Requerimento do servidor',prorrogacao:'Prorrogação de contrato',substituicao:'Substituição por afastamento',contratacao:'Contratação',calendario:'Calendário',transporte:'Transporte',zeladoria:'Zeladoria',estagio:'Estágio',avanco:'Avanço de nível'};
      if(tipo!=='auto'&&!Object.hasOwn(nomes,tipo))throw new Error('Modelo oficial inválido.');
      const pedidoLegado=[tipo==='auto'?'':'Tipo: '+nomes[tipo],cabecalho.numero?'Número: '+cabecalho.numero:'',pedido].filter(Boolean).join('\n');
      const plano=legado.preparar({...entrada,contexto,pedido:pedidoLegado});
      plano.campos['doc-modelo-amplo']='';plano.campos['doc-genero-amplo']='';plano.campos['doc-texto-gerado']='';return plano;
    }
    const modelo=porId(id);
    if(acao==='gerar'&&!entrada.somente_campos){
      for(const k of Object.keys(c))if(!['doc-data','doc-numero'].includes(k))delete c[k];
      c['doc-para']='';c['doc-ac']='';c['doc-setor']='';c['doc-destino']='';
    }
    Object.assign(c,extra.campos);
    if(!entrada.somente_campos) {
      const livre=tirarInstrucao(extra.livre);
      if(acao==='complementar') {
        if(livre)c['doc-complementos']=[c['doc-complementos'],frase(livre)].filter(Boolean).join('\n');
      } else if(livre)c['doc-fatos']=c['doc-fatos']?[c['doc-fatos'],livre].join('\n'):livre;
      extrairNaturais(livre,c,hoje,avisos,modelo);
      if(referencia)c['doc-complementos']=[c['doc-complementos'],referencia].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n');
    }
    validarValores(c,hoje);
    if(c['doc-numero']?.includes('/')&&numeracao(c['doc-numero'],c['doc-data']).ano!==(c['doc-data']||hoje).slice(0,4))avisos.push('O ano da numeração difere da data de emissão. A numeração informada foi preservada; confira o cabeçalho.');
    if(correcao.detectado){
      for(const id of Object.keys(correcao.campos))for(const texto of ['doc-fatos','doc-complementos'])if(c[texto]&&base[id])c[texto]=substituirCampo(c[texto],id,base[id],c[id],hoje);
      for(const s of correcao.substituicoes)for(const id of Object.keys(c))if(!['doc-dados-reconhecidos','doc-texto-gerado'].includes(id))c[id]=substituirTrecho(c[id],s.antes,s.depois);
      validarValores(c,hoje);
    }
    if((acao==='complementar'||entrada.somente_campos)&&c['doc-fatos']&&base['doc-dados-reconhecidos']) {
      let anteriores={};try{anteriores=JSON.parse(base['doc-dados-reconhecidos']);}catch{}
      for(const[id,anterior]of Object.entries(anteriores)) {
        if(!F[id]||!anterior||!c[id]||anterior===c[id]||id==='doc-fatos')continue;
        if(F[id][1]==='date') {
          const ocorrencias=datas(c['doc-fatos'],hoje).filter(x=>x.valor===anterior).reverse();
          for(const d of ocorrencias)c['doc-fatos']=c['doc-fatos'].slice(0,d.index)+br(c[id])+c['doc-fatos'].slice(d.fim);
        } else c['doc-fatos']=c['doc-fatos'].split(anterior).join(c[id]);
      }
    }
    c['doc-modelo-amplo']=id;c['doc-genero-amplo']=modelo.genero;c['doc-assunto']||=modelo.assunto;
    if(c['doc-fatos']&&!c['doc-demanda']&&['solicitacao','encaminhamento','requerimento'].includes(modelo.estrutura)) {
      c['doc-demanda']=organizarDemanda(c['doc-fatos']);
    }
    let paragrafos=redigir(modelo,c,perguntar);
    const soCabecalho=Object.keys(extra.campos).length>0&&Object.keys(extra.campos).every(id=>['doc-numero','doc-data','doc-para','doc-ac','doc-setor','doc-assunto'].includes(id));
    if(acao==='complementar'&&entrada.modelo_base&&(correcao.detectado||soCabecalho||entrada.modelo_base!==base['doc-texto-gerado'])) {
      let original=seguro(entrada.modelo_base,24000,'texto editado');
      for(const k of Object.keys(extra.campos))if(base[k]&&base[k]!==c[k])original=substituirCampo(original,k,base[k],c[k],hoje);
      for(const s of correcao.substituicoes)original=substituirTrecho(original,s.antes,s.depois);
      datas(original,hoje); // Recusa datas impossíveis introduzidas por uma substituição literal.
      const adicional=tirarInstrucao(extra.livre);if(adicional)original=acrescentarAntesFecho(original,adicional);
      if(referencia&&!original.includes(referencia))original=acrescentarAntesFecho(original,referencia);
      paragrafos=original.split(/\n\s*\n/).filter(Boolean);
      avisos.push('As alterações foram aplicadas ao documento atual. Confira os campos e a redação.');
    }
    if(correcao.revisao){
      const texto=revisarDocumento({...entrada,modelo_base:paragrafos.join('\n\n')},legado,c,correcao.revisao);
      paragrafos=texto.split(/\n\s*\n/).filter(Boolean);
      avisos.push('O pedido de revisão foi aplicado ao texto atual. Confira a redação.');
    }
    if(perguntas.length)avisos.push('Preencha os dados indicados e clique em Atualizar texto para concluir o rascunho.');
    if(c['doc-fatos'])avisos.push('Os detalhes livres do pedido foram preservados. Confira se a redação corresponde aos registros da escola.');
    const texto=paragrafos.join('\n\n');if(texto.length>24000||paragrafos.length>40||paragrafos.some(p=>p.length>16000))throw new Error('O documento ficou longo. Reduza os fatos ou a referência.');
    c['doc-texto-gerado']=texto;
    c['doc-dados-reconhecidos']=JSON.stringify(Object.fromEntries(Object.entries(c).filter(([id,v])=>F[id]&&!['doc-fatos','doc-complementos','doc-documentos-amplos'].includes(id)&&v.length<=1000)));
    return {tipo:modelo.tipo,campos:c,principal_id:'',secundario_id:'',paragrafos,perguntas,avisos,resumo:correcao.detectado?'Correção do documento atual — '+modelo.nome+'.':modelo.nome+' — rascunho preparado.'};
  }
  global.AssistenteDocumentalAmplo=Object.freeze({preparar,pendencias,modelos:catalogo,campos:CAMPOS,definicoes:F,generos,porId,dataValida,numeracao,versao:'20261026-memorandos-1'});
})(globalThis);
