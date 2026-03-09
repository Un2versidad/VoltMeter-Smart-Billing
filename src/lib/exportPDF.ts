import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import voltmeterLogo from "@/assets/voltmeter-logo.png";

interface PDFReportOptions {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  filename: string;
  footer?: string;
  summary?: { label: string; value: string }[];
}

export function exportToPDF({
  title,
  subtitle,
  headers,
  rows,
  filename,
  footer,
  summary,
}: PDFReportOptions) {
  const doc = new jsPDF();

  // Colors
  const primaryColor: [number, number, number] = [34, 197, 94]; // green
  const darkBg: [number, number, number] = [15, 23, 42]; // slate-900
  const textColor: [number, number, number] = [226, 232, 240]; // slate-200

  // Header band
  doc.setFillColor(...darkBg);
  doc.rect(0, 0, 210, 40, "F");

  // Logo image — centered horizontally
  const logoSize = 12;
  const logoX = (210 - logoSize) / 2;
  doc.addImage(voltmeterLogo, "PNG", logoX, 5, logoSize, logoSize);

  // Logo text — centered
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.text("VoltMeter Solutions S.A.", 105, 22, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("SmartBilling — Sistema de Medición Individualizada", 105, 29, { align: "center" });

  // Date
  doc.setFontSize(8);
  doc.text(`Generado: ${new Date().toLocaleString("es-PA")}`, 14, 36);
  doc.text("Panamá, Rep. de Panamá", 196, 36, { align: "right" });

  // Title
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 52);

  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(subtitle, 14, 59);
  }

  // Summary boxes
  let startY = subtitle ? 65 : 58;

  if (summary && summary.length > 0) {
    const boxWidth = (210 - 28 - (summary.length - 1) * 4) / summary.length;
    summary.forEach((item, i) => {
      const x = 14 + i * (boxWidth + 4);
      doc.setFillColor(241, 245, 249); // slate-100
      doc.roundedRect(x, startY, boxWidth, 18, 2, 2, "F");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(item.label, x + 4, startY + 7);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(item.value, x + 4, startY + 15);
      doc.setFont("helvetica", "normal");
    });
    startY += 24;
  }

  // Table
  autoTable(doc, {
    startY: startY,
    head: [headers],
    body: rows.map((r) => r.map(String)),
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: darkBg,
      textColor: [226, 232, 240],
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles: headers.reduce(
      (acc, _, i) => {
        if (i >= 2) acc[i] = { halign: "right" };
        return acc;
      },
      {} as Record<number, { halign: "right" }>
    ),
    didDrawPage: (data) => {
      // Footer on each page
      const pageHeight = doc.internal.pageSize.height;
      doc.setFillColor(241, 245, 249);
      doc.rect(0, pageHeight - 15, 210, 15, "F");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(
        footer || "VoltMeter Solutions S.A. — Reporte generado automáticamente",
        14,
        pageHeight - 7
      );
      doc.text(
        `Página ${doc.getCurrentPageInfo().pageNumber}`,
        190,
        pageHeight - 7,
        { align: "right" }
      );
    },
  });

  doc.save(`${filename}.pdf`);
}
