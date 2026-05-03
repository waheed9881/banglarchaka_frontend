/** Tailwind class fragments — dealer portal dashboard, HR & finance (scoped styling). */
export const dp = {
  /** Page background behind portal chrome */
  shell: 'min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-100 via-slate-50 to-[#f0f4fa]',
  inner: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10',

  heroTitle: 'text-2xl sm:text-3xl font-bold tracking-tight text-slate-900',
  heroSubtitle: 'mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed',

  card: 'rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_4px_24px_-8px_rgba(35,61,123,0.08)]',
  cardPad: 'p-6 sm:p-8',
  cardMuted: 'rounded-2xl border border-slate-200/60 bg-slate-50/50',

  sectionTitle: 'text-lg font-semibold tracking-tight text-slate-900',
  sectionHint: 'text-sm text-slate-500 mt-1',

  input:
    'w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-[#233D7B]/20 focus:border-[#233D7B]',
  select:
    'w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#233D7B]/20 focus:border-[#233D7B]',
  textarea:
    'w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#233D7B]/20 focus:border-[#233D7B]',

  btnPrimary:
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#233D7B] shadow-sm hover:bg-[#1a2d5a] active:scale-[0.98] transition-all',
  btnSecondary:
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors',
  btnAccent:
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 shadow-sm hover:bg-emerald-700 transition-colors',
  btnDanger:
    'inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 shadow-sm hover:bg-rose-700 transition-colors',
  btnGhost: 'inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[#233D7B] transition-colors',

  navSidebarItem: (active: boolean) =>
    [
      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all border',
      active
        ? 'border-[#233D7B]/30 bg-[#233D7B] text-white shadow-lg shadow-[#233D7B]/20'
        : 'border-transparent text-slate-600 hover:bg-white hover:border-slate-200 hover:text-slate-900',
    ].join(' '),

  navMobilePill: (active: boolean) =>
    [
      'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all border',
      active
        ? 'border-[#233D7B] bg-[#233D7B] text-white shadow-md'
        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
    ].join(' '),

  statCard: 'rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-200',
  statLabel: 'text-xs font-semibold uppercase tracking-wide text-slate-500',
  statValue: 'mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900',

  tab: (active: boolean) =>
    [
      'rounded-xl px-4 py-2.5 text-sm font-semibold transition-all border',
      active
        ? 'border-[#233D7B] bg-[#233D7B] text-white shadow-md shadow-[#233D7B]/15'
        : 'border-transparent bg-slate-100/90 text-slate-700 hover:bg-slate-200/80',
    ].join(' '),

  tableWrap: 'rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm',
  tableHead: 'border-b border-slate-200 bg-slate-50/90 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
  /** HR / dense ledger-style tables */
  tableHeadDense:
    'border-b border-slate-200 bg-slate-50/95 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500',
  tableCellDense: 'px-2.5 py-1.5 align-middle text-[13px] leading-tight text-slate-800',
  tableCellDenseMono: 'px-2.5 py-1.5 align-middle text-[13px] leading-tight text-slate-800 tabular-nums',
  tableDense: 'min-w-full border-collapse',

  alert:
    'rounded-xl border border-[#233D7B]/15 bg-gradient-to-r from-slate-50 to-slate-100/90 text-slate-900 text-sm px-4 py-3 shadow-sm',
  alertError: 'rounded-xl border border-rose-100 bg-rose-50 text-rose-900 text-sm px-4 py-3',

  listRow: 'flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3 hover:border-slate-200 transition-colors',

  pager: 'rounded-2xl border border-slate-200/80 bg-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 shadow-sm',
} as const;
