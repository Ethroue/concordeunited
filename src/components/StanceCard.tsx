"use client";

import type { DetectedStance } from "@/types";

interface StanceCardProps {
  stance: DetectedStance;
}

export default function StanceCard({ stance }: StanceCardProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <span className="px-4 py-2 rounded-full bg-slate-800 text-white text-sm font-semibold uppercase tracking-wide">
          {stance.label}
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500 font-medium">
              Confidence
            </span>
            <span className="text-xs text-slate-600 font-semibold">
              {stance.confidence}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-500 rounded-full transition-all duration-500"
              style={{ width: `${stance.confidence}%` }}
            />
          </div>
        </div>
      </div>
      <p className="text-slate-700 leading-relaxed">{stance.summary}</p>
    </div>
  );
}