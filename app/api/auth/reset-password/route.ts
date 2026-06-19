import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateResetToken, getResetTokenExpiry, hashPassword } from "@/lib/auth/password";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations";
import { createAuditLog, getClientInfo } from "@/lib/audit";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "request";

    if (action === "request") {
      const parsed = forgotPasswordSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
      });

      // Always return success to prevent email enumeration
      if (user) {
        const token = generateResetToken();
        await prisma.passwordReset.create({
          data: {
            userId: user.id,
            token,
            expiresAt: getResetTokenExpiry(),
          },
        });

        logger.info("Password reset token created", { userId: user.id });
        // In production: send email with reset link containing token
      }

      return NextResponse.json({
        message: "If an account exists, a reset link has been sent.",
      });
    }

    if (action === "reset") {
      const parsed = resetPasswordSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid reset data", details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const resetRecord = await prisma.passwordReset.findUnique({
        where: { token: parsed.data.token },
        include: { user: true },
      });

      if (
        !resetRecord ||
        resetRecord.usedAt ||
        resetRecord.expiresAt < new Date()
      ) {
        return NextResponse.json(
          { error: "Invalid or expired reset token" },
          { status: 400 }
        );
      }

      const passwordHash = await hashPassword(parsed.data.password);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetRecord.userId },
          data: { passwordHash },
        }),
        prisma.passwordReset.update({
          where: { id: resetRecord.id },
          data: { usedAt: new Date() },
        }),
      ]);

      const clientInfo = getClientInfo(request);
      await createAuditLog({
        userId: resetRecord.userId,
        action: "PASSWORD_RESET",
        resource: "user",
        resourceId: resetRecord.userId,
        ...clientInfo,
      });

      return NextResponse.json({ message: "Password reset successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    logger.error("Password reset failed", error as Error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
