const PDFParser = require('pdf2json');
const fs = require('fs');

const parser = new PDFParser();
parser.on("pdfParser_dataReady", pdf => {
  fs.writeFileSync('structure.json', JSON.stringify(pdf, null, 2));
  console.log("Extracted structure saved to structure.json");
});
parser.loadPDF("Z:/System/01 Utility Bill/TNB/2508/TNB_2508_CYBERJ.pdf");
