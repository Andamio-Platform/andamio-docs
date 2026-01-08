# Glossary Game Skill

A collaborative learning exercise for iteratively refining Claude's understanding of Andamio terminology.

## Invocation

User says: "Let's play the glossary game" or "Let's run an example with [term]"

## Workflow

### 1. Agent Presents Understanding
Share current understanding of the term/concept:
- Definition
- Key characteristics
- How it relates to other concepts
- Confidence level ("I'm uncertain about...", "I believe...")

### 2. Human Validates/Corrects
Human provides feedback:
- Corrections to misunderstandings
- Additional context
- Clarifications on relationships

### 3. Agent Updates
Incorporate feedback and update documentation:
- `docs/reference/GLOSSARY.md` - Team-facing (can include private sections)
- `content/docs/glossary.mdx` - Public-facing (core concepts only)

### 4. Iterate
Repeat until understanding is solid.

## Best Practices

- **Be honest about confidence**: "I'm uncertain about...", "I notice this term appears with..."
- **Ask about relationships**: "How does [TERM A] relate to [TERM B]?"
- **Surface inconsistencies**: "I see this used two different ways..."
- **Update docs in real-time** while context is fresh
- **Build iteratively** through multiple short rounds

## Example Opening

```
I'd like to validate my understanding of your terminology. I've noticed some terms that could use clarification:

1. **[Term]** - I see this used frequently but am unsure if it means X or Y
2. **[Term]** - This seems to have a specific meaning in your context
3. **[Term]** - I've seen inconsistent usage of this

Should we start with one of these, or would you prefer a different term?
```

## Glossary Scope

**Team glossary** (`docs/reference/GLOSSARY.md`):
- Can include private/internal sections
- Detailed technical definitions
- Implementation notes

**Public glossary** (`content/docs/glossary.mdx`):
- Core Protocol Concepts (Access Token, SSOI, Credentials, Local State, Global State, etc.)
- Technical Architecture (Protocol V2, Transaction API, Transaction Sponsorship, etc.)
- Acronyms & Abbreviations

## Supporting Docs

- `GLOSSARY_GAME_CHANGELOG.md` - Session history with discoveries and corrections
- `team-note-glossary-game.md` - Quick reference for team members
