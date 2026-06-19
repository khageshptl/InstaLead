import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { savedLeadSchema, updateLeadSchema, leadFilterSchema } from "@/lib/validations";
import { createAuditLog, getClientInfo } from "@/lib/audit";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = leadFilterSchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
  }

  const { page, limit, tags, confidence, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where = {
    userId: session.user.id,
    ...(tags ? { tags: { has: tags } } : {}),
    ...(search
      ? {
          OR: [
            { notes: { contains: search, mode: "insensitive" as const } },
            { search: { inputValue: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(confidence
      ? { search: { contacts: { some: { confidence } } } }
      : {}),
  };

  const [leads, total] = await Promise.all([
    prisma.savedLead.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        search: {
          include: {
            profile: true,
            website: true,
            contacts: { orderBy: { confidenceScore: "desc" } },
          },
        },
        contact: true,
      },
    }),
    prisma.savedLead.count({ where }),
  ]);

  return NextResponse.json({ leads, total, page, limit });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = savedLeadSchema.safeParse(body);

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

  const lead = await prisma.savedLead.upsert({
    where: {
      userId_searchId: {
        userId: session.user.id,
        searchId: parsed.data.searchId,
      },
    },
    create: {
      userId: session.user.id,
      searchId: parsed.data.searchId,
      contactId: parsed.data.contactId,
      tags: parsed.data.tags || [],
      notes: parsed.data.notes,
    },
    update: {
      contactId: parsed.data.contactId,
      tags: parsed.data.tags,
      notes: parsed.data.notes,
    },
    include: {
      search: { include: { contacts: true } },
      contact: true,
    },
  });

  const clientInfo = getClientInfo(request);
  await createAuditLog({
    userId: session.user.id,
    action: "LEAD_SAVED",
    resource: "lead",
    resourceId: lead.id,
    ...clientInfo,
  });

  return NextResponse.json({ lead }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("id");

  if (!leadId) {
    return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = updateLeadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const lead = await prisma.savedLead.updateMany({
    where: { id: leadId, userId: session.user.id },
    data: parsed.data,
  });

  if (lead.count === 0) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("id");

  if (!leadId) {
    return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
  }

  await prisma.savedLead.deleteMany({
    where: { id: leadId, userId: session.user.id },
  });

  const clientInfo = getClientInfo(request);
  await createAuditLog({
    userId: session.user.id,
    action: "LEAD_DELETED",
    resource: "lead",
    resourceId: leadId,
    ...clientInfo,
  });

  return NextResponse.json({ success: true });
}
