import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export const POST_AD_MENU_LINKS: Array<{ labelKey: string; to: string }> = [
  { labelKey: 'postAd.sellYourCar', to: '/used-cars/sell' },
  { labelKey: 'postAd.sellYourBike', to: '/used-bikes/sell' },
  { labelKey: 'postAd.sellAccessory', to: '/post-ad?type=accessory' },
];

export function PostAdDropdownPanel({ className = '' }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-xl border-b-[3px] border-b-[#C4161C] py-1 min-w-[15rem] ${className}`}
    >
      {POST_AD_MENU_LINKS.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          className="block px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 hover:text-[#C4161C] transition-colors border-b border-gray-100 last:border-b-0"
        >
          {t(l.labelKey)}
        </Link>
      ))}
    </div>
  );
}
