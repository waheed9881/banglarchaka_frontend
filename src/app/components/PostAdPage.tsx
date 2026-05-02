import { ArrowLeft, Bike, Camera, Car, CheckCircle2, Lightbulb, Smartphone, Tag, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
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

const LISTING_TYPES = [
  { value: 'used_car', label: 'Used car' },
  { value: 'new_car', label: 'New car' },
  { value: 'used_bike', label: 'Used bike' },
  { value: 'new_bike', label: 'New bike' },
  { value: 'auto_part', label: 'Auto part' },
  { value: 'tyre_rim', label: 'Tyre / rim' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'service', label: 'Service' },
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

const BIKE_FEATURE_OPTIONS = [
  { key: 'anti_theft_lock', label: 'Anti Theft Lock' },
  { key: 'disc_brake', label: 'Disc Brake' },
  { key: 'led_light', label: 'Led Light' },
  { key: 'wind_shield', label: 'Wind Shield' },
] as const;

function emptyBikeFeatures(): Record<(typeof BIKE_FEATURE_OPTIONS)[number]['key'], boolean> {
  return Object.fromEntries(BIKE_FEATURE_OPTIONS.map((o) => [o.key, false])) as Record<
    (typeof BIKE_FEATURE_OPTIONS)[number]['key'],
    boolean
  >;
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

function isKnownListingType(value: string | null): value is (typeof LISTING_TYPES)[number]['value'] {
  return !!value && LISTING_TYPES.some((t) => t.value === value);
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
  const [registeredIn, setRegisteredIn] = useState('unregistered');
  const [exteriorColor, setExteriorColor] = useState('');
  const [mobilePrimary, setMobilePrimary] = useState('');
  const [mobileSecondary, setMobileSecondary] = useState('');
  const [allowWhatsapp, setAllowWhatsapp] = useState(true);

  const [bikeAssembly, setBikeAssembly] = useState('');
  const [bikeEngineType, setBikeEngineType] = useState('');
  const [bikeFeatures, setBikeFeatures] = useState(emptyBikeFeatures);

  useEffect(() => {
    setPageSeo('Post an ad · BanglarChaka', 'Create a listing for your vehicle, part, tyre, accessory, or service.');
  }, []);

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

  const conditionDefault = useMemo(() => {
    return listingType === 'new_car' || listingType === 'new_bike' ? 'new' : 'used';
  }, [listingType]);

  const showVehicleFields =
    listingType === 'used_car' ||
    listingType === 'new_car' ||
    listingType === 'used_bike' ||
    listingType === 'new_bike';

  const isBike = listingType === 'used_bike' || listingType === 'new_bike';
  const vehicleWord = isBike ? 'Bike' : 'Car';
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
      setStatus(bikePakStyle ? 'Please enter make / model.' : 'Please enter title / make-model-version.');
      return false;
    }
    if (!city.trim()) {
      setStatus('Please select a city.');
      return false;
    }
    if (!bikePakStyle && !exteriorColor) {
      setStatus('Please select exterior color.');
      return false;
    }
    if (bikePakStyle && !bikeEngineType) {
      setStatus('Please select engine type.');
      return false;
    }
    if (bikePakStyle) {
      const d = description.trim();
      if (d.length < 25) {
        setStatus('Please describe your bike (at least 25 characters).');
        return false;
      }
    }
    if (listingType === 'used_car' || listingType === 'used_bike') {
      if (mileage === '' || Number.isNaN(Number(mileage))) {
        setStatus('Please enter valid mileage (km).');
        return false;
      }
    }
    setStatus('');
    return true;
  };

  const validateWizardFinalFields = () => {
    if (!price.trim() || Number(price) < 0) {
      setStatus('Please enter a valid asking price.');
      return false;
    }
    if (!bikePakStyle && !carPakStyle && !description.trim()) {
      setStatus('Please write a short description for buyers.');
      return false;
    }
    setStatus('');
    return true;
  };

  const validateCarPakSinglePage = () => {
    if (!title.trim()) {
      setStatus('Please enter make / model / version.');
      return false;
    }
    if (!city.trim()) {
      setStatus('Please select a city.');
      return false;
    }
    if (!exteriorColor) {
      setStatus('Please select exterior color.');
      return false;
    }
    if (mileage === '' || Number.isNaN(Number(mileage))) {
      setStatus('Please enter valid mileage (km).');
      return false;
    }
    if (!price.trim() || Number(price) < 0) {
      setStatus('Please enter a valid asking price.');
      return false;
    }
    if (!description.trim()) {
      setStatus('Please write your ad description.');
      return false;
    }
    setStatus('');
    return true;
  };

  const goNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!getAuthToken()) {
      setStatus('Please sign in (header) before posting.');
      return;
    }
    if (useSellWizard && bikePakStyle && !validateStep1()) return;
    if (useSellWizard && carPakStyle && !validateCarPakSinglePage()) return;
    if (useSellWizard && !bikePakStyle && !carPakStyle && !validateWizardFinalFields()) return;
    if (useSellWizard && !validateStep3Contact()) return;

    setStatus('Submitting…');
    try {
      const cat = categoryForListingType(categories, listingType);
      if (!cat) throw new Error('Categories not loaded — run seeders or refresh.');

      const brand = brandSlug ? brands.find((b) => b.slug === brandSlug) : undefined;
      const dyn: Record<string, unknown> = {
        registered_in: registeredIn,
        exterior_color: exteriorColor || null,
        whatsapp_contact: allowWhatsapp,
      };
      if (bikePakStyle) {
        if (bikeAssembly) dyn.bike_assembly = bikeAssembly;
        dyn.bike_engine_type = bikeEngineType || null;
        const feats = BIKE_FEATURE_OPTIONS.filter((o) => bikeFeatures[o.key]).map((o) => o.label);
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
      if (!listingId) throw new Error('Unexpected API response (missing listing id).');

      if (files.length > 0) {
        const fd = new FormData();
        files.forEach((f) => fd.append('files[]', f));
        await apiFetch(`/listings/${listingId}/media`, { method: 'POST', body: fd });
      }

      previews.forEach((u) => URL.revokeObjectURL(u));
      navigate(`/my-listings/${listingId}/edit`, { replace: true });
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Submit failed');
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#233D7B]/25 focus:border-[#233D7B] outline-none transition-shadow';
  const labelClass = 'text-sm font-medium text-gray-700';

  const WizardIcon1 = bikePakStyle ? Bike : Car;
  const wizardSteps = [
    { n: 1, label: `Enter Your ${vehicleWord} Information`, Icon: WizardIcon1 },
    { n: 2, label: 'Upload Photos', Icon: Camera },
    { n: 3, label: 'Enter Your Selling Price', Icon: Tag },
  ];

  const validateStep3Contact = () => {
    const digits = mobilePrimary.replace(/\D/g, '');
    if (!mobilePrimary.trim()) {
      setStatus('Please enter your mobile number.');
      return false;
    }
    if (digits.length < 11) {
      setStatus('Enter a valid 11-digit mobile (01XXXXXXXXX).');
      return false;
    }
    setStatus('');
    return true;
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      {useSellWizard ? (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 pt-10 pb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#233D7B] tracking-tight">
              Sell your {vehicleWord} With 3 Easy &amp; Simple Steps!
            </h1>
            <p className="mt-2 text-gray-600 text-sm sm:text-base">It&apos;s free and takes less than a minute</p>

            <div className="flex items-center justify-center gap-2 sm:gap-6 mt-10 max-w-xl mx-auto">
              {wizardSteps.map(({ n, label, Icon }, i) => (
                <div key={n} className="flex items-center gap-2 sm:gap-6 flex-1 min-w-0">
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <div
                      className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors ${
                        bikePakStyle || carPakStyle || step >= n ? 'bg-sky-100 text-[#233D7B]' : 'bg-gray-100 text-gray-400'
                      } ${!bikePakStyle && !carPakStyle && step === n ? 'ring-2 ring-[#233D7B] ring-offset-2' : ''}`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-gray-600 mt-2 text-center leading-tight px-0.5">
                      {label}
                    </span>
                  </div>
                  {i < wizardSteps.length - 1 ? (
                    <div
                      className={`h-px flex-1 min-w-[12px] mb-6 ${bikePakStyle || carPakStyle || step > n ? 'bg-[#233D7B]/40' : 'bg-gray-200'}`}
                      aria-hidden
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#233D7B] via-[#1a3266] to-[#152a52] text-white py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Post Your Ad</h1>
            <p className="text-lg text-white/85">Signed-in users create real listings and can attach photos.</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <SubscriptionPlansStrip />

        <form onSubmit={submit} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/80 px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
            <span className={`${labelClass} text-xs uppercase tracking-wide text-gray-500`}>Listing type</span>
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
              className={`${inputClass} max-w-[220px] py-2 text-sm`}
            >
              {LISTING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
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
                }}
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#C4161C] text-white py-3.5 rounded-lg font-bold hover:bg-red-700 transition"
                >
                  Post Your Ad
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 border-2 border-gray-200 text-gray-700 py-3.5 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Cancel
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
                      <h2 className="text-xl font-bold text-gray-900">Bike Information</h2>
                      <p className="text-sm text-gray-500 mt-1">All fields marked with * are mandatory</p>
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
                                  {c}
                                </option>
                              ))}
                            </select>
                            <div className="mt-2 lg:hidden">
                              <Tip>We don&apos;t allow duplicates of the same ad.</Tip>
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
                                {c}
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
                                {a}
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
                              {BIKE_ENGINE_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                            <div className="mt-2 lg:hidden">
                              <Tip>We don&apos;t allow promotional messages that are not relevant to the ad.</Tip>
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
                        <Tip>We don&apos;t allow duplicates of the same ad.</Tip>
                        <Tip>We don&apos;t allow promotional messages that are not relevant to the ad.</Tip>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Expected Selling Price</h2>
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
                      <Tip>Please enter a realistic price to get more genuine responses.</Tip>
                    </div>
                  </section>

                  <section className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Additional Information</h2>
                    <p className="text-sm font-medium text-gray-700 mb-4">Features</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {BIKE_FEATURE_OPTIONS.map((o) => (
                        <label key={o.key} className="flex items-center gap-3 cursor-pointer text-sm text-gray-800">
                          <input
                            type="checkbox"
                            checked={bikeFeatures[o.key]}
                            onChange={(e) => setBikeFeatures((prev) => ({ ...prev, [o.key]: e.target.checked }))}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          {o.label}
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
                      {[
                        'Adding at least 5 pictures improves the chances for a quick sale.',
                        "Photos should be in jpeg, jpg, png, gif format.",
                        'Adding clear front, back and side pictures increases the quality of your ad.',
                        'Pictures should be 800×600 centred-frame shots when possible.',
                      ].map((t) => (
                        <div key={t} className="flex gap-2 items-start">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                          <span>{t}</span>
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
                      <h2 className="text-xl font-bold text-gray-900">Car Information</h2>
                      <p className="text-sm text-gray-500 mt-1">All fields marked with * are mandatory</p>
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
                                  {c}
                                </option>
                              ))}
                            </select>
                            <div className="mt-2 lg:hidden">
                              <Tip>We don&apos;t allow duplicates of the same ad.</Tip>
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
                            <option value="">Exterior Color</option>
                            {EXTERIOR_COLORS.map((c) => (
                              <option key={c} value={c}>
                                {c}
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
                              <option value="">{brandSlug ? 'Select model' : 'Pick make first'}</option>
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
                        <Tip>We don&apos;t allow duplicates of the same ad.</Tip>
                        <Tip>We don&apos;t allow promotional messages that are not relevant to the ad.</Tip>
                        <Tip>Please enter a realistic price to get more genuine responses.</Tip>
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
                      {[
                        'Adding at least 3 pictures improves the chances for a quick sale.',
                        'Photos should be in jpeg, jpg, png, gif format only.',
                        'Adding clear front, back and interior pictures increases quality of your ad.',
                        'Pictures should be 600×450 centred-frame shots when possible.',
                      ].map((t) => (
                        <div key={t} className="flex gap-2 items-start">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                          <span>{t}</span>
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
                      <h2 className="text-xl font-bold text-gray-900">{vehicleWord} information</h2>
                      <p className="text-sm text-gray-500 mt-1">(All fields marked with * are mandatory)</p>
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
                                  {c}
                                </option>
                              ))}
                            </select>
                            <div className="mt-2 lg:hidden">
                              <Tip>We don&apos;t allow duplicate ads for the same vehicle.</Tip>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 items-start sm:items-center">
                          <label className={`${labelClass} sm:text-right sm:pt-2`}>
                            {vehicleWord} info <span className="text-red-500">*</span>
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
                          <option value="">Exterior Color</option>
                          {EXTERIOR_COLORS.map((c) => (
                            <option key={c} value={c}>
                              {c}
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
                            <Tip>Please avoid promotional text that isn&apos;t relevant to the ad.</Tip>
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
                            <option value="">{brandSlug ? 'Select model' : 'Pick make first'}</option>
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
                      <Tip>We don&apos;t allow duplicate ads for the same vehicle.</Tip>
                      <Tip>Please avoid promotional text that isn&apos;t relevant to the ad.</Tip>
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
                    {[
                      'Adding several pictures improves chances for a quick sale.',
                      'Include front, back and interior shots where possible.',
                      'Use jpeg, jpg, png, or webp format.',
                      'Prefer well-lit, centred photos.',
                    ].map((t) => (
                      <div key={t} className="flex gap-2 items-start">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                        <span>{t}</span>
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
                        <Tip>We don&apos;t allow promotional messages that are not relevant to the ad.</Tip>
                        <Tip>Please enter a realistic price to get more genuine responses.</Tip>
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
              /fail|sign in|Please enter|Please select|Please write|valid 11-digit/i.test(status)
                ? 'bg-red-50 text-red-800 border border-red-100'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-100'
            }`}
          >
            {status}
          </div>
        ) : null}
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
  } = props;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className={`${labelClass} mb-2 block`}>Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className={`${labelClass} mb-2 block`}>Make</label>
          <select value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)} className={inputClass}>
            <option value="">Any / skip</option>
            {brands.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={`${labelClass} mb-2 block`}>Model</label>
          <select
            value={vehicleModelId}
            onChange={(e) => setVehicleModelId(e.target.value)}
            disabled={!brandSlug || models.length === 0}
            className={`${inputClass} disabled:bg-gray-100`}
          >
            <option value="">{brandSlug ? 'Select model' : 'Pick a make first'}</option>
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
          <label className={`${labelClass} mb-2 block`}>City</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass}>
            {BD_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {showVehicleFields ? (
          <>
            <div>
              <label className={`${labelClass} mb-2 block`}>Year</label>
              <select value={year} onChange={(e) => setYear(e.target.value)} className={inputClass}>
                {Array.from({ length: 26 }, (_, i) => 2026 - i).map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`${labelClass} mb-2 block`}>Mileage (KM)</label>
              <input value={mileage} onChange={(e) => setMileage(e.target.value)} type="number" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} mb-2 block`}>Transmission</label>
              <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className={inputClass}>
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>
            <div>
              <label className={`${labelClass} mb-2 block`}>Fuel</label>
              <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className={inputClass}>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
              </select>
            </div>
          </>
        ) : null}
        <div>
          <label className={`${labelClass} mb-2 block`}>Price (BDT) *</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} required min={0} type="number" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={`${labelClass} mb-2 block`}>Description</label>
        <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} />
      </div>
      <div>
        <label className={`${labelClass} mb-3 block`}>Photos</label>
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
              <span className="text-xs text-gray-500">Add</span>
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
