import Link from 'next/link';
import type { MouseEventHandler, ReactNode } from 'react';

type StoreLinkProps = {
  href: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  ariaLabel?: string;
};

export function StoreLink({
  href,
  external = false,
  className,
  children,
  onClick,
  ariaLabel,
}: StoreLinkProps) {
  if (external) {
    const isHttp = /^(https?:)?\/\//i.test(href);

    return (
      <a
        href={href}
        className={className}
        onClick={onClick}
        aria-label={ariaLabel}
        target={isHttp ? '_blank' : undefined}
        rel={isHttp ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
