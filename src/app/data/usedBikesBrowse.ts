/** Shared browse tiles for used bikes (mega menu + `/used-bikes` landing). */

export type BikeModelRef = { label: string; q: string };

/** Models commonly searched on Bangladesh classifieds (showrooms + used). */
export const POPULAR_NEW_BIKES: BikeModelRef[] = [
  { label: 'Honda CB Shine SP', q: 'Honda CB Shine' },
  { label: 'Yamaha FZS-FI V3', q: 'Yamaha FZS' },
  { label: 'Bajaj Pulsar N160', q: 'Bajaj Pulsar N160' },
  { label: 'TVS Apache RTR 160 4V', q: 'TVS Apache RTR' },
  { label: 'Hero Splendor Plus', q: 'Hero Splendor' },
  { label: 'Suzuki Gixxer SF', q: 'Suzuki Gixxer' },
  { label: 'Honda Dio', q: 'Honda Dio' },
  { label: 'Yamaha R15 V4', q: 'Yamaha R15' },
];

export const POPULAR_USED_BIKES: BikeModelRef[] = [
  { label: 'Honda CB Shine', q: 'Honda CB Shine' },
  { label: 'Bajaj Pulsar 150', q: 'Bajaj Pulsar 150' },
  { label: 'Hero Splendor Plus', q: 'Hero Splendor' },
  { label: 'TVS Apache RTR', q: 'TVS Apache RTR' },
  { label: 'Yamaha FZS-FI', q: 'Yamaha FZS' },
  { label: 'Suzuki Gixxer', q: 'Suzuki Gixxer' },
  { label: 'Honda Livo', q: 'Honda Livo' },
  { label: 'Runner Knight Rider', q: 'Runner Knight' },
];

export const USED_BIKE_MAKE_MODELS: Record<string, string[]> = {
  Honda: ['CB Shine', 'Livo', 'Dio', 'CB Hornet', 'Unicorn'],
  Yamaha: ['FZS-FI', 'R15', 'FZ-X', 'Saluto'],
  Suzuki: ['Gixxer', 'Hayate', 'Intruder'],
  Bajaj: ['Pulsar NS160', 'Pulsar 150', 'Platina', 'Discover'],
  TVS: ['Apache RTR', 'Sport', 'Raider'],
  Hero: ['Splendor Plus', 'Glamour', 'Passion Pro'],
  Runner: ['Knight Rider', 'Bolt', 'Turbo'],
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
