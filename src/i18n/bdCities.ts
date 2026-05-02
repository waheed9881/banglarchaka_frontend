/** Canonical BD city values for URL/query params; labels via `footer.city*` i18n keys. */
export const BD_CITIES = [
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Gazipur',
  'Cumilla',
  'Mymensingh',
  'Jessore',
  'Narayanganj',
] as const;

export type BdCity = (typeof BD_CITIES)[number];

export const CITY_LABEL_KEYS: Record<BdCity, `footer.${string}`> = {
  Dhaka: 'footer.cityDhaka',
  Chattogram: 'footer.cityChattogram',
  Sylhet: 'footer.citySylhet',
  Rajshahi: 'footer.cityRajshahi',
  Khulna: 'footer.cityKhulna',
  Barishal: 'footer.cityBarishal',
  Rangpur: 'footer.cityRangpur',
  Gazipur: 'footer.cityGazipur',
  Cumilla: 'footer.cityCumilla',
  Mymensingh: 'footer.cityMymensingh',
  Jessore: 'footer.cityJessore',
  Narayanganj: 'footer.cityNarayanganj',
};
