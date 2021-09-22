import { compileTemplate } from '../_build/hbs.mjs';

export const transforms = [['_index.hbs', 'index.html', compileTemplate]];

// export const output = '';
