import { mkdir, copyFile, cp, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const files = [
  'index.html', 'aplikasi.html', 'profile.css', 'profile.js',
  'style.css', 'auth.css', 'app.js', 'auth.js', 'domain.js'
];
// Publish only runtime files; tests and development files stay out of the site.
await Promise.all(files.map(file => access(path.join(root, file))));
await mkdir(output, { recursive: true });
await Promise.all(files.map(file => copyFile(path.join(root, file), path.join(output, file))));
await cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
console.log('VAS static site ready in dist/: profile, application, and assets.');
