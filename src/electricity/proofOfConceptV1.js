import fs from "fs";
import path from "path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { PDFDocument, rgb } from "pdf-lib";

const inputFolder = "C:/Users/PC/Desktop/2508";
const outputFolder = "C:/Users/PC/Desktop/PDFExtractorTesting/Boxed_2508";
const outputJsonPath =
  "C:/Users/PC/Desktop/PDFExtractorTesting/TNB_2508_output.json";

if (!fs.existsSync(outputFolder))
  fs.mkdirSync(outputFolder, { recursive: true });

async function processPdf(inputPath) {
  const data = new Uint8Array(fs.readFileSync(inputPath));
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

  console.log(`📄 Extracted text from ${pdfjsDoc.numPages} page(s).`);

  // 🧹 Normalize + Clean Text
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

  // 🧾 Load the PDF for Drawing
  const pdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  //   // --- BOX SETS ---
  const boxes_AK_only = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_S_only = [
    //dont know if its possible
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 310, y: 480, w: 110, h: 45 },
      { x: 349, y: 440, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 390, y: 395, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_ST_only = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 180, y: 440, w: 120, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 380, y: 390, w: 55, h: 15 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_AFA_only = [
    //dont know if its possible
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_Insentif_only = [
    //dont know if its possible
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_KWTBB_Only = [
    //dont know if its possible
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_AFA_AK = [
    // this one has some problems where some afa has a new line but some dont
    [
      { x: 250, y: 752.68, w: 50, h: 10 },
      { x: 250, y: 722.68, w: 100, h: 10 },
      { x: 250, y: 712.68, w: 100, h: 10 },
      { x: 250, y: 676.68, w: 100, h: 10 },
      { x: 396.96, y: 752.68, w: 100, h: 10 },
      { x: 208, y: 480, w: 100, h: 20 },
      { x: 349, y: 480, w: 90, h: 20 },
      { x: 242, y: 61, w: 20, h: 10 },
    ],
    [
      { x: 385, y: 420, w: 45, h: 10 },
      // { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 315, w: 40, h: 15 },
    ],
  ];

  const boxes_AFA_AK_DUAL = [
    // this one has some problems where some afa has a new line but some dont
    [
      { x: 250, y: 752.68, w: 50, h: 10 },
      { x: 250, y: 722.68, w: 100, h: 10 },
      { x: 250, y: 712.68, w: 100, h: 10 },
      { x: 250, y: 676.68, w: 100, h: 10 },
      { x: 396.96, y: 752.68, w: 100, h: 10 },
      { x: 208, y: 480, w: 100, h: 20 },
      { x: 349, y: 480, w: 90, h: 20 },
      { x: 242, y: 61, w: 20, h: 10 },
    ],
    [
      { x: 385, y: 405, w: 45, h: 10 },
      // { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 300, w: 40, h: 15 },
    ],
  ];

  const boxes_AFA_S = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_Insentif_AFA = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_Insentif_ST = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_Insentif_ST_AFA = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_AFA_AK_S = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_AFA_ST = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_AFA_AK_S_KWTBB = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_Insentif_ST_AFA_KWTBB = [
    [
      { x: 250, y: 754.68, w: 50, h: 10 },
      { x: 250, y: 724.68, w: 100, h: 10 },
      { x: 250, y: 714.68, w: 100, h: 10 },
      { x: 250, y: 678.68, w: 100, h: 10 },
      { x: 396.96, y: 754.68, w: 100, h: 10 },
      { x: 208, y: 480, w: 100, h: 20 },
      { x: 349, y: 480, w: 90, h: 20 },
    ],
    [
      { x: 385, y: 382, w: 45, h: 12 },
      { x: 385, y: 365, w: 45, h: 12 },
      { x: 385, y: 350, w: 45, h: 12 },
      { x: 340, y: 247, w: 40, h: 15 },
    ],
  ];

  const boxes_AFA_Insentif_KWTBB = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_Insentif_ST_KWTBB = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_AFA_KWTBB = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_Insentif_KWTBB = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_ST_KWTBB = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_AK_S_KWTBB = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_AK_KWTBB = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_S_KWTBB = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_AK_S = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_Normal = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_Cagaran_only = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];
  const boxes_AFA_AK_KWTBB = [
    [
      { x: 250, y: 752.68, w: 50, h: 11 },
      { x: 250, y: 722.68, w: 100, h: 11 },
      { x: 250, y: 712.68, w: 100, h: 11 },
      { x: 250, y: 676.68, w: 100, h: 18 },
      { x: 396.96, y: 752.68, w: 100, h: 15 },
      { x: 208, y: 480, w: 100, h: 20 },
      { x: 349, y: 480, w: 90, h: 20 },
      { x: 242, y: 61, w: 20, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 385, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_AFA_AK_KWTBB_English = [
    [
      { x: 250, y: 752.68, w: 50, h: 10 },
      { x: 250, y: 722.68, w: 100, h: 10 },
      { x: 250, y: 712.68, w: 100, h: 10 },
      { x: 250, y: 676.68, w: 100, h: 10 },
      { x: 396.96, y: 752.68, w: 100, h: 10 },
      { x: 208, y: 480, w: 100, h: 20 },
      { x: 349, y: 480, w: 90, h: 20 },
      { x: 242, y: 61, w: 20, h: 10 },
    ],
    [
      { x: 385, y: 390, w: 45, h: 10 },
      { x: 385, y: 375, w: 45, h: 10 },
      { x: 340, y: 270, w: 40, h: 15 },
    ],
  ];

  const boxes_AFA_ST_KWTBB = [
    [
      { x: 10, y: 685.8, w: 200, h: 80 },
      { x: 250, y: 752.68, w: 50, h: 30 },
      { x: 250, y: 712.68, w: 100, h: 35 },
      { x: 250, y: 672.68, w: 100, h: 35 },
      { x: 396.96, y: 752.68, w: 100, h: 30 },
      { x: 208, y: 480, w: 100, h: 45 },
      { x: 349, y: 480, w: 90, h: 45 },
      { x: 32, y: 61, w: 230, h: 10 },
    ],
    [
      { x: 385, y: 396, w: 45, h: 10 },
      { x: 390, y: 380, w: 45, h: 10 },
      { x: 340, y: 278, w: 40, h: 15 },
    ],
  ];

  const boxes_Cagaran_ST_Insentif = [
    [
      { x: 250, y: 754.68, w: 50, h: 10 },
      { x: 250, y: 724.68, w: 100, h: 10 },
      { x: 250, y: 714.68, w: 100, h: 10 },
      { x: 250, y: 678.68, w: 100, h: 10 },
      { x: 396.96, y: 754.68, w: 100, h: 10 },
      { x: 208, y: 482, w: 100, h: 20 },
      { x: 349, y: 482, w: 90, h: 20 },
    ],
    [
      { x: 384, y: 405, w: 45, h: 10 },
      { x: 384, y: 390, w: 45, h: 10 },
      { x: 384, y: 375, w: 45, h: 10 },
      { x: 340, y: 270, w: 40, h: 15 },
    ],
  ];

  const boxes_Cagaran_KWTBB_AK = [
    [
      { x: 250, y: 754.68, w: 50, h: 10 },
      { x: 250, y: 724.68, w: 100, h: 10 },
      { x: 250, y: 714.68, w: 100, h: 10 },
      { x: 250, y: 678.68, w: 100, h: 10 },
      { x: 396.96, y: 754.68, w: 100, h: 10 },
      { x: 208, y: 482, w: 100, h: 20 },
      { x: 349, y: 482, w: 90, h: 20 },
      { x: 242, y: 64, w: 20, h: 10 },
    ],
    [
      { x: 384, y: 422, w: 45, h: 10 },
      { x: 384, y: 407, w: 45, h: 10 },
      // { x: 384, y: 380, w: 45, h: 10 },
      { x: 340, y: 285, w: 40, h: 15 },
    ],
  ];

  const boxes_Cagaran_AK = [
    [
      { x: 250, y: 754.68, w: 50, h: 10 },
      { x: 250, y: 724.68, w: 100, h: 10 },
      { x: 250, y: 714.68, w: 100, h: 10 },
      { x: 250, y: 678.68, w: 100, h: 10 },
      { x: 396.96, y: 754.68, w: 100, h: 10 },
      { x: 208, y: 482, w: 100, h: 20 },
      { x: 349, y: 482, w: 90, h: 20 },
      { x: 242, y: 64, w: 20, h: 10 },
    ],
    [
      { x: 384, y: 422, w: 45, h: 10 },
      // { x: 384, y: 407, w: 45, h: 10 },
      // { x: 384, y: 380, w: 45, h: 10 },
      { x: 340, y: 300, w: 40, h: 15 },
    ],
  ];

  // --- CONDITION SELECTION ---
  let selectedBoxes = [];
  let conditionUsed = "";

  switch (true) {
    // ===== 4-FLAG COMBINATIONS =====
    case hasAFA && hasAngkadar && hasSurcaj && hasKWTBB:
      selectedBoxes = boxes_AFA_AK_S_KWTBB;
      conditionUsed = "AFA + Surcaj + Angkadar Kuasa + KWTBB";
      break;

    case hasAFA && hasInsentif && hasServiceTax && hasKWTBB:
      selectedBoxes = boxes_Insentif_ST_AFA_KWTBB;
      conditionUsed = "AFA + Service Tax + Insentif + KWTBB";
      break;

    // ===== 3-FLAG COMBINATIONS =====
    case hasAFA && hasAngkadar && hasSurcaj:
      selectedBoxes = boxes_AFA_AK_S;
      conditionUsed = "AFA + Surcaj + Angkadar Kuasa";
      break;

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

    case hasInsentif && hasServiceTax && hasKWTBB:
      selectedBoxes = boxes_Insentif_ST_KWTBB;
      conditionUsed = "Insentif + Service Tax + KWTBB";
      break;

    case hasAFA && hasServiceTax && hasKWTBB:
      selectedBoxes = boxes_AFA_ST_KWTBB;
      conditionUsed = "AFA + Service Tax + KWTBB";
      break;

    case hasAFA && hasInsentif && hasKWTBB:
      selectedBoxes = boxes_AFA_Insentif_KWTBB;
      conditionUsed = "AFA + Insentif + KWTBB";
      break;

    case hasCagaran && hasKWTBB && hasAngkadar:
      selectedBoxes = boxes_Cagaran_KWTBB_AK;
      conditionUsed = "Cagaran + KWTBB + Angkadar Kuasa";
      break;

    case hasInsentif && hasAFA && hasServiceTax:
      selectedBoxes = boxes_Insentif_ST_AFA;
      conditionUsed = "AFA + Service Tax + Insentif";
      break;

    case hasAngkadar && hasSurcaj && hasKWTBB:
      selectedBoxes = boxes_AK_S_KWTBB;
      conditionUsed = "Angkadar Kuasa + Surcaj + KWTBB";
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

    case hasAFA && hasServiceTax:
      selectedBoxes = boxes_AFA_ST;
      conditionUsed = "AFA + Service Tax";
      break;

    case hasCagaran && hasAngkadar:
      selectedBoxes = boxes_Cagaran_AK;
      conditionUsed = "Cagaran + Angkadar Kuasa";
      break;

    case hasAFA && hasSurcaj:
      selectedBoxes = boxes_AFA_S;
      conditionUsed = "AFA + Surcaj";
      break;

    case hasAFA && hasKWTBB:
      selectedBoxes = boxes_AFA_KWTBB;
      conditionUsed = "AFA + KWTBB";
      break;

    case hasAFA && hasInsentif:
      selectedBoxes = boxes_Insentif_AFA;
      conditionUsed = "AFA + Insentif";
      break;

    case hasInsentif && hasServiceTax:
      selectedBoxes = boxes_Insentif_ST;
      conditionUsed = "Insentif + Service Tax";
      break;

    case hasInsentif && hasKWTBB:
      selectedBoxes = boxes_Insentif_KWTBB;
      conditionUsed = "Insentif + KWTBB";
      break;

    case hasKWTBB && hasServiceTax:
      selectedBoxes = boxes_ST_KWTBB;
      conditionUsed = "KWTBB + Service Tax";
      break;

    case hasAngkadar && hasSurcaj:
      selectedBoxes = boxes_AK_S;
      conditionUsed = "Angkadar Kuasa + Surcaj";
      break;

    case hasAngkadar && hasKWTBB:
      selectedBoxes = boxes_AK_KWTBB;
      conditionUsed = "Angkadar Kuasa + KWTBB";
      break;

    case hasSurcaj && hasKWTBB:
      selectedBoxes = boxes_S_KWTBB;
      conditionUsed = "Surcaj + KWTBB";
      break;

    // ===== SINGLE-FLAG COMBINATIONS =====
    case hasAFA:
      selectedBoxes = boxes_AFA_only;
      conditionUsed = "AFA only";
      break;

    case hasInsentif:
      selectedBoxes = boxes_Insentif_only;
      conditionUsed = "Insentif only";
      break;

    case hasAngkadar:
      selectedBoxes = boxes_AK_only;
      conditionUsed = "Angkadar Kuasa only";
      break;

    case hasSurcaj:
      selectedBoxes = boxes_S_only;
      conditionUsed = "Surcaj only";
      break;

    case hasKWTBB:
      selectedBoxes = boxes_KWTBB_Only;
      conditionUsed = "KWTBB only";
      break;

    case hasServiceTax:
      selectedBoxes = boxes_ST_only;
      conditionUsed = "Service Tax only";
      break;

    case hasCagaran:
      selectedBoxes = boxes_Cagaran_only;
      conditionUsed = "Cagaran Only";
      break;

    // ===== DEFAULT =====
    default:
      selectedBoxes = boxes_Normal;
      conditionUsed = "Default (Normal)";
      break;
  }

  console.log(`\n📦 Box Set Used: ${conditionUsed}`);
  console.log(`Total Boxes: ${selectedBoxes[0]?.length || 0}\n`);

  // 🖊 Draw Boxes
  pages.forEach((page, pageIndex) => {
    const boxes = selectedBoxes[pageIndex] || [];
    boxes.forEach((b, i) => {
      page.drawRectangle({
        x: b.x,
        y: b.y,
        width: b.w,
        height: b.h,
        borderColor: rgb(0, 0.5, 1),
        borderWidth: 2,
        color: rgb(0.7, 0.85, 1),
        opacity: 0.3,
      });
      page.drawText(`${i + 1}`, {
        x: b.x + 5,
        y: b.y + b.h - 15,
        size: 10,
        color: rgb(0, 0.3, 0.7),
      });
    });
  });

  // 💾 Save boxed version per file
  const outputFile = path.join(
    outputFolder,
    path.basename(inputPath).replace(/\.pdf$/i, "_BOXED.pdf")
  );
  const modifiedPdf = await pdfDoc.save();
  fs.writeFileSync(outputFile, modifiedPdf);
  console.log(`✅ Saved with boxes (${conditionUsed}): ${outputFile}`);

  return {
    file: path.basename(inputPath),
    hasAngkadar,
    hasSurcaj,
    hasServiceTax,
    hasAFA,
    hasInsentif,
    conditionUsed,
  };
}

// === Folder Runner ===
async function processAll() {
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
    const fullPath = path.join(inputFolder, file);
    console.log(`🔍 Processing: ${file}`);
    const result = await processPdf(fullPath);
    results.push(result);
  }

  fs.writeFileSync(outputJsonPath, JSON.stringify(results, null, 2));
  console.log(
    `\n✅ All PDFs processed! JSON output saved to:\n${outputJsonPath}`
  );
}

processAll().catch(console.error);
