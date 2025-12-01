// import fs from "fs";
// import { PDFDocument, rgb } from "pdf-lib";

// const inputPath = "Z:/System/01 Utility Bill/TNB/2508/TNB_2508_CYBERJ.pdf";
// const outputPath = "C:/Users/PC/Desktop/PDFExtractorTesting/TNB_2508_CYBERJ_BOXED.pdf";

// async function drawBox() {
//   const pdfBytes = fs.readFileSync(inputPath);
//   const pdfDoc = await PDFDocument.load(pdfBytes);
//   const pages = pdfDoc.getPages();
//   const page = pages[0]; // first page only for test

//   const { width, height } = page.getSize();
//   console.log(`Page size: ${width} x ${height}`);

//   // Define a box roughly in the middle of the page
//   const boxWidth = 200;
//   const boxHeight = 200;
//   const x = 0;
//   const y = 641.68;

//   // Draw rectangle with visible border and fill
//   page.drawRectangle({
//     x,
//     y,
//     width: boxWidth,
//     height: boxHeight,
//     borderColor: rgb(0, 0.5, 1),
//     borderWidth: 2,
//     color: rgb(0.7, 0.85, 1),
//     opacity: 0.3,
//   });

//   // Label it
// //   page.drawText(`Box center region\n(x=${Math.round(x)}–${Math.round(x + boxWidth)}, y=${Math.round(y)}–${Math.round(y + boxHeight)})`, {
// //     x: x + 10,
// //     y: y + boxHeight - 40,
// //     size: 12,
// //     color: rgb(0, 0.3, 0.7),
// //   });

//   const modifiedPdf = await pdfDoc.save();
//   fs.writeFileSync(outputPath, modifiedPdf);
//   console.log(`✅ Saved with box: ${outputPath}`);
// }

// drawBox().catch(console.error);

import fs from "fs";
import { PDFDocument, rgb } from "pdf-lib";

// const inputPath = "Z:/System/01 Utility Bill/TNB/2508/TNB_2508_CYBERJ.pdf";
// const inputPath = "Z:/System/01 Utility Bill/TNB/2508/TNB_2508_TK4.pdf"
const inputPath = "Z:/System/01 Utility Bill/TNB/2508/TNB_2507_HOSTEL.pdf";
const outputPath =
  "C:/Users/PC/Desktop/PDFExtractorTesting/TNB_2508_CYBERJ_MULTI_ALLPAGES.pdf";

async function drawBoxes() {
  const pdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  console.log(`PDF has ${pages.length} page(s).`);

  // Define the same set of boxes to draw on each page
  const boxesPerPage = [
    [
      { x: 250, y: 754.68, w: 50, h: 10 },
      { x: 250, y: 724.68, w: 100, h: 10 },
      { x: 254, y: 714.68, w: 10, h: 10 },
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
    // [{ x: 100, y: 400, w: 200, h: 200 }],
  ];

  // [
  //     { x: 10, y: 682.68, w: 200, h: 70 },
  //     { x: 250, y: 752.68, w: 50, h: 30 },
  //     { x: 250, y: 712.68, w: 100, h: 35 },
  //     { x: 250, y: 672.68, w: 100, h: 35 },
  //     { x: 396.96, y: 752.68, w: 100, h: 30 },
  //     { x: 349, y: 480, w: 90, h: 45 },
  //     //   { x: 515, y: 211, w: 30, h: 10 },
  //     { x: 32, y: 61, w: 230, h: 10 },
  //   ],
  //   [
  //     { x: 390, y: 395, w: 45, h: 10 },
  //     { x: 390, y: 380, w: 45, h: 10 },
  //     { x: 340, y: 278, w: 90, h: 15 },
  //   ],

  pages.forEach((page, i) => {
    const boxes = boxesPerPage[i] || [];

    boxes.forEach((b, boxIndex) => {
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

      page.drawText(`${boxIndex + 1}`, {
        x: b.x + 5,
        y: b.y + b.h - 15,
        size: 10,
        color: rgb(0, 0.3, 0.7),
      });
    });
  });

  // Loop through all pages
  //   pages.forEach((page, pageIndex) => {
  //     const { width, height } = page.getSize();
  //     console.log(`Drawing on Page ${pageIndex + 1}: ${width} x ${height}`);

  //     boxes.forEach(b => {
  //       page.drawRectangle({
  //         x: b.x,
  //         y: b.y,
  //         width: b.w,
  //         height: b.h,
  //         borderColor: rgb(0, 0.5, 1),
  //         borderWidth: 2,
  //         color: rgb(0.7, 0.85, 1),
  //         opacity: 0.3,
  //       });
  //     });
  //   });

  const modified = await pdfDoc.save();
  fs.writeFileSync(outputPath, modified);
  console.log(`✅ Saved with boxes on all pages: ${outputPath}`);
}

drawBoxes().catch(console.error);
