import { copyFile, readFile, watch, writeFile } from 'fs';
import { promisify } from 'util';
import { chdir } from 'process';
import debounce from 'lodash-es/debounce.js';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Allow multiple source folders w/ configs */
const debouncedEvent = debounce((eventType, filename) => {
  import('../src/_config.js').then(({ output = '../dist', transforms }) => {
    chdir(`${__dirname}/../src`);
    for (const transform of transforms) {
      const [src, dest = src, transpiler] = transform;

      if (!filename || filename === src) {
        if (transpiler) {
          readFile(src, (err, data) => {
            transpiler(src, data.toString('utf8'), `${output}/${dest}`);
          });
        } else {
          /** Don't need to do this for transforms
           * Can manually handle transforms
           */
          if (Array.isArray(src)) {
            /** read files from array
             * combine files into one string
             * transpile string
             */
            const files = src.map((file) => promisify(readFile)(file, 'utf8'));
            Promise.all(files).then((files) => {
              const code = files.join('\n');
              writeFile(`${output}/${dest}`, code, () => {});
            });
            return;
          }

          copyFile(src, `${output}/${dest}`, (error) => {
            if (error) throw error;
          });
        }
      }
    }
  });
}, 20);

debouncedEvent();
watch('./src', debouncedEvent);
