import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  
  // Redirect back to finances with a flag to trigger the initial sync
  return NextResponse.redirect(`${origin}/finances?snaptrade_sync=true`);
}
