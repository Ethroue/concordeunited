"use client";

import type { TopicArticle } from "@/types";

interface TopicResultsProps {
  topic: string;
  articles: TopicArticle[];
  onSelectArticle: (url: string) => void;
}

const perspectiveStyles = {
  supporting: {
    badge: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-600",
  },
  opposing: {
    badge: "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-600",
  },
  neutral: {
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
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
        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          {label} ({groupArticles.length})
        </h4>
        <div className="space-y-3">
          {groupArticles.map((article, i) => (
            <button
              key={i}
              onClick={() => onSelectArticle(article.url)}
              className={`w-full text-left p-4 rounded-lg border ${styles.border} bg-white dark:bg-slate-900 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h5 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                  {article.title}
                </h5>
                <span
                  className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${styles.badge}`}
                >
                  {article.stanceLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{article.source}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{article.stanceSummary}</p>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold text-slate-900 dark:text-white text-center mb-2">
        Articles on &ldquo;{topic}&rdquo;
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8">
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