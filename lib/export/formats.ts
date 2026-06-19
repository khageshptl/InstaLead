import ExcelJS from "exceljs";
import type { ConfidenceLevel, ContactType } from "@prisma/client";

export interface ExportRecord {
  searchId: string;
  inputType: string;
  inputValue: string;
  contactType?: ContactType;
  contactValue?: string;
  contactLabel?: string;
  source?: string;
  confidence?: ConfidenceLevel;
  confidenceScore?: number;
  tags?: string[];
  notes?: string;
  createdAt: string;
}

export function exportToCsv(records: ExportRecord[]): string {
  if (records.length === 0) return "";

  const headers = [
    "Search ID",
    "Input Type",
    "Input Value",
    "Contact Type",
    "Contact Value",
    "Contact Label",
    "Source",
    "Confidence",
    "Confidence Score",
    "Tags",
    "Notes",
    "Created At",
  ];

  const rows = records.map((r) => [
    r.searchId,
    r.inputType,
    r.inputValue,
    r.contactType || "",
    r.contactValue || "",
    r.contactLabel || "",
    r.source || "",
    r.confidence || "",
    r.confidenceScore?.toString() || "",
    (r.tags || []).join("; "),
    r.notes || "",
    r.createdAt,
  ]);

  const escape = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  return [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

export async function exportToExcel(
  records: ExportRecord[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Leads");

  sheet.columns = [
    { header: "Search ID", key: "searchId", width: 20 },
    { header: "Input Type", key: "inputType", width: 15 },
    { header: "Input Value", key: "inputValue", width: 30 },
    { header: "Contact Type", key: "contactType", width: 12 },
    { header: "Contact Value", key: "contactValue", width: 30 },
    { header: "Contact Label", key: "contactLabel", width: 20 },
    { header: "Source", key: "source", width: 20 },
    { header: "Confidence", key: "confidence", width: 12 },
    { header: "Confidence Score", key: "confidenceScore", width: 15 },
    { header: "Tags", key: "tags", width: 20 },
    { header: "Notes", key: "notes", width: 30 },
    { header: "Created At", key: "createdAt", width: 20 },
  ];

  sheet.getRow(1).font = { bold: true };

  for (const record of records) {
    sheet.addRow({
      ...record,
      tags: (record.tags || []).join("; "),
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function exportToJson(records: ExportRecord[]): string {
  return JSON.stringify(records, null, 2);
}
