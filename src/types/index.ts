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

export interface PoliticalAlignment {
  party: string;
  stance: string;
  keyPoints: string[];
}

export interface AnalysisResult {
  detectedStance: DetectedStance;
  reasoningBreakdown: ReasoningBreakdown;
  alternativePerspectives: AlternativePerspective[];
  commonGround: string[];
  politicalAlignments: PoliticalAlignment[];
}

export interface RelatedArticle {
  title: string;
  source: string;
  url: string;
  stanceLabel: string;
  stanceSummary: string;
  perspective: "supporting" | "opposing" | "neutral";
}

export interface TopicArticle {
  title: string;
  source: string;
  url: string;
  stanceLabel: string;
  stanceSummary: string;
  perspective: "supporting" | "opposing" | "neutral";
  publishedAt: string;
}