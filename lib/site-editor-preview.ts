import type { RegionDocument, RegionKey, Section } from './types';

export const SITE_EDITOR_PREVIEW_SOURCE = 'fynfloo-site-editor';

export type SiteEditorPreviewReadyMessage = {
  source: typeof SITE_EDITOR_PREVIEW_SOURCE;
  type: 'site-editor:ready';
};

export type SiteEditorPreviewSelectNodeMessage = {
  source: typeof SITE_EDITOR_PREVIEW_SOURCE;
  type: 'site-editor:select-node';
  nodeId: string | null;
};

export type SiteEditorPreviewSectionMessage = {
  source: typeof SITE_EDITOR_PREVIEW_SOURCE;
  type: 'site-editor:preview-section';
  nodeId: string;
  section: Section | null;
};

export type SiteEditorPreviewRegionsMessage = {
  source: typeof SITE_EDITOR_PREVIEW_SOURCE;
  type: 'site-editor:preview-regions';
  regions: Partial<Record<RegionKey, RegionDocument>> | null;
};

export type SiteEditorNodeClickMessage = {
  source: typeof SITE_EDITOR_PREVIEW_SOURCE;
  type: 'site-editor:node-click';
  nodeId: string;
};

export type SiteEditorPreviewMessage =
  | SiteEditorPreviewReadyMessage
  | SiteEditorPreviewSelectNodeMessage
  | SiteEditorPreviewSectionMessage
  | SiteEditorPreviewRegionsMessage;

export function getSiteEditorSectionNodeId(section: Pick<Section, 'id'>, index: number): string {
  return section.id ? `section:${section.id}` : `section:${index}`;
}
