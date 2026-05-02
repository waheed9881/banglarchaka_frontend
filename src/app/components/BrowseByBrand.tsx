import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { fetchBrands, type BrandDto } from '@/lib/marketplace';

export function BrowseByBrand() {
  const [brands, setBrands] = useState<BrandDto[]>([]);

  useEffect(() => {
    fetchBrands()
      .then((rows) => setBrands(rows.slice(0, 8)))
      .catch(() => setBrands([]));
  }, []);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse Used Cars by Make</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/listings?type=used_car&brand_id=${brand.id}`}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-[#233D7B] transition text-center ring-1 ring-transparent hover:ring-[#233D7B]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#233D7B]"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-400">{brand.name[0]}</span>
              </div>
              <div className="font-semibold text-gray-900">{brand.name}</div>
              <div className="text-xs text-gray-500 mt-1">{brand.slug.toUpperCase()}</div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/listings?type=used_car"
            className="inline-flex border-2 border-[#233D7B] text-[#233D7B] px-8 py-3 rounded-lg hover:bg-[#233D7B] hover:text-white transition font-semibold"
          >
            View all brands
          </Link>
        </div>
      </div>
    </section>
  );
}
