import chokidar from 'chokidar';
import { copyFile, readFile, watch, mkdir } from 'fs';
import { chdir, cwd } from 'process';
import debounce from 'lodash-es/debounce.js';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const debouncedEvent = debounce((eventType, filename) => {
  chdir(`${__dirname}/../`);
  const curdir = cwd();
  // find all configs
  // save directory of config to Map
  // check if file v directory is in Map
  // if so, run run build
  const configs = recursive(`${curdir}/src`).filter((file) => {
    return file.includes('_config.js');
  });

  for (const config of configs) {
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
          console.log('transpiling');
          if (transpiler) {
            console.log(outputFile);
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
}, 20);

debouncedEvent();
chokidar.watch('./src').on('all', debouncedEvent);

function recursive(dir, filelist = []) {
  const files = readdirSync(dir);
  for (const file of files) {
    const path = join(dir, file);
    if (statSync(path).isDirectory()) {
      filelist = recursive(path, filelist);
    } else {
      filelist.push(path);
    }
  }
  return filelist;
}
