import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { resolveMediaUrl } from '@/lib/marketplace';

type MediaItem = { path: string; type?: string };

export function ListingMediaGallery({
  media,
  title,
  fallbackSrc,
  topLeftSlot,
  topRightSlot,
}: {
  media: MediaItem[] | undefined;
  title: string;
  fallbackSrc: string;
  /** e.g. FEATURED ribbon — top-left on main photo */
  topLeftSlot?: ReactNode;
  /** Save / favorite / share — top-right on main photo */
  topRightSlot?: ReactNode;
}) {
  const urls =
    media?.map((m) => resolveMediaUrl(m.path)).filter((u): u is string => Boolean(u)) ?? [];
  const [active, setActive] = useState(0);
  const safeIndex = urls.length ? Math.min(active, urls.length - 1) : 0;
  const main = urls[safeIndex] || fallbackSrc;

  const go = useCallback(
    (delta: number) => {
      if (urls.length <= 1) return;
      setActive((i) => (i + delta + urls.length) % urls.length);
    },
    [urls.length],
  );

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl bg-gray-100 shadow-inner ring-1 ring-black/[0.06]">
        {urls.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-md transition hover:bg-white md:left-3 md:h-11 md:w-11"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-md transition hover:bg-white md:right-3 md:h-11 md:w-11"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        ) : null}
        {topLeftSlot ? (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-2">{topLeftSlot}</div>
        ) : null}
        {topRightSlot ? (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-2">{topRightSlot}</div>
        ) : null}
        <ImageWithFallback
          src={main}
          alt={title}
          className="aspect-[16/10] w-full object-cover md:h-[min(520px,70vh)] md:aspect-auto"
        />
      </div>
      {urls.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {urls.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-[72px] w-[108px] shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === safeIndex
                  ? 'border-[#233D7B] ring-2 ring-[#233D7B]/15'
                  : 'border-gray-200 opacity-90 hover:border-gray-300 hover:opacity-100'
              }`}
            >
              <ImageWithFallback src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
