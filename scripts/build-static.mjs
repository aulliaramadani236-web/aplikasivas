import { mkdir, copyFile, cp, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const apk = await readFile(path.join(root, 'downloads/VAS-Android.apk'));
const release = JSON.parse(await readFile(path.join(root, 'downloads/android-release.json'), 'utf8'));
if (apk.length !== release.bytes || createHash('sha256').update(apk).digest('hex') !== release.sha256) {
  throw new Error('APK size/checksum does not match release metadata.');
}
const files = [
  'index.html', 'aplikasi.html', 'profile.css', 'profile.js',
  'style.css', 'auth.css', 'app.js', 'auth.js', 'domain.js', 'unduh.html'
];
// Publish only runtime files; tests and development files stay out of the site.
await Promise.all(files.map(file => access(path.join(root, file))));
await mkdir(output, { recursive: true });
await Promise.all(files.map(file => copyFile(path.join(root, file), path.join(output, file))));
await cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
await cp(path.join(root, 'downloads'), path.join(output, 'downloads'), { recursive: true });
console.log('VAS static site ready in dist/: profile, application, and assets.');
