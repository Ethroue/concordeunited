import { NextRequest, NextResponse } from "next/server";
import { scrapeArticle } from "@/lib/scraper";
import { analyzeArticle } from "@/lib/groq";
import { findRelatedArticles } from "@/lib/newsapi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, text, apiKey } = body;

    if (!url && !text) {
      return NextResponse.json(
        { error: "Please provide either a URL or article text." },
        { status: 400 }
      );
    }

    let articleText: string;
    let articleTitle: string;
    let articleSource: string;

    if (url) {
      const scraped = await scrapeArticle(url);
      articleText = scraped.text;
      articleTitle = scraped.title;
      articleSource = scraped.source;
    } else {
      articleText = text;
      articleTitle = "Pasted Article";
      articleSource = "User Input";
    }

    const analysis = await analyzeArticle(articleText, apiKey);

    const keywords = [
      ...analysis.reasoningBreakdown.values.slice(0, 2),
      analysis.detectedStance.label,
      ...analysis.detectedStance.summary
        .split(" ")
        .filter((word) => word.length > 4)
        .slice(0, 3),
    ].join(" ");

    let relatedArticles: Array<{
      title: string;
      source: string;
      url: string;
      stanceLabel: string;
      stanceSummary: string;
      perspective: "supporting" | "opposing" | "neutral";
    }> = [];

    try {
      const related = await findRelatedArticles(keywords, url);
      relatedArticles = related.map((article) => ({
        title: article.title,
        source: article.source,
        url: article.url,
        stanceLabel: "pending",
        stanceSummary: article.description,
        perspective: "neutral" as const,
      }));
    } catch (relatedError) {
      console.error("Failed to fetch related articles:", relatedError);
    }

    return NextResponse.json({
      analysis,
      relatedArticles,
      articleTitle,
      articleSource,
    });
  } catch (error) {
    console.error("Analyze endpoint error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}