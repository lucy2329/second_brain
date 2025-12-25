import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser, AuthenticationError } from "@/lib/auth";
import { getConnectionPortalUrl } from "@/lib/snaptrade";

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const { origin } = new URL(request.url);

    const snapUser = await prisma.snapTradeUser.findUnique({
      where: { userId },
    });

    if (!snapUser) {
      return NextResponse.json(
        { error: "SnapTrade user not registered. Please register first." },
        { status: 404 }
      );
    }

    // Redirect to a callback route that will trigger sync then go to finances
    const returnUrl = `${origin}/api/snaptrade/callback`;

    const redirectUrl = await getConnectionPortalUrl(
      snapUser.snapUserId,
      snapUser.userSecret,
      returnUrl
    );

    return NextResponse.json({ redirectUrl });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error getting SnapTrade login URL:", error);
    return NextResponse.json(
      { error: "Failed to generate connection URL" },
      { status: 500 }
    );
  }
}
