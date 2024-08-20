import path from 'node:path';

import { Reflection } from 'typedoc';
import type { Comment, CommentDisplayPart, CommentTag, Options, PageEvent } from 'typedoc';
import { MarkdownTheme, MarkdownThemeContext } from 'typedoc-plugin-markdown';

import { getAsideMarkdown, getRelativeURL } from './starlight';

const customBlockTagTypes = ['@deprecated'] as const;
const customModifiersTagTypes = ['@alpha', '@beta', '@experimental'] as const;

export class StarlightTypeDocTheme extends MarkdownTheme {
  override getRenderContext(event: PageEvent<Reflection>): StarlightTypeDocThemeRenderContext {
    return new StarlightTypeDocThemeRenderContext(this, event, this.application.options);
  }
}

class StarlightTypeDocThemeRenderContext extends MarkdownThemeContext {
  override partials: MarkdownThemeContext['partials'] = {
    // @ts-expect-error https://github.com/tgreyuk/typedoc-plugin-markdown/blob/2bc4136a364c1d1ab44789d6148cd19c425ce63c/docs/pages/docs/customizing-output.mdx#custom-theme
    ...this.partials,
    comment: (comment, options) => {
      const filteredComment = { ...comment } as Comment;
      filteredComment.blockTags = [];
      filteredComment.modifierTags = new Set<`@${string}`>();

      const customTags: CustomTag[] = [];

      for (const blockTag of comment.blockTags) {
        if (this.#isCustomBlockCommentTagType(blockTag.tag)) {
          customTags.push({ blockTag, type: blockTag.tag });
        } else {
          blockTag.content = blockTag.content.map((part) => this.#parseCommentDisplayPart(part));
          filteredComment.blockTags.push(blockTag);
        }
      }

      for (const modifierTag of comment.modifierTags) {
        if (this.#isCustomModifierCommentTagType(modifierTag)) {
          customTags.push({ type: modifierTag });
        } else {
          filteredComment.modifierTags.add(modifierTag);
        }
      }

      filteredComment.summary = comment.summary.map((part) => this.#parseCommentDisplayPart(part));

      let markdown = this.#markdownThemeContext.partials.comment(filteredComment, options);

      if (options?.showSummary === false) {
        return markdown;
      }

      for (const customCommentTag of customTags) {
        switch (customCommentTag.type) {
          case '@alpha': {
            markdown = this.#addReleaseStageAside(markdown, 'Alpha');
            break;
          }
          case '@beta': {
            markdown = this.#addReleaseStageAside(markdown, 'Beta');
            break;
          }
          case '@deprecated': {
            markdown = this.#addDeprecatedAside(markdown, customCommentTag.blockTag);
            break;
          }
          case '@experimental': {
            markdown = this.#addReleaseStageAside(markdown, 'Experimental');
            break;
          }
        }
      }

      return markdown;
    }
  };

  #isCustomBlockCommentTagType = (tag: string): tag is CustomBlockTagType => {
    return customBlockTagTypes.includes(tag as CustomBlockTagType);
  };

  #isCustomModifierCommentTagType = (tag: string): tag is CustomModifierTagType => {
    return customModifiersTagTypes.includes(tag as CustomModifierTagType);
  };

  #markdownThemeContext: MarkdownThemeContext;

  #parseCommentDisplayPart = (part: CommentDisplayPart): CommentDisplayPart => {
    if (
      part.kind === 'inline-tag' &&
      (part.tag === '@link' || part.tag === '@linkcode' || part.tag === '@linkplain') &&
      part.target instanceof Reflection &&
      typeof part.target.url === 'string'
    ) {
      return {
        ...part,
        target: this.getRelativeUrl(
          path.posix.join(this.options.getValue('entryPointStrategy') === 'packages' ? '../..' : '..', part.target.url)
        )
      };
    }

    return part;
  };

  constructor(theme: MarkdownTheme, event: PageEvent<Reflection>, options: Options) {
    super(theme, event, options);

    this.#markdownThemeContext = new MarkdownThemeContext(theme, event, options);
  }

  override getRelativeUrl(url: string): string {
    const outputDirectory = this.options.getValue('starlight-typedoc-output');
    const baseUrl = typeof outputDirectory === 'string' ? outputDirectory : '';

    return getRelativeURL(url, baseUrl, this.page.url);
  }

  #addAside(markdown: string, ...args: Parameters<typeof getAsideMarkdown>) {
    return `${markdown}\n\n${getAsideMarkdown(...args)}`;
  }

  #addDeprecatedAside(markdown: string, blockTag: CommentTag) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const content =
      blockTag.content.length > 0
        ? // @ts-expect-error - inherited code from https://github.com/HiDeoo/starlight-typedoc
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          this.partials.commentParts(blockTag.content)
        : 'This API is no longer supported and may be removed in a future release.';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.#addAside(markdown, 'caution', 'Deprecated', content);
  }

  #addReleaseStageAside(markdown: string, title: string) {
    return this.#addAside(
      markdown,
      'caution',
      title,
      'This API should not be used in production and may be trimmed from a public release.'
    );
  }
}

type CustomBlockTagType = (typeof customBlockTagTypes)[number];
type CustomModifierTagType = (typeof customModifiersTagTypes)[number];

type CustomTag =
  | {
      blockTag: CommentTag;
      type: CustomBlockTagType;
    }
  | { type: CustomModifierTagType };
