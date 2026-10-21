# Atlas page / #/map

Scope: replace the map route only. Keep shared navigation, other routes, real
place content, coordinates, photo credits, sources and KK/RU/EN support.

The user requested autonomous implementation from one visual reference. The
chosen generated reference is `.research/atlas-page-redesign/reference.png`.
It specifies composition, not geographic or historical evidence. Implement
real map data and existing photographs; never use its invented geography,
coordinates, photo details or descriptions as content.

Mode: Operate with an editorial cultural identity. The primary action is
selecting a place and opening its story.

Composition: compact heading, then a three-column atlas (searchable place
list / dominant interactive map / selected story). On tablet the story runs
below the map; on mobile use heading, map, place list, story in reading order.
Below the atlas, offer three story links: Abai's world in Zhidebay, the cave
and underground lake of Konyr Aulie, and the Kozy Korpesh — Bayan Sulu epic.
Reuse existing place copy and photographs with accessible source credits.

Visual contract: warm ivory ground, restrained sage cartography, deep teal
story panel, brass primary action. Noto Serif and Golos Text follow the
selected comp. Readable 14–16px controls and body text;
serif titles; fine separators; modest corner rounding. No floating story
card covering geography. Numbered markers connect map and list, not routes.

Behavior: search and category filters, synchronized map/list selection,
previous/next place, whole-region reset, terrain toggle, map retry, complete
list alternative when WebGL/network fails. Honor reduced motion, large
text, contrast and keyboard focus. Do not present a travel itinerary.

Verification: compare rendered desktop composition to the reference, check
1440/1024/390px, all languages, long place names, empty results, controls,
story navigation and map failure. Save screenshots and results under
`.research/atlas-page-redesign/`.

Refinement after visual review: compare at a 1536px content width. The header
is 60px, the intro 125px, the left rail 342px, the story panel 418px and the
atlas approximately 610px high. The atlas reaches the page edges. List
thumbnails are 94x70px; numbers precede names; the active row has the comp's
brass edge. Source attribution is available through the map's information
disclosure. The former population chart is replaced by a compact editorial
discovery section, with real links to the three stories. The map route's main
fills the remaining viewport height; the footer keeps its compact content height
at the bottom of the window, with no gap beneath it.
Desktop uses three columns from 1400px; smaller layouts retain the existing
stacked behavior. Preserve real photos, coordinates and geographic data.
