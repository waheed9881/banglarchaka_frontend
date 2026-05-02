import { ArrowLeft, Bike, Camera, Car, CheckCircle2, Lightbulb, Smartphone, Tag, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { FormEvent, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { apiFetch, getAuthToken } from '@/lib/api';
import {
  fetchBrands,
  fetchCategories,
  fetchVehicleModelsForBrand,
  type BrandDto,
  type CategoryDto,
  type VehicleModelDto,
} from '@/lib/marketplace';
import { setPageSeo } from '@/lib/seo';
import { SubscriptionPlansStrip } from './SubscriptionPlansStrip';

const LISTING_TYPE_VALUES = [
  'used_car',
  'new_car',
  'used_bike',
  'new_bike',
  'auto_part',
  'tyre_rim',
  'accessory',
  'service',
] as const;

const PARENT_SLUG_BY_LISTING_TYPE: Record<string, string> = {
  used_car: 'used-cars',
  new_car: 'new-cars',
  used_bike: 'used-bikes',
  new_bike: 'new-bikes',
  auto_part: 'auto-parts',
  tyre_rim: 'tyres-rims',
  accessory: 'accessories',
  service: 'services',
};

const BD_CITIES = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Gazipur', 'Other'];

const EXTERIOR_COLORS = [
  'White',
  'Black',
  'Silver',
  'Grey',
  'Blue',
  'Red',
  'Green',
  'Brown',
  'Gold',
  'Other',
];

const DESC_MAX = 1000;
/** PakWheels-style bike description cap */
const DESC_MAX_BIKE = 995;

const BIKE_ASSEMBLY_OPTIONS = ['Local assembled', 'CBU / Imported', 'CKD', 'Other'];

const BIKE_ENGINE_TYPES = ['4 Stroke', '2 Stroke', 'Electric', 'Other'];

const BIKE_FEATURE_KEYS = ['anti_theft_lock', 'disc_brake', 'led_light', 'wind_shield'] as const;

function emptyBikeFeatures(): Record<(typeof BIKE_FEATURE_KEYS)[number], boolean> {
  return Object.fromEntries(BIKE_FEATURE_KEYS.map((k) => [k, false])) as Record<(typeof BIKE_FEATURE_KEYS)[number], boolean>;
}

const DESCRIPTION_CHIPS = [
  'Bumper-to-Bumper Original',
  'Like New',
  'Authorized Workshop Maintained',
  'Price Negotiable',
  'Alloy Rims',
  'Original Book',
  'Urgent Sale',
  'Single Owner',
  'Non-smoker',
  'Fresh Import',
];

const BIKE_DESCRIPTION_CHIPS = [
  'First owner',
  'Genuine parts',
  'Authorized workshop maintained',
  'Excellent mileage',
  'Price negotiable',
  'Urgent sale',
  'Fresh tyres',
  'Original documents',
];

/** Starter text for used-car ads (PakWheels-style “Predefined template”) */
const CAR_AD_DESCRIPTION_TEMPLATE = [
  'Make / model / variant:',
  'Model year:',
  'Mileage (km):',
  'Registered:',
  'Exterior condition:',
  'Interior & features:',
  'Service history:',
  'Reason for selling:',
].join('\n');

function categoryForListingType(roots: CategoryDto[], listingType: string): CategoryDto | null {
  const slug = PARENT_SLUG_BY_LISTING_TYPE[listingType];
  if (!slug) return null;
  return roots.find((c) => c.slug === slug) ?? null;
}

function isKnownListingType(value: string | null): value is (typeof LISTING_TYPE_VALUES)[number] {
  return !!value && (LISTING_TYPE_VALUES as readonly string[]).includes(value);
}

function Tip({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 text-xs text-[#233D7B]/90 bg-sky-50/80 border border-sky-100 rounded-lg px-3 py-2.5">
      <Lightbulb className="w-4 h-4 shrink-0 text-sky-600 mt-0.5" aria-hidden />
      <p className="leading-snug">{children}</p>
    </div>
  );
}

export function PostAdPage({ onBack }: { onBack?: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [brands, setBrands] = useState<BrandDto[]>([]);
  const [models, setModels] = useState<VehicleModelDto[]>([]);
  const [listingType, setListingType] = useState<string>('used_car');
  const [brandSlug, setBrandSlug] = useState('');
  const [vehicleModelId, setVehicleModelId] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [title, setTitle] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [year, setYear] = useState('2020');
  const [mileage, setMileage] = useState('');
  const [transmission, setTransmission] = useState('manual');
  const [fuelType, setFuelType] = useState('petrol');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');

  const [step, setStep] = useState(1);
  const [statusIsError, setStatusIsError] = useState(false);
  const [registeredIn, setRegisteredIn] = useState('unregistered');
  const [exteriorColor, setExteriorColor] = useState('');
  const [mobilePrimary, setMobilePrimary] = useState('');
  const [mobileSecondary, setMobileSecondary] = useState('');
  const [allowWhatsapp, setAllowWhatsapp] = useState(true);

  const [bikeAssembly, setBikeAssembly] = useState('');
  const [bikeEngineType, setBikeEngineType] = useState('');
  const [bikeFeatures, setBikeFeatures] = useState(emptyBikeFeatures);

  const clearStatus = () => {
    setStatus('');
    setStatusIsError(false);
  };
  const putError = (msg: string) => {
    setStatus(msg);
    setStatusIsError(true);
  };
  const putInfo = (msg: string) => {
    setStatus(msg);
    setStatusIsError(false);
  };

  useEffect(() => {
    setPageSeo(t('postAdForm.seoTitle'), t('postAdForm.seoDesc'));
  }, [t]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
    fetchBrands().then(setBrands).catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    const t = searchParams.get('type');
    if (isKnownListingType(t)) {
      setListingType(t);
    }
  }, [searchParams]);

  useEffect(() => {
    setStep(1);
  }, [listingType]);

  useEffect(() => {
    if (listingType !== 'used_bike') {
      setBikeAssembly('');
      setBikeEngineType('');
      setBikeFeatures(emptyBikeFeatures());
    }
  }, [listingType]);

  useEffect(() => {
    if (!brandSlug) {
      setModels([]);
      setVehicleModelId('');
      return;
    }
    fetchVehicleModelsForBrand(brandSlug)
      .then(setModels)
      .catch(() => setModels([]));
  }, [brandSlug]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash !== '#post-ad-form') return;
    requestAnimationFrame(() => {
      document.getElementById('post-ad-form')?.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
  }, [listingType, searchParams]);

  const conditionDefault = useMemo(() => {
    return listingType === 'new_car' || listingType === 'new_bike' ? 'new' : 'used';
  }, [listingType]);

  const showVehicleFields =
    listingType === 'used_car' ||
    listingType === 'new_car' ||
    listingType === 'used_bike' ||
    listingType === 'new_bike';

  const isBike = listingType === 'used_bike' || listingType === 'new_bike';
  const vehicleTitle = isBike ? t('postAdForm.vehicleBikeTitle') : t('postAdForm.vehicleCarTitle');
  const vehicleLower = isBike ? t('postAdForm.vehicleBike') : t('postAdForm.vehicleCar');
  const useSellWizard = showVehicleFields;
  /** PakWheels-style used bike: one scrollable page */
  const bikePakStyle = listingType === 'used_bike';
  /** PakWheels-style used car: one scrollable page (info incl. price & description → media → contact) */
  const carPakStyle = listingType === 'used_car';
  const descriptionMax = bikePakStyle ? DESC_MAX_BIKE : DESC_MAX;

  const descRemaining = Math.max(0, descriptionMax - description.length);

  const onPickFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const next: File[] = [];
    const urls: string[] = [];
    const cap = 12 - files.length;
    for (let i = 0; i < Math.min(list.length, cap); i++) {
      const f = list.item(i);
      if (!f || !f.type.startsWith('image/')) continue;
      next.push(f);
      urls.push(URL.createObjectURL(f));
    }
    if (!next.length) return;
    setFiles((prev) => [...prev, ...next]);
    setPreviews((prev) => [...prev, ...urls]);
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const appendChip = (text: string) => {
    setDescription((prev) => {
      if (prev.includes(text)) return prev;
      const sep = prev.trim() ? '. ' : '';
      const next = `${prev.trim()}${sep}${text}`;
      return next.slice(0, descriptionMax);
    });
  };

  const validateStep1 = () => {
    if (!title.trim()) {
      putError(bikePakStyle ? t('postAdForm.errors.enterMakeModelBike') : t('postAdForm.errors.enterTitleMakeModel'));
      return false;
    }
    if (!city.trim()) {
      putError(t('postAdForm.errors.selectCity'));
      return false;
    }
    if (!bikePakStyle && !exteriorColor) {
      putError(t('postAdForm.errors.selectExteriorColor'));
      return false;
    }
    if (bikePakStyle && !bikeEngineType) {
      putError(t('postAdForm.errors.selectEngineType'));
      return false;
    }
    if (bikePakStyle) {
      const d = description.trim();
      if (d.length < 25) {
        putError(t('postAdForm.errors.bikeDescMin25'));
        return false;
      }
    }
    if (listingType === 'used_car' || listingType === 'used_bike') {
      if (mileage === '' || Number.isNaN(Number(mileage))) {
        putError(t('postAdForm.errors.validMileageKm'));
        return false;
      }
    }
    clearStatus();
    return true;
  };

  const validateWizardFinalFields = () => {
    if (!price.trim() || Number(price) < 0) {
      putError(t('postAdForm.errors.validAskingPrice'));
      return false;
    }
    if (!bikePakStyle && !carPakStyle && !description.trim()) {
      putError(t('postAdForm.errors.shortDescriptionBuyers'));
      return false;
    }
    clearStatus();
    return true;
  };

  const validateCarPakSinglePage = () => {
    if (!title.trim()) {
      putError(t('postAdForm.errors.enterMakeModelVersion'));
      return false;
    }
    if (!city.trim()) {
      putError(t('postAdForm.errors.selectCity'));
      return false;
    }
    if (!exteriorColor) {
      putError(t('postAdForm.errors.selectExteriorColor'));
      return false;
    }
    if (mileage === '' || Number.isNaN(Number(mileage))) {
      putError(t('postAdForm.errors.validMileageKm'));
      return false;
    }
    if (!price.trim() || Number(price) < 0) {
      putError(t('postAdForm.errors.validAskingPrice'));
      return false;
    }
    if (!description.trim()) {
      putError(t('postAdForm.errors.writeAdDescription'));
      return false;
    }
    clearStatus();
    return true;
  };

  const goNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!getAuthToken()) {
      putError(t('postAdForm.errors.signInBeforePost'));
      return;
    }
    if (useSellWizard && bikePakStyle && !validateStep1()) return;
    if (useSellWizard && carPakStyle && !validateCarPakSinglePage()) return;
    if (useSellWizard && !bikePakStyle && !carPakStyle && !validateWizardFinalFields()) return;
    if (useSellWizard && !validateStep3Contact()) return;

    putInfo(t('postAdForm.submitting'));
    try {
      const cat = categoryForListingType(categories, listingType);
      if (!cat) throw new Error(t('postAdForm.categoriesNotLoaded'));

      const brand = brandSlug ? brands.find((b) => b.slug === brandSlug) : undefined;
      const dyn: Record<string, unknown> = {
        registered_in: registeredIn,
        exterior_color: exteriorColor || null,
        whatsapp_contact: allowWhatsapp,
      };
      if (bikePakStyle) {
        if (bikeAssembly) dyn.bike_assembly = bikeAssembly;
        dyn.bike_engine_type = bikeEngineType || null;
        const feats = BIKE_FEATURE_KEYS.filter((key) => bikeFeatures[key]).map((key) => t(`postAdForm.bikeFeatures.${key}`));
        if (feats.length) dyn.bike_features = feats;
      }
      if (mobilePrimary.trim()) dyn.contact_mobile = mobilePrimary.trim();
      if (mobileSecondary.trim()) dyn.contact_secondary = mobileSecondary.trim();

      let descOut = description.trim();
      if (mobilePrimary.trim()) {
        descOut = `${descOut}\n\nContact: ${mobilePrimary.trim()}${allowWhatsapp ? ' (WhatsApp OK)' : ''}`.trim();
      }

      const body: Record<string, unknown> = {
        category_id: cat.id,
        listing_type: listingType,
        title: title.trim(),
        description: descOut || null,
        price: Number(price),
        currency: 'BDT',
        condition: conditionDefault,
        location_city: city.trim(),
        transmission: showVehicleFields ? transmission : null,
        fuel_type: showVehicleFields ? fuelType : null,
        dynamic_attributes: dyn,
      };

      if (brand?.id) body.brand_id = brand.id;
      if (vehicleModelId) body.vehicle_model_id = Number(vehicleModelId);

      if (showVehicleFields && year) body.vehicle_year = Number(year);
      if (showVehicleFields && mileage !== '') body.mileage_km = Number(mileage || 0);

      const created = await apiFetch<{ data?: { id?: string } }>('/listings', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const listingId = created.data?.id;
      if (!listingId) throw new Error(t('postAdForm.unexpectedListingId'));

      if (files.length > 0) {
        const fd = new FormData();
        files.forEach((f) => fd.append('files[]', f));
        await apiFetch(`/listings/${listingId}/media`, { method: 'POST', body: fd });
      }

      previews.forEach((u) => URL.revokeObjectURL(u));
      navigate(`/my-listings/${listingId}/edit`, { replace: true });
    } catch (err) {
      putError(err instanceof Error ? err.message : t('postAdForm.submitFailed'));
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#233D7B]/25 focus:border-[#233D7B] outline-none transition-shadow';
  const labelClass = 'text-sm font-medium text-gray-700';

  const WizardIcon1 = bikePakStyle ? Bike : Car;
  const wizardSteps = useMemo(
    () => [
      { n: 1, label: t('postAdForm.wizardStepInfo', { vehicle: vehicleTitle }), Icon: WizardIcon1 },
      { n: 2, label: t('postAdForm.wizardStepPhotos'), Icon: Camera },
      { n: 3, label: t('postAdForm.wizardStepPrice'), Icon: Tag },
    ],
    [t, vehicleTitle, WizardIcon1],
  );

  const validateStep3Contact = () => {
    const digits = mobilePrimary.replace(/\D/g, '');
    if (!mobilePrimary.trim()) {
      putError(t('postAdForm.errors.enterMobile'));
      return false;
    }
    if (digits.length < 11) {
      putError(t('postAdForm.errors.mobile11Digits'));
      return false;
    }
    clearStatus();
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef1f6] via-[#f4f6f8] to-[#f4f6f8]">
      {useSellWizard ? (
        <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#233D7B] via-[#1c3070] to-[#152a52] text-white shadow-md">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(255,255,255,0.14),transparent)]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-4xl px-4 py-8 text-center sm:py-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/95 backdrop-blur-sm sm:text-[11px]">
              <Tag className="h-3.5 w-3.5 opacity-95" aria-hidden />
              {t('postAdForm.freeListing')}
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-[32px]">
              {t('postAdForm.sellYourVehicle', { vehicle: vehicleLower })}
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-white/88 sm:text-base">{t('postAdForm.wizardSubtitle')}</p>

            <div className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-2 sm:gap-6">
              {wizardSteps.map(({ n, label, Icon }, i) => (
                <div key={n} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-6">
                  <div className="flex min-w-0 flex-1 flex-col items-center">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all sm:h-14 sm:w-14 ${
                        bikePakStyle || carPakStyle || step >= n
                          ? 'bg-[#3EB549] text-white shadow-lg shadow-black/25'
                          : 'bg-white/15 text-white/75'
                      } ${!bikePakStyle && !carPakStyle && step === n ? 'ring-2 ring-white ring-offset-2 ring-offset-[#233D7B]' : ''}`}
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
                    </div>
                    <span className="mt-2 max-w-[5.5rem] px-0.5 text-center text-[10px] font-medium leading-tight text-white/90 sm:max-w-none sm:text-xs">
                      {label}
                    </span>
                  </div>
                  {i < wizardSteps.length - 1 ? (
                    <div
                      className={`mb-6 h-px min-w-[12px] flex-1 ${bikePakStyle || carPakStyle || step > n ? 'bg-[#3EB549]/90' : 'bg-white/25'}`}
                      aria-hidden
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="border-b border-white/10 bg-gradient-to-br from-[#233D7B] via-[#1a3266] to-[#152a52] py-10 text-white shadow-md">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="mb-2 text-3xl font-bold sm:text-4xl">{t('postAdForm.postYourAdHeading')}</h1>
            <p className="mx-auto max-w-lg text-base text-white/85">{t('postAdForm.postYourAdLead')}</p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-5 sm:py-8">
        <form
          id="post-ad-form"
          onSubmit={submit}
          className="scroll-mt-4 overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-xl ring-1 ring-black/[0.04]"
        >
          <div className="flex flex-wrap items-center gap-3 border-b border-emerald-500/15 bg-gradient-to-r from-emerald-50/95 via-white to-sky-50/40 px-4 py-4 sm:gap-4 sm:px-6">
            <Car className="hidden h-6 w-6 shrink-0 text-[#233D7B] opacity-90 sm:block" aria-hidden />
            <span className={`${labelClass} text-xs font-bold uppercase tracking-wide text-[#233D7B]`}>
              {t('postAdForm.listingTypeLabel')}
            </span>
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
              className={`${inputClass} max-w-[min(100%,240px)] rounded-lg border-gray-200 bg-white py-2.5 text-sm font-medium shadow-sm`}
            >
              {LISTING_TYPE_VALUES.map((lt) => (
                <option key={lt} value={lt}>
                  {t(`postAdForm.types.${lt}`)}
                </option>
              ))}
            </select>
          </div>

          {!useSellWizard ? (
            <div className="p-6 sm:p-8 space-y-6">
              <SimpleFields
                {...{
                  listingType,
                  title,
                  setTitle,
                  city,
                  setCity,
                  year,
                  setYear,
                  mileage,
                  setMileage,
                  transmission,
                  setTransmission,
                  fuelType,
                  setFuelType,
                  price,
                  setPrice,
                  description,
                  setDescription,
                  brandSlug,
                  setBrandSlug,
                  vehicleModelId,
                  setVehicleModelId,
                  brands,
                  models,
                  showVehicleFields,
                  files,
                  previews,
                  onPickFiles,
                  removeImage,
                  inputClass,
                  labelClass,
                  tr: t,
                }}
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#C4161C] text-white py-3.5 rounded-lg font-bold hover:bg-red-700 transition"
                >
                  {t('postAdForm.shared.postYourAd')}
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 border-2 border-gray-200 text-gray-700 py-3.5 rounded-lg font-semibold hover:bg-gray-50"
                >
                  {t('postAdForm.shared.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div
              className={
                bikePakStyle ? 'p-6 sm:p-8 bg-[#f4f6f8]' : carPakStyle ? 'p-6 sm:p-8 bg-[#f2f3f5]' : 'p-6 sm:p-8'
              }
            >
              {bikePakStyle ? (
                <div className="space-y-8">
                  <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900">{t('postAdForm.shared.bikeInformationHeading')}</h2>
                      <p className="text-sm text-gray-500 mt-1">{t('postAdForm.shared.mandatoryNote')}</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8">
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>
                            City <span className="text-red-500">*</span>
                          </label>
                          <div>
                            <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass}>
                              {BD_CITIES.map((c) => (
                                <option key={c} value={c}>
                                  {t(`postAdForm.cities.${c}`)}
                                </option>
                              ))}
                            </select>
                            <div className="mt-2 lg:hidden">
                              <Tip>{t('postAdForm.shared.tipNoDuplicates')}</Tip>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>
                            Bike Information <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Make/Model"
                            className={inputClass}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>Registered In</label>
                          <select value={registeredIn} onChange={(e) => setRegisteredIn(e.target.value)} className={inputClass}>
                            <option value="unregistered">Un-Registered</option>
                            <option value="registered">Registered</option>
                            <option value="brt">BRTA</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>
                            Mileage <span className="text-red-500">*</span>
                          </label>
                          <div>
                            <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-[#233D7B]/25">
                              <span className="px-3 py-2.5 bg-gray-100 text-gray-500 text-sm font-medium border-r border-gray-300">
                                KM
                              </span>
                              <input
                                value={mileage}
                                onChange={(e) => setMileage(e.target.value)}
                                placeholder="Mileage"
                                type="number"
                                min={0}
                                className="flex-1 min-w-0 px-3 py-2.5 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>Color</label>
                          <select value={exteriorColor} onChange={(e) => setExteriorColor(e.target.value)} className={inputClass}>
                            <option value="">Color</option>
                            {EXTERIOR_COLORS.map((c) => (
                              <option key={c} value={c}>
                                {t(`postAdForm.colors.${c}`)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>Assembly</label>
                          <select value={bikeAssembly} onChange={(e) => setBikeAssembly(e.target.value)} className={inputClass}>
                            <option value="">Assembly</option>
                            {BIKE_ASSEMBLY_OPTIONS.map((a) => (
                              <option key={a} value={a}>
                                {t(`postAdForm.bikeAssembly.${a}`)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>
                            Engine Type <span className="text-red-500">*</span>
                          </label>
                          <div>
                            <select value={bikeEngineType} onChange={(e) => setBikeEngineType(e.target.value)} className={inputClass}>
                              <option value="">Engine Type</option>
                              {BIKE_ENGINE_TYPES.map((engType) => (
                                <option key={engType} value={engType}>
                                  {t(`postAdForm.bikeEngine.${engType}`)}
                                </option>
                              ))}
                            </select>
                            <div className="mt-2 lg:hidden">
                              <Tip>{t('postAdForm.shared.tipNoPromo')}</Tip>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>
                            Describe Your Bike <span className="text-red-500">*</span>
                          </label>
                          <div>
                            <textarea
                              rows={6}
                              maxLength={descriptionMax}
                              value={description}
                              onChange={(e) => setDescription(e.target.value.slice(0, descriptionMax))}
                              placeholder="Example: first owner, genuine parts, maintained by authorized workshop, excellent mileage etc."
                              className={`${inputClass} resize-none`}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              Remaining Characters{' '}
                              <span className="font-semibold text-[#233D7B]">({descRemaining})</span>
                            </p>
                            <p className="text-sm font-medium text-gray-700 mt-4 mb-2">You can also use these suggestions</p>
                            <div className="flex flex-wrap gap-2">
                              {BIKE_DESCRIPTION_CHIPS.map((chip) => (
                                <button
                                  key={chip}
                                  type="button"
                                  onClick={() => appendChip(chip)}
                                  className="px-3 py-1.5 rounded-full border border-sky-200 bg-white text-xs sm:text-sm text-sky-800 hover:bg-sky-50 hover:border-sky-400 transition"
                                >
                                  {chip}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="hidden lg:flex flex-col gap-3">
                        <Tip>{t('postAdForm.shared.tipNoDuplicates')}</Tip>
                        <Tip>{t('postAdForm.shared.tipNoPromo')}</Tip>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">{t('postAdForm.shared.expectedSellingPrice')}</h2>
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 items-start">
                      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                        <label className={`${labelClass} sm:text-right sm:pt-2`}>
                          Price <span className="text-red-500">*</span> (BDT)
                        </label>
                        <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-[#233D7B]/25">
                          <span className="px-3 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold border-r border-gray-300">
                            BDT
                          </span>
                          <input
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            type="number"
                            min={0}
                            className="flex-1 min-w-0 px-3 py-2.5 outline-none"
                            placeholder="Price"
                          />
                        </div>
                      </div>
                      <Tip>{t('postAdForm.shared.tipRealisticPrice')}</Tip>
                    </div>
                  </section>

                  <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{t('postAdForm.shared.additionalInfo')}</h2>
                    <p className="text-sm font-medium text-gray-700 mb-4">{t('postAdForm.shared.features')}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {BIKE_FEATURE_KEYS.map((key) => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer text-sm text-gray-800">
                          <input
                            type="checkbox"
                            checked={bikeFeatures[key]}
                            onChange={(e) => setBikeFeatures((prev) => ({ ...prev, [key]: e.target.checked }))}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          {t(`postAdForm.bikeFeatures.${key}`)}
                        </label>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Media</h2>
                    <p className="text-sm text-gray-500 mb-4">Sharp pictures help buyers trust your ad.</p>
                    <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/40 px-6 py-14 cursor-pointer hover:bg-sky-50/80 transition">
                      <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mb-4">
                        <Camera className="w-8 h-8 text-sky-600" />
                      </div>
                      <span className="inline-flex items-center rounded-lg bg-emerald-600 text-white px-5 py-2.5 font-semibold text-sm">
                        + Add Photos
                      </span>
                      <span className="text-xs text-gray-500 mt-3">(Max limit 5 MB per image)</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          onPickFiles(e.target.files);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <div className="grid sm:grid-cols-2 gap-3 mt-6 text-sm text-gray-700">
                      {(['photoTip1', 'photoTip2', 'photoTip3', 'photoTip4'] as const).map((key) => (
                        <div key={key} className="flex gap-2 items-start">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                          <span>{t(`postAdForm.shared.${key}`)}</span>
                        </div>
                      ))}
                    </div>
                    {previews.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-8">
                        {previews.map((src, index) => (
                          <div key={src} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                            <img src={src} alt="" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </section>

                  <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-4 items-center">
                          <label className={labelClass}>
                            Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                            <span className="px-3 py-2.5 bg-gray-100 text-gray-500 border-r border-gray-300">
                              <Smartphone className="w-4 h-4" />
                            </span>
                            <input
                              value={mobilePrimary}
                              onChange={(e) => setMobilePrimary(e.target.value)}
                              placeholder="01XXXXXXXXX"
                              className="flex-1 min-w-0 px-3 py-2.5 outline-none"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-4 items-center">
                          <label className={labelClass}>Secondary Number (Optional)</label>
                          <input
                            value={mobileSecondary}
                            onChange={(e) => setMobileSecondary(e.target.value)}
                            placeholder="Secondary Number"
                            className={inputClass}
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-1 flex-wrap">
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Allow WhatsApp Contact
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={allowWhatsapp}
                            onClick={() => setAllowWhatsapp((v) => !v)}
                            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 ${allowWhatsapp ? 'bg-sky-500' : 'bg-gray-300'}`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${allowWhatsapp ? 'translate-x-[22px]' : ''}`}
                            />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-3 text-sm text-gray-600 bg-sky-50/80 border border-sky-100 rounded-xl p-4 h-fit">
                        <Smartphone className="w-6 h-6 text-[#233D7B] shrink-0" />
                        <p>Use your genuine 11-digit Bangladesh mobile (01XXXXXXXXX). Buyer inquiries will come to this number.</p>
                      </div>
                    </div>
                  </section>

                  <div className="flex flex-wrap justify-between items-center gap-4 pt-4">
                    <button
                      type="button"
                      onClick={onBack}
                      className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-10 py-3.5 rounded-lg bg-emerald-600 text-white font-bold tracking-wide text-sm hover:bg-emerald-700 shadow-md sm:min-w-[220px]"
                    >
                      Submit &amp; Continue
                    </button>
                  </div>
                </div>
              ) : carPakStyle ? (
                <div className="space-y-8">
                  <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900">{t('postAdForm.shared.carInformationHeading')}</h2>
                      <p className="text-sm text-gray-500 mt-1">{t('postAdForm.shared.mandatoryNote')}</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8">
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>
                            City <span className="text-red-500">*</span>
                          </label>
                          <div>
                            <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass}>
                              {BD_CITIES.map((c) => (
                                <option key={c} value={c}>
                                  {t(`postAdForm.cities.${c}`)}
                                </option>
                              ))}
                            </select>
                            <div className="mt-2 lg:hidden">
                              <Tip>{t('postAdForm.shared.tipNoDuplicates')}</Tip>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>
                            Car Info <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Make/Model/Version"
                            className={inputClass}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>Registered In</label>
                          <select value={registeredIn} onChange={(e) => setRegisteredIn(e.target.value)} className={inputClass}>
                            <option value="unregistered">Un-Registered</option>
                            <option value="registered">Registered</option>
                            <option value="brt">BRTA</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>
                            Exterior Color <span className="text-red-500">*</span>
                          </label>
                          <select value={exteriorColor} onChange={(e) => setExteriorColor(e.target.value)} className={inputClass}>
                            <option value="">{t('postAdForm.shared.exteriorColorPlaceholder')}</option>
                            {EXTERIOR_COLORS.map((c) => (
                              <option key={c} value={c}>
                                {t(`postAdForm.colors.${c}`)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>
                            Mileage <span className="text-red-500">*</span> (km)
                          </label>
                          <div>
                            <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-[#233D7B]/25">
                              <span className="px-3 py-2.5 bg-gray-100 text-gray-500 text-sm font-medium border-r border-gray-300">
                                KM
                              </span>
                              <input
                                value={mileage}
                                onChange={(e) => setMileage(e.target.value)}
                                placeholder="Mileage"
                                type="number"
                                min={0}
                                className="flex-1 min-w-0 px-3 py-2.5 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>
                            Price <span className="text-red-500">*</span> (BDT)
                          </label>
                          <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-[#233D7B]/25">
                            <span className="px-3 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold border-r border-gray-300">
                              BDT
                            </span>
                            <input
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              type="number"
                              min={0}
                              className="flex-1 min-w-0 px-3 py-2.5 outline-none"
                              placeholder="Price"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                          <div>
                            <label className={labelClass}>Year</label>
                            <select value={year} onChange={(e) => setYear(e.target.value)} className={`${inputClass} mt-1.5`}>
                              {Array.from({ length: 26 }, (_, idx) => 2026 - idx).map((y) => (
                                <option key={y} value={String(y)}>
                                  {y}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Make</label>
                            <select value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)} className={`${inputClass} mt-1.5`}>
                              <option value="">Select make</option>
                              {brands.map((b) => (
                                <option key={b.id} value={b.slug}>
                                  {b.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Model</label>
                            <select
                              value={vehicleModelId}
                              onChange={(e) => setVehicleModelId(e.target.value)}
                              disabled={!brandSlug || models.length === 0}
                              className={`${inputClass} mt-1.5 disabled:bg-gray-100`}
                            >
                              <option value="">{brandSlug ? t('postAdForm.simple.selectModel') : t('postAdForm.shared.pickMakeFirstShort')}</option>
                              {models.map((m) => (
                                <option key={m.id} value={String(m.id)}>
                                  {m.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Transmission</label>
                            <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className={`${inputClass} mt-1.5`}>
                              <option value="manual">Manual</option>
                              <option value="automatic">Automatic</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className={labelClass}>Fuel type</label>
                            <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className={`${inputClass} mt-1.5`}>
                              <option value="petrol">Petrol</option>
                              <option value="diesel">Diesel</option>
                              <option value="hybrid">Hybrid</option>
                              <option value="electric">Electric</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>
                            Ad Description <span className="text-red-500">*</span>
                          </label>
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <span className="sr-only">Description helpers</span>
                              <button
                                type="button"
                                onClick={() => setDescription(CAR_AD_DESCRIPTION_TEMPLATE.slice(0, DESC_MAX))}
                                className="text-sm font-semibold text-sky-600 hover:text-sky-800 hover:underline ml-auto"
                              >
                                Predefined template
                              </button>
                            </div>
                            <textarea
                              rows={7}
                              maxLength={DESC_MAX}
                              value={description}
                              onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX))}
                              placeholder="Describe condition, documents, features and ownership details clearly."
                              className={`${inputClass} resize-none`}
                            />
                            <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                              <p className="text-xs text-gray-500">
                                Remaining characters <span className="font-semibold text-[#233D7B]">({descRemaining})</span>
                              </p>
                              <button
                                type="button"
                                onClick={() => setDescription('')}
                                className="text-xs text-sky-600 font-semibold hover:underline"
                              >
                                Reset
                              </button>
                            </div>
                            <p className="text-sm font-medium text-gray-700 mt-4 mb-2">You can also use these suggestions</p>
                            <div className="flex flex-wrap gap-2">
                              {DESCRIPTION_CHIPS.map((chip) => (
                                <button
                                  key={chip}
                                  type="button"
                                  onClick={() => appendChip(chip)}
                                  className="px-3 py-1.5 rounded-full border border-sky-200 bg-white text-xs sm:text-sm text-sky-800 hover:bg-sky-50 hover:border-sky-400 transition"
                                >
                                  {chip}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="hidden lg:flex flex-col gap-3">
                        <Tip>{t('postAdForm.shared.tipNoDuplicates')}</Tip>
                        <Tip>{t('postAdForm.shared.tipNoPromo')}</Tip>
                        <Tip>{t('postAdForm.shared.tipRealisticPrice')}</Tip>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Media</h2>
                    <p className="text-sm text-gray-500 mb-4">Good photos attract serious buyers faster.</p>
                    <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/40 px-6 py-14 cursor-pointer hover:bg-sky-50/80 transition">
                      <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mb-4">
                        <Camera className="w-8 h-8 text-sky-600" />
                      </div>
                      <span className="inline-flex items-center rounded-lg bg-emerald-600 text-white px-5 py-2.5 font-semibold text-sm">
                        + Add Photos
                      </span>
                      <span className="text-xs text-gray-500 mt-3">(Max limit 5 MB per image)</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          onPickFiles(e.target.files);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <div className="grid sm:grid-cols-2 gap-3 mt-6 text-sm text-gray-700">
                      {(['photoTipCar1', 'photoTipCar2', 'photoTipCar3', 'photoTipCar4'] as const).map((key) => (
                        <div key={key} className="flex gap-2 items-start">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                          <span>{t(`postAdForm.shared.${key}`)}</span>
                        </div>
                      ))}
                    </div>
                    {previews.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-8">
                        {previews.map((src, index) => (
                          <div key={src} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                            <img src={src} alt="" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </section>

                  <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-4 items-center">
                          <label className={labelClass}>
                            Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                            <span className="px-3 py-2.5 bg-gray-100 text-gray-500 border-r border-gray-300">
                              <Smartphone className="w-4 h-4" />
                            </span>
                            <input
                              value={mobilePrimary}
                              onChange={(e) => setMobilePrimary(e.target.value)}
                              placeholder="01XXXXXXXXX"
                              className="flex-1 min-w-0 px-3 py-2.5 outline-none"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-4 items-center">
                          <label className={labelClass}>Secondary Number (Optional)</label>
                          <input
                            value={mobileSecondary}
                            onChange={(e) => setMobileSecondary(e.target.value)}
                            placeholder="Secondary Number"
                            className={inputClass}
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-1 flex-wrap">
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Allow WhatsApp Contact
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={allowWhatsapp}
                            onClick={() => setAllowWhatsapp((v) => !v)}
                            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 ${allowWhatsapp ? 'bg-sky-500' : 'bg-gray-300'}`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${allowWhatsapp ? 'translate-x-[22px]' : ''}`}
                            />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-3 text-sm text-gray-600 bg-sky-50/80 border border-sky-100 rounded-xl p-4 h-fit">
                        <Smartphone className="w-6 h-6 text-[#233D7B] shrink-0" />
                        <p>
                          Enter a genuine 11-digit Bangladesh mobile (01XXXXXXXXX). All inquiries will come on this number.
                        </p>
                      </div>
                    </div>
                  </section>

                  <div className="flex flex-wrap justify-between items-center gap-4 pt-4">
                    <button
                      type="button"
                      onClick={onBack}
                      className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-10 py-3.5 rounded-lg bg-emerald-600 text-white font-bold uppercase tracking-wide text-sm hover:bg-emerald-700 shadow-md sm:min-w-[240px]"
                    >
                      Submit &amp; Continue
                    </button>
                  </div>
                </div>
              ) : (
              <>
              {step === 1 ? (
                  <>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900">{t('postAdForm.shared.wizardVehicleInfoTitle', { vehicle: vehicleTitle })}</h2>
                      <p className="text-sm text-gray-500 mt-1">{t('postAdForm.shared.wizardMandatoryNote')}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8">
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>
                            City <span className="text-red-500">*</span>
                          </label>
                          <div>
                            <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass}>
                              {BD_CITIES.map((c) => (
                                <option key={c} value={c}>
                                  {t(`postAdForm.cities.${c}`)}
                                </option>
                              ))}
                            </select>
                            <div className="mt-2 lg:hidden">
                              <Tip>{t('postAdForm.shared.tipNoDuplicateVehicle')}</Tip>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>
                            {t('postAdForm.shared.vehicleInfoStar', { vehicle: vehicleTitle })}{' '}
                            <span className="text-red-500">*</span>{' '}
                          </label>
                          <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Make / Model / Version"
                            className={inputClass}
                            required
                          />
                        </div>

                      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                        <label className={`${labelClass} sm:text-right sm:pt-2`}>Registered in</label>
                        <select value={registeredIn} onChange={(e) => setRegisteredIn(e.target.value)} className={inputClass}>
                          <option value="unregistered">Un-Registered</option>
                          <option value="registered">Registered</option>
                          <option value="brt">BRTA</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                        <label className={`${labelClass} sm:text-right sm:pt-2`}>
                          Exterior color <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={exteriorColor}
                          onChange={(e) => setExteriorColor(e.target.value)}
                          className={inputClass}
                        >
                          <option value="">{t('postAdForm.shared.exteriorColorPlaceholder')}</option>
                          {EXTERIOR_COLORS.map((c) => (
                            <option key={c} value={c}>
                              {t(`postAdForm.colors.${c}`)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                        <label className={`${labelClass} sm:text-right sm:pt-2`}>
                          Mileage <span className="text-red-500">*</span> (km)
                        </label>
                        <div>
                          <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-[#233D7B]/25">
                            <span className="px-3 py-2.5 bg-gray-100 text-gray-500 text-sm font-medium border-r border-gray-300">
                              KM
                            </span>
                            <input
                              value={mileage}
                              onChange={(e) => setMileage(e.target.value)}
                              placeholder="Mileage"
                              type="number"
                              min={0}
                              className="flex-1 min-w-0 px-3 py-2.5 outline-none"
                            />
                          </div>
                          <div className="mt-2 lg:hidden">
                            <Tip>{t('postAdForm.shared.tipAvoidPromoVehicle')}</Tip>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                        <div>
                          <label className={labelClass}>Year</label>
                          <select value={year} onChange={(e) => setYear(e.target.value)} className={`${inputClass} mt-1.5`}>
                            {Array.from({ length: 26 }, (_, i) => 2026 - i).map((y) => (
                              <option key={y} value={String(y)}>
                                {y}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Make</label>
                          <select value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)} className={`${inputClass} mt-1.5`}>
                            <option value="">Select make</option>
                            {brands.map((b) => (
                              <option key={b.id} value={b.slug}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Model</label>
                          <select
                            value={vehicleModelId}
                            onChange={(e) => setVehicleModelId(e.target.value)}
                            disabled={!brandSlug || models.length === 0}
                            className={`${inputClass} mt-1.5 disabled:bg-gray-100`}
                          >
                            <option value="">{brandSlug ? t('postAdForm.simple.selectModel') : t('postAdForm.shared.pickMakeFirstShort')}</option>
                            {models.map((m) => (
                              <option key={m.id} value={String(m.id)}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Transmission</label>
                          <select
                            value={transmission}
                            onChange={(e) => setTransmission(e.target.value)}
                            className={`${inputClass} mt-1.5`}
                          >
                            <option value="manual">Manual</option>
                            <option value="automatic">Automatic</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Fuel type</label>
                          <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className={`${inputClass} mt-1.5`}>
                            <option value="petrol">Petrol</option>
                            <option value="diesel">Diesel</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="electric">Electric</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:flex flex-col gap-3">
                      <Tip>{t('postAdForm.shared.tipNoDuplicateVehicle')}</Tip>
                      <Tip>{t('postAdForm.shared.tipAvoidPromoVehicle')}</Tip>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={goNext}
                      className="px-8 py-3 rounded-lg bg-[#233D7B] text-white font-semibold hover:bg-[#1a2f5e] transition"
                    >
                      Continue
                    </button>
                    <button type="button" onClick={onBack} className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Upload photos</h2>
                    <p className="text-sm text-gray-500 mt-1">Clear pictures sell faster.</p>
                  </div>

                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/40 px-6 py-14 cursor-pointer hover:bg-sky-50/80 transition">
                    <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mb-4">
                      <Camera className="w-8 h-8 text-sky-600" />
                    </div>
                    <span className="inline-flex items-center rounded-lg bg-emerald-600 text-white px-5 py-2.5 font-semibold text-sm">
                      + Add Photos
                    </span>
                    <span className="text-xs text-gray-500 mt-3">Max 5 MB per image · JPEG, PNG, WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        onPickFiles(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>

                  <div className="grid sm:grid-cols-2 gap-3 mt-6 text-sm text-gray-700">
                    {(['wizPhotoTip1', 'wizPhotoTip2', 'wizPhotoTip3', 'wizPhotoTip4'] as const).map((key) => (
                      <div key={key} className="flex gap-2 items-start">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                        <span>{t(`postAdForm.shared.${key}`)}</span>
                      </div>
                    ))}
                  </div>

                  {previews.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-8">
                      {previews.map((src, index) => (
                        <div key={src} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                          <img src={src} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1 px-5 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-8 py-3 rounded-lg bg-[#233D7B] text-white font-semibold hover:bg-[#1a2f5e]"
                    >
                      Continue to price
                    </button>
                  </div>
                </>
              ) : null}

              {step === 3 ? (
                  <>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Selling price &amp; details</h2>
                      <p className="text-sm text-gray-500 mt-1">Help buyers understand condition and value.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 items-start sm:items-center">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>
                            Price <span className="text-red-500">*</span> (BDT)
                          </label>
                          <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-[#233D7B]/25">
                            <span className="px-3 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold border-r border-gray-300">
                              BDT
                            </span>
                            <input
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              type="number"
                              min={0}
                              className="flex-1 min-w-0 px-3 py-2.5 outline-none"
                              placeholder="Asking price"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <label className={labelClass}>
                              Ad description <span className="text-red-500">*</span>
                            </label>
                            <div className="text-xs text-gray-500">
                              Remaining characters{' '}
                              <span className="font-semibold text-[#233D7B]">{descRemaining}</span>
                              <button
                                type="button"
                                onClick={() => setDescription('')}
                                className="ml-3 text-sky-600 font-semibold hover:underline"
                              >
                                Reset
                              </button>
                            </div>
                          </div>
                          <textarea
                            rows={6}
                            maxLength={descriptionMax}
                            value={description}
                            onChange={(e) => setDescription(e.target.value.slice(0, descriptionMax))}
                            placeholder="Describe your vehicle: alloy rims, first owner, genuine parts, authorized workshop maintained, mileage, original paint…"
                            className={`${inputClass} resize-none`}
                          />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-3">You can also use these suggestions</p>
                          <div className="flex flex-wrap gap-2">
                            {DESCRIPTION_CHIPS.map((chip) => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => appendChip(chip)}
                                className="px-3 py-1.5 rounded-full border border-sky-200 bg-white text-xs sm:text-sm text-sky-800 hover:bg-sky-50 hover:border-sky-400 transition"
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Contact information</h3>
                          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-4 items-center">
                                <label className={labelClass}>
                                  Mobile <span className="text-red-500">*</span>
                                </label>
                                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                                  <span className="px-3 py-2.5 bg-gray-100 text-gray-500 border-r border-gray-300">
                                    <Smartphone className="w-4 h-4" />
                                  </span>
                                  <input
                                    value={mobilePrimary}
                                    onChange={(e) => setMobilePrimary(e.target.value)}
                                    placeholder="01XXXXXXXXX"
                                    className="flex-1 min-w-0 px-3 py-2.5 outline-none"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-4 items-center">
                                <label className={labelClass}>Secondary (optional)</label>
                                <input
                                  value={mobileSecondary}
                                  onChange={(e) => setMobileSecondary(e.target.value)}
                                  placeholder="Secondary number"
                                  className={inputClass}
                                />
                              </div>
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={allowWhatsapp}
                                  onChange={(e) => setAllowWhatsapp(e.target.checked)}
                                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm font-medium text-gray-800">Allow WhatsApp contact</span>
                              </label>
                            </div>
                            <div className="flex gap-3 text-sm text-gray-600 bg-sky-50/80 border border-sky-100 rounded-xl p-4 h-fit">
                              <Smartphone className="w-6 h-6 text-[#233D7B] shrink-0" />
                              <p>
                                Enter a genuine 11-digit Bangladesh mobile (01XXXXXXXXX). Buyers will reach you on this
                                number.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <Tip>{t('postAdForm.shared.tipNoPromo')}</Tip>
                        <Tip>{t('postAdForm.shared.tipRealisticPrice')}</Tip>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-10 pt-6 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="inline-flex items-center gap-1 px-5 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        type="submit"
                        className="px-10 py-3.5 rounded-lg bg-emerald-600 text-white font-bold uppercase tracking-wide text-sm hover:bg-emerald-700 shadow-md"
                      >
                        Submit &amp; Continue
                      </button>
                    </div>
                  </>
              ) : null}
              </>
            )}
            </div>
          )}
        </form>

        {status ? (
          <div
            className={`mt-4 text-sm font-semibold px-4 py-3 rounded-lg ${
              statusIsError ? 'bg-red-50 text-red-800 border border-red-100' : 'bg-emerald-50 text-emerald-900 border border-emerald-100'
            }`}
          >
            {status}
          </div>
        ) : null}

        <div className="mt-8">
          <SubscriptionPlansStrip />
        </div>
      </div>
    </div>
  );
}

function SimpleFields(props: {
  listingType: string;
  title: string;
  setTitle: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  year: string;
  setYear: (v: string) => void;
  mileage: string;
  setMileage: (v: string) => void;
  transmission: string;
  setTransmission: (v: string) => void;
  fuelType: string;
  setFuelType: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  brandSlug: string;
  setBrandSlug: (v: string) => void;
  vehicleModelId: string;
  setVehicleModelId: (v: string) => void;
  brands: BrandDto[];
  models: VehicleModelDto[];
  showVehicleFields: boolean;
  files: File[];
  previews: string[];
  onPickFiles: (list: FileList | null) => void;
  removeImage: (i: number) => void;
  inputClass: string;
  labelClass: string;
  tr: (key: string) => string;
}) {
  const {
    title,
    setTitle,
    city,
    setCity,
    year,
    setYear,
    mileage,
    setMileage,
    transmission,
    setTransmission,
    fuelType,
    setFuelType,
    price,
    setPrice,
    description,
    setDescription,
    brandSlug,
    setBrandSlug,
    vehicleModelId,
    setVehicleModelId,
    brands,
    models,
    showVehicleFields,
    previews,
    onPickFiles,
    removeImage,
    inputClass,
    labelClass,
    tr,
  } = props;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className={`${labelClass} mb-2 block`}>{tr('postAdForm.simple.title')}</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className={`${labelClass} mb-2 block`}>{tr('postAdForm.simple.make')}</label>
          <select value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)} className={inputClass}>
            <option value="">{tr('postAdForm.simple.anySkip')}</option>
            {brands.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={`${labelClass} mb-2 block`}>{tr('postAdForm.simple.model')}</label>
          <select
            value={vehicleModelId}
            onChange={(e) => setVehicleModelId(e.target.value)}
            disabled={!brandSlug || models.length === 0}
            className={`${inputClass} disabled:bg-gray-100`}
          >
            <option value="">{brandSlug ? tr('postAdForm.simple.selectModel') : tr('postAdForm.simple.pickMakeFirst')}</option>
            {models.map((m) => (
              <option key={m.id} value={String(m.id)}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`${labelClass} mb-2 block`}>{tr('postAdForm.simple.city')}</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass}>
            {BD_CITIES.map((c) => (
              <option key={c} value={c}>
                {tr(`postAdForm.cities.${c}`)}
              </option>
            ))}
          </select>
        </div>
        {showVehicleFields ? (
          <>
            <div>
              <label className={`${labelClass} mb-2 block`}>{tr('postAdForm.simple.year')}</label>
              <select value={year} onChange={(e) => setYear(e.target.value)} className={inputClass}>
                {Array.from({ length: 26 }, (_, i) => 2026 - i).map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`${labelClass} mb-2 block`}>{tr('postAdForm.simple.mileageKm')}</label>
              <input value={mileage} onChange={(e) => setMileage(e.target.value)} type="number" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} mb-2 block`}>{tr('postAdForm.simple.transmission')}</label>
              <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className={inputClass}>
                <option value="manual">{tr('postAdForm.simple.manual')}</option>
                <option value="automatic">{tr('postAdForm.simple.automatic')}</option>
              </select>
            </div>
            <div>
              <label className={`${labelClass} mb-2 block`}>{tr('postAdForm.simple.fuel')}</label>
              <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className={inputClass}>
                <option value="petrol">{tr('postAdForm.simple.petrol')}</option>
                <option value="diesel">{tr('postAdForm.simple.diesel')}</option>
                <option value="hybrid">{tr('postAdForm.simple.hybrid')}</option>
                <option value="electric">{tr('postAdForm.simple.electric')}</option>
              </select>
            </div>
          </>
        ) : null}
        <div>
          <label className={`${labelClass} mb-2 block`}>{tr('postAdForm.simple.priceBdt')}</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} required min={0} type="number" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={`${labelClass} mb-2 block`}>{tr('postAdForm.simple.description')}</label>
        <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} />
      </div>
      <div>
        <label className={`${labelClass} mb-3 block`}>{tr('postAdForm.simple.photos')}</label>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {previews.map((src, index) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {props.files.length < 12 ? (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-[#233D7B]">
              <Camera className="mb-1 h-8 w-8 text-gray-400" />
              <span className="text-xs text-gray-500">{tr('postAdForm.simple.addPhoto')}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  onPickFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
          ) : null}
        </div>
      </div>
    </>
  );
}
