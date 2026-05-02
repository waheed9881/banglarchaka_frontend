import { Link } from 'react-router';

export const POST_AD_MENU_LINKS: Array<{ label: string; to: string }> = [
  { label: 'Sell Your Car', to: '/used-cars/sell' },
  { label: 'Sell Your Bike', to: '/used-bikes/sell' },
  { label: 'Sell Accessory', to: '/post-ad?type=accessory' },
];

export function PostAdDropdownPanel({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-xl border-b-[3px] border-b-[#C4161C] py-1 min-w-[15rem] ${className}`}
    >
      {POST_AD_MENU_LINKS.map((l) => (
        <Link
          key={l.label}
          to={l.to}
          className="block px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 hover:text-[#C4161C] transition-colors border-b border-gray-100 last:border-b-0"
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}
