import { copyFile, mkdir, readFile, readdirSync, statSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { chdir, cwd } from 'process';

import chokidar from 'chokidar';
import debounce from 'lodash-es/debounce.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function build(eventType, filename) {
  const curdir = cwd();
  for (const config of findFilesRecursively('_config.js', `${curdir}/src`)) {
    const { inputdir, outputdir } = configPathDetails(config);
    const { output = 'dist', transforms } = await import(config);
    const destination = `${curdir}/${output}/${outputdir}`;

    if (!transforms) return;
    for (const transform of transforms) {
      const [src, dest = src, transpiler] = transform;
      const sourceFile = `${inputdir}/${src}`;
      const savedFile = `${curdir}/${filename}`;

      if (sourceFile === savedFile) {
        const outputFile = `${destination}${dest}`;
        const outputDir = dirname(outputFile);

        mkdir(outputDir, { recursive: true }, (err) => {});
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

function configPathDetails(path) {
  const pathParts = path.split('/');
  const name = pathParts.pop();
  // console.log(pathParts.slice(0, pathParts.length - 1));
  const inputdir = pathParts.join('/');
  let outputdir = pathParts.slice(
    pathParts.indexOf('src') + 1,
    pathParts.length
  );
  outputdir = outputdir.join('/');
  if (outputdir.length > 0) outputdir = `${outputdir}/`;
  return { name, inputdir, outputdir };
}
