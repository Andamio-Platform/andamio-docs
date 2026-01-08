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

## Glossary Game Session Log: James & Claude, 2025-09-22 (Session 2)

### Terms Covered
- Local State vs Global State
- Instance Registry
- Contributors vs Students vs Project Creators

### Summary
Clarified the architecture of Global State components, introduced Instance Registry as the credential gatekeeper, and refined understanding of role-based identity within local state instances.

### Key Discoveries

#### 1. Global State Architecture Components
**Clarified that Global State consists of:**
- Access Token system (manages SSoIs)
- Protocol governance mechanisms
- Global state data (protocol-wide parameters)
- **Instance Registry** (central registry where all Local States register)

#### 2. Instance Registry as Permission Layer
**Key function:** Tracks which Local State instances are authorized to issue credentials to users' SSoIs

**Critical insights:**
- Only registered instances can write PolicyId → Hash pairs to Access Tokens
- Serves as anti-spam mechanism preventing credential pollution
- Registration is permissionless by design (once local state exists)
- Current limitation: Admin must mint local state token (temporary requirement)
- Acts as verification source for credential legitimacy

#### 3. Local State Extensibility
**Beyond courses and projects:** Organizations can define entirely new local state types with custom validators and business logic

**Key requirements:**
- All local states must be registered in Instance Registry to issue credentials
- Each local state type can have its own validators
- Enables protocol extensibility while maintaining network trust

#### 4. Role Hierarchy Clarification
**Everyone starts as:** Access Token Holder

**Contextual roles per Local State instance:**
- **Student:** Participant in Course Local States
- **Contributor:** Participant in Project Local States
- **Project Creator:** Instance-specific management role in Project Local States

#### 5. Project Creator Role Mechanics
**Instance-specific ownership model:**
- One Access Token holder assigned as initial Project Creator when instance created
- Can add additional Project Creators to same instance (collaborative management)
- Privileges scoped only to that specific project instance
- Can simultaneously be Contributor in other projects or Student in courses

### Files Updated
1. `docs/reference/GLOSSARY.md` - Added Instance Registry definition, updated Local State, Global State, and Project Creator entries
2. `content/docs/glossary.mdx` - Updated Local State, Global State, and Project Creator for public consumption

### Architectural Understanding Refined

**Instance Registry Flow:**
```
1. Organization creates local state (course/project/custom)
2. Local state registers in Instance Registry
3. Registry authorizes that instance to issue credentials
4. Instance can now write PolicyId → Hash to user SSoIs
5. Other orgs verify credentials by checking registry
```

**Role Fluidity Model:**
```
Same Access Token Holder can simultaneously be:
├── Student in Course X (Org A)
├── Contributor in Project Y (Org B)
├── Project Creator in Project Z (Org C)
└── Just Access Token Holder elsewhere
```

### Impact
This session established the Instance Registry as the trust and permission layer that makes the entire credential system work. It prevents credential spam while enabling permissionless innovation. The role system emerged as contextual and fluid rather than rigid identity types, enabling users to participate in different capacities across different local states.

## Glossary Game Session Log: James & Claude, 2025-09-23

### Terms Covered
- Local State vs Global State (comprehensive validation)

### Summary
Fundamentally refined understanding of the Local State/Global State relationship, correcting key misconceptions about scope, data flow, and validation patterns.

### Key Discoveries

#### 1. Local State Scope Correction
**Critical insight:** Local states are **never user-scoped** - they're always scoped to areas of work (courses, projects, etc.)

**Before:** Thought local states could be user-specific within a context
**After:** Local states represent work domains; users participate in them but don't own them

#### 2. Data Architecture: Details vs Summaries
**Local State:** Contains **all the details** (which modules completed, specific contributions, etc.)
**Global State:** Contains only **summaries** via PolicyId + hash pairs in Access Token Datum

**Key insight:** Local states are the source of truth; global state is just an index

#### 3. Prerequisites Can Inspect Details
**Discovery:** When checking prerequisites, validators may need to examine actual local state details

**Example:** A project might require not just "completed course" but "completed modules 102 and 301 specifically"
- This requires looking at the local state's detailed data
- Not just checking if PolicyId exists in global state

#### 4. SSOI Storage Location Clarified
**Critical correction:** SSOI data (PolicyId + hash pairs) is stored specifically in the **Access Token Datum**, not generically "in global state"

This clarifies the exact storage mechanism for the standardized summaries.

#### 5. Discovery Feature Status
**Correction:** The discovery mechanism mentioned in Global State is **planned but not yet implemented**
- Currently no automated discovery of local states
- Future feature for protocol roadmap

#### 6. Ecosystem Extensibility Pattern
**Key architectural insight:**
- **Standardized interface:** SSOI standard for local→global communication
- **Flexible implementation:** Each local state type has independent validation rules
- **Open ecosystem:** Many builders will create new local state types

**Analogy:** Like having a standard API that all local states implement, while their internal business logic can be completely different

### Files Updated
1. `docs/reference/GLOSSARY.md` - Updated Local State and Global State with detailed corrections
2. `content/docs/glossary.mdx` - Updated public-facing definitions with refined understanding
3. `GLOSSARY_GAME_CHANGELOG.md` - Added this session log

### Architectural Understanding Refined

**Data Flow Pattern:**
```
Local State (all details)
    ↓ generates
Summary (PolicyId + hash)
    ↓ stored in
Access Token Datum (SSOI)
    ↓ indexed by
Global State (registry/discovery)
```

**Validation Patterns:**
```
Prerequisites can:
1. Check global state (PolicyId exists) - low trust
2. Inspect local state details (specific modules) - high trust
3. Validate against multiple local states
```

### Impact
This session corrected fundamental misunderstandings about the Local/Global State architecture. The key insight is that local states are work-scoped containers of detailed data that generate summaries for the global index. This enables an open ecosystem where builders can create new local state types while maintaining interoperability through the SSOI standard. The pattern truly enables "many methods of how local states are built" while maintaining protocol coherence.

## Glossary Game Session Log: James & Claude, 2025-09-23 (Session 2)

### Terms Covered
- Local State Instance Ownership

### Summary
Critical clarification on the distinction between Local State Systems and Local State Instances, correcting the overly broad statement that local states are "never user-scoped."

### Key Discovery

#### Local State Systems vs Instances

**Systems**: The types of local states available in the protocol
- Course System
- Project System
- Future custom types to be developed by ecosystem builders

**Instances**: Individual implementations of these systems, each owned by a specific Access Token Holder
- "Intro to Woodworking" (Course instance) → owned by Alice
- "Intro to Plumbing" (Course instance) → owned by Bob
- "Contribute to Andamio App" (Project instance) → owned by Carol
- "Run ODIN Social Media Campaign" (Project instance) → owned by Dan

#### Ownership Model Clarified

**Previous understanding**: Local states are "never user-scoped" (too absolute)

**Corrected understanding**:
- **Data Scope**: The data represents areas of work (course content, project tasks) - not personal user data
- **Instance Ownership**: Each instance is owned and managed by a specific Access Token Holder
- **Management Control**: The owner controls their instance (sets requirements, approves completions, manages participants)

#### Complete Picture

The architecture has three levels:
1. **System Level**: Types of local states (Course, Project, etc.)
2. **Instance Level**: Individual implementations owned by Access Token Holders
3. **Participation Level**: Multiple Access Token Holders participate in instances as students/contributors

This means Alice controls her "Intro to Woodworking" course instance - she can set requirements, approve completions, manage the course - even though the course data itself is about woodworking education, not about Alice personally.

### Files Updated
1. `docs/reference/GLOSSARY.md` - Added Systems vs Instances distinction and instance ownership model
2. `content/docs/glossary.mdx` - Updated with instance ownership examples
3. `GLOSSARY_GAME_CHANGELOG.md` - Added this clarification session

### Impact
This clarification resolves the apparent contradiction between "never user-scoped" and the reality of individual ownership. Local State Instances are owned by users (Access Token Holders) who manage them, but the data within represents work domains. This ownership model enables decentralized creation and management of educational and work coordination instances while maintaining the protocol's interoperability standards.