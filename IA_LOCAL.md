# IA de linguagem no computador da escola

Esta atualização acrescenta um modelo de linguagem aberto à página de documentos.
Ele pode redigir pedidos novos, revisar textos e manter uma conversa em português.
Há dois perfis: Qwen3 4B, de maior capacidade, e Qwen3 1.7B, de menor consumo.
Esses modelos não são o ChatGPT nem têm desempenho garantido equivalente a ele.
Os 58 modelos de documentos e os modelos oficiais continuam disponíveis.

## Ativação

1. Abra **Documentos da Escola** com uma conta de secretaria ou administração.
2. Em **IA de linguagem neste computador**, selecione o perfil e clique em
   **Baixar / ativar IA local**. O navegador verifica a compatibilidade.
3. Espere a indicação **Modelo pronto**. O primeiro uso baixa arquivos que
   podem ocupar alguns GB; não feche a página durante a preparação.
4. O modo **Modelo de linguagem local** será selecionado após o carregamento.
   Descreva os fatos, escolha o assunto ou deixe **Identificar pelo pedido**
   e clique em **Preparar documento**.
5. Use **Complementar pedido**, **Melhorar texto**, **Mais sucinto** ou
   **Mais formal** para revisar. **Atualizar texto** usa os campos atuais
   do formulário no modo de linguagem. Confira a prévia antes de emitir.
6. Para perguntas gerais, abra **Conversar com a IA**. A opção de incluir o
   documento atual como referência fica desmarcada até o operador escolhê-la.
7. **Parar / liberar memória** encerra o processamento. Para usar novamente,
   ative o modelo. É possível voltar a **Modelos e regras locais** a qualquer momento.

O navegador precisa oferecer WebGPU, aceleração de hardware e memória suficiente.
Use o perfil leve se o maior não carregar. A compatibilidade depende do navegador,
da GPU e do sistema operacional. Não há um processamento remoto substituto.
O cache pertence a cada navegador e computador; limpeza de dados ou falta de
espaço pode exigir novo download. O pacote não inclui os pesos dos modelos.

## O que fica local

O motor WebLLM está empacotado no próprio site. O download inicial padrão busca
somente arquivos dos quatro registros aprovados de Qwen3, com variantes para
GPUs com ou sem `shader-f16`. Não há chave ou endpoint remoto de inferência.
O pedido segue por mensagem a um worker, que executa a geração no computador.
Requisições HTTP pelo motor são bloqueadas durante a geração. Esse bloqueio
não impede o funcionamento normal de autenticação e cadastro do site no Supabase.
O sistema como um todo continua sendo um site conectado; não é uma instalação
completa da escola que possa funcionar sem internet.

**Opções de instalação → Usar arquivos hospedados pela escola** é uma opção
avançada e só funciona depois da instalação dos arquivos pela equipe técnica.
Nesse modo, até os arquivos do modelo são solicitados apenas ao próprio domínio.
Os pesos e suas licenças devem ficar em
`modelos/<model_id>/resolve/main/`, com configuração, tokenizador e todos os
shards de `ndarray-cache.json`; a biblioteca compilada correspondente fica em
`modelos/<model_id>/modelo.wasm`. Os registros originais estão no catálogo
de `@mlc-ai/web-llm` 0.2.85. O build copia a pasta `modelos/` quando ela existe,
mas não baixa seus arquivos nem contorna limites de tamanho da hospedagem.
A publicação padrão usa a primeira opção, com download das fontes oficiais.

## Preservação e limites

O modelo recebe os fatos informados, o modelo escolhido, os campos pertinentes
e, nas revisões, o texto atual. Servidores não relacionados ficam fora do contexto;
um aluno não recebe dados de servidor por ter nome parecido. A IA não consulta
um cadastro de estudantes nem confirma matrícula ou frequência escolar.

O corpo retorna em JSON e passa por validação de formato, modelo e texto.
Conteúdo HTML ou respostas incompletas são recusados. Cabeçalho, numeração,
destinatário e assinatura continuam montados pelo formulário. Essa validação
não comprova a veracidade da redação; o modelo pode omitir ou inventar fatos.

Cancelamento, incompatibilidade, falha ou limite de processamento mantêm o
documento já exibido. Se o operador editar o documento durante a geração,
a nova sugestão aguarda aplicação manual. **Desfazer** restaura a versão
anterior na sessão. Isso não equivale a salvar um rascunho após fechar a página.
Pedidos e conversas muito longos precisam ser divididos; não são cortados
silenciosamente. **Nova conversa** limpa o histórico usado nas próximas respostas.

## Teste de aceitação no computador de uso

Comece com dados fictícios. Este teste ainda precisa ser realizado com os pesos
reais, na GPU e no navegador da escola:

1. Ative o modelo e confirme o perfil carregado.
2. Peça: “Faça uma declaração de que a escola recebeu 06 (seis) lixeiras
   destinadas à coleta seletiva de materiais recicláveis do Projeto Montesul
   (Associação Montes Claros de Catadores), no dia 23/10/2026, em decorrência
   de uma palestra na escola.” Confira quantidade, finalidade, projeto e data.
   Não deve ser exigido cadastro de servidor.
3. Peça uma declaração de matrícula de **João Pedro Silva**, aluno fictício do
   **2º ano E**, ano letivo **2026**, turno **vespertino**. Confira que não há
   matrícula funcional nem afirmação automática de frequência ou aprovação.
4. Peça uma revisão de um assunto diferente, com uma ressalva explícita:
   “Os equipamentos foram emprestados; não houve doação.” Confira que a
   ressalva permanece. Acrescente uma finalidade e teste **Desfazer**.
5. Faça uma pergunta na conversa, depois uma pergunta que dependa da resposta
   anterior. Confira português, coerência e capacidade para o trabalho real.
6. Teste **Cancelar**, prévia, impressão/PDF e exportação Word. Avalie o tempo
   de resposta e se o navegador permanece utilizável. Se necessário, use o perfil leve.

Os testes automatizados verificam a integração com engine, GPU e rede simuladas,
os exemplos dos modelos, o formulário em DOM simulado, a exportação e o build.
Não medem qualidade da linguagem, velocidade, consumo real de memória ou
conformidade visual da impressão no computador de uso.

## Manutenção

O worker compilado é distribuído pronto. Para recompilar, instale as dependências
fixadas com `npm ci` e execute `npm run build:ia`. O fonte fica em
`source/ia-local-worker.entry.js`. Execute `npm test` e, quando `linkedom` estiver
disponível no ambiente de teste, `node scripts/test-documentos-dom.mjs`.
O teste de navegador `scripts/test-documentos-ui.mjs` requer Playwright e Chromium.

Referências técnicas: [WebLLM](https://webllm.mlc.ai/docs/),
[API do WebLLM](https://webllm.mlc.ai/docs/user/api_reference.html),
[Qwen3 4B em MLC](https://huggingface.co/mlc-ai/Qwen3-4B-q4f16_1-MLC).
As licenças do motor empacotado acompanham `js/IA_LOCAL_LICENSE.txt`.
