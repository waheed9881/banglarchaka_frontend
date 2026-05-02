import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeaturedCars } from './components/FeaturedCars';
import { BrowseUsedCarsSection } from './components/BrowseUsedCarsSection';
import { BrowseByBrand } from './components/BrowseByBrand';
import { NewCars } from './components/NewCars';
import { Bikes } from './components/Bikes';
import { AutoParts } from './components/AutoParts';
import { CompareSection } from './components/CompareSection';
import { Services } from './components/Services';
import { Dealers } from './components/Dealers';
import { MobileApp } from './components/MobileApp';
import { Testimonials } from './components/Testimonials';
import { BlogNews } from './components/BlogNews';
import { QuickLinks } from './components/QuickLinks';
import { Footer } from './components/Footer';
import { ApiConnectionHint } from './components/ApiConnectionHint';
import { CarDetailPage } from './components/CarDetailPage';
import { ListingPage } from './components/ListingPage';
import { PostAdPage } from './components/PostAdPage';
import { NewCarDetailPage } from './components/NewCarDetailPage';
import { AdminFinancePage } from './components/AdminFinancePage';
import { AdminHrPage } from './components/AdminHrPage';
import { AdminModerationPage } from './components/AdminModerationPage';
import { DealerPortalLayout } from './components/DealerPortalLayout';
import { DealerPortalDashboard } from './components/DealerPortalDashboard';
import { DealerPortalHrPage } from './components/DealerPortalHrPage';
import { DealerPortalFinancePage } from './components/DealerPortalFinancePage';
import { DealerPublicPage } from './components/DealerPublicPage';
import { MessagesPage } from './components/MessagesPage';
import { WishlistPage } from './components/WishlistPage';
import { MyListingsPage } from './components/MyListingsPage';
import { EditListingPage } from './components/EditListingPage';
import { PaymentReturnEffects } from './components/PaymentReturnEffects';
import { BlogArchivePage } from './components/BlogArchivePage';
import { BlogArticlePage } from './components/BlogArticlePage';
import { LoginPage } from './components/LoginPage';
import { ComparePage } from './components/ComparePage';
import { SellCarLandingPage } from './components/SellCarLandingPage';
import { SellBikeLandingPage } from './components/SellBikeLandingPage';
import { InnerContentPage, type InnerListingFeed } from './components/InnerContentPage';
import { useEffect } from 'react';
import { setPageSeo } from '@/lib/seo';
import { getAuthToken } from '@/lib/api';

/** Stable refs for InnerContentPage feeds — avoids refetch loops from inline arrays */
const INNER_DEALERS_STRIP = { heading: 'Featured dealers', limit: 4 };

const INNER_FEEDS: Record<string, InnerListingFeed[]> = {
  videos: [
    { heading: 'Fresh used inventory', params: { listing_type: 'used_car', sort: 'newest' }, per_page: 6 },
    { heading: 'New car listings', params: { listing_type: 'new_car', sort: 'newest' }, per_page: 6 },
  ],
  forums: [
    { heading: 'Used cars', params: { listing_type: 'used_car', sort: 'views' }, per_page: 6 },
    { heading: 'Used bikes', params: { listing_type: 'used_bike', sort: 'newest' }, per_page: 6 },
  ],
  carPrices: [
    { heading: 'Used car asking prices', params: { listing_type: 'used_car', sort: 'price_desc' }, per_page: 6 },
    { heading: 'New car listings', params: { listing_type: 'new_car', sort: 'price_desc' }, per_page: 6 },
  ],
  carReviews: [
    { heading: 'Popular used cars', params: { listing_type: 'used_car', sort: 'views' }, per_page: 6 },
    {
      heading: 'Hybrid picks',
      params: { listing_type: 'used_car', fuel_type: 'hybrid', sort: 'newest' },
      per_page: 6,
    },
  ],
  newBikes: [
    { heading: 'New bike listings', params: { listing_type: 'new_bike', sort: 'newest' }, per_page: 6 },
    { heading: 'Used bikes', params: { listing_type: 'used_bike', sort: 'newest' }, per_page: 6 },
  ],
  bikePrices: [{ heading: 'Used bikes for sale', params: { listing_type: 'used_bike', sort: 'price_asc' }, per_page: 8 }],
  bikeReviews: [{ heading: 'Featured bikes', params: { listing_type: 'used_bike', sort: 'views' }, per_page: 8 }],
  accessories: [
    { heading: 'Accessory listings', params: { listing_type: 'accessory', sort: 'newest' }, per_page: 6 },
    { heading: 'Auto parts', params: { listing_type: 'auto_part', sort: 'newest' }, per_page: 6 },
  ],
  wheelsTyres: [
    { heading: 'Tyres & rims', params: { listing_type: 'tyre_rim', sort: 'newest' }, per_page: 6 },
    { heading: 'Related parts', params: { listing_type: 'auto_part', sort: 'newest' }, per_page: 6 },
  ],
  engineParts: [{ heading: 'Parts inventory', params: { listing_type: 'auto_part', sort: 'newest' }, per_page: 9 }],
  carCare: [
    { heading: 'Service listings', params: { listing_type: 'service', sort: 'newest' }, per_page: 6 },
    { heading: 'Parts & consumables', params: { listing_type: 'auto_part', sort: 'newest' }, per_page: 6 },
  ],
  sitemap: [{ heading: 'Trending used cars', params: { listing_type: 'used_car', sort: 'views' }, per_page: 6 }],
};
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router';
import { Toaster } from 'sonner';

function HomePage() {
  const location = useLocation();
  useEffect(() => {
    setPageSeo(
      'BanglarChaka — Cars, bikes & parts',
      'Buy and sell used and new cars, bikes, auto parts, tyres, accessories, and services across Bangladesh.',
    );
  }, []);
  useEffect(() => {
    const id = location.hash?.replace(/^#/, '');
    if (!id) return;
    queueMicrotask(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }));
  }, [location.pathname, location.hash]);

  return (
    <>
      <ApiConnectionHint />
      <Hero />
      <FeaturedCars />
      <div id="browse-used-cars">
        <BrowseUsedCarsSection />
      </div>
      <BrowseByBrand />
      <NewCars />
      <Bikes />
      <AutoParts />
      <CompareSection />
      <Services />
      <Dealers />
      <MobileApp />
      <Testimonials />
      <BlogNews />
      <QuickLinks />
      <Footer />
    </>
  );
}

function ListingRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const type = new URLSearchParams(location.search).get('type');
  return (
    <ListingPage
      onOpenDetail={(id) =>
        navigate(`${type === 'new_car' ? '/new-cars' : '/listings'}/${id}${location.search}`)
      }
    />
  );
}

function CarDetailRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  return <CarDetailPage listingId={id} onBack={() => navigate(`/listings${location.search}`)} />;
}

function NewCarRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <NewCarDetailPage listingId={id} onBack={() => navigate(`/listings${location.search}`)} />
  );
}

function PostAdRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  if (!getAuthToken()) {
    const next = `${location.pathname}${location.search}${location.hash || ''}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }
  return <PostAdPage onBack={() => navigate('/')} />;
}

function EditListingRoute() {
  const { id } = useParams();
  return <EditListingPage listingPublicId={id} />;
}

function VideosPage() {
  return (
    <InnerContentPage
      title="Videos"
      subtitle="Watch latest walkarounds, ownership reviews, and expert buying guides."
      highlights={[
        'Browse featured video reviews for cars and bikes',
        'Watch price update explainers and ownership tips',
        'Explore maintenance and troubleshooting videos',
        'Find new launch highlights and comparisons',
      ]}
      listingsSections={INNER_FEEDS.videos}
      dealersPreview={INNER_DEALERS_STRIP}
      quickLinks={[
        { label: 'Car Reviews', to: '/car-reviews' },
        { label: 'Bike Reviews', to: '/bike-reviews' },
        { label: 'Blog', to: '/blog' },
      ]}
    />
  );
}

function ForumsPage() {
  return (
    <InnerContentPage
      title="Forums"
      subtitle="Join community discussions with buyers, owners, and auto enthusiasts."
      highlights={[
        'Ask buying questions and get expert suggestions',
        'Discuss ownership costs and reliability',
        'Share modifications and maintenance experiences',
        'Track market trends and resale insights',
      ]}
      listingsSections={INNER_FEEDS.forums}
      dealersPreview={INNER_DEALERS_STRIP}
      quickLinks={[
        { label: 'Used Cars', to: '/listings?type=used_car' },
        { label: 'Used Bikes', to: '/listings?type=used_bike' },
      ]}
    />
  );
}

function CarPricesPage() {
  return (
    <InnerContentPage
      title="Car Prices"
      subtitle="Track current market price ranges before you buy or sell."
      highlights={[
        'Check new and used car market pricing',
        'Compare trims and model-year value shifts',
        'Review city-wise price differences',
        'Use pricing insight before negotiation',
      ]}
      listingsSections={INNER_FEEDS.carPrices}
      dealersPreview={INNER_DEALERS_STRIP}
      quickLinks={[
        { label: 'New Cars', to: '/listings?type=new_car' },
        { label: 'Used Cars', to: '/listings?type=used_car' },
      ]}
    />
  );
}

function CarReviewsPage() {
  return (
    <InnerContentPage
      title="Car Reviews"
      subtitle="Explore expert and owner feedback before making a decision."
      highlights={[
        'Read owner experience summaries',
        'Compare comfort, features, and reliability',
        'Check value-for-money analysis by segment',
        'Find pros/cons for top models',
      ]}
      listingsSections={INNER_FEEDS.carReviews}
      dealersPreview={INNER_DEALERS_STRIP}
      quickLinks={[
        { label: 'Blog', to: '/blog' },
        { label: 'Videos', to: '/videos' },
      ]}
    />
  );
}

function NewBikesPage() {
  return (
    <InnerContentPage
      title="New Bikes"
      subtitle="Discover latest bike models and expected launch updates."
      highlights={[
        'Browse upcoming bike launches',
        'Review expected prices and specs',
        'Compare commuter and sports options',
        'Find launch offers and availability insights',
      ]}
      listingsSections={INNER_FEEDS.newBikes}
      dealersPreview={INNER_DEALERS_STRIP}
      quickLinks={[
        { label: 'Used Bikes', to: '/listings?type=used_bike' },
        { label: 'Bike Prices', to: '/bike-prices' },
      ]}
    />
  );
}

function BikePricesPage() {
  return (
    <InnerContentPage
      title="Bike Prices"
      subtitle="Stay updated with bike pricing trends across categories."
      highlights={[
        'Check latest market prices for popular bikes',
        'Track recent price hikes and reductions',
        'Compare similar bikes by budget',
        'Use real-time pricing while buying/selling',
      ]}
      listingsSections={INNER_FEEDS.bikePrices}
      dealersPreview={INNER_DEALERS_STRIP}
      quickLinks={[
        { label: 'New Bikes', to: '/new-bikes' },
        { label: 'Used Bikes', to: '/listings?type=used_bike' },
      ]}
    />
  );
}

function BikeReviewsPage() {
  return (
    <InnerContentPage
      title="Bike Reviews"
      subtitle="Learn from rider feedback and expert test reports."
      highlights={[
        'See performance and mileage-focused reviews',
        'Compare riding comfort for daily use',
        'Evaluate maintenance and spare parts insights',
        'Review user-reported issues before purchase',
      ]}
      listingsSections={INNER_FEEDS.bikeReviews}
      dealersPreview={INNER_DEALERS_STRIP}
      quickLinks={[
        { label: 'Bikes Listings', to: '/listings?type=used_bike' },
        { label: 'Videos', to: '/videos' },
      ]}
    />
  );
}

function AccessoriesPage() {
  return (
    <InnerContentPage
      title="Accessories"
      subtitle="Find add-ons and styling options for your vehicle."
      highlights={[
        'Browse interior and exterior accessories',
        'Compare pricing from multiple sellers',
        'Check compatibility and fitment guidance',
        'Discover seasonal offers and bundles',
      ]}
      listingsSections={INNER_FEEDS.accessories}
      dealersPreview={INNER_DEALERS_STRIP}
      quickLinks={[
        { label: 'Auto Parts', to: '/listings?type=auto_part' },
        { label: 'Wheels & Tyres', to: '/wheels-tyres' },
      ]}
    />
  );
}

function WheelsTyresPage() {
  return (
    <InnerContentPage
      title="Wheels & Tyres"
      subtitle="Compare tyre options and wheel upgrades by size and usage."
      highlights={[
        'Filter tyres by size and vehicle type',
        'Compare performance and durability classes',
        'Estimate replacement and balancing cost',
        'Find dealer inventory and quick contact',
      ]}
      listingsSections={INNER_FEEDS.wheelsTyres}
      dealersPreview={INNER_DEALERS_STRIP}
      quickLinks={[
        { label: 'Auto Parts', to: '/listings?type=auto_part' },
        { label: 'Car Care', to: '/car-care' },
      ]}
    />
  );
}

function EnginePartsPage() {
  return (
    <InnerContentPage
      title="Engine Parts"
      subtitle="Search critical engine components with confidence."
      highlights={[
        'Discover OEM and aftermarket options',
        'Verify part fitment and model compatibility',
        'Compare trusted suppliers by price',
        'Reduce downtime with quick sourcing',
      ]}
      listingsSections={INNER_FEEDS.engineParts}
      dealersPreview={INNER_DEALERS_STRIP}
      quickLinks={[
        { label: 'Auto Parts', to: '/listings?type=auto_part' },
        { label: 'Accessories', to: '/accessories' },
      ]}
    />
  );
}

function CarCarePage() {
  return (
    <InnerContentPage
      title="Car Care"
      subtitle="Keep your vehicle healthy with regular care and detailing."
      highlights={[
        'Find cleaning and detailing products',
        'Discover preventive maintenance checklists',
        'Compare routine service consumables',
        'Track seasonal care recommendations',
      ]}
      listingsSections={INNER_FEEDS.carCare}
      dealersPreview={INNER_DEALERS_STRIP}
      quickLinks={[
        { label: 'Auto Parts', to: '/listings?type=auto_part' },
        { label: 'Blog', to: '/blog' },
      ]}
    />
  );
}

function TermsPage() {
  return (
    <InnerContentPage
      title="Terms & Conditions"
      subtitle="Understand platform usage rules and service boundaries."
      highlights={[
        'User responsibilities and acceptable use',
        'Listing moderation and content policy',
        'Transaction and dispute disclaimers',
        'Account suspension and enforcement rules',
      ]}
      quickLinks={[
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Sitemap', to: '/sitemap' },
      ]}
    />
  );
}

function PrivacyPage() {
  return (
    <InnerContentPage
      title="Privacy Policy"
      subtitle="How your data is collected, used, and protected."
      highlights={[
        'Information we collect from users',
        'How data is used for marketplace features',
        'Cookies and session management',
        'Retention, deletion, and contact rights',
      ]}
      quickLinks={[
        { label: 'Terms & Conditions', to: '/terms' },
        { label: 'Sitemap', to: '/sitemap' },
      ]}
    />
  );
}

function UsedCarsFeaturedPage() {
  return (
    <InnerContentPage
      title="Featured Used Cars"
      subtitle="Boosted listings sellers chose to highlight — shown ahead of regular results."
      highlights={[
        'Curated visibility for quality inventory',
        'Filter further from the main used car search',
        'Compare asking prices side by side',
        'Contact sellers while listings are fresh',
      ]}
      listingsSections={[
        {
          heading: 'Featured inventory',
          params: { listing_type: 'used_car', featured: 1, sort: 'newest' },
          per_page: 9,
        },
      ]}
      dealersPreview={INNER_DEALERS_STRIP}
      quickLinks={[
        { label: 'All used cars', to: '/listings?type=used_car' },
        { label: 'Post an ad', to: '/post-ad' },
      ]}
    />
  );
}

function UsedCarDealersPage() {
  return (
    <InnerContentPage
      title="Used Car Dealers"
      subtitle="Find verified dealers and browse inventory posted under dealer accounts."
      highlights={[
        'Filter dealer-posted stock in one place',
        'See response metrics where available',
        'Jump into each dealer’s public profile',
        'Mix dealer listings with private sellers from search',
      ]}
      listingsSections={[
        {
          heading: 'Latest dealer listings',
          params: { listing_type: 'used_car', dealer_only: 1, sort: 'newest' },
          per_page: 6,
        },
      ]}
      dealersPreview={{ heading: 'Browse dealers', limit: 50 }}
      quickLinks={[
        { label: 'Verified dealers only (search)', to: '/listings?type=used_car&verified_dealer_only=1' },
        { label: 'Home', to: '/' },
      ]}
    />
  );
}

function CertifiedCarsServicePage() {
  return (
    <InnerContentPage
      title="Certified Cars"
      subtitle="Learn how we surface listings that pass extra checks — availability varies by seller."
      highlights={[
        'Clearer expectations on condition and paperwork',
        'Badged listings when inspection data exists',
        'Always confirm details before payment',
        'Report listings that misrepresent condition',
      ]}
      listingsSections={[
        { heading: 'Recent used cars', params: { listing_type: 'used_car', sort: 'newest' }, per_page: 6 },
      ]}
      dealersPreview={INNER_DEALERS_STRIP}
      quickLinks={[
        { label: 'Browse used cars', to: '/listings?type=used_car' },
        { label: 'Featured picks', to: '/used-cars/featured' },
      ]}
    />
  );
}

function CarInspectionServicePage() {
  return (
    <InnerContentPage
      title="Car Inspection"
      subtitle="Professional inspection partnerships are rolling out — reserve and attach reports to your listing."
      highlights={[
        'Structured checklist covering mechanical basics',
        'Optional report badge on approved listings',
        'Better confidence for remote buyers',
        'City-by-city rollout — watch this space',
      ]}
      listingsSections={INNER_FEEDS.carReviews}
      dealersPreview={INNER_DEALERS_STRIP}
      quickLinks={[
        { label: 'Used cars', to: '/listings?type=used_car' },
        { label: 'Dealers', to: '/used-car-dealers' },
      ]}
    />
  );
}

function SellItForMeServicePage() {
  return (
    <InnerContentPage
      title="Sell It For Me"
      subtitle="Let our team handle photography, chats, and viewing coordination — you approve the final price."
      highlights={[
        'Less time spent on tire-kickers',
        'Listing copy tuned for search',
        'Coordinated handover once sold',
        'Contact support to join the pilot programme',
      ]}
      listingsSections={[
        { heading: 'Recently sold styles', params: { listing_type: 'used_car', sort: 'views' }, per_page: 6 },
      ]}
      dealersPreview={INNER_DEALERS_STRIP}
      quickLinks={[
        { label: 'Post an ad yourself', to: '/used-cars/sell' },
        { label: 'Car prices', to: '/car-prices' },
      ]}
    />
  );
}

function AuctionVerificationServicePage() {
  return (
    <InnerContentPage
      title="Auction Sheet Verification"
      subtitle="Verify auction-grade paperwork for imports when sellers upload scans — service expanding by port city."
      highlights={[
        'Cross-check auction sheet metadata',
        'Flag common tampering patterns',
        'Works best with original scans',
        'Adds confidence but is not a substitute for physical inspection',
      ]}
      listingsSections={[
        { heading: 'Import-style listings', params: { listing_type: 'used_car', sort: 'newest' }, per_page: 6 },
      ]}
      dealersPreview={INNER_DEALERS_STRIP}
      quickLinks={[
        { label: 'Browse used cars', to: '/listings?type=used_car' },
        { label: 'Blog', to: '/blog' },
      ]}
    />
  );
}

function SiteMapPage() {
  return (
    <InnerContentPage
      title="Sitemap"
      subtitle="Navigate all important sections from one place."
      highlights={[
        'Marketplace sections for cars, bikes, and parts',
        'Dealer and admin utility pages',
        'Knowledge sections like blog and forums',
        'Policy pages for terms and privacy',
      ]}
      listingsSections={INNER_FEEDS.sitemap}
      dealersPreview={INNER_DEALERS_STRIP}
      quickLinks={[
        { label: 'Home', to: '/' },
        { label: 'Listings', to: '/listings' },
        { label: 'Compare', to: '/compare' },
        { label: 'Post Ad', to: '/post-ad' },
        { label: 'Admin Moderation', to: '/admin/moderation' },
        { label: 'Blog', to: '/blog' },
      ]}
    />
  );
}

function AppShell() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen min-w-0 bg-white">
      <PaymentReturnEffects />
      <Toaster position="top-center" richColors />
      <Header onNavigate={(path) => navigate(path)} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<ListingRoute />} />
        <Route path="/listings/:id" element={<CarDetailRoute />} />
        <Route path="/new-cars" element={<Navigate to="/listings?type=new_car" replace />} />
        <Route path="/new-cars/:id" element={<NewCarRoute />} />
        <Route path="/post-ad" element={<PostAdRoute />} />
        <Route path="/admin/moderation" element={<AdminModerationPage />} />
        <Route path="/admin/hr" element={<AdminHrPage />} />
        <Route path="/admin/finance" element={<AdminFinancePage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/my-listings" element={<MyListingsPage />} />
        <Route path="/my-listings/:id/edit" element={<EditListingRoute />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/dealer/portal" element={<DealerPortalLayout />}>
          <Route index element={<DealerPortalDashboard />} />
          <Route path="hr" element={<DealerPortalHrPage />} />
          <Route path="finance" element={<DealerPortalFinancePage />} />
        </Route>
        <Route path="/dealers/:slug" element={<DealerPublicPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/forums" element={<ForumsPage />} />
        <Route path="/blog" element={<BlogArchivePage />} />
        <Route path="/blog/:slug" element={<BlogArticlePage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/car-prices" element={<CarPricesPage />} />
        <Route path="/car-reviews" element={<CarReviewsPage />} />
        <Route path="/new-bikes" element={<NewBikesPage />} />
        <Route path="/bike-prices" element={<BikePricesPage />} />
        <Route path="/bike-reviews" element={<BikeReviewsPage />} />
        <Route path="/accessories" element={<AccessoriesPage />} />
        <Route path="/wheels-tyres" element={<WheelsTyresPage />} />
        <Route path="/engine-parts" element={<EnginePartsPage />} />
        <Route path="/car-care" element={<CarCarePage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/sitemap" element={<SiteMapPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/used-cars/sell" element={<SellCarLandingPage />} />
        <Route path="/used-bikes/sell" element={<SellBikeLandingPage />} />
        <Route path="/used-cars/featured" element={<UsedCarsFeaturedPage />} />
        <Route path="/used-car-dealers" element={<UsedCarDealersPage />} />
        <Route path="/services/certified-cars" element={<CertifiedCarsServicePage />} />
        <Route path="/services/car-inspection" element={<CarInspectionServicePage />} />
        <Route path="/services/sell-it-for-me" element={<SellItForMeServicePage />} />
        <Route path="/services/auction-sheet-verification" element={<AuctionVerificationServicePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return <AppShell />;
}