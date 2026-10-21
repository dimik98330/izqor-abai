const strings = {
  ru: {
    skip:'К содержанию', prototype:'Дизайн-концепция · фрагмент главной', original:'Сравнить с текущим сайтом', navigation:'Навигация', menu:'Открыть меню', journey:'Путешествие', map:'Карта', places:'Места и истории', timeline:'Линия времени',
    title:'История становится ближе, когда видишь её место.', intro:'Откройте панораму, найдите деталь, задайте вопрос и проследите источник. У каждого путешествия свой темп.', semey:'Семей', museum:'Музей «Алаш арыстары»', photoAlt:'Музей «Алаш арыстары» в Семее', expand:'Рассмотреть фотографию', credit:'Фото: Ерден Карсыбеков, 2022 · CC BY-SA 4.0',
    memoryTitle:'У каждого места есть голос.', memoryIntro:'Вспомните место, которое важно для вас. Запишите свою историю и сохраните её на своём устройстве.', privacy:'Только для вас. Без отправки и публикации.', yourStory:'Ваше воспоминание', record:'Записать воспоминание',
    footer:'Путешествие по истории и культуре области Абай. Реальные места, открытые источники, живой интерес.', region:'Область Абай, Казахстан', footerNote:'У этой земли есть память.', designNotes:'О макете и референсах', photoDialog:'Фотография музея', closePhoto:'Закрыть фотографию',
    demoNote:'Демонстрация интерфейса. Микрофон не включается, звук не записывается.', placeLabel:'Какое место вы вспоминаете?', placePlaceholder:'Например, дом в Семее', try:'Посмотреть анимацию записи', stop:'Остановить демонстрацию', close:'Закрыть', playing:'Идёт демонстрация анимации. Звук не записывается.', stopped:'Демонстрация завершена. Аудиозапись не создавалась.'
  },
  kk: {
    skip:'Мазмұнға өту', prototype:'Дизайн тұжырымдамасы · басты бет бөлігі', original:'Қазіргі сайтпен салыстыру', navigation:'Навигация', menu:'Мәзірді ашу', journey:'Саяхат', map:'Карта', places:'Мекендер мен тарих', timeline:'Уақыт желісі',
    title:'Тарих мекенін көргенде жақындай түседі.', intro:'Панораманы ашып, бөлшек тауып, сұрақ қойып, дереккөзді қараңыз. Әр саяхаттың өз қарқыны бар.', semey:'Семей', museum:'«Алаш арыстары» музейі', photoAlt:'Семейдегі «Алаш арыстары» музейі', expand:'Фотосуретті қарау', credit:'Фото: Ерден Қарсыбеков, 2022 · CC BY-SA 4.0',
    memoryTitle:'Әр мекеннің өз үні бар.', memoryIntro:'Өзіңіз үшін маңызды мекенді еске түсіріңіз. Өз тарихыңызды жазып, құрылғыңызда сақтаңыз.', privacy:'Тек өзіңіз үшін. Жіберілмейді және жарияланбайды.', yourStory:'Сіздің естелігіңіз', record:'Естелік жазу',
    footer:'Абай облысының тарихы мен мәдениетіне саяхат. Шынайы мекендер, ашық дереккөздер, жанды қызығушылық.', region:'Абай облысы, Қазақстан', footerNote:'Бұл өлкенің жады бар.', designNotes:'Макет пен үлгілер туралы', photoDialog:'Музейдің фотосуреті', closePhoto:'Фотосуретті жабу',
    demoNote:'Интерфейсті көрсету. Микрофон қосылмайды, дыбыс жазылмайды.', placeLabel:'Қай мекенді еске түсірдіңіз?', placePlaceholder:'Мысалы, Семейдегі үй', try:'Жазу анимациясын көру', stop:'Көрсетуді тоқтату', close:'Жабу', playing:'Анимация көрсетіліп жатыр. Дыбыс жазылмайды.', stopped:'Көрсету аяқталды. Аудиожазба жасалған жоқ.'
  },
  en: {
    skip:'Skip to content', prototype:'Design concept · home page fragment', original:'Compare with the current site', navigation:'Navigation', menu:'Open menu', journey:'Journey', map:'Map', places:'Places & stories', timeline:'Timeline',
    title:'History comes closer when you see its place.', intro:'Enter a panorama, notice a detail, ask a question and follow a source. Every journey has its own pace.', semey:'Semey', museum:'Alash Arystary Museum', photoAlt:'The Alash Arystary museum in Semey', expand:'View the photograph', credit:'Photo: Erden Karsybekov, 2022 · CC BY-SA 4.0',
    memoryTitle:'Every place has a voice.', memoryIntro:'Remember a place that matters to you. Record your story and keep it on your own device.', privacy:'Just for you. Never uploaded or published.', yourStory:'Your memory', record:'Record a memory',
    footer:'A journey through the history and culture of Abai Region. Real places, open sources, living curiosity.', region:'Abai Region, Kazakhstan', footerNote:'This land holds memories.', designNotes:'Design notes & references', photoDialog:'Museum photograph', closePhoto:'Close photograph',
    demoNote:'Interface demo. The microphone stays off and no sound is recorded.', placeLabel:'Which place do you remember?', placePlaceholder:'For example, a house in Semey', try:'Preview the recording animation', stop:'Stop the demo', close:'Close', playing:'Previewing the animation. No audio is being recorded.', stopped:'Demo complete. No audio recording was created.'
  }
};
let lang = 'ru';
let playing = false;
let elapsed = 0;
let timer;
const panel = document.querySelector('.voice-panel');
const record = document.querySelector('#record-button');
const demo = document.querySelector('#record-demo');
const start = document.querySelector('.demo-start');
const status = document.querySelector('#record-status');
const clock = document.querySelector('.voice-clock');
const photo = document.querySelector('.photo-dialog');
const menu = document.querySelector('.menu-button');
const mobile = document.querySelector('#mobile-menu');
const heights = [8,12,20,31,18,11,24,43,58,38,26,14,28,48,33,64,45,27,37,56,42,23,11,20,35,51,32,19,28,44,30,16,10,22,34,19,11,7];
heights.forEach((height, index) => {
  const bar = document.createElement('i');
  bar.style.setProperty('--height', height + 'px');
  bar.style.setProperty('--opacity', String(.5 + height / 128));
  bar.style.setProperty('--delay', (index % 7) * -90 + 'ms');
  document.querySelector('.waveform').append(bar);
});

function translate(next) {
  lang = next;
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = strings[lang][element.dataset.i18n]; });
  [['data-label-i18n','aria-label'],['data-alt-i18n','alt'],['data-placeholder-i18n','placeholder']].forEach(([source,target]) => {
    document.querySelectorAll('[' + source + ']').forEach(element => element.setAttribute(target, strings[lang][element.getAttribute(source)]));
  });
  document.querySelectorAll('[data-lang]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === lang)));
  start.textContent = strings[lang][playing ? 'stop' : 'try'];
  if (status.textContent) status.textContent = strings[lang][playing ? 'playing' : 'stopped'];
}
document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => translate(button.dataset.lang)));

function stop() {
  playing = false;
  clearInterval(timer);
  panel.classList.remove('is-playing');
  start.textContent = strings[lang].try;
}
record.addEventListener('click', () => {
  demo.hidden = !demo.hidden;
  record.setAttribute('aria-expanded', String(!demo.hidden));
  if (demo.hidden) stop();
  else document.querySelector('#memory-place').focus({preventScroll:true});
});
start.addEventListener('click', () => {
  if (playing) { stop(); status.textContent = strings[lang].stopped; return; }
  playing = true;
  elapsed = 0;
  clock.textContent = '00:00';
  panel.classList.add('is-playing');
  start.textContent = strings[lang].stop;
  status.textContent = strings[lang].playing;
  timer = setInterval(() => {
    elapsed++;
    clock.textContent = String(Math.floor(elapsed / 60)).padStart(2,'0') + ':' + String(elapsed % 60).padStart(2,'0');
    if (elapsed >= 30) { stop(); status.textContent = strings[lang].stopped; }
  },1000);
});
document.querySelector('.demo-close').addEventListener('click', () => {
  stop(); demo.hidden = true; record.setAttribute('aria-expanded','false'); record.focus({preventScroll:true});
});
menu.addEventListener('click', () => { mobile.hidden = !mobile.hidden; menu.setAttribute('aria-expanded', String(!mobile.hidden)); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobile.hidden) { mobile.hidden = true; menu.setAttribute('aria-expanded','false'); menu.focus(); }
});
document.querySelector('.expand-photo').addEventListener('click', () => photo.showModal());
document.querySelector('.close-photo').addEventListener('click', () => photo.close());
photo.addEventListener('click', event => { if (event.target === photo && (event.clientX < photo.getBoundingClientRect().left || event.clientX > photo.getBoundingClientRect().right || event.clientY < photo.getBoundingClientRect().top || event.clientY > photo.getBoundingClientRect().bottom)) photo.close(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && playing) { stop(); status.textContent = strings[lang].stopped; } });
