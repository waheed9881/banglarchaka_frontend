import type { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

type PremiumSectionHeadingProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'left' | 'center';
  action?: ReactNode;
  className?: string;
};

/**
 * LUXEAUTO-style section title: small red eyebrow, large navy display heading, muted subtitle.
 */
export function PremiumSectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  action,
  className,
}: PremiumSectionHeadingProps) {
  const center = align === 'center';

  return (
    <div
      className={cn(
        center
          ? 'mx-auto mb-10 max-w-3xl text-center md:mb-12'
          : 'mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between md:gap-6',
        className,
      )}
    >
      <div className={cn(!center && 'min-w-0 max-w-3xl')}>
        {eyebrow != null && eyebrow !== '' ? (
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#ba0035]">{eyebrow}</p>
        ) : null}
        <h2 className="font-sans text-3xl font-bold tracking-[-0.02em] text-[#00236f] sm:text-4xl md:text-[2.5rem] md:leading-[1.12]">
          {title}
        </h2>
        {subtitle != null && subtitle !== '' ? (
          <div
            className={cn(
              'mt-3 text-base leading-relaxed text-slate-600 sm:text-lg [&_strong]:font-semibold [&_strong]:text-slate-800',
              center && 'mx-auto max-w-2xl text-pretty',
            )}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
      {action ? (
        <div
          className={cn(
            'flex flex-wrap gap-3',
            center ? 'mt-6 justify-center' : 'shrink-0 justify-start sm:justify-end',
          )}
        >
          {action}
        </div>
      ) : null}
    </div>
  );
}
