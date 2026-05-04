import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  return (
    <div className="flex items-center gap-1 shrink-0" role="group" aria-label={t('lang.switcherAria')}>
      <button
        type="button"
        onClick={() => void i18n.changeLanguage('en')}
        className={`rounded px-1.5 py-0.5 font-semibold transition ${
          i18n.language === 'en' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'
        }`}
      >
        EN
      </button>
      <span className="text-neutral-300 select-none" aria-hidden>
        |
      </span>
      <button
        type="button"
        onClick={() => void i18n.changeLanguage('bn')}
        className={`rounded px-1.5 py-0.5 font-semibold transition ${
          i18n.language === 'bn' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'
        }`}
      >
        {t('lang.bn')}
      </button>
    </div>
  );
}
