# Assistente de documentos da escola

A página `documentos-servidores.html` atende alunos, responsáveis, servidores, pessoas externas e situações institucionais. O padrão Rápido interpreta os pedidos conhecidos e monta a minuta sem baixar ou iniciar um modelo de linguagem. A revisão por IA é opcional, pelo botão Refinar documento com IA ou pelo seletor de modo. Nenhum modo exige API paga de IA ou alteração no banco de dados. Veja `IA_LOCAL.md` para requisitos e limites.

## Cobertura

São 58 modelos novos, além dos modelos oficiais de servidores já existentes:

- Declarações de matrícula, frequência, matrícula e frequência, escolaridade, conclusão, transferência, vaga, turno e horário.
- Comparecimento de alunos, responsáveis e visitantes; participação, realização de atividades, reuniões, atendimento e serviço.
- Recebimento, entrega, devolução e doação de materiais ou documentos; declaração institucional livre.
- Memorandos de materiais, equipamentos, manutenção, informática, alimentação, água e energia, segurança, acessibilidade, formação, remanejamento, jornada, abono, documentação, recursos, projetos, inclusão, busca ativa, encaminhamento, resposta, informação, prestação de informações e assunto livre.
- Requerimento geral; ofícios de solicitação, encaminhamento, resposta e assunto livre; comunicado, convocação, relatório, ata, termos, autorização e recibo.
- Os modelos oficiais de declaração funcional, requerimento do servidor, prorrogação, substituição, contratação, calendário, transporte, zeladoria, estágio e avanço de nível continuam disponíveis.

Os textos são minutas para conferência. Percentuais de frequência, aprovação, conclusões de análises, decisões, assinaturas, leis, quantitativos e resultados não são inventados. As informações de alunos são digitadas pelo operador; o assistente não pesquisa um cadastro de alunos nem confirma automaticamente os registros escolares.

## Uso

1. Abra **Documentos da Escola** e descreva o pedido no assistente. O modo **Identificar pelo pedido** escolhe um modelo quando encontra uma regra correspondente. Também é possível escolher um assunto explicitamente, inclusive sem escrever um pedido inicial.
2. Clique em **Preparar documento**. Confira os dados identificados nos campos e os detalhes preservados no texto. Expressões como “comprovante de que o aluno estuda aqui”, “terceiro ano B” e “de tarde” têm interpretação local para os modelos correspondentes.
3. Preencha as pendências indicadas. Os botões de pendência levam ao campo correspondente. Clique em **Atualizar texto** para recompor o documento com os campos corrigidos.
4. Para acrescentar informações ou corrigir o documento atual, use **Complementar pedido**. Exemplos: “mude a data para 24/10/2026”, “na verdade foram 8 lixeiras”, “troque o nome para Maria Oliveira” e “troque \"texto atual\" por \"novo texto\"”. **Desfazer** restaura texto, campos e dados identificados. Se o valor dos campos diferir do texto editado, o assistente pergunta em vez de adivinhar. A data de emissão é separada da data do fato: use “mude a data de emissão para ...” para alterar somente a emissão. Correções de linguagem natural são tratadas nos modelos amplos; os modelos oficiais de servidores conservam o fluxo anterior.
5. Confira a prévia e use a impressão/PDF ou a exportação Word. O formato oficial de memorando é mantido. Nenhum documento é assinado ou protocolado automaticamente.
6. Para outra sugestão de redação, use **Refinar documento com IA**. O modelo recebe a minuta atual, com as limitações descritas em `IA_LOCAL.md`; a revisão pode demorar e não comprova os fatos.

**Exemplo de recebimento**

> Faça uma declaração de recebimento de 06 (seis) lixeiras destinadas à coleta seletiva de materiais recicláveis, fornecidas pelo Projeto Montesul (Associação Montes Claros de Catadores), no dia 23/10/2026, em decorrência da palestra realizada nesta unidade escolar.

**Exemplo de aluno**

> Faça uma declaração de matrícula para o aluno João Pedro Silva, do 2º ano E, ano letivo 2026, turno vespertino.

O nome acima é fictício. Para frequência, informe a situação confirmada ou use os campos do formulário. Não é necessário cadastrar o aluno como servidor.

Também são aceitos rótulos, separados por linha, ponto e vírgula ou vírgula: `Aluno:`, `Pessoa:`, `Turma:`, `Ano letivo:`, `Materiais:`, `Quantidade:`, `Projeto:`, `Data:`, `Entrada:`, `Saída:`, `Pedido:`, `Finalidade:`, `Fatos:` e `Anexos:`. Datas sem ano e pedidos com várias datas podem precisar de preenchimento explícito. As referências complementares são mantidas no rascunho e precisam de conferência.

## Manutenção e validação

- `js/assistente-documental.js`: catálogo, interpretação dos pedidos, validação e redação dos modelos amplos.
- `js/documentos-servidores.js`: formulário, prévia, exportação e integração com o motor anterior de servidores.
- O HTML carrega os dois scripts na ordem necessária, com versão atualizada para evitar o uso da versão anterior em cache.
- `node scripts/test-documentos.mjs`: exemplos de recebimento e aluno, dados ausentes, negação, fatos incomuns, complementos, edições manuais, troca de pessoa, validação de datas/horas, todos os modelos e regressões de servidores.
- `node scripts/test-cloudflare.mjs`: rotas, autenticação simulada, construção do site e sintaxe.
- `scripts/test-documentos-dom.mjs`: teste de integração em DOM simulado com dados fictícios e exportação Word. Requer `linkedom` somente no ambiente de teste, resolvido pelo Node ou pelo caminho em `DOCUMENTOS_DOM_MODULE`. Não equivale a uma inspeção visual de impressão no navegador.

O modo de regras não cobre compreensão irrestrita de linguagem natural. Para assuntos fora das regras, selecione um modelo livre e forneça os fatos ou ative o modelo de linguagem local. O modelo de linguagem também pode errar e tem limites de contexto e capacidade; confira a redação antes de emitir.
