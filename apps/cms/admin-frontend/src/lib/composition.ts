import type {
  CompositionLayout,
  CompositionSchema,
  CompositionSectionDoc,
  CompositionBlockDoc,
} from "./api";

export const SECTION_LAYOUT_LABELS: Record<CompositionLayout, string> = {
  "1col": "۱ ستون",
  "2col": "۲ ستون",
  "3col": "۳ ستون",
};

export const BLOCK_TYPE_LABELS: Record<string, string> = {
  hero: "هرا",
  heading: "عنوان",
  text: "متن",
  quote: "نقل‌قول",
  cta: "فراخوان",
  gallery: "گالری",
  divider: "جداکننده",
};

export function isValidKey(value: string): boolean {
  return /^[a-z0-9-]+$/.test(value);
}

export function emptySection(): CompositionSectionDoc {
  return { layout: "1col", ratio: "", enabled: true, blocks: [] };
}

export function emptyBlock(blockType: string): CompositionBlockDoc {
  return { blockType, settings: {}, enabled: true };
}

export function ratioOptionsFor(
  schema: CompositionSchema,
  layout: CompositionLayout
): string[] {
  const spec = schema.sectionLayouts.find((s) => s.value === layout);
  return spec?.ratios ?? [];
}

export function ratioLabel(ratio: string): string {
  if (ratio === "") {
    return "—";
  }
  return ratio;
}

export function blockLabel(schema: CompositionSchema, blockType: string): string {
  const spec = schema.blockTypes.find((b) => b.type === blockType);
  return spec?.labelFa ?? BLOCK_TYPE_LABELS[blockType] ?? blockType;
}

export function mediaLabel(media: { id: number; title: string }): string {
  return `${media.title} (#${media.id})`;
}

/** Required settings keys per block type — mirrors the backend validation
 * (blocks.py). Used for client-side required-field errors before submit. */
export const REQUIRED_BLOCK_FIELDS: Record<string, string[]> = {
  hero: ["titleFa", "titleEn", "leadFa", "leadEn"],
  heading: ["textFa", "textEn"],
  text: ["bodyFa", "bodyEn"],
  quote: ["bodyFa", "bodyEn", "sourceFa", "sourceEn"],
  cta: ["labelFa", "labelEn"],
  gallery: ["mediaIds"],
};
