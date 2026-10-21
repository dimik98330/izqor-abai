import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, Check, ChevronDown, Compass, ExternalLink, Globe2, Headphones, MapPin, Menu, Mic, Pause, Play, Search, Send, Settings2, Share2, Sparkles, Volume2, VolumeX, X, FileText, Download, Trash2, CircleStop } from 'lucide-react';
import { places, sources, getPlace, getSource, type Place } from './content';
import { copy, L, text, languageNames, type Lang, type CopyKey, type LocalText } from './i18n';
import GuidePanel from './GuidePanel';
import SettingsPanel from './SettingsPanel';
import { requestRecordingStream } from './capture';
import HomeJourney from './HomeJourney';
import AtlasContinuation from './AtlasContinuation';
import BrandWordmark from './BrandWordmark';
import SiteFooter from './SiteFooter';
import StoryIllustrations from './StoryIllustrations';
import { storyReadingMinutes } from './story-reading';
import LoadBoundary from './LoadBoundary';
const Atlas=lazy(()=>import('./Atlas'));
const TimelinePage=lazy(()=>import('./TimelinePage'));
const ModelView=lazy(()=>import('./ModelView'));
const OnboardingGuide=lazy(()=>import('./OnboardingGuide'));
const GuideAvatar=lazy(()=>import('./GuideAvatar'));
type Page='home'|'places'|'map'|'timeline'|'sources'|'place';
const asset=(url:string)=>import.meta.env.BASE_URL+url.replace(/^\//,'');
function stored<T,>(key:string,fallback:T):T{try{const value=localStorage.getItem('izqor.'+key);return value?JSON.parse(value):fallback;}catch{return fallback;}}
function readRoute(){const parts=location.hash.replace(/^#\/?/,'').split('/');return {page:((['home','places','map','timeline','sources','place'].includes(parts[0])?parts[0]:'home') as Page),place:parts[1]||'zhidebay'};}
function Dialog({open,onClose,title,children,wide=false,lang}:{lang:Lang;open:boolean;onClose:()=>void;title:string;children:ReactNode;wide?:boolean}){
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{if(open)ref.current?.showModal();else ref.current?.close();return()=>ref.current?.close();},[open]);
  if(!open)return null;
  return <dialog ref={ref} className={'dialog '+(wide?'dialog-wide':'')} aria-label={title} onCancel={onClose} onClose={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="dialog-shell"><header className="dialog-header"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label={text(copy.close,lang)} autoFocus><X size={22}/></button></header>{children}</div>
  </dialog>;
}
function Photo({src,alt,className=''}:{src:string;alt:string;className?:string}){
  const [failed,setFailed]=useState(false);
  return failed?<div className={'photo-fallback '+className}><MapPin size={38}/><span>{alt}</span></div>:<img className={className} src={asset(src)} alt={alt} onError={()=>setFailed(true)} loading="lazy" decoding="async"/>;
}
function SourcePills({ids,lang}:{ids:string[];lang:Lang}){
  return <div className="source-pills">{ids.map(id=>{const s=getSource(id);return s?<a key={id} href={s.url} target="_blank" rel="noreferrer"><FileText size={13}/>{s.organization}<ArrowUpRight size={12}/></a>:null;})}</div>;
}
export default function App(){
  const initial=readRoute();
  const [page,setPage]=useState<Page>(initial.page),[selected,setSelected]=useState(getPlace(initial.place)?.id||'zhidebay');
  const [lang,setLang]=useState<Lang>(()=>{const l=stored<string>('language','ru');return ['ru','kk','en'].includes(l)?l as Lang:'ru';});
  const [large,setLarge]=useState(()=>stored('large',false)),[contrast,setContrast]=useState(()=>stored('contrast',false)),[reduce,setReduce]=useState(()=>stored('reduce',false));
  const systemReduce=useReducedMotion(),reduced=reduce||!!systemReduce;
  const [settings,setSettings]=useState(false),[mobileNav,setMobileNav]=useState(false),[guideOpen,setGuideOpen]=useState(false),[tour,setTour]=useState<string|null>(null),[tourLoading,setTourLoading]=useState(false);
  const [saved,setSaved]=useState<string[]>(()=>stored<string[]>('saved',[]).filter(id=>!!getPlace(id)));
  const [visited,setVisited]=useState<string[]>(()=>stored<string[]>('visited',[]).filter(id=>!!getPlace(id)));
  const [playing,setPlaying]=useState(false),[volume,setVolume]=useState(()=>stored<number>('volume',.3)),[voice,setVoice]=useState(false);
  const [toast,setToast]=useState(''),[online,setOnline]=useState(navigator.onLine);
  const [modelOpen,setModelOpen]=useState(false);
  const [headerScrolled,setHeaderScrolled]=useState(false);
  const [onboardingOpen,setOnboardingOpen]=useState(()=>initial.page==='home'&&stored<number>('introductionVersion',0)!==1),[memoryOpen,setMemoryOpen]=useState(false);
  const onboardingLauncher=useRef<HTMLElement|null>(null);
  const [sourceQuery,setSourceQuery]=useState(''),[sourceCategory,setSourceCategory]=useState('all');
  const audio=useRef<HTMLAudioElement>(null),toastTimer=useRef<number|undefined>(undefined),narrationGeneration=useRef(0);
  const place=getPlace(selected)||places[0], t=(key:CopyKey)=>text(copy[key],lang),p=(value:LocalText)=>text(value,lang);
  function notify(value:string){setToast(value);window.clearTimeout(toastTimer.current);toastTimer.current=window.setTimeout(()=>setToast(''),5000);}
  function navigate(next:Page,id?:string){if(id&&getPlace(id))setSelected(id);setPage(next);setMobileNav(false);location.hash=next==='home'?'/':'/'+next+(next==='place'?'/'+(id||selected):next==='timeline'&&id?'/'+id:'');window.scrollTo({top:0,behavior:'instant'});}
  function openPlace(id:string){navigate('place',id);setVisited(prev=>prev.includes(id)?prev:[...prev,id]);}
  function startIntroduction(origin?:HTMLElement){onboardingLauncher.current=origin||null;setSettings(false);setGuideOpen(false);navigate('home');setOnboardingOpen(true);}
  function closeIntroduction(){setOnboardingOpen(false);try{localStorage.setItem('izqor.introductionVersion','1');}catch{}requestAnimationFrame(()=>{if(document.querySelector('dialog[open]'))return;const target=onboardingLauncher.current?.isConnected?onboardingLauncher.current:document.querySelector<HTMLElement>('[data-start-tour]')||document.getElementById('main-content');target?.focus({preventScroll:true});});}
  useEffect(()=>{const change=()=>{const route=readRoute();setPage(route.page);if(getPlace(route.place))setSelected(route.place);};window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change);},[]);
  useEffect(()=>{
    const update=()=>setHeaderScrolled(window.scrollY>24);
    update();window.addEventListener('scroll',update,{passive:true});
    return()=>window.removeEventListener('scroll',update);
  },[]);
  useEffect(()=>{
    if(!mobileNav)return;
    const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){setMobileNav(false);document.querySelector<HTMLButtonElement>('.mobile-menu-button')?.focus();}};
    window.addEventListener('keydown',close);
    return()=>window.removeEventListener('keydown',close);
  },[mobileNav]);
  useEffect(()=>{
    document.documentElement.lang=lang;document.title='IZQOR — '+text(copy.heroTitle,lang);document.documentElement.dataset.large=String(large);document.documentElement.dataset.contrast=String(contrast);document.documentElement.dataset.reduce=String(reduced);
    try{for(const [key,val] of Object.entries({language:lang,large,contrast,reduce,saved,visited,volume}))localStorage.setItem('izqor.'+key,JSON.stringify(val));}catch{}
  },[lang,large,contrast,reduce,reduced,saved,visited,volume]);
  useEffect(()=>{if(audio.current)audio.current.volume=Math.min(1,Math.max(0,volume));},[volume]);
  useEffect(()=>{const on=()=>setOnline(true),off=()=>setOnline(false);window.addEventListener('online',on);window.addEventListener('offline',off);return()=>{window.removeEventListener('online',on);window.removeEventListener('offline',off);};},[]);
  useEffect(()=>{const header=document.querySelector('.site-header');if(!header)return;const observer=new ResizeObserver(()=>document.documentElement.style.setProperty('--header-height',header.getBoundingClientRect().height+'px'));observer.observe(header);return()=>observer.disconnect();},[]);
  useEffect(()=>{narrationGeneration.current++;window.speechSynthesis?.cancel();setVoice(false);},[lang,selected,page]);
  useEffect(()=>{const media=audio.current;if(!media)return;let disposed=false;if(!playing||voice)media.pause();else void media.play().catch(()=>{if(!disposed)setPlaying(false);});return()=>{disposed=true;};},[playing,voice]);
  useEffect(()=>()=>{window.speechSynthesis?.cancel();window.clearTimeout(toastTimer.current);},[]);
  async function toggleMusic(){
    const media=audio.current;if(!media)return;
    if(playing){setPlaying(false);media.pause();return;}
    setPlaying(true);if(voice)return;
    try{await media.play();}catch(error){if(error instanceof DOMException&&error.name==='AbortError')return;setPlaying(false);notify(t('soundError'));}
  }
  function listen(){
    if(voice){narrationGeneration.current++;window.speechSynthesis?.cancel();setVoice(false);return;}
    const synth=window.speechSynthesis;if(!synth){notify(t('noVoice'));return;}
    const found=synth.getVoices().find(v=>v.lang.toLowerCase().startsWith(lang));
    if(!found){notify(t('noVoice'));return;}
    const generation=++narrationGeneration.current;
    const utterance=new SpeechSynthesisUtterance(p(place.name)+'. '+place.sections.map(s=>p(s.body)).join(' '));
    utterance.voice=found;utterance.lang=found.lang;utterance.rate=.9;
    const finish=()=>{if(narrationGeneration.current===generation)setVoice(false);};
    utterance.onend=finish;utterance.onerror=finish;
    audio.current?.pause();setVoice(true);
    try{synth.speak(utterance);}catch{finish();notify(t('noVoice'));}
  }
  async function share(){try{await navigator.clipboard.writeText(location.href);notify(t('copied'));}catch{notify(location.href);}}
  function openTour(url:string){setTourLoading(true);setTour(url);}
  const navigation:[Page,CopyKey][]=[['home','journey'],['map','map'],['places','places'],['timeline','timeline']];
  const sourceResults=sources.filter(s=>(sourceCategory==='all'||s.category===sourceCategory)&&(!sourceQuery||(p(s.title)+' '+s.organization).toLocaleLowerCase().includes(sourceQuery.toLocaleLowerCase())));
  return <div className={'app page-'+page}>
    <a className="skip-link" href="#main-content" onClick={e=>{e.preventDefault();document.getElementById('main-content')?.focus();}}>{t('skip')}</a>
    <audio ref={audio} src={asset('/media/kazakh-dombra.mp3')} loop preload="none" onError={()=>{setPlaying(false);notify(t('soundError'));}}/>
    <header className={'site-header'+(headerScrolled||mobileNav?' is-scrolled':'')}>
      <button type="button" className="wordmark" onClick={()=>navigate('home')} aria-label={p(L('IZQOR — На главную','IZQOR — Басты бет','IZQOR — Home'))}><BrandWordmark priority/></button>
      <nav className="desktop-nav" aria-label={t('journey')}>{navigation.map(([target,key])=><button key={target} onClick={()=>navigate(target)} aria-current={page===target?'page':undefined}>{t(key)}</button>)}</nav>
      <div className="header-actions"><div className="language-switch" data-tour="language" aria-label="Language / Тіл / Язык">{(['kk','ru','en'] as Lang[]).map(l=><button key={l} onClick={()=>setLang(l)} aria-pressed={lang===l} aria-label={languageNames[l]}>{l.toUpperCase()}</button>)}</div>
        <button className={'icon-button music-toggle '+(playing?'is-playing':'')} aria-label={playing?t('soundOn'):t('soundOff')} title={playing?t('soundOn'):t('soundOff')} onClick={toggleMusic} aria-pressed={playing}>{playing?<Volume2 size={20}/>:<VolumeX size={20}/>}</button>
        <button className="icon-button" data-tour="comfort" onClick={()=>setSettings(true)} aria-label={t('settings')} title={t('settings')}><Settings2 size={20}/></button>
        <button className="icon-button mobile-menu-button" onClick={()=>setMobileNav(!mobileNav)} aria-expanded={mobileNav} aria-controls="mobile-navigation" aria-label={t('journey')}>{mobileNav?<X/>:<Menu/>}</button>
      </div>
    </header>
    {mobileNav&&<nav className="mobile-nav" id="mobile-navigation" aria-label={t('journey')}>{navigation.map(([target,key])=><button key={target} onClick={()=>navigate(target)} aria-current={page===target?'page':undefined}>{t(key)}<ArrowUpRight size={18}/></button>)}</nav>}
    {!online&&<div className="offline-banner" role="status">{t('offline')}</div>}
    <main id="main-content" tabIndex={-1}>
      <AnimatePresence mode="wait">
      <motion.div key={page==='place'?'place-'+selected:page} initial={{opacity:reduced?1:0}} animate={{opacity:1}} exit={{opacity:reduced?1:0}} transition={{duration:reduced?0:.25}}>
      <LoadBoundary key={page==='place'?'place-'+selected:page} lang={lang} scope="page">
      {page==='home'&&<><HomeJourney lang={lang} reduced={reduced} selected={selected} onSelect={setSelected} onOpen={openPlace} onIntroduction={startIntroduction}/><AtlasContinuation lang={lang} onOpen={openPlace} onGuide={id=>{setSelected(id);setGuideOpen(true);}}/></>}
      {page==='places'&&<section className="section page-section"><div className="section-heading"><div><span className="section-label">{t('region')}</span><h1>{t('places')}</h1><p>{t('discoverText')}</p></div><div className="progress-summary"><span>{visited.length}<small>/ 5</small></span><p>{t('visited')}</p></div></div>
        {saved.length>0&&<div className="saved-strip"><Bookmark size={17}/><span>{t('savedPlaces')}</span>{saved.map(id=><button key={id} onClick={()=>openPlace(id)}>{p(getPlace(id)!.name)}</button>)}</div>}
        <div className="places-grid">{places.map((item,i)=><PlaceCard key={item.id} place={item} lang={lang} index={i} onOpen={()=>openPlace(item.id)} saved={saved.includes(item.id)}/>)}</div>
      </section>}
      {page==='place'&&<>
        <section className="story-hero"><div className="story-photo"><Photo src={place.image} alt={p(place.name)}/><div className="story-photo-shade"/></div><div className="story-hero-inner"><button className="back-button" onClick={()=>navigate('places')}><ArrowLeft size={17}/>{t('allPlaces')}</button><div className="story-title"><span className="location-line"><MapPin size={14}/>{t('region')}</span><h1>{p(place.name)}</h1><p>{p(place.subtitle)}</p><div className="story-hero-meta"><span>{p(place.era)}</span><span>{storyReadingMinutes(place,lang)} {t('readingTime')}</span></div></div><a className="story-photo-credit" href={getSource(place.imageSource)!.url} target="_blank" rel="noreferrer">{place.imageCredit}<ExternalLink size={13}/></a></div></section>
        <div className="story-toolbar"><button onClick={listen} className="toolbar-button">{voice?<Pause size={18}/>:<Headphones size={18}/>}<span>{voice?t('stopVoice'):t('listen')}</span></button><button className="toolbar-button" onClick={()=>{setSaved(prev=>prev.includes(place.id)?prev.filter(v=>v!==place.id):[...prev,place.id]);}} aria-pressed={saved.includes(place.id)}>{saved.includes(place.id)?<Check size={18}/>:<Bookmark size={18}/>}<span>{saved.includes(place.id)?t('saved'):t('bookmark')}</span></button><button className="toolbar-button" onClick={share}><Share2 size={18}/><span>{t('share')}</span></button><button className="toolbar-button toolbar-guide" onClick={()=>setGuideOpen(true)}><Sparkles size={18}/><span>{t('guide')}</span></button></div>
        <section className="section story-body"><aside className="story-side"><span className="section-label">{t('story')}</span><nav aria-label={t('story')}>{place.sections.map((s,i)=><a key={i} href={'#section-'+i} onClick={e=>{e.preventDefault();document.getElementById('section-'+i)?.scrollIntoView({behavior:reduced?'instant':'smooth'});}}>{p(s.title)}</a>)}</nav></aside>
          <article className="story-article">{place.sections.map((section,i)=><section key={i} id={'section-'+i} className="story-section"><h2>{p(section.title)}</h2>{p(section.body).split(/\n\s*\n/).map((paragraph,index)=><p key={index}>{paragraph}</p>)}<SourcePills ids={section.sourceIds} lang={lang}/><StoryIllustrations ids={section.imageIds} lang={lang}/></section>)}<div className="look-closer"><Compass size={26}/><div><h3>{t('learning')}</h3><p>{p(place.detail)}</p></div></div></article></section>
        {place.tours.length>0&&<section className="panorama-section section"><div><span className="section-label">{t('panorama')}</span><h2>{t('compareTitle')}</h2><p>{t('compareText')}</p><div className="tour-buttons">{place.tours.map(v=><button className="button button-gold" key={v.url} onClick={()=>openTour(v.url)}><Globe2 size={18}/>{p(v.name)}<ArrowUpRight size={17}/></button>)}</div></div><button data-tour="panorama" className="panorama-preview" onClick={()=>openTour(place.tours[0].url)} aria-label={t('openPanorama')}><Photo src={place.image} alt={p(place.name)}/><span className="panorama-orb"><Globe2 size={35} strokeWidth={1}/><span>360°</span></span><span className="panorama-preview-caption">{t('openPanorama')}<ArrowUpRight size={18}/></span></button></section>}
        <section className="section story-source-section"><div className="section-heading"><div><span className="section-label">{t('verified')}</span><h2>{t('sources')}</h2></div></div><div className="story-source-list">{place.sourceIds.map(id=>{const s=getSource(id);return s?<a key={id} href={s.url} target="_blank" rel="noreferrer"><div><small>{s.organization}</small><h3>{p(s.title)}</h3></div><ArrowUpRight size={22}/></a>:null;})}</div></section>
        <div className="next-story"><span>{t('next')}</span><button onClick={()=>openPlace(places[(places.indexOf(place)+1)%places.length].id)}>{p(places[(places.indexOf(place)+1)%places.length].name)}<ArrowRight size={30}/></button></div>
      </>}
      {page==='map'&&<section className="map-page"><Suspense fallback={<div className="atlas-fallback" role="status">{t('mapLoading')}</div>}><Atlas lang={lang} selected={selected} onSelect={setSelected} onOpen={openPlace} reduced={reduced}/></Suspense></section>}
      {page==='timeline'&&<Suspense fallback={<section className="section page-section" role="status"><span className="spinner"/>{p(L('Загружаем историю…','Тарих жүктелуде…','Loading history…'))}</section>}><TimelinePage lang={lang} reduced={reduced} large={large} onLanguage={setLang} onLargeChange={setLarge} onNavigate={navigate} onOpenPlace={openPlace} onOpenMap={id=>navigate('map',id)} onGuide={()=>setGuideOpen(true)} onNarrationChange={setVoice}/></Suspense>}
      {page==='sources'&&<section className="section page-section sources-page"><div className="section-heading"><div><span className="section-label">{t('verified')}</span><h1>{t('sources')}</h1><p>{t('sourceIntro')}</p></div><span className="source-total">{sources.length}</span></div><div className="source-controls"><label className="search-field"><Search size={18}/><input value={sourceQuery} onChange={e=>setSourceQuery(e.target.value)} placeholder={t('sourceSearch')} aria-label={t('sourceSearch')}/></label><div className="filter-chips">{(['all','museum','archive','photo','openData','mapSources'] as const).map(category=><button key={category} aria-pressed={sourceCategory===category} onClick={()=>setSourceCategory(category)}>{t(category)}</button>)}</div></div><div className="sources-list">{sourceResults.length?sourceResults.map(s=><article className="source-row" key={s.id}><div className="source-type-icon"><FileText size={23} strokeWidth={1.3}/></div><div><span className="source-organization">{s.organization}</span><h2><a href={s.url} target="_blank" rel="noreferrer">{p(s.title)}<ArrowUpRight size={18}/></a></h2>{s.note&&<p>{p(s.note)}</p>}</div><span className="source-category">{t(s.category)}</span></article>):<p>{t('noResults')}</p>}</div><div className="source-endnote"><p>{t('musicCredit')}</p><a href="https://pixabay.com/service/license-summary/" target="_blank" rel="noreferrer">Pixabay Content License</a></div></section>}
      </LoadBoundary></motion.div></AnimatePresence>
      {page==='place'&&place.id==='kozy'&&<section className="section model-invitation"><div><span className="section-label">3D</span><h2>{p(L('Рассмотреть форму со всех сторон','Пішінді жан-жақтан қарау','Explore the form from every side'))}</h2><p>{p(L('Откройте учебную геометрическую схему и сопоставьте её с исходной фотографией.','Оқу геометриялық сызбасын ашып, негізгі фотомен салыстырыңыз.','Open an educational geometric study and compare it with the source photograph.'))}</p></div><button className="button button-teal" onClick={()=>setModelOpen(true)}><Globe2 size={19}/>{p(L('Открыть 3D','3D ашу','Explore in 3D'))}<ArrowUpRight size={18}/></button></section>}
    </main>
    <SiteFooter lang={lang} onHome={()=>navigate('home')} onSources={()=>navigate('sources')} onSettings={()=>setSettings(true)} onMemory={()=>setMemoryOpen(true)} onIntroduction={startIntroduction}/>
    <Dialog lang={lang} open={memoryOpen} onClose={()=>setMemoryOpen(false)} title={t('memoryTitle')} wide><MemorySection lang={lang} notify={notify}/></Dialog>
    {onboardingOpen&&<Suspense fallback={null}><OnboardingGuide open={onboardingOpen} lang={lang} reduced={reduced} onClose={closeIntroduction} onNavigate={navigate} onAskGuide={()=>setGuideOpen(true)} renderAvatar={(step,speaking,focusPoint)=><Suspense fallback={<span className="spinner"/>}><GuideAvatar lang={lang} focusPoint={focusPoint} step={step} reduced={reduced} speaking={speaking} compact={step!==0}/></Suspense>}/></Suspense>}
    {!guideOpen&&page!=='map'&&<button className="floating-guide guide-chat-launcher" data-tour="guide" aria-label={p(L('Жолсерік — спросите меня о чём угодно','Жолсерік — маған кез келген сұрақ қойыңыз','Zholserik — ask me anything'))} onClick={()=>setGuideOpen(true)}><span className="guide-trigger-portrait" aria-hidden="true"><img src={asset('/media/zholserik-avatar.png')} alt="" width={144} height={168} decoding="async"/></span><span className="guide-trigger-copy"><small>{p(L('Жолсерік','Жолсерік','Zholserik'))}</small><strong>{p(L('Спросите о чём угодно','Кез келген сұрақ қойыңыз','Ask me anything'))}</strong></span><ArrowUpRight size={18} strokeWidth={1.6} aria-hidden="true"/></button>}
    <Dialog lang={lang} open={settings} onClose={()=>setSettings(false)} title={t('settings')}><SettingsPanel lang={lang} large={large} contrast={contrast} reduce={reduce} volume={volume} playing={playing} narrating={voice} visitedCount={visited.length} savedCount={saved.length} placeCount={places.length} onLargeChange={setLarge} onContrastChange={setContrast} onReduceChange={setReduce} onVolumeChange={setVolume} onToggleMusic={toggleMusic} onIntroduction={startIntroduction} onReset={()=>{setVisited([]);setSaved([]);}} onClose={()=>setSettings(false)}/></Dialog>
    <Dialog lang={lang} open={!!tour} onClose={()=>setTour(null)} title={p(place.name)+' · '+t('panorama')} wide><div className="panorama-frame-wrap">{tourLoading&&<div className="panorama-loading"><span className="spinner"/>{t('loadingTour')}</div>}{tour&&<iframe key={tour} src={tour} title={p(place.name)+' 360°'} allow="fullscreen" allowFullScreen onLoad={()=>setTourLoading(false)} referrerPolicy="strict-origin-when-cross-origin"/>}</div><div className="panorama-footer"><span>{t('tourHelp')}</span><a href={tour||undefined} target="_blank" rel="noreferrer">{t('externalTour')}<ExternalLink size={14}/></a></div></Dialog>
    <Dialog lang={lang} open={guideOpen} onClose={()=>setGuideOpen(false)} title={p(L('Жолсерік','Жолсерік','Zholserik'))}><GuidePanel lang={lang} reduced={reduced} placeId={selected} onLanguage={setLang} onClose={()=>setGuideOpen(false)} onSelect={id=>page==='place'?navigate('place',id):setSelected(id)}/></Dialog>
    <Dialog lang={lang} open={modelOpen} onClose={()=>setModelOpen(false)} title={p(L('Қозы Көрпеш — Баян Сұлу · архитектурная схема','Қозы Көрпеш — Баян Сұлу · сәулеттік сызба','Kozy Korpesh — Bayan Sulu · architectural study'))} wide><Suspense fallback={<div className="atlas-fallback"><span className="spinner"/></div>}><ModelView lang={lang} reduced={reduced}/></Suspense></Dialog>
    <AnimatePresence>{toast&&<motion.div className="toast" role="status" initial={{opacity:0,y:reduced?0:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>{toast}<button onClick={()=>setToast('')} aria-label={t('close')}><X size={16}/></button></motion.div>}</AnimatePresence>
  </div>;
}
function PlaceCard({place,lang,index,onOpen,saved}:{place:Place;lang:Lang;index:number;onOpen:()=>void;saved:boolean}){
  return <button className={'place-card place-'+place.id} onClick={onOpen}><Photo src={place.image} alt={text(place.name,lang)}/><div className="place-card-shade"/><div className="place-card-top"><span>{String(index+1).padStart(2,'0')}</span>{saved?<Bookmark size={18}/>:<ArrowUpRight size={21}/>}</div><div className="place-card-content"><span>{text(place.era,lang)}</span><h3>{text(place.name,lang)}</h3><p>{text(place.short,lang)}</p></div></button>;
}
function MemorySection({lang,notify}:{lang:Lang;notify:(s:string)=>void}){
  const t=(key:CopyKey)=>text(copy[key],lang),[recording,setRecording]=useState(false),[requesting,setRequesting]=useState(false),[url,setUrl]=useState(''),[mime,setMime]=useState('audio/webm');
  const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),urlRef=useRef(''),mounted=useRef(false),pending=useRef(false);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;if(recorder.current?.state==='recording')recorder.current.stop();stream.current?.getTracks().forEach(track=>track.stop());if(urlRef.current)URL.revokeObjectURL(urlRef.current);};},[]);
  async function start(){
    if(pending.current||recorder.current?.state==='recording')return;
    pending.current=true;setRequesting(true);
    try{
      if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw new Error('unavailable');
      const acquired=await requestRecordingStream(()=>navigator.mediaDevices.getUserMedia({audio:true}),()=>mounted.current);
      if(!acquired)return;
      stream.current=acquired;
      const type=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(type=>MediaRecorder.isTypeSupported(type));
      const media=new MediaRecorder(stream.current,type?{mimeType:type}:undefined);recorder.current=media;const chunks:Blob[]=[];
      media.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      media.onstop=()=>{acquired.getTracks().forEach(track=>track.stop());if(!mounted.current)return;const blob=new Blob(chunks,{type:media.mimeType});if(urlRef.current)URL.revokeObjectURL(urlRef.current);urlRef.current=URL.createObjectURL(blob);setUrl(urlRef.current);setMime(media.mimeType);setRecording(false);};
      media.start();setRecording(true);
    }catch{stream.current?.getTracks().forEach(track=>track.stop());if(mounted.current)notify(t('recordError'));}
    finally{pending.current=false;if(mounted.current)setRequesting(false);}
  }
  return <section className="memory-section section"><div className="memory-copy"><h2>{t('memoryTitle')}</h2><p>{t('memoryText')}</p><small>{t('recordNote')}</small></div><div className="memory-actions"><button className={'button '+(recording?'button-recording':'button-outline')} disabled={requesting} aria-busy={requesting} onClick={()=>recording?recorder.current?.stop():start()}>{recording?<CircleStop size={19}/>:<Mic size={19}/>} {requesting?text(L('Ожидание разрешения микрофона…','Микрофонға рұқсат күтілуде…','Waiting for microphone permission…'),lang):recording?t('stopRecording'):t('startRecording')}</button>{recording&&<span role="status" className="recording-indicator">{t('recording')}</span>}{url&&!recording&&<div className="recording-result"><audio src={url} controls/><div><a href={url} download={'izqor-memory.'+(mime.includes('mp4')?'m4a':'webm')} className="text-button"><Download size={16}/>{t('downloadRecording')}</a><button className="icon-button" aria-label={t('removeRecording')} onClick={()=>{URL.revokeObjectURL(urlRef.current);urlRef.current='';setUrl('');}}><Trash2 size={17}/></button></div></div>}</div></section>;
}
