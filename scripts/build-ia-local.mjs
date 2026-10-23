import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url);
const modules=process.env.IA_LOCAL_NODE_MODULES;
const {build}=modules?require(path.join(modules,'esbuild')):require('esbuild');
const runtimeDir=modules?path.join(modules,'@mlc-ai/web-llm'):path.dirname(require.resolve('@mlc-ai/web-llm/package.json'));
const pkg=JSON.parse(await fs.readFile(path.join(runtimeDir,'package.json'),'utf8'));
if(pkg.version!=='0.2.85')throw new Error('Use a versão validada de @mlc-ai/web-llm: 0.2.85.');
await build({entryPoints:[path.join(root,'source/ia-local-worker.entry.js')],outfile:path.join(root,'js/ia-local-worker.js'),bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'inline',nodePaths:modules?[modules]:undefined,banner:{js:'/* IA local: WebLLM '+pkg.version+'; fonte em source/ia-local-worker.entry.js. Licença em IA_LOCAL_LICENSE.txt. */'}});
await fs.copyFile(path.join(runtimeDir,'LICENSE'),path.join(root,'js/IA_LOCAL_LICENSE.txt'));
const loglevelDir=modules?path.join(modules,'loglevel'):path.dirname(path.dirname(require.resolve('loglevel')));
for(const nome of ['LICENSE','LICENSE.txt']){try{const licenca=await fs.readFile(path.join(loglevelDir,nome),'utf8');await fs.appendFile(path.join(root,'js/IA_LOCAL_LICENSE.txt'),'\n\n--- loglevel (MIT) ---\n'+licenca);break;}catch{}}
const stat=await fs.stat(path.join(root,'js/ia-local-worker.js'));
console.log('Motor local empacotado:',stat.size,'bytes. Os pesos dos modelos são baixados apenas na ativação pelo usuário.');
