"use client";

import { useState } from "react";
import type { AnalysisResult, RelatedArticle, TopicArticle } from "@/types";
import StanceCard from "@/components/StanceCard";
import PerspectivePanel from "@/components/PerspectivePanel";
import CommonGround from "@/components/CommonGround";
import TopicResults from "@/components/TopicResults";
import RelatedArticles from "@/components/RelatedArticles";

type Mode = "article" | "topic";

interface ArticleResult {
  analysis: AnalysisResult;
  relatedArticles: RelatedArticle[];
  articleTitle: string;
  articleSource: string;
}

interface TopicResult {
  topic: string;
  articles: TopicArticle[];
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("article");
  const [articleUrl, setArticleUrl] = useState("");
  const [articleText, setArticleText] = useState("");
  const [topicQuery, setTopicQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articleResult, setArticleResult] = useState<ArticleResult | null>(null);
  const [topicResult, setTopicResult] = useState<TopicResult | null>(null);

  const handleAnalyze = async () => {
    if (mode === "article" && !articleUrl && !articleText) {
      setError("Please provide an article URL or paste article text.");
      return;
    }
    if (mode === "topic" && !topicQuery.trim()) {
      setError("Please enter a topic to explore.");
      return;
    }

    setLoading(true);
    setError(null);
    setArticleResult(null);
    setTopicResult(null);

    try {
      if (mode === "article") {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: articleUrl || undefined,
            text: articleText || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Analysis failed.");
        setArticleResult(data);
      } else {
        const res = await fetch("/api/topic-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: topicQuery.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Topic search failed.");
        setTopicResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleTopicArticleSelect = async (url: string) => {
    setMode("article");
    setArticleUrl(url);
    setArticleText("");
    setTopicResult(null);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      setArticleResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const originalPerspective = articleResult
    ? {
        label: articleResult.analysis.detectedStance.label,
        logicChain: articleResult.analysis.reasoningBreakdown.logicChain,
        values: articleResult.analysis.reasoningBreakdown.values,
      }
    : { label: "", logicChain: "", values: [] as string[] };

  return (
    <main className="min-h-screen bg-white text-slate-800">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-10 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-3">
          Concorde United
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10">
          We don&apos;t tell you what to think — we show you how each side
          thinks, and why.
        </p>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => {
                setMode("article");
                setError(null);
              }}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                mode === "article"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Paste Article
            </button>
            <button
              onClick={() => {
                setMode("topic");
                setError(null);
              }}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                mode === "topic"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Explore Topic
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="max-w-2xl mx-auto">
          {mode === "article" ? (
            <div className="space-y-3">
              <input
                type="url"
                placeholder="Paste an article URL..."
                value={articleUrl}
                onChange={(e) => setArticleUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent transition-all"
              />
              <div className="relative">
                <div className="absolute inset-x-0 top-0 flex justify-center -mt-3">
                  <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wide">
                    or paste text
                  </span>
                </div>
                <textarea
                  placeholder="Paste the full article text here..."
                  value={articleText}
                  onChange={(e) => setArticleText(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-4 pt-5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          ) : (
            <input
              type="text"
              placeholder='Search a topic (e.g., "immigration reform", "student loan forgiveness")'
              value={topicQuery}
              onChange={(e) => setTopicQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent transition-all"
            />
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-4 w-full py-3 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
          >
            {loading
              ? "Analyzing..."
              : mode === "article"
                ? "Analyze Article"
                : "Explore Topic"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 max-w-2xl mx-auto p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
      </section>

      {/* Loading Animation */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-3 h-3 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-3 h-3 rounded-full bg-slate-400 animate-bounce" />
          </div>
        </div>
      )}

      {/* Article Results */}
      {articleResult && !loading && (
        <section className="max-w-4xl mx-auto px-6 pb-16 space-y-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              {articleResult.articleTitle}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Source: {articleResult.articleSource}
            </p>
          </div>

          <StanceCard stance={articleResult.analysis.detectedStance} />

          <PerspectivePanel
            original={originalPerspective}
            alternatives={articleResult.analysis.alternativePerspectives}
            reasoning={articleResult.analysis.reasoningBreakdown}
          />

          <CommonGround points={articleResult.analysis.commonGround} />

          {articleResult.relatedArticles.length > 0 && (
            <RelatedArticles articles={articleResult.relatedArticles} />
          )}
        </section>
      )}

      {/* Topic Results */}
      {topicResult && !loading && (
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <TopicResults
            topic={topicResult.topic}
            articles={topicResult.articles}
            onSelectArticle={handleTopicArticleSelect}
          />
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        <p>
          Concorde United — Understanding is the antidote to polarization.
        </p>
      </footer>
    </main>
  );
}