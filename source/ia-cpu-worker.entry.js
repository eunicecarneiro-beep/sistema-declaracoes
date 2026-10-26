import {AutoTokenizer, AutoModelForCausalLM, TextStreamer, env} from '@huggingface/transformers';

// Modelo público fixado. A geração é feita por WebAssembly, sem WebGPU.
const MODELO='onnx-community/Qwen3-0.6B-ONNX';
const REVISAO='58ca03a5e7b354b480b1a82b34bde8dc7b854cc0';
const fetchOriginal=globalThis.fetch.bind(globalThis);
const runtime=new URL('ia-cpu/',globalThis.location.href);
let tokenizer=null,model=null,ocupado=false,inferencia=false,origem='publica';
env.allowLocalModels=false;
env.useBrowserCache=true;
env.backends.onnx.wasm.numThreads=1;
env.backends.onnx.wasm.proxy=false;
env.backends.onnx.wasm.wasmPaths=runtime.href;

globalThis.fetch=async(input,init={})=>{
  const url=new URL(typeof input==='string'||input instanceof URL?String(input):input.url,globalThis.location.href);
  const metodo=String(init.method||(input instanceof Request?input.method:'GET')).toUpperCase();
  const base=origem==='escola'
    ?new URL('../modelos/'+MODELO+'/',globalThis.location.href).href
    :'https://huggingface.co/'+MODELO+'/resolve/'+REVISAO+'/';
  const permitido=url.href.startsWith(base)||url.href.startsWith(runtime.href);
  if(inferencia)throw new Error('Chamada de rede bloqueada durante a geração local.');
  if(!permitido||!['GET','HEAD'].includes(metodo)||init.body||(input instanceof Request&&input.body))throw new Error('Este processo só pode baixar os arquivos aprovados da IA por CPU.');
  return fetchOriginal(input,{...init,credentials:'omit',referrerPolicy:'no-referrer'});
};
const responder=(id,resultado,erro)=>globalThis.postMessage({id,resultado,erro});
globalThis.onmessage=async({data})=>{
  const{id,acao,dados}=data||{};
  if(ocupado){responder(id,null,'A IA está ocupada.');return;}
  ocupado=true;
  try{
    if(acao==='carregar'){
      if(dados?.perfil!=='cpu'||!['publica','escola'].includes(dados.origem||'publica'))throw new Error('Configuração da IA por CPU inválida.');
      origem=dados.origem||'publica';
      env.allowLocalModels=origem==='escola';
      env.allowRemoteModels=origem!=='escola';
      env.localModelPath=new URL('../modelos/',globalThis.location.href).href;
      const progress_callback=p=>{
        const pct=Number.isFinite(p.progress)?Math.min(100,Math.round(p.progress)):null;
        const texto=p.status==='progress'?'Baixando IA para o processador'+(pct===null?'…':': '+pct+'% do arquivo atual.')
          :p.status==='done'?'Arquivo preparado. Iniciando a IA no processador…':'Preparando a IA no processador. O primeiro download é de aproximadamente 630 MB.';
        globalThis.postMessage({id,evento:'progresso',etapa:'carregando',texto,progresso:pct===null?null:pct/100});
      };
      const options={revision:REVISAO,progress_callback};
      tokenizer=await AutoTokenizer.from_pretrained(MODELO,options);
      model=await AutoModelForCausalLM.from_pretrained(MODELO,{...options,device:'wasm',dtype:'q8'});
      responder(id,{modelo:MODELO,motor:'cpu'});
    }else if(acao==='gerar'){
      if(!model||!tokenizer)throw new Error('Carregue o modelo antes de gerar.');
      if(!Array.isArray(dados?.mensagens)||dados.mensagens.length>40||JSON.stringify(dados.mensagens).length>16000||!['documento','conversa'].includes(dados.modo))throw new Error('O contexto deste pedido é inválido ou longo demais para o modo CPU.');
      const inputs=tokenizer.apply_chat_template(dados.mensagens,{tokenize:true,return_dict:true,add_generation_prompt:true,enable_thinking:false});
      const tamanho=inputs.input_ids.dims.at(-1);
      if(tamanho>3072)throw new Error('O pedido ultrapassa o contexto da IA por CPU. Divida o texto em trechos menores. Seu rascunho foi mantido.');
      const maxTokens=dados.modo==='documento'?600:400;
      let tokens=0,ultimoAviso=0;
      const streamer=new TextStreamer(tokenizer,{skip_prompt:true,callback_function:()=>{},token_callback_function:()=>{
        tokens++;const agora=Date.now();
        if(agora-ultimoAviso>750){ultimoAviso=agora;globalThis.postMessage({id,evento:'progresso',etapa:'gerando',texto:'Escrevendo no processador: '+tokens+' partes de texto geradas. Você pode cancelar a qualquer momento.'});}
      }});
      inferencia=true;
      try{
        const output=await model.generate({...inputs,max_new_tokens:maxTokens,do_sample:false,repetition_penalty:1.1,streamer});
        const ids=output.tolist()[0].slice(tamanho);
        const texto=tokenizer.decode(ids,{skip_special_tokens:true}).trim();
        const eos=model.generation_config?.eos_token_id??[151643,151645];
        const terminou=(Array.isArray(eos)?eos:[eos]).some(x=>ids.at(-1)==x);
        responder(id,{texto,motivo:!terminou&&ids.length>=maxTokens?'length':'stop'});
      }finally{inferencia=false;}
    }else throw new Error('Operação de IA inválida.');
  }catch(e){responder(id,null,String(e?.message||'Falha ao executar a IA no processador.'));}
  finally{ocupado=false;}
};
