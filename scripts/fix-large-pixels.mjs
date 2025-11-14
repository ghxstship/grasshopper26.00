#!/usr/bin/env node
import fs from 'fs';
import glob from 'glob';

const files = glob.sync('src/**/*.{css,module.css}', {
  cwd: process.cwd(),
  absolute: true,
  ignore: ['**/node_modules/**', '**/design-system/tokens/**'],
});

let fixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  const original = content;
  
  // Replace large pixel values with rem (order matters - largest first)
  content = content.replace(/1536px/g, '96rem');
  content = content.replace(/1400px/g, '87.5rem');
  content = content.replace(/1280px/g, '80rem');
  content = content.replace(/1200px/g, '75rem');
  content = content.replace(/1024px/g, '64rem');
  content = content.replace(/960px/g, '60rem');
  content = content.replace(/800px/g, '50rem');
  content = content.replace(/768px/g, '48rem');
  content = content.replace(/750px/g, '46.875rem');
  content = content.replace(/700px/g, '43.75rem');
  content = content.replace(/650px/g, '40.625rem');
  content = content.replace(/640px/g, '40rem');
  content = content.replace(/600px/g, '37.5rem');
  content = content.replace(/550px/g, '34.375rem');
  content = content.replace(/500px/g, '31.25rem');
  content = content.replace(/480px/g, '30rem');
  content = content.replace(/450px/g, '28.125rem');
  content = content.replace(/400px/g, '25rem');
  content = content.replace(/350px/g, '21.875rem');
  content = content.replace(/300px/g, '18.75rem');
  content = content.replace(/280px/g, '17.5rem');
  content = content.replace(/220px/g, '13.75rem');
  content = content.replace(/200px/g, '12.5rem');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`✅ ${file}`);
    fixed++;
  }
});

console.log(`\n🎉 Fixed ${fixed} files`);
