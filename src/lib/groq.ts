import Groq from "groq-sdk";

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
  politicalAlignments: Array<{
    party: string;
    stance: string;
    keyPoints: string[];
  }>;
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

export async function analyzeArticle(articleText: string, apiKey?: string): Promise<AnalysisResult> {
  if (!apiKey) {
  throw new Error("Please enter your Groq API key in the ⚙️ settings menu (top right) to use this app. Get a free key at console.groq.com/keys");
  }
const key = apiKey;

  const client = new Groq({ apiKey: key });

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
  "commonGround": ["list of points that most perspectives would agree on"],
  "politicalAlignments": [
    {
      "party": "string - political party or ideology name (e.g., 'Republican Party', 'Democratic Party', 'Libertarian', 'Democratic Socialists', 'Green Party', etc.)",
      "stance": "string - one sentence describing this party/ideology's position on the article's topic",
      "keyPoints": ["list of 2-3 specific policy positions or values this party holds on this topic"]
    }
  ]
}

Provide 2-3 alternative perspectives. For politicalAlignments, include 3-5 major U.S. political parties or ideologies and explain how each would view the article's topic. Include both major parties and at least one third-party or independent ideology. Follow these rules strictly:
- Be fair and balanced. Do not favor any political side.
- Do not use loaded or pejorative language. Describe all perspectives with equal respect and nuance.
- When labeling stances, use neutral descriptors (e.g., "Pro-regulation" not "Big government", "Traditional values" not "Regressive").
- Ensure alternative perspectives are presented with the same depth and charity as the detected stance.
- Avoid framing any perspective as the "default" or "common sense" position.
- When listing evidence omitted, apply equal scrutiny to all sides — do not disproportionately flag omissions from one ideology.
- Confidence scores should reflect how clearly the article expresses a stance, not how "correct" the stance is.
- For politicalAlignments, represent each party's ACTUAL stated positions, not caricatures. Use official platform positions when possible.

Article text:
${articleText.slice(0, 15000)}`;

  try {
    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 5000,
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
  articles: TopicArticleInput[],
  apiKey?: string
): Promise<StancedArticle[]> {
  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("No API key provided. Please enter your Groq API key or set GROQ_API_KEY in .env.local.");
  }

  const client = new Groq({ apiKey: key });

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

Follow these rules strictly:
- Use neutral, non-judgmental language for all stance labels and summaries.
- Do not frame any perspective as more legitimate or reasonable than another.
- Apply the same depth of analysis to articles from all political orientations.
- Avoid asymmetric labeling (e.g., don't use "Pro-freedom" for one side and "Anti-safety" for the other — use parallel framing like "Pro-deregulation" and "Pro-regulation").

Articles:
${articlesText}`;

  try {
    const chatCompletion = await client.chat.completions.create({
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