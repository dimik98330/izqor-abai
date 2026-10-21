/* Runs before the application bundle, including when that bundle cannot load. */
(() => {
  const key = 'izqor.failed-assets';
  let reloading = false;
  const language = (() => {
    try {
      const value = JSON.parse(localStorage.getItem('izqor.language') || '"ru"');
      return ['ru', 'kk', 'en'].includes(value) ? value : 'ru';
    } catch { return 'ru'; }
  })();
  const messages = {
    ru: ['Не удалось загрузить приложение. Обновите страницу.', 'Обновить страницу'],
    kk: ['Қолданба жүктелмеді. Бетті жаңартыңыз.', 'Бетті жаңарту'],
    en: ['The application could not load. Refresh the page.', 'Refresh page'],
  };
  function showFailure() {
    const message = document.getElementById('startup-message');
    if (!message) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showFailure, { once: true });
      return;
    }
    message.textContent = messages[language][0];
    message.setAttribute('role', 'alert');
    const button = document.getElementById('startup-reload');
    if (button) button.textContent = messages[language][1];
  }
  function recover(id, event) {
    // One automatic attempt per failed resource in this tab. A persistent
    // outage must show a recovery action rather than repeatedly reloading.
    if (!reloading) {
      try {
        const attempts = JSON.parse(sessionStorage.getItem(key) || '[]');
        if (Array.isArray(attempts) && !attempts.includes(id)) {
          sessionStorage.setItem(key, JSON.stringify([...attempts, id]));
          reloading = true;
          event.preventDefault();
          window.location.reload();
          return;
        }
      } catch { /* Without storage, automatic reload cannot be bounded. */ }
    }
    showFailure();
    // Let a rejected lazy import reach React's error boundary on failure.
  }
  window.addEventListener('vite:preloadError', event => {
    recover('preload:' + String(event.payload?.message || event.payload || 'module'), event);
  });
  window.addEventListener('error', event => {
    const script = event.target;
    if (script?.tagName === 'SCRIPT' && script.type === 'module' && script.src?.startsWith(window.location.origin + '/')) {
      recover('entry:' + script.src, event);
    }
  }, true);
})();
