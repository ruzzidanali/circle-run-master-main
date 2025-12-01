import fs from "fs";
import path from "path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

// Folder path — update to your desired folder
const folderPath = "Z://System//01 Utility Bill//05 Sewerage//2507//";

// Define multiple boxes per page (same as before)
const boxesPerPage = [
  [
    { xMin: 385, xMax: 485, yMin: 810, yMax: 820 },
    { xMin: 385, xMax: 485, yMin: 800, yMax: 810 },
    { xMin: 460, xMax: 530, yMin: 783, yMax: 793 },
    { xMin: 365, xMax: 410, yMin: 410, yMax: 420 },
    { xMin: 370, xMax: 415, yMin: 455, yMax: 475 },
    { xMin: 45, xMax: 125, yMin: 542, yMax: 569 },
    { xMin: 160, xMax: 210, yMin: 210, yMax: 232 },
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

        // 🧹 Skip header or label texts that should not be extracted
        if (
          /Jumlah\s*\(RM\/?Sen\)?/i.test(text) ||   // "Jumlah (RM/Sen)" or similar
          /Julai\s*2025/i.test(text) ||             // "Julai 2025"
          /Baki\s*Terdahulu/i.test(text)            // "Baki Terdahulu"
        ) continue;

        // ✅ Only include text within box boundaries
        if (x >= box.xMin && x <= box.xMax && y >= box.yMin && y <= box.yMax) {
          hits.push({ x, y, text });
        }
      }

      if (hits.length > 0) {
        let combinedText = hits.map(h => h.text).join(" ").trim();
        let extractedValue = combinedText; // default

        // 🎯 Try to extract the value after known prefixes
        const match = combinedText.match(
          /\b(?:Bill\s*No|Bill\s*Date|Account\s*No)[:\s-]*([\w\/.,()-]+(?:\s[\w\/.,()-]+)*)/i
        );

        if (match) {
          extractedValue = match[1].trim();
        }

        // 🧹 Remove known unwanted labels like "Jumlah (RM/Sen)"
        extractedValue = extractedValue.replace(/\bJumlah\s*\(RM\/?Sen\)?/gi, "").trim();

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