import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Types
export interface DetectedStance {
  label: string;
  confidence: number;
  summary: string;
}

export interface ReasoningBreakdown {
  values: string[];
  evidenceEmphasized: string[];
  evidenceOmitted: string[];
  assumptions: string[];
  logicChain: string;
}

export interface AlternativePerspective {
  label: string;
  summary: string;
  values: string[];
  logicChain: string;
}

export interface AnalysisResult {
  detectedStance: DetectedStance;
  reasoningBreakdown: ReasoningBreakdown;
  alternativePerspectives: AlternativePerspective[];
  commonGround: string[];
}

export interface TopicArticleAnalysis {
  title: string;
  source: string;
  url: string;
  stanceLabel: string;
  stanceSummary: string;
  perspective: "supporting" | "opposing" | "neutral";
}

// Analyze a single article
export async function analyzeArticle(articleText: string): Promise<AnalysisResult> {
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: `You are a nonpartisan political analyst. Given a news article, you must:
1. Identify the political stance/framing (e.g., progressive, conservative, libertarian, centrist, populist). Provide a one-word label and a confidence percentage.
2. Explain the reasoning chain: what values, priorities, and assumptions lead to this framing. What evidence does the article emphasize? What does it omit?
3. Generate 2-3 alternative perspective analyses — steelmanned, fair representations of how other political viewpoints would interpret the same event. For each, explain the values and logic that drive that interpretation.
4. Identify common ground: 2-3 points where most perspectives agree on facts or shared values.

Return your analysis as a JSON object with this exact shape:
{
  "detectedStance": { "label": string, "confidence": number, "summary": string },
  "reasoningBreakdown": { "values": string[], "evidenceEmphasized": string[], "evidenceOmitted": string[], "assumptions": string[], "logicChain": string },
  "alternativePerspectives": [{ "label": string, "summary": string, "values": string[], "logicChain": string }],
  "commonGround": string[]
}

Return ONLY the JSON object, no other text.`,
      messages: [
        {
          role: "user",
          content: `Analyze the following news article:\n\n${articleText}`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : responseText.trim();

    const result: AnalysisResult = JSON.parse(jsonString);
    return result;
  } catch (error) {
    console.error("Error analyzing article:", error);
    throw new Error(
      `Failed to analyze article: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Analyze multiple articles for a topic
export async function analyzeTopicArticles(
  topic: string,
  articles: { title: string; source: string; description: string; url: string }[]
): Promise<TopicArticleAnalysis[]> {
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: `You are a nonpartisan political analyst. Given a topic and a list of news articles (with title, source, and description), analyze each article's likely political stance based on the information provided.

For each article, return a JSON object with:
- "title": the article title
- "source": the article source
- "url": the article URL
- "stanceLabel": a one-word political stance label (e.g., progressive, conservative, libertarian, centrist, populist)
- "stanceSummary": a brief 1-2 sentence summary of the article's likely framing/angle
- "perspective": one of "supporting", "opposing", or "neutral" relative to the topic

Return ONLY a JSON array of these objects, no other text.`,
      messages: [
        {
          role: "user",
          content: `Topic: "${topic}"\n\nArticles:\n${JSON.stringify(articles, null, 2)}`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : responseText.trim();

    const result: TopicArticleAnalysis[] = JSON.parse(jsonString);
    return result;
  } catch (error) {
    console.error("Error analyzing topic articles:", error);
    throw new Error(
      `Failed to analyze topic articles: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}