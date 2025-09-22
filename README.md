# andamio-docs

This is a Next.js application generated with
[Create Fumadocs](https://github.com/fuma-nama/fumadocs).

## Try the Glossary Game with Claude Code

Want to explore Andamio's terminology and concepts? Clone this repository and try the **Glossary Game** (also known as Concept Validation Game) with Claude Code:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/andamio-dev/andamio-docs.git
   cd andamio-docs
   ```

2. **Open Claude Code** in this directory
3. **Start the game**: Ask Claude to play the Glossary Game with Andamio terminology

The game is a collaborative learning exercise where Claude presents its understanding of Andamio terms and you provide corrections and context. It might help us:
- Achieve team alignment on terminology and concepts
- Develop emergent definitions that reflect shared understanding
- Iteratively refine documentation through collaborative discussion

Claude has access to our comprehensive glossary at `docs/reference/GLOSSARY.md` and will help you explore concepts like SSOI (Self-Sovereign On-chain Identity), Project Treasury, Access Tokens, and more.

### Important: After Playing the Glossary Game

**When you finish a Glossary Game session:**
1. **Ensure the changelog is updated**: Claude should automatically update `GLOSSARY_GAME_CHANGELOG.md` with your session
2. **Commit your changes**: Make sure to commit both the glossary updates and the changelog entry
   ```bash
   git add docs/reference/GLOSSARY.md content/docs/glossary.mdx GLOSSARY_GAME_CHANGELOG.md
   git commit -m "Glossary Game: Update [terms discussed] definitions"
   ```
3. **Push your changes** so the team benefits from the refined understanding

Internal team glossary: `docs/reference/GLOSSARY.md`

Public glossary: `content/docs/glossary.mdx`

Session history: `GLOSSARY_GAME_CHANGELOG.md`

## Development

Run development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open http://localhost:3000 with your browser to see the result.

## Explore

In the project, you can see:

- `lib/source.ts`: Code for content source adapter, [`loader()`](https://fumadocs.dev/docs/headless/source-api) provides the interface to access your content.
- `app/layout.config.tsx`: Shared options for layouts, optional but preferred to keep.

| Route                     | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `app/(home)`              | The route group for your landing page and other pages. |
| `app/docs`                | The documentation layout and pages.                    |
| `app/api/search/route.ts` | The Route Handler for search.                          |

## Learn More

To learn more about Next.js and Fumadocs, take a look at the following
resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Fumadocs](https://fumadocs.vercel.app) - learn about Fumadocs

## Protocol Documentation

The project contains comprehensive documentation for the Andamio protocol:

- **Transaction specifications**: Found in `public/yaml/transactions/` organized by role (admin, contributor, course-creator, project-creator, student, general)
- **Validator registry**: Central source of truth at `public/yaml/validator-registry-v1.yaml`
- **Protocol documentation**: Generated MDX files in `content/docs/protocol/v1/`
- **Working glossary**: Located at `docs/reference/GLOSSARY.md`

For details on the documentation system architecture, see `CLAUDE.md`.