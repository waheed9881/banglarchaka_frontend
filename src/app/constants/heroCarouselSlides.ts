/**
 * Hero carousel — distinct wide automotive photos (high-res via Unsplash CDN).
 * Swap `src` URLs or add local imports later without touching carousel logic.
 */
export type HeroCarouselSlide = {
  id: number;
  src: string;
  /** Tailwind object-* utility for focal point */
  objectClass: string;
};

/** Editorial automotive photography — consistent premium showroom / road feel (no illustration look). */
export const HERO_CAROUSEL_SLIDES: HeroCarouselSlide[] = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1549923746-c2dabd283679?auto=format&fit=crop&w=2400&q=90',
    objectClass: 'object-[center_45%]',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=90',
    objectClass: 'object-[center_48%]',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1618843746939-6e44bd9f6288?auto=format&fit=crop&w=2400&q=90',
    objectClass: 'object-[center_42%]',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=2400&q=90',
    objectClass: 'object-[center_50%]',
  },
];
