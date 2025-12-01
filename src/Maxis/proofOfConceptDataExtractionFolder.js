import fs from "fs";
import path from "path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

// Folder path — update to your desired folder
const folderPath = "Z://System//01 Utility Bill//07 Maxis//2508//";

// Define multiple boxes per page (same as before)
const boxesPerPage = [
     [
  { xMin: 50,  xMax: 150, yMin: 652, yMax: 664 },
  { xMin: 480, xMax: 550, yMin: 535, yMax: 552 },
  { xMin: 230, xMax: 370, yMin: 687, yMax: 697 },
  { xMin: 230, xMax: 370, yMin: 665, yMax: 675 },
  { xMin: 480, xMax: 550, yMin: 592, yMax: 604 },
  { xMin: 230, xMax: 370, yMin: 642, yMax: 652 },
],
];

// Function to extract text from one PDF file
async function extractTextFromPdf(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await getDocument({ data }).promise;
  const totalPages = pdf.numPages;

  console.log(`\n📄 Reading ${path.basename(filePath)} — ${totalPages} page(s).`);
  const results = [];

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const page = await pdf.getPage(pageIndex + 1);
    const content = await page.getTextContent();
    const boxes = boxesPerPage[pageIndex] || [];

    console.log(`🔍 Page ${pageIndex + 1} (${boxes.length} boxes)`);

    boxes.forEach((box, boxIndex) => {
      const hits = [];

      for (const item of content.items) {
        const x = item.transform[4];
        const y = item.transform[5];
        const text = item.str.trim();

        if (x >= box.xMin && x <= box.xMax && y >= box.yMin && y <= box.yMax) {
          hits.push({ x, y, text });
        }
      }

      if (hits.length > 0) {
  // Adaptive sort: X-only for small boxes, Y+X for tall boxes
  const boxHeight = box.yMax - box.yMin;

  if (boxHeight < 17) {
    // Single-line area → sort left to right
    hits.sort((a, b) => a.x - b.x);
  } else {
    // Multi-line area → sort top to bottom, then left to right
    hits.sort((a, b) => {
      if (Math.abs(a.y - b.y) < 5) return a.x - b.x;
      return b.y - a.y;
    });
  }

  const combinedText = hits.map(h => h.text).join(" ").replace(/\s+/g, " ").trim();
        console.log(`  ✅ Box ${boxIndex + 1}: ${combinedText}`);

        results.push({
          file: path.basename(filePath),
          page: pageIndex + 1,
          box: boxIndex + 1,
          text: combinedText,
        });
      } else {
        console.log(`  ❌ Box ${boxIndex + 1}: No text found.`);
      }
    });
  }

  return results;
}

// Main function to process all PDFs in the folder
async function processAllPdfs() {
  const allResults = [];
  const pdfFiles = fs.readdirSync(folderPath)
    .filter(file => file.toLowerCase().endsWith(".pdf"));

  if (pdfFiles.length === 0) {
    console.log("⚠️ No PDF files found in folder.");
    return;
  }

  console.log(`\n📂 Found ${pdfFiles.length} PDF(s) in folder.`);

  for (const file of pdfFiles) {
    const filePath = path.join(folderPath, file);
    try {
      const results = await extractTextFromPdf(filePath);
      allResults.push(...results);
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err);
    }
  }

  // Save combined results
  const outputPath = "C:/Users/PC/Desktop/PDFExtractorTesting/output.json";
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
  console.log(`\n✅ All extractions complete. Results saved to ${outputPath}`);
}

processAllPdfs().catch(console.error);