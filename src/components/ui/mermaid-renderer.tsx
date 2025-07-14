
"use client";

import mermaid from "mermaid";
import { useEffect, useState } from "react";

mermaid.initialize({ startOnLoad: false, theme: "neutral" });

interface MermaidRendererProps {
  syntax: string;
}

export function MermaidRenderer({ syntax }: MermaidRendererProps) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    async function renderDiagram() {
      try {
        const { svg } = await mermaid.render("mermaid-graph", syntax);
        setSvg(svg);
      } catch (error) {
        console.error("Failed to render mermaid diagram:", error);
      }
    }
    if (syntax) {
      renderDiagram();
    }
  }, [syntax]);

  if (!svg) {
    return <div>Loading diagram...</div>;
  }

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
