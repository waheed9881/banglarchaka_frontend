import type { ReactNode } from 'react';

/** Premium-style skeleton block (shimmer). */
export function SkeletonBox({
  className = '',
  rounded = 'rounded-xl',
}: {
  className?: string;
  rounded?: string;
}) {
  return <div className={`bc-skeleton-shimmer ${rounded} ${className}`} aria-hidden />;
}

export function SkeletonText({ className = '' }: { className?: string }) {
  return <SkeletonBox className={`h-4 ${className}`} rounded="rounded-md" />;
}

/** Section grid of card-shaped skeletons for listing-style layouts */
export function SkeletonCardGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-slate-100/80 bg-white shadow-sm"
        >
          <SkeletonBox className="h-48 w-full rounded-none" rounded="rounded-none" />
          <div className="p-5 space-y-3">
            <div className="flex justify-between gap-2">
              <SkeletonBox className="h-5 flex-1 max-w-[70%]" />
              <SkeletonBox className="h-5 w-20 shrink-0" />
            </div>
            <SkeletonBox className="h-3 w-full max-w-[90%]" />
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <SkeletonBox className="h-3 w-16" />
              <SkeletonBox className="h-3 w-14" />
              <SkeletonBox className="h-3 w-12 ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonHeroCard() {
  return (
    <div className="w-full max-w-4xl rounded-2xl border border-white/40 bg-white/95 p-6 md:p-8 shadow-2xl backdrop-blur-md">
      <div className="flex gap-2 mb-5 border-b border-slate-100 pb-4">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonBox key={i} className="h-9 flex-1 max-w-[7rem]" rounded="rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonBox className="h-2.5 w-16" rounded="rounded" />
            <SkeletonBox className="h-11 w-full" rounded="rounded-lg" />
          </div>
        ))}
        <SkeletonBox className="h-11 w-full md:col-span-1" rounded="rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonLiveRegion({ children }: { children: ReactNode }) {
  return (
    <div className="sr-only" aria-live="polite">
      {children}
    </div>
  );
}
