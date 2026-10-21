import { L } from './i18n.ts';
import type { TimelineImage } from './timeline-media.ts';

export const timelineCultureMedia: Record<string, TimelineImage> = {
  khanate: {
    src: '/media/timeline/culture-dombra-2012.jpg',
    alt: L(
      'Казахская домбра из светлого дерева: вид спереди и сбоку, видны две струны и орнамент',
      'Ашық түсті ағаштан жасалған қазақ домбырасы: алдынан және жанынан көрінісі, екі ішегі мен оюы көрінеді',
      'A light-wood Kazakh dombra shown from the front and side, with two strings and decorative patterns',
    ),
    caption: L(
      'Две стороны казахской домбры. Предметная фотография 2012 года знакомит с инструментом живой традиции; это не артефакт XV века.',
      'Қазақ домбырасының екі қырынан көрінісі. 2012 жылғы заттық фото тірі дәстүрдің аспабын таныстырады; бұл XV ғасыр жәдігері емес.',
      'Two views of a Kazakh dombra. This 2012 object photograph introduces an instrument of a living tradition; it is not a fifteenth-century artifact.',
    ),
    credit: 'Mizu basyo / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kazakh_Dombra.jpg',
    license: 'CC BY-SA 3.0',
    fit: 'contain',
    position: '50% 50%',
  },
  house: {
    src: '/media/timeline/culture-abai-collection-1909.jpg',
    alt: L(
      'Потрёпанный экземпляр первого сборника стихов Абая 1909 года в музейной витрине',
      'Музей сөресіндегі Абайдың 1909 жылғы алғашқы өлеңдер жинағының тозған данасы',
      'A worn copy of Abai’s first poetry collection, published in 1909, displayed in a museum case',
    ),
    caption: L(
      'Первый сборник стихов Абая, Санкт-Петербург, 1909. Экземпляр в музее Абая в Семее; фотография 16 сентября 2017 года. Это книга, не рукопись песни 1892 года.',
      'Абайдың алғашқы өлеңдер жинағы, Санкт-Петербург, 1909. Семейдегі Абай музейіндегі дана; 2017 жылғы 16 қыркүйектегі фото. Бұл кітап, 1892 жылғы әннің қолжазбасы емес.',
      'Abai’s first poetry collection, Saint Petersburg, 1909. A copy in the Abai Museum, Semey, photographed on 16 September 2017. This is a book, not the song’s 1892 manuscript.',
    ),
    credit: 'Yakov Fedorov / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:First_Collection_of_Abay.jpg',
    license: 'CC BY-SA 4.0',
    fit: 'contain',
    position: '50% 50%',
  },
  constitution: {
    src: '/media/timeline/culture-memorial-2020.jpg',
    alt: L(
      'Белые сооружения мемориального комплекса Абая и Шакарима, дорожка и зелёный двор под синим небом',
      'Көк аспан астындағы Абай мен Шәкәрім мемориалының ақ ғимараттары, жолы және жасыл ауласы',
      'White buildings of the Abai and Shakarim memorial complex, with a walkway and green courtyard under a blue sky',
    ),
    caption: L(
      'Мемориал Абая и Шакарима. Современный вид комплекса, 12 сентября 2020 года; не фотография открытия в 1995 году.',
      'Абай мен Шәкәрім мемориалы. Кешеннің қазіргі көрінісі, 2020 жылғы 12 қыркүйек; бұл 1995 жылғы ашылу сәтінің фотосы емес.',
      'The Abai and Shakarim memorial. A modern view photographed on 12 September 2020, rather than its opening in 1995.',
    ),
    credit: 'Ерден Карсыбеков / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Abai_and_Shakarim_mausoleums.jpg',
    license: 'CC BY-SA 4.0',
    fit: 'cover',
    position: '50% 42%',
  },
};
