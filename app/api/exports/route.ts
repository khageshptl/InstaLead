import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { exportSchema } from "@/lib/validations";
import { runExportJob } from "@/lib/jobs";
import { getSignedDownloadUrl } from "@/lib/storage/s3";
import { createAuditLog, getClientInfo } from "@/lib/audit";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exports = await prisma.export.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const { searchParams } = new URL(request.url);
  const downloadId = searchParams.get("download");

  if (downloadId) {
    const exportRecord = exports.find((e) => e.id === downloadId);
    if (!exportRecord?.storageKey) {
      return NextResponse.json({ error: "Export not found" }, { status: 404 });
    }
    const url = await getSignedDownloadUrl(exportRecord.storageKey);
    return NextResponse.json({ url, fileName: exportRecord.fileName });
  }

  return NextResponse.json({ exports });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = exportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const exportRecord = await prisma.export.create({
    data: {
      userId: session.user.id,
      format: parsed.data.format,
      filters: parsed.data.filters ?? undefined,
      status: "PENDING",
    },
  });

  runExportJob(
    exportRecord.id,
    session.user.id,
    parsed.data.format,
    parsed.data.filters
  );

  const clientInfo = getClientInfo(request);
  await createAuditLog({
    userId: session.user.id,
    action: "EXPORT_CREATED",
    resource: "export",
    resourceId: exportRecord.id,
    metadata: { format: parsed.data.format },
    ...clientInfo,
  });

  return NextResponse.json({ export: exportRecord }, { status: 201 });
}
