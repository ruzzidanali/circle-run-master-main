const fs = require('fs');
const data = JSON.parse(fs.readFileSync('structure.json', 'utf8'));

let fullText = '';
data.Pages.forEach(page => {
  page.Texts.forEach(t => {
    fullText += decodeURIComponent(t.R[0].T) + ' ';
  });
});

console.log(fullText);
