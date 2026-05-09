import Link from 'next/link';
import Image from 'next/image';
import type { StoreData } from '@/lib/types';
import { FooterNewsletter } from './FooterNewsletter';
import { getFirstRegionBlock, getRegionBlocks } from '@/lib/store-regions';

interface FooterProps {
  store: StoreData;
}

const PAYSTACK_CURRENCIES = ['NGN', 'GHS', 'KES', 'ZAR'];

export function Footer({ store }: FooterProps) {
  const year = new Date().getFullYear();
  const isPaystack = PAYSTACK_CURRENCIES.includes(store.currency);
  const newsletterBlock = getFirstRegionBlock(store, 'footer', 'footer.newsletter');
  const brandBlock = getFirstRegionBlock(store, 'footer', 'footer.brand');
  const linkGroups = getRegionBlocks(store, 'footer', 'footer.linkGroup');
  const legalBlock = getFirstRegionBlock(store, 'legalFooter', 'legal.footer');
  const newsletterHeading = newsletterBlock?.data.heading ?? 'Stay in the loop';
  const newsletterBody =
    newsletterBlock?.data.body ?? 'New arrivals, exclusive offers and more.';
  const brandBody = brandBlock?.data.body ?? 'Quality products, delivered with care.';
  const legalCopyright =
    legalBlock?.data.copyrightText ?? `© ${year} ${store.name}. All rights reserved.`;
  const showPaymentProvider = legalBlock?.data.showPaymentProvider ?? true;
  const showPoweredBy = legalBlock?.data.showPoweredBy ?? true;

  return (
    <footer className="mt-auto">
      <div className="bg-[var(--colour-primary)] py-14 px-4">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3
                className="text-xl font-bold text-white"
                style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
              >
                {newsletterHeading}
              </h3>
              <p className="mt-1 text-sm text-white/60">{newsletterBody}</p>
            </div>
            <FooterNewsletter />
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-[var(--colour-primary)]/8 py-14 px-4">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
            <div className="col-span-2 md:col-span-1 space-y-4">
              {store.logoUrl ? (
                <Image
                  src={store.logoUrl}
                  alt={store.name}
                  width={100}
                  height={32}
                  className="h-7 w-auto object-contain"
                />
              ) : (
                <span
                  className="block text-base font-bold text-[var(--colour-primary)]"
                  style={{ fontFamily: 'var(--font-display, var(--font-body))' }}
                >
                  {store.name}
                </span>
              )}
              <p className="text-sm text-[var(--colour-primary)] opacity-50 leading-relaxed max-w-[200px]">
                {brandBody}
              </p>
            </div>

            {linkGroups.map((group) => (
              <div key={group.id} className="space-y-4">
                <h4 className="text-xs uppercase tracking-[0.15em] font-semibold text-[var(--colour-primary)] opacity-40">
                  {group.data.heading}
                </h4>
                <ul className="space-y-3">
                  {group.data.links.map((link) => (
                    <li key={`${group.id}-${link.label}`}>
                      {link.href ? (
                        <Link
                          href={link.href}
                          className="text-sm text-[var(--colour-primary)] opacity-60 hover:opacity-100 transition-opacity"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <span className="text-sm text-[var(--colour-primary)] opacity-40 cursor-default">
                          {link.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-[var(--colour-primary)]/8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--colour-primary)] opacity-35">
              {legalCopyright}
            </p>
            <div className="flex items-center gap-4">
              {showPaymentProvider && (
                <span className="text-xs text-[var(--colour-primary)] opacity-30">
                  Secure payments by {isPaystack ? 'Paystack' : 'Stripe'}
                </span>
              )}
              {showPaymentProvider && showPoweredBy && (
                <span className="text-xs text-[var(--colour-primary)] opacity-20">·</span>
              )}
              {showPoweredBy && (
                <span className="text-xs text-[var(--colour-primary)] opacity-30">
                  Powered by Fynfloo
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
