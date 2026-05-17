import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface AnalysisResult {
  detectedStance: {
    label: string;
    confidence: number;
    summary: string;
  };
  reasoningBreakdown: {
    values: string[];
    evidenceEmphasized: string[];
    evidenceOmitted: string[];
    assumptions: string[];
    logicChain: string;
  };
  alternativePerspectives: Array<{
    label: string;
    summary: string;
    values: string[];
    logicChain: string;
  }>;
  commonGround: string[];
}

interface TopicArticleInput {
  title: string;
  source: string;
  description: string;
  url: string;
}

interface StancedArticle {
  title: string;
  source: string;
  url: string;
  stanceLabel: string;
  stanceSummary: string;
  perspective: "supporting" | "opposing" | "neutral";
}

export async function analyzeArticle(articleText: string): Promise<AnalysisResult> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is not set.");
  }

  const prompt = `You are a nonpartisan media analysis AI. Analyze the following article text and return a JSON object with this exact structure (no markdown, no code fences, just raw JSON):

{
  "detectedStance": {
    "label": "string - the political/ideological stance detected (e.g., 'Center-Left', 'Conservative', 'Libertarian', 'Progressive', etc.)",
    "confidence": number between 0 and 100,
    "summary": "string - 2-3 sentence summary of the article's position"
  },
  "reasoningBreakdown": {
    "values": ["list of core values/priorities the article emphasizes"],
    "evidenceEmphasized": ["list of evidence/facts the article highlights"],
    "evidenceOmitted": ["list of relevant evidence/facts the article does not mention"],
    "assumptions": ["list of underlying assumptions in the article's argument"],
    "logicChain": "string - describe the logical flow: premise -> reasoning -> conclusion"
  },
  "alternativePerspectives": [
    {
      "label": "string - name of an alternative political/ideological perspective",
      "summary": "string - how this perspective would view the same topic",
      "values": ["list of values this perspective prioritizes"],
      "logicChain": "string - how this perspective's logic differs"
    }
  ],
  "commonGround": ["list of points that most perspectives would agree on"]
}

Provide 2-3 alternative perspectives. Be fair and balanced. Do not favor any political side.

Article text:
${articleText.slice(0, 15000)}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 4000,
    });

    const text = chatCompletion.choices[0]?.message?.content || "";
    const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed: AnalysisResult = JSON.parse(cleanedText);
    return parsed;
  } catch (error) {
    throw new Error(
      `Failed to analyze article: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function analyzeTopicArticles(
  topic: string,
  articles: TopicArticleInput[]
): Promise<StancedArticle[]> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is not set.");
  }

  const articlesText = articles
    .map(
      (a, i) =>
        `${i + 1}. Title: "${a.title}" | Source: ${a.source} | Description: "${a.description}" | URL: ${a.url}`
    )
    .join("\n");

  const prompt = `You are a nonpartisan media analysis AI. Given the topic "${topic}" and the following articles, classify each article's stance. Return a JSON array (no markdown, no code fences, just raw JSON) where each element has:

{
  "title": "string - article title",
  "source": "string - source name",
  "url": "string - article URL",
  "stanceLabel": "string - short stance label (e.g., 'Pro-Reform', 'Anti-Regulation', 'Neutral Coverage')",
  "stanceSummary": "string - 1-2 sentence summary of the article's angle",
  "perspective": "supporting" | "opposing" | "neutral"
}

"perspective" should reflect whether the article generally supports, opposes, or neutrally covers the topic.

Articles:
${articlesText}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 4000,
    });

    const text = chatCompletion.choices[0]?.message?.content || "";
    const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed: StancedArticle[] = JSON.parse(cleanedText);
    return parsed;
  } catch (error) {
    throw new Error(
      `Failed to analyze topic articles: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}