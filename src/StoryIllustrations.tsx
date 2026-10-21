import { ArrowUpRight } from 'lucide-react';
import { text, type Lang } from './i18n';
import { storyMedia } from './story-media';
import imageDimensions from './story-media-dimensions.json';
import './story-illustrations.css';

export default function StoryIllustrations({ids,lang}:{ids?:string[];lang:Lang}) {
  if(!ids?.length)return null;
  return <div className={'story-illustrations'+(ids.length>1?' story-illustrations-pair':'')}>
    {ids.map(id=>{const image=storyMedia[id];if(!image)return null;const size=imageDimensions[id as keyof typeof imageDimensions];return <figure key={id}>
      <a className={'story-illustration-image'+(image.fit==='contain'?' image-contain':'')} href={image.src} target="_blank" rel="noopener" aria-label={text(image.alt,lang)}><img src={image.src} alt={text(image.alt,lang)} width={size[0]} height={size[1]} loading="lazy" decoding="async" style={{objectPosition:image.position}}/></a>
      <figcaption><p>{text(image.caption,lang)}</p><a href={image.sourceUrl} target="_blank" rel="noreferrer">{image.credit} · {image.license}<ArrowUpRight size={13}/></a></figcaption>
    </figure>;})}
  </div>;
}
