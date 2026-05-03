// import { Search } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import { useNavigate } from 'react-router';
// import { BD_CITIES, CITY_LABEL_KEYS } from '@/i18n/bdCities';
// import { fetchBrands, type BrandDto } from '@/lib/marketplace';
// import { SkeletonHeroCard, SkeletonLiveRegion } from '@/app/components/PremiumSkeleton';
// import { HeroBannerCarousel } from '@/app/components/hero/HeroBannerCarousel';
// import { PakPriceFilterHumanHint } from './listing/pakPriceHumanReadout';

// type ListingType = 'used_car' | 'new_car' | 'used_bike' | 'auto_part';

// type SearchPatch = Partial<{
//   listingType: ListingType;
//   brandId: string;
//   city: string;
//   keyword: string;
//   minPrice: string;
//   maxPrice: string;
//   minYear: string;
//   maxYear: string;
//   fuelType: string;
//   transmission: string;
//   condition: string;
//   verifiedDealerOnly: boolean;
//   dealerOnly: boolean;
// }>;

// function buildListingParams(s: {
//   listingType: ListingType;
//   brandId: string;
//   city: string;
//   keyword: string;
//   minPrice: string;
//   maxPrice: string;
//   minYear: string;
//   maxYear: string;
//   fuelType: string;
//   transmission: string;
//   condition: string;
//   verifiedDealerOnly: boolean;
//   dealerOnly: boolean;
// }): URLSearchParams {
//   const params = new URLSearchParams();
//   params.set('type', s.listingType);
//   if (s.brandId) params.set('brand_id', s.brandId);
//   if (s.city) params.set('city', s.city);
//   if (s.keyword.trim()) params.set('q', s.keyword.trim());
//   if (s.minPrice) params.set('min_price', s.minPrice);
//   if (s.maxPrice) params.set('max_price', s.maxPrice);
//   if (s.minYear) params.set('min_year', s.minYear);
//   if (s.maxYear) params.set('max_year', s.maxYear);
//   if (s.fuelType) params.set('fuel_type', s.fuelType);
//   if (s.transmission) params.set('transmission', s.transmission);
//   if (s.condition) params.set('condition', s.condition);
//   if (s.verifiedDealerOnly) params.set('verified_dealer_only', '1');
//   if (s.dealerOnly) params.set('dealer_only', '1');
//   return params;
// }

// export function Hero() {
//   const { t } = useTranslation();
//   const navigate = useNavigate();
//   const [brands, setBrands] = useState<BrandDto[]>([]);
//   const [brandsLoading, setBrandsLoading] = useState(true);
//   const [type, setType] = useState<ListingType>('used_car');
//   const [brandId, setBrandId] = useState('');
//   const [city, setCity] = useState('');
//   const [keyword, setKeyword] = useState('');
//   const [minPrice, setMinPrice] = useState('');
//   const [maxPrice, setMaxPrice] = useState('');
//   const [minYear, setMinYear] = useState('');
//   const [maxYear, setMaxYear] = useState('');
//   const [fuelType, setFuelType] = useState('');
//   const [transmission, setTransmission] = useState('');
//   const [condition, setCondition] = useState('');
//   const [verifiedDealerOnly, setVerifiedDealerOnly] = useState(false);
//   const [dealerOnly, setDealerOnly] = useState(false);
//   const [showAdvanced, setShowAdvanced] = useState(false);

//   useEffect(() => {
//     fetchBrands()
//       .then((rows) => setBrands(rows))
//       .catch(() => setBrands([]))
//       .finally(() => setBrandsLoading(false));
//   }, []);

//   const snapshot = (patch: SearchPatch = {}) => ({
//     listingType: patch.listingType ?? type,
//     brandId: patch.brandId ?? brandId,
//     city: patch.city ?? city,
//     keyword: patch.keyword ?? keyword,
//     minPrice: patch.minPrice ?? minPrice,
//     maxPrice: patch.maxPrice ?? maxPrice,
//     minYear: patch.minYear ?? minYear,
//     maxYear: patch.maxYear ?? maxYear,
//     fuelType: patch.fuelType ?? fuelType,
//     transmission: patch.transmission ?? transmission,
//     condition: patch.condition ?? condition,
//     verifiedDealerOnly: patch.verifiedDealerOnly ?? verifiedDealerOnly,
//     dealerOnly: patch.dealerOnly ?? dealerOnly,
//   });

//   /** Push filters to URL and keep Hero state in sync (avoids stale chip/tab clicks). */
//   const submitSearch = (patch: SearchPatch = {}) => {
//     const s = snapshot(patch);
//     const params = buildListingParams(s);
//     navigate(`/listings?${params.toString()}`);
//     setType(s.listingType);
//     setBrandId(s.brandId);
//     setCity(s.city);
//     setKeyword(s.keyword);
//     setMinPrice(s.minPrice);
//     setMaxPrice(s.maxPrice);
//     setMinYear(s.minYear);
//     setMaxYear(s.maxYear);
//     setFuelType(s.fuelType);
//     setTransmission(s.transmission);
//     setCondition(s.condition);
//     setVerifiedDealerOnly(s.verifiedDealerOnly);
//     setDealerOnly(s.dealerOnly);
//   };

//   const clearFilters = () => {
//     setBrandId('');
//     setCity('');
//     setKeyword('');
//     setMinPrice('');
//     setMaxPrice('');
//     setMinYear('');
//     setMaxYear('');
//     setFuelType('');
//     setTransmission('');
//     setCondition('');
//     setVerifiedDealerOnly(false);
//     setDealerOnly(false);
//     navigate(`/listings?type=${type}`);
//   };

//   return (
//     <section className="relative isolate min-h-[min(88vh,900px)] overflow-hidden bg-slate-950">
//       <HeroBannerCarousel />
//       <div
//         className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-black/30 to-black/85"
//         aria-hidden
//       />

//       <div className="relative z-10 mx-auto flex min-h-[min(88vh,900px)] w-full max-w-7xl flex-col px-4 pb-6 pt-10 md:pb-10 md:pt-14">
//         <div className="mx-auto max-w-3xl text-center md:mx-0 md:text-left">
//           <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md md:text-5xl lg:text-6xl">
//             {t('hero.headline')}
//           </h1>
//           <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-200/95 md:text-base">{t('hero.subhead')}</p>
//         </div>

//         <div className="mt-auto w-full max-w-5xl self-center space-y-5 pt-10 md:pt-14">
//           {brandsLoading ? (
//             <>
//               <SkeletonLiveRegion>{t('common.loading')}</SkeletonLiveRegion>
//               <SkeletonHeroCard />
//             </>
//           ) : (
//             <div className="rounded-2xl border border-white/35 bg-white/95 p-5 text-left text-gray-900 shadow-2xl backdrop-blur-md md:p-8">
//               <div className="mb-5 flex gap-2 overflow-x-auto border-b border-slate-200 pb-4">
//                 {(
//                   [
//                     [() => t('footer.usedCars'), 'used_car'],
//                     [() => t('footer.newCars'), 'new_car'],
//                     [() => t('hero.tabBikes'), 'used_bike'],
//                     [() => t('hero.autoParts'), 'auto_part'],
//                   ] as const
//                 ).map(([labelFn, value]) => (
//                   <button
//                     key={value}
//                     type="button"
//                     onClick={() => submitSearch({ listingType: value })}
//                     className={`shrink-0 rounded-t-lg px-4 py-2.5 text-[13px] font-semibold transition ${
//                       type === value ? 'bg-[#ba0035] text-white' : 'text-slate-600 hover:bg-slate-50'
//                     }`}
//                   >
//                     {labelFn()}
//                   </button>
//                 ))}
//               </div>

//               <form
//                 className="grid grid-cols-1 gap-3 md:grid-cols-4 md:items-end"
//                 onSubmit={(e) => {
//                   e.preventDefault();
//                   submitSearch();
//                 }}
//               >
//                 <label className="block space-y-1.5 md:col-span-1">
//                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
//                     {t('hero.brandLabel')}
//                   </span>
//                   <select
//                     value={brandId}
//                     onChange={(e) => setBrandId(e.target.value)}
//                     className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-gray-800 outline-none focus:border-[#00236f] focus:ring-2 focus:ring-[#00236f]/20"
//                     aria-label={t('hero.brandLabel')}
//                   >
//                     <option value="">{t('hero.anyMake')}</option>
//                     {brands.map((b) => (
//                       <option value={String(b.id)} key={b.id}>
//                         {b.name}
//                       </option>
//                     ))}
//                   </select>
//                 </label>
//                 <label className="block space-y-1.5 md:col-span-1">
//                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
//                     {t('hero.modelKeywordPlaceholder')}
//                   </span>
//                   <input
//                     value={keyword}
//                     onChange={(e) => setKeyword(e.target.value)}
//                     placeholder={t('hero.modelKeywordPlaceholder')}
//                     className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-gray-800 outline-none placeholder:text-slate-400 focus:border-[#00236f] focus:ring-2 focus:ring-[#00236f]/20"
//                     aria-label={t('hero.modelKeywordPlaceholder')}
//                   />
//                 </label>
//                 <label className="block space-y-1.5 md:col-span-1">
//                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
//                     {t('hero.cityLabel')}
//                   </span>
//                   <select
//                     value={city}
//                     onChange={(e) => setCity(e.target.value)}
//                     className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-gray-800 outline-none focus:border-[#00236f] focus:ring-2 focus:ring-[#00236f]/20"
//                     aria-label={t('hero.cityLabel')}
//                   >
//                     <option value="">{t('hero.anyCity')}</option>
//                     {BD_CITIES.map((c) => (
//                       <option key={c} value={c}>
//                         {t(CITY_LABEL_KEYS[c])}
//                       </option>
//                     ))}
//                   </select>
//                 </label>
//                 <button
//                   type="submit"
//                   className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#ba0035] px-6 text-[14px] font-bold text-white shadow-md transition hover:bg-[#9a002c] md:mt-0 md:h-[42px] md:self-end"
//                 >
//                   <Search className="h-4 w-4" aria-hidden />
//                   {t('hero.searchShort')}
//                 </button>
//               </form>

//               <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => setShowAdvanced((v) => !v)}
//                   className="text-[13px] font-medium text-[#00236f] hover:underline"
//                 >
//                   {showAdvanced ? t('hero.advancedFiltersHide') : t('hero.advancedFiltersShow')}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={clearFilters}
//                   className="text-[13px] font-semibold text-[#00236f] hover:underline"
//                 >
//                   {t('hero.clearShort')}
//                 </button>
//               </div>

//               {showAdvanced ? (
//                 <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-200 pt-4 md:grid-cols-3">
//                   <div className="min-w-0 space-y-3">
//                     <input
//                       value={minPrice}
//                       onChange={(e) => setMinPrice(e.target.value)}
//                       placeholder={t('hero.placeholderMinPrice')}
//                       className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-800"
//                     />
//                     <input
//                       value={maxPrice}
//                       onChange={(e) => setMaxPrice(e.target.value)}
//                       placeholder={t('hero.placeholderMaxPrice')}
//                       className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-800"
//                     />
//                     <select
//                       value={fuelType}
//                       onChange={(e) => setFuelType(e.target.value)}
//                       className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-800"
//                     >
//                       <option value="">{t('hero.anyFuelType')}</option>
//                       <option value="petrol">{t('hero.petrol')}</option>
//                       <option value="diesel">{t('hero.diesel')}</option>
//                       <option value="hybrid">{t('hero.hybrid')}</option>
//                       <option value="electric">{t('hero.electric')}</option>
//                     </select>
//                     <input
//                       value={minYear}
//                       onChange={(e) => setMinYear(e.target.value)}
//                       placeholder={t('hero.placeholderMinYear')}
//                       className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-800"
//                     />
//                     <input
//                       value={maxYear}
//                       onChange={(e) => setMaxYear(e.target.value)}
//                       placeholder={t('hero.placeholderMaxYear')}
//                       className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-800"
//                     />
//                     <select
//                       value={transmission}
//                       onChange={(e) => setTransmission(e.target.value)}
//                       className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-800"
//                     >
//                       <option value="">{t('hero.anyTransmissionShort')}</option>
//                       <option value="manual">{t('hero.manual')}</option>
//                       <option value="automatic">{t('hero.automatic')}</option>
//                     </select>
//                     <select
//                       value={condition}
//                       onChange={(e) => setCondition(e.target.value)}
//                       className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-800"
//                     >
//                       <option value="">{t('hero.anyConditionShort')}</option>
//                       <option value="used">{t('hero.used')}</option>
//                       <option value="new">{t('hero.new')}</option>
//                       <option value="reconditioned">{t('hero.reconditioned')}</option>
//                     </select>
//                     <label className="flex items-center gap-2 text-sm text-gray-700">
//                       <input
//                         type="checkbox"
//                         checked={verifiedDealerOnly}
//                         onChange={(e) => setVerifiedDealerOnly(e.target.checked)}
//                       />
//                       {t('hero.verifiedDealersOnly')}
//                     </label>
//                     <label className="flex items-center gap-2 text-sm text-gray-700">
//                       <input type="checkbox" checked={dealerOnly} onChange={(e) => setDealerOnly(e.target.checked)} />
//                       {t('hero.dealerListingsOnly')}
//                     </label>
//                     <button
//                       type="button"
//                       onClick={() => submitSearch()}
//                       className="rounded-lg bg-[#00236f] py-2.5 text-sm font-bold text-white transition hover:bg-[#001a52] md:col-span-3"
//                     >
//                       {t('hero.applyAdvancedFilters')}
//                     </button>
//                   </div>
//                 </div>
//               ) : null}

//           <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-4">
//           <button
//             type="button"
//             onClick={() => navigate('/listings?type=used_car')}
//             className="cursor-pointer rounded-xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-sm transition hover:border-white/30 hover:bg-white/20"
//           >
//             <div className="text-xl font-bold text-white">200K+</div>
//             <div className="text-xs text-slate-200">{t('hero.statCarsForSale')}</div>
//           </button>
//           <button
//             type="button"
//             onClick={() => navigate('/listings?type=used_bike')}
//             className="cursor-pointer rounded-xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-sm transition hover:border-white/30 hover:bg-white/20"
//           >
//             <div className="text-xl font-bold text-white">50K+</div>
//             <div className="text-xs text-slate-200">{t('hero.statBikesForSale')}</div>
//           </button>
//           <button
//             type="button"
//             onClick={() => navigate('/used-car-dealers')}
//             className="cursor-pointer rounded-xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-sm transition hover:border-white/30 hover:bg-white/20"
//           >
//             <div className="text-xl font-bold text-white">5K+</div>
//             <div className="text-xs text-slate-200">{t('hero.statDealers')}</div>
//           </button>
//           <button
//             type="button"
//             onClick={() => navigate('/listings?type=auto_part')}
//             className="cursor-pointer rounded-xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-sm transition hover:border-white/30 hover:bg-white/20"
//           >
//             <div className="text-xl font-bold text-white">100K+</div>
//             <div className="text-xs text-slate-200">{t('hero.statAutoPartsShort')}</div>
//           </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { BD_CITIES, CITY_LABEL_KEYS } from '@/i18n/bdCities';
import { fetchBrands, type BrandDto } from '@/lib/marketplace';
import { SkeletonHeroCard, SkeletonLiveRegion } from '@/app/components/PremiumSkeleton';
import { HeroBannerCarousel } from '@/app/components/hero/HeroBannerCarousel';

type ListingType = 'used_car' | 'new_car' | 'used_bike' | 'auto_part';

type SearchState = {
  listingType: ListingType;
  brandId: string;
  city: string;
  keyword: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  fuelType: string;
  transmission: string;
  condition: string;
  verifiedDealerOnly: boolean;
  dealerOnly: boolean;
};

export function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [brands, setBrands] = useState<BrandDto[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  const [state, setState] = useState<SearchState>({
    listingType: 'used_car',
    brandId: '',
    city: '',
    keyword: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    fuelType: '',
    transmission: '',
    condition: '',
    verifiedDealerOnly: false,
    dealerOnly: false,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchBrands()
      .then(setBrands)
      .catch(() => setBrands([]))
      .finally(() => setBrandsLoading(false));
  }, []);

  const update = (patch: Partial<SearchState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const buildParams = () => {
    const p = new URLSearchParams();
    p.set('type', state.listingType);
    if (state.brandId) p.set('brand_id', state.brandId);
    if (state.city) p.set('city', state.city);
    if (state.keyword) p.set('q', state.keyword);
    if (state.minPrice) p.set('min_price', state.minPrice);
    if (state.maxPrice) p.set('max_price', state.maxPrice);
    if (state.minYear) p.set('min_year', state.minYear);
    if (state.maxYear) p.set('max_year', state.maxYear);
    if (state.fuelType) p.set('fuel_type', state.fuelType);
    if (state.transmission) p.set('transmission', state.transmission);
    if (state.condition) p.set('condition', state.condition);
    if (state.verifiedDealerOnly) p.set('verified_dealer_only', '1');
    if (state.dealerOnly) p.set('dealer_only', '1');
    return p.toString();
  };

  const submit = () => {
    navigate(`/listings?${buildParams()}`);
  };

  const clear = () => {
    setState((s) => ({
      ...s,
      brandId: '',
      city: '',
      keyword: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      fuelType: '',
      transmission: '',
      condition: '',
      verifiedDealerOnly: false,
      dealerOnly: false,
    }));
  };

  const typeTabs: { labelKey: string; val: ListingType }[] = [
    { labelKey: 'hero.usedCars', val: 'used_car' },
    { labelKey: 'hero.newCars', val: 'new_car' },
    { labelKey: 'hero.usedBikes', val: 'used_bike' },
    { labelKey: 'hero.autoParts', val: 'auto_part' },
  ];

  return (
    <section className="relative min-h-[100dvh] min-h-screen bg-slate-950 text-white overflow-hidden">
      <HeroBannerCarousel />

      <div className="absolute inset-0 bg-black/60" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] min-h-screen max-w-7xl flex-col px-3 py-8 sm:px-4 sm:py-10">
        <div className="max-w-xl shrink-0">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-6xl">{t('hero.headline')}</h1>
          <p className="mt-2 text-sm text-slate-200 sm:text-base">{t('hero.subhead')}</p>
        </div>

        <div className="mt-6 min-w-0 flex-1 rounded-2xl bg-white p-4 text-slate-900 shadow-xl sm:mt-8 sm:p-6 md:mt-auto">
          {brandsLoading ? (
            <div role="status" aria-busy="true" className="space-y-3">
              <SkeletonLiveRegion>{t('common.loading')}</SkeletonLiveRegion>
              <SkeletonHeroCard />
            </div>
          ) : (
            <>
              <div className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto border-b border-slate-200 pb-2 sm:mx-0 sm:flex-wrap sm:gap-2 sm:overflow-visible">
                {typeTabs.map(({ labelKey, val }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => update({ listingType: val })}
                    className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition sm:px-4 ${
                      state.listingType === val
                        ? 'bg-[#C4161C] text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
              >
                <input
                  value={state.keyword}
                  onChange={(e) => update({ keyword: e.target.value })}
                  placeholder={t('hero.modelKeywordPlaceholder')}
                  className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[15px] outline-none ring-[#233D7B]/25 focus:ring-2 sm:min-h-0"
                />

                <select
                  value={state.brandId}
                  onChange={(e) => update({ brandId: e.target.value })}
                  className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[15px] outline-none ring-[#233D7B]/25 focus:ring-2"
                >
                  <option value="">{t('hero.anyMake')}</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>

                <select
                  value={state.city}
                  onChange={(e) => update({ city: e.target.value })}
                  className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[15px] outline-none ring-[#233D7B]/25 focus:ring-2"
                >
                  <option value="">{t('hero.anyCity')}</option>
                  {BD_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {t(CITY_LABEL_KEYS[c])}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#C4161C] px-4 py-2.5 text-[15px] font-semibold text-white shadow-md transition hover:bg-red-800 sm:min-h-0"
                >
                  <Search size={16} aria-hidden />
                  {t('hero.searchShort')}
                </button>
              </form>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <button
                  type="button"
                  className="font-semibold text-[#233D7B] underline-offset-2 hover:underline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? t('hero.advancedFiltersHide') : t('hero.advancedFiltersShow')}
                </button>
                <button
                  type="button"
                  className="font-medium text-slate-600 hover:text-slate-900"
                  onClick={clear}
                >
                  {t('hero.clearShort')}
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {showAdvanced ? (
                  <div className="grid grid-cols-1 gap-2 border-t border-slate-200 pt-4 sm:grid-cols-2 md:grid-cols-3">
                    <input
                      placeholder={t('hero.placeholderMinPrice')}
                      value={state.minPrice}
                      onChange={(e) => update({ minPrice: e.target.value })}
                      className="min-h-11 rounded-xl border border-slate-200 px-3 py-2.5 text-[15px] outline-none ring-[#233D7B]/20 focus:ring-2"
                    />
                    <input
                      placeholder={t('hero.placeholderMaxPrice')}
                      value={state.maxPrice}
                      onChange={(e) => update({ maxPrice: e.target.value })}
                      className="min-h-11 rounded-xl border border-slate-200 px-3 py-2.5 text-[15px] outline-none ring-[#233D7B]/20 focus:ring-2"
                    />
                    <input
                      placeholder={t('hero.placeholderMinYear')}
                      value={state.minYear}
                      onChange={(e) => update({ minYear: e.target.value })}
                      className="min-h-11 rounded-xl border border-slate-200 px-3 py-2.5 text-[15px] outline-none ring-[#233D7B]/20 focus:ring-2"
                    />
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4 sm:gap-3">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-xs text-slate-800 transition hover:bg-slate-100 sm:text-sm"
                    onClick={() => navigate('/listings?type=used_car')}
                  >
                    <div className="text-lg font-bold text-[#233D7B] sm:text-xl">200K+</div>
                    {t('hero.statCarsForSale')}
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-xs text-slate-800 transition hover:bg-slate-100 sm:text-sm"
                    onClick={() => navigate('/listings?type=used_bike')}
                  >
                    <div className="text-lg font-bold text-[#233D7B] sm:text-xl">50K+</div>
                    {t('hero.statBikesForSale')}
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-xs text-slate-800 transition hover:bg-slate-100 sm:text-sm"
                    onClick={() => navigate('/used-car-dealers')}
                  >
                    <div className="text-lg font-bold text-[#233D7B] sm:text-xl">5K+</div>
                    {t('hero.statDealers')}
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-xs text-slate-800 transition hover:bg-slate-100 sm:text-sm"
                    onClick={() => navigate('/listings?type=auto_part')}
                  >
                    <div className="text-lg font-bold text-[#233D7B] sm:text-xl">100K+</div>
                    {t('hero.statAutoPartsShort')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}