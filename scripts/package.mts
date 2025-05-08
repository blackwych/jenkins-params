import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import archiver from 'archiver';

const rootDir = resolve(import.meta.dirname, '..');
const srcDir = resolve(rootDir, 'build');
const destDir = resolve(rootDir, 'dist');
const destZip = resolve(destDir, 'jenkins-params.zip');

if (!existsSync(destDir)) {
  mkdirSync(destDir);
}

const archive = archiver('zip');
archive.directory(srcDir, false);
archive.pipe(createWriteStream(destZip));
archive.finalize();
