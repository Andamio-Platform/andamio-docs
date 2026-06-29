import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Mermaid } from "@/components/mdx/mermaid";
import { Steps, Step } from "fumadocs-ui/components/steps";
import { Callout } from "fumadocs-ui/components/callout";
import { FlywheelDiagram } from "@/components/mdx/flywheel-diagram";
import { LinearDiagram } from "@/components/mdx/linear-diagram";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { ThemedImage } from "@/components/mdx/themed-image";
import { GuideHeader } from "@/components/mdx/guide-header";
import TreasuryVerifier from "@/components/protocol-info/TreasuryVerifier";
import BadgeAnatomyExplorer from "@/components/credential-badges/BadgeAnatomyExplorer";
import TransactionStepper from "@/components/protocol/TransactionStepper";

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: (props) => <ImageZoom {...(props as any)} />,
    Mermaid,
    FlywheelDiagram,
    LinearDiagram,
    ThemedImage,
    Steps,
    Step,
    Callout,
    GuideHeader,
    TreasuryVerifier,
    BadgeAnatomyExplorer,
    TransactionStepper,
    ...components,
  };
}
