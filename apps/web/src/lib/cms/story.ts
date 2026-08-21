/** Shared public story document shape from CMS composition projection. */

export interface StoryDocumentDto {
  locale: string;
  title: string;
  sections: Array<{
    layout: string;
    ratio: string;
    blocks: Array<{
      blockType: string;
      settings: Record<string, unknown>;
    }>;
  }>;
}

export function hasPublishedStory(
  story: StoryDocumentDto | null | undefined,
): story is StoryDocumentDto {
  return story !== null && story !== undefined && story.sections.length > 0;
}
