import { copyFile, readFile, watch, writeFile } from 'fs';
import { chdir } from 'process';
import debounce from 'lodash-es/debounce.js';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
