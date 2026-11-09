import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/authorization";
export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const query = body.query?.trim();

    if (!query) {
      return NextResponse.json(
        { success: false, message: "Search query is required" },
        { status: 400 }
      );
    }

    const response = await fetch("http://127.0.0.1:8000/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      cache: "no-store",
    });

    const result = await response.json();

    return NextResponse.json(result, {
      status: response.status,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    console.error("Semantic search error:", error);

    return NextResponse.json(
      { success: false, message: "Semantic search service unavailable" },
      { status: 503 }
    );
  }
}
