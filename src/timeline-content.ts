import { L, type LocalText } from './i18n.ts';

export interface TimelineEra {
  id: string;
  year: string;
  shortTitle: LocalText;
  title: LocalText;
  subtitle: LocalText;
  paragraphs: LocalText[];
  facts: { label: LocalText; value: LocalText }[];
  connection: LocalText;
  sources: { title: LocalText; organization: string; url: string }[];
  placeId: string | null;
}

export const timelineEras: TimelineEra[] = [
  {
    id: 'khanate',
    year: '1465–1466',
    shortTitle: L('Казахское ханство', 'Қазақ хандығы', 'The Kazakh Khanate'),
    title: L('Начало Казахского ханства', 'Қазақ хандығының бастауы', 'The beginnings of the Kazakh Khanate'),
    subtitle: L('Керей, Жанибек и объединение степи', 'Керей, Жәнібек және даланың бірігуі', 'Kerey, Zhanibek and a steppe coming together'),
    paragraphs: [
      L(
        'В середине XV века султаны Керей и Жанибек вместе с поддержавшими их родами покинули владения Абулхаир-хана. Они направились в западное Жетысу, где правитель Моголистана Есен-Буга предоставил им земли. Долины Чу и Таласа стали первоначальным пространством нового ханства. Вокруг султанов объединялись переселенцы и местные племена, связанные общими интересами и образом жизни.',
        'XV ғасырдың ортасында Керей мен Жәнібек сұлтандар өздерін қолдаған рулармен бірге Әбілқайыр ханның иелігінен көшті. Олар батыс Жетісуға бет алды. Моғолстан билеушісі Есен-Бұға оларға жер берді. Шу мен Талас аңғарлары жаңа хандықтың алғашқы аумағына айналды. Ортақ мүдде мен тұрмыс салты жақындастырған қоныс аударушылар мен жергілікті тайпалар сұлтандардың төңірегіне топтасты.',
        'In the mid-fifteenth century, the sultans Kerey and Zhanibek left Abulkhair Khan’s realm with the clans that supported them. They moved to western Zhetysu, where Esen Buqa, ruler of Moghulistan, granted them land. The Chu and Talas valleys became the new khanate’s initial territory. Migrants and local tribes gathered around the sultans, united by shared interests and ways of life.',
      ),
      L(
        'Образование государства было длительным процессом. Степным скотоводам требовались пастбища и доступ к рынкам, городам — обмен с кочевыми районами. Поэтому дальнейшая борьба за города Сырдарьи имела и хозяйственное значение. В последующие десятилетия ханство укреплялось и расширялось: в его состав вошли Сузак, Сыгнак, Сауран и новые степные территории. Политическая история здесь тесно связана с торговлей и повседневной жизнью.',
        'Мемлекеттің қалыптасуы ұзақ үдеріс болды. Дала малшыларына жайылым мен базар қажет болса, қалалар көшпелі аймақтармен тауар алмасуға мүдделі еді. Сондықтан Сырдария бойындағы қалалар үшін күрестің шаруашылық маңызы да зор болды. Кейінгі онжылдықтарда хандық нығайып, кеңейді: оның құрамына Созақ, Сығанақ, Сауран және жаңа далалық аумақтар қосылды. Мұнда саяси тарих саудамен және күнделікті тіршілікпен тығыз байланысады.',
        'State formation took time. Pastoral communities needed grazing land and access to markets, while towns depended on exchange with the steppe. The later struggle for cities along the Syr Darya therefore had an economic dimension. Over the following decades the khanate strengthened and expanded, incorporating Suzak, Sygnak, Sauran and further steppe territories. Its political history was closely tied to trade and everyday life.',
      ),
      L(
        'Даты 1465–1466 связаны с сообщением историка Мухаммада Хайдара Дулати, который указал 870 год хиджры. Этот рубеж помогает увидеть начало самостоятельного политического объединения, а не представить всю историю одним днём. Ханство возникло далеко от современного Семея, но стало важной частью общего исторического пространства, в котором позднее развивались культура и литература казахской степи.',
        '1465–1466 жылдар тарихшы Мұхаммед Хайдар Дулатидің хижраның 870 жылын көрсеткен дерегіне негізделеді. Бұл белес бүкіл тарихты бір күнге сыйғызбай, дербес саяси бірлестіктің бастауын түсінуге мүмкіндік береді. Хандық қазіргі Семейден алыста құрылды. Алайда ол кейін қазақ даласының мәдениеті мен әдебиеті дамыған ортақ тарихи кеңістіктің маңызды бөлігіне айналды.',
        'The dates 1465–1466 follow the historian Muhammad Haydar Dulati’s reference to the year 870 of the Hijri calendar. They mark the beginnings of an independent political union rather than a transformation completed in one day. The khanate emerged far from modern Semey, but became an important part of the wider historical world in which Kazakh steppe culture and literature later developed.',
      ),
    ],
    facts: [
      { label: L('Основатели', 'Негізін қалаушылар', 'Founders'), value: L('Керей и Жанибек', 'Керей мен Жәнібек', 'Kerey and Zhanibek') },
      { label: L('Первые земли', 'Алғашқы аумағы', 'Early territory'), value: L('Долины Чу и Таласа', 'Шу мен Талас аңғарлары', 'The Chu and Talas valleys') },
      { label: L('Историческая датировка', 'Тарихи мерзім', 'Historical dating'), value: L('870 год хиджры', 'Хижраның 870 жылы', '870 AH') },
    ],
    connection: L('Отсюда начинается широкий исторический контекст путешествия по земле Абая.', 'Абай өлкесіне саяхаттың кең тарихи аясы осы кезеңнен басталады.', 'This is the wider historical starting point for a journey through Abai’s homeland.'),
    sources: [
      { title: L('Образование Казахского ханства', 'Қазақ хандығының құрылуы', 'The formation of the Kazakh Khanate'), organization: 'E-history.kz', url: 'https://e-history.kz/ru/amp/history-of-kazakhstan/show/9173' },
      { title: L('Султаны Керей и Жаныбек', 'Керей мен Жәнібек сұлтандар', 'The sultans Kerey and Zhanibek'), organization: 'E-history.kz', url: 'https://e-history.kz/media/scorm/89/text/text.htm' },
    ],
    placeId: null,
  },
  {
    id: 'education',
    year: '1855–1859',
    shortTitle: L('Абай и образование', 'Абай және білім', 'Abai and learning'),
    title: L('Семей открывает Абаю мир', 'Семей Абайға әлемді танытты', 'Semey opens a world to Abai'),
    subtitle: L('Медресе, книги и первые шаги к большой литературе', 'Медресе, кітаптар және үлкен әдебиетке алғашқы қадам', 'A madrasa, books and the beginnings of a literary life'),
    paragraphs: [
      L(
        'Получив первые знания в родном ауле, юный Абай продолжил обучение в Семипалатинске, нынешнем Семее. Музей Абая относит его учёбу в медресе Ахмета Ризы к 1855–1859 годам. Городская школа стала важным этапом между детством в степи и будущей жизнью поэта, переводчика и мыслителя. Здесь рядом с устной традицией, знакомой ему с ранних лет, открывался мир письменных текстов.',
        'Алғашқы білімін туған ауылында алған жас Абай оқуын Семейде жалғастырды. Абай музейі оның Ахмет Риза медресесінде оқыған кезеңін 1855–1859 жылдармен белгілейді. Қаладағы оқу далада өткен балалық шағы мен болашақ ақын, аудармашы, ойшыл өмірін жалғаған маңызды белес болды. Бала кезінен таныс ауыз әдебиетімен қатар, жазба мәтіндер әлемі ашылды.',
        'After his first lessons in his home village, the young Abai continued his education in Semipalatinsk, now Semey. The Abai Museum dates his studies at the Akhmet Riza madrasa to 1855–1859. School in the city formed a bridge between his steppe childhood and his future as a poet, translator and thinker. Alongside the oral traditions he had known from childhood, a world of written texts opened up.',
      ),
      L(
        'Абай знакомился с арабскими текстами и восточной классической литературой. Одновременно он посещал русскую приходскую школу, чтобы изучать русский язык. Эти направления не существовали для него отдельно: интерес к разным языкам расширял круг чтения и помогал искать собственные ответы. После возвращения из медресе он продолжал учиться самостоятельно. Стремление к знанию стало одной из устойчивых тем его зрелого творчества.',
        'Абай арабша мәтіндермен және Шығыстың классикалық әдебиетімен танысты. Сонымен бірге орыс тілін үйрену үшін приход мектебіне барды. Бұл бағыттар ол үшін бір-бірінен бөлек болған жоқ: әртүрлі тілге қызығушылық оқитын кітаптарының аясын кеңейтіп, өз жауабын іздеуге көмектесті. Медреседен оралғаннан кейін де өздігінен білім алуын жалғастырды. Білімге ұмтылу оның кемел шығармашылығының тұрақты тақырыптарының біріне айналды.',
        'Abai encountered Arabic texts and the classics of Eastern literature. He also attended a Russian parish school to learn the language. These interests were connected: learning across languages widened his reading and encouraged him to seek his own answers. After leaving the madrasa he continued to educate himself. The pursuit of knowledge became a recurring concern in his mature writing.',
      ),
      L(
        'Деревянные здания мечети и медресе сохранили память об этом периоде, хотя их окружение изменилось. В 1992–1993 годах комплекс перенесли и восстановили рядом с музеем Абая; позднее проводились новые реставрации. Посещение медресе позволяет связать биографию с конкретным пространством. За именем классика становится легче увидеть любознательного ученика, который осваивал новые книги, языки и способы понимать мир.',
        'Мешіт пен медресенің ағаш ғимараттары айналасы өзгерсе де, осы кезеңнің жадын сақтады. 1992–1993 жылдары кешен көшіріліп, Абай музейінің жанында қайта қалпына келтірілді; кейін де реставрация жүргізілді. Медресеге бару ақынның өмірбаянын нақты мекенмен байланыстырады. Классиктің есімінің ар жағынан жаңа кітаптарды, тілдерді және әлемді түсіну жолдарын меңгерген зерек шәкіртті көруге болады.',
        'The wooden mosque and madrasa buildings preserve the memory of this period, although their surroundings have changed. In 1992–1993 the complex was relocated and restored beside the Abai Museum, with further restoration later. Visiting the madrasa connects a biography to a physical place. Behind the famous name, it becomes easier to see an inquisitive student discovering new books, languages and ways of understanding the world.',
      ),
    ],
    facts: [
      { label: L('Место учёбы', 'Оқу орны', 'Place of study'), value: L('Медресе Ахмета Ризы', 'Ахмет Риза медресесі', 'Akhmet Riza madrasa') },
      { label: L('Город', 'Қала', 'City'), value: L('Семипалатинск — Семей', 'Семей', 'Semipalatinsk — Semey') },
      { label: L('Круг чтения', 'Оқыған әдебиеті', 'Literary encounters'), value: L('Восточная классика', 'Шығыс классикасы', 'Eastern classics') },
    ],
    connection: L('Медресе связывает Семей с началом интеллектуального пути Абая.', 'Медресе Семейді Абайдың рухани ізденісінің бастауымен байланыстырады.', 'The madrasa connects Semey with the beginnings of Abai’s intellectual journey.'),
    sources: [
      { title: L('Мечеть-медресе Ахмета Ризы', 'Ахмет Риза мешіт-медресесі', 'The Akhmet Riza mosque and madrasa'), organization: 'Музей Абая «Жидебай-Бөрілі»', url: 'https://abai-museum.kz/respwblikanskie-pamyatniki/?lang=ru' },
      { title: L('Образование и философия Абая', 'Абайдың білімі мен философиясы', 'The Priceless Philosophy of Abai'), organization: 'E-history.kz', url: 'https://e-history.kz/en/news/show/7644' },
    ],
    placeId: 'semey',
  },
  {
    id: 'house',
    year: '1898',
    shortTitle: L('Дом Анияра', 'Әниярдың үйі', 'Aniyar’s house'),
    title: L('Дом, где останавливался Абай', 'Абай тоқтаған үй', 'A house that welcomed Abai'),
    subtitle: L('Один городской адрес — несколько поколений культуры', 'Бір қала мекенжайы — мәдениеттің бірнеше буыны', 'One city address, several generations of culture'),
    paragraphs: [
      L(
        'В 1898 году Анияр Молдабаев приобрёл у купца Москвина двухэтажный дом в Семипалатинске. Покупка состоялась при финансовой поддержке Абая. Анияр был его современником и учеником, поэтому история здания начинается с личной связи между людьми. Для поэта здесь выделили комнату на втором этаже: приезжая в город, он останавливался в этом доме. Так обычный городской адрес вошёл в его биографию.',
        '1898 жылы Әнияр Молдабаев Семейдегі екі қабатты үйді көпес Москвиннен сатып алды. Үйді алуға Абай қаржылай көмектесті. Әнияр оның замандасы әрі шәкірті болғандықтан, ғимараттың тарихы адамдар арасындағы жақын байланыстан басталады. Ақынға екінші қабаттан арнайы бөлме бөлінді: қалаға келгенде ол осы үйге тоқтайтын. Осылайша қарапайым қала мекенжайы оның өмірбаянына енді.',
        'In 1898 Aniyar Moldabayev bought a two-storey house in Semipalatinsk from the merchant Moskvin, with financial support from Abai. Aniyar was a contemporary and pupil of the poet, so the building’s story begins with a personal relationship. A room on the upper floor was reserved for Abai, who stayed here on visits to the city. An ordinary urban address became part of his biography.',
      ),
      L(
        'В доме бывали сыновья Абая, Шакарим Кудайбердыулы и Кокбай Жанатайулы. Эти имена показывают, как тесно были связаны семья, дружба и литературная среда. Само здание тоже хранит характер старого города: первый этаж кирпичный, второй — деревянный. На фотографии хорошо видны разные материалы и пропорции этажей. Небольшой особняк помогает представить повседневный масштаб этой истории — комнаты, гостеприимство, приезды и встречи.',
        'Бұл үйге Абайдың ұлдары, Шәкәрім Құдайбердіұлы және Көкбай Жанатайұлы келген. Осы есімдер отбасы, достық пен әдеби ортаның қаншалықты тығыз байланысқанын көрсетеді. Ғимараттың өзі де ескі қаланың сипатын сақтаған: бірінші қабаты кірпіштен, екіншісі ағаштан салынған. Фотосуреттен екі материал мен қабаттардың үйлесімін байқауға болады. Шағын үй бұл тарихтың күнделікті қырын — бөлмелерді, қонақжайлықты, сапарлар мен кездесулерді елестетеді.',
        'Abai’s sons, Shakarim Kudaiberdyuly and Kokbai Zhanataiuly also visited. Their names reveal the close connections between family, friendship and literary life. The building preserves the character of the old city: its lower floor is brick and its upper floor is wooden. Photographs make the contrasting materials and proportions easy to see. This modest house brings the story down to a human scale of rooms, hospitality, visits and encounters.',
      ),
      L(
        'Позднее дом стал частью музейной истории Семея. В 1990 году его передали музею-заповеднику Абая; здесь размещается музей «Алаш арыстары — Мухтар Ауэзов». Его название соединяет память о национальном движении с наследием писателя. Рассматривая дом, можно проследить переход от частной жизни конца XIX века к культурной памяти следующих поколений. Сохранённый адрес делает эту преемственность видимой.',
        'Кейін үй Семейдің музей тарихына енді. 1990 жылы ғимарат Абайдың қорық-музейіне берілді; мұнда «Алаш арыстары — Мұхтар Әуезов» музейі орналасқан. Оның атауы ұлттық қозғалыс жадын жазушы мұрасымен байланыстырады. Үйге қарап, XIX ғасыр соңындағы жеке өмірден кейінгі ұрпақтардың мәдени жадына дейінгі жолды көруге болады. Сақталған мекенжай осы сабақтастықты нақты көрсетеді.',
        'The house later became part of Semey’s museum history. In 1990 it was transferred to the Abai museum-reserve; it houses the Alash Arystary — Mukhtar Auezov Museum. Its name connects the memory of the national movement with the writer’s legacy. The building traces a path from private life in the late nineteenth century to the cultural memory of later generations. A surviving address makes that continuity tangible.',
      ),
    ],
    facts: [
      { label: L('Владелец', 'Үй иесі', 'Owner'), value: L('Анияр Молдабаев', 'Әнияр Молдабаев', 'Aniyar Moldabayev') },
      { label: L('Покупка дома', 'Үйдің сатып алынуы', 'Purchase'), value: L('1898 · при поддержке Абая', '1898 · Абайдың көмегімен', '1898 · with Abai’s support') },
      { label: L('Архитектура', 'Сәулеті', 'Architecture'), value: L('Кирпич и дерево', 'Кірпіш пен ағаш', 'Brick and timber') },
    ],
    connection: L('Дом Анияра — сохранившийся адрес Абая на литературной карте Семея.', 'Әниярдың үйі — Семейдің әдеби картасындағы Абайға қатысты сақталған мекен.', 'Aniyar’s house is a surviving Abai address on Semey’s literary map.'),
    sources: [
      { title: L('История дома Анияра Молдабаева', 'Әнияр Молдабаев үйінің тарихы', 'The history of Aniyar Moldabayev’s house'), organization: 'Kazakhstan.travel', url: 'https://kazakhstan.travel/ru/attractions/650' },
      { title: L('Музей «Алаш арыстары — М. Ауэзов»', '«Алаш арыстары — М. Әуезов» музейі', 'The Alash Arystary — M. Auezov Museum'), organization: 'Музей Абая «Жидебай-Бөрілі»', url: 'https://abai-museum.kz/qurylym/' },
    ],
    placeId: 'semey',
  },
  {
    id: 'alash',
    year: '1917–1918',
    shortTitle: L('Алаш', 'Алаш', 'Alash'),
    title: L('Семей и движение Алаш', 'Семей және Алаш қозғалысы', 'Semey and the Alash movement'),
    subtitle: L('Город на Иртыше становится центром политической и печатной жизни', 'Ертіс бойындағы қала саяси өмір мен баспасөз орталығына айналды', 'A city on the Irtysh becomes a centre of politics and publishing'),
    paragraphs: [
      L(
        'В 1917 году левобережная часть Семипалатинска, известная как Заречная слобода, получила название Алаш. Жители добивались собственного городского управления; в ноябре состоялись выборы в городскую думу. Это была история людей, которые стремились самостоятельно решать вопросы жизни города. Название нового административного центра вскоре оказалось связано с гораздо более широким движением за национальную автономию.',
        '1917 жылы Семейдің Заречная слобода деп аталған сол жағалау бөлігі Алаш атауын алды. Тұрғындар дербес қала басқаруын құруға ұмтылды; қарашада қалалық думаға сайлау өтті. Бұл — қаланың күнделікті мәселелерін өздері шешкісі келген адамдардың тарихы. Жаңа әкімшілік орталықтың атауы көп ұзамай ұлттық автономия үшін күрескен кең қозғалыспен байланыса түсті.',
        'In 1917 Semipalatinsk’s left-bank settlement, known as Zarechnaya Sloboda, took the name Alash. Its residents sought their own municipal administration, and elections to a city duma followed in November. This was a local effort to take responsibility for urban life. The new administrative centre soon became closely associated with a much wider movement for national autonomy.',
      ),
      L(
        'В декабре 1917 года Второй Всеказахский съезд в Оренбурге принял решение о создании автономии Алаш и временного Народного совета — Алаш-Орды. Председателем избрали Алихана Букейханова. Административным центром выбрали город Алаш на левом берегу Иртыша. В 1918 году рядом с мечетью Тыныбая работали учреждения правительства; под них использовали городские дома. Так политические решения получили конкретные адреса.',
        '1917 жылғы желтоқсанда Орынборда өткен Екінші жалпықазақ съезі Алаш автономиясын және Алашорда уақытша халық кеңесін құру туралы шешім қабылдады. Төрағасы болып Әлихан Бөкейхан сайланды. Әкімшілік орталық ретінде Ертістің сол жағалауындағы Алаш қаласы таңдалды. 1918 жылы Тыныбай мешіті маңындағы қала үйлерінде үкімет мекемелері жұмыс істеді. Саяси шешімдер осылай нақты мекенжайлармен байланысқа түсті.',
        'In December 1917 the Second All-Kazakh Congress in Orenburg resolved to establish the Alash autonomy and a provisional People’s Council, Alash Orda. Alikhan Bukeikhan was elected its chairman. The city of Alash on the left bank of the Irtysh was chosen as its administrative centre. In 1918 government offices operated in houses near the Tynybai Mosque, giving political decisions a physical presence in the city.',
      ),
      L(
        'Важную роль играли местные меценаты и печать. Мухамедхан Сейткулов поддерживал газету «Сарыарқа» и журнал «Абай», а Каражан Укибаев приобрёл типографию. С журналом были связаны Жусипбек Аймауытов и Мухтар Ауэзов. В обсуждениях будущего страны соседствовали вопросы образования, культуры и литературы. Гражданская война сделала этот период недолгим и напряжённым, но память о нём осталась в документах, изданиях и музейных собраниях Семея.',
        'Жергілікті меценаттар мен баспасөздің рөлі зор болды. Мұхамедхан Сейітқұлов «Сарыарқа» газеті мен «Абай» журналын қолдады, ал Қаражан Үкібаев баспахана сатып алды. Журналмен Жүсіпбек Аймауытов пен Мұхтар Әуезовтің қызметі байланысты болды. Ел болашағы туралы пікірталастарда білім, мәдениет және әдебиет мәселелері қатар көтерілді. Азамат соғысы бұл кезеңді қысқа әрі күрделі етті, бірақ оның жады Семейдің құжаттарында, басылымдарында және музей қорларында сақталды.',
        'Local patrons and the press played an important part. Mukhamedkhan Seitkulov supported the newspaper Saryarqa and the journal Abai, while Karazhan Ukibayev purchased a printing press. Zhusipbek Aimauytov and Mukhtar Auezov were associated with the journal. Debates about the country’s future brought education, culture and literature together. Civil war made this a brief and unsettled period, but its memory survives in Semey’s documents, publications and museum collections.',
      ),
    ],
    facts: [
      { label: L('Решение съезда', 'Съезд шешімі', 'Congress decision'), value: L('Декабрь 1917 · Оренбург', '1917 жылғы желтоқсан · Орынбор', 'December 1917 · Orenburg') },
      { label: L('Председатель Алаш-Орды', 'Алашорда төрағасы', 'Chairman of Alash Orda'), value: L('Алихан Букейханов', 'Әлихан Бөкейхан', 'Alikhan Bukeikhan') },
      { label: L('Печатные издания', 'Басылымдар', 'Publications'), value: L('«Сарыарқа» и «Абай»', '«Сарыарқа» мен «Абай»', 'Saryarqa and Abai') },
    ],
    connection: L('Левобережный Семей стал одним из ключевых мест истории Алаш.', 'Семейдің сол жағалауы Алаш тарихының басты мекендерінің біріне айналды.', 'Left-bank Semey became one of the key places in the history of Alash.'),
    sources: [
      { title: L('Из истории города Алаш', 'Алаш қаласының тарихынан', 'From the history of the city of Alash'), organization: 'Областной историко-краеведческий музей Семея', url: 'https://semeymuzey.kz/iz-istorii-goroda-alash/' },
    ],
    placeId: 'semey',
  },
  {
    id: 'independence',
    year: '1991',
    shortTitle: L('Независимость', 'Тәуелсіздік', 'Independence'),
    title: L('Год независимости и перемен', 'Тәуелсіздік пен өзгерістер жылы', 'A year of independence and change'),
    subtitle: L('Новая государственность и закрытие Семипалатинского полигона', 'Жаңа мемлекеттілік және Семей полигонының жабылуы', 'Independent statehood and the closure of the Semipalatinsk test site'),
    paragraphs: [
      L(
        '16 декабря 1991 года Верховный Совет принял Конституционный закон о государственной независимости Республики Казахстан. Решение было принято в Алматы, тогдашней столице страны. Закон закрепил самостоятельность внутренней и внешней политики, целостность территории и право выстраивать отношения с другими государствами. Для людей это означало начало новой политической эпохи: будущее республики теперь определялось в рамках собственного независимого государства.',
        '1991 жылғы 16 желтоқсанда Жоғарғы Кеңес Қазақстан Республикасының мемлекеттік тәуелсіздігі туралы Конституциялық заңды қабылдады. Шешім сол кездегі астана Алматыда қабылданды. Заң ішкі және сыртқы саясаттың дербестігін, аумақтың тұтастығын және өзге мемлекеттермен қарым-қатынас орнату құқығын бекітті. Бұл адамдар үшін жаңа саяси дәуірдің басталуын білдірді: республиканың болашағы енді тәуелсіз мемлекеттің аясында айқындалатын болды.',
        'On 16 December 1991 the Supreme Council adopted the Constitutional Law on the State Independence of the Republic of Kazakhstan. The decision was made in Almaty, then the capital. The law established independent domestic and foreign policy, territorial integrity and the ability to develop relations with other states. It marked a new political era in which the republic’s future would be shaped within an independent state.',
      ),
      L(
        'В документе говорилось не только об устройстве власти. Он закреплял равенство граждан разных национальностей и вероисповеданий, а развитие культуры, традиций и языков называл одной из обязанностей государства. Предусматривались собственные государственные символы, финансовые институты и дипломатические отношения. За торжественной датой стояла большая практическая работа: новые институты должны были обрести форму, а общество — освоиться с изменившимися условиями жизни.',
        'Құжатта билік құрылымы ғана сөз болған жоқ. Ол ұлты мен діни сенімі әртүрлі азаматтардың теңдігін бекітіп, мәдениетті, дәстүрлер мен тілдерді дамытуды мемлекеттің міндеттерінің бірі деп атады. Мемлекеттік рәміздер, қаржы институттары және дипломатиялық байланыстар көзделді. Салтанатты күннің ар жағында ауқымды жұмыс тұрды: жаңа институттар қалыптасып, қоғам өзгерген өмір жағдайына бейімделуі керек еді.',
        'The document addressed more than the organisation of power. It set out equality for citizens of different ethnicities and faiths, and made the development of culture, traditions and languages a responsibility of the state. It also provided for state symbols, financial institutions and diplomatic relations. Behind the ceremonial date lay extensive practical work: institutions had to take shape, and society had to adjust to changing circumstances.',
      ),
      L(
        'Для Семейского края 1991 год связан ещё с одним решением: 29 августа был закрыт Семипалатинский ядерный испытательный полигон. Закрытие произошло до провозглашения независимости и стало важным поворотом в истории региона. Оно не устранило последствий испытаний, но открыло другой этап — изучения их наследия и восстановления. Поэтому местная память об этом годе соединяет государственные перемены с судьбами людей и земли.',
        'Семей өңірі үшін 1991 жыл тағы бір шешіммен байланысты: 29 тамызда Семей ядролық сынақ полигоны жабылды. Бұл тәуелсіздік жарияланғанға дейін болып, өлке тарихындағы маңызды бетбұрысқа айналды. Полигонның жабылуы сынақтардың салдарын жойған жоқ, бірақ олардың зардаптарын зерттеу мен қалпына келтірудің жаңа кезеңін ашты. Сондықтан осы жыл туралы жергілікті жад мемлекеттік өзгерістерді адамдар мен жердің тағдырымен ұштастырады.',
        'For the Semey region, 1991 also carries another meaning: the Semipalatinsk nuclear test site was closed on 29 August. This preceded independence and marked a major turning point for the region. Closure did not erase the consequences of testing, but began a different phase of studying that legacy and working towards recovery. Local memory of the year therefore brings national change together with the lives of people and the land.',
      ),
    ],
    facts: [
      { label: L('Независимость', 'Тәуелсіздік', 'Independence'), value: L('16 декабря 1991', '1991 жылғы 16 желтоқсан', '16 December 1991') },
      { label: L('Столица в 1991 году', '1991 жылғы астана', 'Capital in 1991'), value: L('Алматы', 'Алматы', 'Almaty') },
      { label: L('Закрытие полигона', 'Полигонның жабылуы', 'Test-site closure'), value: L('29 августа 1991', '1991 жылғы 29 тамыз', '29 August 1991') },
    ],
    connection: L('В памяти Семейского края независимость соседствует с завершением эпохи ядерных испытаний.', 'Семей өңірінің жадында тәуелсіздік ядролық сынақтар дәуірінің аяқталуымен сабақтасады.', 'In the memory of the Semey region, independence stands alongside the end of the nuclear-testing era.'),
    sources: [
      { title: L('Закон о государственной независимости', 'Мемлекеттік тәуелсіздік туралы заң', 'The law on state independence'), organization: 'Әділет · Министерство юстиции РК', url: 'https://old.adilet.zan.kz/rus/docs/Z910004400_' },
      { title: L('Семипалатинский полигон: новая эпоха исследований', 'Семей полигоны: зерттеулердің жаңа кезеңі', 'The Semipalatinsk test site: a new era of research'), organization: 'Агентство Республики Казахстан по атомной энергии', url: 'https://www.gov.kz/org/atom-energiyasy/press/news/details/1283155?lang=ru' },
    ],
    placeId: null,
  },
  {
    id: 'constitution',
    year: '1995',
    shortTitle: L('Конституция', 'Конституция', 'The Constitution'),
    title: L('Конституция 1995 года', '1995 жылғы Конституция', 'The Constitution of 1995'),
    subtitle: L('От обсуждения проекта к республиканскому референдуму', 'Жобаны талқылаудан республикалық референдумға дейін', 'From a draft under discussion to a national referendum'),
    paragraphs: [
      L(
        '30 августа 1995 года на республиканском референдуме была принята новая Конституция Казахстана. За этим событием стояли месяцы подготовки и обсуждений. В мае создали экспертно-консультативный совет по проекту, а 28 июля назначили референдум. В июле и августе поступали предложения и замечания ведомств и общественных объединений. Так текст основного закона проходил путь от проекта к решению, вынесенному на голосование.',
        '1995 жылғы 30 тамызда республикалық референдумда Қазақстанның жаңа Конституциясы қабылданды. Бұған дейін бірнеше ай бойы дайындық пен талқылау жүрді. Мамырда жоба жөніндегі сараптамалық-консультативтік кеңес құрылып, 28 шілдеде референдум тағайындалды. Шілде мен тамызда мекемелер мен қоғамдық бірлестіктердің ұсыныстары және ескертулері түсті. Негізгі заңның мәтіні жобадан дауысқа ұсынылған шешімге дейін осындай жолдан өтті.',
        'On 30 August 1995 Kazakhstan adopted a new Constitution in a national referendum. Months of preparation and discussion preceded the vote. An expert advisory council on the draft was established in May, and the referendum was called on 28 July. Departments and public associations submitted comments and proposals during July and August. The text moved through these stages before being put to a public vote.',
      ),
      L(
        'Документ определял основы государственного устройства, систему власти, права и свободы человека. Для культурной истории особенно значимы положения о свободе творчества, пользовании родным языком и культурой, сохранении исторического наследия. Они связывали устройство страны с повседневными возможностями человека: учиться, выражать мысли, создавать произведения и беречь памятники. Конституция 1995 года стала важным этапом формирования институтов независимого Казахстана.',
        'Құжат мемлекеттік құрылымның негіздерін, билік жүйесін, адам құқықтары мен бостандықтарын айқындады. Мәдениет тарихы үшін шығармашылық еркіндігі, ана тілі мен мәдениетін пайдалану және тарихи мұраны сақтау туралы ережелердің маңызы ерекше. Олар елдің құрылымын адамның күнделікті мүмкіндіктерімен — білім алу, ойын білдіру, шығарма жасау және ескерткіштерді қорғаумен байланыстырды. 1995 жылғы Конституция тәуелсіз Қазақстан институттарының қалыптасуындағы маңызды кезең болды.',
        'The document set out the foundations of the state, its institutions, and human rights and freedoms. For cultural history, its provisions on creative freedom, the use of one’s language and culture, and the preservation of historical heritage are particularly significant. They connected the organisation of the country with everyday opportunities to learn, express ideas, create and care for monuments. The 1995 Constitution was an important stage in building independent Kazakhstan’s institutions.',
      ),
      L(
        'Архивные материалы позволяют увидеть этот процесс в деталях: сохранились проекты, предложения, стенограммы и фотографии официального представления Конституции 6 сентября 1995 года. Рядом с торжественными кадрами — рабочие документы, через которые складывалось решение. Рассматривая их, можно понять, как публичное обсуждение, юридический текст и политическое событие образуют разные стороны одной истории.',
        'Мұрағат материалдары бұл үдерісті егжей-тегжейлі көрсетеді: жобалар, ұсыныстар, стенограммалар және 1995 жылғы 6 қыркүйектегі Конституцияны ресми таныстыру фотосуреттері сақталған. Салтанатты кадрлардың жанында шешімнің қалыптасуын көрсететін жұмыс құжаттары бар. Оларды қарастыру қоғамдық талқылаудың, құқықтық мәтіннің және саяси оқиғаның бір тарихтың түрлі қыры екенін түсінуге көмектеседі.',
        'Archival records reveal the process in detail: drafts, proposals, transcripts and photographs of the Constitution’s formal presentation on 6 September 1995 survive. Alongside the ceremonial images are working documents through which the decision took shape. Together they show public debate, legal writing and political events as different aspects of one history.',
      ),
    ],
    facts: [
      { label: L('Принятие', 'Қабылдануы', 'Adoption'), value: L('30 августа 1995', '1995 жылғы 30 тамыз', '30 August 1995') },
      { label: L('Способ принятия', 'Қабылдау жолы', 'Method'), value: L('Республиканский референдум', 'Республикалық референдум', 'National referendum') },
      { label: L('Официальное представление', 'Ресми таныстыру', 'Formal presentation'), value: L('6 сентября 1995', '1995 жылғы 6 қыркүйек', '6 September 1995') },
    ],
    connection: L('Сохранение языка, культуры и памятников связывает эту государственную веху с наследием земли Абая.', 'Тілді, мәдениетті және ескерткіштерді сақтау бұл мемлекеттік белесті Абай өлкесінің мұрасымен байланыстырады.', 'The preservation of language, culture and monuments connects this national milestone with the heritage of Abai’s homeland.'),
    sources: [
      { title: L('Документы о подготовке и принятии Конституции', 'Конституцияны дайындау және қабылдау құжаттары', 'Documents on the drafting and adoption of the Constitution'), organization: 'Архив Президента Республики Казахстан', url: 'https://archive.president.kz/ru/virtual/istoriko-dokumentalnaya-vystavka-konstitutsiya-respubliki-kazakhstan-osnova-stabilnosti-i-protsvetan/' },
      { title: L('Конституция 1995 года · историческая редакция', '1995 жылғы Конституция · тарихи редакция', 'The 1995 Constitution · historical version'), organization: 'WIPO Lex', url: 'https://www.wipo.int/wipolex/ru/legislation/details/16098' },
    ],
    placeId: null,
  },
];
