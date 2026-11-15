import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const dest = path.join(root, 'android/app/src/main/assets');
await mkdir(path.join(dest, 'assets'), { recursive: true });
for (const name of ['aplikasi.html','style.css','auth.css','app.js','auth.js','domain.js']) {
  let text = await readFile(path.join(root,name),'utf8');
  if (name.endsWith('.css')) text = text.replace(/@import\s+url\([^;]+;/g,'');
  if (name === 'aplikasi.html') text = text.replaceAll('href="index.html#kontak"','href="https://aplikasi-vas.vercel.app/#kontak"');
  if (name === 'auth.js') text = text.replaceAll('href="index.html"','href="https://aplikasi-vas.vercel.app/"');
  if (name === 'app.js') text = text.replace('function download(name,data,type){','function download(name,data,type){if(window.VASAndroid){window.VASAndroid.saveFile(name,"\\ufeff"+data,type);return;}');
  await writeFile(path.join(dest,name), text);
}
await copyFile(path.join(root,'assets/logo-vas.jpg'),path.join(dest,'assets/logo-vas.jpg'));
console.log('Offline Android assets ready; native CSV, backup, and print enabled.');
