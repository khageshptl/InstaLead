import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations";
import { createAuditLog, getClientInfo } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      organization: {
        include: { subscription: true },
      },
    },
  });

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (parsed.data.email) {
    const existing = await prisma.user.findFirst({
      where: {
        email: parsed.data.email.toLowerCase(),
        NOT: { id: session.user.id },
      },
    });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(parsed.data.name && { name: parsed.data.name }),
      ...(parsed.data.email && { email: parsed.data.email.toLowerCase() }),
    },
    select: { id: true, name: true, email: true },
  });

  const clientInfo = getClientInfo(request);
  await createAuditLog({
    userId: session.user.id,
    action: "USER_UPDATED",
    resource: "user",
    resourceId: user.id,
    ...clientInfo,
  });

  return NextResponse.json({ user });
}
