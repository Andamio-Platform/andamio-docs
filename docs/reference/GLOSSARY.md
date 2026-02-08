# Andamio Glossary

A reference guide for key terms, concepts, and acronyms used throughout Andamio documentation.

## Core Protocol Concepts

### Access Token (Andamio Access Token)
The primary authentication mechanism for the Andamio network implemented using the CIP68 token standard. Each user has one Access Token pair consisting of a 222 token (held in their wallet as proof of ownership) and a corresponding 100 token (held at the Global State Validator address containing their SSOI data). The Access Token enables users to carry their verified identity, credentials, and reputation across different applications through a unique alias that spans across any organizations and local states in which they participate.

### Self-Sovereign On-chain Identity (SSOI)
A decentralized identity framework built on Cardano that enables users to maintain portable, self-controlled records of their participation, achievements, and credentials across all Andamio organizations. SSOI represents a minimalist approach to identity: just an alias (user-chosen identifier) and a collection of references to local states. This intentional simplicity enables maximum composability and interoperability.

**Technical Architecture**:
SSOI uses the CIP68 token standard with a unique implementation:
- **Token Pair System**: Each user has two linked tokens with the same policy ID:
  - **222 Token**: Held in user's wallet as proof of ownership (no datum attached)
  - **100 Token**: Held at Global State Validator address containing all SSOI data in its datum
- **Single Validator Address**: One Global State Validator address holds ALL users' 100 tokens
- **Data Separation**: User maintains sovereignty via 222 token ownership while all identity data lives at a predictable on-chain location

**Key Properties**:
- **One Access Token = One SSOI**: Each user maintains a single identity across the entire network
- **Cross-organizational**: Spans all organizations and local states where the holder participates
- **Portable credentials**: Achievements earned in one organization can be recognized by others
- **User-controlled**: Individuals own their learning identity via the 222 token; organizations cannot revoke earned credentials
- **Extensible Framework**: Supports custom local state types with their own business logic (Course and Project implemented, more possible)

**Data Model**: In Andamio V2, SSOI data is stored in the 100 token's datum at Global State Validator:
- `alias`: User's self-chosen on-chain identifier (ByteArray, no prefix)
- `local_state_data`: Pairs of PolicyId → ByteArray (blake2b_256 hash of arbitrary off-chain data)

**Storage Architecture**:
- **On-chain (100 token datum)**: Stores only PolicyId → Hash pairs - minimal, verifiable fingerprints of participation
- **User wallet (222 token)**: Contains only the ownership token, no datum updates needed
- **Off-chain (application databases)**: The actual credential data that the hash commits to (grades, completion dates, contributions, etc.)
- **Hash verification**: Applications verify the hash matches their database entry to ensure data integrity
- **Scalability**: 100 token datum grows by small, fixed increments (PolicyId + hash) per participation, keeping gas costs manageable

**Data Control**:
- **Local state owners decide**: What data to include in the hash (courses might hash grades/dates, projects might hash contributions/reviews)
- **Privacy preserved**: Sensitive details stay off-chain, only cryptographic commitments go on-chain
- **Flexible verification**: Organizations can verify just participation (PolicyId exists) or full details (fetch and verify off-chain data)

**Interoperability**: Organizations can choose to recognize credentials from other organizations as prerequisites. This creates different trust levels:
- **Low trust**: Just verify PolicyId exists (proof of participation)
- **High trust**: Verify hash and fetch off-chain data for complete credential details

**Future Development**: Content storage redundancy is planned for the 2-5 year roadmap, potentially using distributed storage solutions and tokenomics incentives to ensure credential permanence.

**Strategic Goal**: SSOI establishes the pattern for decentralized identity. Success means other protocols adopt this simple structure for their own needs. It's like TCP/IP for identity - a minimal protocol that enables maximum innovation on top.

### Credentials
Cryptographically verified attestations of skills, achievements, or qualifications issued through the Andamio protocol and permanently attached to a user's SSOI. Unlike self-declared qualifications, these are on-chain verifiable and portable across platforms. Once earned, credentials become part of the user's sovereign identity that they control - no organization can revoke them. Credentials earned by completing Courses can be recognized by any organization as prerequisites for their local states, enabling permissionless credential sharing and a trust network between organizations.

### Local State
Detailed implementations of specific work scopes (courses, projects, and future types) that contain all the granular data and business logic for their domain. The protocol provides Local State **Systems** (Course and Project currently, with more types coming), and each system can have multiple **Instances** - individual implementations owned and managed by specific Access Token Holders.

**Systems vs Instances**:
- **Systems**: The types of local states available (Course, Project, and future custom types)
- **Instances**: Individual implementations like "Intro to Woodworking" (owned by Alice) or "Contribute to Andamio App" (owned by Carol)

**Key Features**:
- **Contains all details**: Stores complete data (e.g., which specific course modules completed, project contributions)
- **Work-scoped data**: The data represents an area of work (course content, project tasks), not personal user data
- **Instance control**: The owner Access Token Holder manages their instance (sets requirements, approves completions, etc.)
- **Independent validation rules**: Each local state type has its own validators and business logic
- **SSOI integration**: Generates data that "bubbles up" to Global State as policy ID + hash summaries in Access Token Datum
- **Prerequisite validation**: Can inspect other local states' detailed data (e.g., checking if specific modules 102 and 301 were completed)
- **Extensible ecosystem**: Designed for many builders to create new local state types following SSOI standard
- **Standardized reporting**: Must follow SSOI standard for how summaries are stored in Access Token Datum, but internal logic is flexible

### Instance Ownership
The on-chain ownership of a specific Local State instance (Course or Project) by a single Access Token holder who has sole administrative control over that parameterized validator instance.

**Key Concepts**:
- **Parameterized Validators**: The mechanism on Cardano that allows creating multiple distinct instances from the same base validator code (Course or Project)
- **Local State Instances**: Individual deployments like "TypeScript Development" Course or "S3 Facilitation" Course, each being a separate parameterized instance
- **Single Owner Model**: Each instance has exactly one owner - the Access Token holder who controls that specific instance
- **Administrative Authority**: The owner has exclusive control over their Local State instance (sets requirements, approves completions, manages participants)

**Identity & Ownership Architecture**:
- Instance Owner must have an Access Token
- **SSOI (Self-Sovereign On-Chain Identity)** is encoded in the Access Token's datum (Global State Datum)
- One SSOI/Access Token can own multiple instances (e.g., one person can own several different courses)
- This creates a verifiable on-chain link between identity and instance control

**Current Capabilities**:
- No ownership transfer mechanism yet (planned future feature)
- Course and Project Local States currently supported
- New Local State types can be added through Global State governance
- Each instance operates independently with its own rules and participants

### Global State
The protocol-level infrastructure that serves as a registry and index for all local states across the Andamio network. Global State stores summaries of local state participation in the Access Token Datum as policy ID + hash pairs following the SSOI standard, but does not contain the detailed local state data itself.

**Components**:
- **Access Token System**: Stores SSOI summaries (policy ID + hash pairs) from local states in Access Token Datum
- **Protocol Governance**: Core protocol rules and upgrade mechanisms
- **Global State Data**: Protocol-wide shared data and parameters
- **Instance Registry**: Central registry where all Local States are registered (discovery feature planned but not yet implemented)

### Instance Registry
A component of Global State that tracks which Local State instances are authorized to issue credentials to users' SSoIs (write PolicyId → Hash pairs to Access Tokens). The registry serves as a permission layer ensuring only legitimate local states can update user identities.

**Key Properties**:
- **Permissionless registration**: Once a local state exists, registration is permissionless by design
- **Current limitation**: Admin must currently mint a local state token (temporary requirement being addressed)
- **Credential authority**: Only registered instances can write to Access Token SSoIs
- **Anti-spam mechanism**: Prevents unauthorized actors from polluting user identities with invalid credentials
- **Verification source**: Other organizations check the registry to verify credential legitimacy

### Validators
Smart contracts that enforce the rules of the Andamio protocol. Includes both Global State Validators (protocol-wide rules) and Local State Validators (app-specific rules).

### App Roles
Andamio defines six user roles across two domains. See the [Role Name Conventions](https://github.com/anthropics/andamio-ai-context/blob/main/01-about-andamio/Andamio%20Role%20Name%20Conventions.md) for the full naming standard.

**Course domain:** Course Owner, Course Teacher, Course Student
**Project domain:** Project Owner, Project Manager, Project Contributor

**Note:** The terms "instructor," "creator" (as a role), and "learner" are retired. Use the role names above.

### Contributors
Access Token Holders who participate in Andamio's Local States. The term "Contributor" is used broadly for all participants, though context-specific labels apply: "students" when participating in Course Local States, and "contributors" when participating in Project Local States. Contributors earn Credentials by completing Courses, which serve as on-chain prerequisites for accessing Project participation. In Projects, Contributors commit to specific tasks (code, facilitation, project management, etc.) defined by Project Owners and earn rewards upon completion.

### Course Owner
An Access Token Holder who creates and manages a Course Local State instance. Controls course structure, modules, and learning targets. Can add Course Teachers to share assessment responsibilities.

### Course Teacher
An Access Token Holder assigned to assess student work within a specific Course Local State instance. Reviews and accepts or denies student assignment submissions.

### Course Student (Student)
An Access Token Holder participating in a Course Local State. Students earn Credentials by completing course requirements, which then serve as prerequisites for accessing Project Local States. From the protocol perspective, Students and Contributors are identical - both are Access Token Holders with the same underlying capabilities.

### Project Owner
An instance-specific role assigned to Access Token Holders within individual Project Local States. When a Project Local State instance is created, one Access Token Holder is assigned as the initial Project Owner. This Project Owner can then add additional Project Owners or Project Managers to share management responsibilities for that specific project instance.

**Key Properties**:
- **Instance-scoped**: Project Owner privileges only apply within the specific project instance where assigned
- **Multi-owner support**: Multiple Project Owners can manage a single project instance collaboratively
- **On-chain privileges**: Can approve task commitments, manage Project Treasury, define task requirements
- **Not transferable across projects**: Being a Project Owner in Project A provides no privileges in Project B
- **Dual participation**: Project Owners can also participate as Contributors in their own or other projects

### Project Manager
An Access Token Holder assigned to manage day-to-day operations within a specific Project Local State instance. Reviews contributor task submissions and manages contributor workflow.

### Project Contributor (Contributor)
An Access Token Holder who participates in Project Local States. Contributors commit to specific tasks (code, facilitation, project management, etc.) defined by Project Owners and earn rewards upon completion. Contributors earn access to projects by completing Course prerequisites and earning the required Credentials.

### Project
A complete Andamio entity consisting of multiple on-chain validators including a treasury validator and escrow validators. Projects coordinate work, manage funds, and track contributions through this multi-validator architecture.

### Project Treasury
On-chain treasury validator that holds funds for projects, maintaining lists of approved work. Funds are locked into escrow validators when contributors commit to specific tasks, enabling transparent financial management and automated disbursements based on milestones.

### Prerequisites (Prereqs)
Role-specific requirements that contributors must meet to participate in certain project activities. Different prereqs can be defined for different roles (e.g., social media manager, meeting facilitator), with each set having its own escrow validator.

### Escrow Validator
Smart contract that locks specific tasks and their associated rewards from the Project Treasury when a contributor commits to work. Each set of prerequisites has its own escrow validator, ensuring contributors are paid for their committed work upon completion.

## Technical Architecture

### Protocol V2
The second major version of the Andamio Protocol smart contracts, currently undergoing audit. Introduces improvements in scalability, security, and feature set.

### Transaction API (Tx API)
RESTful API that enables developers to interact with the Andamio protocol without deep blockchain knowledge. Handles transaction building, signing, and submission.

### Transaction Sponsorship (Tx Sponsorship)
Feature allowing organizations or apps to pay blockchain transaction fees on behalf of users, removing a major barrier to Web3 adoption.

### Service Fees
Revenue mechanism where the protocol charges fees for certain operations, creating a sustainable business model for Andamio Inc.

### SDK (Software Development Kit)
Pre-built libraries in multiple languages (JavaScript, Python, Go, Rust) that make Andamio integration simple for developers. Target: integration in days, not months.

## Business & Strategy Terms

### Protocol-First
Andamio's strategic commitment (as of April 2025) to prioritize protocol development over platform features, ensuring a robust foundation for the ecosystem.

### Hollywood Model
Reference to the film industry's project-based work structure where specialized professionals rapidly form teams for specific projects. Andamio enables this model across all industries.

### Vibe-Coded Apps
Applications built primarily using AI assistance, often beautiful and functional but lacking users or business models. Andamio provides the network layer that makes these apps valuable.

### Network Value Equation
Andamio's value proposition: Instead of (Number of Users)², value = (Credential Relevance) × (User Expertise) × (Network Connections).

### Experience-Based Governance
Governance model where voting power and influence are based on proven contributions and expertise rather than token holdings or capital.

## Tokenomics

### ANT Tokens
Andamio's native tokens that function as experience points (XP), tracking contributions and enabling governance participation based on actual platform usage.

### Prosocial Framework
Economic design principles focused on creating positive-sum outcomes and preventing extractive behaviors within the Andamio ecosystem.

### Post-Extractive Economy
Andamio's vision for an economic system that fairly distributes value to contributors rather than extracting it for platform owners.

## Partnerships & Integrations

### UTXOs.dev
Strategic development partner founded by Jingles (Andamio co-founder). Provides Web3 infrastructure features like social wallet creation and transaction sponsorship.

### Mesh
Open-source provider, also founded by Jingles, focused on learning content and treasuries for open source projects. Lower priority partnership.

### Syngenta
Major agricultural corporation exploring Andamio for supply chain verification and sustainable practice credentials.

### FC Barcelona
Football club partnering with Andamio to demonstrate new forms of fan engagement and community participation.

## Organizational Structure

### Protocol Sub-Circle
Sub-circle under Development Circle focused on smart contracts and blockchain infrastructure. Led by Adrian and Nelson.

### Platform Sub-Circle
Sub-circle under Development Circle building the Andamio API, app, and developer tools. Includes Mix, Cesar, Andrew, and Roberto.

### Admin Circle
Sociocracy 3.0 circle responsible for governance, tokenomics, legal, finance, and operations.

### Development Circle
S3 circle overseeing Andamio's technical development. Includes Protocol sub-circle (smart contracts, blockchain infrastructure) and Platform sub-circle (API, app, developer tools). Responsible for product management, engineering practices, sprint delivery, and solution architecture.

### Ecosystem Circle
S3 circle focused on partnerships, marketing, community, adoption, and growth strategies.

### Sociocracy 3.0 (S3)
Governance framework used by Andamio for decentralized decision-making through consent-based processes and clearly defined circles of responsibility.

### TTT (Tuesday Team Time?)
Regular team meeting cadence for alignment and planning sessions.

## Development Milestones

### Multi-Contributor
Feature allowing multiple contributors to work on the same project with proper attribution and compensation.

### Native Assets
Support for tokens beyond ADA in project treasuries and transactions.

### Indexer
Service that makes blockchain data easily queryable for applications, essential for API functionality.

### Reference Implementation
Complete demonstration of Andamio capabilities, serving as a template for developers.

## Time Horizons & Phases

### Q3 2025 - Q2 2026: Foundation of Trust
Establishing Andamio as the essential credentialing protocol on Cardano.

### 2026-2027: The Network Effect
Growing ecosystem of organizations issuing credentials, creating a global web of trust.

### 2027-2028: The Mainstream Breakthrough
Users interact with credentials without understanding the underlying blockchain technology.

### 2028-2030: The Post-Extractive Economy
Demonstrating a viable alternative to Web2 platform economics.

## Acronyms & Abbreviations

- **API**: Application Programming Interface
- **SDK**: Software Development Kit
- **SSOI**: Self-Sovereign On-Chain Identity
- **TVL**: Total Value Locked
- **RBAC**: Role-Based Access Control
- **DAO**: Decentralized Autonomous Organization
- **CIP**: Cardano Improvement Proposal
- **CF**: Cardano Foundation
- **GTM**: Go-To-Market
- **S3**: Sociocracy 3.0 (governance framework)
- **XP**: Experience Points

## Key Phrases

### "Can I build it?" → "Will anyone care?"
The fundamental shift in the AI age that Andamio addresses - from technical capability to user relevance.

### "Protocol that makes human collaboration work in the AI age"
Andamio's positioning as infrastructure for the uniquely human layer of work as AI handles more tasks.

### "Just the right users"
Andamio's quality-over-quantity approach to network building, focusing on committed contributors rather than casual browsers.

---

## Open Questions for Team Discussion

### Andamio Network vs Andamio Protocol
The distinction between "Network" and "Protocol" remains an active strategic question. Currently both terms are used, sometimes interchangeably. This reflects a fundamental question about Andamio's identity and positioning that the team is actively working to resolve.

---

*This glossary is a living document. Terms are added and refined as the Andamio ecosystem evolves.*