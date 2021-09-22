import { compileTemplate } from '../../_build/hbs.mjs';

export const transforms = [['_template.hbs', 'template.html', compileTemplate]];

// export const output = '';
