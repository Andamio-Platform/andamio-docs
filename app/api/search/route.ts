import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// Search tuning — fumadocs-core 15.4.1, verified against the installed types.
//
// `search.tolerance: 1` adds Levenshtein-distance-1 fuzziness so single-char
// typos and partial words ("treasry", "validador") still match. Conservative on
// purpose: the team's complaint is misses, not noise — only bump to 2 if real
// queries still fail. `threshold` is left at its Orama default (0).
//
// `buildIndex` reproduces fumadocs' default `pageToIndex` exactly — the
// missing-structuredData guard and the `title ?? file.name` fallback — and adds
// a section `tag` keyed on the root slug, which powers the scoped tag filter in
// the ⌘K dialog (see app/layout.tsx). Keeping the default's guard/fallback means
// a malformed or non-standard page still fails loudly (rather than silently
// indexing `undefined`) once we override the builder. The home doc (index.mdx)
// has empty slugs, so its tag falls back to 'home' to avoid an undefined tag.
export const { GET } = createFromSource(source, {
  language: 'english',
  search: {
    tolerance: 1,
  },
  buildIndex(page) {
    if (!('structuredData' in page.data)) {
      throw new Error(
        'Cannot find structured data from page, please define the page to index function.',
      );
    }

    return {
      id: page.url,
      title: page.data.title ?? page.file.name,
      description:
        'description' in page.data ? page.data.description : undefined,
      structuredData: page.data.structuredData,
      url: page.url,
      tag: page.slugs[0] ?? 'home',
    };
  },
});
