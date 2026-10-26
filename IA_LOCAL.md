# Modo rápido e IA local opcional

Em Documentos da Escola, descreva o pedido e clique em Preparar documento.
O padrão é Rápido: interpretação por regras e modelos documentais, sem
carregamento de pesos, inicialização de GPU ou geração por modelo de linguagem.
Confira os dados identificados nos campos e a prévia. Pedidos fora das regras
podem exigir escolha de assunto, informações adicionais ou edição manual.

Refinar documento com IA revisa explicitamente a minuta atual. A opção
IA local no seletor usa o modelo de linguagem também na preparação dos textos.
Essas opções continuam sujeitas ao download e ao tempo de processamento abaixo.
O refinamento e a conversa não mudam automaticamente a preferência pelo modo
rápido. As novas preferências usam outra versão para que a configuração antiga
de ativação automática não mantenha a espera pelo modelo como padrão.

No perfil de execução Automático, a IA usa Qwen3 1.7B pela GPU quando há adaptador WebGPU; se não houver
adaptador ou o carregamento pela GPU falhar, tenta Qwen3 0.6B pelo processador
com Transformers.js 3.8.1, ONNX Runtime e WebAssembly. Qwen3 4B pode ser escolhido
explicitamente. O perfil CPU não consulta nem exige WebGPU.

O primeiro uso pelo processador baixa aproximadamente 630 MB. Os perfis GPU
podem baixar alguns GB. O cache pode reutilizar os arquivos, mas o navegador
pode removê-los por falta de espaço ou limpeza de dados. Memória, WebAssembly
e acesso às fontes dos modelos continuam necessários. O modo CPU pode levar
minutos para escrever. Políticas da organização podem impedir downloads ou
execução. Nenhuma mudança de política do navegador é necessária ou realizada.

## Conferência e alternativa automática

Falha de carregamento produz um rascunho pelos modelos e regras locais, com
aviso explícito. A redação pelo processador usa um contexto compacto, montado
a partir do rascunho e dos fatos informados. O formulário conserva a escolha
do modelo, cabeçalho, numeração e assinatura.

A resposta CPU passa por verificações de formatação, nomes reconhecidos,
números, datas, comodato e presença de negação. Se essas verificações falharem,
o sistema usa o rascunho dos modelos locais e informa isso. Essas verificações
são heurísticas: podem rejeitar paráfrases corretas e não comprovam a fidelidade
completa do texto. A conferência humana antes da emissão continua necessária.

Os testes reais em Chromium 131, sem GPU e sem isolamento entre origens,
confirmaram a execução do modelo pelo processador. Também encontraram
respostas inadequadas e alterações de fatos; o perfil leve tem capacidade
limitada. Não foi demonstrada qualidade equivalente ao ChatGPT nem validada
a execução no computador gerenciado da escola.

Cancelar e Parar / liberar memória interrompem o worker. Edições manuais
feitas durante a geração aguardam aplicação explícita da sugestão. Desfazer
restaura a versão anterior na sessão. Isso não salva o rascunho após fechar
a página. O modo Modelos e regras locais dispensa download de pesos.

## Privacidade e arquivos

Não há chave paga nem endpoint de inferência remoto. O modelo roda em worker.
A rede do worker só permite downloads GET/HEAD dos arquivos aprovados e fica
bloqueada durante a geração. O restante do site continua conectado ao Supabase.
Somente as opções de execução são guardadas nas preferências locais, sem os
pedidos, conversas ou documentos.

O modelo CPU é onnx-community/Qwen3-0.6B-ONNX, revisão
58ca03a5e7b354b480b1a82b34bde8dc7b854cc0, dtype q8. A execução utiliza uma
thread, sem exigir SharedArrayBuffer ou alterações de isolamento do site.
Os binários WebAssembly acompanham o build do próprio site.

A origem Escola é avançada e exige instalação prévia pela equipe técnica.
Para CPU, coloque configuração, tokenizador e onnx/model_quantized.onnx em
modelos/onnx-community/Qwen3-0.6B-ONNX/. Para GPU, use
modelos/<model_id>/resolve/main/ com todos os shards e configuração, mais
modelos/<model_id>/modelo.wasm. Limites de tamanho da hospedagem continuam
válidos; o build não instala pesos nem contorna esses limites.

## Manutenção

npm ci instala as versões fixadas; npm run build compila os dois workers e
prepara dist/. A configuração .npmrc dispensa o download de CUDA do pacote
Node, que não é usado pelo site. Não envie node_modules ou pesos ao GitHub.

npm test verifica integração simulada, regressões documentais, rotas, sintaxe
e build. scripts/test-documentos-dom.mjs exige linkedom no ambiente de teste.
scripts/test-documentos-ui.mjs exige Playwright e Chromium; DOCUMENTOS_CHROMIUM
permite indicar o executável. Testes simulados não medem a qualidade real.

Referências: https://webllm.mlc.ai/docs/ e
https://huggingface.co/docs/transformers.js/v3.8.1/index.
Licenças em js/IA_LOCAL_LICENSE.txt.
