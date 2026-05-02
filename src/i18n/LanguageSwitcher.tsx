import { useTranslation } from 'react-i18next';

export function LanguageSwitcher({ tone = 'onDark' }: { tone?: 'onDark' | 'onLight' }) {
  const { i18n, t } = useTranslation();
  const light = tone === 'onLight';
  const active = light ? 'bg-lux-navy/10 text-lux-navy' : 'bg-white/20 text-white';
  const idle = light ? 'text-slate-600 hover:text-lux-navy' : 'text-white/75 hover:text-white';

  return (
    <div className="flex items-center gap-1 shrink-0" role="group" aria-label={t('lang.switcherAria')}>
      <button
        type="button"
        onClick={() => void i18n.changeLanguage('en')}
        className={`rounded px-1.5 py-0.5 font-semibold transition ${
          i18n.language === 'en' ? active : idle
        }`}
      >
        EN
      </button>
      <span className={`select-none ${light ? 'text-slate-300' : 'text-white/35'}`}>|</span>
      <button
        type="button"
        onClick={() => void i18n.changeLanguage('bn')}
        className={`rounded px-1.5 py-0.5 font-semibold transition ${
          i18n.language === 'bn' ? active : idle
        }`}
      >
        {t('lang.bn')}
      </button>
    </div>
  );
}
