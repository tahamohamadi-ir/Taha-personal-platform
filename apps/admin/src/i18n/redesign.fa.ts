// Persian strings for the redesign area (Track AF).
// Canonical Appendix A strings are copied byte-exact (ZWNJ preserved) from
// docs/plan/TRACK-AF-admin-spa-task-list.md. Composites beyond Appendix A are
// flagged in the packet WORK_LOG for owner review.

export const redesignFa: Record<string, string> = {
  // nav
  "redesign.nav.group": "بازطراحی",
  "redesign.nav.homeComposer": "چیدمان صفحهٔ اصلی",
  // screen chrome
  "redesign.home.title": "چیدمان صفحهٔ اصلی",
  "redesign.home.locale.fa": "فارسی",
  "redesign.home.locale.en": "English",
  "redesign.home.loading": "در حال بارگذاری…",
  "redesign.home.loadFailed": "بارگذاری ناموفق بود.",
  "redesign.home.retry": "تلاش دوباره",
  "redesign.home.revision": "نسخه",
  "redesign.home.emptyServer": "ردیفی برای این زبان ثبت نشده است؛ پیش‌فرض هر هشت ماژول نمایش داده می‌شود.",
  // row anatomy
  "redesign.home.column.module": "ماژول",
  "redesign.home.visible": "نمایش در سایت",
  "redesign.home.order": "ترتیب",
  "redesign.home.selectionMode": "حالت انتخاب",
  "redesign.home.provenance": "مآخذ",
  "redesign.home.moveUp": "انتقال به بالا",
  "redesign.home.moveDown": "انتقال به پایین",
  // selection_mode chip trio (Appendix A)
  "redesign.home.mode.manual": "انتخاب دستی",
  "redesign.home.mode.rule": "قانون",
  "redesign.home.mode.hybrid": "ترکیبی",
  // footer actions (Appendix A)
  "redesign.home.save": "ذخیره",
  "redesign.home.validate": "اعتبارسنجی",
  "redesign.home.saving": "در حال ذخیره…",
  "redesign.home.validating": "در حال اعتبارسنجی…",
  "redesign.home.saved": "ذخیره شد.",
  "redesign.home.saveFailed": "ذخیره ناموفق بود.",
  "redesign.home.validated": "اعتبارسنجی موفق بود.",
  "redesign.home.validationFailed": "اعتبارسنجی ناموفق بود.",
  "redesign.home.dirtyLeave": "تغییرات ذخیره‌نشده وجود دارد. با تغییر زبانه از دست می‌روند. ادامه می‌دهید؟",
  "redesign.home.unsavedBadge": "ذخیره‌نشده",
  // conflict dialog (Appendix A title + reload label)
  "redesign.conflict.title": "تعارض نسخه — نسخهٔ سرور تغییر کرده است",
  "redesign.conflict.reload": "بارگذاری مجدد تغییرات من",
  "redesign.conflict.keepMine": "نگه‌داشتن نسخهٔ من",
  "redesign.conflict.body": "نسخهٔ سمت سرور پس از آخرین بارگذاری شما تغییر کرده است. با «بارگذاری مجدد» ردیف‌ها و نسخه از سرور جایگزین می‌شوند و تغییرات شما از دست می‌رود؛ با «نگه‌داشتن نسخهٔ من» به ویرایش همین تغییرات ادامه می‌دهید.",
  "redesign.conflict.serverRows": "وضعیت فعلی سرور",
  // module key labels (composed; owner review noted in WORK_LOG)
  "redesign.module.identity": "هویت",
  "redesign.module.graph": "گراف",
  "redesign.module.research-fit": "تناسب پژوهشی",
  "redesign.module.journey": "مسیر",
  "redesign.module.projects": "پروژه‌ها",
  "redesign.module.publications": "انتشارات",
  "redesign.module.previews": "پیش‌نمایش‌ها",
  "redesign.module.cta": "فراخوان کنش",
  // stable field tokens → localized messages
  "redesign.token.UNKNOWN_KEY": "کلید ناشناس",
  "redesign.token.DUPLICATE_ORDER": "ترتیب تکراری",
  "redesign.token.BAD_ENUM": "مقدار نامعتبر",
  "redesign.token.DUPLICATE_KEY": "کلید تکراری",
  "redesign.token.TOO_LONG": "متن بیش از حد طولانی",
};
