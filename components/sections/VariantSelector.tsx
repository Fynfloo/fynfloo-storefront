// components/sections/VariantSelector.tsx
'use client';

import type { ProductOption, ProductVariant } from '@/lib/types';

// ─── Colour swatch helper ─────────────────────────────────────────────────────

const COLOUR_NAMES: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  purple: '#a855f7',
  pink: '#ec4899',
  grey: '#6b7280',
  gray: '#6b7280',
  navy: '#1e3a5f',
  brown: '#92400e',
  beige: '#d4b896',
  cream: '#fffdd0',
  gold: '#d4a017',
  silver: '#c0c0c0',
};

function isColourOption(name: string): boolean {
  return name.toLowerCase() === 'colour' || name.toLowerCase() === 'color';
}

function getColourHex(value: string): string | null {
  return COLOUR_NAMES[value.toLowerCase()] ?? null;
}

// ─── Option button ────────────────────────────────────────────────────────────

/**
 * Determines if a specific option value is available given the currently
 * selected options for other axes. A value is unavailable if every variant
 * that includes it is out of stock (and not oversellable).
 */
function isValueAvailable(
  optionName: string,
  value: string,
  variants: ProductVariant[],
  selectedOptions: Record<string, string>,
): boolean {
  const matchingVariants = variants.filter((v) => {
    // Must include this option value
    if (v.options[optionName] !== value) return false;
    // Must match all other currently selected options
    for (const [k, val] of Object.entries(selectedOptions)) {
      if (k === optionName) continue;
      if (val && v.options[k] !== val) return false;
    }
    return true;
  });

  if (matchingVariants.length === 0) return false;

  // Available if at least one matching variant has stock
  return matchingVariants.some((v) => {
    if (!v.trackQuantity) return true;
    if (v.allowOversell) return true;
    return (v.onHand ?? 0) > 0;
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantSelectorProps {
  options: ProductOption[];
  variants: ProductVariant[];
  selectedOptions: Record<string, string>;
  onOptionChange: (optionName: string, value: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VariantSelector({
  options,
  variants,
  selectedOptions,
  onOptionChange,
}: VariantSelectorProps) {
  if (options.length === 0) return null;

  return (
    <div className="space-y-4">
      {options.map((option) => {
        const isColour = isColourOption(option.name);
        const selectedValue = selectedOptions[option.name];

        return (
          <div key={option.id} className="space-y-2">
            {/* Option label */}
            <div className="flex items-baseline gap-2">
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--colour-primary, #000)' }}
              >
                {option.name}
              </span>
              {selectedValue && (
                <span
                  className="text-sm"
                  style={{ color: 'var(--colour-primary, #000)', opacity: 0.5 }}
                >
                  {selectedValue}
                </span>
              )}
            </div>

            {/* Option values */}
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected = selectedValue === value;
                const available = isValueAvailable(option.name, value, variants, selectedOptions);
                const hex = isColour ? getColourHex(value) : null;

                if (isColour && hex) {
                  // ── Colour swatch button ──────────────────────────────────
                  return (
                    <button
                      key={value}
                      type="button"
                      title={value}
                      onClick={() => available && onOptionChange(option.name, value)}
                      disabled={!available}
                      className="relative w-8 h-8 rounded-full transition-all duration-150 flex-shrink-0"
                      style={{
                        background: hex,
                        border: isSelected
                          ? '2px solid var(--colour-primary, #000)'
                          : '2px solid transparent',
                        outline: isSelected
                          ? '2px solid var(--colour-bg, #fff)'
                          : '1px solid rgba(0,0,0,0.12)',
                        outlineOffset: isSelected ? '-4px' : '0',
                        opacity: available ? 1 : 0.35,
                        cursor: available ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {/* Strikethrough line for unavailable */}
                      {!available && (
                        <span
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          aria-hidden
                        >
                          <span
                            className="block w-full h-px rotate-45"
                            style={{ background: 'rgba(0,0,0,0.4)' }}
                          />
                        </span>
                      )}
                    </button>
                  );
                }

                // ── Text option button ────────────────────────────────────
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => available && onOptionChange(option.name, value)}
                    disabled={!available}
                    className="relative px-3 py-1.5 text-sm rounded-[var(--radius-button,4px)] transition-all duration-150 flex-shrink-0"
                    style={{
                      background: isSelected ? 'var(--colour-primary, #000)' : 'transparent',
                      color: isSelected ? 'var(--colour-bg, #fff)' : 'var(--colour-primary, #000)',
                      border: '1px solid var(--colour-primary, #000)',
                      opacity: available ? 1 : 0.35,
                      cursor: available ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {value}
                    {/* Strikethrough overlay for unavailable */}
                    {!available && (
                      <span
                        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-[var(--radius-button,4px)]"
                        aria-hidden
                      >
                        <span
                          className="block w-[140%] h-px rotate-[-20deg]"
                          style={{ background: 'var(--colour-primary, #000)', opacity: 0.4 }}
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
