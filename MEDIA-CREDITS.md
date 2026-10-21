# Media and provenance

Photographs remain attributable independently of the application code.

- `media/borili-scene-hero.webp`: generated illustrative scene based on the official museum photograph and the approved IZQOR design mock. Built-in ImageGen, 21 October 2026; 1787 × 880. Trees, flowers and fine details are reconstructed. This is explicitly labelled as an illustration in the story entrance and is not documentary evidence. The original `media/borili.jpg` remains unchanged and is used in the factual place article. Generated source, prompt provenance and visual QA: `.research/immersive-story-2026-10-21/`. The underlying museum photograph's reuse terms remain unverified as recorded below.

The guide's base skeleton and animation clips are from Kenney Mini Characters, CC0: https://kenney.nl/assets/mini-characters . The original geometric character design is implemented locally in src/GuideAvatar.tsx. The original license notice is preserved in [public/models/Kenney-Mini-Characters-LICENSE.txt](public/models/Kenney-Mini-Characters-LICENSE.txt). Museum-reference characters (Vincent, Dalí, Einstein) are not copied or bundled.

- media/semey.jpg: Ерден Карсыбеков, 8 September 2022. Alash arystary museum. CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:Alash_arystary_museum.jpg
- media/zhidebay.jpg: Дмитрий Кошелев, 5 August 2018. Abai & Shakarim mausoleum. CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:Abai_%26_Shakarim_mausoleum.jpg
- media/kozy.jpg: Mikhail Antonov (Xeofox), 26 November 2015. Kozy Korpesh — Bayan Sulu mausoleum. CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:Kozy_Korpesh_%E2%80%94_Bayan_Sulu_mausoleum.JPG
- media/borili.jpg: published on the official Zhidebay-Borili museum page. https://abai-museum.kz/respwblikanskie-pamyatniki/?lang=ru . Public reading confirmed; reuse license not verified.
- media/konyr.jpg: published by Kazakhstan.travel for Konyr Aulie. https://kazakhstan.travel/ru/attractions/572 . Public reading confirmed; reuse license not verified.
- media/steppe-ambient.mp3: original synthesized instrumental composition created for IZQOR, without third-party recordings or samples. Reproducible with tools/generate_ambient.py and ffmpeg.
- media/kazakh-dombra.mp3: the current background track, [Atlas · Kazakhstan — Vadim_Makes_Sound](https://pixabay.com/music/orchestral-atlas-kazakhstan-562527/), under the [Pixabay Content License](https://pixabay.com/service/license-summary/). The publisher labels it AI-generated; it is a contemporary composition, not a recording attributed to Abai. The local copy was normalized to -23 LUFS; provenance was recorded in [docs/settings-design.md](docs/settings-design.md). This track is included for use within the application; the source license does not grant unrestricted standalone redistribution.
- media/abai-steppe-loop.mp4 and media/abai-steppe-poster.webp: an illustrative landscape generated with built-in ImageGen, then animated through camera movement from a single image. These are decorative media, not documentary footage. The local character portrait was rendered from the project's 3D scene. Production notes: [GUIDE-CINEMATIC.md](GUIDE-CINEMATIC.md); source image and prompt remain in the local `.research/guide-steppe/` archive.

The README screenshots in `docs/assets/` show the local application on 21 October 2026. Third-party media visible inside a screenshot retain their original attribution and terms; the timeline screenshot shows the map credited in `src/timeline-media.ts`.

CC BY-SA license: https://creativecommons.org/licenses/by-sa/4.0/ . Source photographs were copied without semantic editing. Responsive display uses CSS cropping and presentation effects.

Panoramas are loaded from their original museum URLs and retain the source viewer. The application provides links to the original pages. Access does not establish permission to download/repackage the underlying panorama assets.

The region boundary is OSM relation14243026, © OpenStreetMap contributors, ODbL1.0. OpenFreeMap/OpenMapTiles/OSM attribution stays visible on the map. Elevation attribution is linked to https://mapterhorn.com/attribution/ .

Map markers are orientation points, not route navigation. Zhidebay uses OSM hamlet node5224914628 (49.1077518,79.3212356); Borili/Borly uses village node5224914642 in Kaskabulak rural district (49.6617043,80.0101662). Catalogue conflicts are retained in the research pack; the markers do not claim surveyed building entrances.

Before public redistribution, obtain/verify reuse terms for the two publisher photographs and the intended panorama embedding, or replace them with permission-cleared assets. These unresolved terms are not represented as open licenses.


## Timeline decorative landscape, 21 October 2026

`public/media/timeline/chapter-landscape-v1.png` (2098 x 749) was generated with built-in Image Gen from the user-selected timeline concept. It is decorative atmosphere, not documentary photography, measured geography or historical evidence. No third-party stock asset or paid external generation service was used.


## Expanded place stories, 21 October 2026

The following documentary assets were downloaded from their credited sources, resized to a maximum of 1400 pixels (1200 for the Walikhanov portrait), and converted to WebP. These are photographic reproductions, not generated images. Captions, attribution, source links and license labels are visible in the stories. CC BY-SA derivatives retain the corresponding source license. The LOC catalogue uses the specific advisory "No known restrictions on reproduction".

| Local file | Attribution | License / advisory | Source |
| --- | --- | --- | --- |
| `media/stories/konyr-path.webp` | Дмитрий Кошелев | CC BY-SA 4.0 | [Catalogue](https://commons.wikimedia.org/wiki/File:Way_to_Konyr_Aulie_04.jpg) |
| `media/stories/konyr-entrance.webp` | Дмитрий Кошелев | CC BY-SA 4.0 | [Catalogue](https://commons.wikimedia.org/wiki/File:Konyr_Aulie_upstairs_(center).jpg) |
| `media/stories/konyr-interior.webp` | Yakov Fedorov | CC BY-SA 4.0 | [Catalogue](https://commons.wikimedia.org/wiki/File:Konyr_Aulie_East_Kz.jpg) |
| `media/stories/zhidebay-house.webp` | Yakov Fedorov | CC BY-SA 3.0 | [Catalogue](https://commons.wikimedia.org/wiki/File:Abai_House_in_Zhidebay.JPG) |
| `media/stories/zhidebay-exhibits.webp` | Almagul Ibragimova | CC BY-SA 4.0 | [Catalogue](https://commons.wikimedia.org/wiki/File:Museum_exhibits_in_Zhidebay.jpg) |
| `media/stories/borili-museum.webp` | Ерден Карсыбеков | CC BY-SA 4.0 | [Catalogue](https://commons.wikimedia.org/wiki/File:Auezov_museum_in_Borili.jpg) |
| `media/stories/auezov-coin-1997.webp` | National Bank of the Republic of Kazakhstan | Public domain | [Catalogue](https://commons.wikimedia.org/wiki/File:KZ-1997-20tenge-Auezov.png) |
| `media/stories/auezov-stamp-2022.webp` | Kazpost | Public domain | [Catalogue](https://commons.wikimedia.org/wiki/File:Mukhtar_Auezov_2022_stamp_of_Kazakhstan.jpg) |
| `media/stories/semey-bazaar-1885.webp` | Library of Congress, George Kennan papers | No known restrictions on reproduction | [Catalogue](https://www.loc.gov/item/99615488/) |
| `media/stories/walikhanov-portrait.webp` | Unknown photographer | Public domain | [Catalogue](https://commons.wikimedia.org/wiki/File:Chokan_Valikhanov_portrait.jpg) |

Existing timeline photographs and documents are reused with their original credits from `src/timeline-media.ts` and `src/timeline-culture-media.ts`. The photographed chests are identified as Zhidebay museum exhibits; personal ownership is not asserted without catalogue evidence. The Auezov coin (1997) and stamp (2022) are identified as commemorative issues.
