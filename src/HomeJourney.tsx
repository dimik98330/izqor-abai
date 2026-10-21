import { lazy, Suspense, useId, useRef } from 'react';
import { ArrowDown, ArrowRight, Play } from 'lucide-react';
import { getPlace, places } from './content';
import { copy, L, text, type Lang } from './i18n';
import './home-journey.css';

const RegionScene = lazy(() => import('./RegionScene'));
const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '');
interface Props {
  lang: Lang; reduced: boolean; selected: string;
  onSelect: (id: string) => void; onOpen: (id: string) => void;
  onIntroduction: (origin: HTMLElement) => void;
}
export default function HomeJourney({ lang, reduced, selected, onSelect, onOpen, onIntroduction }: Props) {
  const place = getPlace(selected) || places[1];
  const t = (value: ReturnType<typeof L>) => text(value, lang);
  const atlas = useRef<HTMLDivElement>(null);
  const previewId = useId();
  function explore() {
    const panel = atlas.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0;
    if (rect.top < headerBottom + 12 || rect.bottom > window.innerHeight - 16) {
      panel.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    }
    panel.focus({ preventScroll: true });
  }
  function continueJourney() {
    const heading = document.getElementById('journey-context-title');
    heading?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    heading?.focus({ preventScroll: true });
  }
  return <div className={'landing-journey' + (reduced ? ' is-reduced' : '')}>
    <section className="expedition-hero" aria-labelledby="journey-title">
      <div className="expedition-landscape" aria-hidden="true"><img src={asset('media/abai-steppe-poster.webp')} alt="" width={1600} height={900} fetchPriority="high"/></div>
      <div className="expedition-content landing-container">
        <div className="expedition-copy">
          <h1 id="journey-title">{text(copy.heroTitle, lang)}</h1>
          <p>{t(L('Места, которые хранят истории. Истории, которые связывают нас. Откройте для себя землю Абая.', 'Тарих сақтаған мекендер. Бізді біріктіретін тарих. Абай өлкесін өзіңіз үшін ашыңыз.', 'Places that hold stories. Stories that connect us. Discover the land of Abai.'))}</p>
          <div className="expedition-actions">
            <button className="landing-button landing-button-light" onClick={explore}><span>{text(copy.begin, lang)}</span><ArrowRight size={19}/></button>
            <button className="expedition-guide" data-start-tour onClick={e => onIntroduction(e.currentTarget)}><span className="expedition-play"><Play size={15} fill="currentColor"/></span>{t(L('Как это работает', 'Бұл қалай жұмыс істейді', 'A quick introduction'))}</button>
          </div>
        </div>
        <div className="expedition-atlas landing-atlas-section" id="region-explorer" ref={atlas} tabIndex={-1} aria-labelledby="atlas-title">
          <h2 className="sr-only" id="atlas-title">{t(L('Карта области Абай', 'Абай облысының картасы', 'Map of Abai Region'))}</h2>
          <div className="landing-map" data-tour="region-overview">
            <Suspense fallback={<div className="region-suspense" role="status">{text(copy.mapLoading, lang)}</div>}>
              <RegionScene lang={lang} selected={selected} onSelect={onSelect} reduced={reduced}/>
            </Suspense>
          </div>
          <div className="landing-place-dock">
            <div className="landing-destinations" role="group" aria-label={text(copy.places, lang)}>
              {places.map(item => <button key={item.id} onClick={() => onSelect(item.id)} aria-pressed={item.id === place.id} aria-controls={previewId}>{text(item.name, lang)}</button>)}
            </div>
            <div className="landing-place-preview" id={previewId}>
              <article className="landing-place-content" key={place.id} aria-labelledby={previewId + '-title'}>
                <a className={'landing-place-photo photo-' + place.id} href={'#/place/' + place.id} onClick={e => { e.preventDefault(); onOpen(place.id); }} tabIndex={-1} aria-hidden="true"><img src={asset(place.image)} alt="" decoding="async"/></a>
                <div className="landing-place-body">
                  <div className="landing-place-caption"><h3 id={previewId + '-title'}>{text(place.name, lang)}</h3><span className="landing-place-era">{text(place.era, lang)}</span></div>
                  <a className="landing-button" href={'#/place/' + place.id} onClick={e => { e.preventDefault(); onOpen(place.id); }} aria-label={text(copy.explorePlace, lang) + ': ' + text(place.name, lang)}><span>{text(copy.explorePlace, lang)}</span><ArrowRight size={18}/></a>
                </div>
              </article>
              <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{t(L('Выбрано место: ', 'Таңдалған мекен: ', 'Selected place: ')) + text(place.name, lang)}</span>
            </div>
          </div>
        </div>
        <div className="expedition-bottom">
          <button onClick={continueJourney} aria-label={t(L('Продолжить знакомство с регионом', 'Өлкемен танысуды жалғастыру', 'Continue discovering the region'))}><span className="expedition-scroll"><ArrowDown size={17}/></span><span>{text(copy.region, lang)}</span></button>
        </div>
      </div>
    </section>
  </div>;
}
