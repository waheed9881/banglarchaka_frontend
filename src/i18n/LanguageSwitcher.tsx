import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  return (
    <div className="flex items-center gap-1 shrink-0" role="group" aria-label={t('lang.switcherAria')}>
      <button
        type="button"
        onClick={() => void i18n.changeLanguage('en')}
        className={`rounded px-1.5 py-0.5 font-semibold transition ${
          i18n.language === 'en' ? 'bg-white/20 text-white' : 'text-white/75 hover:text-white'
        }`}
      >
        EN
      </button>
      <span className="text-white/35 select-none">|</span>
      <button
        type="button"
        onClick={() => void i18n.changeLanguage('bn')}
        className={`rounded px-1.5 py-0.5 font-semibold transition ${
          i18n.language === 'bn' ? 'bg-white/20 text-white' : 'text-white/75 hover:text-white'
        }`}
      >
        {t('lang.bn')}
      </button>
    </div>
  );
}
