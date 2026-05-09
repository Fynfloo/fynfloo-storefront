import type { RegionBlock, RegionDocument, RegionKey, StoreData } from './types';

export function getRegion(store: StoreData, key: RegionKey): RegionDocument | null {
  return store.regions?.[key] ?? null;
}

export function getRegionBlocks<TType extends RegionBlock['type']>(
  store: StoreData,
  key: RegionKey,
  type: TType,
): Array<Extract<RegionBlock, { type: TType }>> {
  const region = getRegion(store, key);

  if (!region || region.visible === false) {
    return [];
  }

  return region.blocks.filter(
    (block): block is Extract<RegionBlock, { type: TType }> =>
      block.type === type && block.visible !== false,
  );
}

export function getFirstRegionBlock<TType extends RegionBlock['type']>(
  store: StoreData,
  key: RegionKey,
  type: TType,
): Extract<RegionBlock, { type: TType }> | null {
  return getRegionBlocks(store, key, type)[0] ?? null;
}
