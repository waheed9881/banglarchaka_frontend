import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';

export type HeroBannerSlide = {
  id: string;
  imageSrc: string;
  alt: string;
  href?: string;
};

const AUTOPLAY_MS = 6000;

const DEFAULT_SLIDES: HeroBannerSlide[] = [
  {
    id: '1',
    imageSrc:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80',
    alt: '',
    href: '/listings?type=used_car',
  },
  {
    id: '2',
    imageSrc:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=80',
    alt: '',
    href: '/listings?type=new_car',
  },
  {
    id: '3',
    imageSrc:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2000&q=80',
    alt: '',
    href: '/used-car-dealers',
  },
];

type HeroBannerCarouselProps = {
  slides?: HeroBannerSlide[];
};

export function HeroBannerCarousel({ slides = DEFAULT_SLIDES }: HeroBannerCarouselProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: reduceMotion ? 12 : 20,
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || reduceMotion || paused || slides.length < 2) return;
    const id = window.setInterval(() => {
      if (!emblaApi.canScrollNext()) emblaApi.scrollTo(0);
      else emblaApi.scrollNext();
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [emblaApi, reduceMotion, paused, slides.length]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div
      className="absolute inset-0 z-0 h-full w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {slides.map((slide, i) => {
            const near = Math.abs(i - selected) <= 1;
            const eager = near || i === 0;
            const img = (
              <img
                src={slide.imageSrc}
                alt=""
                width={2000}
                height={1125}
                decoding="async"
                fetchPriority={i === 0 ? 'high' : 'low'}
                loading={eager ? 'eager' : 'lazy'}
                className="h-full min-h-full w-full object-cover object-center"
              />
            );
            const wrapClass = 'relative block h-full min-h-[100%] min-w-0 shrink-0 grow-0 basis-full';

            return (
              <div key={slide.id} className={wrapClass}>
                {slide.href?.startsWith('/') ? (
                  <Link to={slide.href} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-inset" aria-label={slide.alt || undefined}>
                    {img}
                  </Link>
                ) : slide.href ? (
                  <a href={slide.href} className="block h-full">
                    {img}
                  </a>
                ) : (
                  img
                )}
              </div>
            );
          })}
        </div>
      </div>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            className="absolute left-3 top-1/2 z-[2] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/55 active:scale-95 md:left-5 md:h-11 md:w-11"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="absolute right-3 top-1/2 z-[2] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/55 active:scale-95 md:right-5 md:h-11 md:w-11"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </>
      ) : null}
    </div>
  );
}
