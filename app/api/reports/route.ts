import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { reportSchema } from "@/lib/validations";
import { runReportJob } from "@/lib/jobs";
import { createAuditLog, getClientInfo } from "@/lib/audit";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reports = await prisma.report.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      search: {
        select: { inputType: true, inputValue: true, status: true },
      },
    },
  });

  return NextResponse.json({ reports });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const search = await prisma.search.findFirst({
    where: { id: parsed.data.searchId, userId: session.user.id },
  });

  if (!search) {
    return NextResponse.json({ error: "Search not found" }, { status: 404 });
  }

  if (search.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Search must be completed before generating a report" },
      { status: 400 }
    );
  }

  const report = await prisma.report.create({
    data: {
      userId: session.user.id,
      searchId: parsed.data.searchId,
      title:
        parsed.data.title ||
        `Report: ${search.inputValue}`,
      content: {},
    },
  });

  runReportJob(
    report.id,
    parsed.data.searchId,
    parsed.data.includeAiInsights
  );

  const clientInfo = getClientInfo(request);
  await createAuditLog({
    userId: session.user.id,
    action: "REPORT_GENERATED",
    resource: "report",
    resourceId: report.id,
    ...clientInfo,
  });

  return NextResponse.json({ report }, { status: 201 });
}
