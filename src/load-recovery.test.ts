import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect, it, vi } from 'vitest';

const script = readFileSync(new URL('../public/load-recovery.js', import.meta.url), 'utf8');

function boot(storage = new Map<string, string>(), denyStorage = false) {
  const handlers = new Map<string, (event: any) => void>();
  const message = { textContent: 'Loading', setAttribute: vi.fn() };
  const button = { textContent: 'Refresh' };
  const reload = vi.fn();
  runInNewContext(script, {
    window: { location: { reload, origin: 'http://127.0.0.1:4173' }, addEventListener: (name: string, handler: (event: any) => void) => handlers.set(name, handler) },
    document: { readyState: 'complete', getElementById: (id: string) => id === 'startup-message' ? message : button },
    localStorage: { getItem: () => '"ru"' },
    sessionStorage: {
      getItem: (key: string) => { if (denyStorage) throw new Error('Storage denied'); return storage.get(key) || null; },
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  });
  function preload(asset = 'Atlas-old.js') {
    const event = { payload: new Error('Failed to fetch dynamically imported module: /assets/' + asset), preventDefault: vi.fn() };
    handlers.get('vite:preloadError')!(event);
    return event;
  }
  return { preload, reload, handlers, message, storage };
}

it('reloads an obsolete lazy module once and persists the attempt across navigation', () => {
  const first = boot();
  expect(first.preload().preventDefault).toHaveBeenCalledOnce();
  expect(first.reload).toHaveBeenCalledOnce();

  const second = boot(first.storage);
  expect(second.preload().preventDefault).not.toHaveBeenCalled();
  expect(second.reload).not.toHaveBeenCalled();
  expect(second.message.textContent).toContain('Не удалось загрузить');
  expect(second.message.setAttribute).toHaveBeenCalledWith('role', 'alert');
});

it('allows recovery for a different asset from a later build', () => {
  const first = boot(); first.preload();
  const nextBuild = boot(first.storage); nextBuild.preload('Atlas-new.js');
  expect(nextBuild.reload).toHaveBeenCalledOnce();
});

it('does not issue several reloads when resources fail together', () => {
  const app = boot();
  app.preload('Atlas.js'); app.preload('Atlas.css');
  expect(app.reload).toHaveBeenCalledOnce();
});

it('shows a manual recovery action if session storage is unavailable', () => {
  const app = boot(new Map(), true);
  expect(app.preload().preventDefault).not.toHaveBeenCalled();
  expect(app.reload).not.toHaveBeenCalled();
  expect(app.message.textContent).toContain('Обновите страницу');
});

it('recovers an initial entry script failure before React starts', () => {
  const app = boot();
  app.handlers.get('error')!({ target: { tagName: 'SCRIPT', type: 'module', src: 'http://127.0.0.1:4173/assets/index-old.js' }, preventDefault: vi.fn() });
  expect(app.reload).toHaveBeenCalledOnce();
  const next = boot(app.storage);
  next.handlers.get('error')!({ target: { tagName: 'SCRIPT', type: 'module', src: 'http://127.0.0.1:4173/assets/index-old.js' }, preventDefault: vi.fn() });
  expect(next.reload).not.toHaveBeenCalled();
  expect(next.message.textContent).toContain('Не удалось загрузить');
});

it('ignores image, non-module and external script failures', () => {
  const app = boot();
  app.handlers.get('error')!({ target: { tagName: 'IMG', src: '/photo.jpg' }, preventDefault: vi.fn() });
  app.handlers.get('error')!({ target: { tagName: 'SCRIPT', type: '', src: '/other.js' }, preventDefault: vi.fn() });
  app.handlers.get('error')!({ target: { tagName: 'SCRIPT', type: 'module', src: 'https://external.example/other.js' }, preventDefault: vi.fn() });
  expect(app.reload).not.toHaveBeenCalled();
});

it('treats a malformed retry registry as manual recovery', () => {
  const app = boot(new Map([['izqor.failed-assets', 'null']]));
  app.preload();
  expect(app.reload).not.toHaveBeenCalled();
  expect(app.message.textContent).toContain('Не удалось загрузить');
});
