"use client";

import type { TopicArticle } from "@/types";

interface TopicResultsProps {
  topic: string;
  articles: TopicArticle[];
  onSelectArticle: (url: string) => void;
}

const perspectiveStyles = {
  supporting: {
    badge: "bg-emerald-100 text-emerald-800",
    border: "border-emerald-200 hover:border-emerald-300",
  },
  opposing: {
    badge: "bg-orange-100 text-orange-800",
    border: "border-orange-200 hover:border-orange-300",
  },
  neutral: {
    badge: "bg-slate-100 text-slate-700",
    border: "border-slate-200 hover:border-slate-300",
  },
};

export default function TopicResults({
  topic,
  articles,
  onSelectArticle,
}: TopicResultsProps) {
  const supporting = articles.filter((a) => a.perspective === "supporting");
  const opposing = articles.filter((a) => a.perspective === "opposing");
  const neutral = articles.filter((a) => a.perspective === "neutral");

  const renderGroup = (
    label: string,
    groupArticles: TopicArticle[],
    perspective: "supporting" | "opposing" | "neutral"
  ) => {
    if (groupArticles.length === 0) return null;
    const styles = perspectiveStyles[perspective];

    return (
      <div>
        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {label} ({groupArticles.length})
        </h4>
        <div className="space-y-3">
          {groupArticles.map((article, i) => (
            <button
              key={i}
              onClick={() => onSelectArticle(article.url)}
              className={`w-full text-left p-4 rounded-lg border ${styles.border} bg-white hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h5 className="text-sm font-semibold text-slate-900 leading-snug">
                  {article.title}
                </h5>
                <span
                  className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${styles.badge}`}
                >
                  {article.stanceLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-1">{article.source}</p>
              <p className="text-sm text-slate-600">{article.stanceSummary}</p>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold text-slate-900 text-center mb-2">
        Articles on &ldquo;{topic}&rdquo;
      </h3>
      <p className="text-sm text-slate-500 text-center mb-8">
        Click any article for a full analysis
      </p>

      <div className="space-y-8">
        {renderGroup("Supporting", supporting, "supporting")}
        {renderGroup("Opposing", opposing, "opposing")}
        {renderGroup("Neutral", neutral, "neutral")}
      </div>
    </div>
  );
}