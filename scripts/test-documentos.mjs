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
test('Pedido com saudação e abreviação preserva comodato e não copia comandos',()=>{
 const p=preparar({pedido:'Oi chat, vc pode me fazer uma declaração de que nossa escola recebeu 6 lixeiras do Projeto Montesul em 23/10/2026, em comodato. Não houve doação.'});
 assert.match(texto(p),/Escola Municipal Professora Eunice Carneiro recebeu 6 lixeiras/);assert.match(texto(p),/Não houve doação/);
 assert.doesNotMatch(texto(p),/Oi chat|vc pode|me fazer|Municipal Professora Eunice Carneiro Municipal/);
});
test('Comprovante de aluno com ano por extenso e turno informal vira matrícula',()=>{
 const p=preparar({pedido:'Preciso de um comprovante de que o aluno João Pedro Silva estuda aqui, no terceiro ano B, de tarde, neste ano.'});
 assert.equal(p.campos['doc-modelo-amplo'],'matricula');assert.equal(p.campos['doc-pessoa'],'João Pedro Silva');assert.equal(p.campos['doc-turma'],'3º ano B');assert.equal(p.campos['doc-turno-amplo'],'vespertino');assert.equal(p.campos['doc-ano-letivo'],'2026');
 assert.equal(p.perguntas.length,0);assert.doesNotMatch(texto(p),/Informações complementares|Preciso|comprovante/);
});
test('Solicitação informal de ofício tem pedido único e conserva justificativa',()=>{
 const p=preparar({pedido:'Pode fazer um ofício para solicitar o conserto do telhado da biblioteca. Justificativa: infiltração.'});
 assert.equal(p.campos['doc-modelo-amplo'],'oficio-solicitacao');assert.match(texto(p),/^Solicitamos o conserto/);assert.match(texto(p),/Infiltração/);assert.equal((texto(p).match(/conserto/g)||[]).length,1);
});
test('Ofício narrativo separa destinatário, pedido e justificativa',()=>{
 const p=preparar({pedido:'Preciso de um ofício para a Secretaria Municipal de Educação solicitando o conserto do telhado da biblioteca. Justificativa: infiltração após as chuvas.'});
 assert.equal(p.campos['doc-destino'],'a Secretaria Municipal de Educação');assert.equal(p.campos['doc-modelo-amplo'],'oficio-solicitacao');assert.match(texto(p),/^Solicitamos o conserto/);assert.doesNotMatch(texto(p),/Solicitamos para|solicitando/);assert.match(texto(p),/Infiltração após as chuvas/);
});
test('Comparecimento em linguagem cotidiana reconhece responsável, data e horários',()=>{
 const p=preparar({pedido:'Quero um comprovante de que a mãe Maria Souza veio aqui na escola hoje das 9h às 11h.'});
 assert.equal(p.campos['doc-modelo-amplo'],'comparecimento-responsavel-amplo');assert.equal(p.campos['doc-responsavel-amplo'],'Maria Souza');assert.equal(p.campos['doc-data-fato'],'2026-10-23');assert.equal(p.campos['doc-entrada-amplo'],'09:00');assert.equal(p.campos['doc-saida-amplo'],'11:00');assert.doesNotMatch(texto(p),/Informações complementares|Quero um/);
});
test('Descrição de frequência continua exigindo confirmação dos registros',()=>{
 const p=preparar({pedido:'Preciso de um comprovante de frequência do aluno Pedro Teste, do 4º ano C.'});
 assert.equal(p.campos['doc-modelo-amplo'],'frequencia');assert.ok(p.perguntas.some(q=>q.campo==='doc-situacao-ampla'));assert.doesNotMatch(texto(p),/100%|Frequenta regularmente/);
});
const recebimento=()=>preparar({pedido:'Declaração de recebimento de 6 lixeiras do Projeto Montesul em 23/10/2026 para coleta seletiva.'});
const complementar=(p,pedido,base=texto(p))=>preparar({acao:'complementar',pedido,contexto:{tipo:p.tipo,campos:p.campos},modelo_base:base});
test('Correção natural de data altera fato e mantém emissão e outros detalhes',()=>{
 const p=recebimento(),q=complementar(p,'mude a data para 24/10/2026');
 assert.equal(q.campos['doc-data-fato'],'2026-10-24');assert.equal(q.campos['doc-data'],'2026-10-23');assert.match(texto(q),/24\/10\/2026/);assert.match(texto(q),/6 lixeiras do Projeto Montesul/);assert.doesNotMatch(texto(q),/23\/10\/2026|mude a data|Municipal Professora Eunice Carneiro Municipal/);
});
test('Correção de emissão não muda a data do acontecimento quando coincidem',()=>{
 const p=recebimento(),q=complementar(p,'mude a data de emissão para 26/10/2026');
 assert.equal(q.campos['doc-data'],'2026-10-26');assert.equal(q.campos['doc-data-fato'],'2026-10-23');assert.equal(texto(q),texto(p));
});
test('Correção de quantidade não altera data nem projeto e sincroniza os campos',()=>{
 const p=recebimento(),q=complementar(p,'na verdade foram 8 lixeiras');
 assert.equal(q.campos['doc-bens'],'8 lixeiras');assert.match(texto(q),/8 lixeiras/);assert.match(texto(q),/23\/10\/2026 para coleta seletiva/);assert.doesNotMatch(texto(q),/6 lixeiras|na verdade/);
 const r=preparar({pedido:'',somente_campos:true,contexto:{tipo:q.tipo,campos:q.campos}});assert.match(texto(r),/8 lixeiras/);assert.doesNotMatch(texto(r),/6 lixeiras/);
});
test('Troca de projeto e data em um complemento mantém correções manuais',()=>{
 const p=recebimento(),q=complementar(p,'troque o projeto para Projeto Reciclar; mude a data para 24/10/2026',texto(p)+'\n\nRessalva conferida pela secretaria.');
 assert.equal(q.campos['doc-projeto'],'Projeto Reciclar');assert.match(texto(q),/24\/10\/2026/);assert.match(texto(q),/Ressalva conferida/);assert.doesNotMatch(texto(q),/Montesul|23\/10\/2026|troque o projeto/);
});
test('Troca de nome e turma mantém o documento e não cria outro aluno',()=>{
 const p=preparar({pedido:'Declaração de matrícula. Aluno: João Silva; Turma: 2º ano E; Ano letivo: 2026.'});
 const q=complementar(p,'troque o nome para Maria Oliveira; mude a turma para 3º ano A');
 assert.equal(q.campos['doc-pessoa'],'Maria Oliveira');assert.equal(q.campos['doc-turma'],'3º ano A');assert.equal(q.campos['doc-modelo-amplo'],'matricula');assert.match(texto(q),/Maria Oliveira/);assert.doesNotMatch(texto(q),/João Silva|2º ano E|troque o nome/);
});
test('Substituição entre aspas conserva o restante da minuta',()=>{
 const p=recebimento(),q=complementar(p,'troque "coleta seletiva" por "educação ambiental"');
 assert.match(texto(q),/educação ambiental/);assert.match(texto(q),/6 lixeiras do Projeto Montesul em 23\/10\/2026/);assert.doesNotMatch(texto(q),/coleta seletiva|troque/);
});
test('Substituição inexistente e correção incompleta perguntam sem alterar o corpo',()=>{
 for(const pedido of ['mude a data','troque "Montes" por "Reciclar"']){const p=recebimento(),q=complementar(p,pedido);assert.equal(texto(q),texto(p));assert.ok(q.perguntas.some(q=>q.campo==='ia-extra-pedido'));}
});
test('Nome editado manualmente diferente dos campos exige esclarecimento',()=>{
 const p=preparar({pedido:'Declaração de matrícula. Aluno: João Silva; Turma: 2º ano E.'}),editado=texto(p).replace('João Silva','Maria Teste');
 const q=complementar(p,'mude o nome para Ana Souza',editado);
 assert.equal(texto(q),editado);assert.equal(q.campos['doc-pessoa'],'João Silva');assert.ok(q.perguntas.some(q=>/difere do texto/.test(q.pergunta)));
});
test('Acrescentar fato conserva negação e inclui o parágrafo antes do encerramento',()=>{
 const p=recebimento(),q=complementar(p,'inclua que não houve doação');
 assert.match(texto(q),/Não houve doação/);assert.doesNotMatch(texto(q),/Inclua que/);assert.ok(texto(q).indexOf('Não houve doação')<texto(q).indexOf('Por ser expressão'));assert.match(texto(q),/6 lixeiras/);
});
test('Correção de quantidade por extenso não deixa número antigo entre parênteses',()=>{
 const p=preparar({pedido:'Declaração de recebimento de 06 (seis) lixeiras do Projeto Montesul em 23/10/2026.'}),q=complementar(p,'mude a quantidade para 8');
 assert.match(texto(q),/8 lixeiras/);assert.doesNotMatch(texto(q),/06|seis/);
});
test('Correções recusam datas impossíveis inclusive nas substituições literais',()=>{
 for(const pedido of ['mude a data para 31/02/2026','troque "23/10/2026" por "31/02/2026"'])assert.throws(()=>complementar(recebimento(),pedido),/inválida/);
});
test('Ressalva sem doação e planejamento futuro não viram recebimento concluído',()=>{
 const p=preparar({pedido:'Faça uma declaração de que nossa escola vai receber 6 lixeiras do Projeto Montesul em 30/10/2026. Ainda não houve entrega.'});
 assert.match(texto(p),/vai receber/);assert.match(texto(p),/Ainda não houve entrega/);assert.doesNotMatch(texto(p),/escola recebeu|Carneiro recebeu/);
});
console.log(JSON.stringify({grupos:total,modelosNovos:ctx.AssistenteDocumentalAmplo.modelos.length,ambiente:'Node VM, dados fictícios; sem alterações no banco'}));
