import type { LocaleCode } from "./site";

export interface Perspective {
  id: string;
  title: string;
  audience: string;
  description: string;
}

export interface LocaleContent {
  lang: LocaleCode;
  dir: "rtl" | "ltr";
  name: string;
  mark: string;
  shortIdentity: string;
  positioning: string;
  proposition: string;
  gateway: {
    title: string;
    prompt: string;
    englishLabel: string;
    persianLabel: string;
  };
  hero: {
    eyebrow: string;
    primaryCta: string;
    secondaryCta: string;
  };
  perspectives: {
    label: string;
    heading: string;
    intro: string;
    items: Perspective[];
    note: string;
  };
  about: {
    label: string;
    heading: string;
  };
  notfound: {
    code: string;
    skip: string;
    heading: string;
    gatewayLabel: string;
    enLabel: string;
    faLabel: string;
  };
  contact: {
    heading: string;
    unavailable: string;
  };
  footer: {
    tagline: string;
    switchLabel: string;
    copyrightMark: string;
  };
  meta: {
    title: string;
    description: string;
  };
  skip: string;
}

export const content: Record<LocaleCode, LocaleContent> = {
  en: {
    lang: "en",
    dir: "ltr",
    name: "Taha Mohammadi",
    mark: "TM",
    shortIdentity:
      "Interdisciplinary researcher and engineer working on human-centered intelligent systems.",
    positioning: "Design · Interaction · Engineering · Data · AI",
    proposition:
      "I build and study human-centered intelligent systems — from interaction and engineering to data and AI.",
    gateway: {
      title: "Taha Mohammadi · طه محمدی",
      prompt: "Choose your language",
      englishLabel: "English",
      persianLabel: "فارسی",
    },
    hero: {
      eyebrow: "Research · Engineering · Design",
      primaryCta: "Explore by perspective",
      secondaryCta: "About",
    },
    perspectives: {
      label: "01 · Paths",
      heading: "Explore by perspective",
      intro:
        "One identity, multiple entry paths. Choose the route that matches why you are here.",
      items: [
        {
          id: "research",
          title: "Research",
          audience: "Professors · Collaborators · Admission",
          description:
            "Research direction, methods and evidence for academic evaluation and collaboration.",
        },
        {
          id: "engineering",
          title: "Engineering & AI",
          audience: "Managers · R&D leads · Recruiters",
          description:
            "Systems, decisions, trade-offs and outcomes for technical evaluation.",
        },
        {
          id: "writing",
          title: "Writing & Learning",
          audience: "Students · Learners · Readers",
          description:
            "Articles, series and learning resources, documented with reasoning.",
        },
      ],
      note: "These paths open in a later release. For now, this landing introduces the identity and direction.",
    },
    about: {
      label: "02 · Identity",
      heading: "About",
    },
    notfound: {
      code: "404",
      skip: "Skip to content",
      heading: "Page not found",
      gatewayLabel: "Gateway",
      enLabel: "English",
      faLabel: "فارسی",
    },
    contact: {
      heading: "Contact",
      unavailable: "Contact details are not published yet.",
    },
    footer: {
      tagline: "Human-centered intelligent systems.",
      switchLabel: "Language",
      copyrightMark: "©",
    },
    meta: {
      title: "Taha Mohammadi — Human-Centered Intelligent Systems",
      description:
        "Interdisciplinary researcher and engineer building human-centered intelligent systems across design, engineering, data and AI.",
    },
    skip: "Skip to content",
  },
  fa: {
    lang: "fa",
    dir: "rtl",
    name: "طه محمدی",
    mark: "طه",
    shortIdentity:
      "پژوهشگر و مهندس میان‌رشته‌ای در حوزهٔ سیستم‌های هوشمند انسان‌محور.",
    positioning: "طراحی · تعامل · مهندسی · داده · هوش مصنوعی",
    proposition:
      "سیستم‌های هوشمند انسان‌محور را می‌سازم و مطالعه می‌کنم — از تعامل و مهندسی تا داده و هوش مصنوعی.",
    gateway: {
      title: "طه محمدی · Taha Mohammadi",
      prompt: "زبان خود را انتخاب کنید",
      englishLabel: "English",
      persianLabel: "فارسی",
    },
    hero: {
      eyebrow: "پژوهش · مهندسی · طراحی",
      primaryCta: "مشاهده از نگاه شما",
      secondaryCta: "درباره",
    },
    perspectives: {
      label: "۰۱ · مسیرها",
      heading: "مشاهده از نگاه شما",
      intro:
        "یک هویت، چند مسیر ورود. مسیری را انتخاب کنید که با دلیل آمدن شما هم‌خوان است.",
      items: [
        {
          id: "research",
          title: "پژوهش",
          audience: "استادان · همکاران · پذیرش",
          description:
            "مسیر پژوهش، روش‌ها و شواهد برای ارزیابی و همکاری دانشگاهی.",
        },
        {
          id: "engineering",
          title: "مهندسی و هوش مصنوعی",
          audience: "مدیران · رهبران تحقیق و توسعه · استخدام‌کنندگان",
          description:
            "سیستم‌ها، تصمیم‌ها، بده‌بستان‌ها و نتایج برای ارزیابی فنی.",
        },
        {
          id: "writing",
          title: "نوشتن و یادگیری",
          audience: "دانشجویان · یادگیرندگان · خوانندگان",
          description:
            "مقاله‌ها، مجموعه‌ها و منابع یادگیری، مستندشده با استدلال.",
        },
      ],
      note: "این مسیرها در نسخهٔ بعدی باز می‌شوند. فعلاً این صفحهٔ فرود هویت و مسیر را معرفی می‌کند.",
    },
    about: {
      label: "۰۲ · هویت",
      heading: "درباره",
    },
    notfound: {
      code: "404",
      skip: "پرش به محتوا",
      heading: "صفحه پیدا نشد",
      gatewayLabel: "خانه",
      enLabel: "English",
      faLabel: "فارسی",
    },
    contact: {
      heading: "تماس",
      unavailable: "اطلاعات تماس هنوز منتشر نشده است.",
    },
    footer: {
      tagline: "سیستم‌های هوشمند انسان‌محور.",
      switchLabel: "زبان",
      copyrightMark: "©",
    },
    meta: {
      title: "طه محمدی — سیستم‌های هوشمند انسان‌محور",
      description:
        "پژوهشگر و مهندس میان‌رشته‌ای در ساخت سیستم‌های هوشمند انسان‌محور در مرز طراحی، مهندسی، داده و هوش مصنوعی.",
    },
    skip: "پرش به محتوا",
  },
};
