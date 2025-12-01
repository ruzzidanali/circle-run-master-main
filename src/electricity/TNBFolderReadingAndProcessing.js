import fs from "fs";
import path from "path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

// === CONFIG ===
const inputFolder = "C:/Users/PC/Desktop/2508";
const outputJsonPath =
  "C:/Users/PC/Desktop/PDFExtractorTesting/TNB_2508_output.json";

async function extractTextFromPdf(pdfPath) {
  try {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const pdfjsDoc = await getDocument({ data }).promise;

    let text = "";
    for (let i = 1; i <= pdfjsDoc.numPages; i++) {
      const page = await pdfjsDoc.getPage(i);
      const content = await page.getTextContent();
      text +=
        " " +
        content.items
          .map((i) => i.str)
          .join(" ")
          .toLowerCase();
    }

    // === CLEAN + NORMALIZE ===
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
        /(k[\s\u00A0\u2000-\u3000-]*w[\s\u00A0\u2000-\u3000-]*t[\s\u00A0\u2000-\u3000-]*b[\s\u00A0\u2000-\u3000-]*b|kumpulan[\s\u00A0\u2000-\u3000-]*wang[\s\u00A0\u2000-\u3000-]*tenaga[\s\u00A0\u2000-\u3000-]*boleh[\s\u00A0\u2000-\u3000-]*baharu|re[\s\u00A0\u2000-\u3000-]*fund|renewable[\s\u00A0\u2000-\u3000-]*energy[\s\u00A0\u2000-\u3000-]*fund)/gi,
        "kwtbb"
      );

    // === DETECTION FLAGS ===
    const hasAngkadar = /\bangkadarkuasa\b/.test(text);
    const hasPowerFactor = /\bpowerfactor\b/.test(text);
    const hasSurcaj = /\bsurcajangkadarkuasa\b/.test(text);
    const hasServiceTax = /\bservicetax\b/.test(text);
    const hasKWTBB = /\bkwtbb\b/.test(text);
    const hasAFA =
      /a[\s\u00A0\u2000-\u3000-]*f[\s\u00A0\u2000-\u3000-]*a[\s\S]{0,40}(mulai|from)/gi.test(
        text
      );
    const hasInsentif =
      /\binsentif[\s\S]{0,10}cekap[\s\S]{0,10}tenaga\b/.test(text) ||
      /\befficient[\s\S]{0,10}energy[\s\S]{0,10}incentive\b/.test(text);
    const hasCagaran = /\bdiliputicagaran\b/.test(text);

    // === CONDITION LOGIC ===
    let conditionUsed = "";
    switch (true) {
      // ===== MOST SPECIFIC (4+ FLAGS) =====
      case hasAFA && hasAngkadar && hasSurcaj && hasKWTBB:
        conditionUsed = "AFA + Surcaj + Angkadar Kuasa + KWTBB";
        break;

      case hasAFA && hasInsentif && hasServiceTax && hasKWTBB:
        conditionUsed = "AFA + Service Tax + Insentif + KWTBB";
        break;

      case hasCagaran && hasKWTBB && hasAngkadar:
        conditionUsed = "Cagaran + kwtbb + Angkadar";
        break;

      // ===== 3-FLAG COMBINATIONS =====
      case hasAFA && hasAngkadar && hasKWTBB:
        conditionUsed = "AFA + Angkadar Kuasa + KWTBB";
        break;

      case hasAFA && hasInsentif && hasKWTBB:
        conditionUsed = "AFA + Insentif + KWTBB";
        break;

      case hasInsentif && hasServiceTax && hasKWTBB:
        conditionUsed = "Insentif + KWTBB + Service Tax";
        break;

      case hasInsentif && hasServiceTax && hasCagaran:
        conditionUsed = "Insentif + Service Tax + Cagaran";
        break;

      case hasAFA && hasPowerFactor && hasKWTBB:
        conditionUsed = "AFA + Power Factor + KWTBB";
        break;

      case hasAngkadar && hasSurcaj && hasKWTBB:
        conditionUsed = "Angkadar Kuasa + Surcaj + KWTBB";
        break;

      case hasAFA && hasAngkadar && hasSurcaj:
        conditionUsed = "AFA + Surcaj + Angkadar Kuasa";
        break;

      case hasAFA && hasServiceTax && hasKWTBB:
        conditionUsed = "AFA + Service Tax + KWTBB";
        break;

      // ===== 2-FLAG COMBINATIONS =====
      case hasAFA && hasKWTBB:
        conditionUsed = "AFA + KWTBB";
        break;

      case hasAFA && hasAngkadar:
        conditionUsed = "AFA + Angkadar Kuasa";
        break;

      case hasAFA && hasServiceTax:
        conditionUsed = "AFA + Service Tax";
        break;

      case hasAFA && hasSurcaj:
        conditionUsed = "AFA + Surcaj";
        break;

      case hasAFA && hasInsentif:
        conditionUsed = "AFA + Insentif";
        break;

      case hasInsentif && hasServiceTax:
        conditionUsed = "Insentif + Service Tax";
        break;

      case hasInsentif && hasKWTBB:
        conditionUsed = "Insentif + KWTBB";
        break;

      case hasKWTBB && hasServiceTax:
        conditionUsed = "KWTBB + Service Tax";
        break;

      case hasAngkadar && hasKWTBB:
        conditionUsed = "Angkadar Kuasa + KWTBB";
        break;

      case hasSurcaj && hasKWTBB:
        conditionUsed = "Surcaj + KWTBB";
        break;

      case hasAngkadar && hasCagaran:
        conditionUsed = "Angkadar Kuasa + Cagaran";
        break;

      case hasAngkadar && hasSurcaj:
        conditionUsed = "Angkadar Kuasa + Surcaj";
        break;

      case hasInsentif && hasAFA && hasServiceTax:
        conditionUsed = "AFA + Service Tax + Insentif";
        break;

      // ===== SINGLE-FLAG CONDITIONS =====
      case hasAFA:
        conditionUsed = "AFA only";
        break;

      case hasInsentif:
        conditionUsed = "Insentif only";
        break;

      case hasAngkadar:
        conditionUsed = "Angkadar Kuasa only";
        break;

      case hasSurcaj:
        conditionUsed = "Surcaj only";
        break;

      case hasKWTBB:
        conditionUsed = "KWTBB only";
        break;

      case hasServiceTax:
        conditionUsed = "Service Tax only";
        break;

      case hasCagaran:
        conditionUsed = "Cagaran only";
        break;

      // ===== DEFAULT =====
      default:
        conditionUsed = "Default (Normal)";
    }

    return {
      file: path.basename(pdfPath),
      hasAngkadar,
      hasSurcaj,
      hasServiceTax,
      hasAFA,
      hasInsentif,
      hasKWTBB,
      conditionUsed,
    };
  } catch (err) {
    console.error(`❌ Error processing ${pdfPath}:`, err.message);
    return { file: path.basename(pdfPath), error: err.message };
  }
}

// === Folder Runner ===
async function processAllPdfs() {
  const files = fs
    .readdirSync(inputFolder)
    .filter((f) => f.toLowerCase().endsWith(".pdf"));

  if (files.length === 0) {
    console.log("⚠️ No PDF files found in the input folder.");
    return;
  }

  console.log(`\n📂 Found ${files.length} PDF(s) in ${inputFolder}\n`);

  const results = [];
  for (const file of files) {
    const filePath = path.join(inputFolder, file);
    console.log(`🔍 Processing: ${file}`);
    const result = await extractTextFromPdf(filePath);
    results.push(result);
  }

  // === Categorize by conditionUsed ===
  const categories = {};
  for (const r of results) {
    const key = r.conditionUsed || "Unknown";
    if (!categories[key]) categories[key] = [];
    categories[key].push(r.file);
  }

  // === Define all possible condition keys from your switch ===
  const allConditions = [
    // ===== MOST SPECIFIC (4+ FLAGS) =====
    "AFA + Surcaj + Angkadar Kuasa + KWTBB",
    "AFA + Service Tax + Insentif + KWTBB",

    // ===== 3-FLAG COMBINATIONS =====
    "AFA + Angkadar Kuasa + KWTBB",
    "Cagaran + kwtbb + Angkadar",
    "AFA + Insentif + KWTBB",
    "Insentif + KWTBB + Service Tax",
    "Angkadar Kuasa + Surcaj + KWTBB",
    "AFA + Surcaj + Angkadar Kuasa",
    "AFA + Service Tax + KWTBB",
    "Insentif + Service Tax + Cagaran",

    // ===== 2-FLAG COMBINATIONS =====
    "AFA + KWTBB",
    "AFA + Angkadar Kuasa",
    "AFA + Service Tax",
    "AFA + Surcaj",
    "AFA + Insentif",
    "Insentif + Service Tax",
    "Insentif + KWTBB",
    "KWTBB + Service Tax",
    "Angkadar Kuasa + KWTBB",
    "Surcaj + KWTBB",
    "Angkadar Kuasa + Surcaj",
    "AFA + Service Tax + Insentif",
    "Angkadar Kuasa + Cagaran",

    // ===== SINGLE-FLAG CONDITIONS =====
    "AFA only",
    "Insentif only",
    "Angkadar Kuasa only",
    "Surcaj only",
    "KWTBB only",
    "Service Tax only",
    "Cagaran only",

    // ===== DEFAULT =====
    "Default (Normal)",
  ];

  // === Mark which conditions were used ===
  const usedConditions = Object.keys(categories);
  const unusedConditions = allConditions.filter(
    (c) => !usedConditions.includes(c)
  );

  // === Combined output ===
  const output = {
    summary: {
      totalFiles: results.length,
      totalConditions: allConditions.length,
      usedConditions: usedConditions.length,
      unusedConditions: unusedConditions.length,
    },
    categories: Object.fromEntries(
      Object.entries(categories).map(([k, v]) => [k, v.length])
    ),
    unusedConditions,
    groupedFiles: categories,
    detailedResults: results,
  };

  fs.writeFileSync(outputJsonPath, JSON.stringify(output, null, 2));

  // === Console summary ===
  console.log(`\n✅ Processing complete!`);
  console.log(`📊 Summary:`);
  console.table(output.categories);
  console.log(`\n🔹 Used Conditions: ${usedConditions.length}`);
  console.log(`🔸 Unused Conditions: ${unusedConditions.length}`);
  if (unusedConditions.length > 0) {
    console.log("\n🚫 Unused Condition Combinations:");
    unusedConditions.forEach((c) => console.log("  - " + c));
  }
  console.log(`\n📝 Full results saved to:\n${outputJsonPath}`);
}

// Run
processAllPdfs().catch(console.error);
