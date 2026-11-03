import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

type BlogLanguage = CollectionEntry<'blog'>['data']['language'];

/**
 * The blog posts that are not drafts, optionally in one language. Every page that reads the blog
 * collection goes through this, so a draft is neither built at its URL nor listed in the sitemap.
 */
export async function getPublishedPosts(language?: BlogLanguage): Promise<CollectionEntry<'blog'>[]> {
  return getCollection('blog', ({ data }) => !data.isDraft && (language === undefined || data.language === language));
}
