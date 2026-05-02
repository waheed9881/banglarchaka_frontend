/** Shared browse tiles for used bikes (mega menu + `/used-bikes` landing). */

export type BikeModelRef = { label: string; q: string };

export const POPULAR_NEW_BIKES: BikeModelRef[] = [
  { label: 'Honda CG 125', q: 'Honda CG 125' },
  { label: 'Yamaha YBR 125', q: 'Yamaha YBR 125' },
  { label: 'Honda CD 70', q: 'Honda CD 70' },
  { label: 'Suzuki GD 110S', q: 'Suzuki GD 110S' },
  { label: 'Suzuki GS 150', q: 'Suzuki GS 150' },
  { label: 'Honda Pridor', q: 'Honda Pridor' },
  { label: 'Yamaha YBR 125G', q: 'Yamaha YBR 125G' },
  { label: 'Honda CB 150F', q: 'Honda CB 150F' },
];

export const POPULAR_USED_BIKES: BikeModelRef[] = [
  { label: 'Honda CG 125', q: 'Honda CG 125' },
  { label: 'Honda CD 70', q: 'Honda CD 70' },
  { label: 'Yamaha YBR 125', q: 'Yamaha YBR 125' },
  { label: 'Suzuki GS 150', q: 'Suzuki GS 150' },
  { label: 'Honda CB 125F', q: 'Honda CB 125F' },
  { label: 'Yamaha YBR 125G', q: 'Yamaha YBR 125G' },
  { label: 'Honda Pridor', q: 'Honda Pridor' },
  { label: 'Hi Speed Infinity 150', q: 'Hi Speed Infinity 150' },
];

/** Cities commonly used on classified hubs (matches seller `location_city` text when possible). */
export const PK_CITIES_BROWSE = [
  'Lahore',
  'Karachi',
  'Rawalpindi',
  'Islamabad',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Sialkot',
  'Gujranwala',
  'Sargodha',
  'Abbottabad',
  'Sahiwal',
  'Hyderabad',
  'Wah Cantt',
  'Bahawalpur',
  'Okara',
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
] as const;

export type PkBrowseCity = (typeof PK_CITIES_BROWSE)[number];

export const USED_BIKE_MAKE_MODELS: Record<string, string[]> = {
  Honda: ['CG 125', 'CD 70', 'Pridor', 'CB 125F', 'CB 150F', 'CB 250F'],
  Suzuki: ['GD 110S', 'GS 150', 'GSX-R600', 'GR 150'],
  Yamaha: ['YBR 125', 'YBR 125G', 'YZF-R3', 'MT 15'],
  United: ['US 125', 'US 70', 'Scooty 100'],
  'Road Prince': ['RP 70', 'RP 110', 'Wego 150'],
  Unique: ['UD 70', 'UD 100', 'UD 125'],
};

export type BikeFilterTile = { labelKey: string; q: string; icon: string };

export const BIKE_ENGINE_CC_TILES: BikeFilterTile[] = [
  { labelKey: 'usedBikesLanding.cc70', q: '70cc', icon: 'gauge' },
  { labelKey: 'usedBikesLanding.cc100', q: '100cc', icon: 'gauge' },
  { labelKey: 'usedBikesLanding.cc125', q: '125cc', icon: 'gauge' },
  { labelKey: 'usedBikesLanding.cc150', q: '150cc', icon: 'gauge' },
  { labelKey: 'usedBikesLanding.cc200', q: '200cc', icon: 'engine' },
  { labelKey: 'usedBikesLanding.cc250', q: '250cc', icon: 'engine' },
  { labelKey: 'usedBikesLanding.cc500', q: '500cc', icon: 'engine' },
  { labelKey: 'usedBikesLanding.cc600Plus', q: '600cc heavy bike', icon: 'engine' },
];

export const BIKE_CATEGORY_TILES: BikeFilterTile[] = [
  { labelKey: 'usedBikesLanding.catElectricBike', q: 'electric bike', icon: 'bolt' },
  { labelKey: 'usedBikesLanding.catElectricScooter', q: 'electric scooter', icon: 'charging-pile' },
  { labelKey: 'usedBikesLanding.catLadiesScooter', q: 'ladies scooter', icon: 'scooter' },
  { labelKey: 'usedBikesLanding.catHeavyBike', q: 'heavy bike', icon: 'motorbike' },
  { labelKey: 'usedBikesLanding.catSelfStart', q: 'self start', icon: 'power' },
  { labelKey: 'usedBikesLanding.catModified', q: 'modified bike', icon: 'tools' },
  { labelKey: 'usedBikesLanding.catAltered', q: 'altered bike', icon: 'adjustments' },
  { labelKey: 'usedBikesLanding.catPetrolScooter', q: 'petrol scooter', icon: 'gas-station' },
  { labelKey: 'usedBikesLanding.catReplica', q: 'replica bike', icon: 'copy' },
  { labelKey: 'usedBikesLanding.catDualSport', q: 'dual sport', icon: 'arrows-exchange' },
  { labelKey: 'usedBikesLanding.catAdventure', q: 'adventure bike', icon: 'mountain' },
  { labelKey: 'usedBikesLanding.catMini', q: 'mini bike', icon: 'zoom-pan' },
  { labelKey: 'usedBikesLanding.catMonkey', q: 'monkey bike', icon: 'mood-happy' },
  { labelKey: 'usedBikesLanding.cat4Stroke', q: '4 stroke', icon: 'engine' },
  { labelKey: 'usedBikesLanding.cat2Stroke', q: '2 stroke', icon: 'ripple' },
];

export const BIKE_BODY_TYPE_TILES: BikeFilterTile[] = [
  { labelKey: 'usedBikesLanding.bodyStandard', q: 'standard commuter', icon: 'circle-dot' },
  { labelKey: 'usedBikesLanding.bodySportbike', q: 'sport bike', icon: 'rocket' },
  { labelKey: 'usedBikesLanding.bodyScooter', q: 'scooter', icon: 'scooter' },
  { labelKey: 'usedBikesLanding.bodyCruiser', q: 'cruiser bike', icon: 'anchor' },
  { labelKey: 'usedBikesLanding.bodyTourer', q: 'touring bike', icon: 'map-route' },
  { labelKey: 'usedBikesLanding.bodyAtv', q: 'ATV quad', icon: 'tractor' },
  { labelKey: 'usedBikesLanding.bodyTrail', q: 'trail bike', icon: 'line' },
  { labelKey: 'usedBikesLanding.bodyOffRoad', q: 'off road dirt', icon: 'mountain-off' },
  { labelKey: 'usedBikesLanding.bodyOther', q: 'motorcycle', icon: 'motorbike' },
];

export type BikeBudgetBand = { labelKey: string; max_price: string };

export const BIKE_BUDGET_BANDS: BikeBudgetBand[] = [
  { labelKey: 'usedBikesLanding.budgetUnder1', max_price: '100000' },
  { labelKey: 'usedBikesLanding.budgetUnder2', max_price: '200000' },
  { labelKey: 'usedBikesLanding.budgetUnder3', max_price: '300000' },
  { labelKey: 'usedBikesLanding.budgetUnder4', max_price: '400000' },
  { labelKey: 'usedBikesLanding.budgetUnder5', max_price: '500000' },
  { labelKey: 'usedBikesLanding.budgetUnder10', max_price: '1000000' },
];
