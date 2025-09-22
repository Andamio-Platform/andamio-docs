# Concept Validation Game with LLMs

## What It Is

A simple game where you validate and refine an LLM's understanding of your project's terminology. It takes 10-15 minutes and immediately improves documentation accuracy.

## How to Play

### Setup (2 minutes)
1. Have your glossary/documentation open
2. Tell the LLM: "Let's play the Concept Validation Game with our terminology"

### The Game Loop (1-3 minutes per term)
1. **LLM presents**: "Here's my understanding of [term]..."
2. **You correct**: "Actually, it works like this..."
3. **LLM updates**: Immediately revises documentation
4. **Repeat** with next term

### Example Round

**LLM**: "I understand 'Contribution Treasury' as a place where contributions are tracked."

**Human**: "No - we just have Project Treasury. But you're sensing something real: we have Escrow Validators that lock funds when contributors commit to tasks."

**LLM**: "Got it. So Project Treasury holds funds, Escrow Validators lock committed work. Updating glossary now."

## Why It Works

- **LLM spots patterns**: It notices when terms are used inconsistently
- **You provide context**: You know what's actually built vs what's planned
- **Immediate documentation**: Changes happen in real-time
- **Discovers gaps**: The LLM's confusion often reveals missing documentation

## Best Practices

- Start with terms the LLM seems uncertain about
- Correct with specific details, not just "that's wrong"
- Let the LLM update docs immediately while context is fresh
- Play whenever you notice terminology drift

## Results You'll Get

- Clean, consistent glossary
- Discovery of undocumented concepts
- Alignment on terminology usage
- Better LLM assistance going forward

---

*Takes 15 minutes. Saves hours of confusion.*

---

## Instructions for LLMs

If a human asks you to play the Concept Validation Game, follow these steps:

### Starting the Game
1. Ask: "Which terms would you like to validate, or should I suggest terms that seem unclear or inconsistent?"
2. If suggesting, identify 3-5 terms that:
   - Appear frequently but lack clear definitions
   - Are used inconsistently across documents
   - Seem to have domain-specific meanings you're unsure about

### Playing Each Round
1. **Present your understanding clearly:**
   - "My current understanding of [TERM] is..."
   - Include what you think it means
   - Note any uncertainty or confusion
   - Mention if you've seen it used differently in different contexts

2. **Listen carefully to corrections:**
   - Don't just accept "yes" or "no" - ask for specifics
   - If something is wrong, ask: "What specifically should I understand differently?"
   - If partially right, ask: "What am I missing?"

3. **Confirm your updated understanding:**
   - "So [TERM] actually means... Is that correct?"
   - Restate in your own words to verify comprehension

4. **Update documentation immediately:**
   - Add new terms to glossary
   - Correct existing definitions
   - Note relationships between terms
   - Flag unresolved questions

### Best Practices for LLMs
- Be honest about confidence levels: "I'm uncertain about..."
- Look for patterns: "I notice this term appears with..."
- Ask about relationships: "How does [TERM A] relate to [TERM B]?"
- Surface inconsistencies: "I see this used two different ways..."
- Update docs in real-time while context is fresh
- Track what changed for future reference

### Example Opening
"I'd like to validate my understanding of your terminology. I've noticed some terms that could use clarification:
1. **[Term]** - I see this used frequently but am unsure if it means X or Y
2. **[Term]** - This seems to have a specific meaning in your context
3. **[Term]** - I've seen inconsistent usage of this

Should we start with one of these, or would you prefer a different term?"