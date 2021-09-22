import { rollup } from 'rollup';

async function useRollup(file, _, dest) {
  console.log(file, dest);
  try {
    const bundle = await rollup({
      input: file,
    });

    bundle.write({
      format: 'es',
      input: file,
      output: { file: dest },
    });
  } catch (error) {
    console.error(error);
  }
}

export const transforms = [
  ['index.js'],
  ['bundle.js', 'bundle.es.js', useRollup],
];

// export const output = 'dist/scripts';
