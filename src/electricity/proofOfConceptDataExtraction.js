import fs from "fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

// PDF path
const inputPath = "Z:/System/01 Utility Bill/TNB/2508/TNB_2508_CYBERJ.pdf";
// const inputPath = "Z:/System/01 Utility Bill/TNB/2508/TNB_2508_TK4.pdf";
// const inputPath = "Z:/System/01 Utility Bill/TNB/2508/TNB_2508_SJ.pdf";

// Define multiple boxes per page
// (coordinates in PDF points; 0,0 is bottom-left)
const boxesPerPage = [
  [
    { xMin: 10,     xMax: 210,     yMin: 681.68, yMax: 751.68 },
    { xMin: 250,    xMax: 300,     yMin: 752.68, yMax: 782.68 },
    { xMin: 250,    xMax: 350,     yMin: 712.68, yMax: 747.68 },
    { xMin: 250,    xMax: 350,     yMin: 672.68, yMax: 707.68 },
    { xMin: 396.96, xMax: 496.96,  yMin: 752.68, yMax: 782.68 },
    { xMin: 349,    xMax: 439,     yMin: 480,    yMax: 525 },
    // { xMin: 515,    xMax: 545,     yMin: 211,    yMax: 221 },
    { xMin: 32,     xMax: 262,     yMin: 61,     yMax: 71 },
  ],
  [
    { xMin: 390, xMax: 435, yMin: 395, yMax: 405 },
    { xMin: 390, xMax: 435, yMin: 380, yMax: 390 },
    { xMin: 340, xMax: 430, yMin: 278, yMax: 293 },
  ],
//   [
//     { xMin: 100, xMax: 300, yMin: 400, yMax: 600 },
//   ]
];

async function extractTextInBoxes() {
  const data = new Uint8Array(fs.readFileSync(inputPath));
  const pdf = await getDocument({ data }).promise;
  const totalPages = pdf.numPages;

  console.log(`📄 PDF has ${totalPages} page(s).`);

  const results = [];

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const page = await pdf.getPage(pageIndex + 1);
    const content = await page.getTextContent();
    const boxes = boxesPerPage[pageIndex] || [];

    console.log(`\n🔍 Scanning Page ${pageIndex + 1} (${boxes.length} box(es))...`);

    boxes.forEach((box, boxIndex) => {
      const hits = [];

      for (const item of content.items) {
        const x = item.transform[4];
        const y = item.transform[5];
        const text = item.str.trim();

        if (
          x >= box.xMin &&
          x <= box.xMax &&
          y >= box.yMin &&
          y <= box.yMax
        ) {
          hits.push({ x, y, text });
        }
      }

      if (hits.length === 0) {
        console.log(`  ❌ Box ${boxIndex + 1}: No text found.`);
      } else {
        const combinedText = hits.map(h => h.text).join(" ");
        console.log(`  ✅ Box ${boxIndex + 1}: ${combinedText}`);

        results.push({
          page: pageIndex + 1,
          box: boxIndex + 1,
          text: combinedText,
        //   coords: box
        });
      }
    });
  }

  // Optional: save results to a JSON file
  fs.writeFileSync("C:/Users/PC/Desktop/PDFExtractorTesting/output.json",
    JSON.stringify(results, null, 2)
  );

  console.log("\n✅ Extraction complete. Results saved to output.json");
}

extractTextInBoxes().catch(console.error);
