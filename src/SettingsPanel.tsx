import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight, Check, Pause, RotateCcw, X } from 'lucide-react';
import { copy, L, text, type Lang, type LocalText } from './i18n';
import styles from './settings-panel.module.css';

interface SettingsPanelProps {
  lang: Lang;
  large: boolean;
  contrast: boolean;
  reduce: boolean;
  volume: number;
  playing: boolean;
  narrating: boolean;
  visitedCount: number;
  savedCount: number;
  placeCount: number;
  onLargeChange: (value: boolean) => void;
  onContrastChange: (value: boolean) => void;
  onReduceChange: (value: boolean) => void;
  onVolumeChange: (value: number) => void;
  onToggleMusic: () => void;
  onIntroduction: (trigger: HTMLElement) => void;
  onReset: () => void;
  onClose: () => void;
}

export default function SettingsPanel(props: SettingsPanelProps) {
  const [resetAsked, setResetAsked] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const confirmationRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (resetAsked) confirmationRef.current?.scrollIntoView({ block: 'nearest' });
  }, [resetAsked]);
  const t = (value: LocalText) => text(value, props.lang);
  const volume = Math.round(Math.min(1, Math.max(0, props.volume)) * 100);
  const visited = Math.min(props.visitedCount, props.placeCount);
  const progress = props.placeCount ? Math.round(visited / props.placeCount * 100) : 0;
  const options = [
    { id: 'large', label: copy.comfortable, hint: L('Крупнее шрифт на странице', 'Беттегі шрифт үлкенірек', 'Larger text on the page'), icon: 'text', checked: props.large, change: props.onLargeChange },
    { id: 'contrast', label: copy.contrast, hint: L('Чётче цвета и элементы', 'Түстер мен элемент айқын', 'Stronger text and colours'), icon: 'contrast', checked: props.contrast, change: props.onContrastChange },
    { id: 'reduce', label: copy.reduceMotion, hint: L('Без анимации интерфейса', 'Интерфейс анимациясыз', 'No interface animation'), icon: 'motion', checked: props.reduce, change: props.onReduceChange },
  ];

  return <div className={styles.panel} data-ui="settings-panel">
    <header className={styles.header}>
      <div className={styles.headerText}>
        <h2>{t(copy.settings)}</h2>
        <p>{t(L('Настройте путешествие под себя.', 'Саяхатты өзіңізге ыңғайлаңыз.', 'Make the journey your own.'))}</p>
      </div>
      <button className={styles.close} type="button" onClick={props.onClose} aria-label={t(copy.close)} autoFocus><X size={32} strokeWidth={1.5}/></button>
    </header>
    <div className={styles.body}>
      <section aria-labelledby="settings-comfort-title" className={styles.section}>
        <h3 id="settings-comfort-title" className={styles.sectionTitle}>{t(L('Комфорт', 'Жайлылық', 'Comfort'))}</h3>
        <div className={styles.group}>
          {options.map(({ id, label, hint, icon, checked, change }) => {
            const controlId = 'settings-' + id;
            const hintId = controlId + '-hint';
            return <div className={styles.row} key={id}>
              <img className={styles.rowIcon} src={import.meta.env.BASE_URL + `media/settings-night/${icon}.webp`} alt="" width={80} height={74}/>
              <label className={styles.rowText} htmlFor={controlId}>
                <span className={styles.rowLabel}>{t(label)}</span>
                <span className={styles.rowHint} id={hintId}>{t(hint)}</span>
              </label>
              <input className={styles.switch} id={controlId} type="checkbox" role="switch" checked={checked}
                aria-label={t(label)} aria-describedby={hintId}
                onChange={event => change(event.target.checked)}/>
            </div>;
          })}
        </div>
      </section>

      <section aria-labelledby="settings-sound-title" className={`${styles.section} ${styles.sound}`}>
        <h3 id="settings-sound-title" className={styles.sectionTitle}>{t(L('Звук', 'Дыбыс', 'Sound'))}</h3>
        <div className={styles.group}>
          <div className={styles.musicRow}>
            <img className={styles.dombra} src={import.meta.env.BASE_URL + 'media/settings-night/dombra.webp'} alt="" width={91} height={93}/>
            <div className={styles.rowText}>
              <span className={styles.rowLabel}>{t(L('Домбыра', 'Домбыра', 'Dombra'))}</span>
              <span className={styles.rowHint}>
                {t(props.playing ? props.narrating ? L('Пауза на время рассказа', 'Әңгіме кезінде үзіліс', 'Paused during narration') : L('Играет', 'Ойнатылуда', 'Playing') : L('Выключена', 'Өшірулі', 'Off'))}
              </span>
            </div>
            <button type="button" className={styles.musicToggle} onClick={props.onToggleMusic}
              aria-label={t(props.playing ? copy.soundOn : copy.soundOff)} aria-pressed={props.playing}
              title={t(props.playing ? copy.soundOn : copy.soundOff)}>
              {props.playing ? <Pause size={25} fill="currentColor" strokeWidth={1.5}/> : <img src={import.meta.env.BASE_URL + 'media/settings-night/play.webp'} alt="" width={88} height={89}/>}
            </button>
          </div>
          <div className={styles.volume}>
            <div className={styles.volumeHead}>
              <label htmlFor="settings-volume">{t(copy.volume)}</label>
              <output htmlFor="settings-volume">{volume}%</output>
            </div>
            <input id="settings-volume" type="range" min="0" max="100" step="5" value={volume} aria-valuetext={volume + '%'}
              style={{ '--volume-fill': volume + '%' } as CSSProperties}
              onChange={event => props.onVolumeChange(Number(event.target.value) / 100)}/>
          </div>
        </div>
      </section>

      <section aria-labelledby="settings-journey-title" className={`${styles.section} ${styles.journeySection}`}>
        <h3 id="settings-journey-title" className={styles.sectionTitle}>{t(copy.yourJourney)}</h3>
        <div className={styles.journey}>
          <div className={styles.journeyTop}>
            <p className={styles.journeyCount}>{visited} {t(L('из', '/', 'of'))} {props.placeCount} {t(L('мест открыто', 'мекен қаралды', 'places explored'))}</p>
            <span className={styles.journeyPercent}>{progress}%</span>
          </div>
          <div className={styles.progress} role="progressbar" aria-label={t(copy.yourJourney)} aria-valuemin={0} aria-valuemax={props.placeCount || 1} aria-valuenow={visited}>
            <span className={styles.progressLine} aria-hidden="true"><span style={{ width: `${progress}%` }}/></span>
            {Array.from({ length: props.placeCount }, (_, index) => <span key={index} aria-hidden="true" className={`${styles.checkpoint} ${index < visited ? styles.complete : ''}`}>
              {index < visited && <Check size={17} strokeWidth={2.5}/>}
            </span>)}
          </div>
          {resetAsked ? <div className={styles.resetConfirmation} ref={confirmationRef}>
            <p>{t(L('Сбросить прогресс и сохранённые места?', 'Прогресс пен сақталған мекендерді өшіру керек пе?', 'Reset progress and saved places?'))}</p>
            <div className={styles.resetActions}>
              <button type="button" className={styles.resetConfirm} onClick={() => { props.onReset(); setResetAsked(false); setResetDone(true); }}>{t(L('Сбросить', 'Өшіру', 'Reset'))}</button>
              <button type="button" className={styles.cancel} onClick={() => setResetAsked(false)}>{t(L('Отмена', 'Бас тарту', 'Cancel'))}</button>
            </div>
          </div> : <div className={styles.progressActions}>
            {resetDone && <span role="status"><Check size={14} strokeWidth={2}/>{t(L('Прогресс сброшен', 'Прогресс өшірілді', 'Progress reset'))}</span>}
            <button type="button" className={styles.reset} onClick={() => setResetAsked(true)} disabled={!props.visitedCount && !props.savedCount}>
              <RotateCcw size={25} strokeWidth={1.5}/>{t(copy.reset)}
            </button>
          </div>}
        </div>
      </section>

      <button type="button" className={styles.introduction} onClick={event => props.onIntroduction(event.currentTarget)}>
        <img src={import.meta.env.BASE_URL + 'media/settings-night/guide.webp'} alt="" width={141} height={141}/>
        <span className={styles.introductionText}>
          <strong>{t(L('Познакомиться с Жолсеріком', 'Жолсерікпен танысу', 'Meet Zholserik'))}</strong>
          <small>{t(L('Ваш проводник по IZQOR', 'IZQOR бойынша жолсерігіңіз', 'Your companion through IZQOR'))}</small>
        </span>
        <ArrowUpRight size={32} strokeWidth={1.5} aria-hidden="true"/>
      </button>
    </div>
  </div>;
}
