# Glossary Game Changelog

A record of Glossary Game sessions where Claude and team members iteratively refine understanding of Andamio terminology.

## Glossary Game Session Log: James & Claude, 2025-09-22

### Terms Covered
- SSOI (Self-Sovereign On-chain Identity) - Complete deep dive including storage architecture

### Summary
Corrected fundamental misunderstanding of SSOI acronym and explored complete storage architecture and implementation details.

### Key Discoveries

#### 1. SSOI Acronym Correction
**SSOI stands for "Self-Sovereign On-chain Identity"** (not "Self-Sovereign Organizational Infrastructure")

This correction fundamentally reframed the concept from being about organizational autonomy to being about individual user identity control.

#### 2. Storage Architecture Clarified
**On-chain/Off-chain Hybrid Model:**
- **On-chain (Access Token datum)**: Stores PolicyId → Hash pairs only
- **Off-chain (app databases)**: Actual credential data that hash commits to
- **Hash purpose**: Cryptographic commitment to arbitrary off-chain data

**Key Insights:**
- Access Token datum grows by small, fixed increments (PolicyId + hash) per participation
- Actual credential details (grades, dates, contributions) stored off-chain
- Apps verify hash matches database entry for data integrity
- Local state owners decide what data to hash

#### 3. Trust Levels and Verification
**Two verification modes:**
- **Low trust**: Just verify PolicyId exists (proof of participation)
- **High trust**: Verify hash and fetch off-chain data for full details

Organizations choose verification level based on their needs - a hackathon might just check participation while medical certification would verify everything.

#### 4. Data Control and Privacy
- Local state owners define what goes into hash
- Sensitive details stay off-chain
- On-chain data is just cryptographic fingerprints
- Enables GDPR compliance and privacy preservation

#### 5. Future Roadmap
- Content storage redundancy planned for 2-5 year roadmap
- Potential tokenomics connection to incentivize storage
- Current design works without permanent storage (orgs maintain databases)

### Files Updated
1. `docs/reference/GLOSSARY.md` - Added complete storage architecture details
2. `content/docs/glossary.mdx` - Updated with PolicyId → Hash pattern explanation

### Impact
This session revealed SSOI as a "trust anchor" rather than a data store - it proves participation on-chain while keeping details off-chain. This design enables scalability, privacy, and flexibility while maintaining cryptographic verifiability. The pattern truly functions like "TCP/IP for identity" - minimal protocol enabling maximum innovation.

### Terms Updated

#### 1. SSOI (Self-Sovereign On-chain Identity)
**Before:** Understood as organizational infrastructure for autonomous control
**After:** User's portable, self-controlled record of participation, achievements, and progress across all Andamio organizations

**Key Insights:**
- SSOI is stored in the Access Token datum
- One Access Token = One SSOI per user
- Spans across all organizations and local states
- Enables cross-organizational credential recognition

#### 2. Access Token
**Before:** Authentication mechanism with vague relationship to SSOI
**After:** Contains the user's SSOI datum - their complete identity record across all Andamio organizations

**Key Insights:**
- Each user has one Access Token with unique alias
- Access Token datum stores the actual SSOI data
- Spans across any organizations where user participates

#### 3. Local State
**Before:** Generic custom logic for apps/organizations
**After:** Organization-specific contexts that users participate in

**Key Insights:**
- Organizations can have multiple local states
- Local states can serve as prerequisites across org boundaries
- User participation recorded in their SSOI
- Enables trust network between organizations

#### 4. Credentials
**Before:** Verifiable attestations used as prerequisites
**After:** Permanent part of user's sovereign identity

**Key Insights:**
- Once earned, no organization can revoke them
- Attached permanently to user's SSOI
- Can be recognized by any organization as prerequisites
- Enables permissionless credential sharing

### Architectural Understanding

**Relationship Hierarchy Clarified:**
```
SSOI (stored in Access Token datum)
  └── Participates in multiple Local States
       ├── Org A: Course Local State
       ├── Org A: Project Local State (may require course as prereq)
       ├── Org B: Different Local State (may accept Org A credentials)
       └── Org C: Another Local State
```

### Files Modified
1. `docs/reference/GLOSSARY.md` - Internal team glossary with detailed definitions
2. `content/docs/glossary.mdx` - Public-facing glossary with core concepts

### Outstanding Questions
1. Does Access Token datum contain credential data inline or references/hashes?
2. Where is credential data actually stored when earned?
3. How does cross-org credential verification work technically?
4. Are there scalability considerations as SSOI grows?
5. Is "Access Token = SSOI" or "Access Token contains SSOI"?
6. What are use cases for multiple Access Tokens per person?

### Impact
This correction fundamentally changes how we understand and communicate about Andamio's identity system. The focus shifts from organizational sovereignty to individual identity sovereignty, with organizations forming a trust network that recognizes each other's credentials.