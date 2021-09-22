import { writeFile } from 'fs';
import Handlebars from 'handlebars';

export function compileTemplate(file, string, destination) {
  const template = Handlebars.compile(string);
  const compiled = template(template);
  writeFile(destination, compiled, (err) => {});
}
