import { createVercelGuideHandler } from '../server/vercel-guide.ts';

export default createVercelGuideHandler({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
  webSearch: process.env.GUIDE_WEB_SEARCH !== 'false',
});
