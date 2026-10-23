import {MLCEngine,prebuiltAppConfig} from '@mlc-ai/web-llm';

const fetchOriginal=globalThis.fetch.bind(globalThis);
const idsPermitidos=['Qwen3-1.7B-q4f16_1-MLC','Qwen3-1.7B-q4f32_1-MLC','Qwen3-4B-q4f16_1-MLC','Qwen3-4B-q4f32_1-MLC'];
const modelos=prebuiltAppConfig.model_list.filter(m=>idsPermitidos.includes(m.model_id));
if(modelos.length!==4)throw new Error('O catálogo compilado da IA local está incompleto.');
let engine=null,inferencia=false,ocupado=false,modelosAtivos=modelos;

// Fora da geração, somente GET/HEAD de arquivos dos quatro modelos aprovados.
// Durante a geração, nenhuma chamada fetch é permitida.
globalThis.fetch=async(input,init={})=>{
  const url=new URL(typeof input==='string'||input instanceof URL?String(input):input.url,globalThis.location.href);
  const metodo=String(init.method||(input instanceof Request?input.method:'GET')).toUpperCase();
  // WASM embutido em data URI é conteúdo local, sem requisição de rede.
  if(url.href.startsWith('data:application/octet-stream;base64,')&&metodo==='GET'&&!init.body)return fetchOriginal(input,init);
  if(inferencia)throw new Error('Chamada de rede bloqueada durante a geração local.');
  const permitido=modelosAtivos.some(m=>{
    const base=m.model.includes('/resolve/')?m.model:m.model.replace(/\/$/,'')+'/resolve/main/';
    return url.href.startsWith(base)||url.href.startsWith(base.replace('/resolve/','/raw/'))||url.href===m.model_lib;
  });
  if(!permitido||!['GET','HEAD'].includes(metodo)||init.body||(input instanceof Request&&input.body))throw new Error('Este processo só pode baixar arquivos públicos dos modelos aprovados.');
  return fetchOriginal(input,{...init,credentials:'omit',referrerPolicy:'no-referrer'});
};
function responder(id,resultado,erro){globalThis.postMessage({id,resultado,erro});}
globalThis.onmessage=async({data})=>{
  const{id,acao,dados}=data||{};
  if(acao==='cancelar'){engine?.interruptGenerate();return;}
  if(ocupado){responder(id,null,'A IA está ocupada.');return;}
  ocupado=true;
  try{
    if(acao==='carregar'){
      if(!['leve','qualidade'].includes(dados?.perfil))throw new Error('Perfil de IA inválido.');
      if(!['publica','escola'].includes(dados.origem||'publica'))throw new Error('Origem do modelo inválida.');
      const tamanho=dados.perfil==='leve'?'1.7B':'4B';
      const modeloId=`Qwen3-${tamanho}-${dados.shaderF16?'q4f16_1':'q4f32_1'}-MLC`;
      if(engine)await engine.unload();
      modelosAtivos=dados.origem==='escola'?modelos.map(m=>({...m,model:new URL('../modelos/'+m.model_id+'/resolve/main/',globalThis.location.href).href,model_lib:new URL('../modelos/'+m.model_id+'/modelo.wasm',globalThis.location.href).href})):modelos;
      engine=new MLCEngine({appConfig:{...prebuiltAppConfig,model_list:modelosAtivos,cacheBackend:'indexeddb'},initProgressCallback:p=>globalThis.postMessage({evento:'progresso',texto:'Preparando a IA local: '+Math.round((p.progress||0)*100)+'% concluído. O primeiro uso pode levar alguns minutos.',progresso:p.progress})});
      engine.setLogLevel('ERROR');
      await engine.reload(modeloId,{context_window_size:8192});
      responder(id,{modelo:modeloId});
    }else if(acao==='gerar'){
      if(!engine)throw new Error('Carregue o modelo antes de gerar.');
      if(!Array.isArray(dados?.mensagens)||dados.mensagens.length>40||JSON.stringify(dados.mensagens).length>20000)throw new Error('O contexto deste pedido é inválido ou longo demais.');
      if(!['documento','conversa'].includes(dados.modo))throw new Error('Modo de geração inválido.');
      inferencia=true;
      try{
        await engine.resetChat();
        const r=await engine.chat.completions.create({messages:dados.mensagens,temperature:0.4,top_p:0.8,max_tokens:dados.modo==='documento'?1800:1400,stream:false,extra_body:{enable_thinking:false},...(dados.modo==='documento'?{response_format:{type:'json_object',schema:JSON.stringify(dados.esquema)}}:{})});
        const escolha=r.choices?.[0];
        responder(id,{texto:escolha?.message?.content||'',motivo:escolha?.finish_reason||''});
      }finally{inferencia=false;}
    }else throw new Error('Operação de IA inválida.');
  }catch(e){responder(id,null,String(e?.message||'Falha ao executar a IA local.'));}finally{ocupado=false;}
};
