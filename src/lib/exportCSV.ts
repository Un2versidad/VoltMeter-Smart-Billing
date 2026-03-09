export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][], options?: {
  title?: string;
  subtitle?: string;
  separator?: string;
}) {
  const bom = "\uFEFF";
  const sep = options?.separator || ",";
  const lines: string[] = [];

  // Title row
  if (options?.title) {
    lines.push(options.title);
    lines.push("");
  }
  if (options?.subtitle) {
    lines.push(options.subtitle);
    lines.push("");
  }

  // Headers
  lines.push(headers.map(h => `"${h}"`).join(sep));

  // Separator line
  lines.push(headers.map(() => `"${"─".repeat(14)}"`).join(sep));

  // Data rows
  rows.forEach((r) => {
    lines.push(r.map(cell => {
      const val = String(cell);
      // Wrap in quotes to preserve formatting
      return `"${val}"`;
    }).join(sep));
  });

  // Footer
  lines.push("");
  lines.push(`"Generado: ${new Date().toLocaleString("es-PA")}"`);
  lines.push(`"VoltMeter Solutions S.A. — SmartBilling System"`);

  const csv = bom + lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
