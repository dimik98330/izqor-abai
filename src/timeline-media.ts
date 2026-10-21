import { L, type LocalText } from './i18n';

export type TimelineImage = {
  src: string;
  thumbnail?: string;
  alt: LocalText;
  caption: LocalText;
  credit: string;
  sourceUrl: string;
  license: string;
  fit?: 'contain' | 'cover';
  position?: string;
};

export type TimelineMedia = TimelineImage & { secondary?: TimelineImage };

// Image dates are independent of the event dates. Keep the captions visible.
export const timelineMedia: Record<string, TimelineMedia> = {
  khanate: {
    src: '/media/timeline/khanate-map.webp',
    thumbnail: '/media/timeline/thumb-khanate.webp',
    alt: L(
      'Обзорная карта Казахского ханства, его городов, рек и соседних государств',
      'Қазақ хандығының қалалары, өзендері және көрші мемлекеттері көрсетілген шолу картасы',
      'Overview map of the Kazakh Khanate, its cities, rivers and neighbouring states',
    ),
    caption: L(
      'Казахское ханство и его соседи. Современная обзорная карта, 2025 год; она показывает разные этапы истории ханства, а не границы 1465 года.',
      'Қазақ хандығы және оның көршілері. 2025 жылы жасалған шолу картасы 1465 жылғы шекараны емес, хандық тарихының түрлі кезеңдерін көрсетеді.',
      'The Kazakh Khanate and its neighbours. A modern overview map, made in 2025, spanning the khanate’s history rather than its borders in 1465.',
    ),
    credit: 'Dimash Kenesbek / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Map_of_Kazakh_khanate_(english).png',
    license: 'CC BY 4.0',
    fit: 'contain',
    secondary: {
      src: '/media/timeline/khanate-coin-2015.png',
      alt: L(
        'Памятная монета с изображением Керея и Жанибека',
        'Керей мен Жәнібек бейнеленген естелік монета',
        'Commemorative coin depicting Kerey and Zhanibek',
      ),
      caption: L(
        'Керей и Жанибек на памятной монете к 550-летию Казахского ханства. Выпуск 2015 года.',
        'Қазақ хандығының 550 жылдығына арналған естелік монетадағы Керей мен Жәнібек. 2015 жылғы шығарылым.',
        'Kerey and Zhanibek on a coin marking 550 years of the Kazakh Khanate. Issued in 2015.',
      ),
      credit: 'National Bank of Kazakhstan / Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:KZ-2015-500tenge-Khanate-b.png',
      license: 'Public domain (PD-KZ-exempt)',
      fit: 'contain',
    },
  },
  education: {
    src: '/media/timeline/abai-portrait.jpg',
    thumbnail: '/media/timeline/thumb-education.webp',
    alt: L(
      'Абай Кунанбайулы сидит в традиционной одежде на фотографии 1896 года',
      '1896 жылғы суретте дәстүрлі киіммен отырған Абай Құнанбайұлы',
      'Abai Qunanbaiuly seated in traditional clothing in an 1896 photograph',
    ),
    caption: L(
      'Абай в Семее, 1896 год. Поздний портрет: фрагмент фотографии с сыновьями, сделанной спустя десятилетия после учёбы.',
      'Абай Семейде, 1896 жыл. Оқу жылдарынан бірнеше онжылдық кейін ұлдарымен түскен суреттің үзіндісі.',
      'Abai in Semey, 1896. A later portrait cropped from a photograph with his sons, taken decades after his school years.',
    ),
    credit: 'Н. Г. Кузнецов / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Abai_Kunanbaev.jpg',
    license: 'Public domain',
    fit: 'contain',
    position: '50% 35%',
  },
  house: {
    src: '/media/timeline/aniyar-house-2022.webp',
    thumbnail: '/media/timeline/thumb-house.webp',
    alt: L(
      'Деревянный дом Анияра Молдабаева в Семее, сегодня музей «Алаш арыстары — Мұхтар Әуезов»',
      'Семейдегі Әнияр Молдабаевтың ағаш үйі, қазіргі «Алаш арыстары — Мұхтар Әуезов» мұражайы',
      'Aniyar Moldabayev’s wooden house in Semey, now the Alash Arystary–Mukhtar Auezov Museum',
    ),
    caption: L(
      'Дом Анияра Молдабаева в Семее. Современный вид музея «Алаш арыстары — Мұхтар Әуезов», 8 сентября 2022 года.',
      'Семейдегі Әнияр Молдабаевтың үйі. «Алаш арыстары — Мұхтар Әуезов» мұражайының қазіргі көрінісі, 2022 жылғы 8 қыркүйек.',
      'Aniyar Moldabayev’s house in Semey. The present-day Alash Arystary–Mukhtar Auezov Museum, photographed on 8 September 2022.',
    ),
    credit: 'Ерден Карсыбеков / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Alash_arystary_museum.jpg',
    license: 'CC BY-SA 4.0',
    fit: 'cover',
    position: '50% 45%',
    secondary: {
      src: '/media/timeline/semey-1885-1886.jpg',
      alt: L(
        'Архивная панорама Семипалатинска с Иртышом на переднем плане',
        'Алдыңғы планда Ертіс өзені көрінетін Семейдің архивтік панорамасы',
        'Archival panorama of Semipalatinsk with the Irtysh River in the foreground',
      ),
      caption: L(
        'Семипалатинск с противоположного берега Иртыша, 1885–1886 годы. Вид города до покупки дома Анияром.',
        'Ертістің қарсы жағалауынан түсірілген Семей, 1885–1886 жылдар. Әнияр үйді сатып алғанға дейінгі қала көрінісі.',
        'Semipalatinsk from across the Irtysh, 1885–1886. The city before Aniyar’s purchase of the house.',
      ),
      credit: 'Library of Congress / George Kennan Papers',
      sourceUrl: 'https://www.loc.gov/item/99615482/',
      license: 'Public domain; LOC: no known restrictions',
      fit: 'contain',
    },
  },
  alash: {
    src: '/media/timeline/alash-semey-1918.jpg',
    thumbnail: '/media/timeline/thumb-alash.webp',
    alt: L(
      'Групповой архивный портрет деятелей Алаш в Семипалатинске, 1918 год',
      'Алаш қайраткерлерінің Семейде 1918 жылы түскен топтық архивтік суреті',
      'An archival group portrait of Alash figures in Semipalatinsk, 1918',
    ),
    caption: L(
      'Деятели Алаш в Семипалатинске, 1918 год. В первом ряду — Турагул Абайулы, Алихан Букейханов и Райымжан Марсеков.',
      'Алаш қайраткерлері Семейде, 1918 жыл. Алдыңғы қатарда Тұрағұл Абайұлы, Әлихан Бөкейхан және Райымжан Мәрсеков.',
      'Alash figures in Semipalatinsk, 1918. Turagul Abaiuly, Alikhan Bukeikhanov and Raiymzhan Marsekov are in the front row.',
    ),
    credit: 'Автор неизвестен / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Alash_intelligentsia,_Semipalatinsk,_1918.jpg',
    license: 'Public domain',
    fit: 'contain',
    secondary: {
      src: '/media/timeline/alash-letter-1918.jpg',
      alt: L(
        'Официальное письмо Алихана Букейханова на бланке Алаш-Орды, 1918 год',
        'Әлихан Бөкейханның Алашорда бланкісіндегі ресми хаты, 1918 жыл',
        'Alikhan Bukeikhanov’s official letter on Alash Orda stationery, 1918',
      ),
      caption: L(
        'Письмо главы Алаш-Орды Алихана Букейханова, 12 (25) июня 1918 года. Оригинал хранится в Центре документации новейшей истории Семея.',
        'Алашорда төрағасы Әлихан Бөкейханның 1918 жылғы 12 (25) маусымдағы хаты. Түпнұсқа Семейдің Қазіргі заман тарихын құжаттандыру орталығында сақтаулы.',
        'A letter from Alash Orda chairman Alikhan Bukeikhanov, 12 (25) June 1918. The original is held by Semey’s Documentation Centre for Contemporary History.',
      ),
      credit: 'ЦДНИ Семея, Ф. 48, Оп. 2, Д. 1, Л. 139 / E-history.kz',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Alash_Orda_document_1918.jpg',
      license: 'Public domain (PD-KZ-exempt)',
      fit: 'contain',
    },
  },
  independence: {
    src: '/media/timeline/alma-ata-1991.webp',
    thumbnail: '/media/timeline/thumb-independence.webp',
    alt: L(
      'Нурсултан Назарбаев и руководители государств за столом переговоров в Алма-Ате, 21 декабря 1991 года',
      'Нұрсұлтан Назарбаев пен мемлекет басшылары Алматыдағы келіссөз үстелінде, 1991 жылғы 21 желтоқсан',
      'Nursultan Nazarbayev and other national leaders at a meeting in Alma-Ata on 21 December 1991',
    ),
    caption: L(
      'Встреча руководителей государств в Алма-Ате, 21 декабря 1991 года — через пять дней после принятия закона о независимости Казахстана.',
      'Алматыдағы мемлекет басшыларының кездесуі, 1991 жылғы 21 желтоқсан — Қазақстанның тәуелсіздігі туралы заң қабылданғаннан бес күн кейін.',
      'National leaders meeting in Alma-Ata on 21 December 1991, five days after Kazakhstan adopted its independence law.',
    ),
    credit: 'EgemenMedia / Egemen Kazakhstan',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Egemen_Archive_Nazarbayev_and_CIS_leaders.jpg',
    license: 'CC BY-SA 4.0',
    fit: 'cover',
    position: '48% 40%',
  },
  constitution: {
    src: '/media/timeline/constitution-book-2014.jpg',
    thumbnail: '/media/timeline/thumb-constitution.webp',
    alt: L(
      'Красный том Конституции Республики Казахстан с гербом на обложке в музейной экспозиции',
      'Мұражай экспозициясындағы мұқабасында елтаңбасы бар Қазақстан Республикасы Конституциясының қызыл түсті кітабы',
      'A red volume of the Constitution of Kazakhstan with the national emblem, displayed in a museum',
    ),
    caption: L(
      'Конституция в музейной экспозиции. Фотография 4 августа 2014 года; это изображение документа, а не снимок референдума 1995 года.',
      'Мұражай экспозициясындағы Конституция. 2014 жылғы 4 тамыздағы фото; бұл 1995 жылғы референдумның емес, құжаттың суреті.',
      'The Constitution on museum display, photographed on 4 August 2014. This shows the document, not the 1995 referendum.',
    ),
    credit: 'Alex J. Butler; crop: Kurmanbek / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Constitution_of_Kazakhstan_(14944227840)_(cropped).jpg',
    license: 'CC BY 2.0',
    fit: 'contain',
  },
};
