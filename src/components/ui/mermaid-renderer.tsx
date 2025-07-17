
"use client";

import mermaid from "mermaid";
import { useEffect, useState } from "react";

mermaid.initialize({ startOnLoad: false, theme: "neutral" });

interface MermaidRendererProps {
  syntax?: string | null;
}

export function MermaidRenderer({ syntax }: MermaidRendererProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function renderDiagram() {
      if (!syntax || syntax.trim() === '') {
        setError('No diagram syntax provided');
        return;
      }
      
      try {
        setError(null);
        const { svg } = await mermaid.render("mermaid-graph", syntax);
        setSvg(svg);
      } catch (error) {
        console.error("Failed to render mermaid diagram:", error);
        setError('Failed to render diagram');
      }
    }
    renderDiagram();
  }, [syntax]);

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  if (!svg) {
    return <div className="text-gray-500 text-sm">Loading diagram...</div>;
  }

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
