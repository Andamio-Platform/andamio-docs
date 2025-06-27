import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Mermaid } from "@/components/mdx/mermaid";
import { Steps, Step } from "fumadocs-ui/components/steps";
import { ValidatorDiagram } from "@/components/mdx/validator-diagram";
import { FlywheelDiagram } from "@/components/mdx/flywheel-diagram";
import { LinearDiagram } from "@/components/mdx/linear-diagram";
import { APIPage } from "fumadocs-openapi/ui";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { openapi } from "@/lib/source";

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: (props) => <ImageZoom {...(props as any)} />,
    Mermaid,
    ValidatorDiagram,
    FlywheelDiagram,
    LinearDiagram,
    APIPage: (props) => <APIPage {...openapi.getAPIPageProps(props)} />,
    Steps,
    Step,
    ...components,
  };
}
