import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronUp, Copy, Headphones, ImageOff, LoaderCircle, MapPin, Menu, MessagesSquare, Music2, Pause, Play, Search, ScrollText, Square, X } from 'lucide-react';
import BrandWordmark from './BrandWordmark';
import { getPlace } from './content';
import { L, text, type Lang, type LocalText } from './i18n';
import { timelineEras } from './timeline-content';
import { timelineMedia, type TimelineImage } from './timeline-media';
import { timelineCulture } from './timeline-culture';
import { timelineCultureMedia } from './timeline-culture-media';
import { getTimelineNarration } from './timeline-scripts';
import { timelineRecordings } from './timeline-recordings';
import { useTimelineNarration } from './use-timeline-narration';
import styles from './timeline.module.css';

interface TimelineProps { lang: Lang; reduced: boolean; large: boolean; onLanguage: (lang: Lang) => void; onLargeChange: (value: boolean) => void; onNavigate: (page: 'home' | 'map' | 'places') => void; onOpenPlace: (id: string) => void; onOpenMap: (id?: string) => void; onGuide: () => void; onNarrationChange: (value: boolean) => void }
interface ImageSelection { media: TimelineImage; title: LocalText }
const destinations = [
  {target: 'home', label: L('Путешествие', 'Саяхат', 'Journey')},
  {target: 'map', label: L('Карта', 'Карта', 'Map')},
  {target: 'places', label: L('Места и истории', 'Мекендер мен тарих', 'Places and stories')},
] as const;
const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '');
const routeChapter = () => timelineEras.find(era => era.id === location.hash.split('/')[2])?.id || timelineEras[0].id;
const themes: Record<string, [string, string]> = {
  khanate: ['#26352b', '#e0c38b'], education: ['#163c37', '#e0c59b'], house: ['#3e302b', '#e9c29c'],
  alash: ['#1e3033', '#dfcda8'], independence: ['#173e4a', '#bbdcdb'], constitution: ['#402c34', '#e7c697'],
};
const copy = {
  title: L('История. Глава за главой.', 'Тарих. Әр дәуір — бір тарау.', 'History. One chapter at a time.'),
  introduction: L('Выберите эпоху. Читайте, слушайте и исследуйте.', 'Дәуірді таңдаңыз. Оқыңыз, тыңдаңыз, зерттеңіз.', 'Choose an era. Read, listen and explore.'),
  periods: L('Главы истории', 'Тарих тараулары', 'Chapters of history'),
  chapter: L('Глава', 'Тарау', 'Chapter'), of: L('из', '/', 'of'),
  inspect: L('Рассмотреть изображение', 'Суретті жақыннан көру', 'View the image'), zoom: L('Увеличить', 'Үлкейту', 'Enlarge'),
  onMap: L('На карте', 'Картадан көру', 'On the map'), together: L('Разберёмся вместе', 'Бірге білейік', 'Let’s explore together'),
  askGuide: L('Спросить ИИ-гида', 'ЖИ-гидтен сұрау', 'Ask the AI guide'), sourceLink: L('Источники главы', 'Тараудың дереккөздері', 'Chapter sources'),
  overviewTitle: L('Как появилась новая история', 'Жаңа тарих қалай басталды', 'How a new history began'),
  eraOverview: L('Коротко об этой эпохе', 'Осы дәуір туралы қысқаша', 'This era at a glance'),
  readFull: L('Читать всю главу', 'Тарауды толық оқу', 'Read the full chapter'),
  readHint: L('Полный рассказ, факты и свидетельства', 'Толық әңгіме, деректер мен айғақтар', 'The full story, facts and evidence'),
  guideHint: L('Задайте вопрос об этой эпохе.', 'Осы дәуір туралы сұрақ қойыңыз.', 'Ask a question about this era.'),
  fullTitle: L('История в подробностях', 'Тарихты тереңірек тану', 'The story in detail'),
  collapse: L('Свернуть главу', 'Тарауды жию', 'Collapse the chapter'),
  readMore: L('Читать всю главу, факты и источники', 'Тарауды, деректер мен дереккөздерді толық оқу', 'Read the full chapter, facts and sources'),
  khanateSubtitle: L('Керей, Жанибек и начало новой эпохи.', 'Керей, Жәнібек және жаңа дәуірдің бастауы.', 'Kerey, Zhanibek and the beginning of a new era.'),
  khanateOverview: L('В середине XV века Керей и Жанибек с поддержавшими их родами переселились в Жетысу. Долины Чу и Таласа стали началом нового ханства.', 'XV ғасырдың ортасында Керей мен Жәнібек өздерін қолдаған рулармен бірге Жетісуға көшті. Шу мен Талас аңғарлары жаңа хандықтың бастауы болды.', 'In the mid-fifteenth century, Kerey and Zhanibek moved to Zhetysu with the clans that supported them. The Chu and Talas valleys became the starting point of a new khanate.'),
  mapCaption: L('Современная обзорная карта. Не границы 1465 года.', 'Қазіргі шолу картасы. 1465 жылғы шекара емес.', 'A modern overview map. Not the borders of 1465.'),
  sources: L('Источники этой главы', 'Осы тараудың дереккөздері', 'Sources for this chapter'),
  connection: L('По следам этой истории', 'Осы тарихтың ізімен', 'Follow this story'), place: L('Открыть историю места', 'Мекен тарихын ашу', 'Explore this place'),
  original: L('Открыть оригинал', 'Түпнұсқаны ашу', 'Open the original'), close: L('Закрыть изображение', 'Суретті жабу', 'Close image'),
  unavailable: L('Изображение не загрузилось', 'Сурет жүктелмеді', 'Image unavailable'),
  story: L('Что происходило в эту эпоху', 'Бұл дәуірде не болды', 'The story of this era'), facts: L('Время, люди, место', 'Уақыт, тұлғалар, мекен', 'Time, people, place'),
  culture: L('Культура и память', 'Мәдениет пен жады', 'Culture and memory'), fact: L('Деталь, которая связывает эпохи', 'Дәуірлерді жалғайтын дерек', 'A detail connecting the eras'),
  audio: L('Аудиогид', 'Аудиогид', 'Audio guide'), listen: L('Слушать главу', 'Тарауды тыңдау', 'Listen to the chapter'),
  pause: L('Пауза', 'Кідірту', 'Pause'), resume: L('Продолжить рассказ', 'Әңгімені жалғастыру', 'Resume the story'), stop: L('Остановить рассказ', 'Әңгімені тоқтату', 'Stop narration'),
  loading: L('Готовим рассказ…', 'Әңгіме дайындалуда…', 'Preparing the story…'), playing: L('Звучит история этой главы', 'Осы тараудың тарихы айтылуда', 'This chapter’s story is playing'), paused: L('Рассказ на паузе', 'Әңгіме кідіртілді', 'The story is paused'),
  audioDescription: L('Можно слушать или читать — в своём темпе.', 'Өзіңізге ыңғайлы қарқында тыңдаңыз немесе оқыңыз.', 'Listen or read at your own pace.'),
  deviceVoice: L('Голос устройства. Можно слушать или читать.', 'Құрылғы дауысы. Тыңдауға немесе оқуға болады.', 'Device voice. Listen or read the story.'),
  transcript: L('Текст рассказа', 'Әңгіме мәтіні', 'Narration text'), copy: L('Скопировать текст', 'Мәтінді көшіру', 'Copy narration'), copied: L('Текст скопирован', 'Мәтін көшірілді', 'Text copied'),
  copyFallback: L('Выделите и скопируйте текст рассказа ниже.', 'Төмендегі әңгіме мәтінін белгілеп, көшіріңіз.', 'Select and copy the narration text below.'),
  voiceUnavailable: L('На устройстве нет голоса для этого языка. Рассказ можно прочитать или скопировать ниже.', 'Құрылғыда осы тілге арналған дауыс жоқ. Төмендегі әңгімені оқуға немесе көшіруге болады.', 'A voice for this language is not available on this device. You can read or copy the story below.'),
  playbackFailed: L('Не удалось включить рассказ. Попробуйте ещё раз или откройте текст.', 'Әңгіме қосылмады. Қайта көріңіз немесе мәтінді ашыңыз.', 'The story could not play. Try again or open the text.'),
  previous: L('Предыдущая глава', 'Алдыңғы тарау', 'Previous chapter'), next: L('Следующая глава', 'Келесі тарау', 'Next chapter'),
  first: L('Начало путешествия', 'Саяхаттың бастауы', 'The journey begins'), last: L('Шесть глав истории', 'Тарихтың алты тарауы', 'Six chapters of history'), restart: L('К первой главе', 'Бірінші тарауға', 'Back to the first chapter'),
};
function ArchiveFigure({ media, title, lang, secondary = false, onInspect }: { media: TimelineImage; title: LocalText; lang: Lang; secondary?: boolean; onInspect: (selection: ImageSelection) => void }) {
  const [failed, setFailed] = useState(false);
  return <figure className={secondary ? styles.secondaryFigure : styles.figure}>
    {failed ? <div className={styles.imageFallback} role="status"><ImageOff size={28}/><span>{text(copy.unavailable, lang)}</span><a href={media.sourceUrl} target="_blank" rel="noreferrer">{text(copy.original, lang)}<ArrowUpRight size={15}/></a></div>
      : <button className={styles.imageButton} type="button" onClick={() => onInspect({ media, title })} aria-label={text(copy.inspect, lang) + ': ' + text(media.alt, lang)}>
        <img src={asset(media.src)} alt={text(media.alt, lang)} loading={secondary ? 'lazy' : 'eager'} decoding="async" style={{ objectPosition: media.position || 'center', objectFit: media.fit || 'contain' }} onError={() => setFailed(true)}/>
        <span className={styles.expand}><Search size={19}/><span>{text(copy.zoom, lang)}</span></span>
      </button>}
    <figcaption><p>{text(media.src.endsWith('khanate-map.webp') ? copy.mapCaption : media.caption, lang)}</p><a href={media.sourceUrl} target="_blank" rel="noreferrer">{media.credit}<ArrowUpRight size={12}/></a></figcaption>
  </figure>;
}
export default function TimelinePage({ lang, reduced, large, onLanguage, onLargeChange, onNavigate, onOpenPlace, onOpenMap, onGuide, onNarrationChange }: TimelineProps) {
  const [active, setActive] = useState(routeChapter);
  const [selection, setSelection] = useState<ImageSelection | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [scriptOpen, setScriptOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(70);
  const siteHeader = useRef<HTMLElement>(null);
  const readButton = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const transcript = useRef<HTMLTextAreaElement>(null);
  const pendingFocus = useRef<'tab' | 'panel' | null>(null);
  const copyTimer = useRef<number>(undefined);
  const copyGeneration = useRef(0);
  const index = timelineEras.findIndex(era => era.id === active);
  const era = timelineEras[index], media = timelineMedia[era.id], culture = timelineCulture[era.id];
  const cultureMedia = timelineCultureMedia[era.id];
  const place = era.placeId ? getPlace(era.placeId) : undefined;
  const narrationText = useMemo(() => getTimelineNarration(era, lang), [era, lang]);
  const narration = useTimelineNarration({ chapterId: era.id, locale: lang, text: narrationText, src: timelineRecordings[era.id]?.[lang], onSpeakingChange: onNarrationChange });
  const narrationActive = ['loading', 'playing', 'paused'].includes(narration.status);
  const CultureIcon = culture.kind === 'music' ? Music2 : culture.kind === 'document' ? ScrollText : BookOpen;
  const selectImage = useCallback((value: ImageSelection) => setSelection(value), []);
  useLayoutEffect(() => {
    const element = siteHeader.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setHeaderHeight(element.getBoundingClientRect().height));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const selectChapter = useCallback((id: string, focus: 'tab' | 'panel' = 'panel', push = true) => {
    if (!timelineEras.some(item => item.id === id)) return;
    narration.stop(); pendingFocus.current = focus; setActive(id); setSelection(null);
    if (push && location.hash !== '#/timeline/' + id) history.pushState(null, '', '#/timeline/' + id);
    if (id === active) { pendingFocus.current = null; (focus === 'tab' ? navigation.current?.querySelector<HTMLElement>('[aria-selected="true"]') : panel.current)?.focus({ preventScroll: true }); }
  }, [active, narration.stop]);
  useEffect(() => {
    const restore = () => selectChapter(routeChapter(), 'panel', false);
    window.addEventListener('popstate', restore); window.addEventListener('hashchange', restore);
    return () => { window.removeEventListener('popstate', restore); window.removeEventListener('hashchange', restore); };
  }, [selectChapter]);
  useLayoutEffect(() => {
    copyGeneration.current++; window.clearTimeout(copyTimer.current);
    setCopied(false); setCopyFailed(false); setScriptOpen(false);
    const list = navigation.current, tab = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (list && tab) list.scrollTo({ left: tab.offsetLeft - list.offsetLeft - (list.clientWidth - tab.clientWidth) / 2, behavior: 'instant' });
    const focus = pendingFocus.current; pendingFocus.current = null;
    if (!focus || !panel.current) return;
    const headerHeight = document.querySelector('[data-ui="timeline-header"]')?.getBoundingClientRect().height || 0;
    const navHeight = list?.parentElement?.getBoundingClientRect().height || 0;
    window.scrollTo({ top: Math.max(0, window.scrollY + panel.current.getBoundingClientRect().top - headerHeight - navHeight - 16), behavior: 'instant' });
    (focus === 'tab' ? tab : panel.current)?.focus({ preventScroll: true });
  }, [active, lang]);
  useLayoutEffect(() => setDetailsOpen(false), [active]);
  useEffect(() => () => { copyGeneration.current++; window.clearTimeout(copyTimer.current); }, []);
  useEffect(() => { const element = dialog.current; if (selection && element && !element.open) element.showModal(); else if (!selection && element?.open) element.close(); }, [selection]);
  function onTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % timelineEras.length;
    else if (event.key === 'ArrowLeft') next = (index + timelineEras.length - 1) % timelineEras.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = timelineEras.length - 1;
    else return;
    event.preventDefault(); selectChapter(timelineEras[next].id, 'tab');
  }
  async function copyNarration() {
    const generation = copyGeneration.current;
    try {
      await navigator.clipboard.writeText(narrationText);
      if (generation !== copyGeneration.current) return;
      setCopied(true); setCopyFailed(false); window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 3000);
    } catch {
      if (generation !== copyGeneration.current) return;
      setScriptOpen(true); setCopyFailed(true);
      requestAnimationFrame(() => { transcript.current?.focus(); transcript.current?.select(); });
    }
  }
  const theme = { '--chapter-tone': themes[era.id][0], '--chapter-accent': themes[era.id][1], '--timeline-header-height': headerHeight + 'px' } as CSSProperties;
  const playLabel = narration.status === 'loading' ? copy.loading : narration.status === 'playing' ? copy.pause : narration.status === 'paused' ? copy.resume : copy.listen;
  const toggleNarration = () => { if (narration.status === 'playing') narration.pause(); else void narration.play(); };
  const openDetails = (target: string) => { setDetailsOpen(true); requestAnimationFrame(() => { const element = document.getElementById(target); element?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' }); element?.focus({preventScroll: true}); }); };
  const closeDetails = () => {
    setDetailsOpen(false);
    requestAnimationFrame(() => { readButton.current?.focus({preventScroll: true}); readButton.current?.scrollIntoView({behavior: reduced ? 'instant' : 'smooth', block: 'center'}); });
  };
  return <section className={styles.page} style={theme} data-ui="timeline-page" data-reduced={reduced} aria-labelledby="timeline-title">
    <header ref={siteHeader} className={styles.siteHeader} data-ui="timeline-header">
      <button className={styles.wordmark} type="button" onClick={() => onNavigate('home')} aria-label={text(L('IZQOR — На главную', 'IZQOR — Басты бет', 'IZQOR — Home'), lang)}><BrandWordmark priority/></button>
      <nav className={styles.desktopNav} aria-label={text(copy.periods, lang)}>
        {destinations.map(({target, label}) => <button type="button" key={target} onClick={() => onNavigate(target)}>{text(label, lang)}</button>)}
        <button type="button" aria-current="page" onClick={() => window.scrollTo({top: 0, behavior: reduced ? 'instant' : 'smooth'})}>{text(L('Линия времени', 'Уақыт желісі', 'Timeline'), lang)}</button>
      </nav>
      <div className={styles.headerActions}>
        <div className={styles.languages} role="group" aria-label="Language / Тіл / Язык">{(['kk', 'ru', 'en'] as Lang[]).map(locale => <button type="button" key={locale} onClick={() => onLanguage(locale)} aria-pressed={lang === locale} aria-label={{kk: 'Қазақша', ru: 'Русский', en: 'English'}[locale]}>{({kk: 'ҚАЗ', ru: 'РУС', en: 'ENG'})[locale]}</button>)}</div>
        <button className={styles.comfort} type="button" onClick={() => onLargeChange(!large)} aria-pressed={large} aria-label={text(L('Крупнее текст', 'Мәтінді үлкейту', 'Larger text'), lang)}><span aria-hidden="true">Аа</span><span>{text(L('Крупнее текст', 'Мәтінді үлкейту', 'Larger text'), lang)}</span></button>
        <details className={styles.mobileMenu} onKeyDown={event => { if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary')?.focus(); } }}>
          <summary aria-label={text(L('Открыть меню', 'Мәзірді ашу', 'Open menu'), lang)}><Menu size={24}/></summary>
          <nav aria-label={text(L('Меню', 'Мәзір', 'Menu'), lang)}>{destinations.map(({target, label}) => <button type="button" key={target} onClick={() => onNavigate(target)}>{text(label, lang)}<ArrowUpRight size={18}/></button>)}</nav>
        </details>
      </div>
    </header>
    <header className={styles.introduction}><h1 id="timeline-title">{text(copy.title, lang)}</h1><p>{text(copy.introduction, lang)}</p></header>
    <nav className={styles.navigation} data-ui="timeline-navigation" aria-label={text(copy.periods, lang)}>
      <div className={styles.tabs} role="tablist" ref={navigation} aria-label={text(copy.periods, lang)}>{timelineEras.map(item => <button key={item.id} type="button" role="tab" id={'tab-' + item.id} aria-selected={active === item.id} aria-controls="timeline-chapter-panel" tabIndex={active === item.id ? 0 : -1} onClick={() => selectChapter(item.id, 'tab')} onKeyDown={onTabKey}>
        <span className={styles.timelineDot} aria-hidden="true"/><span><small>{item.year}</small><strong>{text(item.id === 'education' ? L('Абай', 'Абай', 'Abai') : item.shortTitle, lang)}</strong></span>
      </button>)}</div>
    </nav>
    <article key={era.id} ref={panel} id="timeline-chapter-panel" className={styles.chapter} data-timeline-era={era.id} role="tabpanel" aria-labelledby={'tab-' + era.id} tabIndex={0}>
      <header className={styles.cover}>
        <div className={styles.coverInner}><div className={styles.coverText}>
          <p className={styles.chapterCount}>{text(copy.chapter, lang)} {index + 1} {text(copy.of, lang)} {timelineEras.length}</p>
          <p className={styles.year}>{era.year}</p><h2>{text(era.title, lang)}</h2><p className={styles.subtitle}>{text(era.id === 'khanate' ? copy.khanateSubtitle : era.subtitle, lang)}</p>
          <div className={styles.coverActions}><button className={styles.coverListen} type="button" onClick={toggleNarration} disabled={narration.status === 'loading'}>{narration.status === 'loading' ? <LoaderCircle className={styles.spinner} size={24}/> : narration.status === 'playing' ? <Pause size={24}/> : <Headphones size={25}/>} {text(playLabel, lang)}</button><button className={styles.mapLink} type="button" onClick={() => { narration.stop(); if (era.id === 'khanate') selectImage({ media, title: era.title }); else onOpenMap(era.placeId || undefined); }}><MapPin size={23}/><span>{text(copy.onMap, lang)}</span></button></div>{narration.notice && <p className={styles.heroNotice} role="status">{text(copy[narration.notice], lang)} <button type="button" onClick={() => openDetails('timeline-full-story')}>{text(copy.transcript, lang)}</button></p>}
        </div><ArchiveFigure key={media.src} media={media} title={era.title} lang={lang} onInspect={selectImage}/></div>
      </header>
      <div className={styles.storyContinuation} data-ui="timeline-continuation">
        <section className={styles.overview} aria-labelledby="timeline-overview-title">
          <div className={styles.overviewText}>
            <h3 id="timeline-overview-title">{text(era.id === 'khanate' ? copy.overviewTitle : copy.eraOverview, lang)}</h3>
            <p>{text(era.id === 'khanate' ? copy.khanateOverview : era.paragraphs[0], lang)}</p>
            <div className={styles.readingActions}>
              <button ref={readButton} className={styles.readFullButton} type="button" data-ui="timeline-read-full" aria-expanded={detailsOpen} aria-controls="timeline-full-story" onClick={() => detailsOpen ? closeDetails() : openDetails('timeline-full-story')}>{detailsOpen ? <ChevronUp size={29}/> : <BookOpen size={30}/>}<span>{text(detailsOpen ? copy.collapse : copy.readFull, lang)}</span></button>
              <button className={styles.sourceLink} type="button" aria-expanded={detailsOpen} aria-controls="timeline-sources" onClick={() => openDetails('timeline-sources')}>{text(copy.sourceLink, lang)}<ArrowUpRight size={18}/></button>
            </div>
            <p className={styles.readingHint}>{text(copy.readHint, lang)}</p>
          </div>
          <aside className={styles.guideSupport}>
            <div className={styles.guideHeading}><MessagesSquare size={38} strokeWidth={1.5}/><h3>{text(copy.together, lang)}</h3></div>
            <p>{text(copy.guideHint, lang)}</p>
            <button className={styles.guideButton} type="button" onClick={onGuide}><MessagesSquare size={25}/>{text(copy.askGuide, lang)}</button>
          </aside>
        </section>

      <section className={styles.fullChapter} hidden={!detailsOpen} id="timeline-full-story" tabIndex={-1} aria-labelledby="timeline-full-title">
        <header className={styles.fullChapterHeader}><h3 id="timeline-full-title">{text(copy.fullTitle, lang)}</h3><button type="button" onClick={closeDetails}><ChevronUp size={21}/>{text(copy.collapse, lang)}</button></header>
        <div className={styles.readingSurface}>
        <section className={styles.audioGuide} data-ui="timeline-audio" aria-labelledby="timeline-audio-title">
          <div className={styles.audioIdentity}><Headphones size={24} strokeWidth={1.5}/><div><h3 id="timeline-audio-title">{text(copy.audio, lang)}</h3><p role="status">{text(narration.status === 'loading' ? copy.loading : narration.status === 'playing' ? copy.playing : narration.status === 'paused' ? copy.paused : narration.source === 'speech' ? copy.deviceVoice : copy.audioDescription, lang)}</p></div></div>
          <div className={styles.audioControls}>
            <button className={styles.audioPlay} type="button" data-ui="timeline-play" onClick={toggleNarration} disabled={narration.status === 'loading'}>{narration.status === 'loading' ? <LoaderCircle className={styles.spinner} size={17}/> : narration.status === 'playing' ? <Pause size={17}/> : <Play size={17}/>} {text(playLabel, lang)}</button>
            {narrationActive && <button className={styles.stop} type="button" data-ui="timeline-stop" onClick={narration.stop} aria-label={text(copy.stop, lang)}><Square size={16}/></button>}
            <button className={styles.copyButton} type="button" data-ui="timeline-copy" aria-label={text(copied ? copy.copied : copy.copy, lang)} onClick={() => void copyNarration()}>{copied ? <Check size={16}/> : <Copy size={16}/>}<span role="status">{text(copied ? copy.copied : copy.copy, lang)}</span></button>
          </div>
          {narration.notice && <p className={styles.notice} role="alert">{text(copy[narration.notice], lang)}</p>}
          <details className={styles.transcript} open={scriptOpen} onToggle={event => setScriptOpen(event.currentTarget.open)}><summary>{text(copy.transcript, lang)}</summary><textarea ref={transcript} aria-label={text(copy.transcript, lang)} readOnly value={narrationText} rows={9}/>{copyFailed && <p role="status">{text(copy.copyFallback, lang)}</p>}</details>
        </section>
        <div className={styles.readingGrid}>
          <section className={styles.prose} data-ui="timeline-story-text" aria-labelledby="timeline-story-title"><h3 id="timeline-story-title">{text(copy.story, lang)}</h3>{era.paragraphs.map((paragraph, ordinal) => <p key={ordinal}>{text(paragraph, lang)}</p>)}</section>
          <aside className={styles.evidence} aria-labelledby="timeline-facts-title"><h3 id="timeline-facts-title">{text(copy.facts, lang)}</h3><dl className={styles.facts}>{era.facts.map((fact, ordinal) => <div key={ordinal}><dt>{text(fact.label, lang)}</dt><dd>{text(fact.value, lang)}</dd></div>)}</dl>{media.secondary && <ArchiveFigure key={media.secondary.src} media={media.secondary} title={era.title} lang={lang} secondary onInspect={selectImage}/>}</aside>
        </div>
        <section className={styles.culture} data-ui="timeline-culture" aria-labelledby="timeline-culture-title">
          <div className={styles.cultureHeading}><CultureIcon size={24} strokeWidth={1.4}/><h3>{text(copy.culture, lang)}</h3><span>{text(culture.eyebrow, lang)}</span></div>
          <div className={styles.cultureGrid} data-has-image={!!cultureMedia}>
            {cultureMedia && <ArchiveFigure key={cultureMedia.src} media={cultureMedia} title={culture.title} lang={lang} secondary onInspect={selectImage}/>}
            <div className={styles.cultureText}><p className={styles.cultureDate}>{text(culture.date, lang)}</p><h4 id="timeline-culture-title">{text(culture.title, lang)}</h4><p>{text(culture.description, lang)}</p><a className={styles.cultureSource} href={culture.source.url} target="_blank" rel="noreferrer">{text(culture.source.title, lang)}<ArrowUpRight size={16}/></a></div>
            <aside className={styles.cultureFact}><span>{text(copy.fact, lang)}</span><p>{text(culture.interestingFact, lang)}</p></aside>
          </div>
        </section>
        <div className={styles.references}>
          <aside className={styles.connection}><MapPin size={22} strokeWidth={1.5}/><h3>{text(copy.connection, lang)}</h3><p>{text(era.connection, lang)}</p>{place && <button type="button" onClick={() => { narration.stop(); onOpenPlace(place.id); }}>{text(place.name, lang)}<ArrowRight size={17}/><span className={styles.srOnly}> — {text(copy.place, lang)}</span></button>}</aside>
          <section className={styles.sources} id="timeline-sources" tabIndex={-1}><h3>{text(copy.sources, lang)}</h3><ul>{era.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer"><span><small>{source.organization}</small>{text(source.title, lang)}</span><ArrowUpRight size={16}/></a></li>)}</ul></section>
        </div>
      </div></section>
        <nav className={styles.chapterFooter} aria-label={text(copy.periods, lang)}>
          {index > 0 && <button className={styles.previousChapter} type="button" data-ui="timeline-previous" onClick={() => selectChapter(timelineEras[index - 1].id)}><ArrowLeft size={22}/><span>{text(copy.previous, lang)}</span></button>}
          {index < timelineEras.length - 1 ? <button className={styles.nextChapter} type="button" data-ui="timeline-next" onClick={() => selectChapter(timelineEras[index + 1].id)}><span className={styles.nextChapterCopy}><span className={styles.nextMeta}><span>{text(copy.next, lang)}</span><span>{timelineEras[index + 1].year}</span></span><strong>{text(timelineEras[index + 1].title, lang)}</strong></span><span className={styles.nextArrow}><ArrowRight size={34}/></span></button> : <button className={styles.nextChapter} type="button" data-ui="timeline-restart" onClick={() => selectChapter(timelineEras[0].id)}><span className={styles.nextChapterCopy}><span className={styles.nextMeta}>{text(copy.last, lang)}</span><strong>{text(copy.restart, lang)}</strong></span><span className={styles.nextArrow}><ArrowRight size={34}/></span></button>}
        </nav>
      </div>
    </article>
    <dialog ref={dialog} className={styles.viewer} data-ui="timeline-viewer" aria-labelledby="timeline-image-title" onCancel={() => setSelection(null)} onClose={() => setSelection(null)} onClick={event => { if (event.target === event.currentTarget) setSelection(null); }}>
      {selection && <div className={styles.viewerContent}><header><h2 id="timeline-image-title">{text(selection.title, lang)}</h2><button type="button" onClick={() => setSelection(null)} aria-label={text(copy.close, lang)} autoFocus><X size={23}/></button></header><img src={asset(selection.media.src)} alt={text(selection.media.alt, lang)}/><footer><p>{text(selection.media.caption, lang)}</p><span>{selection.media.credit} · {selection.media.license}</span><a href={selection.media.sourceUrl} target="_blank" rel="noreferrer">{text(copy.original, lang)}<ArrowUpRight size={16}/></a></footer></div>}
    </dialog>
  </section>;
}
