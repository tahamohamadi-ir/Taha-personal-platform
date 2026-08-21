import type { ContentStatus } from "./api";
import { contentStatusMeta } from "./entities";

export const TRANSITION_TARGETS: Record<ContentStatus, ContentStatus[]> = {
  draft: ["review", "scheduled", "published", "archived"],
  review: ["draft", "scheduled", "published", "archived"],
  scheduled: ["draft", "published", "archived"],
  published: ["archived"],
  archived: ["draft"],
};

const TRANSITION_LABELS: Record<ContentStatus, string> = {
  review: "ارسال به بازبینی",
  scheduled: "زمان‌بندی انتشار",
  published: "انتشار",
  archived: "بایگانی",
  draft: "بازگردانی به پیشنویس",
};

export function transitionLabel(to: ContentStatus): string {
  return TRANSITION_LABELS[to];
}

export function transitionConfirm(to: ContentStatus): string {
  return `آیا از انجام «${transitionLabel(to)}» این مورد مطمئن هستید؟`;
}

export { contentStatusMeta };
