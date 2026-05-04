import Business from '@mui/icons-material/Business';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import Handyman from '@mui/icons-material/Handyman';
import TwoWheeler from '@mui/icons-material/TwoWheeler';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { cn } from '@/app/components/ui/utils';

/**
 * Homepage stats — aligned with Browse Used Cars section framing (max-width, padding, brand bars).
 */
export function HomeStatsStrip() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const statsList: {
    key: string;
    value: string;
    labelKey: 'hero.statCarsForSale' | 'hero.statBikesForSale' | 'hero.statDealers' | 'hero.statAutoPartsShort';
    onClick: () => void;
    accent: 'red' | 'green';
    Icon: typeof DirectionsCar;
  }[] = [
    {
      key: 'cars',
      value: '200K+',
      labelKey: 'hero.statCarsForSale',
      onClick: () => navigate('/listings?type=used_car'),
      accent: 'red',
      Icon: DirectionsCar,
    },
    {
      key: 'bikes',
      value: '50K+',
      labelKey: 'hero.statBikesForSale',
      onClick: () => navigate('/listings?type=used_bike'),
      accent: 'green',
      Icon: TwoWheeler,
    },
    {
      key: 'dealers',
      value: '5K+',
      labelKey: 'hero.statDealers',
      onClick: () => navigate('/used-car-dealers'),
      accent: 'red',
      Icon: Business,
    },
    {
      key: 'parts',
      value: '100K+',
      labelKey: 'hero.statAutoPartsShort',
      onClick: () => navigate('/listings?type=auto_part'),
      accent: 'green',
      Icon: Handyman,
    },
  ];

  const statsContainerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const statsItemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="border-y border-neutral-200 bg-neutral-50/80" aria-label={t('hero.statsStripAria')}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="mb-8 text-center lg:mb-10">
          <h2 className="text-balance text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
            {t('hero.statsStripTitle')}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-neutral-600 sm:text-[15px]">
            {t('hero.statsStripSubtitle')}
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8"
          variants={statsContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25, margin: '0px 0px -40px 0px' }}
        >
          {statsList.map((s) => {
            const Icon = s.Icon;

            return (
              <motion.button
                key={s.key}
                type="button"
                variants={statsItemVariants}
                onClick={s.onClick}
                className={cn(
                  'group relative flex min-h-[148px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-[0_4px_24px_-16px_rgba(15,23,42,0.08)] transition-all duration-200',
                  'hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_12px_36px_-20px_rgba(15,23,42,0.12)]',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red/35',
                )}
              >
                <span
                  className={cn(
                    'absolute inset-x-0 top-0 h-[3px]',
                    s.accent === 'red' ? 'bg-brand-red' : 'bg-brand-green',
                  )}
                  aria-hidden
                />

                <span
                  className={cn(
                    'mb-4 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12',
                    s.accent === 'red'
                      ? 'bg-[color:var(--brand-red)]/[0.09] text-[color:var(--brand-red)]'
                      : 'bg-[color:var(--brand-green)]/[0.09] text-[color:var(--brand-green)]',
                  )}
                >
                  <Icon sx={{ fontSize: 26 }} aria-hidden />
                </span>

                <span className="text-2xl font-bold tabular-nums tracking-tight text-neutral-900 sm:text-[1.65rem]">
                  {s.value}
                </span>
                <span className="mt-1.5 max-w-[14rem] text-[13px] font-medium leading-snug text-neutral-600 sm:text-sm">
                  {t(s.labelKey)}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
