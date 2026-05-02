import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Send, Search } from 'lucide-react';
import { fetchMe, type MeResponse } from '@/lib/auth';
import {
  fetchConversationMessages,
  fetchConversations,
  openOrCreateConversation,
  openOrCreateDealerConversation,
  sendConversationMessage,
  type ConversationSummaryDto,
  type MessageDto,
} from '@/lib/engagement';
import { setPageSeo } from '@/lib/seo';

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function peerDisplayName(c: ConversationSummaryDto, meId?: number, chatFallback = 'Chat'): string {
  const users = c.participants?.map((p) => p.user).filter((u): u is { id: number; name: string } => !!u?.name);
  if (users?.length && meId != null) {
    const other = users.find((u) => u.id !== meId);
    if (other) return other.name;
  }
  if (users?.length === 1) return users[0].name;
  return c.subject?.trim() || c.listing?.title?.trim() || chatFallback;
}

function conversationPreviewLine(c: ConversationSummaryDto, marketplaceFallback: string): string {
  if (c.listing?.title) return c.listing.title;
  if (c.subject?.trim()) return c.subject;
  return marketplaceFallback;
}

function formatRelativeShort(iso: string | undefined | null, nowLabel: string): string {
  if (!iso) return '';
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return '';
  const sec = Math.round((Date.now() - ts) / 1000);
  if (sec < 45) return nowLabel;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function isOwnMessage(meId: number | undefined, m: MessageDto): boolean {
  if (meId == null) return false;
  if (m.sender?.id != null) return m.sender.id === meId;
  if (m.sender_user_id != null) return m.sender_user_id === meId;
  return false;
}

/** Messenger-style palette */
const ms = {
  pageBg: 'bg-[#f0f2f5]',
  listBg: 'bg-white',
  threadBg: 'bg-[#f0f2f5]',
  bubbleOther: 'bg-white text-[#050505] shadow-sm border border-black/[0.06]',
  bubbleOwn: 'bg-[#0084ff] text-white',
  composerBg: 'bg-white border-t border-black/[0.08]',
  inputInner: 'rounded-full px-4 py-2.5 text-[15px] text-[#050505] placeholder:text-[#65676b]',
  rowActive: 'bg-[#ebf5ff]',
  rowHover: 'hover:bg-black/[0.04]',
};

export function MessagesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const listingPid = searchParams.get('listing');
  const dealerSlug = searchParams.get('dealer');

  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [conversations, setConversations] = useState<ConversationSummaryDto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [draft, setDraft] = useState('');
  const [msg, setMsg] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [listQuery, setListQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    setLoadingList(true);
    try {
      const rows = await fetchConversations();
      setConversations(rows);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t('messages.loadConvFailed'));
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    setPageSeo(t('messages.seoTitle'), t('messages.seoDesc'));
  }, [t]);

  useEffect(() => {
    fetchMe().then((u) => {
      setMe(u);
      setAllowed(!!u);
    });
  }, []);

  useEffect(() => {
    if (!allowed) return;

    const run = async () => {
      if (listingPid) {
        try {
          const conv = await openOrCreateConversation(listingPid);
          setSearchParams({}, { replace: true });
          await loadConversations();
          setSelectedId(conv.id);
        } catch (e) {
          setMsg(e instanceof Error ? e.message : t('messages.openConvFailed'));
          setSearchParams({}, { replace: true });
          await loadConversations();
        }
        return;
      }
      if (dealerSlug) {
        try {
          const conv = await openOrCreateDealerConversation(dealerSlug);
          setSearchParams({}, { replace: true });
          await loadConversations();
          setSelectedId(conv.id);
        } catch (e) {
          setMsg(e instanceof Error ? e.message : t('messages.openDealerFailed'));
          setSearchParams({}, { replace: true });
          await loadConversations();
        }
        return;
      }
      await loadConversations();
    };

    run().catch(() => undefined);
  }, [allowed, listingPid, dealerSlug, t]);

  useEffect(() => {
    if (!selectedId || !allowed) return;
    setLoadingMsgs(true);
    fetchConversationMessages(selectedId)
      .then(setMessages)
      .catch((e) => setMsg(e instanceof Error ? e.message : t('messages.loadMsgsFailed')))
      .finally(() => setLoadingMsgs(false));
  }, [selectedId, allowed, t]);

  useEffect(() => {
    if (loadingMsgs) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMsgs, selectedId]);

  const onSend = async () => {
    if (!selectedId || !draft.trim()) return;
    try {
      await sendConversationMessage(selectedId, draft.trim());
      setDraft('');
      const next = await fetchConversationMessages(selectedId);
      setMessages(next);
      await loadConversations();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t('messages.sendFailed'));
    }
  };

  if (allowed === false) {
    return (
      <div className={`min-h-screen ${ms.pageBg} flex items-center justify-center px-4`}>
        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-black/[0.06] p-10 max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0084ff]/10 text-2xl">
            💬
          </div>
          <p className="text-[#050505] font-semibold text-lg mb-1">{t('messages.signInTitle')}</p>
          <p className="text-[#65676b] text-sm mb-6">{t('messages.signInSubtitle')}</p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-full bg-[#0084ff] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0073e6]"
          >
            {t('messages.logIn')}
          </Link>
          <div className="mt-4">
            <Link to="/" className="text-sm text-[#0084ff] font-semibold hover:underline">
              {t('messages.backHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selected = conversations.find((c) => c.id === selectedId);
  const filteredConversations = listQuery.trim()
    ? conversations.filter((c) => {
        const q = listQuery.toLowerCase();
        const name = peerDisplayName(c, me?.id, t('messages.chat')).toLowerCase();
        const sub = conversationPreviewLine(c, t('messages.marketplace')).toLowerCase();
        return name.includes(q) || sub.includes(q);
      })
    : conversations;

  const chatTitle = selected ? peerDisplayName(selected, me?.id, t('messages.chat')) : '';
  const chatSubtitle = selected ? conversationPreviewLine(selected, t('messages.marketplace')) : '';

  const showSidebar = !selectedId;
  const showThread = !!selectedId;

  return (
    <div className={`min-h-[100dvh] ${ms.pageBg} flex flex-col`}>
      <div className="shrink-0 border-b border-black/[0.06] bg-white px-2 py-3 md:hidden flex items-center gap-2 min-h-[52px]">
        {selectedId ? (
          <>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-black/[0.05] text-[#050505]"
              aria-label={t('messages.backToChatsAria')}
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="min-w-0 flex-1 text-center pr-2">
              <div className="truncate font-semibold text-[17px] text-[#050505]">{chatTitle || t('messages.chat')}</div>
              {chatSubtitle ? (
                <div className="truncate text-xs text-[#65676b]">{chatSubtitle}</div>
              ) : null}
            </div>
            <div className="w-10 shrink-0" />
          </>
        ) : (
          <>
            <div className="w-10 shrink-0" />
            <h1 className="text-xl font-bold text-[#050505] tracking-tight flex-1 text-center">{t('messages.chats')}</h1>
            <div className="w-10 shrink-0" />
          </>
        )}
      </div>

      <div className="flex flex-1 min-h-0 max-w-[1400px] mx-auto w-full md:my-4 md:px-4 md:gap-3 md:rounded-xl md:overflow-hidden md:shadow-xl md:shadow-black/[0.08] md:border md:border-black/[0.06] md:bg-white md:max-h-[calc(100dvh-2rem)]">
        {/* Conversation list — Messenger left rail */}
        <aside
          className={`${ms.listBg} flex flex-col min-h-0 border-black/[0.06] md:border-r md:w-[360px] shrink-0 ${
            showSidebar ? 'flex-1 md:flex-none md:max-w-[360px]' : 'hidden md:flex'
          }`}
        >
          <div className="hidden md:flex items-center justify-between px-4 pt-4 pb-3">
            <h1 className="text-2xl font-bold text-[#050505] tracking-tight">{t('messages.chats')}</h1>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm font-semibold text-[#0084ff] hover:underline"
            >
              {t('messages.done')}
            </button>
          </div>

          <div className="px-3 pb-2 md:px-4 md:pb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#65676b]" />
              <input
                value={listQuery}
                onChange={(e) => setListQuery(e.target.value)}
                placeholder={t('messages.searchPlaceholder')}
                className="w-full rounded-full bg-[#f0f2f5] py-2.5 pl-10 pr-4 text-[15px] text-[#050505] placeholder:text-[#65676b] outline-none ring-0 focus:ring-2 focus:ring-[#0084ff]/30"
              />
            </div>
          </div>

          {msg && (
            <div className="mx-3 md:mx-4 mb-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-950">
              {msg}
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto">
            {loadingList ? (
              <div className="px-4 py-8 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="h-14 w-14 shrink-0 rounded-full bg-[#f0f2f5]" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 bg-[#f0f2f5] rounded w-2/3" />
                      <div className="h-3 bg-[#f0f2f5] rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-[#65676b] text-[15px] leading-relaxed">
                  {listQuery.trim() ? t('messages.noMatchSearch') : t('messages.noChatsYet')}
                </p>
                {!listQuery.trim() && (
                  <p className="text-[#65676b] text-sm mt-3">
                    {t('messages.emptyHintLead')}{' '}
                    <strong className="text-[#050505]">{t('messages.messageSeller')}</strong>
                    {t('messages.emptyHintMid')}{' '}
                    <strong className="text-[#050505]">{t('messages.messageShowroom')}</strong>
                    {t('messages.emptyHintEnd')}
                  </p>
                )}
              </div>
            ) : (
              <ul className="pb-4">
                {filteredConversations.map((c) => {
                  const active = selectedId === c.id;
                  const name = peerDisplayName(c, me?.id, t('messages.chat'));
                  const preview = conversationPreviewLine(c, t('messages.marketplace'));
                  const when = formatRelativeShort(c.last_message_at, t('messages.relativeNow'));
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(c.id)}
                        className={`flex w-full gap-3 px-3 py-2.5 text-left transition-colors md:px-4 ${ms.rowHover} ${
                          active ? ms.rowActive : ''
                        }`}
                      >
                        <div
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-white bg-gradient-to-br from-[#0084ff] to-[#0066cc] shadow-inner"
                          aria-hidden
                        >
                          {initialsFromName(name)}
                        </div>
                        <div className="min-w-0 flex-1 border-b border-black/[0.06] pb-2.5 pt-0.5">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate font-semibold text-[15px] text-[#050505]">{name}</span>
                            <span className="shrink-0 text-xs text-[#65676b] tabular-nums">{when}</span>
                          </div>
                          <div className="truncate text-[13px] text-[#65676b] mt-0.5">{preview}</div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Thread — Messenger main pane */}
        <section
          className={`flex flex-col min-h-0 flex-1 bg-white md:bg-[#f0f2f5] ${
            showThread ? 'flex-1 min-h-0' : 'hidden md:flex'
          }`}
        >
          {!selectedId ? (
            <div className={`flex flex-1 flex-col items-center justify-center ${ms.threadBg} px-6 text-center`}>
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg shadow-black/10 text-5xl">
                💬
              </div>
              <p className="text-xl font-semibold text-[#050505]">{t('messages.selectChat')}</p>
              <p className="mt-2 max-w-sm text-[15px] text-[#65676b]">{t('messages.selectChatHint')}</p>
            </div>
          ) : (
            <>
              <header className="flex shrink-0 items-center gap-3 border-b border-black/[0.08] bg-white px-3 py-2 md:px-4 md:shadow-sm">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white bg-gradient-to-br from-[#0084ff] to-[#0066cc] md:h-11 md:w-11 md:text-[15px]"
                  aria-hidden
                >
                  {initialsFromName(chatTitle)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-[17px] text-[#050505] leading-tight">{chatTitle}</div>
                  <div className="truncate text-[13px] text-[#65676b]">{chatSubtitle}</div>
                </div>
              </header>

              <div className={`flex flex-1 flex-col min-h-0 overflow-hidden ${ms.threadBg}`}>
                <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6">
                  {loadingMsgs ? (
                    <div className="flex justify-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0084ff] border-t-transparent" />
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-center text-[15px] text-[#65676b] py-12">{t('messages.noMessagesYet')}</p>
                  ) : (
                    <div className="mx-auto max-w-3xl space-y-1">
                      {messages.map((m, idx) => {
                        const own = isOwnMessage(me?.id, m);
                        const prev = messages[idx - 1];
                        const showAvatarGap = !prev || isOwnMessage(me?.id, prev) !== own;
                        return (
                          <div
                            key={m.id}
                            className={`flex w-full ${own ? 'justify-end' : 'justify-start'} ${showAvatarGap ? 'mt-3' : 'mt-0.5'}`}
                          >
                            <div
                              className={`max-w-[85%] md:max-w-[70%] rounded-[18px] px-3.5 py-2 text-[15px] leading-snug ${own ? `${ms.bubbleOwn} rounded-br-md` : `${ms.bubbleOther} rounded-bl-md`}`}
                            >
                              {!own && (
                                <div className="mb-1 text-xs font-semibold text-[#0084ff]">{m.sender?.name || t('messages.senderFallback')}</div>
                              )}
                              <p className="whitespace-pre-wrap break-words">{m.body || t('messages.emptyBody')}</p>
                              <div
                                className={`mt-1 text-[11px] tabular-nums ${own ? 'text-white/75 text-right' : 'text-[#65676b]'}`}
                              >
                                {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <div className={`shrink-0 ${ms.composerBg} px-3 py-3 md:px-4 md:pb-4`}>
                  <div className="mx-auto max-w-3xl flex items-end gap-2">
                    <div className="flex-1 min-w-0 rounded-full border border-black/[0.08] bg-[#f0f2f5] focus-within:border-[#0084ff]/40 focus-within:ring-2 focus-within:ring-[#0084ff]/20 transition-shadow">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onSend();
                          }
                        }}
                        placeholder={t('messages.composerPlaceholder')}
                        rows={1}
                        className={`w-full resize-none bg-transparent ${ms.inputInner} max-h-32 min-h-[44px] py-3 outline-none`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => onSend()}
                      disabled={!draft.trim()}
                      className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0084ff] text-white shadow-md shadow-[#0084ff]/25 transition hover:bg-[#0073e6] disabled:opacity-40 disabled:shadow-none disabled:pointer-events-none"
                      aria-label={t('messages.sendAria')}
                    >
                      <Send className="h-5 w-5 translate-x-px translate-y-px" strokeWidth={2.25} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
