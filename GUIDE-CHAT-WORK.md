# Zholserik conversation UI — active ownership

This chat owns GuidePanel.tsx, new isolated guide-chat.css and guide-chat-copy.ts,
plus the minimal App.tsx dialog callback/title integration. Its task is the
conversation window: hierarchy, typography, text, buttons, icons, message states,
sources and mobile composition. The OpenAI contract and server code are preserved.

The other active chat is redesigning the character/onboarding. This task does not
edit GuideAvatar.tsx, guide-avatar.css, OnboardingGuide.tsx, onboarding.css or their
shared guide-integration.css. Keep the existing avatar props and data-tour hooks.
The user explicitly confirmed: do not message the other chat; change only this
conversation window. The floating launcher remains as it was.
The conversation uses an isolated `izqor-conversation` CSS namespace. Shared
guide-integration.css can theme onboarding without changing this window.

Target evidence: 1440x960, 1024x768, 390x844, all three locales, long messages,
loading with the pending question visible, cancellation, errors/retry, sources,
visible keyboard focus, large text and reduced motion. Mock the guide response for
visual checks; no paid provider calls are needed for this UI change.

References: Bloomberg Connects; Cleveland Museum of Art ArtLens; Carbon Chatbot.
Zack redesign/anti-AI findings: remove duplicate titles and status decoration;
make focus visible; show the pending question; expose sources at readable sizes.
Design Museum: press feedback (110ms, reduced-motion without transform), and
balanced short welcome text. Existing teal/ivory/brass brand takes precedence.

Latest user direction: cinematic video, Inter, white controls. The active stylesheet
is now guide-chat.module.css, with hashed selectors and stable data-ui test hooks.
This prevents shared guide-integration.css from overriding the conversation.
public/guide-cinematic.html is the requested single-file Tailwind CDN counterpart.
See GUIDE-CINEMATIC.md for the final visual contract and verification.
