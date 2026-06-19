import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { registerSchema } from "@/lib/validations";
import { createAuditLog, getClientInfo } from "@/lib/audit";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const orgSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
    const organization = await prisma.organization.create({
      data: {
        name: `${name}'s Organization`,
        slug: `${orgSlug}-${Date.now().toString(36)}`,
        subscription: {
          create: {
            plan: "FREE",
            status: "TRIAL",
            searchesLimit: 50,
          },
        },
      },
    });

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        organizationId: organization.id,
      },
      select: { id: true, email: true, name: true },
    });

    const clientInfo = getClientInfo(request);
    await createAuditLog({
      userId: user.id,
      action: "LOGIN",
      resource: "user",
      resourceId: user.id,
      metadata: { action: "registration" },
      ...clientInfo,
    });

    logger.info("User registered", { userId: user.id });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    logger.error("Registration failed", error as Error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
