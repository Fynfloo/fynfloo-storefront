'use client';

import { createPortal } from 'react-dom';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import type { RegionDocument, RegionKey, Section, StoreData } from '@/lib/types';
import {
  SITE_EDITOR_PREVIEW_SOURCE,
  type SiteEditorPreviewMessage,
  type SiteEditorNodeClickMessage,
} from '@/lib/site-editor-preview';
import { MotionConfig } from 'framer-motion';
import { CategoryGrid } from '@/components/sections/CategoryGrid';
import { HeroBasic } from '@/components/sections/HeroBasic';
import { Testimonials } from '@/components/sections/Testimonials';
import { TextWithMedia } from '@/components/sections/TextWithMedia';

type SiteEditorPreviewContextValue = {
  selectedNodeId: string | null;
  sectionOverrides: Record<string, Section>;
  regionOverrides: Partial<Record<RegionKey, RegionDocument>> | null;
};

const SiteEditorPreviewContext = createContext<SiteEditorPreviewContextValue>({
  selectedNodeId: null,
  sectionOverrides: {},
  regionOverrides: null,
});

function getAllowedOrigin(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  if (!document.referrer) {
    return null;
  }

  try {
    return new URL(document.referrer).origin;
  } catch {
    return null;
  }
}

function isSiteEditorPreviewMessage(data: unknown): data is SiteEditorPreviewMessage {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const value = data as { source?: unknown; type?: unknown };

  return (
    value.source === SITE_EDITOR_PREVIEW_SOURCE &&
    (value.type === 'site-editor:ready' ||
      value.type === 'site-editor:select-node' ||
      value.type === 'site-editor:preview-section' ||
      value.type === 'site-editor:preview-regions')
  );
}

function postNodeClick(nodeId: string): void {
  const origin = getAllowedOrigin();
  if (!origin || window.parent === window) {
    return;
  }

  const message: SiteEditorNodeClickMessage = {
    source: SITE_EDITOR_PREVIEW_SOURCE,
    type: 'site-editor:node-click',
    nodeId,
  };

  window.parent.postMessage(message, origin);
}

function findNodeElement(nodeId: string): HTMLElement | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const selectorValue = nodeId.replaceAll('"', '\\"');
  return document.querySelector<HTMLElement>(`[data-site-editor-node-id="${selectorValue}"]`);
}

function getSectionLabel(type: string): string {
  switch (type) {
    case 'hero.basic': return 'Hero';
    case 'content.textWithMedia': return 'Text & Media';
    case 'content.testimonials': return 'Testimonials';
    case 'commerce.categoryGrid': return 'Category Grid';
    case 'commerce.featuredCarousel': return 'Featured Carousel';
    case 'commerce.productGrid': return 'Product Grid';
    default: return type;
  }
}

function getSharedRegionLabel(nodeId: string): string {
  if (!nodeId.startsWith('shared:')) return '';
  const region = nodeId.slice(7);
  switch (region) {
    case 'header': return 'Header';
    case 'footer': return 'Footer';
    case 'announcement': return 'Announcement';
    case 'comingSoon': return 'Coming Soon';
    default: return region.charAt(0).toUpperCase() + region.slice(1);
  }
}

// ---------------------------------------------------------------------------
// Portal-based highlight — renders at document.body so it sits above all
// stacking contexts in the iframe (including the sticky nav at z-50).
// RAF loop continuously tracks the selected element's viewport rect so the
// ring follows the element on scroll, resize, and layout shift.
// ---------------------------------------------------------------------------

type HighlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: string;
  label: string;
};

function SiteEditorHighlight() {
  const { selectedNodeId } = useSiteEditorPreview();
  const [highlight, setHighlight] = useState<HighlightRect | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastKeyRef = useRef('');

  useEffect(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (!selectedNodeId) {
      setHighlight(null);
      lastKeyRef.current = '';
      return;
    }

    function tick() {
      const el = findNodeElement(selectedNodeId!);

      if (!el) {
        // Element not in DOM yet (page transition); keep polling.
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const r = el.getBoundingClientRect();

      // Skip if nothing moved — avoids flooding React with state updates.
      const key = `${r.top.toFixed(1)},${r.left.toFixed(1)},${r.width.toFixed(1)},${r.height.toFixed(1)}`;
      if (key !== lastKeyRef.current) {
        lastKeyRef.current = key;
        setHighlight({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
          borderRadius: window.getComputedStyle(el).borderRadius,
          label: el.dataset.siteEditorLabel ?? '',
        });
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [selectedNodeId]);

  if (!highlight || typeof document === 'undefined') return null;

  // Show the label tab above the element when there is viewport space for it,
  // otherwise tuck it inside the top-left corner so it stays visible.
  const labelAbove = highlight.top > 36;

  return createPortal(
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: highlight.top,
        left: highlight.left,
        width: highlight.width,
        height: highlight.height,
        pointerEvents: 'none',
        zIndex: 9999,
        borderRadius: highlight.borderRadius || undefined,
        // Inset ring so the 2 px border sits exactly on the element edge.
        boxShadow: 'inset 0 0 0 2px rgba(37, 99, 235, 0.9)',
      }}
    >
      {/* Corner handles — 7 × 7 px filled squares at each corner */}
      {(
        [
          { top: -4, left: -4 },
          { top: -4, right: -4 },
          { bottom: -4, left: -4 },
          { bottom: -4, right: -4 },
        ] as CSSProperties[]
      ).map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 7,
            height: 7,
            borderRadius: 1,
            background: '#2563eb',
            ...pos,
          }}
        />
      ))}

      {/* Label pill */}
      {highlight.label && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            ...(labelAbove
              ? {
                  bottom: '100%',
                  marginBottom: 3,
                  borderRadius: '4px 4px 0 0',
                }
              : {
                  top: 0,
                  borderRadius: '0 0 4px 0',
                }),
            background: 'rgba(37, 99, 235, 0.92)',
            backdropFilter: 'blur(4px)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 1,
            padding: '4px 8px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          {highlight.label}
        </div>
      )}
    </div>,
    document.body,
  );
}

export function SiteEditorPreviewProvider({ children }: { children: ReactNode }) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [sectionOverrides, setSectionOverrides] = useState<Record<string, Section>>({});
  const [regionOverrides, setRegionOverrides] = useState<
    Partial<Record<RegionKey, RegionDocument>> | null
  >(null);

  useEffect(() => {
    const allowedOrigin = getAllowedOrigin();

    if (allowedOrigin && window.parent !== window) {
      window.parent.postMessage(
        {
          source: SITE_EDITOR_PREVIEW_SOURCE,
          type: 'site-editor:ready',
        },
        allowedOrigin,
      );
    }

    function handleMessage(event: MessageEvent) {
      if (!allowedOrigin || event.origin !== allowedOrigin) {
        return;
      }

      if (!isSiteEditorPreviewMessage(event.data)) {
        return;
      }

      if (event.data.type === 'site-editor:select-node') {
        setSelectedNodeId(event.data.nodeId);
        return;
      }

      if (event.data.type === 'site-editor:preview-regions') {
        setRegionOverrides(event.data.regions ?? null);
        return;
      }

      if (event.data.type === 'site-editor:ready') {
        return;
      }

      setSectionOverrides((current) => {
        if (!event.data.section) {
          if (!(event.data.nodeId in current)) {
            return current;
          }

          const next = { ...current };
          delete next[event.data.nodeId];
          return next;
        }

        return {
          ...current,
          [event.data.nodeId]: event.data.section,
        };
      });
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!selectedNodeId) {
      return;
    }

    const node = findNodeElement(selectedNodeId);
    if (!node) {
      return;
    }

    node.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
  }, [selectedNodeId]);

  const value = useMemo(
    () => ({
      selectedNodeId,
      sectionOverrides,
      regionOverrides,
    }),
    [regionOverrides, sectionOverrides, selectedNodeId],
  );

  return (
    <SiteEditorPreviewContext.Provider value={value}>
      {children}
      <SiteEditorHighlight />
    </SiteEditorPreviewContext.Provider>
  );
}

export function useSiteEditorPreview() {
  return useContext(SiteEditorPreviewContext);
}

export function useSiteEditorPreviewStore(store: StoreData): StoreData {
  const { regionOverrides } = useSiteEditorPreview();

  return useMemo(() => {
    if (!regionOverrides) {
      return store;
    }

    return {
      ...store,
      regions: {
        ...(store.regions ?? {}),
        ...regionOverrides,
      },
    };
  }, [regionOverrides, store]);
}

export function PreviewSelectableBox({
  nodeId,
  children,
}: {
  nodeId: string;
  children: ReactNode;
}) {
  const label = getSharedRegionLabel(nodeId);

  return (
    <div
      data-site-editor-node-id={nodeId}
      data-site-editor-label={label || undefined}
      className="relative"
      style={{ scrollMarginTop: '7rem' }}
      onClick={() => postNodeClick(nodeId)}
    >
      {children}
    </div>
  );
}

function renderLiveSection(section: Section): ReactNode | null {
  let component: ReactNode | null = null;
  switch (section.type) {
    case 'hero.basic':
      component = <HeroBasic data={section.data} />;
      break;
    case 'content.textWithMedia':
      component = <TextWithMedia data={section.data} />;
      break;
    case 'content.testimonials':
      component = <Testimonials data={section.data} />;
      break;
    case 'commerce.categoryGrid':
      component = <CategoryGrid data={section.data} />;
      break;
    default:
      return null;
  }
  return <MotionConfig reducedMotion="always">{component}</MotionConfig>;
}

export function PreviewSectionShell({
  nodeId,
  section,
  children,
}: {
  nodeId: string;
  section: Section;
  children: ReactNode;
}) {
  const { selectedNodeId, sectionOverrides } = useSiteEditorPreview();
  const selected = selectedNodeId === nodeId;
  const override = sectionOverrides[nodeId] ?? null;
  const effectiveSection = override ?? section;
  const liveSection = renderLiveSection(effectiveSection);
  const label = getSectionLabel(effectiveSection.type);

  const content =
    effectiveSection.visible === false ? (
      selected ? (
        <div
          className="px-4 py-5 text-sm text-center"
          style={{
            border: '1px solid rgba(37, 99, 235, 0.2)',
            borderRadius: 6,
            color: 'rgba(15, 23, 42, 0.45)',
            background: 'rgba(37, 99, 235, 0.02)',
            margin: '0 1rem',
          }}
        >
          This section is hidden.
        </div>
      ) : null
    ) : (
      liveSection ?? children
    );

  return (
    <div
      data-site-editor-node-id={nodeId}
      data-site-editor-selected={selected ? 'true' : undefined}
      data-site-editor-label={label}
      className="relative"
      style={{ scrollMarginTop: '7rem' }}
      onClick={() => postNodeClick(nodeId)}
    >
      {content}
    </div>
  );
}
