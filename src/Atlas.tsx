import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { Map as MapInstance, HtmlMarker, Polygon, LngLatBounds } from '@2gis/mapgl/types';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, ChevronRight, Compass, Info, Layers, LocateFixed, MapPin, Minus, Plus, RotateCcw, Search, X } from 'lucide-react';
import { loadMapgl } from './mapgl-loader';
import { getSource, places, type Place } from './content';
import { copy, L, text, type Lang, type LocalText } from './i18n';
import './landing-fonts.css';
import './atlas-fonts.css';
import './atlas-page.css';

interface Props { lang: Lang; selected: string; onSelect: (id: string) => void; onOpen: (id: string) => void; reduced: boolean }
type Category = 'all' | 'heritage' | 'nature';
type MapMarker = { marker: HtmlMarker; button: HTMLButtonElement; label: HTMLSpanElement; place: Place };
const bounds: LngLatBounds = { southWest: [76.56, 45.535], northEast: [83.62, 51.71] };
function regionPadding(m: MapInstance) {
  return m.getContainer().clientWidth < 500
    ? { top: 55, bottom: 70, left: 32, right: 32 }
    : { top: 48, bottom: 54, left: 48, right: 48 };
}
const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '');
const labels = {
  title: L('Карта историй', 'Тарих картасы', 'An atlas of stories'),
  intro: L('Выберите место на карте — познакомьтесь с его историей.', 'Картадан мекен таңдап, оның тарихымен танысыңыз.', 'Choose a place on the map and discover its story.'),
  placeList: L('Места на карте', 'Картадағы мекендер', 'Places on the map'),
  search: L('Найти место', 'Мекенді іздеу', 'Find a place'),
  clear: L('Очистить поиск', 'Іздеуді тазарту', 'Clear search'),
  all: L('Все', 'Барлығы', 'All'),
  heritage: L('Наследие', 'Мұра', 'Heritage'),
  nature: L('Природа', 'Табиғат', 'Nature'),
  filter: L('Категория места', 'Мекен санаты', 'Place category'),
  shown: L('Показано мест:', 'Көрсетілген мекендер:', 'Places shown:'),
  empty: L('Место не найдено', 'Мекен табылмады', 'No places found'),
  emptyHint: L('Попробуйте другое название или выберите все места.', 'Басқа атауды іздеңіз немесе барлық мекенді таңдаңыз.', 'Try another name or show all places.'),
  reset: L('Показать все места', 'Барлық мекенді көрсету', 'Show all places'),
  choose: L('С какой истории начнём?', 'Қай тарихтан бастаймыз?', 'Where shall we begin?'),
  chooseHint: L('Выберите место на карте или в списке, чтобы узнать его историю.', 'Тарихын білу үшін картадан немесе тізімнен мекенді таңдаңыз.', 'Choose a place on the map or in the list to discover its story.'),
  previous: L('Предыдущее место', 'Алдыңғы мекен', 'Previous place'),
  next: L('Следующее место', 'Келесі мекен', 'Next place'),
  retry: L('Загрузить ещё раз', 'Қайта жүктеу', 'Try again'),
  photo: L('Источник фотографии', 'Фотосурет дереккөзі', 'Photo source'),
  north: L('С', 'С', 'N'),
  discover: L('Продолжить знакомство', 'Өлкемен танысуды жалғастыру', 'Keep exploring'),
  nextStory: L('Следующая история', 'Келесі тарих', 'Next story'),
};
const storyIntros: Record<string, LocalText> = {
  semey: L('Город Абая, просвещения и Алаш. Познакомьтесь с людьми и событиями, память о которых хранят старые улицы.', 'Абай, ағарту және Алаш қаласы. Ескі көшелерде ізі қалған адамдармен және оқиғалармен танысыңыз.', 'A city of Abai, learning and Alash. Meet the people and events remembered in its old streets.'),
  zhidebay: L('Дом Абая среди степи и мемориал Абай–Шакарим. Место, которое помогает почувствовать мир поэта.', 'Даладағы Абай үйі мен Абай–Шәкәрім мемориалы. Ақын әлемін сезінуге жол ашатын мекен.', 'Abai’s home in the open steppe and the Abai–Shakarim memorial. A place to discover the poet’s world.'),
  borili: L('Родная земля Мухтара Ауэзова. Дом-музей раскрывает жизнь писателя через фотографии, вещи и воспоминания.', 'Мұхтар Әуезовтің туған өлкесі. Үй-музей жазушы өмірін фотосуреттер, заттар мен естеліктер арқылы танытады.', 'Mukhtar Auezov’s home landscape. The house museum tells his story through photographs, objects and memories.'),
  konyr: L('Пещера с подземным озером. Узнайте, как природа и предания переплелись в истории этого места.', 'Жерасты көлі бар үңгір. Бұл мекеннің тарихында табиғат пен аңыздың қалай тоғысқанын біліңіз.', 'A cave with an underground lake. Discover how nature and oral tradition meet in the story of this place.'),
  kozy: L('Каменный мавзолей и история любви из казахского эпоса. Рассмотрите архитектуру и познакомьтесь с преданием.', 'Тас кесене және қазақ жырындағы махаббат тарихы. Сәулетін зерттеп, аңызбен танысыңыз.', 'A stone mausoleum and a love story from Kazakh epic poetry. Explore the architecture and discover the tale.'),
};

function PlacePhoto({ place, className = '' }: { place: Place; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [place.id]);
  return failed
    ? <div className={'atlas-photo-fallback ' + className}><MapPin size={28} aria-hidden="true" /></div>
    : <img className={className} src={asset(place.image)} alt="" onError={() => setFailed(true)} loading="lazy" decoding="async" />;
}

function DiscoverySection({ lang, place, onOpen }: { lang: Lang; place: Place; onOpen: (id: string) => void }) {
  const p = (value: LocalText) => text(value, lang);
  return <section className="atlas-discovery" aria-labelledby="atlas-discovery-title">
    <h2 id="atlas-discovery-title">{p(labels.discover)}</h2>
    <a className="atlas-discovery-story" href={'#/place/' + place.id} onClick={event => {
        if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onOpen(place.id); }
      }}>
        <span className="atlas-discovery-copy"><span>{p(labels.nextStory)}</span><strong>{p(place.name)}</strong></span>
        <ArrowRight className="atlas-discovery-arrow" size={24} strokeWidth={1.5} aria-hidden="true" />
    </a>
  </section>;
}

export default function Atlas({ lang, selected, onSelect, onOpen, reduced }: Props) {
  const p = (value: LocalText) => text(value, lang);
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapInstance | null>(null);
  const markers = useRef<MapMarker[]>([]);
  const selectRef = useRef(onSelect); selectRef.current = choosePlace;
  const langRef = useRef(lang); langRef.current = lang;
  const selectedRef = useRef(selected); selectedRef.current = selected;
  const cameraSelection = useRef('');
  const overview = useRef(true);
  const compass = useRef<HTMLButtonElement>(null);
  const terrainRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [terrain, setTerrain] = useState(false);
  terrainRef.current = terrain;
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const searchRef = useRef<HTMLInputElement>(null);
  const visiblePlaces = useMemo(() => {
    const term = query.trim().normalize('NFKC').toLocaleLowerCase();
    return places.filter(place => (category === 'all' || (category === 'nature' ? place.id === 'konyr' : place.id !== 'konyr'))
      && (!term || (text(place.name, lang) + ' ' + text(place.era, lang) + ' ' + text(place.subtitle, lang)).normalize('NFKC').toLocaleLowerCase().includes(term)));
  }, [query, category, lang]);
  const visibleIds = useMemo(() => new Set(visiblePlaces.map(place => place.id)), [visiblePlaces]);
  const active = visiblePlaces.find(place => place.id === selected);
  const activeIndex = places.findIndex(place => place.id === selected);
  const filteredIndex = visiblePlaces.findIndex(place => place.id === selected);
  const previous = visiblePlaces[(filteredIndex - 1 + visiblePlaces.length) % visiblePlaces.length];
  const next = visiblePlaces[(filteredIndex + 1) % visiblePlaces.length];

  // Labels may move around their pins. The pin always stays at the true coordinate.
  function arrangeLabels() {
    const m = map.current;
    if (!m) return;
    const width = m.getContainer().clientWidth, height = m.getContainer().clientHeight;
    const visible = markers.current.filter(item => !item.button.hidden);
    const points = visible.map(item => { const point = m.project(item.place.coordinate); return { item, point: { x: point[0], y: point[1] } }; });
    const occupied = points.map(({ point }) => ({ x: point.x - 17, y: point.y - 17, w: 34, h: 34 }));
    occupied.push({ x: 0, y: height - 42, w: width, h: 42 });
    const mapBox = m.getContainer().getBoundingClientRect();
    for (const control of m.getContainer().parentElement?.querySelectorAll('.atlas-map-tools, .atlas-north, .atlas-zoom-controls, .atlas-map-info, .atlas-map-info[open] .atlas-map-credits') || []) {
      const rect = control.getBoundingClientRect();
      occupied.push({ x: rect.x - mapBox.x - 5, y: rect.y - mapBox.y - 5, w: rect.width + 10, h: rect.height + 10 });
    }
    const overlap = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
      Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    points.sort((a, b) => Number(b.item.place.id === selectedRef.current) - Number(a.item.place.id === selectedRef.current));
    for (const { item, point } of points) {
      const w = item.label.offsetWidth, h = item.label.offsetHeight;
      const options = [[24, -h / 2], [-w - 24, -h / 2], [-w / 2, -h - 24], [-w / 2, 24], [24, -h - 14], [-w - 24, 14]];
      let best = options[0], bestCost = Infinity;
      for (const [x, y] of options) {
        const box = { x: point.x + x - 4, y: point.y + y - 4, w: w + 8, h: h + 8 };
        const overflow = Math.max(0, 8 - box.x) + Math.max(0, box.x + box.w - width + 8) + Math.max(0, 8 - box.y) + Math.max(0, box.y + box.h - height + 8);
        const cost = occupied.reduce((sum, other) => sum + overlap(box, other), 0) + overflow * 1000;
        if (cost < bestCost) { bestCost = cost; best = [x, y]; }
      }
      item.label.style.transform = 'translate(' + best[0] + 'px,' + best[1] + 'px)';
      occupied.push({ x: point.x + best[0] - 4, y: point.y + best[1] - 4, w: w + 8, h: h + 8 });
    }
    compass.current?.style.setProperty('--atlas-rotation', -m.getRotation() + 'deg');
  }

  useEffect(() => {
    if (visiblePlaces.length && !visibleIds.has(selected)) onSelect(visiblePlaces[0].id);
  }, [visiblePlaces, visibleIds, selected, onSelect]);

  function fitRegion(m: MapInstance, duration = 0) {
    m.fitBounds(bounds, { padding: regionPadding(m), skipMapPadding: true, animation: { duration } });
    if (terrainRef.current) m.setPitch(35, { duration });
  }

  function focusPlace(id: string) {
    const m = map.current, place = places.find(item => item.id === id);
    if (!m || !place || !ready) return;
    overview.current = false;
    const animation = { duration: reduced ? 0 : 850, easing: 'easeOutCubic' as const };
    m.setCenter(place.coordinate, animation);
    m.setZoom(place.id === 'semey' ? 14.5 : 13, animation);
    m.setPitch(terrain ? 40 : 0, animation);
    cameraSelection.current = id;
  }

  function choosePlace(id: string) { onSelect(id); focusPlace(id); }

  useEffect(() => {
    if (!container.current) return;
    let disposed = false, initialized = false, fatal = false;
    let m: MapInstance | undefined;
    let observer: ResizeObserver | undefined;
    const shapes: Polygon[] = [];
    const abort = new AbortController();
    setReady(false); setFailed(false); cameraSelection.current = ''; overview.current = true;
    const fail = () => {
      if (disposed) return;
      fatal = true; window.clearTimeout(timeout); setReady(false); setFailed(true);
    };
    const timeout = window.setTimeout(fail, 20000);
    const apiKey = (import.meta.env.VITE_2GIS_API_KEY || '').trim();
    if (!apiKey) { fail(); return () => window.clearTimeout(timeout); }

    const boundary = fetch(asset('data/abay-boundary.geojson'), { signal: abort.signal })
      .then(response => response.ok ? response.json() : null).catch(() => null);

    void loadMapgl().then(sdk => {
      if (disposed || fatal || !container.current) return;
      m = new sdk.Map(container.current, {
        key: apiKey, center: [79.9, 49], zoom: 6, pitch: 0, rotation: 0,
        lang: langRef.current, zoomControl: false, scaleControl: 'bottomLeft',
        copyright: 'bottomRight', enableTrackResize: false,
        // Public night style from the official 2GIS map-style example.
        style: 'e05ac437-fcc2-4845-ad74-b1de9ce07555',
        defaultBackgroundColor: '#162e30', styleState: { terrainEnabled: terrainRef.current },
      });
      map.current = m;
      const current = m;
      const canvas = current.getCanvas();
      canvas.setAttribute('aria-label', text(copy.map, langRef.current) + ' · 2ГИС');
      canvas.setAttribute('role', 'region'); canvas.tabIndex = 0;
      const showMap = () => {
        if (disposed || fatal) return;
        window.clearTimeout(timeout); setReady(true); setFailed(false); arrangeLabels();
        current.getContainer().querySelector('a[href*="2gis"]')?.setAttribute('aria-label', '2ГИС');
        void document.fonts.ready.then(() => { if (!disposed) arrangeLabels(); });
      };
      current.once('styleload', () => {
        if (disposed || fatal) return;
        initialized = true; fitRegion(current);
        showMap();
      });
      current.once('idle', showMap);
      current.on('styleloaderror', fail);
      current.on('error', event => {
        if (['invalidtilekey', 'styleloaderror', 'webglcontextlost'].includes(event.type)) fail();
      });
      current.on('move', arrangeLabels);
      current.on('movestart', event => { if (event.isUser) overview.current = false; });
      observer = new ResizeObserver(() => {
        if (disposed) return;
        current.invalidateSize();
        if (overview.current && initialized && !fatal) fitRegion(current);
        arrangeLabels();
      });
      observer.observe(container.current);

      for (const [index, place] of places.entries()) {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'atlas-pin';
        button.setAttribute('aria-label', text(place.name, langRef.current));
        button.setAttribute('aria-controls', 'atlas-selected-story');
        const dot = document.createElement('span'); dot.className = 'atlas-pin-dot'; dot.textContent = String(index + 1).padStart(2, '0');
        const label = document.createElement('span'); label.className = 'atlas-pin-label'; label.textContent = text(place.name, langRef.current);
        button.append(dot, label);
        button.addEventListener('click', () => selectRef.current(place.id));
        const marker = new sdk.HtmlMarker(current, {
          coordinates: place.coordinate, html: button, anchor: [22, 22], zIndex: 5,
        });
        markers.current.push({ marker, button, label, place });
      }
      void boundary.then(data => {
        if (disposed || fatal || !data) return;
        for (const feature of data.features || []) {
          const geometry = feature.geometry;
          const polygons: number[][][][] = geometry?.type === 'Polygon' ? [geometry.coordinates]
            : geometry?.type === 'MultiPolygon' ? geometry.coordinates : [];
          for (const coordinates of polygons) shapes.push(new sdk.Polygon(current, {
            coordinates, color: '#719e7714', strokeColor: '#b4a273', strokeWidth: 1.5, interactive: false,
          }));
        }
        current.getContainer().dataset.boundaryCount = String(shapes.length);
      }).catch(() => { /* The base map and story list remain usable without the optional outline. */ });
    }).catch(fail);

    return () => {
      disposed = true; abort.abort(); observer?.disconnect(); window.clearTimeout(timeout);
      markers.current.forEach(item => item.marker.destroy()); markers.current = [];
      shapes.forEach(shape => shape.destroy());
      m?.destroy(); map.current = null;
    };
  }, [attempt]);

  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    for (const item of markers.current) {
      const isSelected = item.place.id === selected;
      item.button.classList.toggle('is-selected', isSelected);
      item.button.hidden = !visibleIds.has(item.place.id);
      item.marker.getContent().hidden = !visibleIds.has(item.place.id);
      item.marker.setZIndex(isSelected ? 10 : 5);
      item.button.setAttribute('aria-pressed', String(isSelected));
      item.button.setAttribute('aria-label', text(item.place.name, lang));
      item.label.textContent = text(item.place.name, lang);
    }
    if (m.getLanguage() !== lang) m.setLanguage(lang);
    m.getCanvas().setAttribute('aria-label', text(copy.map, lang) + ' · 2ГИС');
    if (cameraSelection.current && cameraSelection.current !== selected) focusPlace(selected);
    cameraSelection.current = selected;
    arrangeLabels();
  }, [selected, lang, ready, visibleIds, reduced]);

  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    m.patchStyleState({ terrainEnabled: terrain });
    m.setPitch(terrain ? 40 : 0, { duration: reduced ? 0 : 500 });
  }, [terrain, ready, reduced]);

  function wholeRegion() {
    overview.current = true;
    if (map.current) fitRegion(map.current, reduced ? 0 : 850);
  }
  function zoomMap(delta: number) {
    const m = map.current;
    if (!m) return;
    overview.current = false;
    m.setZoom(Math.max(m.getMinZoom(), Math.min(m.getMaxZoom(), m.getZoom() + delta)), { duration: reduced ? 0 : 220 });
  }
  function resetNorth() { map.current?.setRotation(0, { duration: reduced ? 0 : 300 }); }
  function mapKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const m = map.current;
    if (!m || !ready || !(event.target instanceof HTMLCanvasElement)) return;
    const steps: Record<string, number[]> = { ArrowLeft: [-64, 0], ArrowRight: [64, 0], ArrowUp: [0, -64], ArrowDown: [0, 64] };
    if (steps[event.key]) {
      event.preventDefault(); overview.current = false;
      const [width, height] = m.getSize(), [x, y] = steps[event.key];
      m.setCenter(m.unproject([width / 2 + x, height / 2 + y]), { duration: reduced ? 0 : 180 });
    } else if (event.key === '+' || event.key === '=') { event.preventDefault(); zoomMap(1); }
    else if (event.key === '-') { event.preventDefault(); zoomMap(-1); }
    else if (event.key === 'Home') { event.preventDefault(); wholeRegion(); }
  }

  function resetFilters() { setQuery(''); setCategory('all'); }

  return <>
    <header className="atlas-page-intro">
      <div><h1>{p(labels.title)}</h1><p>{p(labels.intro)}</p></div>
      <span className="atlas-region"><Compass size={22} strokeWidth={1.5} aria-hidden="true" />{p(copy.region)}</span>
    </header>
    <div className="atlas-workspace" data-tour="map">
      <div className="atlas-list-tools">
          <label className="atlas-search"><Search size={18} aria-hidden="true" /><input ref={searchRef} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={p(labels.search)} aria-label={p(labels.search)} autoComplete="off" />{query && <button type="button" onClick={() => { setQuery(''); searchRef.current?.focus(); }} aria-label={p(labels.clear)}><X size={17} /></button>}</label>
          <div className="atlas-filters" role="group" aria-label={p(labels.filter)}>{(['all', 'heritage', 'nature'] as const).map(value => <button key={value} type="button" onClick={() => setCategory(value)} aria-pressed={category === value}>{p(labels[value])}</button>)}</div>
          <div className="atlas-map-tools"><button type="button" className="atlas-map-tool atlas-region-reset" onClick={wholeRegion} disabled={!ready || failed}><LocateFixed size={17} aria-hidden="true" />{p(copy.wholeRegion)}</button><button type="button" className="atlas-map-tool" onClick={() => setTerrain(value => !value)} aria-pressed={terrain} disabled={!ready || failed}><Layers size={17} aria-hidden="true" />{p(copy.terrain)}</button></div>
      </div>

      <nav className="atlas-place-list" aria-label={p(labels.placeList)}>
        <div className="atlas-place-list-heading"><h2>{p(labels.placeList)}</h2><p className="atlas-results" aria-live="polite"><span className="sr-only">{p(labels.shown)} </span>{visiblePlaces.length} / {places.length}</p></div>
        <div className="atlas-places">{visiblePlaces.map(place => {
          const index = places.findIndex(item => item.id === place.id);
          return <button key={place.id} className={'atlas-place-row' + (selected === place.id ? ' is-active' : '')} onClick={() => choosePlace(place.id)} aria-pressed={selected === place.id} aria-controls="atlas-selected-story">
            <PlacePhoto place={place} className="atlas-place-thumb" />
            <span className="atlas-place-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <span className="atlas-place-copy"><strong>{p(place.name)}</strong><span>{p(place.era)}</span></span>
            <ChevronRight className="atlas-place-action" size={17} aria-hidden="true" />
          </button>;
        })}</div>
        {!visiblePlaces.length && <div className="atlas-no-results"><Search size={25} aria-hidden="true" /><h2>{p(labels.empty)}</h2><p>{p(labels.emptyHint)}</p><button className="atlas-reset-filter" onClick={resetFilters}>{p(labels.reset)}<ArrowRight size={17} /></button></div>}
      </nav>

      <div className="atlas-map-area">
        <div ref={container} className="atlas-map-container" aria-label={p(copy.map) + ' · 2ГИС'} data-map-provider="2gis" onKeyDown={mapKeyDown} />
        <button ref={compass} type="button" className="atlas-north" onClick={resetNorth} aria-label={p(copy.north)} title={p(copy.north)} disabled={!ready || failed}><ArrowUp size={20} aria-hidden="true" /><span aria-hidden="true">{p(labels.north)}</span></button>
        <div className="atlas-zoom-controls"><button type="button" onClick={() => zoomMap(1)} aria-label={p(copy.zoomIn)} disabled={!ready || failed}><Plus size={20} /></button><button type="button" onClick={() => zoomMap(-1)} aria-label={p(copy.zoomOut)} disabled={!ready || failed}><Minus size={20} /></button></div>
        <details className="atlas-map-info" onToggle={arrangeLabels}>
          <summary aria-label={p(copy.attribution)} title={p(copy.attribution)}><Info size={18} aria-hidden="true" /></summary>
          <div className="atlas-map-credits"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap<ArrowUpRight size={12} aria-hidden="true" /></a>{places.map(place => <a key={place.id} href={getSource(place.imageSource)!.url} target="_blank" rel="noreferrer"><span><strong>{p(place.name)}</strong>{place.imageCredit}</span><ArrowUpRight size={12} aria-hidden="true" /></a>)}</div>
        </details>
        {!ready && !failed && <div className="atlas-map-status" role="status"><span className="spinner" />{p(copy.mapLoading)}</div>}
        {failed && <div className="atlas-map-status atlas-map-failed" role="status"><Compass size={36} strokeWidth={1.2} aria-hidden="true" /><p>{p(copy.mapError)}</p><button type="button" onClick={() => setAttempt(value => value + 1)}><RotateCcw size={17} aria-hidden="true" />{p(labels.retry)}</button></div>}
      </div>

      <aside id="atlas-selected-story" className="atlas-story" aria-label={active ? p(active.name) : p(labels.choose)} data-place-id={active?.id}>
        {active ? <>
          <figure className="atlas-story-photo"><PlacePhoto place={active} /><figcaption><a href={getSource(active.imageSource)!.url} target="_blank" rel="noreferrer" title={active.imageCredit} aria-label={p(labels.photo) + ': ' + active.imageCredit}><ArrowUpRight size={14} aria-hidden="true" /></a></figcaption></figure>
          <div className="atlas-story-content" key={active.id}>
            <h2 aria-live="polite" aria-atomic="true">{p(active.name)}</h2><p className="atlas-story-era">{p(active.era)}</p>
            <p className="atlas-story-description">{p(storyIntros[active.id] || active.short)}</p>
            <p className="atlas-story-coordinates"><MapPin size={15} aria-hidden="true" /><span>{active.coordinate[1].toFixed(4)}° N, {active.coordinate[0].toFixed(4)}° E</span></p>
            <button className="atlas-story-open" onClick={() => onOpen(active.id)}>{p(copy.explorePlace)}<ArrowRight size={19} aria-hidden="true" /></button>
          </div>
          <div className="atlas-story-adjacent"><button onClick={() => previous && onSelect(previous.id)} disabled={visiblePlaces.length < 2}><ArrowLeft size={17} aria-hidden="true" /><span><small>{p(labels.previous)}</small><strong>{previous && p(previous.name)}</strong></span></button><button onClick={() => next && onSelect(next.id)} disabled={visiblePlaces.length < 2}><span><small>{p(labels.next)}</small><strong>{next && p(next.name)}</strong></span><ArrowRight size={19} aria-hidden="true" /></button></div>
        </> : <div className="atlas-story-empty"><Compass size={46} strokeWidth={1} aria-hidden="true" /><h2>{p(labels.choose)}</h2><p>{p(labels.chooseHint)}</p><button className="atlas-story-open" onClick={resetFilters}>{p(labels.reset)}<ArrowRight size={18} /></button></div>}
      </aside>
    </div>
    <DiscoverySection lang={lang} place={places[(activeIndex + 1) % places.length]} onOpen={onOpen} />
  </>;
}
