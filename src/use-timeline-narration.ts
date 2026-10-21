import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang } from './i18n';

export type TimelineNarrationStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';
export type TimelineNarrationNotice = null | 'voiceUnavailable' | 'playbackFailed';

interface NarrationOptions {
  chapterId: string;
  locale: Lang;
  text: string;
  src?: string;
  onSpeakingChange: (speaking: boolean) => void;
}

interface NarrationOperation {
  generation: number;
  playAttempt: number;
  audio?: HTMLAudioElement;
  synthesis?: SpeechSynthesis;
  utterance?: SpeechSynthesisUtterance;
  cancelVoiceWait?: () => void;
  cancelPlaybackWait?: () => void;
  startTimer?: number;
  started: boolean;
}

const voiceLanguage: Record<Lang, string> = { kk: 'kk-KZ', ru: 'ru-RU', en: 'en-GB' };
const normalizeLanguage = (value: string) => value.toLowerCase().replaceAll('_', '-');

function matchingVoice(synthesis: SpeechSynthesis, locale: Lang) {
  const voices = synthesis.getVoices().filter(voice => {
    const language = normalizeLanguage(voice.lang);
    return language === locale || language.startsWith(locale + '-');
  });
  return voices.find(voice => normalizeLanguage(voice.lang) === normalizeLanguage(voiceLanguage[locale]))
    || voices.find(voice => voice.default)
    || voices.find(voice => voice.localService)
    || voices[0];
}

/** Wait for asynchronously installed browser voices, without choosing another language. */
function waitForVoice(synthesis: SpeechSynthesis, locale: Lang, operation: NarrationOperation) {
  return new Promise<SpeechSynthesisVoice | undefined>(resolve => {
    let finished = false;
    let timeout: number | undefined;
    const finish = (voice?: SpeechSynthesisVoice) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      synthesis.removeEventListener('voiceschanged', check);
      operation.cancelVoiceWait = undefined;
      resolve(voice);
    };
    const check = () => {
      try {
        const voice = matchingVoice(synthesis, locale);
        if (voice) finish(voice);
      } catch { finish(); }
    };
    operation.cancelVoiceWait = () => finish();
    synthesis.addEventListener('voiceschanged', check);
    timeout = window.setTimeout(() => finish(), 2_000);
    check();
  });
}

/** One active chapter per page. A supplied recording takes precedence over device speech. */
export function useTimelineNarration({ chapterId, locale, text, src, onSpeakingChange }: NarrationOptions) {
  const recordingSrc = src?.trim();
  const [status, setStatus] = useState<TimelineNarrationStatus>('idle');
  const [notice, setNotice] = useState<TimelineNarrationNotice>(null);
  const mounted = useRef(false);
  const statusRef = useRef<TimelineNarrationStatus>('idle');
  const speaking = useRef(false);
  const speakingCallback = useRef(onSpeakingChange);
  const generation = useRef(0);
  const operation = useRef<NarrationOperation | null>(null);

  useEffect(() => { speakingCallback.current = onSpeakingChange; }, [onSpeakingChange]);

  const reportSpeaking = useCallback((value: boolean) => {
    if (speaking.current === value) return;
    speaking.current = value;
    speakingCallback.current(value);
  }, []);

  const updateStatus = useCallback((value: TimelineNarrationStatus) => {
    statusRef.current = value;
    if (mounted.current) setStatus(value);
  }, []);

  const release = useCallback(() => {
    const current = operation.current;
    operation.current = null;
    generation.current++;
    if (current) {
      current.cancelVoiceWait?.();
      current.cancelPlaybackWait?.();
      window.clearTimeout(current.startTimer);
      if (current.audio) {
        const audio = current.audio;
        audio.onplaying = audio.onpause = audio.onended = audio.onerror = null;
        try {
          audio.pause();
          audio.removeAttribute('src');
          audio.load();
        } catch { /* Cleanup must still release the background-music gate. */ }
      }
      if (current.utterance) {
        const utterance = current.utterance;
        utterance.onstart = utterance.onend = utterance.onerror = utterance.onpause = utterance.onresume = null;
        try { current.synthesis?.cancel(); } catch { /* The engine may already be disposed. */ }
      }
    }
    reportSpeaking(false);
  }, [reportSpeaking]);

  const stop = useCallback(() => {
    release();
    updateStatus('idle');
    if (mounted.current) setNotice(null);
  }, [release, updateStatus]);

  useEffect(() => {
    mounted.current = true;
    updateStatus('idle');
    setNotice(null);
    return () => {
      mounted.current = false;
      release();
    };
  }, [chapterId, locale, text, recordingSrc, release, updateStatus]);

  const pause = useCallback(() => {
    const current = operation.current;
    if (!current || !['loading', 'playing'].includes(statusRef.current)) return;
    current.playAttempt++;
    current.cancelPlaybackWait?.();
    window.clearTimeout(current.startTimer);
    try {
      if (current.audio) current.audio.pause();
      else if (current.utterance) current.synthesis?.pause();
      else release(); // Voice discovery has no playback position to retain.
    } catch {
      release();
      updateStatus('error');
      if (mounted.current) setNotice('playbackFailed');
      return;
    }
    reportSpeaking(false);
    updateStatus('paused');
  }, [release, reportSpeaking, updateStatus]);

  const play = useCallback(async () => {
    if (!mounted.current || statusRef.current === 'playing' || statusRef.current === 'loading') return;
    let current = operation.current;
    const resuming = statusRef.current === 'paused' && !!current;
    if (!resuming) {
      release();
      current = { generation: ++generation.current, playAttempt: 0, started: false };
      operation.current = current;
    }
    const request = current!;
    const isCurrent = () => mounted.current && operation.current === request && generation.current === request.generation;
    const fail = (reason: Exclude<TimelineNarrationNotice, null>) => {
      if (!isCurrent()) return;
      release();
      updateStatus('error');
      setNotice(reason);
    };
    const finish = () => {
      if (!isCurrent()) return;
      release();
      updateStatus('idle');
      setNotice(null);
    };
    const started = () => {
      if (!isCurrent() || statusRef.current === 'paused') return;
      window.clearTimeout(request.startTimer);
      request.started = true;
      updateStatus('playing');
    };
    const watchSpeechStart = () => {
      window.clearTimeout(request.startTimer);
      request.startTimer = window.setTimeout(() => fail('playbackFailed'), 8_000);
    };
    setNotice(null);
    reportSpeaking(true); // App pauses the music during voice discovery and recording loading too.
    updateStatus('loading');

    if (recordingSrc) {
      try {
        if (!request.audio) {
          const audio = new Audio(recordingSrc);
          request.audio = audio;
          audio.preload = 'metadata';
          audio.onplaying = started;
          audio.onended = finish;
          audio.onerror = () => fail('playbackFailed');
          audio.onpause = () => {
            if (!isCurrent() || !audio.paused || audio.ended || statusRef.current === 'idle' || statusRef.current === 'error') return;
            request.cancelPlaybackWait?.();
            window.clearTimeout(request.startTimer);
            reportSpeaking(false);
            updateStatus('paused');
          };
        }
        const attempt = ++request.playAttempt;
        request.startTimer = window.setTimeout(() => fail('playbackFailed'), 15_000);
        let cancelWait!: () => void;
        const cancelled = new Promise<void>(resolve => { cancelWait = resolve; });
        request.cancelPlaybackWait = cancelWait;
        const playback = request.audio.play().catch(() => {
          if (isCurrent() && request.playAttempt === attempt) fail('playbackFailed');
        });
        await Promise.race([playback, cancelled]);
        if (request.cancelPlaybackWait === cancelWait) request.cancelPlaybackWait = undefined;
      } catch { fail('playbackFailed'); }
      return;
    }

    const synthesis = window.speechSynthesis;
    if (!synthesis || typeof window.SpeechSynthesisUtterance !== 'function' || !text.trim()) {
      fail('voiceUnavailable');
      return;
    }
    if (resuming && request.utterance) {
      try {
        synthesis.resume();
        if (request.started) updateStatus('playing');
        else watchSpeechStart();
      } catch { fail('playbackFailed'); }
      return;
    }

    try {
      const voice = await waitForVoice(synthesis, locale, request);
      if (!isCurrent()) return;
      if (!voice) { fail('voiceUnavailable'); return; }
      const utterance = new SpeechSynthesisUtterance(text.trim());
      request.synthesis = synthesis;
      request.utterance = utterance;
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = 0.92;
      utterance.onstart = started;
      utterance.onend = finish;
      utterance.onerror = event => {
        if (event.error === 'canceled' || event.error === 'interrupted') finish();
        else fail('playbackFailed');
      };
      utterance.onpause = () => {
        if (!isCurrent() || !synthesis.paused) return;
        window.clearTimeout(request.startTimer);
        reportSpeaking(false);
        updateStatus('paused');
      };
      utterance.onresume = () => {
        if (!isCurrent() || synthesis.paused) return;
        window.clearTimeout(request.startTimer);
        request.started = true;
        reportSpeaking(true);
        updateStatus('playing');
      };
      synthesis.cancel();
      synthesis.resume(); // Clear a prior native paused state before queueing a new chapter.
      watchSpeechStart();
      synthesis.speak(utterance);
    } catch { fail('playbackFailed'); }
  }, [locale, text, recordingSrc, release, reportSpeaking, updateStatus]);

  return { status, notice, source: recordingSrc ? 'recording' as const : 'speech' as const, play, pause, stop };
}
