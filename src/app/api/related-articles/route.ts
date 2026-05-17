import { NextRequest, NextResponse } from "next/server";
import { findRelatedArticles } from "@/lib/newsapi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords, excludeUrl } = body;

    if (!keywords || typeof keywords !== "string" || keywords.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide keywords to search for related articles." },
        { status: 400 }
      );
    }

    const articles = await findRelatedArticles(keywords.trim(), excludeUrl);

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Related articles endpoint error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}