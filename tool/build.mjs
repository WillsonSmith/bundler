import { copyFile, readFile, watch, writeFile } from 'fs';
import { chdir } from 'process';
import debounce from 'lodash-es/debounce.js';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const debouncedEvent = debounce((eventType, filename) => {
  import('../src/_config.js').then(({ dist = '../dist', copies }) => {
    chdir(`${__dirname}/../src`);
    for (const copy of copies) {
      const [src, dest = src, transpiler] = copy;

      if (!filename || filename === src) {
        if (transpiler) {
          readFile(src, (err, data) => {
            transpiler(src, data.toString('utf8'), `${dist}/${dest}`);
          });
        } else {
          copyFile(src, `${dist}/${dest}`, (error) => {
            if (error) throw error;
          });
        }
      }
    }
  });
}, 20);

debouncedEvent();
watch('./src', debouncedEvent);
