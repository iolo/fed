import { cp, mkdir, rm } from 'node:fs/promises';

const files = ['index.html', 'gallery.html', 'fed.css', 'fed.js', 'fonts.json'];

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });

for (const file of files) {
    await cp(file, `dist/${file}`);
}

await cp('samples', 'dist/samples', { recursive: true });

