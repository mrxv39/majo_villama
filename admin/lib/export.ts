export function downloadCSV(
  data: Record<string, unknown>[],
  filename: string,
  headers: Record<string, string>
) {
  const keys = Object.keys(headers);
  const headerRow = keys.map((k) => headers[k]).join(",");
  const rows = data.map((row) =>
    keys
      .map((k) => {
        const val = row[k];
        const str = val === null || val === undefined ? "" : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  const csv = "\uFEFF" + [headerRow, ...rows].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
