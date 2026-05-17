"use client";

import type { PoliticalAlignment } from "@/types";

interface PoliticalAlignmentsProps {
  alignments: PoliticalAlignment[];
}

export default function PoliticalAlignments({ alignments }: PoliticalAlignmentsProps) {
  if (!alignments || alignments.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🏛️</span>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Political Party &amp; Ideology Breakdown
        </h3>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
        How major political parties and ideologies view this topic, based on their stated platforms and positions.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alignments.map((alignment, i) => (
          <div
            key={i}
            className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              {alignment.party}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {alignment.stance}
            </p>
            <ul className="space-y-1.5">
              {alignment.keyPoints.map((point, j) => (
                <li key={j} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-slate-400 dark:text-slate-500 mt-0.5">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}