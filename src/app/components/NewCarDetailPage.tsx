import { Calculator, FileText, CheckCircle, Heart, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { getAuthToken } from '@/lib/api';
import { fetchMe, type MeResponse } from '@/lib/auth';
import { addToWishlist, fetchWishlistListings, removeFromWishlist } from '@/lib/engagement';
import { fetchListingById, formatMoney, type ListingDto } from '@/lib/marketplace';
import { setPageSeo } from '@/lib/seo';
import { ListingMediaGallery } from './ListingMediaGallery';
import { ListingReviewsSection } from './ListingReviewsSection';
import { PromoteListingPanel } from './PromoteListingPanel';

export function NewCarDetailPage({ listingId, onBack }: { listingId?: string; onBack?: () => void }) {
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [car, setCar] = useState<ListingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const fallback =
    'https://images.unsplash.com/photo-1705747401901-28363172fe7e?auto=format&fit=crop&w=1080&q=80';

  const variants = car
    ? [
        { name: `${car.title} Base`, price: formatMoney(car.price, car.currency) },
        { name: `${car.title} Mid`, price: formatMoney((Number(car.price || 0) * 1.05).toFixed(0), car.currency) },
        { name: `${car.title} Top`, price: formatMoney((Number(car.price || 0) * 1.1).toFixed(0), car.currency) },
      ]
    : [];

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      const row = listingId ? await fetchListingById(listingId) : null;
      if (mounted) {
        setCar(row);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [listingId]);

  useEffect(() => {
    if (!car) return;
    const desc =
      typeof car.description === 'string' && car.description.trim()
        ? car.description.trim().slice(0, 160)
        : `${formatMoney(car.price, car.currency)} · ${car.location_city || 'Bangladesh'}`;
    setPageSeo(`${car.title} · New cars · BanglarChaka`, desc);
  }, [car]);

  useEffect(() => {
    fetchMe().then(setMe);
  }, []);

  useEffect(() => {
    if (!car || !getAuthToken()) {
      setWishlisted(false);
      return;
    }
    fetchWishlistListings()
      .then((rows) => setWishlisted(rows.some((r) => r.id === car.id)))
      .catch(() => setWishlisted(false));
  }, [car]);

  const meId = me?.id ?? null;
  const canMessageSeller = !!(car && meId !== null && car.seller?.id !== undefined && car.seller.id !== meId);
  const canBoostListing = !!(car && (car.can_manage ?? false));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-[#233D7B]">Home</Link>
            <span>›</span>
            <button onClick={onBack} className="hover:text-[#233D7B]">New Cars</button>
            <span>›</span>
            <span className="text-gray-900">{car?.title || 'Car Detail'}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#233D7B] to-[#1a2d5a] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{car?.title || 'New Car'}</h1>
              <p className="text-blue-100">
                Real photos and buyer reviews load from your listing — scroll down for the reviews section.
              </p>
            </div>
            <div />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="rounded-lg bg-white p-10 text-center text-gray-600 shadow">Loading listing…</div>
        ) : !car ? (
          <div className="rounded-lg bg-white p-10 text-center text-gray-800 shadow">
            Listing not found or not published.
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-6 rounded-lg bg-white p-4 shadow-lg">
              <ListingMediaGallery media={car.media} title={car.title} fallbackSrc={fallback} />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Select Variant</h2>
              <div className="grid gap-4">
                {variants.map((variant, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedVariant(idx)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedVariant === idx
                        ? 'border-[#233D7B] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-lg">{variant.name}</div>
                        <div className="text-sm text-gray-600 mt-1">Ex-Factory Price</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#3EB549]">{variant.price}</div>
                        <button className="text-sm text-[#233D7B] hover:underline">View Details</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Key Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-2">🚗</div>
                  <div className="text-sm text-gray-600">Engine</div>
                  <div className="font-bold">{car?.dynamic_attributes?.engine || '1300 cc'}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-2">⚙️</div>
                  <div className="text-sm text-gray-600">Transmission</div>
                  <div className="font-bold">{car?.transmission || 'Manual'}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-2">⛽</div>
                  <div className="text-sm text-gray-600">Fuel Average</div>
                  <div className="font-bold">{car?.dynamic_attributes?.mileage || '14 KM/L'}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-2">💺</div>
                  <div className="text-sm text-gray-600">Seating</div>
                  <div className="font-bold">5 Persons</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                {car?.description || 'Official new car overview will appear here.'}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Features & Specifications</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-3 text-[#233D7B]">Exterior Features</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">LED Headlights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Fog Lights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Alloy Wheels</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Power Side Mirrors</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3 text-[#233D7B]">Interior Features</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Fabric Seats</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Power Windows</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Cruise Control</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Multi-function Steering</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3 text-[#233D7B]">Safety Features</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Dual Airbags</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">ABS Brakes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Immobilizer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Child Lock</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ListingReviewsSection listingPublicId={car.id} />
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6 mb-6">
              <div className="text-center mb-6">
                <div className="text-sm text-gray-600 mb-2">Starting Price</div>
                <div className="text-4xl font-bold text-[#3EB549] mb-1">{formatMoney(car?.price, car?.currency || 'BDT')}</div>
                <div className="text-sm text-gray-600">Ex-Factory Price</div>
              </div>

              <div className="space-y-3 mb-6">
                <button className="w-full bg-[#C4161C] text-white py-3 rounded-lg font-bold hover:bg-red-700 transition">
                  Get On-Road Price
                </button>
                <button className="w-full bg-[#233D7B] text-white py-3 rounded-lg font-bold hover:bg-[#1a2d5a] transition flex items-center justify-center gap-2">
                  <Calculator className="w-5 h-5" />
                  EMI Calculator
                </button>
                <button className="w-full bg-[#3EB549] text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
                  Book Test Drive
                </button>
                <button
                  type="button"
                  className="w-full py-3 rounded-lg border-2 border-gray-200 font-semibold flex items-center justify-center gap-2 hover:border-[#C4161C]"
                  onClick={() => {
                    if (!car || !getAuthToken()) {
                      window.alert('Sign in to use wishlist.');
                      return;
                    }
                    (wishlisted ? removeFromWishlist(car.id) : addToWishlist(car.id))
                      .then(() => setWishlisted(!wishlisted))
                      .catch((err) => window.alert(err instanceof Error ? err.message : 'Wishlist failed'));
                  }}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'text-[#C4161C] fill-current' : ''}`} />
                  {wishlisted ? 'Saved to wishlist' : 'Save to wishlist'}
                </button>
                <button
                  type="button"
                  disabled={!canMessageSeller}
                  className="w-full bg-[#233D7B] text-white py-3 rounded-lg font-bold hover:bg-[#1a2d5a] transition disabled:opacity-40 flex items-center justify-center gap-2"
                  onClick={() => {
                    if (!car || !getAuthToken()) {
                      window.alert('Sign in to message the seller.');
                      return;
                    }
                    if (!canMessageSeller) return;
                    navigate(`/messages?listing=${encodeURIComponent(car.id)}`);
                  }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Message seller
                </button>
                <button className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:border-[#233D7B] hover:text-[#233D7B] transition flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  Get Brochure
                </button>
              </div>

              {canBoostListing ? (
                <div className="mt-6">
                  <PromoteListingPanel listingPublicId={car.id} listingTitle={car.title} />
                </div>
              ) : null}

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-bold mb-3">Available Colors</h4>
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 cursor-pointer hover:border-[#233D7B]"></div>
                  <div className="w-10 h-10 rounded-full bg-black border-2 border-gray-300 cursor-pointer hover:border-[#233D7B]"></div>
                  <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-gray-300 cursor-pointer hover:border-[#233D7B]"></div>
                  <div className="w-10 h-10 rounded-full bg-red-600 border-2 border-gray-300 cursor-pointer hover:border-[#233D7B]"></div>
                  <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-gray-300 cursor-pointer hover:border-[#233D7B]"></div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-lg p-6 text-white">
              <h4 className="font-bold text-lg mb-3">Special Offer!</h4>
              <p className="text-sm text-orange-100 mb-4">Get instant loan approval with easy monthly installments</p>
              <button className="w-full bg-white text-orange-600 py-2 rounded-lg font-bold hover:bg-gray-100 transition">
                Apply for Loan
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
