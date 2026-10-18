import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';

const STATIC_PAGES: { path: string; title: string; description: string }[] = [
  {
    path: '',
    title: 'A2O LITE AI Dance Video Generator',
    description:
      'Upload two photos, keep the fixed NEON duo template, generate an A2O LITE NEON-style dance video',
  },
  {
    path: '/what-is-a2o-lite-ai',
    title: 'What Is A2O LITE AI?',
    description:
      'Plain explainer of the search phrase, the group behind NEON, and Blooming Talk',
  },
  { path: '/pricing', title: 'Pricing', description: 'Pricing plans' },
];

export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      GET: async () => {
        const { app_url, app_name, app_description } = envConfigs;

        const lines: string[] = [
          `# ${app_name}`,
          app_description ||
            'A2O LITE AI — turn two photos into a NEON-style dance video.',
          '',
          '## Pages',
          ...STATIC_PAGES.map(
            (page) =>
              `- [${page.title}](${app_url}${page.path || '/'}): ${page.description}`
          ),
        ];

        return new Response(lines.join('\n') + '\n', {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      },
    },
  },
});
