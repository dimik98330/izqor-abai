import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import BrandWordmark from './BrandWordmark';
import { copy, L, text, type Lang } from './i18n';
import styles from './site-footer.module.css';

interface SiteFooterProps {
  lang: Lang;
  onHome: () => void;
  onSources: () => void;
  onSettings: () => void;
  onMemory: () => void;
  onIntroduction: (origin: HTMLElement) => void;
}

export default function SiteFooter({ lang, onHome, onSources, onSettings, onMemory, onIntroduction }: SiteFooterProps) {
  const footer = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = footer.current;
    if (!element) return;
    // Keep the companion reachable without covering the footer caption.
    const observer = new IntersectionObserver(([entry]) => {
      document.documentElement.dataset.footerVisible = String(entry.isIntersecting);
    });
    observer.observe(element);
    return () => { observer.disconnect(); delete document.documentElement.dataset.footerVisible; };
  }, []);
  return <footer ref={footer} className={'site-footer ' + styles.footer} data-ui="site-footer">
    <div className={styles.inner}>
      <div className={styles.identity}>
        <button type="button" className={'wordmark ' + styles.brand} onClick={onHome} aria-label={text(L('IZQOR — На главную', 'IZQOR — Басты бет', 'IZQOR — Home'), lang)}><BrandWordmark/></button>
      </div>
      <nav className={styles.links} aria-label={text(L('О проекте', 'Жоба туралы', 'About IZQOR'),lang)}>
        <button onClick={onSources}>{text(copy.sources,lang)}</button>
        <button onClick={onSettings}>{text(L('Доступность','Қолжетімділік','Accessibility'),lang)}</button>
        <button onClick={onMemory}>{text(L('Воспоминания','Естеліктер','Memories'),lang)}</button>
        <button data-start-tour onClick={event=>onIntroduction(event.currentTarget)}>{text(L('О проекте','Жоба туралы','About'),lang)}</button>
      </nav>
      <p className={styles.region}><MapPin size={14} strokeWidth={1.6} aria-hidden="true"/>{text(copy.region, lang)}</p>
    </div>
  </footer>;
}
