import type { Place } from './content';
import type { Lang } from './i18n';

export const STORY_READING_WORDS_PER_MINUTE = 180;
export function storyWordCount(place: Place, lang: Lang): number {
  return place.sections.map(section=>section.title[lang]+' '+section.body[lang]).join(' ').match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}
export function storyReadingMinutes(place: Place, lang: Lang): number {
  return Math.max(1,Math.ceil(storyWordCount(place,lang)/STORY_READING_WORDS_PER_MINUTE));
}
