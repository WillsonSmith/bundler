import { copyFile, mkdir, readFile, readdir, stat } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { chdir, cwd } from 'process';
import { promisify } from 'util';

import chokidar from 'chokidar';
import debounce from 'lodash-es/debounce.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function build(eventType, filename) {
  const curdir = cwd();
  const savedFile = `${curdir}/${filename}`;
  const configs = findFilesRecursively('_config.js', `${curdir}/src`);
  for await (const config of configs) {
    const { inputdir, outputdir } = configPathDetails(config);
    const { output = 'dist', transforms } = await import(config);
    const destination = `${curdir}/${output}/${outputdir}`;

    if (!transforms) return;
    for (const transform of transforms) {
      const [src, dest = src, transpiler] = transform;
      const sourceFile = `${inputdir}/${src}`;

      if (sourceFile === savedFile) {
        const outputFile = `${destination}${dest}`;
        const outputDir = dirname(outputFile);

        mkdir(outputDir, { recursive: true }, (err) => {
          console.log(`transpiling ${sourceFile} to ${outputFile}`);
          if (transpiler) {
            readFile(sourceFile, (error, data) => {
              transpiler(sourceFile, data.toString('utf8'), outputFile);
            });
          } else {
            copyFile(sourceFile, outputFile, (err) => {});
          }
        });
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

chdir(`${__dirname}/../`);

build();
chokidar.watch('./src').on('all', debounce(build, 20));
