import chokidar from 'chokidar';
import { copyFile, readFile, watch, mkdir } from 'fs';
import { chdir, cwd } from 'process';
import debounce from 'lodash-es/debounce.js';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function build(eventType, filename) {
  const curdir = cwd();
  for (const config of findFilesRecursively('_config.js', `${curdir}/src`)) {
    const path = config.split('/');
    let inputdir = config.split('/');
    inputdir.pop();
    inputdir = inputdir.join('/');

    const explodedPath = path.slice(path.indexOf('src') + 1, path.length - 1);
    let outputDir = explodedPath.join('/');
    if (explodedPath.length > 0) outputDir = `${outputDir}/`;

    import(config).then(({ output = 'dist', transforms }) => {
      const destination = `${curdir}/${output}/${outputDir}`;
      if (!transforms) return;

      for (const transform of transforms) {
        const [src, dest = src, transpiler] = transform;
        const inputFile = `${inputdir}/${src}`;
        const fileName = `${curdir}/${filename}`;
        if (inputFile === fileName) {
          const outputFile = `${destination}${dest}`;
          const outputDir = dirname(outputFile);

          mkdir(outputDir, { recursive: true }, (err) => {});
          console.log(`transpiling ${inputFile} to ${outputFile}`);
          if (transpiler) {
            readFile(inputFile, (error, data) => {
              transpiler(inputFile, data.toString('utf8'), outputFile);
            });
          } else {
            copyFile(inputFile, outputFile, (err) => {});
          }
        }
      }
    });
  }
}

const debouncedBuild = debounce(build, 20);

chdir(`${__dirname}/../`);
build();

chokidar.watch('./src').on('all', debouncedBuild);

function* findFilesRecursively(name, dir) {
  for (const file of readdirSync(dir)) {
    const path = join(dir, file);
    if (statSync(path).isDirectory()) {
      yield* findFilesRecursively(name, path);
    } else {
      if (file.includes(name)) {
        yield path;
      }
    }
  }
}
