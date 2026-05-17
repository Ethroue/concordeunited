import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeArticle(
  url: string
): Promise<{ title: string; text: string; source: string }> {
  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(`Invalid URL: "${url}". Please provide a valid article URL.`);
  }

  const source = parsedUrl.hostname.replace("www.", "");

  // Fetch the HTML
  let html: string;
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      timeout: 15000,
      maxRedirects: 5,
    });
    html = response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 403) {
        throw new Error(
          `Access denied (403) when fetching "${source}". The site may block automated requests.`
        );
      } else if (status === 404) {
        throw new Error(
          `Article not found (404) at "${url}". The page may have been removed.`
        );
      } else if (error.code === "ECONNABORTED") {
        throw new Error(
          `Request timed out when fetching "${url}". The site may be slow or unavailable.`
        );
      }
      throw new Error(
        `Failed to fetch article from "${source}": ${error.message}`
      );
    }
    throw new Error(`Unexpected error fetching "${url}".`);
  }

  const $ = cheerio.load(html);

  // Extract title — try multiple selectors in priority order
  let title =
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $("title").first().text().trim() ||
    "Untitled Article";

  // Clean up title (remove site name suffixes like " - CNN" or " | NYT")
  title = title.replace(/\s*[|\-–—]\s*[^|\-–—]+$/, "").trim() || title;

  // Extract article body text — try selectors in priority order
  const bodySelectors = [
    "article",
    '[role="article"]',
    ".article-body",
    ".story-body",
    ".post-content",
    ".entry-content",
    "[data-article-body]",
    ".article-content",
    ".story-content",
    ".post-body",
    ".article__body",
    "#article-body",
    ".content-body",
  ];

  let text = "";

  for (const selector of bodySelectors) {
    const element = $(selector);
    if (element.length > 0) {
      // Remove unwanted elements inside the article body
      element
        .find(
          "script, style, nav, header, footer, aside, .ad, .advertisement, .social-share, .related-articles, figure figcaption"
        )
        .remove();

      // Get text from paragraphs within the matched element
      const paragraphs: string[] = [];
      element.find("p").each((_, el) => {
        const pText = $(el).text().trim();
        if (pText.length > 20) {
          paragraphs.push(pText);
        }
      });

      if (paragraphs.length > 0) {
        text = paragraphs.join("\n\n");
        break;
      }
    }
  }

  // Fallback: grab all <p> tags from the page
  if (!text) {
    const paragraphs: string[] = [];
    $("p").each((_, el) => {
      const pText = $(el).text().trim();
      if (pText.length > 20) {
        paragraphs.push(pText);
      }
    });
    text = paragraphs.join("\n\n");
  }

  if (!text) {
    throw new Error(
      `No article content found at "${url}". The page may require JavaScript to render or may not be a standard article.`
    );
  }

  // Clean up whitespace
  text = text
    .replace(/\s+/g, " ")
    .replace(/ \n /g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Limit text length to stay within Claude's context window
  if (text.length > 15000) {
    text = text.substring(0, 15000) + "\n\n[Article truncated due to length]";
  }

  return { title, text, source };
}

export async function scrapeSocialPost(url: string): Promise<{ title: string; source: string; text: string }> {
  let source = "Social Media";

  if (/twitter\.com|x\.com/.test(url)) source = "X (Twitter)";
  else if (/instagram\.com/.test(url)) source = "Instagram";
  else if (/facebook\.com/.test(url)) source = "Facebook";
  else if (/threads\.net/.test(url)) source = "Threads";
  else if (/reddit\.com/.test(url)) source = "Reddit";
  else if (/tiktok\.com/.test(url)) source = "TikTok";

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // Remove scripts and styles
    $("script, style, nav, footer, header").remove();

    // Try common meta tags for social content
    const ogDescription = $('meta[property="og:description"]').attr("content") || "";
    const ogTitle = $('meta[property="og:title"]').attr("content") || "";
    const twitterDescription = $('meta[name="twitter:description"]').attr("content") || "";
    const title = ogTitle || $("title").text().trim() || "Social Media Post";

    // Get page text as fallback
    const bodyText = $("article, main, [role='main'], .post, .content, p")
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const text = ogDescription || twitterDescription || bodyText;

    if (!text || text.length < 20) {
      throw new Error(
        `Could not extract enough text from ${source}. Social media posts are often loaded dynamically. Try copying and pasting the post text directly.`
      );
    }

    return { title, source, text: text.slice(0, 15000) };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Could not extract")) {
      throw error;
    }
    throw new Error(
      `Failed to scrape ${source} post. Most social media blocks automated access. Please copy and paste the post text directly.`
    );
  }
}

