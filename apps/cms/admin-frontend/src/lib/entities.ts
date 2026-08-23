import type { ContentEntity, ContentLocale, ContentStatus } from "./api";

export interface ContentEntityMeta {
  key: ContentEntity;
  labelFa: string;
}

export const CONTENT_ENTITIES: ContentEntityMeta[] = [
  { key: "landing", labelFa: "صفحه فرود" },
  { key: "profile", labelFa: "پروفایل" },
  { key: "article", labelFa: "نوشته‌ها" },
  { key: "series", labelFa: "سری‌ها" },
  { key: "research-topic", labelFa: "موضوعات پژوهش" },
  { key: "research-statement", labelFa: "بیانیه پژوهش" },
  { key: "project", labelFa: "پروژه‌ها" },
  { key: "publication", labelFa: "انتشارات" },
  { key: "book", labelFa: "کتاب‌ها" },
  { key: "talk", labelFa: "سخنرانی‌ها" },
  { key: "download", labelFa: "دانلودها" },
];

export const DEFAULT_CONTENT_ENTITY: ContentEntity = "article";

const CONTENT_ENTITY_KEYS: ReadonlySet<string> = new Set(
  CONTENT_ENTITIES.map((entity) => entity.key)
);

export function isContentEntity(value: string): value is ContentEntity {
  return CONTENT_ENTITY_KEYS.has(value);
}

export function isContentLocale(value: string): value is ContentLocale {
  return value === "fa" || value === "en";
}

export function isContentStatus(value: string): value is ContentStatus {
  return (
    value === "draft" ||
    value === "review" ||
    value === "scheduled" ||
    value === "published" ||
    value === "archived"
  );
}

export function contentEntityLabel(entity: ContentEntity): string {
  return CONTENT_ENTITIES.find((item) => item.key === entity)?.labelFa ?? entity;
}

export interface ContentStatusMeta {
  key: ContentStatus;
  labelFa: string;
  className: string;
}

export const CONTENT_STATUSES: ContentStatusMeta[] = [
  { key: "draft", labelFa: "پیش‌نویس", className: "admin-status-draft" },
  { key: "review", labelFa: "در بازبینی", className: "admin-status-review" },
  {
    key: "scheduled",
    labelFa: "زمان‌بندی‌شده",
    className: "admin-status-scheduled",
  },
  { key: "published", labelFa: "منتشرشده", className: "admin-status-published" },
  { key: "archived", labelFa: "بایگانی", className: "admin-status-archived" },
];

export interface ResolvedStatusMeta {
  labelFa: string;
  className: string;
}

export function contentStatusMeta(status: string): ResolvedStatusMeta {
  const meta = CONTENT_STATUSES.find((item) => item.key === status);
  if (meta !== undefined) {
    return { labelFa: meta.labelFa, className: meta.className };
  }
  return { labelFa: status, className: "admin-status-unknown" };
}
