import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// Search tuning — fumadocs-core 15.4.1, verified against the installed types.
//
// `search.tolerance: 1` adds Levenshtein-distance-1 fuzziness so single-char
// typos and partial words ("treasry", "validador") still match. Conservative on
// purpose: the team's complaint is misses, not noise — only bump to 2 if real
// queries still fail. `threshold` is left at its Orama default (0).
//
// `buildIndex` mirrors the default index fields (title / description /
// structuredData) and adds a section `tag` keyed on the root slug, which powers
// the scoped tag filter in the ⌘K dialog (see app/layout.tsx). The home doc
// (index.mdx) has empty slugs, so it falls back to 'home' to avoid an undefined
// tag in the index.
export const { GET } = createFromSource(source, {
  language: 'english',
  search: {
    tolerance: 1,
  },
  buildIndex(page) {
    return {
      id: page.url,
      title: page.data.title,
      description: page.data.description,
      structuredData: page.data.structuredData,
      url: page.url,
      tag: page.slugs[0] ?? 'home',
    };
  },
});
