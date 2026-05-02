import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeaturedCars } from './components/FeaturedCars';
import { BrowseUsedCarsSection } from './components/BrowseUsedCarsSection';
import { BrowseByBrand } from './components/BrowseByBrand';
import { NewCars } from './components/NewCars';
import { NewCarsLandingPage } from './components/NewCarsLandingPage';
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
import { AdminLayout, AdminPanelIndexRedirect } from './components/AdminLayout';
import { AdminModerationPage } from './components/AdminModerationPage';
import { DealerPortalLayout } from './components/DealerPortalLayout';
import { AuctionDetailPage } from './components/AuctionDetailPage';
import { AuctionsPage } from './components/AuctionsPage';
import { DealerAuctionsPage } from './components/DealerAuctionsPage';
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
import { DealerPlanSelectionPage } from './components/DealerPlanSelectionPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { ComparePage } from './components/ComparePage';
import { SellCarLandingPage } from './components/SellCarLandingPage';
import { SellItForMeProtocol } from './components/SellItForMeProtocol';
import { SellBikeLandingPage } from './components/SellBikeLandingPage';
import { UsedBikesLandingPage } from './components/UsedBikesLandingPage';
import { InnerContentPage } from './components/InnerContentPage';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  featuredDealersStrip,
  innerFeedsAccessories,
  innerFeedsAuctionVerification,
  innerFeedsBikePrices,
  innerFeedsBikeReviews,
  innerFeedsCarCare,
  innerFeedsCarPrices,
  innerFeedsCarReviews,
  innerFeedsCertifiedCars,
  innerFeedsEngineParts,
  innerFeedsForums,
  innerFeedsNewBikes,
  innerFeedsSellItForMe,
  innerFeedsSitemap,
  innerFeedsUsedCarDealers,
  innerFeedsUsedCarsFeatured,
  innerFeedsVideos,
  innerFeedsWheelsTyres,
} from '@/i18n/innerFeeds';
import { useInnerPage } from '@/i18n/useInnerPage';
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
import { MarketPrefsProvider } from '@/app/context/MarketPrefsContext';

function HomePage() {
  const location = useLocation();
  const { t } = useTranslation();
  useEffect(() => {
    setPageSeo(t('home.seoTitle'), t('home.seoDesc'));
  }, [t]);
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
      {/* <MobileApp /> */}
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

function AuctionDetailRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <AuctionDetailPage auctionId={id} onBack={() => navigate('/auctions')} />;
}

function NewCarRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <NewCarDetailPage listingId={id} onBack={() => navigate('/new-cars')} />;
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
  const { t } = useTranslation();
  const page = useInnerPage('videos');
  return (
    <InnerContentPage
      title={page.title}
      subtitle={page.subtitle}
      highlights={page.highlights}
      listingsSections={innerFeedsVideos(t)}
      dealersPreview={featuredDealersStrip(t)}
      quickLinks={page.quickLinks}
    />
  );
}

function ForumsPage() {
  const { t } = useTranslation();
  const page = useInnerPage('forums');
  return (
    <InnerContentPage
      title={page.title}
      subtitle={page.subtitle}
      highlights={page.highlights}
      listingsSections={innerFeedsForums(t)}
      dealersPreview={featuredDealersStrip(t)}
      quickLinks={page.quickLinks}
    />
  );
}

function CarPricesPage() {
  const { t } = useTranslation();
  const page = useInnerPage('carPrices');
  return (
    <InnerContentPage
      title={page.title}
      subtitle={page.subtitle}
      highlights={page.highlights}
      listingsSections={innerFeedsCarPrices(t)}
      dealersPreview={featuredDealersStrip(t)}
      quickLinks={page.quickLinks}
    />
  );
}

function CarReviewsPage() {
  const { t } = useTranslation();
  const page = useInnerPage('carReviews');
  return (
    <InnerContentPage
      title={page.title}
      subtitle={page.subtitle}
      highlights={page.highlights}
      listingsSections={innerFeedsCarReviews(t)}
      dealersPreview={featuredDealersStrip(t)}
      quickLinks={page.quickLinks}
    />
  );
}

function NewBikesPage() {
  const { t } = useTranslation();
  const page = useInnerPage('newBikes');
  return (
    <InnerContentPage
      title={page.title}
      subtitle={page.subtitle}
      highlights={page.highlights}
      listingsSections={innerFeedsNewBikes(t)}
      dealersPreview={featuredDealersStrip(t)}
      quickLinks={page.quickLinks}
    />
  );
}

function BikePricesPage() {
  const { t } = useTranslation();
  const page = useInnerPage('bikePrices');
  return (
    <InnerContentPage
      title={page.title}
      subtitle={page.subtitle}
      highlights={page.highlights}
      listingsSections={innerFeedsBikePrices(t)}
      dealersPreview={featuredDealersStrip(t)}
      quickLinks={page.quickLinks}
    />
  );
}

function BikeReviewsPage() {
  const { t } = useTranslation();
  const page = useInnerPage('bikeReviews');
  return (
    <InnerContentPage
      title={page.title}
      subtitle={page.subtitle}
      highlights={page.highlights}
      listingsSections={innerFeedsBikeReviews(t)}
      dealersPreview={featuredDealersStrip(t)}
      quickLinks={page.quickLinks}
    />
  );
}

function AccessoriesPage() {
  const { t } = useTranslation();
  const page = useInnerPage('accessories');
  return (
    <InnerContentPage
      title={page.title}
      subtitle={page.subtitle}
      highlights={page.highlights}
      listingsSections={innerFeedsAccessories(t)}
      dealersPreview={featuredDealersStrip(t)}
      quickLinks={page.quickLinks}
    />
  );
}

function WheelsTyresPage() {
  const { t } = useTranslation();
  const page = useInnerPage('wheelsTyres');
  return (
    <InnerContentPage
      title={page.title}
      subtitle={page.subtitle}
      highlights={page.highlights}
      listingsSections={innerFeedsWheelsTyres(t)}
      dealersPreview={featuredDealersStrip(t)}
      quickLinks={page.quickLinks}
    />
  );
}

function EnginePartsPage() {
  const { t } = useTranslation();
  const page = useInnerPage('engineParts');
  return (
    <InnerContentPage
      title={page.title}
      subtitle={page.subtitle}
      highlights={page.highlights}
      listingsSections={innerFeedsEngineParts(t)}
      dealersPreview={featuredDealersStrip(t)}
      quickLinks={page.quickLinks}
    />
  );
}

function CarCarePage() {
  const { t } = useTranslation();
  const page = useInnerPage('carCare');
  return (
    <InnerContentPage
      title={page.title}
      subtitle={page.subtitle}
      highlights={page.highlights}
      listingsSections={innerFeedsCarCare(t)}
      dealersPreview={featuredDealersStrip(t)}
      quickLinks={page.quickLinks}
    />
  );
}

function TermsPage() {
  const page = useInnerPage('terms');
  return (
    <InnerContentPage title={page.title} subtitle={page.subtitle} highlights={page.highlights} quickLinks={page.quickLinks} />
  );
}

function PrivacyPage() {
  const page = useInnerPage('privacy');
  return (
    <InnerContentPage title={page.title} subtitle={page.subtitle} highlights={page.highlights} quickLinks={page.quickLinks} />
  );
}

function UsedCarsFeaturedPage() {
  const { t } = useTranslation();
  const page = useInnerPage('usedCarsFeatured');
  return (
    <InnerContentPage
      title={page.title}
      subtitle={page.subtitle}
      highlights={page.highlights}
      listingsSections={innerFeedsUsedCarsFeatured(t)}
      dealersPreview={featuredDealersStrip(t)}
      quickLinks={page.quickLinks}
    />
  );
}

function UsedCarDealersPage() {
  const { t } = useTranslation();
  const page = useInnerPage('usedCarDealers');
  return (
    <InnerContentPage
      title={page.title}
      subtitle={page.subtitle}
      highlights={page.highlights}
      listingsSections={innerFeedsUsedCarDealers(t)}
      dealersPreview={{ heading: t('common.browseDealers'), limit: 50 }}
      quickLinks={page.quickLinks}
    />
  );
}

function CertifiedCarsServicePage() {
  const { t } = useTranslation();
  const page = useInnerPage('certifiedCars');
  return (
    <InnerContentPage
      title={page.title}
      subtitle={page.subtitle}
      highlights={page.highlights}
      listingsSections={innerFeedsCertifiedCars(t)}
      dealersPreview={featuredDealersStrip(t)}
      quickLinks={page.quickLinks}
    />
  );
}

function CarInspectionServicePage() {
  const { t } = useTranslation();
  const page = useInnerPage('carInspection');
  return (
    <InnerContentPage
      title={page.title}
      subtitle={page.subtitle}
      highlights={page.highlights}
      listingsSections={innerFeedsCarReviews(t)}
      dealersPreview={featuredDealersStrip(t)}
      quickLinks={page.quickLinks}
    />
  );
}

function SellItForMeServicePage() {
  const { t } = useTranslation();
  const page = useInnerPage('sellItForMe');
  return (
    <InnerContentPage
      title={page.title}
      subtitle={page.subtitle}
      highlights={page.highlights}
      listingsSections={innerFeedsSellItForMe(t)}
      dealersPreview={featuredDealersStrip(t)}
      quickLinks={page.quickLinks}
      beforeHighlights={<SellItForMeProtocol />}
    />
  );
}

function AuctionVerificationServicePage() {
  const { t } = useTranslation();
  const page = useInnerPage('auctionVerification');
  return (
    <InnerContentPage
      title={page.title}
      subtitle={page.subtitle}
      highlights={page.highlights}
      listingsSections={innerFeedsAuctionVerification(t)}
      dealersPreview={featuredDealersStrip(t)}
      quickLinks={page.quickLinks}
    />
  );
}

function SiteMapPage() {
  const { t } = useTranslation();
  const page = useInnerPage('sitemap');
  return (
    <InnerContentPage
      title={page.title}
      subtitle={page.subtitle}
      highlights={page.highlights}
      listingsSections={innerFeedsSitemap(t)}
      dealersPreview={featuredDealersStrip(t)}
      quickLinks={page.quickLinks}
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
        <Route path="/auctions" element={<AuctionsPage />} />
        <Route
          path="/auctions/:id"
          element={<AuctionDetailRoute />}
        />
        <Route path="/new-cars" element={<NewCarsLandingPage />} />
        <Route path="/new-cars/:id" element={<NewCarRoute />} />
        <Route path="/post-ad" element={<PostAdRoute />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminPanelIndexRedirect />} />
          <Route path="moderation" element={<AdminModerationPage />} />
          <Route path="hr" element={<AdminHrPage />} />
          <Route path="finance" element={<AdminFinancePage />} />
        </Route>
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/my-listings" element={<MyListingsPage />} />
        <Route path="/my-listings/:id/edit" element={<EditListingRoute />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/dealer/portal" element={<DealerPortalLayout />}>
          <Route index element={<DealerPortalDashboard />} />
          <Route path="auctions" element={<DealerAuctionsPage />} />
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
        <Route path="/login" element={<LoginPage variant="login" />} />
        <Route path="/register" element={<LoginPage variant="register" />} />
        <Route path="/register/dealer-plan" element={<DealerPlanSelectionPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/used-cars/sell" element={<SellCarLandingPage />} />
        <Route path="/used-bikes" element={<UsedBikesLandingPage />} />
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
  return (
    <MarketPrefsProvider>
      <AppShell />
    </MarketPrefsProvider>
  );
}