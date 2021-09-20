import { rollup } from 'rollup';

function useRollup(file, _, dest) {
  try {
    rollup({
      input: file,
    }).then((bundle) => {
      bundle.write({
        format: 'es',
        input: file,
        output: { file: dest },
      });
    });
  } catch (error) {
    console.error(error);
  }
}

export const transforms = [
  ['index.js'],
  ['bundle.js', 'bundle.es.js', useRollup],
];

export const output = '../dist/scripts';
