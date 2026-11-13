import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

type BlogLanguage = CollectionEntry<'blog'>['data']['language'];

async function getOriginal(post: CollectionEntry<'blog'>): Promise<CollectionEntry<'blog'> | undefined> {
  const { translationOf } = post.data;
  if (!translationOf) {
    return undefined;
  }
  const original = await getEntry(translationOf);
  if (!original) {
    throw new Error(`Blog post '${post.slug}' is a translation of '${translationOf.id}', which does not exist`);
  }
  return original;
}

/**
 * The blog posts that are not drafts, optionally in one language. Every page that reads the blog
 * collection goes through this, so a draft is neither built at its URL nor listed in the sitemap.
 */
export async function getPublishedPosts(language?: BlogLanguage): Promise<CollectionEntry<'blog'>[]> {
  return getCollection('blog', ({ data }) => !data.isDraft && (language === undefined || data.language === language));
}

export async function getPublishedAltPost(post: CollectionEntry<'blog'>): Promise<CollectionEntry<'blog'> | undefined> {
  const posts = await getPublishedPosts();
  const [original, originals] = await Promise.all([getOriginal(post), Promise.all(posts.map(getOriginal))]);
  const altPosts = posts.filter((candidate, index) => {
    return candidate.id === original?.id || originals[index]?.id === post.id;
  });
  if (altPosts.length > 1) {
    throw new Error(
      `Blog post '${post.slug}' is paired with more than one post: ${altPosts.map(({ slug }) => slug).join(', ')}`
    );
  }
  const altPost = altPosts.at(0);
  if (altPost?.data.language === post.data.language) {
    throw new Error(`Blog post '${post.slug}' and its pair '${altPost.slug}' are both in '${post.data.language}'`);
  }
  return altPost;
}
