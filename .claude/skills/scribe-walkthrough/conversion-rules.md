# Scribe → MDX Conversion Rules

Detailed reference for transforming raw Scribe (scribehow.com) markdown export into polished MDX walkthrough pages.

## Input Format: Scribe Quirks

Scribe auto-generated markdown has these characteristics:

- **Escaped numbering**: Steps use `1\.`, `2\.` etc. with backslash-escaped periods
- **Empty alt text**: Images use `![](url)` with no alt text
- **Micro-granular steps**: Every click is its own numbered step (e.g. "Click on the text field", "Type 'My Course'", "Click Submit" are 3 separate steps)
- **Boilerplate header**: Title, description, and "Made with Scribe" link at top
- **Boilerplate footer**: Navigation tips ("Tip: ...", "Click here to...") and Scribe branding at bottom
- **Alert boxes**: `**Alert:** ...` blocks for tips or warnings
- **Screenshot URLs**: All from `colony-recorder.s3.amazonaws.com`

### Example Raw Input
```markdown
# How to Create a Course in Andamio

1\. Navigate to https://preprod.app.andamio.io/

![](https://colony-recorder.s3.amazonaws.com/files/...)

2\. Click "Enter"

![](https://colony-recorder.s3.amazonaws.com/files/...)

3\. Click "Connect Wallet"

![](https://colony-recorder.s3.amazonaws.com/files/...)

4\. Click "Lace"

![](https://colony-recorder.s3.amazonaws.com/files/...)
```

## Output Format: MDX Template

```mdx
---
title: [Preserved from placeholder]
description: [Preserved from placeholder]
---

# [Preserved from placeholder]

[1-2 sentence intro about what this walkthrough covers and why]

## Prerequisites

[Preserve from placeholder if exists, otherwise add standard prereqs]

## Walkthrough: [Action Title]

### 1. [Section Title]

[1-2 sentence description of what happens in this section]

![Alt Text](image-url)

![Alt Text](image-url)

### 2. [Section Title]

[Description]

![Alt Text](image-url)

...

<Callout type="info">
This walkthrough was [made with Scribe](SCRIBE_SHARE_URL). Content will be refined in future updates.
</Callout>

## [Additional Sections]

[Preserve from placeholder: Next Steps, Related, etc.]
```

## Conversion Rules

### Rule 1: Strip Boilerplate
Remove Scribe-generated headers (title block, description, "Made with Scribe" link at top), footers (navigation tips, branding), and alert boxes that are Scribe-specific (not content-relevant).

### Rule 2: Group Steps into Sections
Combine micro-granular Scribe steps into logical sections. Each section represents a meaningful user action, not individual clicks.

**Grouping heuristics:**
- Steps involving the same UI area → one section (e.g., "Click Connect Wallet" + "Select Lace" = "Connect Your Wallet")
- Sequential form fills → one section (e.g., "Click text field" + "Type title" + "Click submit" = "Create the Course")
- Navigation steps → one section (e.g., "Navigate to URL" + "Click Enter" = "Navigate to Andamio")
- Review + confirm steps → one section (e.g., "Review details" + "Click Mint" = "Approve and Mint")

**Target**: 5-12 sections per walkthrough (vs. 15-35 raw Scribe steps)

### Rule 3: Write Descriptive Alt Text
Replace empty `![](url)` with descriptive alt text: `![Connect Wallet](url)`.

Alt text should describe the UI element or action shown, not the full step description. Keep it 2-4 words.

### Rule 4: Write Section Prose
Each section gets 1-2 sentences describing the action. Use imperative mood for instructions ("Click **Connect Wallet**"), bold for UI elements.

### Rule 5: Preserve Placeholder Structure
- Keep frontmatter (title, description) from the existing placeholder
- Keep the `## Related` section at the bottom
- Keep any `## Prerequisites` section
- Keep any `## Next Steps` section
- Replace the stub content ("_Detailed walkthrough coming soon._") with the walkthrough sections

### Rule 6: Image Handling
- Keep the original `colony-recorder.s3.amazonaws.com` URLs — they are already whitelisted in `next.config.mjs`
- Do not download, re-host, or modify image URLs
- One image per action is preferred; include multiple only when the section genuinely has distinct visual steps

### Rule 7: Scribe Attribution
Always include the attribution callout at the end of the walkthrough section (before Related/Next Steps):

```mdx
<Callout type="info">
This walkthrough was [made with Scribe](SCRIBE_SHARE_URL). Content will be refined in future updates.
</Callout>
```

### Rule 8: No Imports Required
`<Callout>` and other MDX components are registered globally in `mdx-components.tsx`. Do not add import statements.

## Grouping Process

When converting, always follow this process:

1. **Count raw steps** and list them
2. **Propose sections** — show the user a table like:

```
| Section | Title | Scribe Steps | Images |
|---------|-------|-------------|--------|
| 1 | Navigate to Andamio | 1-2 | 2 |
| 2 | Connect Your Wallet | 3-4 | 2 |
| 3 | Open Course Studio | 5 | 1 |
| ... | ... | ... | ... |
```

3. **Get user approval** before generating the full MDX
4. **Generate MDX** with approved sections

## Priority Order for Remaining Walkthroughs

Recommended conversion order — prerequisites are the core Andamio concept and should be prioritized:

1. **managing-students** — completes course owner flow (create → manage)
2. **setting-up-prerequisites** — PRIORITY: Course↔Project relationship, branching to course creation, assigning prereqs
3. **creating-your-first-project** — assumes prereqs are understood
4. **managing-contributors** — completes project owner flow
5. **earning-credentials** — starts contributor flow (course side)
6. **completing-prerequisites** — PRIORITY: find project prereqs, complete courses, become eligible
7. **joining-projects** — assumes prereqs are complete

## Reference Examples

Study these completed walkthroughs for tone, structure, and formatting:

- `content/docs/guides/getting-started.mdx` — 6 sections from ~18 raw steps
- `content/docs/guides/courses/creating-your-first-course.mdx` — 10 sections from ~32 raw steps
