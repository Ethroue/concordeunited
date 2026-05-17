import { NextRequest, NextResponse } from "next/server";
import { scrapeArticle } from "@/lib/scraper";
import { getYouTubeTranscript, isYouTubeUrl } from "@/lib/youtube";
import { analyzeArticle } from "@/lib/groq";
import { findRelatedArticles } from "@/lib/newsapi";

const SOCIAL_DOMAINS: Record<string, string> = {
  "twitter.com": "X (Twitter)",
  "x.com": "X (Twitter)",
  "instagram.com": "Instagram",
  "facebook.com": "Facebook",
  "threads.net": "Threads",
  "reddit.com": "Reddit",
  "tiktok.com": "TikTok",
  "truthsocial.com": "Truth Social",
  "mastodon.social": "Mastodon",
  "bsky.app": "Bluesky",
  "linkedin.com": "LinkedIn",
};

function detectSocialPlatform(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    for (const [domain, name] of Object.entries(SOCIAL_DOMAINS)) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        return name;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, text, apiKey, newsApiKey } = body;

    if (!url && !text) {
      return NextResponse.json(
        { error: "Please provide a URL or paste content to analyze." },
        { status: 400 }
      );
    }

    let articleText: string;
    let articleTitle: string;
    let articleSource: string;

    if (url) {
      const socialPlatform = detectSocialPlatform(url);

      if (isYouTubeUrl(url)) {
        const yt = await getYouTubeTranscript(url);
        articleText = yt.text;
        articleTitle = yt.title;
        articleSource = yt.source;
      } else if (socialPlatform) {
        return NextResponse.json(
          {
            error: `${socialPlatform} doesn't allow automated reading of posts. Please copy the post text and paste it in the text box instead.`,
          },
          { status: 422 }
        );
      } else {
        const scraped = await scrapeArticle(url);
        articleText = scraped.text;
        articleTitle = scraped.title;
        articleSource = scraped.source;
      }
    } else {
      articleText = text;
      articleTitle = "Pasted Content";
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
      const related = await findRelatedArticles(keywords, url, newsApiKey);
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