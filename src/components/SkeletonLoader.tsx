"use client";

interface SkeletonLoaderProps {
  mode: "article" | "topic";
}

function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 bg-[length:200%_100%] animate-shimmer ${className}`}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-3">
      <SkeletonBar className="h-5 w-1/3" />
      <SkeletonBar className="h-3 w-full" />
      <SkeletonBar className="h-3 w-5/6" />
      <SkeletonBar className="h-3 w-2/3" />
    </div>
  );
}

export default function SkeletonLoader({ mode }: SkeletonLoaderProps) {
  if (mode === "topic") {
    return (
      <div className="space-y-4">
        <SkeletonBar className="h-7 w-48 mx-auto" />
        <SkeletonBar className="h-4 w-32 mx-auto" />
        <div className="space-y-3 mt-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title skeleton */}
      <div className="text-center space-y-2">
        <SkeletonBar className="h-7 w-64 mx-auto" />
        <SkeletonBar className="h-4 w-32 mx-auto" />
      </div>

      {/* StanceCard skeleton */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div className="flex items-center gap-4">
          <SkeletonBar className="h-10 w-32 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonBar className="h-2 w-full" />
          </div>
        </div>
        <SkeletonBar className="h-3 w-full" />
        <SkeletonBar className="h-3 w-4/5" />
      </div>

      {/* PerspectivePanel skeleton */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <SkeletonBar className="h-5 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <SkeletonBar className="h-3 w-24" />
            <SkeletonBar className="h-3 w-full" />
            <SkeletonBar className="h-3 w-5/6" />
          </div>
          <div className="space-y-2">
            <SkeletonBar className="h-3 w-24" />
            <SkeletonBar className="h-3 w-full" />
            <SkeletonBar className="h-3 w-4/6" />
          </div>
        </div>
      </div>

      {/* Alternative cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* CommonGround skeleton */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-3">
        <SkeletonBar className="h-5 w-36" />
        <SkeletonBar className="h-3 w-full" />
        <SkeletonBar className="h-3 w-5/6" />
        <SkeletonBar className="h-3 w-4/6" />
      </div>
    </div>
  );
}