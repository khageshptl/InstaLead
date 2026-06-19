import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { searchInputSchema } from "@/lib/validations";
import { runSearchJob } from "@/lib/jobs";
import { withRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { createAuditLog, getClientInfo } from "@/lib/audit";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
  const skip = (page - 1) * limit;

  const [searches, total] = await Promise.all([
    prisma.search.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        profile: { select: { displayName: true, username: true } },
        website: { select: { title: true, url: true } },
        _count: { select: { contacts: true } },
      },
    }),
    prisma.search.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({ searches, total, page, limit });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = withRateLimit(
    `search:${session.user.id}`,
    parseInt(process.env.RATE_LIMIT_SEARCHES_PER_MINUTE || "10", 10)
  );

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
  }

  try {
    const body = await request.json();
    const parsed = searchInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (session.user.organizationId) {
      const subscription = await prisma.subscription.findUnique({
        where: { organizationId: session.user.organizationId },
      });

      if (
        subscription &&
        subscription.searchesUsed >= subscription.searchesLimit
      ) {
        return NextResponse.json(
          { error: "Search limit reached. Please upgrade your plan." },
          { status: 403 }
        );
      }
    }

    const search = await prisma.search.create({
      data: {
        userId: session.user.id,
        inputType: parsed.data.inputType,
        inputValue: parsed.data.inputValue,
        projectId: parsed.data.projectId,
        status: "QUEUED",
      },
    });

    if (session.user.organizationId) {
      await prisma.subscription.update({
        where: { organizationId: session.user.organizationId },
        data: { searchesUsed: { increment: 1 } },
      });
    }

    runSearchJob(search.id);

    const clientInfo = getClientInfo(request);
    await createAuditLog({
      userId: session.user.id,
      action: "SEARCH_CREATED",
      resource: "search",
      resourceId: search.id,
      metadata: {
        inputType: parsed.data.inputType,
        inputValue: parsed.data.inputValue,
      },
      ...clientInfo,
    });

    logger.info("Search created", { searchId: search.id });
    return NextResponse.json({ search }, { status: 201 });
  } catch (error) {
    logger.error("Search creation failed", error as Error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
