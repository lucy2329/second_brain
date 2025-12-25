import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser, AuthenticationError } from "@/lib/auth";
import { registerSnapTradeUser } from "@/lib/snaptrade";

export async function POST() {
  try {
    const userId = await getAuthenticatedUser();

    // Check if user already exists in SnapTrade
    let snapUser = await prisma.snapTradeUser.findUnique({
      where: { userId },
    });

    if (!snapUser) {
      // Register with SnapTrade
      // snaptrade-typescript-sdk's registerSnapTradeUser returns UserIDandSecret
      const registration = await registerSnapTradeUser(userId);
      
      if (!registration.userId || !registration.userSecret) {
        throw new Error("Invalid registration response from SnapTrade");
      }

      // Store in DB
      snapUser = await prisma.snapTradeUser.create({
        data: {
          userId,
          snapUserId: registration.userId,
          userSecret: registration.userSecret,
        },
      });
    }

    return NextResponse.json({
      success: true,
      snapUserId: snapUser.snapUserId,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error in SnapTrade registration:", error);
    return NextResponse.json(
      { error: "Failed to register SnapTrade user" },
      { status: 500 }
    );
  }
}
