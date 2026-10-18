import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';

function siteOrigin(request: Request): string {
  try {
    return new URL(request.url).origin;
  } catch {
    return envConfigs.app_url || 'http://localhost:3000';
  }
}

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: ({ request }) => {
        // OAI-SearchBot = ChatGPT Search crawl (allow). GPTBot = model-training
        // crawl (disallow). Specific user-agent groups do not inherit from `*`,
        // so OAI-SearchBot repeats the same public-path Disallows.
        // @see https://developers.openai.com/api/docs/bots
        const publicDisallows = [
          'Disallow: /admin',
          'Disallow: /settings',
          'Disallow: /creations',
          'Disallow: /api/',
          'Disallow: /sign-in',
          'Disallow: /sign-up',
          'Disallow: /verify-email',
          'Disallow: /forgot-password',
          'Disallow: /reset-password',
          'Disallow: /auth-callback',
          'Disallow: /redeem-invite',
          'Disallow: /*?*',
        ];

        const body = [
          'User-agent: OAI-SearchBot',
          'Allow: /',
          ...publicDisallows,
          '',
          'User-agent: GPTBot',
          'Disallow: /',
          '',
          'User-agent: *',
          'Allow: /',
          ...publicDisallows,
          '',
          `Sitemap: ${siteOrigin(request)}/sitemap.xml`,
          '',
        ].join('\n');
        return new Response(body, {
          headers: { 'Content-Type': 'text/plain' },
        });
      },
    },
  },
});
