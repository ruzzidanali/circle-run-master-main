import fs from "fs";
import path from "path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const outputFolder = "../uploads";
if (!fs.existsSync(outputFolder))
  fs.mkdirSync(outputFolder, { recursive: true });

// create output folder if missing
// if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder, { recursive: true });

const boxes_AFA_AK = [
  [
    { xMin: 250, xMax: 300, yMin: 752.68, yMax: 762.68 },
    { xMin: 250, xMax: 350, yMin: 722.68, yMax: 732.68 },
    { xMin: 250, xMax: 350, yMin: 712.68, yMax: 722.68 },
    { xMin: 250, xMax: 350, yMin: 676.68, yMax: 686.68 },
    { xMin: 396.96, xMax: 496.96, yMin: 752.68, yMax: 762.68 },
    { xMin: 208, xMax: 308, yMin: 480, yMax: 500 },
    { xMin: 349, xMax: 439, yMin: 480, yMax: 500 },
    { xMin: 242, xMax: 262, yMin: 61, yMax: 71 },
  ],
  [
    { xMin: 385, xMax: 430, yMin: 420, yMax: 430 },
    // { xMin: 390, xMax: 435, yMin: 380, yMax: 390 }, // commented line kept same as original
    { xMin: 340, xMax: 380, yMin: 315, yMax: 330 },
  ],
];

const boxes_AFA_AK_DUAL = [
  [
    { xMin: 250, xMax: 300, yMin: 752.68, yMax: 762.68 },
    { xMin: 250, xMax: 350, yMin: 722.68, yMax: 732.68 },
    { xMin: 250, xMax: 350, yMin: 712.68, yMax: 722.68 },
    { xMin: 250, xMax: 350, yMin: 676.68, yMax: 686.68 },
    { xMin: 396.96, xMax: 496.96, yMin: 752.68, yMax: 762.68 },
    { xMin: 208, xMax: 308, yMin: 480, yMax: 500 },
    { xMin: 349, xMax: 439, yMin: 480, yMax: 500 },
    { xMin: 242, xMax: 262, yMin: 61, yMax: 71 },
  ],
  [
    { xMin: 385, xMax: 430, yMin: 405, yMax: 415 },
    // { xMin: 390, xMax: 435, yMin: 380, yMax: 390 }, // commented line kept same as original
    { xMin: 340, xMax: 380, yMin: 300, yMax: 315 },
  ],
];

const boxes_Insentif_ST_AFA_KWTBB = [
  [
    { xMin: 250, xMax: 300, yMin: 754.68, yMax: 764.68 },
    { xMin: 250, xMax: 350, yMin: 724.68, yMax: 734.68 },
    { xMin: 250, xMax: 350, yMin: 714.68, yMax: 724.68 },
    { xMin: 250, xMax: 350, yMin: 678.68, yMax: 688.68 },
    { xMin: 396.96, xMax: 496.96, yMin: 754.68, yMax: 764.68 },
    { xMin: 208, xMax: 308, yMin: 480, yMax: 500 },
    { xMin: 349, xMax: 439, yMin: 480, yMax: 500 },
  ],
  [
    { xMin: 385, xMax: 430, yMin: 382, yMax: 394 },
    { xMin: 385, xMax: 430, yMin: 365, yMax: 377 },
    { xMin: 385, xMax: 430, yMin: 350, yMax: 362 },
    { xMin: 340, xMax: 380, yMin: 247, yMax: 262 },
  ],
];

const boxes_AK_KWTBB = [
  [
    { xMin: 10, xMax: 210, yMin: 685.8, yMax: 765.8 },
    { xMin: 250, xMax: 300, yMin: 752.68, yMax: 782.68 },
    { xMin: 250, xMax: 350, yMin: 712.68, yMax: 747.68 },
    { xMin: 250, xMax: 350, yMin: 672.68, yMax: 707.68 },
    { xMin: 396.96, xMax: 496.96, yMin: 752.68, yMax: 782.68 },
    { xMin: 208, xMax: 308, yMin: 480, yMax: 525 },
    { xMin: 349, xMax: 439, yMin: 480, yMax: 525 },
    { xMin: 32, xMax: 262, yMin: 61, yMax: 71 },
  ],
  [
    { xMin: 385, xMax: 430, yMin: 396, yMax: 406 },
    { xMin: 390, xMax: 435, yMin: 380, yMax: 390 },
    { xMin: 340, xMax: 430, yMin: 278, yMax: 293 },
  ],
];

const boxes_Normal = [
  [
    { xMin: 10, xMax: 210, yMin: 685.8, yMax: 765.8 },
    { xMin: 250, xMax: 300, yMin: 752.68, yMax: 782.68 },
    { xMin: 250, xMax: 350, yMin: 712.68, yMax: 747.68 },
    { xMin: 250, xMax: 350, yMin: 672.68, yMax: 707.68 },
    { xMin: 396.96, xMax: 496.96, yMin: 752.68, yMax: 782.68 },
    { xMin: 208, xMax: 308, yMin: 480, yMax: 525 },
    { xMin: 349, xMax: 439, yMin: 480, yMax: 525 },
    { xMin: 32, xMax: 262, yMin: 61, yMax: 71 },
  ],
  [
    { xMin: 385, xMax: 430, yMin: 396, yMax: 406 },
    { xMin: 390, xMax: 435, yMin: 380, yMax: 390 },
    { xMin: 340, xMax: 430, yMin: 278, yMax: 293 },
  ],
];

const boxes_AFA_AK_KWTBB = [
  [
    { xMin: 250, xMax: 300, yMin: 752.68, yMax: 763.68 },
    { xMin: 250, xMax: 350, yMin: 722.68, yMax: 733.68 },
    { xMin: 250, xMax: 350, yMin: 712.68, yMax: 723.68 },
    { xMin: 250, xMax: 350, yMin: 676.68, yMax: 694.68 },
    { xMin: 396.96, xMax: 496.96, yMin: 752.68, yMax: 767.68 },
    { xMin: 208, xMax: 308, yMin: 480, yMax: 500 },
    { xMin: 349, xMax: 439, yMin: 480, yMax: 500 },
    { xMin: 242, xMax: 262, yMin: 61, yMax: 71 },
  ],
  [
    { xMin: 385, xMax: 430, yMin: 396, yMax: 406 },
    { xMin: 385, xMax: 430, yMin: 380, yMax: 390 },
    { xMin: 340, xMax: 380, yMin: 278, yMax: 293 },
  ],
];

const boxes_AFA_AK_KWTBB_English = [
  [
    { xMin: 250, xMax: 300, yMin: 752.68, yMax: 762.68 },
    { xMin: 250, xMax: 350, yMin: 722.68, yMax: 732.68 },
    { xMin: 250, xMax: 350, yMin: 712.68, yMax: 722.68 },
    { xMin: 250, xMax: 350, yMin: 676.68, yMax: 686.68 },
    { xMin: 396.96, xMax: 496.96, yMin: 752.68, yMax: 762.68 },
    { xMin: 208, xMax: 308, yMin: 480, yMax: 500 },
    { xMin: 349, xMax: 439, yMin: 480, yMax: 500 },
    { xMin: 242, xMax: 262, yMin: 61, yMax: 71 },
  ],
  [
    { xMin: 385, xMax: 430, yMin: 390, yMax: 400 },
    { xMin: 385, xMax: 430, yMin: 375, yMax: 385 },
    { xMin: 340, xMax: 380, yMin: 270, yMax: 285 },
  ],
];

const boxes_Cagaran_ST_Insentif = [
  [
    { xMin: 250, xMax: 300, yMin: 754.68, yMax: 764.68 },
    { xMin: 250, xMax: 350, yMin: 724.68, yMax: 734.68 },
    { xMin: 250, xMax: 350, yMin: 714.68, yMax: 724.68 },
    { xMin: 250, xMax: 350, yMin: 678.68, yMax: 688.68 },
    { xMin: 396.96, xMax: 496.96, yMin: 754.68, yMax: 764.68 },
    { xMin: 208, xMax: 308, yMin: 482, yMax: 502 },
    { xMin: 349, xMax: 439, yMin: 482, yMax: 502 },
  ],
  [
    { xMin: 384, xMax: 429, yMin: 405, yMax: 415 },
    { xMin: 384, xMax: 429, yMin: 390, yMax: 400 },
    { xMin: 384, xMax: 429, yMin: 375, yMax: 385 },
    { xMin: 340, xMax: 380, yMin: 270, yMax: 285 },
  ],
];

const boxes_Cagaran_KWTBB_AK = [
  [
    { xMin: 250, xMax: 300, yMin: 754.68, yMax: 764.68 },
    { xMin: 250, xMax: 350, yMin: 724.68, yMax: 734.68 },
    { xMin: 250, xMax: 350, yMin: 714.68, yMax: 724.68 },
    { xMin: 250, xMax: 350, yMin: 678.68, yMax: 688.68 },
    { xMin: 396.96, xMax: 496.96, yMin: 754.68, yMax: 764.68 },
    { xMin: 208, xMax: 308, yMin: 482, yMax: 502 },
    { xMin: 349, xMax: 439, yMin: 482, yMax: 502 },
    { xMin: 242, xMax: 262, yMin: 64, yMax: 74 },
  ],
  [
    { xMin: 384, xMax: 429, yMin: 422, yMax: 432 },
    { xMin: 384, xMax: 429, yMin: 407, yMax: 417 },
    { xMin: 340, xMax: 380, yMin: 285, yMax: 300 },
  ],
];

const boxes_Cagaran_AK = [
  [
    { xMin: 250, xMax: 300, yMin: 754.68, yMax: 764.68 },
    { xMin: 250, xMax: 350, yMin: 724.68, yMax: 734.68 },
    { xMin: 250, xMax: 350, yMin: 714.68, yMax: 724.68 },
    { xMin: 250, xMax: 350, yMin: 678.68, yMax: 688.68 },
    { xMin: 396.96, xMax: 496.96, yMin: 754.68, yMax: 764.68 },
    { xMin: 208, xMax: 308, yMin: 482, yMax: 502 },
    { xMin: 349, xMax: 439, yMin: 482, yMax: 502 },
    { xMin: 242, xMax: 262, yMin: 64, yMax: 74 },
  ],
  [
    { xMin: 384, xMax: 429, yMin: 422, yMax: 432 },
    // { xMin: 384, xMax: 429, yMin: 407, yMax: 417 },
    // { xMin: 384, xMax: 429, yMin: 380, yMax: 390 },
    { xMin: 340, xMax: 380, yMin: 300, yMax: 315 },
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

  text = text
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .replace(/[\u00A0\u1680\u180E\u2000-\u200D\u202F\u205F\u3000]/g, "")
    .replace(
      /sur[\s\u00A0\u2000-\u3000-]*caj[\s\u00A0\u2000-\u3000-]*angkadar[\s\u00A0\u2000-\u3000-]*kuasa/gi,
      "surcajangkadarkuasa"
    )
    .replace(
      /surcharge[\s\u00A0\u2000-\u3000-]*power[\s\u00A0\u2000-\u3000-]*factor/gi,
      "surcajangkadarkuasa"
    )
    .replace(/angkadar[\s\u00A0\u2000-\u3000-]*kuasa/gi, "angkadarkuasa")
    .replace(/power[\s\u00A0\u2000-\u3000-]*factor/gi, "powerfactor")
    .replace(/service[\s\u00A0\u2000-\u3000-]*tax/gi, "servicetax")
    .replace(
      /efficient[\s\u00A0\u2000-\u3000-]*energy[\s\u00A0\u2000-\u3000-]*incentive/gi,
      "insentifcekaptenaga"
    )
    .replace(/diliputi[\s\u00A0\u2000-\u3000-]*cagaran/gi, "diliputicagaran")
    .replace(
      /(kumpulan[\s\u00A0\u2000-\u3000-]*wang[\s\u00A0\u2000-\u3000-]*tenaga[\s\u00A0\u2000-\u3000-]*boleh[\s\u00A0\u2000-\u3000-]*baharu|kwtbb|re[\s\u00A0\u2000-\u3000-]*fund|renewable[\s\u00A0\u2000-\u3000-]*energy[\s\u00A0\u2000-\u3000-]*fund)/gi,
      "kwtbb"
    );

  // 🧠 Detection Flags
  const hasAngkadar = /\bangkadarkuasa\b/.test(text);
  const hasPowerFactor = /\bpowerfactor\b/.test(text);
  const hasSurcaj = /\bsurcajangkadarkuasa\b/.test(text);
  const hasServiceTax = /\bservicetax\b/.test(text);
  const hasKWTBB = /\bkwtbb\b/.test(text);
  const afaMatches = [
    ...text.matchAll(/a[\s\u00A0\u2000-\u3000-]*f[\s\u00A0\u2000-\u3000-]*a/gi),
  ];
  const hasMultipleAFA = afaMatches.length > 2;
  const hasAFA =
    afaMatches.length > 0 &&
    /a[\s\u00A0\u2000-\u3000-]*f[\s\u00A0\u2000-\u3000-]*a[\s\S]{0,40}(mulai|from)/gi.test(
      text
    );
  const hasInsentif =
    /\binsentif[\s\S]{0,10}cekap[\s\S]{0,10}tenaga\b/.test(text) ||
    /\befficient[\s\S]{0,10}energy[\s\S]{0,10}incentive\b/.test(text);
  const hasCagaran = /\bdiliputicagaran\b/.test(text);

  // --- Select boxes based on flags ---
  let selectedBoxes = [];
  let conditionUsed = "";

  switch (true) {
    // ===== 4-FLAG COMBINATIONS =====
    case hasAFA && hasInsentif && hasServiceTax && hasKWTBB:
      selectedBoxes = boxes_Insentif_ST_AFA_KWTBB;
      conditionUsed = "AFA + Service Tax + Insentif + KWTBB";
      break;

    // ===== 3-FLAG COMBINATIONS =====
    case hasInsentif && hasCagaran && hasServiceTax:
      selectedBoxes = boxes_Cagaran_ST_Insentif;
      conditionUsed = "Insentif + Service Tax + Cagaran";
      break;

    case hasAFA && hasAngkadar && hasKWTBB:
      selectedBoxes = boxes_AFA_AK_KWTBB;
      conditionUsed = "AFA + Angkadar Kuasa + KWTBB";
      break;

    case hasAFA && hasPowerFactor && hasKWTBB:
      selectedBoxes = boxes_AFA_AK_KWTBB_English;
      conditionUsed = "AFA + Angkadar Kuasa + KWTBB";
      break;

    case hasCagaran && hasKWTBB && hasAngkadar:
      selectedBoxes = boxes_Cagaran_KWTBB_AK;
      conditionUsed = "Cagaran + KWTBB + Angkadar Kuasa";
      break;

    // ===== 2-FLAG COMBINATIONS =====
    case hasAFA && hasAngkadar:
      if (hasMultipleAFA) {
        selectedBoxes = boxes_AFA_AK_DUAL;
        conditionUsed = "AFA + Angkadar Kuasa (Dual AFA)";
      } else {
        selectedBoxes = boxes_AFA_AK;
        conditionUsed = "AFA + Angkadar Kuasa";
      }
      break;

    case hasCagaran && hasAngkadar:
      selectedBoxes = boxes_Cagaran_AK;
      conditionUsed = "Cagaran + Angkadar Kuasa";
      break;

    case hasAngkadar && hasKWTBB:
      selectedBoxes = boxes_AK_KWTBB;
      conditionUsed = "Angkadar Kuasa + KWTBB";
      break;

    // ===== SINGLE-FLAG COMBINATIONS =====

    // ===== DEFAULT =====
    default:
      selectedBoxes = boxes_Normal;
      conditionUsed = "Default (Normal)";
      break;
  }
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
    "1_1": "TARIKH BIL",
    "1_2": "TEMPOH BIL",
    "1_3": "BILANGAN HARI",
    "1_4": "NO INVOIS",
    "1_5": "NO AKAUN",
    "1_6": "BAKI TERDAHULU",
    "1_7": "CAJ SEMASA",
    "1_8": "ANGKADAR KUASA",
    "2_1": "KWHR",
    "2_2": "KWTBB",
    "2_3": "PENGGUNAAN",
  };

  // --- Apply special mapping for specific condition ---
  if (conditionUsed === "Insentif + Service Tax + Cagaran") {
    boxNameMap = {
      ...boxNameMap, // keep all existing mappings
      "2_1": "KWHR",
      "2_2": "SERVICE TAX",
      "2_3": "CAGARAN",
      "2_4": "PENGGUNAAN",
    };
  }

    if (conditionUsed === "AFA + Service Tax + Insentif + KWTBB") {
    boxNameMap = {
      ...boxNameMap, // keep all existing mappings
      "2_1": "KWHR",
      "2_2": "SERVICE TAX",
      "2_3": "KWTBB",
      "2_4": "PENGGUNAAN",
    };
  }

  if (
    conditionUsed === "AFA + Angkadar Kuasa" ||
    conditionUsed === "AFA + Angkadar Kuasa (Dual AFA)"
  ) {
    boxNameMap = {
      ...boxNameMap, // keep all existing mappings
      "2_1": "KWHR",
      "2_2": "PENGGUNAAN",
    };
  }

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
