# Guide integration

The guide uses OpenAI Responses through a same-origin Node handler. server/guide.ts
owns canonical content, validation, citations and provider calls. server/vite-guide.ts
mounts the route in both Vite development and production preview. The avatar remains
independent; src/GuidePanel.tsx owns the conversational interface.

## Local setup

Keep public configuration in the ignored .env.local:

    VITE_GUIDE_ENDPOINT=/api/guide

Keep credentials only in the ignored .env.server.local:

Copy `.env.server.example` to `.env.server.local` as a starting point. Browser
configuration has a separate `.env.example` template.

    OPENAI_API_KEY=your-key
    OPENAI_MODEL=gpt-5.4-mini
    GUIDE_WEB_SEARCH=true

Run npm run dev, or npm run build followed by npm start for the built site and API
at http://127.0.0.1:4173. Restart the server after changing its key or model. Rebuild
after changing VITE_GUIDE_ENDPOINT. A credential must never have a VITE_ prefix.

The dist directory is static client code. Static-only hosting also needs a separate
same-origin deployment of the API: uploading dist alone does not deploy this handler.
The local servers bind to loopback. The production client and guide API are hosted
at https://izqor-abai.vercel.app . The first deployment uses the official Vercel
CLI; automatic deployments require connecting GitHub to the Vercel account.

## Vercel

`vercel.json` configures the Vite build and Node.js functions at `/api/guide` and
`/api/guide/status`. `server/vercel-guide.ts` keeps the function alive until the
HTTP response finishes. The shared handler accepts both Vercel's parsed JSON body
and Vite's raw request stream with the same validation and 96 KB limit.

Set `OPENAI_API_KEY`, `OPENAI_MODEL` and `GUIDE_WEB_SEARCH` in the project's server
environment. Set `VITE_2GIS_API_KEY` and `VITE_GUIDE_ENDPOINT=/api/guide` before the
build. Never put the server key in a `VITE_` variable. Functions allow 60 seconds
for an answer; the upstream timeout remains 45 seconds. Re-deploy after changing
environment variables. Runtime rate/concurrency guards are per function instance;
they are not a global account spending cap across serverless instances.

Official runtime reference: https://vercel.com/docs/functions/runtimes/node-js .

## HTTP contract

GET /api/guide/status returns { configured, webSearch }, with no credential.
POST /api/guide accepts application/json:

    {
      "question": "What connects this house with Abai?",
      "locale": "en",
      "placeId": "semey",
      "history": [
        { "role": "user", "content": "Tell me about Abai." },
        { "role": "assistant", "content": "..." }
      ]
    }

Question: 1-1200 characters; locale: kk/ru/en; place: an existing project ID.
History: up to four complete user/assistant pairs, 24,000 characters total.
The server ignores client source context, credentials and model overrides. It
resolves all five places, the full six editorial timeline chapters (paragraphs,
facts and cultural material), source records, site capabilities and population data
itself. src/guide-knowledge.ts provides a shared source registry so timeline and
cultural sources are also accepted and displayed by the browser.

A response contains answer, citationIds, links, basis and supported. Each link has
start/end positions of its visible [number], title and HTTPS URL. basis is project,
web or general. General explanations can have no sources; the UI labels them instead
of attaching an unrelated project citation. Project links require known source IDs;
web links require actual provider citation annotations. The browser validates them
again. Model HTML/Markdown stays escaped, inert text. Citations are clickable inline.

The guide prioritizes relevant site material and answers questions about the whole
history of Kazakhstan, including periods outside the six chapters. It can also
answer other general questions. The selected place only resolves "here".
The model continues dialogue, corrects false premises, and can make one focused
web search for current, explicitly requested or uncertain information. Search is
restricted to museum, tourism, archival, academic and official domains listed in
server/guide.ts. Historical evidence, folklore and artistic reconstruction remain
distinct. The guide must not claim that camera AR or a GPS city quest is implemented.

RU / KK / EN in the dialog sets the answer language and the site language. The
server sends a final localized developer message to reinforce it even when the
question or search results use another language. A conservative script check
rejects clear language mismatches; it is not a linguistic quality guarantee and
does not trigger a second paid generation.
Unresolved internal citation tokens are rejected instead of displayed as sources.

## Failure and cost bounds

- 24 requests/minute per socket IP; three concurrent provider calls; at most 1800
  output tokens and one web tool call per question. There are no automatic paid retries.
- Server timeout: 45 seconds; client timeout: 60 seconds. Changing locale/place,
  closing the dialog or starting over aborts the request and its upstream call.
- Same-origin JSON requests only, at most 96 KB. Raw provider errors and keys are
  neither returned to the browser nor logged by the handler.
- Provider errors map to localized client notices. The UI uses a simple service
  notice and labels every reference fallback explicitly. A fallback looks up the
  question's historical topic or named place across the site; it uses the selected
  place for deictic questions only. Missing topics yield an honest no-evidence
  message, never an unrelated place description. A fallback is not an AI response.
- Six turns survive closing the dialog, changing language and changing the selected
  place in page memory; the latest four successful AI pairs go to the model within
  the 24,000-character budget. Fallbacks/errors are excluded from model history.
  Previous answers keep their original language. New conversation clears them;
  reload clears all. No localStorage chat
  persistence or server-side conversation database is used.
- OpenAI requests use store=false. This does not describe separate provider
  abuse-monitoring retention policies.

npm test includes mocked provider/HTTP tests without paid calls. The diagnostic
browser scripts described below and their `.research` fixtures are local working
tools, excluded from the GitHub source package; they are not part of `npm test`.
The separate
node tools/verify-guide.mjs script makes SIX REAL PAID requests sequentially, then
checks UI memory, mobile layout, failures, citations and credential isolation.
Its artifacts are in .research/guide-api/.

node tools/verify-guide-history.mjs --live makes up to TWELVE REAL PAID requests,
sequentially without retries. It checks cross-language questions, national-history
dates, topics outside the site, multilingual follow-ups, actual web citations,
false premises, site capabilities, mobile layout, fallback and credential isolation
through the built site's browser UI. Artifacts: .research/guide-history/. Use
--case=ID for one independent case. Set GUIDE_VERIFY_ORIGIN to test another local
preview port. Assertions are regression evidence, not proof of exhaustive historical
accuracy. tools/verify-guide-ui.mjs exercises UI failures and layouts with mocked
responses and makes no paid calls.

The existing memory recorder remains local-only. Text chat does not enable paid
voice generation, microphone upload or transcription.
