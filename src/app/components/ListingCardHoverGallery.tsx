import { type ImgHTMLAttributes, useEffect, useMemo, useState } from 'react';
import { resolveMediaUrl, sortListingMediaByCoverPreference } from '@/lib/marketplace';
import { ImageWithFallback } from './figma/ImageWithFallback';

const DEFAULT_INTERVAL_MS = 2100;

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  media: Array<{ path: string }> | undefined;
  fallbackSrc: string;
  alt: string;
  /** Slideshow speed while hovered (only if 2+ images). */
  intervalMs?: number;
  /** e.g. `sm:absolute sm:inset-0` for list rows that anchor the thumbnail. */
  wrapperClassName?: string;
};

/**
 * Listing thumbnail: shows best cover image; on hover cycles through remaining photos.
 */
export function ListingCardHoverGallery({
  media,
  fallbackSrc,
  alt,
  className,
  intervalMs = DEFAULT_INTERVAL_MS,
  wrapperClassName,
  loading,
  decoding,
  ...imgRest
}: Props) {
  const urls = useMemo(() => {
    const sorted = sortListingMediaByCoverPreference(media);
    return sorted.map((m) => resolveMediaUrl(m.path)).filter((u): u is string => Boolean(u));
  }, [media]);

  const slides = urls.length > 0 ? urls : [fallbackSrc];
  const multi = slides.length > 1;

  const [hovered, setHovered] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!hovered || !multi) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [hovered, multi, slides.length, intervalMs]);

  const onEnter = () => {
    setHovered(true);
    if (multi) setIdx(0);
  };

  const onLeave = () => {
    setHovered(false);
    setIdx(0);
  };

  const src = slides[idx] ?? fallbackSrc;

  return (
    <div
      className={`group relative h-full w-full overflow-hidden ${wrapperClassName ?? ''}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <ImageWithFallback
        {...imgRest}
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
      />
      {multi ? (
        <div
          className="pointer-events-none absolute bottom-2 left-0 right-0 flex justify-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          aria-hidden
        >
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-200 ${
                i === idx ? 'w-4 bg-white shadow-sm' : 'w-1.5 bg-white/55'
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
