"use client";

import type { DetectedStance } from "@/types";

interface StanceCardProps {
  stance: DetectedStance;
}

export default function StanceCard({ stance }: StanceCardProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 transition-colors">
      <div className="flex items-center gap-4 mb-4">
        <span className="px-4 py-2 rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-sm font-semibold uppercase tracking-wide">
          {stance.label}
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Confidence
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
              {stance.confidence}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-500 dark:bg-slate-400 rounded-full transition-all duration-700"
              style={{ width: `${stance.confidence}%` }}
            />
          </div>
        </div>
      </div>
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{stance.summary}</p>
    </div>
  );
}