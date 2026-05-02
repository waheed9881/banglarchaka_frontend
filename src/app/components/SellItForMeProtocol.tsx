import {
  ArrowRight,
  Car,
  ClipboardCheck,
  Handshake,
  MapPin,
  Megaphone,
  SearchCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

type StepIcon = typeof Car;

const STEP_ICONS: StepIcon[] = [Car, MapPin, ClipboardCheck, SearchCheck, Megaphone, Handshake];

export function SellItForMeProtocol() {
  const { t } = useTranslation();
  const steps = t('sellItForMePage.steps', { returnObjects: true });
  const stepList = Array.isArray(steps)
    ? (steps as { title: string; body: string }[])
    : [];

  return (
    <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-200/80 overflow-hidden border-t-4 border-[#233D7B]">
      <div className="p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#233D7B] tracking-tight">
          {t('sellItForMePage.protocolHeading')}
        </h2>
        <p className="mt-3 text-gray-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          {t('sellItForMePage.protocolLead')}
        </p>

        <ol className="mt-8 space-y-0 relative">
          {stepList.map((step, idx) => {
            const Icon = STEP_ICONS[idx] ?? Car;
            const isLast = idx === stepList.length - 1;
            return (
              <li key={step.title} className="relative flex gap-4 pb-10 last:pb-0">
                {!isLast ? (
                  <div
                    className="absolute left-[1.125rem] top-10 bottom-0 w-0.5 bg-gradient-to-b from-violet-300 to-violet-100"
                    aria-hidden
                  />
                ) : null}
                <div className="relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[#233D7B] ring-4 ring-white shadow-sm">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div className="pt-0.5 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                    <span className="text-xs font-bold uppercase tracking-wide text-violet-600">
                      {t('sellItForMePage.stepLabel', { n: idx + 1 })}
                    </span>
                    <h3 className="text-base font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{step.body}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="mt-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-900 leading-snug">
          * {t('sellItForMePage.pilotNote')}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <Link
            to="/post-ad?type=used_car&intent=sell_it_for_me"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[48px] px-8 rounded-xl bg-[#233D7B] text-white font-bold hover:bg-[#152949] transition shadow-md text-center"
          >
            {t('sellItForMePage.ctaPrimary')}
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden />
          </Link>
          <span className="text-center sm:text-left text-sm text-gray-500">
            {t('sellItForMePage.ctaSecondaryHint')}{' '}
            <Link to="/used-cars/sell" className="font-semibold text-[#233D7B] hover:underline">
              {t('sellItForMePage.ctaSecondary')}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
