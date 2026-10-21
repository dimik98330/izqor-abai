import { L } from './i18n.ts';
import type { StorySection } from './content.ts';
import { storyChaptersRu } from './story-chapters-ru.ts';
import { storyChaptersKk } from './story-chapters-kk.ts';
import { storyChaptersEn } from './story-chapters-en.ts';

export const expandedStoryChapters:Record<string,StorySection[]> = Object.fromEntries(
  Object.entries(storyChaptersRu).map(([id,chapters])=>[id,chapters.map((chapter,index)=>{
    const kk=storyChaptersKk[id][index], en=storyChaptersEn[id][index];
    return {title:L(chapter.title,kk.title,en.title),body:L(chapter.body,kk.body,en.body),sourceIds:chapter.sourceIds,imageIds:chapter.imageIds};
  })]),
);
