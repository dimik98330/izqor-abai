# Main screen work — 20 October 2026

This chat owns the home screen composition, the interactive regional sculpture,
responsive layout and its verification. The other active chat owns the guide,
avatar and onboarding. Preserve its files and data-tour / data-start-tour hooks.

Implementation: new HomeJourney and RegionScene components with isolated CSS;
only replace the existing home hero block in App.tsx. Keep the full Atlas route,
stories, source data, translations and guide integration intact.

Design contract: the regional atlas is visible on entry; readable title measure,
clear map / story actions, a real OSM boundary, five existing place coordinates,
pointer and button camera controls, three languages, large text and reduced motion.
The sculpture is a stylized geographic overview, not measured terrain elevation.
It loads local data and works without external map tiles. The list of stories is
available if WebGL is unavailable. Target viewports: 390x844, 1440x960, 2560x1349.
