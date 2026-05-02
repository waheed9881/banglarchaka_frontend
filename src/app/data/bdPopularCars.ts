/**
 * Curated search shortcuts for the Bangladesh market (recondition imports + authorised dealers).
 * Used by home browse, mega menus, quick links, and similar UI — keep in sync when adjusting copy.
 */

export const BD_POPULAR_USED_CAR_MODELS: Array<{ label: string; q: string }> = [
  { label: 'Toyota Fielder', q: 'Toyota Fielder' },
  { label: 'Toyota Axio', q: 'Toyota Axio' },
  { label: 'Toyota Allion', q: 'Toyota Allion' },
  { label: 'Toyota Noah', q: 'Toyota Noah' },
  { label: 'Honda Fit', q: 'Honda Fit' },
  { label: 'Honda Grace', q: 'Honda Grace' },
  { label: 'Honda Vezel', q: 'Honda Vezel' },
  { label: 'Honda Civic', q: 'Honda Civic' },
  { label: 'Honda City', q: 'Honda City' },
  { label: 'Suzuki Swift', q: 'Suzuki Swift' },
  { label: 'Suzuki Alto', q: 'Suzuki Alto' },
  { label: 'Mitsubishi Outlander', q: 'Mitsubishi Outlander' },
  { label: 'Nissan X-Trail', q: 'Nissan X-Trail' },
  { label: 'Hyundai Tucson', q: 'Hyundai Tucson' },
  { label: 'Hyundai Creta', q: 'Hyundai Creta' },
  { label: 'Kia Sportage', q: 'Kia Sportage' },
];

/** New-car showroom search shortcuts common in Bangladesh. */
export const BD_POPULAR_NEW_CAR_BRANDS: Array<{ label: string; q: string }> = [
  { label: 'Toyota Cars', q: 'Toyota' },
  { label: 'Honda Cars', q: 'Honda' },
  { label: 'Suzuki Cars', q: 'Suzuki' },
  { label: 'Nissan Cars', q: 'Nissan' },
  { label: 'Mitsubishi Cars', q: 'Mitsubishi' },
  { label: 'Hyundai Cars', q: 'Hyundai' },
  { label: 'Kia Cars', q: 'Kia' },
  { label: 'Changan Cars', q: 'Changan' },
  { label: 'MG Cars', q: 'MG' },
  { label: 'BMW Cars', q: 'BMW' },
];

export const BD_POPULAR_NEW_CAR_MODELS: Array<{ label: string; q: string }> = [
  { label: 'Toyota Corolla', q: 'Toyota Corolla' },
  { label: 'Toyota Corolla Cross', q: 'Toyota Corolla Cross' },
  { label: 'Honda Civic', q: 'Honda Civic' },
  { label: 'Honda City', q: 'Honda City' },
  { label: 'Suzuki Swift', q: 'Suzuki Swift' },
  { label: 'Suzuki Alto', q: 'Suzuki Alto' },
  { label: 'Suzuki XL7', q: 'Suzuki XL7' },
  { label: 'Hyundai Creta', q: 'Hyundai Creta' },
  { label: 'Hyundai Tucson', q: 'Hyundai Tucson' },
  { label: 'Changan Alsvin', q: 'Changan Alsvin' },
  { label: 'Kia Sportage', q: 'Kia Sportage' },
  { label: 'MG ZS', q: 'MG ZS' },
];

export type BdQuickSearchItem =
  | { listingType: 'used_car'; label: string; q: string }
  | { listingType: 'used_bike'; label: string; q: string };

/** Mixed popular searches for the homepage quick-links strip (correct listing type per row). */
export const BD_POPULAR_QUICK_SEARCHES: BdQuickSearchItem[] = [
  { listingType: 'used_car', label: 'Toyota Fielder', q: 'Toyota Fielder' },
  { listingType: 'used_car', label: 'Toyota Axio', q: 'Toyota Axio' },
  { listingType: 'used_car', label: 'Honda Fit', q: 'Honda Fit' },
  { listingType: 'used_car', label: 'Honda Vezel', q: 'Honda Vezel' },
  { listingType: 'used_bike', label: 'Honda CB Shine', q: 'Honda CB Shine' },
  { listingType: 'used_bike', label: 'Bajaj Pulsar', q: 'Bajaj Pulsar' },
  { listingType: 'used_car', label: 'Mercedes C-Class', q: 'Mercedes C-Class' },
  { listingType: 'used_car', label: 'BMW 3 Series', q: 'BMW 3 Series' },
];
