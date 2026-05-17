import { NextRequest, NextResponse } from "next/server";
import { searchArticlesByTopic } from "@/lib/newsapi";
import { analyzeTopicArticles } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic } = body;

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide a topic to search." },
        { status: 400 }
      );
    }

    // Search for articles on the topic
    const rawArticles = await searchArticlesByTopic(topic.trim(), 10);

    if (rawArticles.length === 0) {
      return NextResponse.json(
        { error: `No articles found for topic: "${topic}"` },
        { status: 404 }
      );
    }

    // Analyze each article's stance with Claude
    const stancedArticles = await analyzeTopicArticles(
      topic,
      rawArticles.map((a) => ({
        title: a.title,
        source: a.source,
        description: a.description,
        url: a.url,
      }))
    );

    // Merge publishedAt from raw articles into the stanced results
    const articles = stancedArticles.map((stanced) => {
      const raw = rawArticles.find((r) => r.url === stanced.url);
      return {
        ...stanced,
        publishedAt: raw?.publishedAt || "",
      };
    });

    return NextResponse.json({ topic, articles });
  } catch (error) {
    console.error("Topic search endpoint error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}