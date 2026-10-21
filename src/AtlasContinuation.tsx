import { useId } from 'react';
import { ArrowRight, UsersRound } from 'lucide-react';
import { getPlace, getSource } from './content';
import { L, text, type Lang } from './i18n';

const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '');
interface Props { lang: Lang; onOpen: (id: string) => void; onGuide: (id: string) => void }

export default function AtlasContinuation({ lang, onOpen, onGuide }: Props) {
  const place = getPlace('borili')!;
  const t = (value: ReturnType<typeof L>) => text(value, lang);
  const title = useId();
  const source = getSource(place.imageSource);
  return <section className={'immersive-story story-scene-' + place.id} id="journey-context-title" tabIndex={-1} aria-labelledby={title}>
    <div className="immersive-story-image" aria-hidden="true" key={place.id + '-image'}>
      <img src={asset('/media/borili-scene-hero.webp')} alt="" width={1787} height={880} loading="lazy" decoding="async"/>
    </div>
    <div className="immersive-story-shell">
      <div className="immersive-story-copy" key={place.id}>
        <p className="immersive-story-eyebrow">{t(L('История места', 'Мекен тарихы', 'The story of a place'))}</p>
        <h2 id={title}>{t(place.name)}</h2>
        <p className="immersive-story-subtitle">{t(place.subtitle)}</p>
        <p className="immersive-story-description">{t(place.short)}</p>
        <div className="immersive-story-actions">
          <a className="immersive-story-primary" href={'#/place/' + place.id} onClick={event => { event.preventDefault(); onOpen(place.id); }}><span>{t(L('Открыть историю', 'Тарихты ашу', 'Explore the story'))}</span><ArrowRight size={21} strokeWidth={1.6}/></a>
          <button className="immersive-story-guide" onClick={()=>onGuide(place.id)}><UsersRound size={26} strokeWidth={1.3}/><span>{t(L('Спросить гида', 'Гидтен сұрау', 'Ask the guide'))}</span></button>
        </div>
      </div>
    </div>
    <a className="immersive-story-credit" href={source?.url} target="_blank" rel="noreferrer">{t(L('Иллюстрация по фотографии музея · Оригинал', 'Музей фотосы негізіндегі иллюстрация · Түпнұсқа', 'Illustration based on the museum photo · Original'))}</a>
  </section>;
}
