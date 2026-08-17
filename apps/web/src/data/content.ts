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
  blog: {
    heading: string;
    intro: string;
    empty: string;
    readingLabel: string;
    licenseLabel: string;
    prevLabel: string;
    nextLabel: string;
    seriesNavLabel: string;
    missingTranslation: string;
  };
  research: {
    heading: string;
    intro: string;
    empty: string;
    topicsHeading: string;
    statementHeading: string;
    statementEmpty: string;
    projectsHeading: string;
    publicationsHeading: string;
    relatedHeading: string;
    availabilityLabel: string;
    codeLabel: string;
    dataLabel: string;
    demoLabel: string;
    licenseLabel: string;
    evidenceHeading: string;
    collaboratorsHeading: string;
    fundingHeading: string;
    contactNote: string;
    missingTranslation: string;
    caseStudyLinkLabel: string;
  };
  projects: {
    heading: string;
    intro: string;
    empty: string;
    depthLabel: string;
    problemHeading: string;
    constraintsHeading: string;
    decisionsHeading: string;
    tradeOffsHeading: string;
    outcomesHeading: string;
    lessonsHeading: string;
    testingHeading: string;
    evidenceHeading: string;
    collaboratorsHeading: string;
    fundingHeading: string;
    diagramsHeading: string;
    screenshotsHeading: string;
    relatedHeading: string;
    topicsHeading: string;
    publicationsHeading: string;
    licenseLabel: string;
    versionLabel: string;
    dateLabel: string;
    availabilityLabel: string;
    codeLabel: string;
    dataLabel: string;
    demoLabel: string;
    missingTranslation: string;
  };
  downloads: {
    heading: string;
    intro: string;
    downloadLabel: string;
    updatedLabel: string;
    fallback: string;
  };
  sections?: {
    experience: string;
    education: string;
    skills: string;
    publications: string;
    research: string;
    certificates: string;
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
  gpaLabel?: string;
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
    blog: {
      heading: "Writing",
      intro:
        "Published articles from the CMS. When the public API is not configured for this build, this list stays empty.",
      empty: "No published articles are available in this build.",
      readingLabel: "min read",
      licenseLabel: "License",
      prevLabel: "Previous in series",
      nextLabel: "Next in series",
      seriesNavLabel: "Series navigation",
      missingTranslation: "This article is not yet translated into Persian.",
    },
    research: {
      heading: "Research",
      intro:
        "Research topics, statement, projects and publications from the CMS. When CMS_API_BASE is not set for this build, lists stay empty.",
      empty: "No published research items are available in this build.",
      topicsHeading: "Topics",
      statementHeading: "Research statement",
      statementEmpty: "No published research statement is available in this build.",
      projectsHeading: "Projects",
      publicationsHeading: "Publications",
      relatedHeading: "Related",
      availabilityLabel: "Availability",
      codeLabel: "Code",
      dataLabel: "Data",
      demoLabel: "Demo",
      licenseLabel: "License",
      evidenceHeading: "Evidence",
      collaboratorsHeading: "Collaborators",
      fundingHeading: "Funding",
      contactNote:
        "For collaboration inquiries, see About. A contact form is not published yet.",
      missingTranslation: "This research page is not yet translated into Persian.",
      caseStudyLinkLabel: "View full case study",
    },
    projects: {
      heading: "Projects",
      intro:
        "Engineering case studies from the CMS. When CMS_API_BASE is not set for this build, this list stays empty.",
      empty: "No published case studies are available in this build.",
      depthLabel: "Depth",
      problemHeading: "Problem",
      constraintsHeading: "Constraints",
      decisionsHeading: "Technical decisions",
      tradeOffsHeading: "Trade-offs",
      outcomesHeading: "Outcomes",
      lessonsHeading: "Lessons learned",
      testingHeading: "Testing",
      evidenceHeading: "Evidence",
      collaboratorsHeading: "Collaborators",
      fundingHeading: "Funding",
      diagramsHeading: "Architecture diagrams",
      screenshotsHeading: "Screenshots",
      relatedHeading: "Related",
      topicsHeading: "Research topics",
      publicationsHeading: "Publications",
      licenseLabel: "License",
      versionLabel: "Version",
      dateLabel: "Date",
      availabilityLabel: "Availability",
      codeLabel: "Code",
      dataLabel: "Data",
      demoLabel: "Demo",
      missingTranslation: "This case study is not yet translated into Persian.",
    },
    downloads: {
      heading: "CV & Resume",
      intro:
        "Current versions of the academic CV and the professional resume. Files are Markdown; PDF editions will replace them when approved.",
      downloadLabel: "Download",
      updatedLabel: "Updated",
      fallback:
        "If a download does not work, the file may be temporarily unavailable; please try again later.",
    },
    sections: {
      experience: "Experience",
      education: "Education",
      skills: "Skills",
      publications: "Publications",
      research: "Research",
      certificates: "Certificates",
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
    gpaLabel: "GPA",
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
    blog: {
      heading: "نوشته‌ها",
      intro:
        "مقاله‌های منتشرشده از CMS. اگر API عمومی برای این build پیکربندی نشده باشد، فهرست خالی می‌ماند.",
      empty: "در این build هیچ مقالهٔ منتشرشده‌ای در دسترس نیست.",
      readingLabel: "دقیقه مطالعه",
      licenseLabel: "مجوز",
      prevLabel: "قبلی در مجموعه",
      nextLabel: "بعدی در مجموعه",
      seriesNavLabel: "ناوبری مجموعه",
      missingTranslation: "این مقاله هنوز به انگلیسی ترجمه نشده است.",
    },
    research: {
      heading: "پژوهش",
      intro:
        "موضوع‌ها، بیانیه، پروژه‌ها و انتشارات پژوهشی از CMS. اگر CMS_API_BASE برای این build تنظیم نشده باشد، فهرست‌ها خالی می‌مانند.",
      empty: "در این build هیچ مورد پژوهشی منتشرشده‌ای در دسترس نیست.",
      topicsHeading: "موضوع‌ها",
      statementHeading: "بیانیهٔ پژوهشی",
      statementEmpty: "در این build بیانیهٔ پژوهشی منتشرشده‌ای در دسترس نیست.",
      projectsHeading: "پروژه‌ها",
      publicationsHeading: "انتشارات",
      relatedHeading: "مرتبط",
      availabilityLabel: "دسترسی",
      codeLabel: "کد",
      dataLabel: "داده",
      demoLabel: "دمو",
      licenseLabel: "مجوز",
      evidenceHeading: "شواهد",
      collaboratorsHeading: "همکاران",
      fundingHeading: "حمایت مالی",
      contactNote:
        "برای همکاری، صفحهٔ درباره را ببینید. فرم تماس هنوز منتشر نشده است.",
      missingTranslation: "این صفحهٔ پژوهشی هنوز به انگلیسی ترجمه نشده است.",
      caseStudyLinkLabel: "مشاهدهٔ مطالعهٔ موردی کامل",
    },
    projects: {
      heading: "پروژه‌ها",
      intro:
        "مطالعات موردی مهندسی از CMS. اگر CMS_API_BASE برای این build تنظیم نشده باشد، فهرست خالی می‌ماند.",
      empty: "در این build هیچ مطالعهٔ موردی منتشرشده‌ای در دسترس نیست.",
      depthLabel: "عمق",
      problemHeading: "مسئله",
      constraintsHeading: "محدودیت‌ها",
      decisionsHeading: "تصمیم‌های فنی",
      tradeOffsHeading: "بده‌بستان‌ها",
      outcomesHeading: "نتایج",
      lessonsHeading: "درس‌های آموخته",
      testingHeading: "آزمون",
      evidenceHeading: "شواهد",
      collaboratorsHeading: "همکاران",
      fundingHeading: "حمایت مالی",
      diagramsHeading: "نمودارهای معماری",
      screenshotsHeading: "نماگرفت‌ها",
      relatedHeading: "مرتبط",
      topicsHeading: "موضوع‌های پژوهشی",
      publicationsHeading: "انتشارات",
      licenseLabel: "مجوز",
      versionLabel: "نسخه",
      dateLabel: "تاریخ",
      availabilityLabel: "دسترسی",
      codeLabel: "کد",
      dataLabel: "داده",
      demoLabel: "دمو",
      missingTranslation: "این مطالعهٔ موردی هنوز به انگلیسی ترجمه نشده است.",
    },
    downloads: {
      heading: "رزومه و CV",
      intro:
        "نسخه‌های فعلی CV دانشگاهی و رزومهٔ حرفه‌ای. فایل‌ها Markdown هستند؛ نسخهٔ PDF پس از تأیید جایگزین می‌شود.",
      downloadLabel: "دانلود",
      updatedLabel: "به‌روزرسانی",
      fallback:
        "اگر دانلود کار نکرد، فایل احتمالاً موقتاً در دسترس نیست؛ بعداً دوباره تلاش کنید.",
    },
    sections: {
      experience: "سوابق کاری",
      education: "تحصیلات",
      skills: "مهارت‌ها",
      publications: "انتشارات",
      research: "پژوهش",
      certificates: "گواهی‌ها",
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
    gpaLabel: "معدل",
    meta: {
      title: "طه محمدی — سیستم‌های هوشمند انسان‌محور",
      description:
        "پژوهشگر و مهندس میان‌رشته‌ای در ساخت سیستم‌های هوشمند انسان‌محور در مرز طراحی، مهندسی، داده و هوش مصنوعی.",
    },
    skip: "پرش به محتوا",
  },
};
