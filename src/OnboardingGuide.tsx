import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, Headphones, Pause, Sparkles, X } from 'lucide-react';
import { L, text, type Lang } from './i18n';
import './onboarding.css';

type TourPage = 'home' | 'map' | 'place';
type Props = {
  open: boolean;
  lang: Lang;
  reduced: boolean;
  onClose: () => void;
  onNavigate: (page: TourPage, id?: string) => void;
  onAskGuide: () => void;
  renderAvatar: (step: number, speaking?: boolean, focusPoint?: { x: number; y: number }) => ReactNode;
};
type TargetRect = { top: number; left: number; width: number; height: number; step: number };
type LabelPosition = { top: number; left: number; width: number; height: number; side: 'above' | 'below' | 'left' | 'right' };

const words = {
  name: L('Жолсерік', 'Жолсерік', 'Zholserik'),
  role: L('Ваш проводник по IZQOR', 'IZQOR бойынша серігіңіз', 'Your companion to IZQOR'),
  introduction: L('Знакомство с путешествием', 'Саяхатпен танысу', 'A little introduction'),
  step: L('Шаг', 'Қадам', 'Step'),
  of: L('из', '/', 'of'),
  next: L('Продолжить', 'Жалғастыру', 'Continue'),
  back: L('Назад', 'Артқа', 'Back'),
  skip: L('Пропустить', 'Өткізу', 'Skip'),
  close: L('Закрыть знакомство', 'Таныстыруды жабу', 'Close introduction'),
  start: L('Показать сайт', 'Сайтты көрсету', 'Show me around'),
  finish: L('Начать путешествие', 'Саяхатты бастау', 'Begin the journey'),
  tryGuide: L('Попробовать гида', 'Гидті байқап көру', 'Try the guide'),
  listen: L('Послушать подсказку', 'Кеңесті тыңдау', 'Listen to this tip'),
  stop: L('Остановить озвучку', 'Тыңдауды тоқтату', 'Stop narration'),
  listenShort: L('Озвучить', 'Тыңдау', 'Listen'),
  stopShort: L('Остановить', 'Тоқтату', 'Stop'),
  noVoice: L('На устройстве нет голоса для этого языка. Вся подсказка доступна текстом.', 'Құрылғыда бұл тілге арналған дауыс жоқ. Кеңесті толық мәтін түрінде оқи аласыз.', 'No voice for this language is installed on this device. The complete tip is available as text.'),
};

const steps = [
  {
    title: L('Добро пожаловать в IZQOR', 'IZQOR-ға қош келдіңіз', 'Welcome to IZQOR'),
    body: L('Я Жолсерік, ваш проводник. Покажу, как выбрать язык, открыть карту и найти музейные экскурсии.', 'Мен — Жолсерік, сіздің серігіңізбін. Тілді таңдауды, картаны ашуды және музей экскурсияларын табуды көрсетемін.', 'I’m Zholserik, your guide. I’ll show you how to choose a language, open the map and find museum tours.'),
    label: L('', '', ''),
    target: null,
  },
  {
    title: L('Начнём с вашего языка.', 'Алдымен тілді таңдайық.', 'Let’s begin in your language.'),
    body: L('Подсвечен переключатель языка. Нажмите KK, RU или EN — изменится язык всего сайта и моих подсказок.', 'Тіл ауыстырғышы белгіленді. KK, RU немесе EN түймесін басыңыз — сайт пен кеңестерімнің тілі өзгереді.', 'The language switch is highlighted. Select KK, RU or EN to change the site and these tips.'),
    label: L('Язык сайта', 'Сайт тілі', 'Site language'),
    target: 'language',
  },
  {
    title: L('У каждой истории есть место.', 'Әр тарихтың өз мекені бар.', 'Every story has a place.'),
    body: L('В списке подсвечен Семей. Нажмите на его название — карта приблизит место. Так же можно выбрать любую другую точку.', 'Тізімде Семей белгіленді. Оның атауын басыңыз — карта сол мекенге жақындайды. Басқа нүктені де осылай таңдауға болады.', 'Semey is highlighted in the list. Select its name to bring the place into view. Choose any other place in the same way.'),
    label: L('Семей в списке мест', 'Орындар тізіміндегі Семей', 'Semey in the places list'),
    target: 'map',
  },
  {
    title: L('Заглянем в Жидебай.', 'Жидебайға үңілейік.', 'Let’s step into Zhidebay.'),
    body: L('Подсвечена кнопка «Войти в панораму». Нажмите её, чтобы осмотреть настоящие пространства музея. В истории рядом — фотографии и источники.', '«Панорамаға кіру» түймесі белгіленді. Музейдің шынайы кеңістігін көру үшін оны басыңыз. Мекен тарихында фотосуреттер мен дереккөздер де бар.', '“Enter the panorama” is highlighted. Select it to look around the real museum spaces. The story also includes photographs and sources.'),
    label: L('Войти в панораму', 'Панорамаға кіру', 'Enter the panorama'),
    target: 'panorama',
  },
  {
    title: L('Пусть вам будет удобно.', 'Өзіңізге ыңғайлы болсын.', 'Make yourself comfortable.'),
    body: L('Подсвечена кнопка настроек. Здесь можно увеличить текст, усилить контраст и уменьшить движение. Динамик рядом включает музыку.', 'Баптау түймесі белгіленді. Мұнда мәтінді үлкейтіп, контрастты арттырып, қозғалысты азайта аласыз. Жанындағы динамик музыканы қосады.', 'The settings button is highlighted. Increase text size, raise contrast or reduce motion here. The speaker beside it controls music.'),
    label: L('Настройки чтения', 'Оқу баптаулары', 'Reading settings'),
    target: 'comfort',
  },
  {
    title: L('Есть вопрос? Я рядом.', 'Сұрағыңыз бар ма? Мен осындамын.', 'A question? I’m right here.'),
    body: L('Внизу подсвечена кнопка «Спросить гида». Выберите место и задайте вопрос. Под ответом можно открыть материалы, на которые он опирается.', 'Төменде «Гидтен сұрау» түймесі белгіленді. Мекенді таңдап, сұрақ қойыңыз. Жауаптың астынан ол сүйенген деректерді аша аласыз.', '“Ask the guide” is highlighted below. Choose a place and ask a question. Follow the sources beneath each answer.'),
    label: L('Спросить гида', 'Гидтен сұрау', 'Ask the guide'),
    target: 'guide',
  },
] as const;

export default function OnboardingGuide({ open, lang, reduced, onClose, onNavigate, onAskGuide, renderAvatar }: Props) {
  const [step, setStep] = useState(0);
  const [target, setTarget] = useState<TargetRect | null>(null);
  const [labelPosition, setLabelPosition] = useState<LabelPosition | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState(false);
  const [nativeDialogOpen, setNativeDialogOpen] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const targetLabel = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const navigation = useRef(onNavigate);
  const close = useRef(onClose);
  const mounted = useRef(true);
  const narration = useRef(0);
  const titleId = useId(), bodyId = useId();
  const maskId = 'onboarding-mask-' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const arrowId = maskId + '-arrow';
  const current = steps[step];
  const t = (key: keyof typeof words) => text(words[key], lang);
  navigation.current = onNavigate;
  close.current = onClose;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; narration.current++; window.speechSynthesis?.cancel(); };
  }, []);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setStep(0);
    const focus = requestAnimationFrame(() => {
      if (!document.querySelector('dialog[open]')) heading.current?.focus({ preventScroll: true });
    });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) {
        event.preventDefault();
        narration.current++;
        window.speechSynthesis?.cancel();
        close.current();
        opener.current?.isConnected && opener.current.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { cancelAnimationFrame(focus); window.removeEventListener('keydown', onKey); };
  }, [open]);

  useEffect(() => {
    narration.current++;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setVoiceNotice(false);
  }, [open, step, lang]);

  useEffect(() => {
    if (!nativeDialogOpen) return;
    narration.current++;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, [nativeDialogOpen]);

  useEffect(() => {
    if (!open) return;
    if (step === 2) navigation.current('map');
    if (step === 3) navigation.current('place', 'zhidebay');
    if (step === 4 || step === 5) navigation.current('home');
    if (!document.querySelector('dialog[open]')) {
      heading.current?.focus({ preventScroll: true });
    }
  }, [open, step]);

  useEffect(() => {
    if (!open) { setTarget(null); return; }
    let observed: Element | null = null;
    let observedLabel: Element | null = null;
    let scrolled = false;
    let frame = 0;
    const resize = new ResizeObserver(() => schedule());
    if (card.current) resize.observe(card.current);
    function findTarget() {
      const name = steps[step].target;
      if (!name) return null;
      const element = document.querySelector<HTMLElement>('[data-tour="' + name + '"]');
      if (name === 'map') {
        return element?.querySelector<HTMLElement>('.atlas-row:first-child') || null;
      }
      if (name === 'panorama') return element?.querySelector<HTMLElement>('.panorama-preview-caption') || element;
      return element;
    }
    function measure() {
      frame = 0;
      const modalOpen = !!document.querySelector('dialog[open]');
      setNativeDialogOpen(modalOpen);
      const element = findTarget();
      if (element !== observed) {
        if (observed) resize.unobserve(observed);
        observed = element;
        if (element) resize.observe(element);
      }
      if (targetLabel.current !== observedLabel) {
        if (observedLabel) resize.unobserve(observedLabel);
        observedLabel = targetLabel.current;
        if (observedLabel) resize.observe(observedLabel);
      }
      if (!element || modalOpen) { setTarget(null); return; }
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) { setTarget(null); return; }
      if (!scrolled && !['language', 'comfort', 'guide'].includes(steps[step].target || '')) {
        scrolled = true;
        const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0;
        const availableBottom = window.innerHeight - (card.current?.getBoundingClientRect().height || 220) - 36;
        if (rect.top < headerBottom + 16 || rect.bottom > availableBottom) {
          window.scrollTo({ top: Math.max(0, window.scrollY + rect.top - headerBottom - 24), behavior: reduced ? 'instant' : 'smooth' });
        }
      }
      const padding = 7;
      const viewportWidth = document.documentElement.clientWidth;
      const left = Math.max(4, rect.left - padding), top = Math.max(4, rect.top - padding);
      const right = Math.min(viewportWidth - 4, rect.right + padding);
      const bottom = Math.min(window.innerHeight - 4, rect.bottom + padding);
      if (right <= left || bottom <= top) { setTarget(null); return; }
      const next = { left, top, width: right - left, height: bottom - top, step };
      setTarget(previous => previous && Object.keys(next).every(key => Math.abs(previous[key as keyof TargetRect] - next[key as keyof TargetRect]) < .5) ? previous : next);
      const labelRect = targetLabel.current?.getBoundingClientRect();
      if (!labelRect?.width || !labelRect.height) { setLabelPosition(null); return; }
      const labelWidth = labelRect.width, labelHeight = labelRect.height;
      const clampLeft = (value: number) => Math.max(12, Math.min(viewportWidth - labelWidth - 12, value));
      const candidates: LabelPosition[] = [
        { left: clampLeft(left + (next.width - labelWidth) / 2), top: bottom + 20, side: 'below', width: labelWidth, height: labelHeight },
        { left: clampLeft(left + (next.width - labelWidth) / 2), top: top - labelHeight - 20, side: 'above', width: labelWidth, height: labelHeight },
        { left: left - labelWidth - 20, top: top + (next.height - labelHeight) / 2, side: 'left', width: labelWidth, height: labelHeight },
        { left: right + 20, top: top + (next.height - labelHeight) / 2, side: 'right', width: labelWidth, height: labelHeight },
      ];
      const cardRect = card.current?.getBoundingClientRect();
      const label = candidates.find(candidate => {
        if (candidate.left < 8 || candidate.top < 8 || candidate.left + labelWidth > viewportWidth - 8 || candidate.top + labelHeight > window.innerHeight - 8) return false;
        return !cardRect || candidate.left + labelWidth + 8 < cardRect.left || candidate.left - 8 > cardRect.right || candidate.top + labelHeight + 8 < cardRect.top || candidate.top - 8 > cardRect.bottom;
      }) || null;
      setLabelPosition(previous => previous && label && previous.side === label.side && Math.abs(previous.left - label.left) < .5 && Math.abs(previous.top - label.top) < .5 && Math.abs(previous.width - label.width) < .5 && Math.abs(previous.height - label.height) < .5 ? previous : label);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(measure); }
    const mutation = new MutationObserver(schedule);
    mutation.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      mutation.disconnect();
      resize.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
    };
  }, [open, step, reduced]);

  function finish(ask = false) {
    narration.current++;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    onClose();
    if (ask) onAskGuide();
    else if (opener.current?.isConnected) opener.current.focus({ preventScroll: true });
  }

  function narrate() {
    const synth = window.speechSynthesis;
    if (speaking) { narration.current++; synth?.cancel(); setSpeaking(false); return; }
    const voice = synth?.getVoices().find(candidate => {
      const voiceLanguage = candidate.lang.toLowerCase().replaceAll('_', '-');
      return voiceLanguage === lang || voiceLanguage.startsWith(lang + '-');
    });
    if (!synth || !voice) { setVoiceNotice(true); return; }
    const generation = ++narration.current;
    synth.cancel();
    setSpeaking(false);
    setVoiceNotice(false);
    const utterance = new SpeechSynthesisUtterance(text(current.title, lang) + '. ' + text(current.body, lang));
    utterance.lang = voice.lang;
    utterance.voice = voice;
    utterance.rate = .9;
    const stopped = () => { if (mounted.current && narration.current === generation) setSpeaking(false); };
    utterance.onstart = () => { if (mounted.current && narration.current === generation) setSpeaking(true); };
    utterance.onend = stopped;
    utterance.onerror = stopped;
    synth.speak(utterance);
  }

  if (!open) return null;
  const currentTarget = target && target.step === step && !nativeDialogOpen ? target : null;
  const leader = currentTarget && labelPosition ? (() => {
    const label = labelPosition, focus = currentTarget;
    const centerX = focus.left + focus.width / 2, centerY = focus.top + focus.height / 2;
    if (label.side === 'above' || label.side === 'below') {
      const startX = Math.max(label.left + 12, Math.min(label.left + label.width - 12, centerX));
      return { x1: startX, y1: label.side === 'above' ? label.top + label.height : label.top, x2: centerX, y2: label.side === 'above' ? focus.top - 2 : focus.top + focus.height + 2 };
    }
    const startY = Math.max(label.top + 8, Math.min(label.top + label.height - 8, centerY));
    return { x1: label.side === 'left' ? label.left + label.width : label.left, y1: startY, x2: label.side === 'left' ? focus.left - 2 : focus.left + focus.width + 2, y2: centerY };
  })() : null;
  return <>
    {step === 0 && !nativeDialogOpen && <div className="onboarding-welcome-shade" aria-hidden="true" />}
    {currentTarget && <div className={'onboarding-overlay' + (reduced ? ' is-reduced' : '')} aria-hidden="true">
      <svg className="onboarding-shade" width="100%" height="100%"><defs><mask id={maskId} maskUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="white" /><rect x={currentTarget.left} y={currentTarget.top} width={currentTarget.width} height={currentTarget.height} rx="9" fill="black" /></mask><marker id={arrowId} markerWidth="6" markerHeight="7" refX="5" refY="3.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1 1 L5 3.5 L1 6" fill="none" stroke="var(--guide-brass)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></marker></defs><rect width="100%" height="100%" className="onboarding-dimmer" mask={'url(#' + maskId + ')'} /><rect className="onboarding-target-outline" x={currentTarget.left} y={currentTarget.top} width={currentTarget.width} height={currentTarget.height} rx="9" />{leader && <line {...leader} className="onboarding-leader" markerEnd={'url(#' + arrowId + ')'} />}</svg>
      <div ref={targetLabel} className="onboarding-target-label" style={{ left: labelPosition?.left || 0, top: labelPosition?.top || 0, visibility: labelPosition ? 'visible' : 'hidden' }}>{text(current.label, lang)}</div>
    </div>}
    <div ref={card} className={'onboarding-card ' + (step === 0 ? 'onboarding-welcome' : 'onboarding-compact') + (current.target ? ' onboarding-for-' + current.target : '') + (reduced ? ' is-reduced' : '') + (nativeDialogOpen ? ' is-suspended' : '')} role="dialog" aria-modal="false" aria-labelledby={titleId} aria-describedby={bodyId}>
      <div className="onboarding-avatar-panel">
        <div className="onboarding-portrait-halo" aria-hidden="true" />
        <div className="onboarding-avatar">{renderAvatar(step, speaking, currentTarget ? { x: currentTarget.left + currentTarget.width / 2, y: currentTarget.top + currentTarget.height / 2 } : undefined)}</div>
      </div>
      <div className="onboarding-content">
        <div className="onboarding-topline"><div className="onboarding-identity"><span>{t('name')}</span></div><div className="onboarding-progress" role="img" aria-label={t('step') + ' ' + (step + 1) + ' ' + t('of') + ' ' + steps.length}><div className="onboarding-count" aria-hidden="true"><span>{String(step + 1).padStart(2, '0')}</span><small>/ {String(steps.length).padStart(2, '0')}</small></div><div className="onboarding-progress-track" aria-hidden="true"><span style={{ transform: 'scaleX(' + ((step + 1) / steps.length) + ')' }} /></div></div></div>
        <div className="onboarding-copy" aria-live="polite" aria-atomic="true">
          <h2 ref={heading} id={titleId} tabIndex={-1}>{text(current.title, lang)}</h2>
          <p id={bodyId}>{text(current.body, lang)}</p>
        </div>
        <div className="onboarding-controls">
          {step > 0 && <button className="onboarding-back" onClick={() => setStep(value => Math.max(0, value - 1))} aria-label={t('back')} title={t('back')}><ArrowLeft size={20} strokeWidth={1.7} /></button>}
          <button className="onboarding-next" onClick={() => step === steps.length - 1 ? finish() : setStep(value => value + 1)}><span>{step === 0 ? t('start') : step === steps.length - 1 ? t('finish') : t('next')}</span><span className="onboarding-next-icon" aria-hidden="true">{step === steps.length - 1 ? <Check size={19} strokeWidth={1.8} /> : <ArrowRight size={20} strokeWidth={1.8} />}</span></button>
        </div>
        {step === steps.length - 1 && <button className="onboarding-try-guide" onClick={() => finish(true)}><Sparkles size={15} />{t('tryGuide')}<ArrowRight size={15} /></button>}
        {voiceNotice && <p className="onboarding-voice-notice" role="status">{t('noVoice')}</p>}
        <div className="onboarding-bottomline"><button className="onboarding-voice" onClick={narrate} aria-label={speaking ? t('stop') : t('listen')} title={speaking ? t('stop') : t('listen')} aria-pressed={speaking}>{speaking ? <Pause size={18} strokeWidth={1.7} /> : <Headphones size={18} strokeWidth={1.7} />}<span>{speaking ? t('stopShort') : t('listenShort')}</span></button><button onClick={() => finish()} className="onboarding-skip"><span>{t('skip')}</span></button></div>
      </div>
      <button className="onboarding-dismiss" onClick={() => finish()} aria-label={t('close')} title={t('close')}><X size={19} strokeWidth={1.7} /></button>
    </div>
  </>;
}
