import fs from "fs";
import path from "path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

// Folder path — update to your desired folder
const folderPath = "Z://System//01 Utility Bill//06 TM//2508//";

// Define multiple boxes per page (same as before)
const boxesPerPage = [
  [
  { xMin: 410, xMax: 573, yMin: 639, yMax: 654 },
  { xMin: 410, xMax: 590, yMin: 657, yMax: 673 },
  { xMin: 475, xMax: 575, yMin: 280, yMax: 315 },
  { xMin: 475, xMax: 575, yMin: 365, yMax: 387 },
  { xMin: 475, xMax: 575, yMin: 390, yMax: 412 },
  { xMin: 430, xMax: 560, yMin: 617, yMax: 636 },
  { xMin: 475, xMax: 575, yMin: 420, yMax: 442 },
],
[
  { xMin: 180, xMax: 335, yMin: 315, yMax: 335 },
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
        let combinedText = hits.map(h => h.text).join(" ").trim();
        let extractedValue = combinedText; // default if no match

        // 🎯 Extract only the value after Bill No, Bill Date, or Account No
        const match = combinedText.match(
          /\b(?:Bill\s*No|Bill\s*Date|Account\s*No)[:\s-]*([\w\/.,-]+(?:\s[\w\/.,-]+)*)/i
        );

        if (match) {
          extractedValue = match[1].trim();
        }

        console.log(`  ✅ Box ${boxIndex + 1}: ${extractedValue}`);

        results.push({
          file: path.basename(filePath),
          page: pageIndex + 1,
          box: boxIndex + 1,
          text: extractedValue,
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