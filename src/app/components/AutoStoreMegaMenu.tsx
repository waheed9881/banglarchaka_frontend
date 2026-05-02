import { Search, ShoppingCart, Tag } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

function StoreLink({
  title,
  desc,
  to,
  icon,
}: {
  title: string;
  desc: string;
  to: string;
  icon: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex gap-3 rounded-md px-3 py-3 -mx-1 hover:bg-gray-50 transition group/item border-b border-gray-100 last:border-b-0"
    >
      <span className="mt-0.5 shrink-0 text-gray-600 group-hover/item:text-[#C4161C] transition-colors">{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-gray-900 leading-snug">{title}</span>
        <span className="block text-xs text-gray-500 mt-1 leading-snug">{desc}</span>
      </span>
    </Link>
  );
}

export const AUTO_STORE_MOBILE_LINKS: Array<{ labelKey: string; to: string }> = [
  { labelKey: 'nav.mobileAutoStoreTitle', to: '/listings?type=auto_part' },
  { labelKey: 'nav.mobileAutoStoreFindParts', to: '/accessories' },
  { labelKey: 'nav.mobileAutoStoreSellParts', to: '/post-ad' },
];

export function AutoStoreMegaMenuPanel({ className = '' }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <div
      className={`rounded-tl-none rounded-tr-lg rounded-b-lg border border-t-0 border-gray-200 bg-white shadow-xl border-b-[3px] border-b-[#C4161C] ${className}`}
    >
      <div className="py-1 px-2 min-w-[min(100%,19rem)] max-w-[22rem]">
        <StoreLink
          title={t('mega.autoStore.storeTitle')}
          desc={t('mega.autoStore.storeDesc')}
          to="/listings?type=auto_part"
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <StoreLink
          title={t('mega.autoStore.findPartsTitle')}
          desc={t('mega.autoStore.findPartsDesc')}
          to="/accessories"
          icon={<Search className="w-5 h-5" />}
        />
        <StoreLink
          title={t('mega.autoStore.sellPartsTitle')}
          desc={t('mega.autoStore.sellPartsDesc')}
          to="/post-ad"
          icon={<Tag className="w-5 h-5" />}
        />
      </div>
    </div>
  );
}
