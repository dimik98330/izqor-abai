import { describe, it, expect, vi, afterEach } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { askGuide, buildGuideHistory, referenceAnswer, validateRemoteAnswer } from './guide';
import { guideSources, guideTimeline } from './guide-knowledge';
import { copy, type Lang } from './i18n';
import { places, sources, eras, population } from './content';
afterEach(()=>vi.unstubAllGlobals());
describe('source-based guide boundaries',()=>{
  it('abstains when the chapter cannot answer the question',()=>{
    const result=referenceAnswer({question:'What will the weather be tomorrow?',locale:'en',placeId:'semey'});
    expect(result.citationIds).toEqual([]);
    expect(result.answer).toContain('does not contain enough evidence');
  });
  it('provides a sourced explanation in every language',()=>{
    for(const locale of ['ru','kk','en'] as Lang[]){
      const result=referenceAnswer({question:copy.questionOne[locale],locale,placeId:'semey'});
      expect(result.citationIds).toEqual(places[0].sections[0].sourceIds);
      expect(result.answer).toBe(places[0].sections[0].body[locale]);
    }
  });
  it('never invents a panorama for places without a working tour',()=>{
    const place=places.find(place=>place.id==='konyr')!, tours=place.tours;
    try{place.tours=[];const result=referenceAnswer({question:'What can I see in the panorama?',locale:'en',placeId:'konyr'});expect(result.citationIds).toHaveLength(0);}finally{place.tours=tours;}
  });
  it('distinguishes the new cave exterior panorama from an underground tour',()=>{
    const result=referenceAnswer({question:'What can I see in the panorama?',locale:'en',placeId:'konyr'});
    expect(result.answer).toContain('exterior');expect(result.answer).toContain('not yet been found');expect(result.citationIds).toEqual(['tour-konyr']);
  });
  it('rejects unsupported remote answers and drops unknown source IDs',()=>{
    expect(()=>validateRemoteAnswer({answer:'A claim',citationIds:['invented']})).toThrow();
    expect(validateRemoteAnswer({answer:'An explanation',citationIds:['semey','invented']}).citationIds).toEqual(['semey']);
    expect(validateRemoteAnswer({answer:'Insufficient evidence',supported:false,citationIds:[]}).citationIds).toEqual([]);
  });
  it('falls back to the chapter when a configured agent is unavailable',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('offline')));
    const answer=await askGuide({question:'What matters about this place?',locale:'en',placeId:'semey'},'/api/guide');
    expect(answer.mode).toBe('reference');expect(answer.notice).toBeTruthy();expect(answer.citationIds).toEqual(places[0].sections[0].sourceIds);
  });
  it('accepts explicit general knowledge without fake project sources',()=>{
    expect(validateRemoteAnswer({answer:'A general explanation.',basis:'general',citationIds:[],supported:false})).toMatchObject({mode:'remote',basis:'general',citationIds:[]});
    expect(()=>validateRemoteAnswer({answer:'A web claim',basis:'web',citationIds:[],links:[]})).toThrow();
  });
  it('drops unsafe and overlapping inline links',()=>{
    const answer=validateRemoteAnswer({answer:'Text [1] [2]',basis:'general',citationIds:[],links:[{start:5,end:8,url:'javascript:alert(1)',title:'Unsafe'},{start:9,end:12,url:'https://abai-museum.kz/',title:'Museum'},{start:9,end:12,url:'https://example.com/',title:'Overlap'}]});
    expect(answer.links).toEqual([{start:9,end:12,url:'https://abai-museum.kz/',title:'Museum'}]);
  });
  it('passes conversation history but not API credentials or client source context',async()=>{
    const fetcher=vi.fn().mockResolvedValue(Response.json({answer:'Continuation',basis:'general',citationIds:[],supported:false}));vi.stubGlobal('fetch',fetcher);
    await askGuide({question:'And why?',locale:'en',placeId:'semey',history:[{role:'user',content:'Tell me about Abai'},{role:'assistant',content:'A poet.'}]},'/api/guide');
    const payload=JSON.parse(fetcher.mock.calls[0][1].body);expect(payload.history).toHaveLength(2);expect(payload).not.toHaveProperty('context');expect(payload).not.toHaveProperty('apiKey');
  });
  it.each([
    ['ru','Когда Казахстан стал независимым?','16 декабря 1991'],
    ['kk','Қазақстан қашан тәуелсіздік алды?','1991 жылғы 16 желтоқсан'],
    ['en','When did Kazakhstan become independent?','16 December 1991'],
    ['ru','Кто основал Казахское ханство?','Керей'],
    ['kk','Қазақ хандығын кім құрды?','Керей'],
    ['en','Who founded the Kazakh Khanate?','Kerey'],
    ['ru','Когда приняли Конституцию 1995 года?','30 августа'],
    ['kk','1995 жылғы Конституция қашан қабылданды?','30 тамыз'],
    ['en','When was the 1995 Constitution adopted?','30 August'],
  ] as const)('answers a national question in %s independently of the selected map pin', (locale,question,expected)=>{
    const result=referenceAnswer({question,locale,placeId:'konyr'});
    expect(result.answer).toContain(expected);expect(result.citationIds.length).toBeGreaterThan(0);
    expect(result.citationIds).not.toContain('konyr');
  });
  it.each([
    ['ru','Расскажи о Жидебае','Жидебай'],['kk','Жидебай туралы айтып бер','Жидебай'],['en','Tell me about Zhidebay','Zhidebay'],
  ] as const)('finds a different place in %s without using the current chapter', (locale,question,expected)=>{
    const result=referenceAnswer({question,locale,placeId:'semey'});
    expect(result.citationIds).toContain('zhidebay');expect(result.answer).toContain(expected);
  });
  it.each(['ru','kk','en'] as const)('gives a national overview and admits a missing topic in %s',locale=>{
    const question={ru:'Расскажи историю Казахстана',kk:'Қазақстан тарихын айтып бер',en:'Explain the history of Kazakhstan'}[locale];
    const overview=referenceAnswer({question,locale,placeId:'semey'});
    expect(overview.answer).toContain('1465');expect(overview.answer).toContain('1991');expect(overview.answer).toContain('1995');
    const missing=referenceAnswer({question:'Explain the Saka and Wusun',locale,placeId:'semey'});
    expect(missing.citationIds).toEqual([]);expect(missing.answer).not.toBe(places[0].sections[0].body[locale]);
  });
  it('describes site capabilities honestly instead of inventing AR',()=>{
    const result=referenceAnswer({question:'Does this website offer an AR quest?',locale:'en',placeId:'semey'});
    expect(result.answer).toContain('not implemented yet');expect(result.citationIds).toEqual([]);
  });
  it('accepts timeline sources in the browser using the shared registry',()=>{
    const id=guideTimeline.find(era=>era.id==='independence')!.sourceIds[0];
    expect(guideSources.some(source=>source.id===id)).toBe(true);
    expect(validateRemoteAnswer({answer:'16 December 1991.',basis:'project',citationIds:[id]}).citationIds).toEqual([id]);
  });
  it('keeps complete multilingual history pairs within the server limits and excludes fallbacks',()=>{
    const remote={answer:'Ответ на русском',citationIds:[],mode:'remote' as const,basis:'general' as const};
    const turns=[{question:'Кто такие саки?',answer:remote},{question:'And later?',answer:{...remote,answer:'An English continuation.'}},
      {question:'Failed question',answer:{...remote,mode:'reference' as const,notice:'Unavailable'}}];
    expect(buildGuideHistory(turns)).toEqual([
      {role:'user',content:'Кто такие саки?'},{role:'assistant',content:'Ответ на русском'},
      {role:'user',content:'And later?'},{role:'assistant',content:'An English continuation.'},
    ]);
    const bounded=buildGuideHistory(Array.from({length:6},()=>({question:'x'.repeat(1200),answer:{...remote,answer:'a'.repeat(12000)}})));
    expect(bounded.length%2).toBe(0);expect(bounded.length).toBeLessThanOrEqual(8);
    expect(bounded.reduce((sum,message)=>sum+message.content.length,0)).toBeLessThanOrEqual(24000);
    expect(bounded.every(message=>message.content.length<=6000)).toBe(true);
  });
});
describe('editorial integrity',()=>{
  it('provides three languages for every editorial text',()=>{
    function check(value:unknown){
      if(!value||typeof value!=='object')return;
      const obj=value as Record<string,unknown>;
      if('ru' in obj||'kk' in obj||'en' in obj)for(const lang of ['ru','kk','en'])expect(typeof obj[lang]==='string'&&(obj[lang] as string).trim().length>0).toBe(true);
      else Object.values(obj).forEach(check);
    }
    [copy,places,sources,eras].forEach(check);
  });
  it('resolves citations and local photographs for all five places',()=>{
    const known=new Set(sources.map(s=>s.id));
    expect(places).toHaveLength(5);
    for(const p of places){
      expect(existsSync('public'+p.image)).toBe(true);
      for(const id of [...p.sourceIds,p.imageSource,...p.sections.flatMap(s=>s.sourceIds)])expect(known.has(id)).toBe(true);
      expect(p.coordinate.every(Number.isFinite)).toBe(true);
    }
    for(const era of eras)for(const id of era.sourceIds)expect(known.has(id)).toBe(true);
  });
  it('keeps chart observations equal to the cited source CSV',()=>{
    const rows=readFileSync(new URL('../tests/fixtures/abay-population-2020-2024.csv',import.meta.url),'utf8').trim().split(/\r?\n/).slice(1);
    expect(population).toEqual(rows.map(row=>{const cells=row.split(',');return {year:Number(cells[0]),value:Number(cells[3])};}));
  });
});
