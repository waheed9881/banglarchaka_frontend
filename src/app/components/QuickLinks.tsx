import { Link } from 'react-router';

export function QuickLinks() {
  const popularSearches = [
    'Toyota Corolla',
    'Honda Civic',
    'Suzuki Alto',
    'Honda CD 70',
    'Yamaha YBR',
    'Mercedes C Class',
    'BMW 3 Series',
    'Cultus VXR',
  ];

  const cities = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Sylhet', 'Gazipur', 'Barishal', 'Rangpur'];

  return (
    <section className="py-12 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Popular searches</h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search) => (
                <Link
                  key={search}
                  to={`/listings?type=used_car&q=${encodeURIComponent(search)}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-[#233D7B] hover:text-white transition"
                >
                  {search}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Browse by city</h3>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <Link
                  key={city}
                  to={`/listings?type=used_car&city=${encodeURIComponent(city)}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-[#233D7B] hover:text-white transition"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { title: 'Live catalog', body: 'Cars, bikes & parts from real sellers', to: '/listings?type=used_car' },
              { title: 'Smart search', body: 'Filters by city, price, specs & more', to: '/listings?type=used_car' },
              { title: 'Dealers', body: 'Browse showroom listings where available', to: '/used-car-dealers' },
              { title: 'Safe browsing', body: 'Read listings fully before you contact', to: '/privacy' },
            ].map((item) => (
              <Link key={item.title} to={item.to} className="group rounded-lg p-2 hover:bg-white/60 transition">
                <div className="text-lg font-bold text-[#233D7B] group-hover:underline">{item.title}</div>
                <div className="text-sm text-gray-600 mt-1 leading-snug">{item.body}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
