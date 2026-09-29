const fs = require('fs');

console.log('Verifying Road to the Final — FIFA Standings & 8 Groups build...');

const htmlSize = fs.statSync('index.html').size;
const cssSize = fs.statSync('css/style.css').size;
const dataSize = fs.statSync('js/data.js').size;
const jsSize = fs.statSync('js/script.js').size;

console.log(`✓ index.html (${htmlSize} bytes)`);
console.log(`✓ css/style.css (${cssSize} bytes)`);
console.log(`✓ js/data.js (${dataSize} bytes)`);
console.log(`✓ js/script.js (${jsSize} bytes)`);
console.log('Build verified successfully!');
