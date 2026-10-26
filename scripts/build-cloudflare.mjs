import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const pages = (await readdir(root)).filter(name => /^[a-z0-9-]+\.html$/.test(name));
if (!pages.includes('index.html') || !pages.includes('login.html')) {
  throw new Error('As páginas principais do sistema não foram encontradas.');
}
await stat(path.join(root, '_headers'));
// Compila o motor com as dependências fixadas instaladas pelo Cloudflare.
// Os pesos do modelo continuam sendo baixados apenas na ativação do operador.
await import('./build-ia-local.mjs');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of [...pages, '_headers']) await cp(path.join(root, file), path.join(output, file));
for (const folder of ['js', 'css']) {
  await mkdir(path.join(output, folder), { recursive: true });
  for (const name of await readdir(path.join(root, folder))) {
    if (name.endsWith(folder === 'js' ? '.js' : '.css') || (folder === 'js' && name === 'IA_LOCAL_LICENSE.txt')) {
      await cp(path.join(root, folder, name), path.join(output, folder, name));
    }
  }
}
await cp(path.join(root,'js/ia-cpu'),path.join(output,'js/ia-cpu'),{recursive:true});
// Instalação própria opcional. Os pesos nunca são baixados pelo build.
try {
  if ((await stat(path.join(root, 'modelos'))).isDirectory()) {
    await cp(path.join(root, 'modelos'), path.join(output, 'modelos'), { recursive: true });
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
console.log(`Publicação preparada em dist: ${pages.length} páginas, scripts, CSS e cabeçalhos.`);

