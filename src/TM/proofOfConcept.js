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

const inputPath = "Z://System//01 Utility Bill//06 TM//2507//TM_2507_PUJ.pdf";
// const inputPath = "Z:/System/01 Utility Bill/TNB/2508/TNB_2508_TK4.pdf"
// const inputPath = "Z:/System/01 Utility Bill/TNB/2508/TNB_2508_SJ.pdf";
const outputPath =
  "C:/Users/PC/Desktop/PDFExtractorTesting/TM_2507_PUJ_MULTI_ALLPAGES.pdf";

async function drawBoxes() {
  const pdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  console.log(`PDF has ${pages.length} page(s).`);

  // Define the same set of boxes to draw on each page
  const boxesPerPage = [
    [
      { x: 410, y: 639,w: 165, h: 15},
      { x: 410, y: 657,w: 170, h: 16},
      { x: 475, y: 280, w: 100, h: 35 },
      { x: 475, y: 365, w: 100, h: 22 },
      { x: 475, y: 390, w: 100, h: 22 },
      { x: 430, y: 617, w: 130, h: 19 },
      //   { x: 515, y: 211, w: 30, h: 10 },
      { x: 475, y: 420, w: 100, h: 22 },
    ],
    [
      
      { x: 180, y: 315, w: 155, h: 20 },
    ],
    // [{ x: 100, y: 400, w: 200, h: 200 }],
  ];

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













