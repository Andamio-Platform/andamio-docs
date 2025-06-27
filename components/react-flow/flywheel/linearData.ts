// Linear diagram version type
export interface LinearDiagramVersion {
  id: string;
  name: string;
  showLabels: boolean;
  content: {
    pairs: Array<{
      id: string;
      problem: { title: string; description: string };
      solution: { title: string; description: string };
      edgeLabel?: string;
    }>;
  };
}

// Multiple linear diagram versions
export const linearDiagramVersions: LinearDiagramVersion[] = [
  {
    id: "andamio-building-blocks",
    name: "Andamio Building Blocks",
    showLabels: true,
    content: {
      pairs: [
        {
          id: "purpose",
          problem: {
            title: "PURPOSE",
            description: "Do we trust that our work matters?",
          },
          solution: {
            title: "Local Infrastructure",
            description:
              "Treasury management, task governance, learning credentials, proof of work, attendance",
          },
          edgeLabel: "Defined in",
        },
        {
          id: "participation",
          problem: {
            title: "PARTICIPATION",
            description: "Do we trust the people we work with?",
          },
          solution: {
            title: "Global Connection",
            description:
              "Summary of participation on Andamio Protocol - discoverability, matching people with opportunities",
          },
          edgeLabel: "Creates artifacts for",
        },
        {
          id: "proof",
          problem: {
            title: "PROOF",
            description:
              "Do we trust that others can do what they say they can do?",
          },
          solution: {
            title: "Access Token",
            description:
              "Access to local states based on global credentials held by access token",
          },
          edgeLabel: "Portability via",
        },
      ],
    },
  },
  {
    id: "protocol-stack",
    name: "Protocol Architecture",
    showLabels: true,
    content: {
      pairs: [
        {
          id: "blockchain",
          problem: {
            title: "Distributed Trust",
            description: "Need for decentralized, verifiable infrastructure",
          },
          solution: {
            title: "Cardano Blockchain",
            description:
              "Proof-of-stake blockchain providing security and decentralization",
          },
          edgeLabel: "Secured by",
        },
        {
          id: "protocol",
          problem: {
            title: "Smart Contract Logic",
            description: "Complex business rules and validation requirements",
          },
          solution: {
            title: "Validator Scripts",
            description:
              "Global State, Assignment, Treasury, and Course validators",
          },
          edgeLabel: "Enforced by",
        },
        {
          id: "tokenization",
          problem: {
            title: "Access Control",
            description: "Need for programmable permissions and ownership",
          },
          solution: {
            title: "Access Tokens & NFTs",
            description:
              "Tokens representing credentials, permissions, and achievements",
          },
          edgeLabel: "Controlled by",
        },
        {
          id: "applications",
          problem: {
            title: "User Experience",
            description:
              "Complex blockchain interactions need simple interfaces",
          },
          solution: {
            title: "Local State Applications",
            description:
              "Course platforms, project workspaces, and collaboration tools",
          },
          edgeLabel: "Simplified by",
        },
      ],
    },
  },
  {
    id: "credential-lifecycle",
    name: "Credential Journey",
    showLabels: true,
    content: {
      pairs: [
        {
          id: "discovery",
          problem: {
            title: "Finding Opportunities",
            description:
              "Difficulty discovering relevant learning and work opportunities",
          },
          solution: {
            title: "Global State Discovery",
            description:
              "Searchable registry of courses, projects, and requirements",
          },
          edgeLabel: "Enables",
        },
        {
          id: "access",
          problem: {
            title: "Gatekeeper Bias",
            description:
              "Subjective barriers to participation and opportunity access",
          },
          solution: {
            title: "Token-Based Access",
            description:
              "Programmable requirements based on verifiable credentials",
          },
          edgeLabel: "Removes",
        },
        {
          id: "participation",
          problem: {
            title: "Proof of Work",
            description:
              "Need to demonstrate competency through actual contribution",
          },
          solution: {
            title: "Assignment Completion",
            description: "Structured tasks with clear evaluation criteria",
          },
          edgeLabel: "Validated by",
        },
        {
          id: "credentialing",
          problem: {
            title: "Vendor Lock-in",
            description: "Achievements trapped within individual platforms",
          },
          solution: {
            title: "Portable Credentials",
            description:
              "Blockchain-based credentials that work across all platforms",
          },
          edgeLabel: "Liberated by",
        },
      ],
    },
  },
  {
    id: "trust-building",
    name: "Trust Relationship Flow",
    showLabels: true,
    content: {
      pairs: [
        {
          id: "individual-trust",
          problem: {
            title: "Self-Doubt",
            description: "Uncertainty about personal capabilities and value",
          },
          solution: {
            title: "Meaningful Work",
            description:
              "Clear connection between effort and real-world impact",
          },
          edgeLabel: "Builds",
        },
        {
          id: "peer-trust",
          problem: {
            title: "Collaboration Risk",
            description: "Uncertainty about working with unknown collaborators",
          },
          solution: {
            title: "Verified Contributions",
            description:
              "Transparent record of past performance and reliability",
          },
          edgeLabel: "Reduces",
        },
        {
          id: "institutional-trust",
          problem: {
            title: "Organizational Decay",
            description:
              "Mission drift and self-serving institutional behavior",
          },
          solution: {
            title: "Transparent Governance",
            description:
              "Open decision-making and accountable resource allocation",
          },
          edgeLabel: "Prevents",
        },
        {
          id: "network-trust",
          problem: {
            title: "Scaling Relationships",
            description: "Difficulty maintaining trust as networks grow",
          },
          solution: {
            title: "Protocol Mediation",
            description:
              "Automated trust mechanisms that scale with network size",
          },
          edgeLabel: "Enables",
        },
      ],
    },
  },
  {
    id: "hollywood-model",
    name: "Hollywood Model Process",
    showLabels: true,
    content: {
      pairs: [
        {
          id: "project-inception",
          problem: {
            title: "Creative Vision",
            description:
              "Need to translate ideas into compelling collaborative projects",
          },
          solution: {
            title: "Project Definition",
            description: "Clear roles, requirements, and success criteria",
          },
          edgeLabel: "Structures",
        },
        {
          id: "team-assembly",
          problem: {
            title: "Talent Discovery",
            description:
              "Finding and attracting the right contributors for each role",
          },
          solution: {
            title: "Credential Matching",
            description:
              "Automated matching based on verified capabilities and interests",
          },
          edgeLabel: "Facilitates",
        },
        {
          id: "collaboration",
          problem: {
            title: "Coordination Challenges",
            description: "Managing diverse contributors toward shared outcomes",
          },
          solution: {
            title: "Structured Workflow",
            description: "Clear processes, milestones, and feedback mechanisms",
          },
          edgeLabel: "Organizes",
        },
        {
          id: "recognition",
          problem: {
            title: "Attribution Disputes",
            description: "Unclear or contested ownership of contributions",
          },
          solution: {
            title: "Transparent Credits",
            description:
              "Immutable record of individual contributions to collective success",
          },
          edgeLabel: "Resolves",
        },
      ],
    },
  },
  {
    id: "network-effects",
    name: "Network Growth Cycle",
    showLabels: true,
    content: {
      pairs: [
        {
          id: "individual-success",
          problem: {
            title: "Limited Opportunities",
            description:
              "Individuals constrained by local networks and opportunities",
          },
          solution: {
            title: "Global Network Access",
            description:
              "Platform connecting talent with opportunities worldwide",
          },
          edgeLabel: "Expands",
        },
        {
          id: "project-success",
          problem: {
            title: "Resource Constraints",
            description: "Projects limited by available talent and funding",
          },
          solution: {
            title: "Networked Resources",
            description: "Access to global talent pool and distributed funding",
          },
          edgeLabel: "Unlocks",
        },
        {
          id: "ecosystem-growth",
          problem: {
            title: "Platform Adoption",
            description:
              "Chicken-and-egg problem of attracting both talent and projects",
          },
          solution: {
            title: "Flywheel Momentum",
            description:
              "Success stories create positive feedback loops driving growth",
          },
          edgeLabel: "Generates",
        },
        {
          id: "system-resilience",
          problem: {
            title: "Single Points of Failure",
            description:
              "Centralized systems vulnerable to disruption and control",
          },
          solution: {
            title: "Distributed Protocol",
            description:
              "Decentralized infrastructure resistant to capture and censorship",
          },
          edgeLabel: "Ensures",
        },
      ],
    },
  },
];
