# Andamio Glossary

A reference guide for key terms, concepts, and acronyms used throughout Andamio documentation.

## Core Protocol Concepts

### Access Token (Andamio Access Token)
The primary authentication mechanism for the Andamio network. A cryptographically secure token that allows users to carry their verified identity, credentials, and reputation across different applications. Functions like "HTTPS for professional identity." The Access Token contains the on-chain datum that stores a user's SSOI data.

### Self-Sovereign On-Chain Identity (SSOI)
Andamio's implementation of self-sovereign identity on Cardano. The SSOI data is stored on-chain in the Access Token datum, and only the owner of the wallet holding the Access Token can authorize transactions that update their SSOI. This ensures users have complete control over their professional identity and credentials. Andamio aims to establish SSOI as a Cardano Improvement Proposal (CIP) standard.

### Credentials
Cryptographically verified attestations of skills, achievements, or qualifications issued through the Andamio protocol. Unlike self-declared qualifications, these are on-chain verifiable and portable across platforms. Credentials earned by completing Courses serve as prerequisites for accessing Project Local States, enabling permissionless credential sharing across the network.

### Local State
Custom logic and rules specific to individual applications or organizations built on Andamio. The two main types are Course Local States (where participants are called "students") and Project Local States (where participants are called "contributors"). Local states allow apps to define their own governance models, requirements, and business logic while still participating in the global network.

### Global State
The shared, protocol-level state that all Andamio applications can access. Contains universal credentials, reputation scores, and cross-platform data that creates network effects.

### Validators
Smart contracts that enforce the rules of the Andamio protocol. Includes both Global State Validators (protocol-wide rules) and Local State Validators (app-specific rules).

### Contributors
Access Token Holders who participate in Andamio's Local States. The term "Contributor" is used broadly for all participants, though context-specific labels apply: "students" when participating in Course Local States, and "contributors" when participating in Project Local States. Contributors earn Credentials by completing Courses, which serve as on-chain prerequisites for accessing Project participation. In Projects, Contributors commit to specific tasks (code, facilitation, project management, etc.) defined by Project Creators and earn rewards upon completion.

### Student
A Contributor participating in a Course Local State. Students earn Credentials by completing course requirements, which then serve as prerequisites for accessing Project Local States. From the protocol perspective, Students and Contributors are identical - both are Access Token Holders with the same underlying capabilities.

### Project Creator
An Access Token Holder with special privileges within Project Local States. Project Creators define task descriptions, approve task completions and reward amounts in the on-chain Project Treasury, and can add funds to Project Treasuries. Only Project Creators can approve tasks on the Andamio Project Protocol. Project Creators can also participate as Contributors in their own or other projects.

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

### Protocol Circle
Development team focused on smart contracts and blockchain infrastructure. Led by Adrian and Nelson.

### Platform Circle
Team building the Andamio API, app, and developer tools. Includes Mix, Cesar, Andrew, and Roberto.

### Development Circle
Broader development organization including both Protocol and Platform teams plus solution architects.

### Admin Circle
Sociocracy 3.0 circle responsible for governance, tokenomics, legal, finance, and operations.

### Development Circle
S3 circle overseeing protocol, platform, API, SDK, and technical architecture. Includes both Protocol and Platform sub-circles.

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