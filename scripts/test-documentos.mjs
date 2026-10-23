import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ctx=vm.createContext({console,Intl,Date,TextEncoder,TextDecoder,Uint8Array,AbortController,DOMException,setTimeout,clearTimeout,document:{getElementById(){return null;}},window:{},App:{}});
for(const file of ['redacao-livre.js','assistente-documental.js','documentos-servidores.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',file),'utf8'),ctx,{filename:file});
const preparar=e=>{ctx.entrada={acao:'gerar',hoje:'2026-10-23',contexto:{tipo:'declaracao',campos:{'doc-data':'2026-10-23'}},funcionarios:[],...e};return JSON.parse(JSON.stringify(vm.runInContext('AssistenteDocumentalLocal.preparar(entrada)',ctx)));};
const texto=p=>p.paragrafos.join('\n\n');
let total=0;function test(nome,fn){fn();total++;console.log('PASSOU: '+nome);}
test('Recebimento das seis lixeiras do Projeto Montesul não exige servidor',()=>{
 const p=preparar({pedido:'Faça uma declaração de recebimento de 06 (seis) lixeiras destinadas à coleta seletiva de materiais recicláveis, fornecidas pelo Projeto Montesul (Associação Montes Claros de Catadores), no dia 23/10/2026, em decorrência da palestra realizada nesta unidade escolar.'});
 assert.equal(p.campos['doc-modelo-amplo'],'recebimento');
 assert.match(texto(p),/06 \(seis\) lixeiras/);assert.match(texto(p),/Associação Montes Claros de Catadores/);assert.match(texto(p),/palestra/);
 assert.equal(p.principal_id,'');assert.ok(!p.perguntas.some(x=>x.campo==='doc-principal'));assert.doesNotMatch(texto(p),/cadastro funcional|INFORMAR SERVIDOR/);
});
test('Matrícula de aluno reconhece nome, turma e ano sem cadastro de funcionário',()=>{
 const p=preparar({pedido:'Faça uma declaração de matrícula para o aluno João Pedro Silva, do 2º ano E, ano letivo 2026, turno vespertino.'});
 assert.equal(p.campos['doc-modelo-amplo'],'matricula');assert.equal(p.campos['doc-pessoa'],'João Pedro Silva');assert.match(p.campos['doc-turma'],/2º ano E/);
 assert.match(texto(p),/João Pedro Silva/);assert.doesNotMatch(texto(p),/cadastro funcional|matrícula nº|INFORMAR SERVIDOR/);
});
test('Frequência sem dado confirmado permanece pendente, sem inventar percentual',()=>{
 const p=preparar({pedido:'Declaração de frequência. Aluno: Ana Luísa Souza; Turma: 3º ano A.'});
 assert.equal(p.campos['doc-modelo-amplo'],'frequencia');assert.match(texto(p),/INFORMAR SITUAÇÃO DE FREQUÊNCIA/);assert.doesNotMatch(texto(p),/100%|frequência regular/);
});
test('Declaração com negação mantém o fato e não afirma recebimento',()=>{
 const p=preparar({pedido:'Faça uma declaração que a escola não recebeu as 6 lixeiras do Projeto Montesul em 23/10/2026.'});
 assert.equal(p.campos['doc-modelo-amplo'],'declaracao-livre');assert.match(texto(p),/não recebeu as 6 lixeiras/);
});
test('Assunto incomum preserva todos os fatos fornecidos',()=>{
 const p=preparar({pedido:'Faça uma declaração sobre o empréstimo temporário de 17 instrumentos musicais da Associação Sol, sem transferência de propriedade, para a Mostra Cultural em 31/10/2026. A devolução ocorrerá em 04/11/2026.'});
 for(const trecho of ['17 instrumentos','Associação Sol','sem transferência de propriedade','31/10/2026','04/11/2026'])assert.ok(texto(p).includes(trecho),trecho);
});
test('Referência complementar entra integralmente no documento',()=>{
 const p=preparar({pedido:'Declaração de recebimento. Materiais: 6 lixeiras; Data: 23/10/2026; Projeto: Montesul.',referencia:'Itens em comodato. Sem transferência de propriedade. Ofício 17/2026.'});
 assert.match(texto(p),/Itens em comodato\. Sem transferência de propriedade\. Ofício 17\/2026/);
});
test('Datas inválidas e horários impossíveis são recusados',()=>{
 for(const pedido of ['Declaração de recebimento. Data: 31/02/2026; Materiais: duas lixeiras.','Declaração de comparecimento. Pessoa: Ana Silva; Data: 23/10/2026; Entrada: 25:00.'])assert.throws(()=>preparar({pedido}),/inválid/);
});
test('Múltiplas datas não são escolhidas arbitrariamente como data do fato',()=>{
 const p=preparar({pedido:'Declaração de participação do aluno Lucas Silva na feira em 23/10/2026 e na reunião em 24/10/2026.'});
 assert.ok(!p.campos['doc-data-fato']);assert.ok(p.perguntas.some(q=>q.campo==='doc-data-fato'));assert.ok(texto(p).includes('24/10/2026'));
});
test('Complemento preserva os dados de recebimento e acrescenta o novo detalhe',()=>{
 const p=preparar({pedido:'Declaração de recebimento. Materiais: 6 lixeiras; Data: 23/10/2026; Projeto: Montesul.'});
 const q=preparar({acao:'complementar',pedido:'Os materiais serão utilizados no pátio e nas salas.',contexto:{tipo:p.tipo,campos:p.campos},modelo_base:texto(p)});
 assert.match(texto(q),/6 lixeiras/);assert.match(texto(q),/pátio e nas salas/);
});
test('Complemento mantém alterações manuais',()=>{
 const p=preparar({pedido:'Declaração de recebimento. Materiais: 6 lixeiras; Data: 23/10/2026; Projeto: Montesul.'});
 const editado=texto(p)+'\n\nTexto aprovado pela secretaria com observação específica.';
 const q=preparar({acao:'complementar',pedido:'As lixeiras são destinadas à coleta seletiva.',contexto:{tipo:p.tipo,campos:p.campos},modelo_base:editado});
 assert.ok(texto(q).includes('Texto aprovado pela secretaria com observação específica.'));assert.match(texto(q),/coleta seletiva/);
});
test('Novo pedido não reutiliza nome e fatos do aluno anterior',()=>{
 const p=preparar({pedido:'Declaração de matrícula. Aluno: Ana Silva; Turma: 1º ano A.'});
 const q=preparar({pedido:'Declaração de recebimento. Materiais: 6 lixeiras; Data: 23/10/2026.',contexto:{tipo:p.tipo,campos:p.campos}});
 assert.doesNotMatch(texto(q),/Ana Silva|1º ano/);assert.equal(q.principal_id,'');
});
test('Revisão de redação conserva modelo e fatos',()=>{
 const p=preparar({pedido:'Declaração de matrícula. Aluno: João Silva; Turma: 2º ano E.'});
 const q=preparar({acao:'formalizar',pedido:'',contexto:{tipo:p.tipo,campos:p.campos},modelo_base:texto(p)});
 assert.equal(q.campos['doc-modelo-amplo'],'matricula');assert.match(texto(q),/João Silva/);
});
test('Todos os modelos novos produzem rascunho com pendências específicas',()=>{
 for(const m of ctx.AssistenteDocumentalAmplo.modelos){const p=preparar({modelo_escolhido:m.id,pedido:''});assert.equal(p.campos['doc-modelo-amplo'],m.id);assert.ok(p.paragrafos.length,m.id);assert.ok(p.perguntas.length,m.id);assert.ok(!p.perguntas.some(q=>q.campo==='doc-principal'),m.id);}
});
test('Modelos oficiais de servidores continuam identificando o cadastro',()=>{
 const f={id:'ficticio-1',nome:'Maria Silva Teste',matricula:'123456',cargo:'PEB I'};
 const p=preparar({pedido:'Declaração funcional do servidor Maria Silva Teste, matrícula 123456.',funcionarios:[f]});assert.equal(p.principal_id,f.id);assert.match(texto(p),/123456/);assert.equal(p.campos['doc-modelo-amplo'],'');
 const q=preparar({pedido:'Prorrogar o contrato de Maria Silva Teste por 30 dias a partir de 23/10/2026. Justificativa: manter o atendimento.',funcionarios:[f]});assert.equal(q.tipo,'prorrogacao');assert.equal(q.campos['doc-fim'],'2026-11-21');
});
test('HTML e código nunca são aceitos como fatos',()=>{
 for(const pedido of ['Declaração <img src=x onerror=alert(1)>','```javascript\nalert(1)\n```'])assert.throws(()=>preparar({pedido}),/somente texto/);
});
test('Correção de campos altera a narrativa e preserva o contexto',()=>{
 const p=preparar({pedido:'Declaração de recebimento de 6 lixeiras do Projeto Montesul em 23/10/2026 para coleta seletiva.'});
 const q=preparar({pedido:'',somente_campos:true,contexto:{tipo:p.tipo,campos:{...p.campos,'doc-data-fato':'2026-10-24','doc-projeto':'Projeto Reciclar','doc-bens':'8 lixeiras'}}});
 assert.match(texto(q),/24\/10\/2026/);assert.match(texto(q),/Projeto Reciclar/);assert.match(texto(q),/8 lixeiras/);assert.doesNotMatch(texto(q),/Montesul|23\/10\/2026|6 lixeiras/);
});
test('Pedido só com modelo oficial selecionado mantém o tipo',()=>{
 const p=preparar({modelo_escolhido:'legado:prorrogacao',pedido:'Servidor: Maria Silva Teste; Data inicial: 23/10/2026; Prazo: 30; Justificativa: atendimento.',funcionarios:[{id:'x',nome:'Maria Silva Teste',matricula:'123456',cargo:'PEB I'}]});
 assert.equal(p.tipo,'prorrogacao');assert.equal(p.campos['doc-fim'],'2026-11-21');
});
test('Rótulos separados por vírgula são reconhecidos',()=>{
 const p=preparar({pedido:'Declaração de matrícula. Aluno: Ana Silva, Turma: 3º ano B, Ano letivo: 2026.'});
 assert.equal(p.campos['doc-pessoa'],'Ana Silva');assert.equal(p.campos['doc-turma'],'3º ano B');assert.equal(p.campos['doc-ano-letivo'],'2026');
});
test('Novo memorando não herda destinatário de pessoal por engano',()=>{
 const p=preparar({pedido:'Memorando de manutenção. Pedido: reparo do telhado.',contexto:{tipo:'prorrogacao',campos:{'doc-para':'Destinatário anterior','doc-ac':'Pessoa anterior','doc-setor':'Gestão de Pessoal'}}});
 for(const id of ['doc-para','doc-ac','doc-setor'])assert.equal(p.campos[id],'');
});
test('Exclusão explícita de servidor e pedido de aluno não voltam ao cadastro funcional',()=>{
 const p=preparar({pedido:'Faça uma declaração para o aluno João Silva, sem vínculo de servidor, sobre sua participação na feira cultural.'});
 assert.notEqual(p.campos['doc-modelo-amplo'],'');assert.equal(p.principal_id,'');assert.doesNotMatch(texto(p),/cadastro funcional|INFORMAR SERVIDOR/);
});
test('Texto completo colado mantém o tratamento já publicado de declarações livres',()=>{
 const p=preparar({pedido:'Declaramos, para os devidos fins, que a **Escola Municipal Professora Eunice Carneiro** recebeu, no dia **23 de outubro de 2026**, **06 (seis) lixeiras**, fornecidas pelo **Projeto Montesul**.\nPor ser expressão da verdade, firmamos a presente declaração.'});
 assert.equal(p.tipo,'declaracao-livre');assert.doesNotMatch(texto(p),/\*\*|INFORMAR SERVIDOR/);assert.equal((texto(p).match(/Por ser expressão da verdade/g)||[]).length,1);
});
console.log(JSON.stringify({grupos:total,modelosNovos:ctx.AssistenteDocumentalAmplo.modelos.length,ambiente:'Node VM, dados fictícios; sem alterações no banco'}));
