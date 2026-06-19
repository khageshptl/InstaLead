import { prisma } from "@/lib/db";
import { uploadFile } from "@/lib/storage/s3";
import {
  exportToCsv,
  exportToExcel,
  exportToJson,
  type ExportRecord,
} from "@/lib/export/formats";
import { logger } from "@/lib/logger";
import type { ExportFormat } from "@prisma/client";

export async function processExport(
  exportId: string,
  userId: string,
  format: ExportFormat,
  filters?: Record<string, unknown>
): Promise<void> {
  await prisma.export.update({
    where: { id: exportId },
    data: { status: "PROCESSING" },
  });

  try {
    const leads = await prisma.savedLead.findMany({
      where: {
        userId,
        ...(filters?.tags
          ? {
              tags: {
                hasSome: Array.isArray(filters.tags)
                  ? filters.tags
                  : [filters.tags as string],
              },
            }
          : {}),
      },
      include: {
        search: {
          include: { contacts: true },
        },
        contact: true,
      },
    });

    const records: ExportRecord[] = [];

    for (const lead of leads) {
      const contacts =
        lead.contact
          ? [lead.contact]
          : lead.search.contacts.filter(
              (c) =>
                !filters?.confidence || c.confidence === filters.confidence
            );

      if (contacts.length === 0) {
        records.push({
          searchId: lead.searchId,
          inputType: lead.search.inputType,
          inputValue: lead.search.inputValue,
          tags: lead.tags,
          notes: lead.notes || undefined,
          createdAt: lead.createdAt.toISOString(),
        });
      } else {
        for (const contact of contacts) {
          records.push({
            searchId: lead.searchId,
            inputType: lead.search.inputType,
            inputValue: lead.search.inputValue,
            contactType: contact.type,
            contactValue: contact.value,
            contactLabel: contact.label || undefined,
            source: contact.source,
            confidence: contact.confidence,
            confidenceScore: contact.confidenceScore,
            tags: lead.tags,
            notes: lead.notes || undefined,
            createdAt: lead.createdAt.toISOString(),
          });
        }
      }
    }

    const timestamp = Date.now();
    let body: Buffer | string;
    let contentType: string;
    let fileName: string;

    switch (format) {
      case "CSV":
        body = exportToCsv(records);
        contentType = "text/csv";
        fileName = `export-${timestamp}.csv`;
        break;
      case "EXCEL":
        body = await exportToExcel(records);
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        fileName = `export-${timestamp}.xlsx`;
        break;
      case "JSON":
        body = exportToJson(records);
        contentType = "application/json";
        fileName = `export-${timestamp}.json`;
        break;
    }

    const storageKey = `exports/${userId}/${fileName}`;
    await uploadFile(storageKey, body, contentType);

    await prisma.export.update({
      where: { id: exportId },
      data: {
        status: "COMPLETED",
        storageKey,
        fileName,
        recordCount: records.length,
        completedAt: new Date(),
      },
    });

    logger.info("Export completed", { exportId, recordCount: records.length });
  } catch (error) {
    await prisma.export.update({
      where: { id: exportId },
      data: {
        status: "FAILED",
        errorMessage:
          error instanceof Error ? error.message : "Export failed",
      },
    });
    throw error;
  }
}
