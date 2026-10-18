import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

type BlogBreadcrumbProps = {
  /** When set, renders Home → Blog → title; otherwise Home → Blog. */
  postTitle?: string;
  className?: string;
};

export function BlogBreadcrumb({ postTitle, className }: BlogBreadcrumbProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/" />}>
            {envConfigs.app_name}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {postTitle ? (
            <BreadcrumbLink render={<Link href="/blog" />}>
              {m['blog.title']()}
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{m['blog.title']()}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {postTitle ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1 max-w-[min(100%,28rem)]">
                {postTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
