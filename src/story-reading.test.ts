import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { places, sources } from './content';
import { storyMedia } from './story-media';
import imageDimensions from './story-media-dimensions.json';
import { storyReadingMinutes, storyWordCount } from './story-reading';

describe('expanded place stories',()=>{
  it('provides 7–8 minutes of substantive text in all fifteen localized stories',()=>{
    expect(places).toHaveLength(5);
    for(const place of places)for(const lang of ['ru','kk','en'] as const){
      expect(place.sections.length,place.id).toBeGreaterThanOrEqual(7);
      expect(storyWordCount(place,lang),`${place.id}/${lang}`).toBeGreaterThanOrEqual(1081);
      expect(storyReadingMinutes(place,lang),`${place.id}/${lang}`).toBeGreaterThanOrEqual(7);
      expect(storyReadingMinutes(place,lang),`${place.id}/${lang}`).toBeLessThanOrEqual(8);
      for(const section of place.sections)expect(section.body[lang].split(/\n\s*\n/).length).toBeGreaterThanOrEqual(3);
    }
  });
  it('resolves citations and gives each place at least two documentary illustrations',()=>{
    const ids=new Set(sources.map(s=>s.id));
    expect(ids.size).toBe(sources.length);
    for(const place of places){
      const images=place.sections.flatMap(s=>s.imageIds??[]);
      expect(new Set(images).size,place.id).toBeGreaterThanOrEqual(2);
      for(const section of place.sections)for(const id of section.sourceIds){expect(ids.has(id),`${place.id}: ${id}`).toBe(true);expect(place.sourceIds).toContain(id);}
      for(const id of images){
        const image=storyMedia[id];expect(image,id).toBeDefined();
        const size=imageDimensions[id as keyof typeof imageDimensions];expect(size,id).toHaveLength(2);expect(size.every(n=>n>0),id).toBe(true);
        expect(existsSync(resolve('public',image.src.replace(/^\//,''))),image.src).toBe(true);
        expect(image.sourceUrl).toMatch(/^https:\/\//);expect(image.credit.length).toBeGreaterThan(3);expect(image.license.length).toBeGreaterThan(3);
        for(const lang of ['ru','kk','en'] as const){expect(image.caption[lang].length).toBeGreaterThan(30);expect(image.alt[lang].length).toBeGreaterThan(10);}
      }
    }
  });
  it('changes its estimate when the text changes instead of keeping a fixed duration',()=>{
    const short={...places[0],sections:[{...places[0].sections[0],title:{ru:'Тест',kk:'Тест',en:'Test'},body:{ru:'слово '.repeat(360),kk:'сөз '.repeat(360),en:'word '.repeat(360)}}]};
    expect(storyReadingMinutes(short,'ru')).toBe(3);
    expect(storyReadingMinutes({...short,sections:[]},'ru')).toBe(1);
  });
});
