import { loadEnv, type Plugin } from 'vite';
import { createGuideMiddleware } from './guide.ts';

export function guidePlugin(): Plugin {
  const middleware = () => {
    // This file is read by Node, never imported by the application or put into dist.
    const env = loadEnv('server', process.cwd(), '');
    return createGuideMiddleware({ apiKey: env.OPENAI_API_KEY, model: env.OPENAI_MODEL || 'gpt-5.4-mini', webSearch: env.GUIDE_WEB_SEARCH !== 'false' });
  };
  return {
    name: 'izqor-guide-api',
    configureServer(server) { server.middlewares.use(middleware()); },
    configurePreviewServer(server) { server.middlewares.use(middleware()); },
  };
}
