import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizePriceDigits, pakPriceDigitsToHuman } from './listingPakFilterValidate';

type Props = { raw: string; className?: string };

/** Subtitle under min/max price fields: e.g. 100000 → "1 lac". */
export function PakPriceFilterHumanHint({ raw, className }: Props) {
  const { t } = useTranslation();
  const phrase = useMemo(() => pakPriceDigitsToHuman(normalizePriceDigits(raw), t), [raw, t]);
  if (!phrase) return null;
  return (
    <p className={className ?? 'mt-0.5 text-[11px] text-gray-500 leading-tight tabular-nums'}>{phrase}</p>
  );
}
