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
const CMS_TIMEOUT_MS = 5000;

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

/**
 * Load the public About profile.
 * - CMS_API_BASE unset → committed `profile.snapshot.json` (local/offline only).
 * - CMS_API_BASE set → live API only; transport/5xx/timeout fails the build.
 *   Successful empty/missing CMS responses are not replaced by the snapshot.
 */
export async function loadPublicProfile(locale: LocaleCode): Promise<ProfileLoadResult> {
  const cmsBase = import.meta.env.CMS_API_BASE?.trim();
  if (!cmsBase) {
    const profiles = readSnapshotProfiles();
    return { kind: "profile", profile: profiles[locale], source: "snapshot" };
  }

  let response: Response;
  try {
    response = await fetch(buildProfileUrl(cmsBase, locale), {
      headers: { accept: "application/json", "X-Forwarded-Proto": "https" },
      signal: AbortSignal.timeout(CMS_TIMEOUT_MS),
    });
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    throw new Error(
      `CMS profile origin unreachable for ${locale}/${PROFILE_SLUG}: ${detail}`,
    );
  }

  if (response.ok) {
    const profile = (await response.json()) as Profile;
    validateProfile(profile, locale);
    return { kind: "profile", profile, source: "cms" };
  }

  if (response.status >= 500) {
    throw new Error(
      `CMS profile origin HTTP ${response.status} for ${locale}/${PROFILE_SLUG}`,
    );
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
}
