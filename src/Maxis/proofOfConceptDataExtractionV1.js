import fs from "fs";
import path from "path";
import { getDocument } from "../Utils/pdfSetup.js";

const outputFolder = "../uploads";
if (!fs.existsSync(outputFolder))
  fs.mkdirSync(outputFolder, { recursive: true });

// create output folder if missing
// if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder, { recursive: true });

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



// ============================================
// 🔍 Process a single PDF
// ============================================

async function extractFromPdf(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await getDocument({
    data,
    standardFontDataUrl: "../node_modules/pdfjs-dist/standard_fonts/",
  }).promise;
  console.log("Reading PDF data length:", data.length);
  const totalPages = pdf.numPages;
  // --- Extract text for detection flags ---
  let text = "";
  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text +=
      " " +
      content.items
        .map((i) => i.str)
        .join(" ")
        .toLowerCase();
  }
 // ===== DEFAULT =====
      let selectedBoxes = boxesPerPage;
      let conditionUsed = "Default (Normal)";
 

 
  // --- Extract text inside boxes ---
  const results = [];

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const page = await pdf.getPage(pageIndex + 1);
    const content = await page.getTextContent();
    const boxes = selectedBoxes[pageIndex] || [];

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
        let combinedText = hits.map((h) => h.text).join(" ");

        // Extract "(30 Hari)" or "(31 days)" etc.
        const hariMatch = combinedText.match(/\((\d+)\s*(?:Hari|Days?)\)/i);
        if (hariMatch) {
          // Option 1: Replace full text with just the number
          combinedText = hariMatch[1];

          // Option 2 (if you prefer to *append* a separate key later)
          // result["Bilangan Hari"] = hariMatch[1];
        }

        results.push({
          file: path.basename(pdfPath),
          page: pageIndex + 1,
          box: boxIndex + 1,
          text: combinedText,
          conditionUsed,
        });
      }
    });
  }

  // Normalize BOX_ prefix from results
  results.forEach((r) => {
    if (/^BOX_/.test(r.box)) {
      r.box = r.box.replace(/^BOX_/, "");
    }
  });

  // --- Base mapping for all conditions ---
  let boxNameMap = {
    "1_1": "ACCOUNT NO",
    "1_2": "CAJ SEMASA",
    "1_3": "STATEMENT DATE",
    "1_4": "TEMPOH BIL",
    "1_5": "TOTAL PAYABLE",
    "1_6": "BILL REFERENCE",
  };


  // --- Aggregate results into structured variable names ---
  const boxMap = {};
  selectedBoxes.forEach((boxesOnPage, pageIndex) => {
    boxesOnPage.forEach((b, boxIndex) => {
      const key = `${pageIndex + 1}_${boxIndex + 1}`;
      const variable = boxNameMap[key] || `BOX_${key}`;

      // 🔧 normalize lookup
      const match =
        results.find(
          (r) =>
            `${r.page}_${r.box}` === key ||
            `BOX_${r.page}_${r.box}` === `BOX_${key}`
        ) || {};

      boxMap[variable] = match.text ?? null;
    });
  });

  // --- Final JSON structure for this file ---
  const outputJson = {
    file: path.basename(pdfPath),
    conditionUsed,
    boxes: boxMap,
  };

  // --- Save one JSON per PDF ---
  const outputFile = path.join(
    outputFolder,
    path.basename(pdfPath).replace(/\.pdf$/i, "_output.json")
  );
  fs.writeFileSync(outputFile, JSON.stringify(outputJson, null, 2));

  console.log(`✅ Processed ${path.basename(pdfPath)} → ${conditionUsed}`);
  return outputJson;
}

// ============================================
// 🚀 Main Folder Runner
// ============================================

async function processAllPdfs(files) {
  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new Error("No files received in request.");
  }
  console.log("processed all pdf function called");

  const allResults = [];

  for (const file of files) {
    let { name, data } = file;
    if (!data) continue;

    // fallback name if none provided
    name = name || `upload_${Date.now()}.pdf`;

    const pdfPath = path.join(outputFolder, name);

    let buffer;
    if (Buffer.isBuffer(data)) {
      buffer = data; // already binary
    } else if (typeof data === "string") {
      buffer = Buffer.from(data, "base64"); // convert base64 to binary
    } else {
      throw new Error(
        "Invalid file data format — must be Buffer or base64 string."
      );
    }

    fs.writeFileSync(pdfPath, buffer);
    console.log("Saved PDF:", pdfPath, "Size:", fs.statSync(pdfPath).size);

    // Process this PDF safely
    console.log(files + " files before sending it in");
    try {
      const result = await extractFromPdf(pdfPath);
      console.log("files after sending it awaiting extract from pdf");
      allResults.push(result);
    } catch (err) {
      console.error("❌ extractFromPdf failed for", pdfPath, "=>", err);
      allResults.push({ file: name, error: err.message });
    }
  }

  // Optionally save summary for debugging
  console.log("before summary file");
  const summaryFile = path.join(outputFolder, "summary_all.json");
  fs.writeFileSync(summaryFile, JSON.stringify(allResults, null, 2));

  return { processed: allResults.length, results: allResults };
}

export default processAllPdfs;
