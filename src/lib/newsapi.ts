import axios from "axios";

interface NewsArticle {
  title: string;
  source: string;
  description: string;
  url: string;
  publishedAt: string;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: Array<{
    title: string | null;
    source: { id: string | null; name: string };
    description: string | null;
    url: string;
    publishedAt: string;
  }>;
}

export async function searchArticlesByTopic(
  topic: string,
  pageSize: number = 10,
  userApiKey?: string
): Promise<NewsArticle[]> {
  const apiKey = userApiKey || process.env.NEWS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Please enter your NewsAPI key in the 📰 News field (top left). Get a free key at newsapi.org/register"
    );
  }

  try {
    const response = await axios.get<NewsAPIResponse>(
      "https://newsapi.org/v2/everything",
      {
        params: {
          q: topic,
          sortBy: "relevancy",
          pageSize,
          language: "en",
          apiKey,
        },
        timeout: 10000,
      }
    );

    if (response.data.status !== "ok") {
      throw new Error(`NewsAPI returned status: ${response.data.status}`);
    }

    return response.data.articles
      .filter((article) => article.title && article.url && article.description)
      .map((article) => ({
        title: article.title || "Untitled",
        source: article.source.name,
        description: article.description || "",
        url: article.url,
        publishedAt: article.publishedAt,
      }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401) {
        throw new Error(
          "Invalid NewsAPI key. Please check your key in the 📰 News field (top left)."
        );
      } else if (status === 429) {
        throw new Error("NewsAPI rate limit exceeded. Try again later.");
      }
      throw new Error(`NewsAPI request failed: ${error.message}`);
    }
    throw new Error(
      `Failed to search articles: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function findRelatedArticles(
  keywords: string,
  excludeUrl?: string,
  userApiKey?: string
): Promise<NewsArticle[]> {
  const apiKey = userApiKey || process.env.NEWS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Please enter your NewsAPI key in the 📰 News field (top left). Get a free key at newsapi.org/register"
    );
  }

  try {
    const response = await axios.get<NewsAPIResponse>(
      "https://newsapi.org/v2/everything",
      {
        params: {
          q: keywords,
          sortBy: "relevancy",
          pageSize: 10,
          language: "en",
          apiKey,
        },
        timeout: 10000,
      }
    );

    if (response.data.status !== "ok") {
      throw new Error(`NewsAPI returned status: ${response.data.status}`);
    }

    return response.data.articles
      .filter(
        (article) =>
          article.title &&
          article.url &&
          article.description &&
          article.url !== excludeUrl
      )
      .slice(0, 8)
      .map((article) => ({
        title: article.title || "Untitled",
        source: article.source.name,
        description: article.description || "",
        url: article.url,
        publishedAt: article.publishedAt,
      }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401) {
        throw new Error(
          "Invalid NewsAPI key. Please check your key in the 📰 News field (top left)."
        );
      } else if (status === 429) {
        throw new Error("NewsAPI rate limit exceeded. Try again later.");
      }
      throw new Error(`NewsAPI request failed: ${error.message}`);
    }
    throw new Error(
      `Failed to find related articles: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}