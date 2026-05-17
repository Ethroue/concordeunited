"use client";

import { useState, useEffect } from "react";
import type { AnalysisResult, RelatedArticle, TopicArticle } from "@/types";
import StanceCard from "@/components/StanceCard";
import PerspectivePanel from "@/components/PerspectivePanel";
import CommonGround from "@/components/CommonGround";
import TopicResults from "@/components/TopicResults";
import RelatedArticles from "@/components/RelatedArticles";
import SkeletonLoader from "@/components/SkeletonLoader";

type Mode = "article" | "topic";

interface ArticleResultData {
  analysis: AnalysisResult;
  relatedArticles: RelatedArticle[];
  articleTitle: string;
  articleSource: string;
}

interface TopicResultData {
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
  const [articleResult, setArticleResult] = useState<ArticleResultData | null>(null);
  const [topicResult, setTopicResult] = useState<TopicResultData | null>(null);
  const [dark, setDark] = useState(false);
  const [userApiKey, setUserApiKey] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [dark]);

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
            apiKey: userApiKey || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Analysis failed.");
        setArticleResult(data);
      } else {
        const res = await fetch("/api/topic-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: topicQuery.trim(),
            apiKey: userApiKey || undefined,
          }),
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
        body: JSON.stringify({
          url,
          apiKey: userApiKey || undefined,
        }),
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
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDark(!dark)}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
        aria-label="Toggle dark mode"
      >
        {dark ? "☀️" : "🌙"}
      </button>

      {/* Hero */}
      <section className="pt-16 pb-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            Concorde United
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            We don&apos;t tell you what to think — we show you how each side
            thinks, and why.
          </p>
        </div>
      </section>

      {/* Input Area */}
      <div className="max-w-2xl mx-auto px-6 pb-10">
        {/* API Key Input */}
        <div className="mb-4">
          <details className="text-left">
            <summary className="text-xs text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              ⚙️ Use your own Groq API key (optional)
            </summary>
            <div className="mt-2">
              <input
                type="password"
                placeholder="Paste your Groq API key here..."
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 transition-all text-sm"
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Get a free key at{" "}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-slate-600 dark:hover:text-slate-300"
                >
                  console.groq.com/keys
                </a>
              </p>
            </div>
          </details>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => { setMode("article"); setError(null); }}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${mode === "article" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              Paste Article
            </button>
            <button
              onClick={() => { setMode("topic"); setError(null); }}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${mode === "topic" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              Explore Topic
            </button>
          </div>
        </div>

        {/* Inputs */}
        {mode === "article" ? (
          <div className="space-y-3">
            <input
              type="url"
              placeholder="Paste an article URL..."
              value={articleUrl}
              onChange={(e) => setArticleUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 transition-all"
            />
            <div className="relative">
              <div className="absolute inset-x-0 top-0 flex justify-center -mt-3">
                <span className="bg-white dark:bg-slate-950 px-3 text-xs text-slate-400 uppercase tracking-wide">
                  or paste text
                </span>
              </div>
              <textarea
                placeholder="Paste the full article text here..."
                value={articleText}
                onChange={(e) => setArticleText(e.target.value)}
                rows={5}
                className="w-full px-4 py-4 pt-5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 transition-all resize-none"
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
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 transition-all"
          />
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-3 w-full py-3 rounded-lg bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-medium hover:bg-slate-700 dark:hover:bg-slate-300 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Analyzing..." : mode === "article" ? "Analyze Article" : "Explore Topic"}
        </button>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* AI Disclaimer */}
        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 text-center">
          Analysis is AI-generated and may reflect model biases. Use as a thinking tool, not a definitive source.
        </p>
      </div>

      {/* Skeleton Loading State */}
      {loading && (
        <div className="max-w-4xl mx-auto px-6 py-12">
          <SkeletonLoader mode={mode} />
        </div>
      )}

      {/* Article Results */}
      {articleResult && !loading && (
        <section className="max-w-4xl mx-auto px-6 pb-16 space-y-8 pt-8">
          <div className="text-center mb-6 animate-fadeIn">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {articleResult.articleTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Source: {articleResult.articleSource}
            </p>
          </div>

          <div className="animate-fadeIn">
            <StanceCard stance={articleResult.analysis.detectedStance} />
          </div>

          <div className="animate-fadeIn">
            <PerspectivePanel
              original={originalPerspective}
              alternatives={articleResult.analysis.alternativePerspectives}
              reasoning={articleResult.analysis.reasoningBreakdown}
            />
          </div>

          <div className="animate-fadeIn">
            <CommonGround points={articleResult.analysis.commonGround} />
          </div>

          {articleResult.relatedArticles.length > 0 && (
            <div className="animate-fadeIn">
              <RelatedArticles articles={articleResult.relatedArticles} />
            </div>
          )}
        </section>
      )}

      {/* Topic Results */}
      {topicResult && !loading && (
        <section className="max-w-4xl mx-auto px-6 pb-16 pt-8 animate-fadeIn">
          <TopicResults
            topic={topicResult.topic}
            articles={topicResult.articles}
            onSelectArticle={handleTopicArticleSelect}
          />
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800 py-10 mt-8">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-2">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Concorde United — Understanding is the antidote to polarization.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Built for hackathon by Concorde United &bull; Powered by Groq &amp; NewsAPI
          </p>
        </div>
      </footer>
    </main>
  );
}