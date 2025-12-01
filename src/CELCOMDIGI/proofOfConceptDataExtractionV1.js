import fs from "fs";
import path from "path";
// import { getDocument } from "../Utils/pdfSetup.js";
import { getDocument } from "../../node_modules/pdfjs-dist/legacy/build/pdf.mjs";
import { diff } from "util";

const outputFolder = "../uploads";
if (!fs.existsSync(outputFolder))
  fs.mkdirSync(outputFolder, { recursive: true });

// create output folder if missing
// if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder, { recursive: true });

const boxesPerPage = [
  [
    { xMin: 450, xMax: 600, yMin: 628, yMax: 635 }, // No. Akaun
    { xMin: 420, xMax: 580, yMin: 618, yMax: 625 }, // No. Bil
    { xMin: 470, xMax: 610, yMin: 607, yMax: 612 }, // Tarikh
    { xMin: 410, xMax: 580, yMin: 597, yMax: 603 }, // Tempoh Bil dan Bilangan Hari
    { xMin: 510, xMax: 580, yMin: 575, yMax: 580 }, // Deposit
    { xMin: 565, xMax: 585, yMin: 198, yMax: 200 }, // Total Current Charges (79.50)
    { xMin: 565, xMax: 585, yMin: 217, yMax: 218 }, // Service Tax (4.50)
    { xMin: 565, xMax: 585, yMin: 238, yMax: 239 }, // Discount (-54.00)
    { xMin: 565, xMax: 585, yMin: 335, yMax: 336 }, // Monthly Fee (129.00)
    { xMin: 65, xMax: 110, yMin: 373, yMax: 375 }, // Tunggakan
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

    const viewport = page.getViewport({ scale: 1.0 });
    const pageHeight = viewport.height;

    boxes.forEach((box, boxIndex) => {
      const hits = [];

      const toleranceY = 3;
      const toleranceX = 150;

      for (const item of content.items) {
        const x = item.transform[4];
        const y = item.transform[5];
        const text = item.str.trim();
        // if (text) console.log(`Page ${pageIndex + 1}: (${x}, ${y}) => ${text}`);
        if (!text) continue;

        if (
          y >= box.yMin - toleranceY &&
          y <= box.yMax + toleranceY &&
          x >= box.xMin - 50 &&
          x <= box.xMax + toleranceX
        ) {
          hits.push({ x, y, text });
        }
      }

      if (hits.length > 0) {
        hits.sort((a, b) => a.x - b.x);
        let combinedText = hits
          .map((h) => h.text)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        // Extract "(30 Hari)" or "(31 days)" etc.
        const hariMatch = combinedText.match(/\((\d+)\s*(?:Hari|Days?)\)/i);
        if (hariMatch) {
          combinedText = hariMatch[1];
        }

        // 🧹 Clean labels and RM prefix
        combinedText = combinedText
          .replace(/^[A-Za-z\s:]+:?/i, "") // remove label like "Account Number :"
          .replace(/^RM\s*/i, "") // remove RM prefix
          .trim();

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
    "1_2": "BILL NO",
    "1_3": "BILL DATE",
    "1_4": "TEMPOH BILL",
    "1_5": "DEPOSIT",
    "1_6": "CAJ SEMASA",
    "1_7": "SERVICE TAX",
    "1_8": "DISCOUNT REBATE",
    "1_9": "MONTHLY FEE",
    "1_10": "TUNGGAKAN",
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

  // 1️⃣ Format "BILL DATE" and any other date fields
  // 2️⃣ Calculate total days (Bilangan Hari) from "TEMPOH BILL"
  if (boxMap["TEMPOH BILL"]) {
    const tempoh = boxMap["TEMPOH BILL"].trim();
    const match = tempoh.match(
      /(\d{2}[\/-]\d{2}[\/-]\d{4})\s*-\s*(\d{2}[\/-]\d{2}[\/-]\d{4})/
    );
    if (match) {
      const [_, startStr, endStr] = match;
      const [d1, m1, y1] = startStr.split(/[\/-]/).map(Number);
      const [d2, m2, y2] = endStr.split(/[\/-]/).map(Number);
      const diffMs = new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1);
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      boxMap["BILANGAN HARI"] = diffDays.toString();
    }
  }

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
