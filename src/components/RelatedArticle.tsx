"use client";

import type { RelatedArticle } from "@/types";

interface RelatedArticlesProps {
  articles: RelatedArticle[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  const supporting = articles.filter((a) => a.perspective === "supporting");
  const opposing = articles.filter((a) => a.perspective === "opposing");
  const neutral = articles.filter((a) => a.perspective === "neutral");

  const renderCard = (article: RelatedArticle, i: number) => (
    <a
      key={i}
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-lg border border-slate-200 bg-white hover:shadow-md hover:border-slate-300 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h5 className="text-sm font-semibold text-slate-900 leading-snug">
          {article.title}
        </h5>
        <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
          {article.stanceLabel}
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-1">{article.source}</p>
      <p className="text-sm text-slate-600">{article.stanceSummary}</p>
    </a>
  );

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Related Articles
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supporting Column */}
        <div>
          <h4 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-3">
            Supporting Perspectives
          </h4>
          {supporting.length > 0 ? (
            <div className="space-y-3">
              {supporting.map((a, i) => renderCard(a, i))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">None found</p>
          )}
        </div>

        {/* Opposing Column */}
        <div>
          <h4 className="text-sm font-semibold text-orange-700 uppercase tracking-wide mb-3">
            Opposing Perspectives
          </h4>
          {opposing.length > 0 ? (
            <div className="space-y-3">
              {opposing.map((a, i) => renderCard(a, i))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">None found</p>
          )}
        </div>
      </div>

      {/* Neutral row if any */}
      {neutral.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Neutral Coverage
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {neutral.map((a, i) => renderCard(a, i))}
          </div>
        </div>
      )}
    </div>
  );
}