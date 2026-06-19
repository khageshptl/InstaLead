import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [users, searches, auditLogs, apiUsage] = await Promise.all([
    prisma.user.count(),
    prisma.search.count(),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { email: true, name: true } } },
    }),
    prisma.apiUsage.groupBy({
      by: ["endpoint"],
      _count: { id: true },
      _avg: { duration: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    }),
  ]);

  const recentSearches = await prisma.search.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      user: { select: { email: true } },
      _count: { select: { contacts: true } },
    },
  });

  const subscriptions = await prisma.subscription.groupBy({
    by: ["plan", "status"],
    _count: { id: true },
  });

  return NextResponse.json({
    stats: {
      totalUsers: users,
      totalSearches: searches,
    },
    recentSearches,
    auditLogs,
    apiUsage,
    subscriptions,
  });
}
