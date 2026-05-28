import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

/**
 * Capture a DOM node and download as a multi-page A4 PDF.
 * The node is captured as-is — no app chrome, just the document paper.
 */
export async function exportNodeToPdf(node: HTMLElement, filename: string) {
  // Capture at 2x scale for crisp text.
  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false,
  });

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = pdf.internal.pageSize.getWidth(); // 210
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let position = 0;
  let heightLeft = imgHeight;

  const imgData = canvas.toDataURL("image/png");

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  const clean = filename.replace(/[^\w\-]+/g, "_").replace(/^_+|_+$/g, "") || "document";
  pdf.save(`${clean}.pdf`);
}
