import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Camera, CircleStop, ExternalLink, ImagePlus, ScanEye, Sparkles, X } from 'lucide-react';
import type { Place } from './content';
import { text, type Lang } from './i18n';
import { buildGuideHistory, guideEndpoint, validateRemoteAnswer, type GuideAnswer } from './guide';
import { GuideAnswerText } from './GuidePanel';
import { panoramaCopy as copy } from './panorama-copy';
import { preparePanoramaImage, StableViewGate, startPanoramaCapture, type PanoramaCapture } from './panorama-capture';
import './panorama-guide.css';

interface Turn { question: string; answer?: GuideAnswer; image?: string; automatic?: boolean }
interface Props { place: Place; initialTour: string; lang: Lang; onClose(): void }

export default function PanoramaGuide(props: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLElement | null>(null);
  const [tourUrl, setTourUrl] = useState(props.initialTour);
  useEffect(() => {
    launcher.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.showModal();
    return () => { dialog.current?.close(); document.body.style.overflow = overflow; launcher.current?.focus({ preventScroll: true }); };
  }, []);
  const tour = props.place.tours.find(item => item.url === tourUrl) ?? props.place.tours[0];
  if (!tour) return null;
  return <dialog ref={dialog} className="panorama-dialog" aria-label={text(copy.title, props.lang)} onCancel={props.onClose}>
    <header className="panorama-dialog-header">
      <div><span className="panorama-eyebrow">IZQOR · 360°</span><h2>{text(props.place.name, props.lang)}</h2></div>
      <label className="panorama-tour-select"><span className="sr-only">{text(copy.tour, props.lang)}</span><select value={tour.url} onChange={event => setTourUrl(event.target.value)}>{props.place.tours.map(item => <option value={item.url} key={item.url}>{text(item.name, props.lang)}</option>)}</select></label>
      <button className="panorama-close" onClick={props.onClose} aria-label={text(copy.close, props.lang)} autoFocus><X size={22}/></button>
    </header>
    <PanoramaSession key={props.place.id + tour.url + props.lang} place={props.place} tour={tour} lang={props.lang}/>
  </dialog>;
}

function PanoramaSession({ place, tour, lang }: { place: Place; tour: Place['tours'][number]; lang: Lang }) {
  const t = (key: keyof typeof copy) => text(copy[key], lang);
  const stage = useRef<HTMLDivElement>(null), alive = useRef(true), capture = useRef<PanoramaCapture | null>(null);
  const request = useRef<AbortController | null>(null), session = useRef(0), busyRef = useRef(false);
  const end = useRef<HTMLDivElement>(null), fileInput = useRef<HTMLInputElement>(null);
  const gate = useRef(new StableViewGate());
  const [loaded, setLoaded] = useState(false), [slow, setSlow] = useState(false);
  const [connected, setConnected] = useState(false), [connecting, setConnecting] = useState(false), [automatic, setAutomatic] = useState(false);
  const [question, setQuestion] = useState(''), [turns, setTurns] = useState<Turn[]>([]), [busy, setBusy] = useState(false);
  const [attachment, setAttachment] = useState<string>(), [error, setError] = useState('');

  useEffect(() => {
    alive.current = true;
    const timer = window.setTimeout(() => setSlow(true), 15_000);
    return () => { alive.current = false; session.current++; window.clearTimeout(timer); request.current?.abort(); capture.current?.stop(); capture.current = null; };
  }, []);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [turns, busy, error]);
  function cancel() { request.current?.abort(); request.current = null; busyRef.current = false; setBusy(false); setAutomatic(false); }
  function disconnect() {
    session.current++; capture.current?.stop(); capture.current = null;
    setConnected(false); setConnecting(false); setAutomatic(false); cancel();
  }
  async function connect() {
    if (connecting || !stage.current) return;
    const generation = ++session.current;
    setConnecting(true); setError('');
    try {
      const stream = await startPanoramaCapture(stage.current, () => alive.current && session.current === generation);
      if (!alive.current || session.current !== generation) { stream.stop(); return; }
      capture.current = stream; setConnected(true); setAttachment(undefined); gate.current = new StableViewGate();
      stream.stream.getVideoTracks()[0].addEventListener('ended', () => { if (alive.current && capture.current === stream) disconnect(); }, { once: true });
    } catch (cause) {
      if (alive.current && session.current === generation) setError(t(cause instanceof Error && cause.name === 'NotAllowedError' ? 'denied' : 'unsupported'));
    } finally { if (alive.current && session.current === generation) setConnecting(false); }
  }
  async function attach(file?: File) {
    if (!file) return;
    disconnect(); const generation = session.current;
    try { const image = await preparePanoramaImage(file); if (alive.current && generation === session.current) { setAttachment(image); setError(''); } }
    catch { if (alive.current) setError(t('imageError')); }
  }
  async function send(value: string, visual = false, auto = false) {
    if (busyRef.current || !value.trim()) return;
    let image = attachment;
    if (visual && !image) {
      try { if (!capture.current || !loaded) throw new Error(); image = capture.current.frame(); }
      catch { setError(t('notReady')); setAutomatic(false); return; }
    }
    const controller = new AbortController(); request.current = controller; busyRef.current = true;
    setBusy(true); setQuestion(''); setError(''); setAttachment(undefined);
    // Never persist screenshots or include past screenshots in conversation history.
    const history = buildGuideHistory(turns.filter((turn): turn is Turn & { answer: GuideAnswer } => !!turn.answer));
    const newTurn: Turn = { question: value.trim(), image, automatic: auto };
    setTurns(previous => [...previous.slice(-9), newTurn]);
    try {
      const response = await fetch((guideEndpoint || '/api/guide').replace(/\/$/, '') + '/view', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: value.trim(), locale: lang, placeId: place.id, tourUrl: tour.url, history, ...(image ? { image } : {}) }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(60_000)]),
      });
      if (!response.ok) { const payload = await response.json().catch(() => null); throw new Error(response.status === 429 || payload?.error?.code === 'provider_rate_limit' ? 'limit' : 'error'); }
      const answer = validateRemoteAnswer(await response.json());
      if (alive.current && request.current === controller && !controller.signal.aborted) setTurns(previous => previous.map(turn => turn === newTurn ? { ...turn, answer } : turn));
    } catch (cause) {
      if (alive.current && request.current === controller && !controller.signal.aborted) { setError(t(cause instanceof Error && cause.message === 'limit' ? 'limit' : 'error')); setAutomatic(false); }
    } finally {
      if (alive.current && request.current === controller) { request.current = null; busyRef.current = false; setBusy(false); }
    }
  }
  useEffect(() => {
    if (!automatic || !connected) return;
    const timer = window.setInterval(() => {
      if (document.hidden || busyRef.current || !loaded || !capture.current) return;
      try {
        if (gate.current.observe(capture.current.sample(), Date.now())) {
          void send(t('viewQuestion'), true, true);
          if (gate.current.count >= 10) { setAutomatic(false); setError(t('autoEnd')); }
        }
      } catch { setAutomatic(false); setError(t('notReady')); }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [automatic, connected, loaded, turns, lang]);

  return <div className="panorama-workspace">
    <section className="panorama-explore" aria-label={text(tour.name, lang)}>
      <div className="panorama-view" ref={stage}>
        <iframe src={tour.url} title={text(place.name, lang) + ' · ' + text(tour.name, lang)} allow="fullscreen" allowFullScreen onLoad={() => setLoaded(true)} referrerPolicy="strict-origin-when-cross-origin"/>
        {!loaded && <div className="panorama-wait"><span className="spinner"/>{t(slow ? 'slow' : 'loading')}{slow && <a href={tour.url} target="_blank" rel="noreferrer">{t('source')}</a>}</div>}
      </div>
      <div className="panorama-explore-footer"><span>{place.id === 'konyr' ? t('outside') : t('drag')}</span><a href={tour.url} target="_blank" rel="noreferrer">{t('source')}<ExternalLink size={13}/></a></div>
    </section>
    <aside className="panorama-companion" aria-label={t('guide')}>
      <header className="panorama-companion-header"><img src={import.meta.env.BASE_URL + 'media/zholserik-avatar.png'} alt="" width={48} height={54}/><div><h3>{t('guide')}</h3><p>{t('companion')}</p></div><Sparkles size={18}/></header>
      <div className="panorama-thread" role="log" aria-live="polite" aria-relevant="additions text">
        {!turns.length && <div className="panorama-welcome"><span className="panorama-eyebrow">{text(place.name, lang)}</span><h4>{t('welcome')}</h4><p>{t('intro')}</p><div className="panorama-suggestions">{(['about', 'look'] as const).map(key => <button key={key} onClick={() => void send(t(key))}>{t(key)}<ArrowUp size={14}/></button>)}</div></div>}
        {turns.map((turn, index) => <article className="panorama-turn" key={index}><div className="panorama-question">{turn.automatic ? <span><ScanEye size={14}/>{t('automatic')}</span> : turn.question}{turn.image && <img src={turn.image} alt={t('frame')} width={260} height={150}/>}</div>{turn.answer && <div className="panorama-answer"><GuideAnswerText answer={turn.answer} lang={lang}/></div>}</article>)}
        {busy && <p className="panorama-thinking"><span className="spinner"/>{t('thinking')}</p>}
        {error && <p className="panorama-notice" role="status">{error}</p>}
        <div ref={end}/>
      </div>
      <div className="panorama-controls">
        {connected ? <><div className="panorama-capture-status"><span><i/>{t('connected')}</span><button onClick={disconnect} aria-label={t('stop')} title={t('stop')}><CircleStop size={18}/></button></div><label className="panorama-auto"><input type="checkbox" checked={automatic} onChange={event => { setAutomatic(event.target.checked); if (event.target.checked) { gate.current = new StableViewGate(); setError(''); } }}/><span>{t('auto')}<small>{t('autoNote')}</small></span></label></> : <><p className="panorama-context-status">{t('contextOnly')}</p><button className="panorama-connect" onClick={() => void connect()} disabled={connecting || !loaded}><Camera size={17}/>{t(connecting ? 'connecting' : 'connect')}</button><details className="panorama-privacy"><summary>{lang === 'ru' ? 'Как это работает' : lang === 'kk' ? 'Бұл қалай жұмыс істейді' : 'How it works'}</summary><p>{t('privacy')}</p></details></>}
        {attachment && <div className="panorama-attachment"><img src={attachment} alt={t('attached')}/><span>{t('attached')}</span><button onClick={() => setAttachment(undefined)} aria-label={t('remove')}><X size={16}/></button></div>}
        <button className="panorama-see" disabled={busy || (!connected && !attachment)} onClick={() => void send(t('viewQuestion'), true)}><ScanEye size={18}/>{t('view')}<ArrowUp size={16}/></button>
        <form className="panorama-composer" onSubmit={event => { event.preventDefault(); void send(question, connected); }}>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={event => { void attach(event.target.files?.[0]); event.target.value = ''; }}/>
          <button type="button" className="panorama-attach-button" onClick={() => fileInput.current?.click()} aria-label={t('attach')} title={t('attach')} disabled={busy}><ImagePlus size={19}/></button>
          <input value={question} onChange={event => setQuestion(event.target.value)} placeholder={t('question')} aria-label={t('question')} maxLength={1200} disabled={busy}/>
          {busy ? <button type="button" onClick={cancel} aria-label={t('cancel')}><CircleStop size={20}/></button> : <button type="submit" disabled={!question.trim()} aria-label={t('send')}><ArrowUp size={20}/></button>}
        </form>
      </div>
    </aside>
  </div>;
}
