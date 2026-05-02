/** SPA-only SEO helpers (title + meta description). */
export function setPageSeo(title: string, description?: string): void {
  if (typeof document === 'undefined') return;
  document.title = title;

  let el = document.querySelector('meta[name="description"]');
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', 'description');
    document.head.appendChild(el);
  }
  if (description) {
    el.setAttribute('content', description);
  }
}
