import { rollup } from 'rollup';

function useRollup(file, _, dest) {
  try {
    rollup({
      input: file,
    }).then((bundle) => {
      bundle.write({
        // format: 'esModule',
        format: 'es',
        input: file,
        output: { file: dest },
      });
    });
  } catch (error) {
    console.error(error);
  }
}

export const copies = [['index.js'], ['bundle.js', 'bundle.es.js', useRollup]];

export const dist = '../dist/scripts';
