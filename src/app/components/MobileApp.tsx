import { Smartphone } from 'lucide-react';

export function MobileApp() {
  return (
    <section className="py-16 bg-gradient-to-r from-green-600 to-teal-600">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-4">BanglarChaka on mobile</h2>
            <p className="text-xl text-green-100 mb-6">
              Buy & Sell Cars, Bikes and Auto Parts from anywhere in Bangladesh
            </p>

            <p className="text-green-100 mb-6 max-w-md">
              Native apps ship later — this site is mobile-first today. Add it to your home screen for a near-native
              experience while we finish store listings.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <div className="font-semibold">Post Ads for Free</div>
                  <div className="text-sm text-green-100">Sell your car in minutes</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <div className="font-semibold">Browse Millions of Ads</div>
                  <div className="text-sm text-green-100">Find your perfect vehicle</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <div className="font-semibold">Instant Notifications</div>
                  <div className="text-sm text-green-100">Never miss a deal</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                disabled
                title="Listing pending — use the mobile web app today."
                className="bg-black/40 text-white/70 px-6 py-3 rounded-lg flex items-center gap-3 cursor-not-allowed border border-white/10"
              >
                <div className="text-2xl">📱</div>
                <div className="text-left">
                  <div className="text-xs">App Store</div>
                  <div className="font-bold">Coming soon</div>
                </div>
              </button>
              <button
                type="button"
                disabled
                title="Listing pending — use the mobile web app today."
                className="bg-black/40 text-white/70 px-6 py-3 rounded-lg flex items-center gap-3 cursor-not-allowed border border-white/10"
              >
                <div className="text-2xl">▶️</div>
                <div className="text-left">
                  <div className="text-xs">Google Play</div>
                  <div className="font-bold">Coming soon</div>
                </div>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 flex justify-center">
              <div className="w-64 h-[500px] bg-white rounded-[3rem] shadow-2xl p-4 border-8 border-gray-800">
                <div className="w-full h-full bg-gradient-to-b from-blue-50 to-white rounded-[2rem] overflow-hidden">
                  <div className="bg-[#233D7B] text-white p-4 text-center">
                    <Smartphone className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-bold">BanglarChaka</div>
                    <div className="text-xs">Buy & Sell Cars</div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="bg-white rounded-lg shadow p-3">
                      <div className="h-20 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-3">
                      <div className="h-20 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-3">
                      <div className="h-20 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
