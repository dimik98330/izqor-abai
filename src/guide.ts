import { places, type Place } from './content';
import { getGuideSource, guideTimeline, guideSite, matchGuideTopics } from './guide-knowledge';
import { copy, L, text, type Lang } from './i18n';
export interface GuideLink {start:number;end:number;url:string;title:string}
export interface GuideAnswer {answer:string; citationIds:string[]; mode:'reference'|'remote'; notice?:string;basis?:'project'|'web'|'general';links?:GuideLink[]}
export interface GuideHistoryMessage {role:'user'|'assistant';content:string}
export interface GuideRequest {question:string; locale:Lang; placeId:string;history?:GuideHistoryMessage[]}
export const guideEndpoint = import.meta.env.VITE_GUIDE_ENDPOINT ?? '/api/guide';
export function buildGuideHistory(turns: {question:string;answer:GuideAnswer}[]):GuideHistoryMessage[] {
  // Error notices and deterministic excerpts must not become the model's memory.
  const recent = turns.filter(turn => turn.answer.mode === 'remote' && !turn.answer.notice).slice(-4);
  while (recent.length && recent.reduce((sum, turn) => sum + turn.question.length + Math.min(6000, turn.answer.answer.length), 0) > 24_000) recent.shift();
  return recent.flatMap(turn => [{ role: 'user' as const, content: turn.question }, { role: 'assistant' as const, content: turn.answer.answer.slice(0, 6000) }]);
}
function publicLink(value:unknown):value is string {
  if(typeof value!=='string'||value.length>2048)return false;
  try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&url.hostname.includes('.')&&!/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname)&&!url.hostname.endsWith('.local');}catch{return false;}
}
export function referenceAnswer(request:GuideRequest):GuideAnswer {
  const locale=request.locale;
  const insufficient=()=>({answer:text(L('В материалах сайта недостаточно сведений для точного ответа на этот вопрос. Попробуйте задать его ещё раз, когда ИИ-гид будет доступен, или обратитесь к историческим источникам.','Бұл сұраққа нақты жауап беру үшін сайт материалдарында мәлімет жеткіліксіз. ЖИ-гид қолжетімді болғанда қайта сұрап көріңіз немесе тарихи дереккөздерге жүгініңіз.','The site does not contain enough evidence to answer this question precisely. Try again when the AI guide is available, or consult historical sources.'),locale),citationIds:[],mode:'reference' as const});
  const sourced=(answer:string,citationIds:string[]):GuideAnswer=>({answer,citationIds:[...new Set(citationIds)],mode:'reference',basis:'project'});
  const q=request.question.trim().toLocaleLowerCase();
  if(!q)return insufficient();
  const topics=matchGuideTopics(q);
  if(topics.eras.length){
    const eras=topics.eras.slice(0,3);
    return sourced(eras.map(era=>`${text(era.title,locale)} · ${era.year}\n\n${era.paragraphs.map(paragraph=>text(paragraph,locale)).join('\n\n')}`).join('\n\n'),eras.flatMap(era=>era.sourceIds));
  }
  if(/сайт|сервис|платформ|izqor|website|this app|жоба|қолданба|\bar\b|дополненн|augmented|толықтырылған|квест|quest|(?:как|how).*(?:язык|language)|тіл.*(?:таңда|ауыстыр)/iu.test(q)){
    return {answer:[guideSite.purpose,guideSite.usage,...(/\bar\b|дополненн|augmented|толықтырылған|квест|quest/iu.test(q)?[guideSite.limits]:[])].map(value=>text(value,locale)).join('\n\n'),citationIds:[],mode:'reference'};
  }
  if(/(?:истори.{0,6}казахстан|қазақстан.{0,6}тарих|history of kazakhstan|kazakhstan.{0,4}history)/iu.test(q)&&!topics.places.length){
    return sourced(guideTimeline.map(era=>`${era.year} — ${text(era.shortTitle,locale)}. ${text(era.paragraphs[0],locale)}`).join('\n\n'),guideTimeline.flatMap(era=>era.sourceIds));
  }
  const localQuestion=/это(?:го|м|т)?\s+(?:мест|дом)|здесь|тут|this (?:place|house)|see here|(?:бұл|осы)\s+(?:мекен|жер|үй)|мұнда|осында|панорам|panoram|360/iu.test(q);
  const place=topics.places[0]??(localQuestion?places.find(p=>p.id===request.placeId):undefined);
  if(place){
    if(/панорам|panoram|360/.test(q)) {
      if(!place.tours.length)return insufficient();
      const scope=place.id==='konyr'?text(L('Для этой пещеры есть круговой обзор снаружи. Панорама подземного озера пока не найдена.','Бұл үңгірдің сыртқы айналма көрінісі бар. Жерасты көлінің панорамасы әзірге табылған жоқ.','This cave has an exterior panorama. An underground lake panorama has not yet been found.'),locale):text(copy.panoramaText,locale);
      return sourced(scope,[place.id==='konyr'?'tour-konyr':place.id==='kozy'?'tour-kozy':'tours']);
    }
    if(/источник|дереккөз|қайдан|source|information come/.test(q))return sourced(text(place.short,locale)+' '+text(copy.sourceIntro,locale),place.sourceIds);
    const section=place.sections[/эпос|epic|жыр/.test(q)?Math.min(1,place.sections.length-1):0];
    return sourced((topics.places.length?text(place.name,locale)+'\n\n':'')+text(section.body,locale),section.sourceIds);
  }
  // Named cultural material is available even when there is no matching map pin.
  if(/домбр|dombra|кюй|\bkuy\b|(?:^|\s)күй/iu.test(q)){
    const culture=guideTimeline.find(era=>era.id==='khanate')!.culture!;
    return sourced(text(culture.description,locale)+' '+text(culture.interestingFact,locale),[culture.sourceId]);
  }
  return insufficient();
}
export function validateRemoteAnswer(value:unknown):GuideAnswer {
  if(!value||typeof value!=='object')throw new Error('Invalid guide response');
  const data=value as Record<string,unknown>;
  if(typeof data.answer!=='string'||!data.answer.trim()||data.answer.length>12000)throw new Error('Invalid answer');
  const citationIds=Array.isArray(data.citationIds)?data.citationIds.filter((id):id is string=>typeof id==='string'&&!!getGuideSource(id)):[];
  const links:GuideLink[]=[];
  if(Array.isArray(data.links))for(const link of data.links.slice(0,40)){
    if(link&&typeof link==='object'&&Number.isInteger(link.start)&&Number.isInteger(link.end)&&link.start>=0&&link.end>link.start&&link.end<=data.answer.length&&publicLink(link.url)&&typeof link.title==='string'&&link.title.length<=200&&/^\[\d+\]$/.test(data.answer.slice(link.start,link.end))&&!links.some(other=>link.start<other.end&&link.end>other.start))links.push({start:link.start,end:link.end,url:link.url,title:link.title});
  }
  links.sort((a,b)=>a.start-b.start);
  const basis=data.basis==='general'||data.basis==='web'||data.basis==='project'?data.basis:undefined;
  if(basis==='project'&&!citationIds.length)throw new Error('Missing project citations');
  if(basis==='web'&&!links.length)throw new Error('Missing web citations');
  if(!citationIds.length&&!links.length&&basis!=='general'&&data.supported!==false)throw new Error('Unsupported answer without sources');
  return {answer:data.answer,citationIds,links,basis,mode:'remote'};
}
export function buildGuideContext(place:Place,locale:Lang){
  return {place:{id:place.id,name:text(place.name,locale),sections:place.sections.map(s=>({title:text(s.title,locale),body:text(s.body,locale),sourceIds:s.sourceIds}))},
    sources:place.sourceIds.map(getGuideSource).filter(s=>!!s).map(s=>({id:s.id,title:text(s.title,locale),url:s.url}))};
}
export async function askGuide(request:GuideRequest,endpoint:string=guideEndpoint,signal?:AbortSignal):Promise<GuideAnswer>{
  if(!endpoint)return referenceAnswer(request);
  const place=places.find(p=>p.id===request.placeId);
  if(!place)return referenceAnswer(request);
  try{
    const timeout=AbortSignal.timeout(60000);
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request),signal:signal?AbortSignal.any([timeout,signal]):timeout});
    if(!response.ok){
      const payload=await response.json().catch(()=>null);
      const code=payload?.error?.code;
      const errorCopy=code==='provider_quota'?copy.guideQuota:code==='provider_auth'?copy.guideAuth:code==='rate_limit'||code==='provider_rate_limit'?copy.guideRateLimit:code==='provider_timeout'?copy.guideTimeout:copy.guideUnavailable;
      return {...referenceAnswer(request),notice:text(errorCopy,request.locale)};
    }
    return validateRemoteAnswer(await response.json());
  }catch(error){return {...referenceAnswer(request),notice:text(error instanceof Error&&error.name==='TimeoutError'?copy.guideTimeout:copy.guideUnavailable,request.locale)};}
}
