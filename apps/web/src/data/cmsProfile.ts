import snapshot from "./profile.snapshot.json";
import type { LocaleCode } from "./site";
import type { Profile } from "./profile";
import { validateProfile } from "./profile";

type TranslationUnavailablePayload = {
  code: "TRANSLATION_UNAVAILABLE";
  detail: string;
  locale: string;
  slug: string;
  availableLocales: string[];
};

type SnapshotPayload = {
  profiles: Record<LocaleCode, Profile>;
};

export type ProfileLoadResult =
  | {
      kind: "profile";
      profile: Profile;
      source: "cms" | "snapshot";
    }
  | {
      kind: "translation-unavailable";
      locale: LocaleCode;
      slug: string;
      availableLocales: string[];
      source: "cms";
    }
  | {
      kind: "not-found";
      locale: LocaleCode;
      slug: string;
      source: "cms";
    };

const PROFILE_SLUG = "about";
function readSnapshotProfiles(): Record<LocaleCode, Profile> {
  const profiles = (snapshot as SnapshotPayload).profiles;

  for (const locale of ["en", "fa"] as const) {
    validateProfile(profiles[locale], locale);
  }

  return profiles;
}

function buildProfileUrl(base: string, locale: LocaleCode): URL {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return new URL(`api/profiles/${locale}/${PROFILE_SLUG}`, normalizedBase);
}

function isTranslationUnavailable(value: unknown): value is TranslationUnavailablePayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    (value as { code?: string }).code === "TRANSLATION_UNAVAILABLE"
  );
}

export async function loadPublicProfile(locale: LocaleCode): Promise<ProfileLoadResult> {
  const cmsBase = import.meta.env.CMS_API_BASE?.trim();
  if (!cmsBase) {
    const profiles = readSnapshotProfiles();
    return { kind: "profile", profile: profiles[locale], source: "snapshot" };
  }

  try {
    const response = await fetch(buildProfileUrl(cmsBase, locale), {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const profile = (await response.json()) as Profile;
      validateProfile(profile, locale);
      return { kind: "profile", profile, source: "cms" };
    }

    const payload = (await response.json().catch(() => null)) as unknown;
    if (response.status === 404 && isTranslationUnavailable(payload)) {
      return {
        kind: "translation-unavailable",
        locale,
        slug: payload.slug,
        availableLocales: payload.availableLocales,
        source: "cms",
      };
    }

    return { kind: "not-found", locale, slug: PROFILE_SLUG, source: "cms" };
  } catch {
    const profiles = readSnapshotProfiles();
    return { kind: "profile", profile: profiles[locale], source: "snapshot" };
  }
}
