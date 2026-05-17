"use client";

interface CommonGroundProps {
  points: string[];
}

export default function CommonGround({ points }: CommonGroundProps) {
  if (points.length === 0) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-6 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🤝</span>
        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200">Common Ground</h3>
      </div>
      <p className="text-sm text-amber-800 dark:text-amber-300 mb-4">
        Despite differing perspectives, these points of agreement emerge across
        the political spectrum:
      </p>
      <ul className="space-y-3">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">{point}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}