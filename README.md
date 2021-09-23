# Tiny build script

A tiny util for building apps and libraries from configs


## `_config.js`


### `_config.js` example

```js
import { rollup } from 'rollup';

/** 
 * [
 *   source file name (required),
 *   destination file name (optional),
 *   transpiler (optional),
 * ]
 */ 
export const transforms = [
  // This will copy `index.js` to `dist/index.js`
  ['index.js'],
  // This will transpile bundle.js to bundle.es.js using the useRollup transpiler
  ['bundle.js', 'bundle.es.js', useRollup],
];

/**
 * (optional) the directory where file saves
 */
export const output = 'dist';

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
```