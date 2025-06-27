// Diagram version type
export interface DiagramVersion {
  id: string;
  name: string;
  showLabels: boolean;
  content: {
    solutions?: {
      one: { title: string; description: string };
      two: { title: string; description: string };
      three: { title: string; description: string };
    };
    problems?: {
      oneToTwo: { title: string; description: string };
      twoToThree: { title: string; description: string };
      threeToOne: { title: string; description: string };
    };
    edgeLabels?: {
      solutionToConnection?: {
        oneToTwo: string;
        twoToThree: string;
        threeToOne: string;
      };
      flywheelFeedback?: {
        oneToTwo: string;
        twoToThree: string;
        threeToOne: string;
      };
    };
  };
}

// Multiple diagram versions
export const diagramVersions: DiagramVersion[] = [
  {
    id: "original",
    name: "Andamio Flywheel",
    showLabels: true,
    content: {
      solutions: {
        one: {
          title: "Local State",
          description:
            "Organizations can onboard contributors to specific projects.",
        },
        two: {
          title: "Global State",
          description:
            "Web3 authentication and access control enables trusted participation in project governance and treasury decisions.",
        },
        three: {
          title: "Access Token",
          description:
            "Shared infrastructure for tracking contributions, coordinating action, and building portable reputation across the network.",
        },
      },
      problems: {
        oneToTwo: {
          title: "Purpose",
          description: "Do we trust that our work matters?",
        },
        twoToThree: {
          title: "Participation",
          description: "Do we trust the people we work with?",
        },
        threeToOne: {
          title: "Proof",
          description:
            "Do we trust that others can do what they say they can do?",
        },
      },
      edgeLabels: {
        solutionToConnection: {
          oneToTwo:
            "How can I connect to specific opportunities that matter to me?",
          twoToThree: "How can I share a record of my experience?",
          threeToOne: "How can I access new opportunities?",
        },
        flywheelFeedback: {
          oneToTwo: "Build collaborative trust",
          twoToThree: "Create measurable impact",
          threeToOne: "Expand your network",
        },
      },
    },
  },
  {
    id: "simplified",
    name: "Simplified Learning Flow",
    showLabels: true,
    content: {
      solutions: {
        one: {
          title: "Learning Platform",
          description: "Interactive courses and skill development pathways.",
        },
        two: {
          title: "Project Workspace",
          description:
            "Collaborative environment for building real-world projects with mentorship and resources.",
        },
        three: {
          title: "Achievement System",
          description:
            "Recognition and credentials that validate learning progress and project contributions.",
        },
      },
      problems: {
        oneToTwo: {
          title: "Engagement",
          description:
            "How do we transition learners from consuming content to actively building projects?",
        },
        twoToThree: {
          title: "Assessment",
          description:
            "How do we fairly evaluate and recognize diverse contributions and learning outcomes?",
        },
        threeToOne: {
          title: "Progression",
          description:
            "How do achievements unlock access to advanced learning opportunities and expert networks?",
        },
      },
      edgeLabels: {
        solutionToConnection: {
          oneToTwo: "Apply knowledge in practice",
          twoToThree: "Demonstrate competency",
          threeToOne: "Advance to new challenges",
        },
        flywheelFeedback: {
          oneToTwo: "Reinforce learning concepts",
          twoToThree: "Build portfolio evidence",
          threeToOne: "Expand learning network",
        },
      },
    },
  },
  {
    id: "problems-only",
    name: "Problem Analysis",
    showLabels: true,
    content: {
      problems: {
        oneToTwo: {
          title: "Skills Gap",
          description:
            "How do we identify and bridge the gap between current capabilities and project requirements?",
        },
        twoToThree: {
          title: "Resource Allocation",
          description:
            "How do we efficiently distribute limited resources across multiple competing priorities?",
        },
        threeToOne: {
          title: "Quality Assurance",
          description:
            "How do we maintain high standards while scaling operations and increasing throughput?",
        },
      },
      edgeLabels: {
        flywheelFeedback: {
          oneToTwo: "Compound complexity",
          twoToThree: "Create bottlenecks",
          threeToOne: "Increase pressure",
        },
      },
    },
  },
  {
    id: "solutions-only",
    name: "Solution Framework",
    showLabels: true,
    content: {
      solutions: {
        one: {
          title: "Modular Architecture",
          description:
            "Flexible, scalable system design that adapts to changing requirements.",
        },
        two: {
          title: "Automation Pipeline",
          description:
            "Streamlined processes that reduce manual overhead and increase consistency.",
        },
        three: {
          title: "Analytics Dashboard",
          description:
            "Real-time insights and metrics that enable data-driven decision making.",
        },
      },
      edgeLabels: {
        flywheelFeedback: {
          oneToTwo: "Enable efficiency",
          twoToThree: "Generate insights",
          threeToOne: "Inform improvements",
        },
      },
    },
  },
  {
    id: "hollywood-model",
    name: "Hollywood Model",
    showLabels: false,
    content: {
      problems: {
        oneToTwo: {
          title: "Purpose",
          description: "Make a movie",
        },
        twoToThree: {
          title: "Participation",
          description: "Many different roles are needed to make a movie.",
        },
        threeToOne: {
          title: "Proof",
          description: "Your name is in the credits!",
        },
      },
      edgeLabels: {
        flywheelFeedback: {
          oneToTwo: "Need to build a team",
          twoToThree: "Make the movie",
          threeToOne: "Look for the next project",
        },
      },
    },
  },
  {
    id: "hollywood-model-problems",
    name: "Hollywood Model with Problems",
    showLabels: true,
    content: {
      problems: {
        oneToTwo: {
          title: "Purpose",
          description: "Goal is to make a movie",
        },
        twoToThree: {
          title: "Participation",
          description: "Many different roles are needed to make a movie.",
        },
        threeToOne: {
          title: "Proof",
          description:
            "Everyone gets credit for their work, and has a network of collaborators.",
        },
      },
      solutions: {
        one: {
          title: "Write a great script",
          description: "Attracting people to the project.",
        },
        two: {
          title: "Organize a team",
          description: "Many different roles are needed to make a movie.",
        },
        three: {
          title: "Many different roles are needed to make a movie.",
          description: "Many different roles are needed to make a movie.",
        },
      },
      edgeLabels: {
        flywheelFeedback: {
          oneToTwo: "Use the story to build the team",
          twoToThree: "We need to build a team",
          threeToOne: "Look for the next project",
        },
        solutionToConnection: {
          oneToTwo: "Need a story that attracts people",
          twoToThree: "Make the movie",
          threeToOne: "Look for the next project",
        },
      },
    },
  },
];
