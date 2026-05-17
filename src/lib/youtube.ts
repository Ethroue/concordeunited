import { YoutubeTranscript } from "youtube-transcript";

interface YouTubeTranscriptResult {
  title: string;
  source: string;
  text: string;
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function getVideoTitle(videoId: string): Promise<string> {
  try {
    const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    const data = await response.json();
    return data.title || "YouTube Video";
  } catch {
    return "YouTube Video";
  }
}

export async function getYouTubeTranscript(url: string): Promise<YouTubeTranscriptResult> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL. Please provide a valid YouTube video link.");
  }

  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptItems || transcriptItems.length === 0) {
      throw new Error(
        "No captions/transcript available for this video. The video may not have captions enabled. Try pasting the content manually."
      );
    }

    const transcriptText = transcriptItems
      .map((item) => item.text)
      .join(" ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();

    if (transcriptText.length < 20) {
      throw new Error(
        "Transcript is too short to analyze. Try pasting the content manually."
      );
    }

    const title = await getVideoTitle(videoId);

    return {
      title,
      source: "YouTube",
      text: transcriptText.slice(0, 15000),
    };
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw our own errors
      if (error.message.includes("No captions") || error.message.includes("too short")) {
        throw error;
      }
      // Library errors
      if (error.message.includes("disabled") || error.message.includes("Transcript")) {
        throw new Error(
          "Transcripts are disabled for this video. Try pasting the content manually."
        );
      }
      throw new Error(
        `Failed to get YouTube transcript: ${error.message}. Try pasting the content manually.`
      );
    }
    throw new Error(
      "Failed to get YouTube transcript. Try pasting the content manually."
    );
  }
}

export function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/.test(url);
}

export function isSocialMediaUrl(url: string): boolean {
  return /(?:twitter\.com|x\.com|instagram\.com|facebook\.com|threads\.net|reddit\.com|tiktok\.com)/.test(url);
}