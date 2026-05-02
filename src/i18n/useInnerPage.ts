import { useTranslation } from 'react-i18next';

export type InnerPageBundle = {
  title: string;
  subtitle: string;
  highlights: string[];
  quickLinks?: { label: string; to: string }[];
};

export function useInnerPage(slug: string): InnerPageBundle {
  const { t } = useTranslation();
  const raw = t(`inner.${slug}`, { returnObjects: true });
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    console.error(`[useInnerPage] Missing or invalid translation bundle: inner.${slug}`, raw);
    return {
      title: slug,
      subtitle: '',
      highlights: [],
      quickLinks: [],
    };
  }
  return raw as InnerPageBundle;
}
