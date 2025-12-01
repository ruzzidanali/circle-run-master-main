import fs from "fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

// PDF path
const inputPath = "Z://System//01 Utility Bill//06 TM/2508//TM_2508_PUJ.pdf";
// const inputPath = "Z:/System/01 Utility Bill/TNB/2508/TNB_2508_TK4.pdf";
// const inputPath = "Z:/System/01 Utility Bill/TNB/2508/TNB_2508_SJ.pdf";

// Define multiple boxes per page
// (coordinates in PDF points; 0,0 is bottom-left)
const boxesPerPage = [
  [
      { xMin: 400, xMax: 570, yMin: 657, yMax: 674 },
      { xMin: 405, xMax: 575, yMin: 638, yMax: 655 },
      { xMin: 30,  xMax: 560, yMin: 280, yMax: 315 },
      {  xMin: 30,  xMax: 560, yMin: 365, yMax: 387 },
      { xMin: 30,  xMax: 560, yMin: 390, yMax: 412 },
      { xMin: 430, xMax: 580, yMin: 620, yMax: 637 },
      { xMin: 30,  xMax: 560, yMin: 420, yMax: 442 },
  ],
  [
    { xMin: 180, xMax: 335, yMin: 315, yMax: 353 },
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
