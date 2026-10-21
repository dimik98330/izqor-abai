# IZQOR story page design study

Open `/design/stories/index.html?place=konyr` on the running local server. This is a separate prototype, not a production app change. The selector changes between all five existing places. Content and source URLs are an exact snapshot of `src/content.ts`; the snapshot generator is `.research/build-story-snapshot.mjs`.

## Reference and design decisions

Primary reading reference: [V&A, An introduction to Art Deco](https://www.vam.ac.uk/articles/an-introduction-to-art-deco/). Adopt the clear reading sequence, deliberate line measure and the separation of display heading, lead, body and captions. This prototype uses IZQOR's own content, images, colors and fonts.

Component references: [shadcn Button](https://ui.shadcn.com/docs/components/base/button), native disclosure, dialog, select and range controls. Original CSS; no registry code or new dependencies. [Rijksmuseum Stories](https://www.rijksmuseum.nl/en/stories) informs photo emphasis as a secondary reference.

- A light split cover replaces darkened full-width photography. Real photo and original credit remain visible.
- Existing local Literata appears only in the page title and continuation heading. Geologica carries subtitle, article headings, body and controls. Russian, Kazakh and English use existing translations and Cyrillic extension subsets.
- One primary green action, neutral secondary actions, one icon family. Gold is restricted to the brand and small navigation accents.
- Body text 18px (20px on wide screens), 1.95 line height; approximately 60–68 characters per line. At phone sizes body starts at 16px and can be enlarged to 19px.
- Sticky table of contents and reading toolbar on desktop. On mobile the contents sit above the article; the compact action toolbar remains available while reading.
- Sources expand directly beside the paragraph with their title, notes and direct external link. The user removed the separate visit/panorama section and end bibliography from all five story pages, including their table-of-contents entry. The guide's source action now opens an inline source. UNESCO Tentative List notes remain intact.
- Photograph enlargement, source disclosures, text sizing, language and place selection, session-only bookmarks, copy link, guide panel and next-place navigation are interactive.

The listening panel is explicitly labeled as a silent player demo. The guide panel displays existing editorial material with a demo label. Real narration and the existing live guide should be reused during production integration. No microphone, generative API, or new backend is called.

The prototype header provides a place selector for comparison. It is a design-review control, not proposed production navigation.

## Rights

Existing local photographs retain their source credits and links. Literata and Geologica are distributed under their existing OFL licenses in `/fonts/landing/`. Lucide geometry is covered by the ISC license reproduced in `../closer/README.md`. No V&A text, imagery or source code is reproduced.
