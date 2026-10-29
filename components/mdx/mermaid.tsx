"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "next-themes";

export function Mermaid({ chart }: { chart: string }) {
  const id = useId();
  const [svg, setSvg] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const currentChartRef = useRef<string>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    // Re-render when the theme changes too, not just the chart source.
    const renderKey = `${resolvedTheme}:${chart}`;
    if (currentChartRef.current === renderKey || !container) return;
    currentChartRef.current = renderKey;

    async function renderChart() {
      const { default: mermaid } = await import("mermaid");

      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          fontFamily: "inherit",
          themeCSS: "margin: 1.5rem auto 0;",
          theme: resolvedTheme === "dark" ? "dark" : "default",
        });
        const { svg, bindFunctions } = await mermaid.render(
          id,
          chart.replaceAll("\\n", "\n")
        );

        bindFunctions?.(container!);
        setSvg(svg);
      } catch (error) {
        console.error("Error while rendering mermaid", error);
      }
    }

    void renderChart();
  }, [chart, id, resolvedTheme]);

  // eslint-disable-next-line react/no-danger -- SVG from mermaid.render() on chart source in our own MDX, not user input
  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: svg }} />;
}
