/* Redação documental local: organiza fatos fornecidos, sem serviços externos. */
const RedacaoLivre = (() => {
  'use strict';
  const ESCOLA = 'Escola Municipal Professora Eunice Carneiro';
  const FECHO = 'Por ser expressão da verdade, firmamos a presente declaração.';
  const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const limpar = s => String(s || '').replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, '')
    .replace(/[ \t]+/g, ' ').trim();
  const frase = s => {
    const t = limpar(s).replace(/[\s.;:,]+$/, '');
    return t ? t[0].toLocaleUpperCase('pt-BR') + t.slice(1) + '.' : '';
  };
  const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  function dataValida(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || +s.slice(0,4) < 1900 || +s.slice(0,4) > 2199) return false;
    const t = Date.parse(s + 'T12:00:00Z');
    return Number.isFinite(t) && new Date(t).toISOString().slice(0,10) === s;
  }
  const extensoData = s => `${+s.slice(8)} de ${MESES[+s.slice(5,7)-1]} de ${s.slice(0,4)}`;
  const iso = (a,m,d) => `${a}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  function datas(texto) {
    const encontrados = [];
    const incluir = (m,s) => {
      if (!dataValida(s)) throw new Error('Confira a data informada: ' + m[0] + '.');
      encontrados.push({inicio:m.index, fim:m.index+m[0].length, valor:s});
    };
    const t = norm(texto);
    for (const m of t.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) incluir(m,iso(m[1],m[2],m[3]));
    for (const m of t.matchAll(/\b(\d{1,2})[/.](\d{1,2})[/.](\d{4})\b/g)) incluir(m,iso(m[3],m[2],m[1]));
    const re = new RegExp('\\b(\\d{1,2}) de (' + MESES.map(norm).join('|') + ') de (\\d{4})\\b','g');
    for (const m of t.matchAll(re)) incluir(m,iso(m[3],MESES.map(norm).indexOf(m[2])+1,m[1]));
    return encontrados.sort((a,b)=>a.inicio-b.inicio);
  }
  function reconhecer(texto) {
    const t = norm(texto);
    if (/\b(?:memorando|requerimento|prorrogacao|substituicao)\b/.test(t.slice(0,110))) return false;
    if (/\bdeclaracao funcional\b/.test(t)) return false;
    if (/^(?:declaro|declaramos|atestamos|certificamos)\b/.test(t.trim())) return true;
    if (!/\b(?:declaracao|declarar)\b/.test(t)) return false;
    return /\b(?:institucional|personalizada|livre|recebimento|recebeu|recebemos|entrega|doacao|lixeiras?|projeto|programa|palestra|campanha|parceria|participacao|realizacao|aluno|aluna|estudante|matricula escolar|frequencia|transferencia|conclusao|responsavel|ocorrencia|sobre|informando|dizendo|de que)\b/.test(t);
  }
  function retirarPedido(texto) {
    let t = limpar(texto);
    t = t.replace(/^(?:por favor[, ]*|(?:eu )?(?:quero|preciso|gostaria de)(?: que voce| que você)?\s*)/i,'');
    t = t.replace(/^(?:faça|faca|fazer|crie|criar|elabore|elaborar|prepare|preparar|redija|gerar|gere)\s*/i,'');
    t = t.replace(/^(?:(?:uma?|a)\s+)?declara[cç][aã]o\s*(?:(?:institucional|personalizada|livre)\s*)?/i,'');
    t = t.replace(/^(?:para\s+)?(?:informar|informando|dizer|dizendo|declarar|declarando|atestar|atestando|certificar|certificando)\s*/i,'');
    t = t.replace(/^(?:de\s+)?que\s+/i,'');
    t = t.replace(/^(?:declaro|declaramos|atestamos|certificamos)\s*,?\s*(?:para os devidos fins\s*,?\s*)?(?:que\s+)?/i,'');
    return t.trim().replace(/^[.;:,\s]+/, '');
  }
  function organizarFato(texto, hoje) {
    let t = retirarPedido(texto);
    const substituicoes = [
      [/^(?:de\s+)?recebimento de\s+/i,`a ${ESCOLA} recebeu `],
      [/^(?:n[oó]s\s+)?(?:recebemos|ganhamos)\s+/i,`a ${ESCOLA} recebeu `],
      [/^(?:de\s+)?participa[cç][aã]o da escola\s+/i,`a ${ESCOLA} participou `],
      [/^participamos\s+/i,`a ${ESCOLA} participou `],
      [/^(?:de\s+)?realiza[cç][aã]o de\s+/i,'foi realizada a atividade de '],
      [/^realizamos\s+/i,`a ${ESCOLA} realizou `],
      [/^(?:a\s+)?(?:nossa|esta|essa) escola\s+/i,`a ${ESCOLA} `],
      [/^a escola\s+(?!municipal)/i,`a ${ESCOLA} `],
      [/^teve (?:aqui )?(?:na escola|na nossa escola)\s+/i,'foi realizada nesta unidade escolar ']
    ];
    for (const [re,valor] of substituicoes) t = t.replace(re,valor);
    if (dataValida(hoje)) {
      t = t.replace(/\b(recebeu|realizou|participou|ocorreu)\s+(hoje|ontem|amanh[aã])\b/gi,(_m,v,d)=> {
        const delta = norm(d)==='ontem' ? -1 : norm(d)==='amanha' ? 1 : 0;
        const dia = new Date(Date.parse(hoje+'T12:00:00Z')+delta*86400000).toISOString().slice(0,10);
        return v + ', no dia ' + extensoData(dia) + ',';
      });
    }
    for (const d of datas(t).reverse()) t = t.slice(0,d.inicio)+extensoData(d.valor)+t.slice(d.fim);
    t = t.replace(/\bpra\b/gi,'para').replace(/\bpro\b/gi,'para o');
    t = t.replace(/\bcoleta seletiva de lixo\b/gi,'coleta seletiva de resíduos');
    return t.replace(/\s+([,.;])/g,'$1').trim();
  }
  function preparar(entrada = {}) {
    const pedido = limpar(entrada.pedido), referencia = limpar(entrada.referencia);
    if (pedido.length > 12000 || referencia.length > 16000 || /<\/?[a-z]|```/i.test(pedido+'\n'+referencia)) {
      throw new Error('Informe os fatos em texto, sem HTML ou código, dentro do limite dos campos.');
    }
    const campos = {}, perguntas = [], avisos = [];
    const base = entrada.campos || {};
    const perguntar = (campo,pergunta) => perguntas.push({campo,pergunta});
    let emissao = '';
    function limparFonte(fonte) {
      return fonte.split('\n').map(linha=> {
        const l = limpar(linha), n = norm(l);
        if (/^montes claros(?:\s*\/\s*mg|\s*[-–]\s*mg)?\s*,/.test(n)) {
          const ds = datas(l); if (ds.length===1) emissao=ds[0].valor;
          return '';
        }
        if (/^(?:por ser expressao|firmamos a presente|para que produza)/.test(n)) return '';
        if (/^declaracao\s*$/.test(n)) return '';
        if (/^(?:tipo(?: de documento)?|assunto|data(?: do documento| de emissao| do recebimento| do acontecimento| do evento)?|emissao|fornecedor|instituicao|projeto|justificativa|finalidade|motivo)\s*:/.test(n)) return '';
        return l.replace(/^(?:fatos(?: a declarar)?|pedido|objeto|complemento|texto(?: a declarar)?)\s*:\s*/i,'');
      }).join('\n').trim();
    }
    const partesFonte = [limparFonte(pedido), limparFonte(referencia)].filter(Boolean);
    if (base['doc-pedido'] && !partesFonte.some(p=>norm(p).includes(norm(base['doc-pedido'])))) partesFonte.push(limparFonte(base['doc-pedido']));
    let fonte = partesFonte.join('\n\n');
    if (!fonte && pedido) fonte=retirarPedido(pedido);
    fonte = fonte.replace(/Por ser express[aã]o da verdade,?\s*firmamos a presente declara[cç][aã]o\.?/gi,'').trim();
    const paragrafos = [...new Set(fonte.split(/\n\s*\n/).map(p=>organizarFato(p,entrada.hoje)).filter(Boolean))];
    let fato = paragrafos.shift() || '';
    const conhecido = /\b(?:recebeu|recebemos|recebid[oa]s?|fornecid[oa]s?|entregu[eo]s?|participou|participaram|realizou|realizaram|ocorreu|ocorreram|aconteceu|foi|foram|esteve|estiveram|compareceu|compareceram|frequenta|frequentou|encontra-se|est[aá]|est[aã]o|possui|tem|n[aã]o houve|houve|matriculad[oa]|concluiu|doou|cedeu|ser[aá]|ser[aã]o|realizar[aá]|receber[aá])\b/i.test(fato);
    if (!conhecido) {
      perguntar('doc-pedido','Descreva o fato a declarar: quem participou, o que ocorreu e os dados que devem constar.');
      fato = '[INFORMAR O FATO A DECLARAR]' + (fato ? ' — Assunto informado: ' + fato : '');
    }
    const recebimento = /\b(?:recebeu|recebemos|recebimento|recebid[oa]s?)\b/.test(norm(fato));
    const ds = datas(fato);
    const dia = base['doc-inicio'];
    if (ds.length===1) campos['doc-inicio']=ds[0].valor;
    if (recebimento && !ds.length) {
      if (dataValida(dia)) fato=frase(fato)+' O recebimento ocorreu no dia '+extensoData(dia);
      else {
        perguntar('doc-inicio','Em que data ocorreu o recebimento? Informe dia, mês e ano.');
        fato=frase(fato)+' Data do recebimento: [INFORMAR DATA DO RECEBIMENTO]';
      }
    }
    const origem = base['doc-instituicao'];
    const origemNoTexto = /\b(?:fornecid[oa]s?|doad[oa]s?|cedid[oa]s?|entregues?|recebid[oa]s?)\s+(?:pel[ao]s?|por|d[ao]s?)\b|\b(?:d[ao]|pel[ao])\s+(?:projeto|programa|associa[cç][aã]o|empresa|cooperativa|instituto|funda[cç][aã]o|prefeitura|secretaria|senhor|senhora)\b/i.test(fato);
    if (recebimento && !origemNoTexto) {
      if (origem) paragrafos.unshift(frase('Os materiais foram fornecidos por '+origem));
      else {
        perguntar('doc-instituicao','Quem forneceu ou entregou os materiais? Informe o nome da pessoa, projeto ou instituição.');
        paragrafos.unshift('Responsável pelo fornecimento: [INFORMAR FORNECEDOR OU INSTITUIÇÃO].');
      }
    }
    const motivo = limpar(base['doc-motivo']);
    if (motivo && !norm(fonte).includes(norm(motivo))) paragrafos.push(frase('Finalidade: '+motivo));
    if (recebimento && /\b(?:coleta seletiva|recicla|reciclaveis|educacao ambiental)\b/.test(norm(fonte)) &&
        ![fato,...paragrafos].some(p=>/\b(?:conscientizacao|sustentaveis|educacao ambiental|separacao)\b/.test(norm(p)))) {
      paragrafos.push('A destinação dos materiais à coleta seletiva favorece a separação adequada dos resíduos recicláveis e as práticas de educação ambiental no ambiente escolar.');
    }
    const assunto = recebimento ? 'Declaração de recebimento de materiais' : /\b(?:aluno|aluna|estudante|matriculad|frequenta)\b/.test(norm(fonte)) ? 'Declaração escolar' : 'Declaração institucional';
    campos['doc-assunto']=base['doc-assunto'] && !/^(?:declaração funcional|solicitação administrativa)$/i.test(base['doc-assunto']) ? base['doc-assunto'] : assunto;
    campos['doc-pedido']=fonte;
    if (emissao) campos['doc-data']=emissao;
    if (/\b(?:amanha|ser[aá]|ser[aã]o|previst[oa]|planejad[oa])\b/.test(norm(fonte))) avisos.push('Há informações futuras ou previstas. Confira se o texto registra planejamento ou um fato já ocorrido.');
    if (ds.some(d=>dataValida(entrada.hoje) && d.valor>entrada.hoje)) avisos.push('O texto contém data futura. Confirme a data e o tempo verbal antes de assinar.');
    if (perguntas.length) avisos.push('Complete os dados destacados antes de emitir.');
    avisos.push('Nomes, quantidades e acontecimentos foram aproveitados das informações fornecidas. Confira o conteúdo antes de assinar.');
    return {campos,paragrafos:[frase('Declaramos, para os devidos fins, que '+fato.replace(/^([A-ZÀ-Ý])(?=\s)/,m=>m.toLocaleLowerCase('pt-BR'))),...paragrafos.map(frase),FECHO],perguntas,avisos,resumo:'Declaração preparada a partir dos fatos informados.'};
  }
  return Object.freeze({reconhecer,preparar,versao:'20261023-livre-1'});
})();
