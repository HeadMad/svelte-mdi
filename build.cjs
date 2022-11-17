/*
  SOME CONSIDERATIONS

  All svg files have ONE svg element
  All svg elements have the same attrs (xmlns, xlink, version, id, width, height viewBox)
  All svg viewBox's are "0 0 24 24"
  All svg files have ONE path element
  All path elements have only the d attr;
*/


const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const allowedAttrs = ["width", "height", "viewBox"];
const template = fs.readFileSync(path.join(__dirname, "svelte.templ"), "utf8");

const relativeSrcDir = "./node_modules/@mdi/svg/svg";
const srcDir = path.join(__dirname, relativeSrcDir);
const relativeDestDir = "./svg";
const destDir = path.join(__dirname, relativeDestDir);


const generateComponentSource = (file) => {
  const $ = cheerio.load(file);
  const $svg = $("svg");
  
  let attrs = $svg.attr();
  for(const attr in attrs){
    // remove unused attrs
    if(!allowedAttrs.includes(attr)){
      $svg.removeAttr(attr);
    }
  }

  // Add attrs
  $svg.attr("width", "{width}");
  $svg.attr("height", "{height}");
  $svg.attr("viewBox", "{viewBox}");

  const $path = $svg.find("> path");
  
  // add fill attr
  $path.attr("fill", "{color}");

  return template.replace("%svg%", $.html($svg));
}

let reExports = '';

const filenames = fs.readdirSync(srcDir);
console.log("Generating " + filenames.length + " components");

for(let i = 0; i < filenames.length; i++){
  if (i > 10)
    break;
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write("Component" + ("" + (i + 1)).padStart(5, " ") + " / " + filenames.length);

  const filename = filenames[i];
  const file = fs.readFileSync(path.join(srcDir, filename), "utf8");

  
  const componentName = filename.replace('.svg', '') .replace(/\b(\w)/g, (_, p) => p.toUpperCase()).replaceAll('-', '');
  const componentFileName = filename.replace('.svg', '.svelte');
  const componentSource = generateComponentSource(file);

  fs.writeFileSync(
    path.join(destDir, componentFileName),
    componentSource
  );

  reExports += `export {default as ${componentName}} from '${relativeDestDir}/${componentFileName}';`
}

fs.writeFileSync(
  path.join(__dirname, 'index.js'),
  reExports
);

// process.stdout.write("\n");

// copy readme
// console.log("Copying README.md to npm package");

// // npm does not support ```svelte so change it to ```html
// const readmeSrc = fs.readFileSync(__dirname + "/README.md", "utf8");
// const readme = readmeSrc.replace(/\`\`\`svelte/g, "```html");

// fs.writeFileSync(path.join(destDir, "README.md"), readme);
  
console.log("Bye!");