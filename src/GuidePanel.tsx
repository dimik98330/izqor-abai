import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUp, ArrowUpRight, BookOpen, ChevronDown, Eye, History, MapPin, Pause, Play, Plus, RotateCcw, Square, X } from 'lucide-react';
import { places } from './content';
import { getGuideSource } from './guide-knowledge';
import { text, languageNames, type Lang, type LocalText } from './i18n';
import { askGuide, buildGuideHistory, guideEndpoint, type GuideAnswer } from './guide';
import { guideChatCopy as copy } from './guide-chat-copy';
import styles from './guide-chat.module.css';

function chatClass(value: string) { return value.split(/\s+/).filter(Boolean).map(name => styles[name] ? styles[name] + (name.startsWith('izqor-conversation') ? '' : ' ' + name) : name).join(' '); }

const GuideAvatar = lazy(() => import('./GuideAvatar'));
const backgroundVideo = import.meta.env.BASE_URL + 'media/abai-steppe-loop.mp4';
const backgroundPoster = import.meta.env.BASE_URL + 'media/abai-steppe-poster.webp';
interface Turn { question: string; answer: GuideAnswer; locale: Lang }
let conversation: Turn[] = [];
export function GuideAnswerText({ answer, lang }: { answer: GuideAnswer; lang: Lang }) {
  const pieces: ReactNode[] = [];
  const references = new Map<string, { url: string; title: string; number: number }>();
  let cursor = 0;
  for (const link of answer.links ?? []) {
    pieces.push(answer.answer.slice(cursor, link.start));
    const marker = answer.answer.slice(link.start, link.end);
    pieces.push(<a className={chatClass("guide-inline-citation")} key={link.start} href={link.url} target="_blank" rel="noreferrer" title={link.title} aria-label={link.title}>{marker}</a>);
    if (!references.has(link.url)) references.set(link.url, { url: link.url, title: link.title, number: Number(marker.replace(/\D/g, '')) || references.size + 1 });
    cursor = link.end;
  }
  pieces.push(answer.answer.slice(cursor));
  for (const id of answer.citationIds) {
    const source = getGuideSource(id);
    if (source && !references.has(source.url)) references.set(source.url, { url: source.url, title: text(source.title, lang), number: references.size + 1 });
  }
  return <>
    {answer.mode === 'reference' && <small className={chatClass("izqor-conversation-provenance")} data-ui="izqor-conversation-provenance">{text(copy.referenceAnswer, lang)}</small>}
    <p className={chatClass("guide-answer-copy")}>{pieces}</p>
    {references.size > 0 ? <details className={chatClass("izqor-conversation-sources")} data-ui="izqor-conversation-sources">
      <summary><BookOpen size={15} strokeWidth={1.7}/><span>{text(copy.sources, lang)}</span><span className={chatClass("izqor-conversation-source-count")} data-ui="izqor-conversation-source-count">{references.size}</span><ChevronDown size={15}/></summary>
      <div className={chatClass("izqor-conversation-source-list")} data-ui="izqor-conversation-source-list">{[...references.values()].map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><span className={chatClass("izqor-conversation-source-number")} data-ui="izqor-conversation-source-number">{source.number}</span><span><strong>{source.title}</strong><small>{new URL(source.url).hostname}</small></span><ArrowUpRight size={16}/></a>)}</div>
    </details> : answer.mode === 'remote' && <small className={chatClass("izqor-conversation-provenance")} data-ui="izqor-conversation-provenance">{text(copy.general, lang)}</small>}
  </>;
}

export default function GuidePanel({ lang, placeId, onSelect, onLanguage, onClose, reduced }: { lang: Lang; placeId: string; onSelect: (id: string) => void; onLanguage: (lang: Lang) => void; onClose: () => void; reduced: boolean }) {
  const endpoint = guideEndpoint;
  const t = (value: LocalText) => text(value, lang);
  const [question, setQuestion] = useState(''), [busy, setBusy] = useState(false), [pendingQuestion, setPendingQuestion] = useState('');
  const [turns, setTurns] = useState<Turn[]>(() => conversation);
  const [connection, setConnection] = useState<'checking' | 'connected' | 'reference'>(endpoint ? 'checking' : 'reference');
  const [videoPaused, setVideoPaused] = useState(reduced), [videoReady, setVideoReady] = useState(false), [videoFailed, setVideoFailed] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const generation = useRef(0), pending = useRef<AbortController | null>(null), thread = useRef<HTMLDivElement>(null), input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    generation.current++; pending.current?.abort(); pending.current = null;
    setQuestion(''); setPendingQuestion(''); setBusy(false);
    if (!endpoint) { setConnection('reference'); return; }
    const abort = new AbortController(); setConnection('checking');
    fetch(endpoint + '/status', { signal: AbortSignal.any([abort.signal, AbortSignal.timeout(5000)]) })
      .then(response => response.ok ? response.json() : null)
      .then(value => { if (!abort.signal.aborted) setConnection(value?.configured ? 'connected' : 'reference'); })
      .catch(() => { if (!abort.signal.aborted) setConnection('reference'); });
    return () => { abort.abort(); generation.current++; pending.current?.abort(); pending.current = null; };
  }, [lang, placeId, endpoint]);
  useEffect(() => { if (thread.current) thread.current.scrollTop = thread.current.scrollHeight; }, [turns, busy]);
  useEffect(() => { const element = thread.current; if (!element) return; const resize = new ResizeObserver(() => { element.scrollTop = element.scrollHeight; }); resize.observe(element); return () => resize.disconnect(); }, []);
  useEffect(() => { const element = input.current; if (element) { element.style.height = 'auto'; element.style.height = Math.min(132, Math.max(54, element.scrollHeight)) + 'px'; } }, [question]);
  useEffect(() => { setVideoPaused(reduced); }, [reduced]);
  useEffect(() => {
    const element = video.current; if (!element) return;
    let disposed = false;
    function syncPlayback() {
      if (!element) return;
      if (videoPaused || document.hidden) element.pause();
      else void element.play().catch(() => { if (!disposed && !document.hidden) setVideoPaused(true); });
    }
    syncPlayback(); document.addEventListener('visibilitychange', syncPlayback);
    return () => { disposed = true; document.removeEventListener('visibilitychange', syncPlayback); element.pause(); };
  }, [videoPaused, videoFailed]);
  function focusInput() { requestAnimationFrame(() => input.current?.focus({ preventScroll: true })); }
  async function ask(value: string, retry = false) {
    if (!value.trim() || pending.current) return;
    const baseTurns = retry ? turns.slice(0, -1) : turns;
    const abort = new AbortController(), current = ++generation.current;
    pending.current = abort; setQuestion(''); setPendingQuestion(value.trim()); setBusy(true);
    const answer = await askGuide({ question: value.trim(), locale: lang, placeId, history: buildGuideHistory(baseTurns) }, endpoint, abort.signal);
    if (current !== generation.current || abort.signal.aborted) return;
    const next = [...baseTurns, { question: value.trim(), answer, locale: lang }].slice(-6);
    conversation = next; setTurns(next); setBusy(false); setPendingQuestion(''); pending.current = null;
    setConnection(answer.mode === 'remote' ? 'connected' : 'reference'); focusInput();
  }
  function stop() {
    generation.current++; pending.current?.abort(); pending.current = null;
    setQuestion(pendingQuestion); setPendingQuestion(''); setBusy(false); focusInput();
  }
  function clear() {
    generation.current++; pending.current?.abort(); pending.current = null;
    conversation = []; setTurns([]); setQuestion(''); setPendingQuestion(''); setBusy(false); focusInput();
  }
  const promptIcons = [BookOpen, History, Eye];
  return <div className={chatClass('izqor-conversation' + (turns.length || busy ? ' has-conversation' : ''))} data-ui="izqor-conversation" data-film={videoFailed ? 'unavailable' : videoReady ? 'ready' : 'loading'}>
    <div className={chatClass("izqor-conversation-film")} data-ui="izqor-conversation-film" style={{backgroundImage: `url("${backgroundPoster}")`}} aria-hidden="true">{!videoFailed && <video ref={video} src={backgroundVideo} poster={backgroundPoster} autoPlay loop muted playsInline preload="metadata" disablePictureInPicture onLoadedData={() => setVideoReady(true)} onError={() => setVideoFailed(true)}/>}<div className={chatClass("izqor-conversation-veil")} data-ui="izqor-conversation-veil"/></div>
    <header className={chatClass("izqor-conversation-header")} data-ui="izqor-conversation-header">
      <div className={chatClass("izqor-conversation-portrait")} data-ui="izqor-conversation-portrait"><Suspense fallback={<span className={chatClass("spinner")}/>}><GuideAvatar lang={lang} step={5} reduced={reduced} compact/></Suspense></div>
      <div className={chatClass("izqor-conversation-identity")} data-ui="izqor-conversation-identity"><h2>{t(copy.name)}</h2><p role="status"><span className={chatClass('izqor-conversation-status is-' + connection)} aria-hidden="true"/>{t(connection === 'checking' ? copy.checking : connection === 'reference' ? copy.reference : copy.subtitle)}</p></div>
      <div className={chatClass("izqor-conversation-header-actions")} data-ui="izqor-conversation-header-actions"><button className={chatClass("izqor-conversation-new guide-clear")} data-ui="izqor-conversation-new" onClick={clear} aria-label={t(copy.newConversation)} title={t(copy.newConversation)}><Plus size={19}/><span>{t(copy.newConversation)}</span></button><button className={chatClass("izqor-conversation-close")} data-ui="izqor-conversation-close" onClick={onClose} aria-label={t(copy.close)} title={t(copy.close)} autoFocus><X size={21}/></button></div>
    </header>
    <div className={chatClass("izqor-conversation-context")} data-ui="izqor-conversation-context"><label htmlFor="izqor-conversation-place"><MapPin size={15}/>{t(copy.place)}</label><div className={chatClass("izqor-conversation-select")} data-ui="izqor-conversation-select"><select id="izqor-conversation-place" value={placeId} onChange={event => onSelect(event.target.value)} aria-label={t(copy.place)}>{places.map(place => <option value={place.id} key={place.id}>{text(place.name, lang)}</option>)}</select><ChevronDown size={15}/></div><button className={chatClass("izqor-conversation-background-toggle")} data-ui="izqor-conversation-background-toggle" onClick={() => setVideoPaused(value => !value)} disabled={!videoReady || videoFailed} aria-label={t(videoPaused ? copy.playBackground : copy.pauseBackground)} title={t(videoPaused ? copy.playBackground : copy.pauseBackground)} aria-pressed={videoPaused}>{videoPaused ? <Play size={15}/> : <Pause size={15}/>}</button></div>
    <div className={chatClass("izqor-conversation-scroll guide-thread")} data-ui="izqor-conversation-scroll" ref={thread}>
      {!turns.length && !busy && <div className={chatClass("izqor-conversation-welcome")} data-ui="izqor-conversation-welcome"><h3>{t(copy.welcome)}</h3><p>{t(copy.introduction)}</p><div className={chatClass("izqor-conversation-prompts guide-suggestions")} data-ui="izqor-conversation-prompts">{copy.prompts.map((prompt, index) => { const Icon = promptIcons[index]; return <button key={index} onClick={() => void ask(t(prompt))}><Icon size={19} strokeWidth={1.6}/><span>{t(prompt)}</span><ArrowUpRight size={17}/></button>; })}</div></div>}
      <div className={chatClass("izqor-conversation-log")} data-ui="izqor-conversation-log" role="log" aria-live="polite" aria-relevant="additions" aria-label={t(copy.name)} aria-busy={busy}>
        {turns.map((turn, index) => <div className={chatClass("izqor-conversation-turn guide-turn")} data-ui="izqor-conversation-turn" key={index}>
          <div className={chatClass("izqor-conversation-question guide-question")} data-ui="izqor-conversation-question"><span className={chatClass("sr-only")}>{t(copy.you)}</span><p>{turn.question}</p></div>
          <div className={chatClass("izqor-conversation-answer guide-answer")} data-ui="izqor-conversation-answer" lang={turn.locale}>{turn.answer.notice && <div className={chatClass("izqor-conversation-error guide-notice")} data-ui="izqor-conversation-error" role="status" lang={lang}><p>{t(copy.unavailable)}</p>{index === turns.length - 1 && <button onClick={() => void ask(turn.question, true)} disabled={busy}><RotateCcw size={15}/>{t(copy.retry)}</button>}</div>}<GuideAnswerText answer={turn.answer} lang={turn.locale}/></div>
        </div>)}
        {busy && <div className={chatClass("izqor-conversation-turn is-pending")} data-ui="izqor-conversation-turn"><div className={chatClass("izqor-conversation-question guide-question")} data-ui="izqor-conversation-question"><span className={chatClass("sr-only")}>{t(copy.you)}</span><p>{pendingQuestion}</p></div><div className={chatClass("izqor-conversation-preparing")} data-ui="izqor-conversation-preparing" role="status"><span className={chatClass("izqor-conversation-pulse")} data-ui="izqor-conversation-pulse" aria-hidden="true"><i/><i/><i/></span>{t(copy.preparing)}</div></div>}
      </div>
    </div>
    <div className={chatClass("izqor-conversation-footer")} data-ui="izqor-conversation-footer">
      <div className={chatClass("izqor-conversation-languages")} data-ui="izqor-conversation-languages" role="group" aria-label={t(copy.language)}><span>{t(copy.language)}</span>{(['kk','ru','en'] as Lang[]).map(locale=><button type="button" key={locale} onClick={()=>onLanguage(locale)} aria-label={languageNames[locale]} aria-pressed={lang===locale}>{locale.toUpperCase()}</button>)}</div>
      <form onSubmit={event => { event.preventDefault(); if (!busy) void ask(question); }} className={chatClass("izqor-conversation-composer guide-input")} data-ui="izqor-conversation-composer"><label className={chatClass("sr-only")} htmlFor="guide-question">{t(copy.placeholder)}</label><textarea ref={input} id="guide-question" value={question} onChange={event => setQuestion(event.target.value)} placeholder={t(copy.placeholder)} maxLength={1200} rows={2} disabled={busy} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (!busy) void ask(question); } }}/>{busy ? <button key="stop" className={chatClass("izqor-conversation-send is-stop")} data-ui="izqor-conversation-send" type="button" onClick={event => { event.preventDefault(); stop(); }} aria-label={t(copy.stop)} title={t(copy.stop)}><Square size={15} fill="currentColor"/></button> : <button key="send" className={chatClass("izqor-conversation-send")} data-ui="izqor-conversation-send" type="submit" disabled={!question.trim()} aria-label={t(copy.send)} title={t(copy.send)}><ArrowUp size={23}/></button>}</form>{question.length > 1000 && <span className={chatClass("izqor-conversation-counter")} data-ui="izqor-conversation-counter">{question.length}/1200</span>}</div>
  </div>;
}
