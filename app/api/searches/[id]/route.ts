import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const search = await prisma.search.findFirst({
    where: { id, userId: session.user.id },
    include: {
      profile: true,
      website: true,
      contacts: { orderBy: { confidenceScore: "desc" } },
      reports: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!search) {
    return NextResponse.json({ error: "Search not found" }, { status: 404 });
  }

  return NextResponse.json({ search });
}
