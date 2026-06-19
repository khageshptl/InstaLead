import { logger } from "@/lib/logger";
import { processSearch } from "@/lib/services/search-processor";
import { processExport } from "@/lib/services/export-processor";
import { generateReport } from "@/lib/services/report-generator";
import type { ExportFormat } from "@prisma/client";

export function runSearchJob(searchId: string) {
  void processSearch(searchId).catch((error) => {
    logger.error("Search processing failed", error as Error, { searchId });
  });
}

export function runExportJob(
  exportId: string,
  userId: string,
  format: ExportFormat,
  filters?: Record<string, unknown>
) {
  void processExport(exportId, userId, format, filters).catch((error) => {
    logger.error("Export processing failed", error as Error, { exportId });
  });
}

export function runReportJob(
  reportId: string,
  searchId: string,
  includeAiInsights: boolean
) {
  void generateReport(reportId, searchId, includeAiInsights).catch((error) => {
    logger.error("Report generation failed", error as Error, { reportId, searchId });
  });
}
