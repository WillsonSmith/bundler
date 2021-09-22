import { writeFile } from 'fs';
import Handlebars from 'handlebars';

function compileTemplate(file, string, destination) {
  const template = Handlebars.compile(string);
  const compiled = template(template);
  writeFile(destination, compiled, (err) => {});
  // return compiled;
}

export const transforms = [['_template.hbs', 'template.html', compileTemplate]];

// export const output = '';
