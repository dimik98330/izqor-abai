import { L } from './i18n';
import { timelineMedia, type TimelineImage } from './timeline-media';
import { timelineCultureMedia } from './timeline-culture-media';

export const storyMedia: Record<string, TimelineImage> = {
  'semey-river': timelineMedia.house.secondary!,
  'semey-bazaar': {
    src:'/media/stories/semey-bazaar-1885.webp',
    alt:L('Люди на базаре Семипалатинска на фотографии XIX века','XIX ғасырдағы Семей базарындағы адамдар','People at the Semipalatinsk bazaar in a nineteenth-century photograph'),
    caption:L('Базар в Семипалатинске, 1885–1886 годы. Снимок из собрания Джорджа Кеннана: повседневная жизнь города, а не постановочная реконструкция.','Семей базары, 1885–1886 жылдар. Джордж Кеннан қорындағы фотосурет қаланың күнделікті өмірін көрсетеді.','Semipalatinsk bazaar, 1885–1886. A photograph from the George Kennan papers documenting everyday city life.'),
    credit:'Library of Congress · George Kennan papers',sourceUrl:'https://www.loc.gov/item/99615488/',license:'No known restrictions on reproduction',fit:'contain',
  },
  'abai-portrait': {...timelineMedia.education,caption:L('Абай в Семее, 1896 год. Фрагмент фотографии с сыновьями.','Абай Семейде, 1896 жыл. Ұлдарымен түскен фотосуреттің үзіндісі.','Abai in Semey, 1896. A detail from a photograph with his sons.')},
  'abai-book': {...timelineCultureMedia.house,caption:L('Первый сборник стихов Абая, Санкт-Петербург, 1909. Музейный экземпляр в Семее, сфотографирован 16 сентября 2017 года.','Абайдың алғашқы өлеңдер жинағы, Санкт-Петербург, 1909. Семейдегі музей данасы, 2017 жылғы 16 қыркүйекте түсірілген.','Abai’s first poetry collection, Saint Petersburg, 1909. A museum copy in Semey, photographed on 16 September 2017.')},
  'alash-document': timelineMedia.alash.secondary!,
  'zhidebay-house': {
    src:'/media/stories/zhidebay-house.webp',
    alt:L('Светлый дом-музей Абая в Жидебае','Жидебайдағы Абайдың ақ түсті үй-музейі','The light-colored Abai house museum in Zhidebay'),
    caption:L('Дом Абая в Жидебае. Современный вид, 2 мая 2014 года. Дом-музей и большой мемориальный комплекс — разные части одного места.','Жидебайдағы Абай үйі. 2014 жылғы 2 мамырдағы көрініс. Үй-музей мен үлкен мемориалдық кешен — осы мекеннің бөлек нысандары.','Abai’s house in Zhidebay, photographed on 2 May 2014. The house museum and the monumental memorial are distinct parts of the site.'),
    credit:'Yakov Fedorov',sourceUrl:'https://commons.wikimedia.org/wiki/File:Abai_House_in_Zhidebay.JPG',license:'CC BY-SA 3.0',fit:'contain',
  },
  'zhidebay-chests': {
    src:'/media/stories/zhidebay-exhibits.webp',
    alt:L('Три деревянных сундука с инкрустацией в музее Жидебая','Жидебай музейіндегі өрнектелген үш ағаш сандық','Three decorated wooden chests displayed in the Zhidebay museum'),
    caption:L('Сундуки в экспозиции Жидебая, 23 октября 2016 года. Накладки, замки и геометрический орнамент можно рассмотреть крупнее.','Жидебай экспозициясындағы сандықтар, 2016 жылғы 23 қазан. Өрнек, қапсырма мен құлыптарын үлкейтіп қарауға болады.','Chests in the Zhidebay exhibition, 23 October 2016. Enlarge the image to examine fittings, locks and geometric ornament.'),
    credit:'Almagul Ibragimova',sourceUrl:'https://commons.wikimedia.org/wiki/File:Museum_exhibits_in_Zhidebay.jpg',license:'CC BY-SA 4.0',fit:'contain',
  },
  'zhidebay-memorial': {...timelineCultureMedia.constitution,caption:L('Мемориал Абая и Шакарима, 12 сентября 2020 года.','Абай мен Шәкәрім мемориалы, 2020 жылғы 12 қыркүйек.','The Abai and Shakarim memorial, 12 September 2020.')},
  'borili-museum': {
    src:'/media/stories/borili-museum.webp',
    alt:L('Дом-музей Ауэзова в Бөрілі за деревьями и оградой','Бөрілідегі Әуезов үй-музейі, ағаштар мен қоршаудың ар жағынан көрініс','Auezov’s house museum in Borili, seen behind trees and a fence'),
    caption:L('Дом-музей Мухтара Ауэзова в Бөрілі, 12 сентября 2020 года. Современная фотография восстановленного музейного здания.','Бөрілідегі Мұхтар Әуезовтің үй-музейі, 2020 жылғы 12 қыркүйек. Қалпына келтірілген музей ғимаратының қазіргі фотосуреті.','Mukhtar Auezov’s house museum in Borili, 12 September 2020. A contemporary photograph of the restored museum building.'),
    credit:'Ерден Карсыбеков',sourceUrl:'https://commons.wikimedia.org/wiki/File:Auezov_museum_in_Borili.jpg',license:'CC BY-SA 4.0',fit:'contain',
  },
  'auezov-coin': {
    src:'/media/stories/auezov-coin-1997.webp',
    alt:L('Памятная монета 20 тенге с портретом Мухтара Ауэзова','Мұхтар Әуезов бейнеленген 20 теңгелік ескерткіш монета','A 20-tenge commemorative coin depicting Mukhtar Auezov'),
    caption:L('Памятная монета 20 тенге к столетию Мухтара Ауэзова, 1997 год.','Мұхтар Әуезовтің жүз жылдығына арналған 20 теңгелік ескерткіш монета, 1997 жыл.','A 20-tenge commemorative coin marking Auezov’s centenary, 1997.'),
    credit:'National Bank of Kazakhstan',sourceUrl:'https://commons.wikimedia.org/wiki/File:KZ-1997-20tenge-Auezov.png',license:'Public domain · PD-KZ-exempt',fit:'contain',
  },
  'auezov-stamp': {
    src:'/media/stories/auezov-stamp-2022.webp',
    alt:L('Марка Казахстана к 125-летию Мухтара Ауэзова','Мұхтар Әуезовтің 125 жылдығына арналған Қазақстан маркасы','A Kazakhstan stamp marking the 125th anniversary of Mukhtar Auezov’s birth'),
    caption:L('Почтовая марка Казахстана к 125-летию Мухтара Ауэзова, 2022 год.','Мұхтар Әуезовтің 125 жылдығына арналған Қазақстан пошта маркасы, 2022 жыл.','Kazakhstan postage stamp marking the 125th anniversary of Mukhtar Auezov’s birth, 2022.'),
    credit:'Kazpost',sourceUrl:'https://commons.wikimedia.org/wiki/File:Mukhtar_Auezov_2022_stamp_of_Kazakhstan.jpg',license:'Public domain · PD-KZ-exempt',fit:'contain',
  },
  'konyr-path': {
    src:'/media/stories/konyr-path.webp',alt:L('Тропа к пещере Қоңырәулие среди скал Актаса','Ақтас жартастары арасындағы Қоңырәулие үңгіріне апаратын жол','A path through the Aqtas rocks towards Konyr Aulie cave'),
    caption:L('Подход к Қоңырәулие в Актасе, Абайский район, 6 августа 2018 года. Этот снимок относится к пещере возле Токтамыса, не к одноимённым местам других областей.','Абай ауданындағы Ақтас тауының Қоңырәулие үңгіріне баратын жол, 2018 жылғы 6 тамыз. Сурет Тоқтамыс маңындағы үңгірге қатысты.','Approach to Konyr Aulie at Aqtas in Abai District, 6 August 2018. This is the cave near Toktamys, not a namesake elsewhere.'),
    credit:'Дмитрий Кошелев',sourceUrl:'https://commons.wikimedia.org/wiki/File:Way_to_Konyr_Aulie_04.jpg',license:'CC BY-SA 4.0',fit:'contain',
  },
  'konyr-entrance': {
    src:'/media/stories/konyr-entrance.webp',alt:L('Лестница у входа в пещеру Қоңырәулие','Қоңырәулие үңгірінің кіреберісіндегі баспалдақ','Stairs at the entrance to Konyr Aulie cave'),
    caption:L('Лестница ко входу в Қоңырәулие, 6 августа 2018 года. Оборудование маршрута — современный слой истории посещений.','Қоңырәулие кіреберісіндегі баспалдақ, 2018 жылғы 6 тамыз. Жол жабдықтары — мекенді аралау тарихының қазіргі қабаты.','Stairs to the cave entrance, 6 August 2018. The visitor infrastructure is a modern layer of the site’s history.'),
    credit:'Дмитрий Кошелев',sourceUrl:'https://commons.wikimedia.org/wiki/File:Konyr_Aulie_upstairs_(center).jpg',license:'CC BY-SA 4.0',fit:'contain',
  },
  'konyr-interior': {
    src:'/media/stories/konyr-interior.webp',alt:L('Каменные своды и современная деревянная лестница внутри Қоңырәулие','Қоңырәулиенің тас төбесі мен қазіргі ағаш баспалдағы','Rock surfaces and a modern timber staircase inside Konyr Aulie'),
    caption:L('Интерьер Қоңырәулие, 26 мая 2018 года. Освещение и деревянные ограждения относятся к обустройству для посетителей.','Қоңырәулиенің іші, 2018 жылғы 26 мамыр. Жарық пен ағаш қоршау келушілерге арналып орнатылған.','Inside Konyr Aulie, 26 May 2018. The lighting and timber railings belong to the visitor infrastructure.'),
    credit:'Yakov Fedorov',sourceUrl:'https://commons.wikimedia.org/wiki/File:Konyr_Aulie_East_Kz.jpg',license:'CC BY-SA 4.0',fit:'contain',
  },
  'kozy-stone': {
    src:'/media/kozy.jpg',alt:L('Каменная кладка и силуэт мавзолея Қозы Көрпеш — Баян Сұлу','Қозы Көрпеш — Баян Сұлу кесенесінің тас қалауы мен сұлбасы','The stonework and silhouette of the Kozy Korpesh–Bayan Sulu mausoleum'),
    caption:L('Мавзолей, 26 ноября 2015 года. Крупное изображение позволяет рассмотреть кладку из камня-плитняка.','Кесене, 2015 жылғы 26 қараша. Ірі суреттен жалпақ тастан қаланған қабырғаны көруге болады.','The mausoleum on 26 November 2015. The large view reveals its slab-stone masonry.'),
    credit:'Mikhail Antonov / Xeofox',sourceUrl:'https://commons.wikimedia.org/wiki/File:Kozy_Korpesh_%E2%80%94_Bayan_Sulu_mausoleum.JPG',license:'CC BY-SA 4.0',fit:'contain',
  },
  'walikhanov-portrait': {
    src:'/media/stories/walikhanov-portrait.webp',alt:L('Архивный портрет Шокана Уалиханова','Шоқан Уәлихановтың мұрағаттық портреті','An archival portrait of Shoqan Walikhanov'),
    caption:L('Шокан Уалиханов. Портрет до 1865 года, фотограф неизвестен. В 1856 году исследователь посетил мавзолей и оставил ранние зарисовки.','Шоқан Уәлиханов. 1865 жылға дейінгі портрет, фотографы белгісіз. Зерттеуші кесенеге 1856 жылы барып, ерте суреттерін қалдырған.','Shoqan Walikhanov, photographed before 1865; photographer unknown. He visited the mausoleum in 1856 and left early drawings.'),
    credit:'Автор неизвестен · Wikimedia Commons',sourceUrl:'https://commons.wikimedia.org/wiki/File:Chokan_Valikhanov_portrait.jpg',license:'Public domain',fit:'contain',
  },
};
