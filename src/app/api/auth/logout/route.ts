import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/session";

export async function POST() {
  try {
    await deleteSession();

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Logout failed" },
      { status: 500 }
    );
  }
}
