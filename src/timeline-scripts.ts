import { L, type Lang, type LocalText } from './i18n.ts';
import type { TimelineEra } from './timeline-content.ts';
import { timelineCulture } from './timeline-culture.ts';

const narrationOpening: Record<string, LocalText> = {
  khanate: L('Середина пятнадцатого века. Начало Казахского ханства.', 'Он бесінші ғасырдың ортасы. Қазақ хандығының бастауы.', 'The middle of the fifteenth century. The beginnings of the Kazakh Khanate.'),
  education: L('Семей. Тысяча восемьсот пятьдесят пятый — тысяча восемьсот пятьдесят девятый годы. Юный Абай открывает мир книг.', 'Семей. Мың сегіз жүз елу бесінші — мың сегіз жүз елу тоғызыншы жылдар. Жас Абай кітап әлемін танып келеді.', 'Semey, eighteen fifty-five to eighteen fifty-nine. The young Abai discovers a world of books.'),
  house: L('Семей. Тысяча восемьсот девяносто восьмой год. Дом Анияра Молдабаева.', 'Семей. Мың сегіз жүз тоқсан сегізінші жыл. Әнияр Молдабаевтың үйі.', 'Semey, eighteen ninety-eight. The house of Aniyar Moldabayev.'),
  alash: L('Тысяча девятьсот семнадцатый и восемнадцатый годы. Семей и движение Алаш.', 'Мың тоғыз жүз он жетінші және он сегізінші жылдар. Семей және Алаш қозғалысы.', 'Nineteen seventeen and nineteen eighteen. Semey and the Alash movement.'),
  independence: L('Тысяча девятьсот девяносто первый год. Казахстан входит в новую эпоху.', 'Мың тоғыз жүз тоқсан бірінші жыл. Қазақстан жаңа дәуірге қадам басты.', 'Nineteen ninety-one. Kazakhstan enters a new era.'),
  constitution: L('Тысяча девятьсот девяносто пятый год. Конституция и культурная память.', 'Мың тоғыз жүз тоқсан бесінші жыл. Конституция және мәдени жад.', 'Nineteen ninety-five. A constitution and cultural memory.'),
};

const narrationBridge: LocalText = L('У этой истории есть и культурное продолжение.', 'Бұл тарихтың мәдени жалғасы да бар.', 'This story also has a cultural dimension.');

const khanateDating: LocalText = L(
  'Даты тысяча четыреста шестьдесят пятый и шестьдесят шестой годы связаны с сообщением историка Мухаммада Хайдара Дулати. Это начало долгого процесса, а не история, завершившаяся за один день.',
  'Мың төрт жүз алпыс бесінші және алпыс алтыншы жылдар тарихшы Мұхаммед Хайдар Дулатидің дерегіне негізделеді. Бұл бір күнде аяқталған оқиға емес, ұзақ үдерістің басталуы.',
  'The dates fourteen sixty-five and fourteen sixty-six follow the account of historian Muhammad Haydar Dulati. They mark the beginning of a long process, rather than a transformation completed in a single day.',
);

/** Clean narration only: no buttons, source credits, filenames or unrecorded-audio claims. */
export function getTimelineNarration(era: TimelineEra, lang: Lang): string {
  const culture = timelineCulture[era.id];
  const opening = narrationOpening[era.id]?.[lang] ?? `${era.year}. ${era.title[lang]}.`;
  const parts = [opening, ...era.paragraphs.slice(0, 2).map(paragraph => paragraph[lang])];
  if (era.id === 'khanate') parts.push(khanateDating[lang]);
  if (culture) parts.push(narrationBridge[lang], culture.description[lang], culture.interestingFact[lang]);
  parts.push(era.connection[lang]);
  return parts.join('\n\n');
}

export function timelineNarrationFileNames(id: string, lang: Lang): { media: string; text: string } {
  return { media: `${id}-${lang}.mp4`, text: `${id}-${lang}.txt` };
}
