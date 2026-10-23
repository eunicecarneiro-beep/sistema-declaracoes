import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const script = readFileSync(new URL('js/documentos-servidores.js', root), 'utf8');
const start = script.indexOf('const AssistenteDocumentalLocal =');
const end = script.indexOf('/* Integra', start);
const context = vm.createContext({});
vm.runInContext(readFileSync(new URL('js/redacao-livre.js', root), 'utf8') + '\n' + script.slice(start,end) + '\nglobalThis.motor = AssistenteDocumentalLocal;', context);
const gerar = (pedido, extra={}) => context.motor.preparar({acao:'gerar',pedido,hoje:'2026-10-23',funcionarios:[],contexto:{tipo:'declaracao',campos:{'doc-data':'2026-10-23'}},...extra});
const texto = r => r.paragrafos.join('\n\n');
const exemplo = `Declaramos, para os devidos fins, que a **Escola Municipal Professora Eunice Carneiro** recebeu, no dia **23 de outubro de 2026**, **06 (seis) lixeiras destinadas à coleta seletiva de materiais recicláveis**, fornecidas pelo **Projeto Montesul (Associação Montes Claros de Catadores)**, em decorrência da palestra realizada nesta unidade escolar.
A iniciativa contribui para o desenvolvimento de práticas sustentáveis no ambiente escolar, incentivando a conscientização ambiental e a importância da separação e destinação adequada dos resíduos recicláveis.
Por ser expressão da verdade, firmamos a presente declaração.
**Montes Claros/MG, 23 de outubro de 2026.**`;

test('declaração Montesul preserva todos os fatos e dispensa cadastro de servidor',()=>{
  const r=gerar(exemplo),t=texto(r);
  assert.equal(r.tipo,'declaracao-livre');
  for(const parte of ['23 de outubro de 2026','06 (seis) lixeiras','Projeto Montesul (Associação Montes Claros de Catadores)','palestra','práticas sustentáveis','conscientização ambiental']) assert.ok(t.includes(parte),parte);
  assert.equal(r.perguntas.length,0);
  assert.doesNotMatch(t,/MATRÍCULA|cadastro funcional|\*\*/i);
  assert.equal((t.match(/Por ser expressão da verdade/g)||[]).length,1);
  assert.equal(r.campos['doc-data'],'2026-10-23');
});
test('pedido em linguagem natural recebe a redação institucional',()=>{
  const r=gerar('Faça uma declaração de que a escola recebeu em 23/10/2026 seis lixeiras para coleta seletiva fornecidas pelo Projeto Montesul, em decorrência da palestra realizada na escola.');
  assert.equal(r.tipo,'declaracao-livre');
  assert.match(texto(r),/Escola Municipal Professora Eunice Carneiro recebeu/);
  assert.match(texto(r),/seis lixeiras/);
  assert.doesNotMatch(texto(r),/Faça|INFORMAR|matrícula/);
});
test('recebimento descrito por substantivo vira declaração de recebimento',()=>{
  const r=gerar('Faça uma declaração de recebimento de 6 lixeiras fornecidas pelo Projeto Montesul em 23/10/2026.');
  assert.match(texto(r),/Eunice Carneiro recebeu 6 lixeiras/);
  assert.equal(r.perguntas.length,0);
});
test('nome de projeto diferente não é substituído por um exemplo fixo',()=>{
  const r=gerar('Crie uma declaração de que a escola recebeu 20 livros da Associação Horizonte em 22/10/2026.');
  assert.match(texto(r),/20 livros da Associação Horizonte/);
  assert.doesNotMatch(texto(r),/Montesul|lixeiras/);
});
test('declaração de estudante não exige matrícula funcional',()=>{
  const r=gerar('Faça uma declaração de que o aluno João Lucas de Teste está regularmente matriculado no 2º ano E, no turno vespertino, no ano letivo de 2026.');
  assert.equal(r.tipo,'declaracao-livre');
  for(const parte of ['João Lucas de Teste','2º ano E','vespertino','2026']) assert.ok(texto(r).includes(parte));
  assert.equal(r.perguntas.length,0);
  assert.doesNotMatch(texto(r),/servidor|cadastro funcional/i);
});
test('acontecimento fora dos modelos mantém os detalhes informados',()=>{
  const r=gerar('Elabore uma declaração informando que o telhado do depósito foi danificado pela chuva em 21/10/2026. A sala ficou interditada para reparos e os materiais foram transferidos para a biblioteca.');
  for(const parte of ['telhado do depósito','21 de outubro de 2026','interditada para reparos','biblioteca']) assert.ok(texto(r).includes(parte));
  assert.doesNotMatch(texto(r),/funcional|servidor/i);
});
test('não transforma empréstimo em doação nem em aquisição definitiva',()=>{
  const r=gerar('Faça uma declaração de que a escola recebeu em comodato 2 projetores do Instituto Aurora, em 23/10/2026, com devolução prevista para 30/10/2026.');
  assert.match(texto(r),/em comodato 2 projetores/);
  assert.match(texto(r),/devolução prevista para 30 de outubro de 2026/);
  assert.doesNotMatch(texto(r),/doação|propriedade definitiva/i);
});
test('dados ausentes geram perguntas concretas sem inventar fornecedor ou data',()=>{
  const r=gerar('Faça uma declaração de que recebemos seis lixeiras para coleta seletiva.');
  assert.ok(r.perguntas.some(p=>p.campo==='doc-inicio'));
  assert.ok(r.perguntas.some(p=>p.campo==='doc-instituicao'));
  assert.doesNotMatch(texto(r),/Montesul|23 de outubro/);
});
test('dados estruturados completam os fatos',()=>{
  const r=gerar('Tipo: declaração institucional\nFatos: recebemos seis lixeiras\nData do recebimento: 23/10/2026\nFornecedor: Projeto Horizonte');
  assert.match(texto(r),/23 de outubro de 2026/);
  assert.match(texto(r),/Projeto Horizonte/);
  assert.equal(r.perguntas.length,0);
});
test('declaração sem fato não inventa um acontecimento',()=>{
  const r=gerar('Faça uma declaração institucional sobre o projeto Jardim Azul.');
  assert.ok(r.perguntas.some(p=>p.campo==='doc-pedido'));
  assert.match(texto(r),/INFORMAR O FATO/);
  assert.doesNotMatch(texto(r),/realizou|recebeu|participou/);
});
test('data impossível é recusada',()=>{
  assert.throws(()=>gerar('Faça uma declaração de que a escola recebeu 6 livros do Projeto Sol no dia 31/02/2026.'),/data/i);
});
test('código e HTML não são executados nem aceitos como redação',()=>{
  assert.throws(()=>gerar('Faça uma declaração <img src=x onerror=alert(1)>'),/texto|HTML/i);
});
test('data de emissão não substitui a data histórica do recebimento',()=>{
  const r=gerar('Declaramos que a escola recebeu 5 livros do Projeto Sol em 08/10/2026.\nMontes Claros/MG, 23 de outubro de 2026.');
  assert.match(texto(r),/8 de outubro de 2026/);
  assert.equal(r.campos['doc-inicio'],'2026-10-08');
  assert.equal(r.campos['doc-data'],'2026-10-23');
});
test('fatos da referência participam da redação',()=>{
  const r=gerar('Faça uma declaração institucional.',{referencia:'A escola recebeu em 23/10/2026 8 caixas de papel do Projeto Ipê.'});
  assert.match(texto(r),/8 caixas de papel do Projeto Ipê/);
  assert.doesNotMatch(texto(r),/INFORMAR O FATO/);
});
test('declaração funcional continua consultando o servidor informado',()=>{
  const r=gerar('Faça uma declaração funcional do servidor Servidor Fictício de Teste.',{funcionarios:[{id:'teste-1',nome:'Servidor Fictício de Teste',matricula:'123',cargo:'ASEB'}]});
  assert.equal(r.tipo,'declaracao');
  assert.match(texto(r),/matrícula nº 123/);
});
test('memorando de prorrogação mantém a regra de período',()=>{
  const r=gerar('Faça um memorando prorrogando o contrato de Servidor Fictício de Teste a partir de 23/10/2026 por 30 dias. Justificativa: continuidade do atendimento.',{funcionarios:[{id:'teste-1',nome:'Servidor Fictício de Teste',matricula:'123',cargo:'ASEB'}]});
  assert.equal(r.tipo,'prorrogacao');
  assert.equal(r.campos['doc-fim'],'2026-11-21');
});
