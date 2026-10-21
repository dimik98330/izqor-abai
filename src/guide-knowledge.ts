import { places, sources, type Source } from './content.ts';
import { timelineEras } from './timeline-content.ts';
import { timelineCulture } from './timeline-culture.ts';
import { L, text, type Lang } from './i18n.ts';

// One source registry for server prompts, reference answers and browser validation.
// Reuse existing IDs when the editorial timeline links to the same document.
export const guideSources: Source[] = [...sources];
function registerSource(id: string, source: Omit<Source, 'id' | 'category'>) {
  const existing = guideSources.find(item => item.url === source.url);
  if (existing) return existing.id;
  guideSources.push({ ...source, id, category: 'archive' });
  return id;
}
export const guideTimeline = timelineEras.map(era => ({
  ...era,
  sourceIds: era.sources.map((source, index) => registerSource(`timeline-${era.id}-${index + 1}`, source)),
  culture: timelineCulture[era.id] ? {
    ...timelineCulture[era.id], sourceId: registerSource(`culture-${era.id}`, timelineCulture[era.id].source),
  } : undefined,
}));
export const getGuideSource = (id: string) => guideSources.find(source => source.id === id);

export const guideSite = {
  purpose: L(
    'IZQOR делает историю Казахстана интерактивной. Начните с карты области Абай, мест Семея или линии времени от Казахского ханства до независимости и Конституции 1995 года.',
    'IZQOR Қазақстан тарихын интерактивті түрде таныстырады. Абай облысының картасынан, Семейдегі мекендерден немесе Қазақ хандығынан тәуелсіздік пен 1995 жылғы Конституцияға дейінгі уақыт желісінен бастаңыз.',
    'IZQOR makes Kazakhstan’s history interactive. Start with the Abai Region map, places in Semey or the timeline from the Kazakh Khanate to independence and the 1995 Constitution.',
  ),
  usage: L(
    'В разделе «Карта» выберите место и откройте его историю; в «Линии времени» — эпоху, связанные документы и культурные материалы. В карточках мест доступны источники, а там, где есть панорамы, — виртуальные экскурсии. Сохранённые места доступны в «Местах и историях». Язык RU / KK / EN можно выбрать на сайте и в чате; гид отвечает на выбранном языке. Задавайте вопросы обо всей истории Казахстана, даже если темы нет на карте.',
    '«Карта» бөлімінен мекенді таңдап, оның тарихын ашыңыз; «Уақыт желісінен» дәуірді, құжаттар мен мәдени материалдарды қараңыз. Мекен беттерінде дереккөздер, ал панорамасы бар жерлерде виртуалды экскурсиялар қолжетімді. Сақталған мекендер «Орындар мен тарих» бөлімінде көрсетіледі. RU / KK / EN тілін сайттан немесе чаттан таңдауға болады; гид таңдалған тілде жауап береді. Картада жоқ тақырыптар бойынша да Қазақстан тарихы туралы сұраңыз.',
    'In Atlas, select a place and open its story; in Timeline, choose an era to explore documents and cultural material. Place pages include sources and, where available, virtual panorama tours. Saved places appear in Places & stories. Choose RU / KK / EN on the site or in chat; the guide answers in the selected language. You can ask about all of Kazakhstan’s history, including topics beyond the map.',
  ),
  limits: L(
    'Сейчас доступны карта, исторические материалы, панорамы и образовательная 3D-модель. Камерный AR-режим и полноценный городской квест с геолокацией пока не реализованы. Гид может предложить познавательную прогулку, но не подтверждает прохождение маршрута, актуальные часы работы или безопасность пути.',
    'Қазір карта, тарихи материалдар, панорамалар және оқу мақсатындағы 3D-модель бар. Камера арқылы AR режимі мен геолокациясы бар толық қалалық квест әзірге іске қосылмаған. Гид танымдық серуен ұсына алады, бірақ маршруттың өтілгенін, қазіргі жұмыс уақытын немесе жол қауіпсіздігін растамайды.',
    'The site currently offers a map, historical material, panoramas and an educational 3D model. Camera-based AR and a complete geolocated city quest are not implemented yet. The guide can suggest a learning walk, but cannot confirm route completion, current opening hours or route safety.',
  ),
};

// Conservative topic matching for the deterministic fallback, never a substitute
// for general AI knowledge. Generic words such as "history" do not select a place.
const timelineTopics: Record<string, RegExp> = {
  khanate: /ханств|ханды|khanate|кере[йя]|керей|kerey|kerei|жанибек|жәнібек|zhanibek|janibek|дулати|dulati|1465|1466/iu,
  education: /медрес|madrasa|ахмет.{0,5}риз|akhmet.{0,5}riza|образовани.*аба|аба[йя].*образовани|аба[йя].*оқу|abai.*(?:learn|educat)|1855|1859/iu,
  house: /анияр|әнияр|aniyar|aniya|молдабаев|молдабай|moldaba|1898/iu,
  alash: /алаш|alash|бөкейхан|букейхан|bokeikhan|bukeikhan|1917|1918/iu,
  independence: /независим|тәуелсіз|independen|полигон|невада|семипалатинск.*(?:яд|испыт)|nuclear|nevada|ядролық|1991/iu,
  constitution: /конституц|ата\s+заң|constitut|1995|1993/iu,
};
const placeTopics: Record<string, RegExp> = {
  semey: /семей|семея|семе[йд]|семипалатинск|semey|semipalatinsk/iu,
  zhidebay: /жидеба[йяею]|zhideba[yi]|jideba[yi]/iu,
  borili: /б[өо]р[іи]л[іи]|borili|ауэзов|әуезов|auezov/iu,
  konyr: /қоңыр|коныр|konyr|qonyr/iu,
  kozy: /қозы|козы|kozy|баян.{0,4}с[уұ]л[уы]|bayan.{0,4}sulu/iu,
};
export function matchGuideTopics(question: string) {
  return {
    eras: guideTimeline.filter(era => timelineTopics[era.id]?.test(question)),
    places: places.filter(place => placeTopics[place.id]?.test(question)),
  };
}

export function localizedGuideSite(locale: Lang) {
  return Object.fromEntries(Object.entries(guideSite).map(([key, value]) => [key, text(value, locale)]));
}
