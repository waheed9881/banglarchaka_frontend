/** CDN-hosted icons (Tabler Icons MIT — jsDelivr). */

export function tablerIconOutline(name: string): string {
  return `https://cdn.jsdelivr.net/npm/@tabler/icons@3.26.0/icons/outline/${name}.svg`;
}

/** Value-strip hero icons (newspaper / handshake / motorbike). */
export const USED_BIKES_STRIP_ICON_URLS = {
  ad: tablerIconOutline('news'),
  buyers: tablerIconOutline('heart-handshake'),
  fast: tablerIconOutline('motorbike'),
} as const;

/** Motorcycle brand marks — Honda/Suzuki via Simple Icons; Yamaha via Wikimedia Commons. */
export const USED_BIKE_MAKE_LOGO_URLS: Record<string, string | null> = {
  Honda: 'https://cdn.simpleicons.org/honda/E40521',
  Suzuki: 'https://cdn.simpleicons.org/suzuki/E30613',
  Yamaha: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Yamaha_logo.svg',
  United: null,
  'Road Prince': null,
  Unique: null,
};

export const USED_BIKE_MAKE_FALLBACK_ICON = tablerIconOutline('motorbike');
