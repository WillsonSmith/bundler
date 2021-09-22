import { writeFile } from 'fs';
import Handlebars from 'handlebars';

function compileTemplate(file, string, destination) {
  // console.log(file);
  const template = Handlebars.compile(string);
  const compiled = template(template);
  console.log(destination);
  writeFile(destination, compiled, (err) => {});
  // return compiled;
}

export const transforms = [['_index.hbs', 'index.html', compileTemplate]];

// export const output = '';
