import { L, type LocalText } from './i18n.ts';

export interface TimelineCulture {
  kind: 'literature' | 'music' | 'document' | 'memory';
  eyebrow: LocalText;
  title: LocalText;
  date: LocalText;
  description: LocalText;
  interestingFact: LocalText;
  source: { title: LocalText; url: string; organization: string };
}

// Related works retain their own dates: they are not all contemporary with the chapter event.
export const timelineCulture: Record<string, TimelineCulture> = {
  khanate: {
    kind: 'music',
    eyebrow: L('Музыкальная память степи', 'Даланың музыкалық жады', 'The steppe’s musical memory'),
    title: L('История, которую рассказывают две струны', 'Екі ішек жеткізген тарих', 'Stories told by two strings'),
    date: L('Сквозь эпохи · признание ЮНЕСКО, 2014', 'Дәуірлер жалғастығы · ЮНЕСКО, 2014', 'Across the centuries · UNESCO recognition, 2014'),
    description: L(
      'Кюй — инструментальный рассказ на домбре: через мелодию исполнитель передаёт настроение и память. Эта живая традиция помогает почувствовать культуру степи через звук. Она продолжалась и менялась в разные эпохи; её нельзя свести к одной дате основания ханства.',
      'Күй — домбырамен айтылатын аспаптық әңгіме: орындаушы әуен арқылы көңіл күй мен жадты жеткізеді. Бұл тірі дәстүр дала мәдениетін дыбыс арқылы сезінуге мүмкіндік береді. Ол түрлі дәуірде жалғасып, өзгеріп отырған; оны хандық құрылған бір жылмен шектеуге болмайды.',
      'A kuy is an instrumental story played on the dombra, conveying mood and memory through melody. This living tradition offers a way to hear steppe culture. It continued and changed across many eras, rather than belonging to a single year when the khanate was founded.',
    ),
    interestingFact: L(
      'У домбры две струны. Искусство исполнения кюя вошло в Репрезентативный список ЮНЕСКО в 2014 году.',
      'Домбырада екі ішек бар. Домбыра күйін орындау өнері 2014 жылы ЮНЕСКО-ның Репрезентативтік тізіміне енді.',
      'The dombra has two strings. The art of dombra kuy entered UNESCO’s Representative List in 2014.',
    ),
    source: {
      title: L('Искусство исполнения кюя на домбре', 'Домбыра күйін орындау өнері', 'The art of performing kuy on the dombra'),
      url: 'https://nmrk.kz/en/structure/scientific-activity/national-list/633/',
      organization: 'Национальный музей Республики Казахстан',
    },
  },
  education: {
    kind: 'literature',
    eyebrow: L('Литература · продолжение темы', 'Әдебиет · тақырып жалғасы', 'Literature · a later reflection'),
    title: L('«Ғылым таппай мақтанба»', '«Ғылым таппай мақтанба»', 'Ghylym tappai maqtanba'),
    date: L('1886 · спустя годы после учёбы', '1886 · оқу жылдарынан кейін', '1886 · written after his school years'),
    description: L(
      'В зрелом стихотворении Абай обращается к молодым людям: знание важно вместе с трудом, размышлением и ответственностью. Произведение написано в 1886 году — значительно позже обучения в Семее. Оно показывает, как тема образования стала одной из главных в его творчестве.',
      'Кемел шағында жазған өлеңінде Абай жастарға білімді еңбекпен, ойланумен және жауапкершілікпен ұштастыруды ұсынады. Шығарма 1886 жылы, Семейдегі оқуынан көп кейін жазылған. Ол білім тақырыбының ақын шығармашылығындағы негізгі арналардың біріне айналғанын көрсетеді.',
      'In this mature poem Abai addresses young people, connecting knowledge with work, reflection and responsibility. Written in 1886, long after his studies in Semey, it shows how education became a central concern of his writing.',
    ),
    interestingFact: L(
      'В стихотворении учёба связана с воспитанием характера: для Абая важно не только знать, но и стать человечнее.',
      'Өлеңде оқу мінез тәрбиесімен сабақтасады: Абай үшін білімді болумен қатар адамгершілікті болу да маңызды.',
      'The poem connects learning with character: knowledge matters alongside becoming a more humane person.',
    ),
    source: {
      title: L('Абай: образование и идея «полного человека»', 'Абай: білім және толық адам ілімі', 'Abai: learning and the idea of the complete person'),
      url: 'https://abaiacademy.kz/kz/abaevedenie/nauka-i-poznanie/abaj',
      organization: 'Абай академиясы · Мекемтас Мырзахметов',
    },
  },
  house: {
    kind: 'music',
    eyebrow: L('Песня и перевод', 'Ән мен аударма', 'Song and translation'),
    title: L('«Қараңғы түнде тау қалғып»', '«Қараңғы түнде тау қалғып»', 'Qaranghy tunde tau qalghyp'),
    date: L('1892 · культурный мир Абая 1890-х', '1892 · 1890-жылдардағы Абай әлемі', '1892 · Abai’s cultural world in the 1890s'),
    description: L(
      'Абай переложил стихотворение Гёте через русский перевод Лермонтова и создал к нему мелодию. Так один поэтический образ соединил три языка. Это произведение 1892 года раскрывает творческий мир десятилетия; оно появилось до покупки дома Анияра и не было написано в нём.',
      'Абай Гетенің өлеңін Лермонтовтың орысша аудармасы арқылы қазақшаға тәржімалап, оған әуен шығарды. Бір поэтикалық бейне осылай үш тілді тоғыстырды. 1892 жылғы шығарма сол онжылдықтың шығармашылық әлемін ашады; ол Әнияр үйді сатып алғанға дейін туған, бұл үйде жазылмаған.',
      'Abai adapted Goethe’s poem through Lermontov’s Russian version and composed a melody for it. One poetic image connected three languages. Created in 1892, it evokes his creative world in that decade; it predates Aniyar’s purchase of the house and was not written there.',
    ),
    interestingFact: L(
      'Произведение впервые напечатали в сборнике Абая, изданном в Санкт-Петербурге в 1909 году, уже после смерти поэта.',
      'Шығарма алғаш ақын қайтыс болғаннан кейін, 1909 жылы Санкт-Петербургте шыққан Абай жинағында жарияланды.',
      'It first appeared in print in Abai’s 1909 collection, published in Saint Petersburg after the poet’s death.',
    ),
    source: {
      title: L('История стихотворения и песни', 'Өлең мен әннің тарихы', 'The history of the poem and song'),
      url: 'https://abaiqunanbaiuly.enu.kz/2020/12/10/%D2%9B%D0%B0%D1%80%D0%B0%D2%A3%D2%93%D1%8B-%D1%82%D2%AF%D0%BD%D0%B4%D0%B5-%D1%82%D0%B0%D1%83-%D2%9B%D0%B0%D0%BB%D2%93%D1%8B%D0%BF/',
      organization: '«Абай» интерактивті кешені · ЕНУ',
    },
  },
  alash: {
    kind: 'literature',
    eyebrow: L('Печатный голос эпохи', 'Дәуірдің баспасөздегі үні', 'The era in print'),
    title: L('Журнал «Абай»', '«Абай» журналы', 'The journal Abai'),
    date: L('1918 · Семей', '1918 · Семей', '1918 · Semey'),
    description: L(
      'Мухтар Ауэзов и Жусипбек Аймауытов стояли у истоков журнала, который начал выходить в Семее в 1918 году. Имя Абая связывало новое издание с наследием поэта. Страницы журнала показывают, что рядом с политическими проектами эпохи шёл разговор о литературе, образовании и культуре.',
      'Мұхтар Әуезов пен Жүсіпбек Аймауытов 1918 жылы Семейде шыға бастаған журналдың негізін қалады. Абай есімі жаңа басылымды ақын мұрасымен байланыстырды. Журнал беттері дәуірдің саяси жобаларымен қатар әдебиет, білім және мәдениет туралы әңгіме жүргенін көрсетеді.',
      'Mukhtar Auezov and Zhusipbek Aimauytov founded the journal that began publication in Semey in 1918. Abai’s name connected it to the poet’s legacy. Its pages show literature, education and culture developing alongside the era’s political projects.',
    ),
    interestingFact: L(
      'История издания продолжилась: журнал возродили в 1992 году, сохранив имя Абая.',
      'Басылым тарихы жалғасты: журнал Абай есімін сақтап, 1992 жылы қайта жаңғырды.',
      'The publication’s story continued: it was revived in 1992, retaining Abai’s name.',
    ),
    source: {
      title: L('«Абай»: запись в библиотечном каталоге', '«Абай»: кітапхана каталогындағы жазба', 'Abai: the library catalogue record'),
      url: 'https://nabrk.kz/e-catalog?brId=1696155&searchType=hierarchy',
      organization: 'Национальная академическая библиотека РК',
    },
  },
  independence: {
    kind: 'document',
    eyebrow: L('Поэт и общественная память', 'Ақын және қоғамдық жад', 'A poet and public memory'),
    title: L('Олжас Сулейменов и «Невада — Семипалатинск»', 'Олжас Сүлейменов және «Невада — Семей»', 'Olzhas Suleimenov and Nevada–Semipalatinsk'),
    date: L('1989–1991 · движение за прекращение испытаний', '1989–1991 · сынақтарды тоқтату қозғалысы', '1989–1991 · a movement to end testing'),
    description: L(
      'Поэт Олжас Сулейменов инициировал антиядерное движение в 1989 году. Митинги, выступления и обращения стали частью борьбы за прекращение испытаний. Семипалатинский полигон закрыли 29 августа 1991 года. Документы движения сохраняют голоса людей, для которых безопасность родной земли стала общим делом.',
      'Ақын Олжас Сүлейменов 1989 жылы антиядролық қозғалысты бастады. Митингтер, сөз сөйлеулер мен үндеулер сынақтарды тоқтату күресінің бір бөлігі болды. Семей полигоны 1991 жылғы 29 тамызда жабылды. Қозғалыс құжаттары туған жердің қауіпсіздігін ортақ іске айналдырған адамдардың үнін сақтайды.',
      'Poet Olzhas Suleimenov initiated the antinuclear movement in 1989. Rallies, speeches and appeals formed part of the campaign to end testing. The Semipalatinsk test site closed on 29 August 1991. The movement’s records preserve the voices of people who made the safety of their homeland a shared cause.',
    ),
    interestingFact: L(
      'Аудиовизуальные документы движения внесли в реестр ЮНЕСКО «Память мира» в 2005 году.',
      'Қозғалыстың аудиовизуалды құжаттары 2005 жылы ЮНЕСКО-ның «Әлем жады» тізіліміне енді.',
      'The movement’s audiovisual records entered UNESCO’s Memory of the World Register in 2005.',
    ),
    source: {
      title: L('Документы движения в «Памяти мира»', '«Әлем жадындағы» қозғалыс құжаттары', 'The movement’s records in Memory of the World'),
      url: 'https://www.unesco.org/en/memory-world/audiovisual-documents-international-antinuclear-movement-nevada-semipalatinsk',
      organization: 'UNESCO · Memory of the World',
    },
  },
  constitution: {
    kind: 'memory',
    eyebrow: L('Культурная память того же года', 'Сол жылдың мәдени жады', 'Cultural memory in the same year'),
    title: L('Мемориал «Абай — Шакарим»', '«Абай — Шәкәрім» мемориалы', 'The Abai–Shakarim Memorial'),
    date: L('1995 · Жидебай · 150-летие Абая', '1995 · Жидебай · Абайдың 150 жылдығы', '1995 · Zhidebay · Abai’s 150th anniversary'),
    description: L(
      'В год принятия Конституции в Жидебае открыли мемориальный комплекс к 150-летию Абая. Его посвятили Абаю и Шакариму. У этого места другая задача, чем у государственного документа: дать поэзии, философии и семейной памяти зримое пространство в степи.',
      'Конституция қабылданған жылы Жидебайда Абайдың 150 жылдығына арналған мемориалдық кешен ашылды. Ол Абай мен Шәкәрімге арналды. Бұл орынның мемлекеттік құжаттан бөлек міндеті бар: далада поэзияға, философияға және әулет жадына көрінетін кеңістік беру.',
      'In the year the Constitution was adopted, a memorial complex opened in Zhidebay for Abai’s 150th anniversary. Dedicated to Abai and Shakarim, it serves a different purpose from a state document: giving poetry, philosophy and family memory a visible place in the steppe.',
    ),
    interestingFact: L(
      'Юбилейный мемориал появился не за один сезон: его строительство началось в марте 1993 года.',
      'Мерейтойлық мемориал бір маусымда салынған жоқ: құрылысы 1993 жылғы наурызда басталды.',
      'The anniversary memorial was years in the making: construction began in March 1993.',
    ),
    source: {
      title: L('Памятники Жидебая и история мемориала', 'Жидебай ескерткіштері және мемориал тарихы', 'Zhidebay’s monuments and the memorial’s history'),
      url: 'https://abai-museum.kz/respwblikanskie-pamyatniki/?lang=ru',
      organization: 'Музей Абая «Жидебай-Бөрілі»',
    },
  },
};
