import type { Profile } from "./profile";

// fa locale: only owner-approved Persian content is published here.
// English-only sections (experience/education/publications/research/certificates)
// have no approved Persian translation yet and are therefore empty (not published
// on fa, per "missing translation = section not published").
export const profileFa: Profile = {
  shortBio:
    "در مرز طراحی، تعامل، مهندسی، داده و هوش مصنوعی کار می‌کنم تا سیستم‌های هوشمند انسان‌محور بسازم. استدلال و شواهد پشت آن‌ها را ثبت می‌کنم.",
  skills: [
    {
      category: "Research and engineering",
      name: "Human-centered intelligent systems",
      source: "Confirmed owner positioning",
    },
    {
      category: "Design and interaction",
      name: "Design and interaction",
      source: "Confirmed owner positioning",
    },
    {
      category: "Engineering",
      name: "Engineering",
      source: "Confirmed owner positioning",
    },
    {
      category: "Data and AI",
      name: "Data and AI",
      source: "Confirmed owner positioning",
    },
    {
      category: "Research practice",
      name: "Evidence-aware documentation of reasoning",
      source: "Confirmed short bio",
    },
    {
      category: "Research framework",
      name: "PARS-SQL",
      source: "Owner research presentation",
    },
    {
      category: "Research framework",
      name: "VTD-Edge",
      source: "Owner research presentation",
    },
  ],
  experience: [],
  education: [],
  publications: [],
  researchProjects: [],
  certificates: [],
  socials: [],
  availability:
    "برای فرصت‌های دکتری، همکاری پژوهشی و فرصت‌های حرفه‌ای آمادهٔ گفتگو هستم.",
};
