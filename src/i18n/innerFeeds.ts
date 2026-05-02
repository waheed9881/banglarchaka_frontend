import type { InnerListingFeed } from '@/app/components/InnerContentPage';
import type { TFunction } from 'i18next';

export function featuredDealersStrip(t: TFunction): { heading: string; limit: number } {
  return { heading: t('dealers.featuredHeading'), limit: 4 };
}

export function innerFeedsVideos(t: TFunction): InnerListingFeed[] {
  return [
    { heading: t('feeds.freshUsedInventory'), params: { listing_type: 'used_car', sort: 'newest' }, per_page: 6 },
    { heading: t('feeds.newCarListings'), params: { listing_type: 'new_car', sort: 'newest' }, per_page: 6 },
  ];
}

export function innerFeedsForums(t: TFunction): InnerListingFeed[] {
  return [
    { heading: t('feeds.usedCars'), params: { listing_type: 'used_car', sort: 'views' }, per_page: 6 },
    { heading: t('feeds.usedBikes'), params: { listing_type: 'used_bike', sort: 'newest' }, per_page: 6 },
  ];
}

export function innerFeedsCarPrices(t: TFunction): InnerListingFeed[] {
  return [
    { heading: t('feeds.usedCarAskingPrices'), params: { listing_type: 'used_car', sort: 'price_desc' }, per_page: 6 },
    { heading: t('feeds.newCarListings'), params: { listing_type: 'new_car', sort: 'price_desc' }, per_page: 6 },
  ];
}

export function innerFeedsCarReviews(t: TFunction): InnerListingFeed[] {
  return [
    { heading: t('feeds.popularUsedCars'), params: { listing_type: 'used_car', sort: 'views' }, per_page: 6 },
    {
      heading: t('feeds.hybridPicks'),
      params: { listing_type: 'used_car', fuel_type: 'hybrid', sort: 'newest' },
      per_page: 6,
    },
  ];
}

export function innerFeedsNewBikes(t: TFunction): InnerListingFeed[] {
  return [
    { heading: t('feeds.newBikeListings'), params: { listing_type: 'new_bike', sort: 'newest' }, per_page: 6 },
    { heading: t('feeds.usedBikes'), params: { listing_type: 'used_bike', sort: 'newest' }, per_page: 6 },
  ];
}

export function innerFeedsBikePrices(t: TFunction): InnerListingFeed[] {
  return [{ heading: t('feeds.usedBikesForSale'), params: { listing_type: 'used_bike', sort: 'price_asc' }, per_page: 8 }];
}

export function innerFeedsBikeReviews(t: TFunction): InnerListingFeed[] {
  return [{ heading: t('feeds.featuredBikes'), params: { listing_type: 'used_bike', sort: 'views' }, per_page: 8 }];
}

export function innerFeedsAccessories(t: TFunction): InnerListingFeed[] {
  return [
    { heading: t('feeds.accessoryListings'), params: { listing_type: 'accessory', sort: 'newest' }, per_page: 6 },
    { heading: t('feeds.autoParts'), params: { listing_type: 'auto_part', sort: 'newest' }, per_page: 6 },
  ];
}

export function innerFeedsWheelsTyres(t: TFunction): InnerListingFeed[] {
  return [
    { heading: t('feeds.tyresAndRims'), params: { listing_type: 'tyre_rim', sort: 'newest' }, per_page: 6 },
    { heading: t('feeds.relatedParts'), params: { listing_type: 'auto_part', sort: 'newest' }, per_page: 6 },
  ];
}

export function innerFeedsEngineParts(t: TFunction): InnerListingFeed[] {
  return [{ heading: t('feeds.partsInventory'), params: { listing_type: 'auto_part', sort: 'newest' }, per_page: 9 }];
}

export function innerFeedsCarCare(t: TFunction): InnerListingFeed[] {
  return [
    { heading: t('feeds.serviceListings'), params: { listing_type: 'service', sort: 'newest' }, per_page: 6 },
    { heading: t('feeds.partsConsumables'), params: { listing_type: 'auto_part', sort: 'newest' }, per_page: 6 },
  ];
}

export function innerFeedsSitemap(t: TFunction): InnerListingFeed[] {
  return [{ heading: t('feeds.trendingUsedCars'), params: { listing_type: 'used_car', sort: 'views' }, per_page: 6 }];
}

export function innerFeedsUsedCarsFeatured(t: TFunction): InnerListingFeed[] {
  return [
    {
      heading: t('feeds.featuredInventory'),
      params: { listing_type: 'used_car', featured: 1, sort: 'newest' },
      per_page: 9,
    },
  ];
}

export function innerFeedsUsedCarDealers(t: TFunction): InnerListingFeed[] {
  return [
    {
      heading: t('feeds.latestDealerListings'),
      params: { listing_type: 'used_car', dealer_only: 1, sort: 'newest' },
      per_page: 6,
    },
  ];
}

export function innerFeedsCertifiedCars(t: TFunction): InnerListingFeed[] {
  return [{ heading: t('feeds.recentUsedCars'), params: { listing_type: 'used_car', sort: 'newest' }, per_page: 6 }];
}

export function innerFeedsSellItForMe(t: TFunction): InnerListingFeed[] {
  return [{ heading: t('feeds.recentlySoldStyles'), params: { listing_type: 'used_car', sort: 'views' }, per_page: 6 }];
}

export function innerFeedsAuctionVerification(t: TFunction): InnerListingFeed[] {
  return [{ heading: t('feeds.importStyleListings'), params: { listing_type: 'used_car', sort: 'newest' }, per_page: 6 }];
}
