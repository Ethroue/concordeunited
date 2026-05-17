"use client";

import type { AlternativePerspective, ReasoningBreakdown } from "@/types";

interface PerspectivePanelProps {
  original: {
    label: string;
    logicChain: string;
    values: string[];
  };
  alternatives: AlternativePerspective[];
  reasoning: ReasoningBreakdown;
}

export default function PerspectivePanel({
  original,
  alternatives,
  reasoning,
}: PerspectivePanelProps) {
  return (
    <div className="space-y-6">
      {/* Original Article Reasoning */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 transition-colors">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Reasoning Breakdown —{" "}
          <span className="text-slate-600 dark:text-slate-400">{original.label}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Values & Priorities
            </h4>
            <ul className="space-y-1">
              {reasoning.values.map((v, i) => (
                <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">•</span>
                  {v}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Assumptions
            </h4>
            <ul className="space-y-1">
              {reasoning.assumptions.map((a, i) => (
                <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">•</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-2">
              Evidence Emphasized
            </h4>
            <ul className="space-y-1">
              {reasoning.evidenceEmphasized.map((e, i) => (
                <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {e}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">
              Evidence Omitted
            </h4>
            <ul className="space-y-1">
              {reasoning.evidenceOmitted.map((e, i) => (
                <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">✗</span>
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            Logic Chain
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg p-4 leading-relaxed">
            {reasoning.logicChain}
          </p>
        </div>
      </div>

      {/* Alternative Perspectives */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Alternative Perspectives
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alternatives.map((alt, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wide mb-3">
                {alt.label}
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{alt.summary}</p>

              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                Core Values
              </h4>
              <div className="flex flex-wrap gap-1 mb-3">
                {alt.values.map((v, j) => (
                  <span
                    key={j}
                    className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400"
                  >
                    {v}
                  </span>
                ))}
              </div>

              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                Logic
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {alt.logicChain}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}