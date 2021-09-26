import { copyFile, mkdir, readFile, readdir, stat } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { chdir, cwd } from 'process';
import { promisify } from 'util';

import chokidar from 'chokidar';
import debounce from 'lodash-es/debounce.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function build({ filename, input = 'src', output = 'dist' }) {
  const curdir = cwd();
  const savedFile = `${curdir}/${filename}`;
  const configs = findFilesRecursively('_config', `${curdir}/${input}`);
  for (const config of configs) {
    console.log(`Loading config: ${config}`);
  }
  for await (const config of configs) {
    const { inputdir, outputdir } = configPathDetails(config);
    const { output: configOutput = output, transforms } = await import(config);
    const destination = `${curdir}/${configOutput}/${outputdir}`;
    if (!transforms) return;

    for (const transform of transforms) {
      const [src, dest = src, transpiler] = transform;
      const sourceFile = `${inputdir}/${src}`;

      if (sourceFile === savedFile || !filename) {
        const outputFile = `${destination}${dest}`;
        const outputDir = dirname(outputFile);
        await promisify(mkdir)(outputDir, { recursive: true });

        console.log(`transpiling ${sourceFile} to ${outputFile}`);
        if (transpiler) {
          readFile(sourceFile, (error, data) => {
            transpiler(sourceFile, data.toString('utf8'), outputFile);
          });
        } else {
          copyFile(sourceFile, outputFile, (err) => {});
        }
      }
    }
  }
}

async function* findFilesRecursively(name, dir) {
  for await (const file of await promisify(readdir)(dir)) {
    const path = join(dir, file);
    if ((await promisify(stat)(path)).isDirectory()) {
      yield* findFilesRecursively(name, path);
    } else {
      if (file.includes(name)) {
        yield path;
      }
    }
  }
}

function configPathDetails(path) {
  const pathParts = path.split('/');
  const name = pathParts.pop();
  const inputdir = pathParts.join('/');
  let outputdir = pathParts.slice(
    pathParts.indexOf('src') + 1,
    pathParts.length
  );
  outputdir = outputdir.join('/');
  if (outputdir.length > 0) outputdir = `${outputdir}/`;
  return { name, inputdir, outputdir };
}

export function watch(input, output) {
  chokidar.watch(input).on(
    'all',
    debounce((_, filename) => build({ filename, input, output }), 20)
  );
}
