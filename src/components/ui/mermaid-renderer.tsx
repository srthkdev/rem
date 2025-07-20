
"use client";

import mermaid from "mermaid";
import { useEffect, useState } from "react";

mermaid.initialize({ startOnLoad: false, theme: "neutral" });

// Helper function to fix flowchart syntax
function fixFlowchartSyntax(syntax: string): string {
  // Remove non-printable characters except newlines and tabs
  let cleaned = syntax.replace(/[^\x20-\x7E\n\r\t]/g, '');

  // Split into lines and process
  const lines = cleaned.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // Ensure we have a proper flowchart declaration
  let firstLine = lines[0];
  if (!firstLine.startsWith('flowchart')) {
    firstLine = 'flowchart TD';
  }

  // Get the content after the flowchart declaration
  let content = lines.slice(1).join(' ').trim();

  // If content is empty or doesn't have arrows, use fallback
  if (!content || !content.includes('-->')) {
    return `${firstLine}\nA[Start] --> B[Process]\nB --> C[End]`;
  }

  // Parse the content to extract nodes and connections
  // Look for pattern: NodeID[Label] --> NodeID[Label] --> ...
  const nodeConnections = [];

  // Split by arrows first to get the flow
  const segments = content.split('-->').map(s => s.trim());

  for (let i = 0; i < segments.length - 1; i++) {
    let fromNode = segments[i];
    let toNode = segments[i + 1];

    // Extract the last node from the 'from' segment (in case there are multiple nodes)
    const fromMatch = fromNode.match(/([A-Z]\d*)\[([^\]]+)\](?!.*[A-Z]\d*\[)/);
    if (fromMatch) {
      fromNode = `${fromMatch[1]}[${fromMatch[2]}]`;
    } else {
      fromNode = `N${i}[Step ${i + 1}]`;
    }

    // Extract the first node from the 'to' segment
    const toMatch = toNode.match(/([A-Z]\d*)\[([^\]]+)\]/);
    if (toMatch) {
      toNode = `${toMatch[1]}[${toMatch[2]}]`;
    } else {
      toNode = `N${i + 1}[Step ${i + 2}]`;
    }

    nodeConnections.push(`${fromNode} --> ${toNode}`);
  }

  // If we couldn't parse properly, create a simple fallback
  if (nodeConnections.length === 0) {
    return `${firstLine}\nA[Start] --> B[Process]\nB --> C[End]`;
  }

  return `${firstLine}\n${nodeConnections.join('\n')}`;
}

// Helper function to fix mindmap syntax
function fixMindmapSyntax(syntax: string): string {
  let cleaned = syntax.replace(/[^\x20-\x7E\n\r\t]/g, '');

  // If it's all on one line, we need to restructure it
  if (!cleaned.includes('\n') || cleaned.split('\n').length <= 2) {
    let content = cleaned.replace('mindmap', '').trim();

    // Look for root pattern first
    const rootMatch = content.match(/root\(\(([^)]+)\)\)/);
    let root = 'Research';
    if (rootMatch) {
      root = rootMatch[1];
      content = content.replace(rootMatch[0], '').trim();
    }

    const words = content.split(/\s+/).filter(w => w.length > 0);
    const branches = words.slice(0, 6); // Limit to 6 branches

    let result = `mindmap\n  root((${root}))`;
    branches.forEach(branch => {
      result += `\n    ${branch}`;
    });

    return result;
  }

  return cleaned;
}

// Helper function to fix timeline syntax
function fixTimelineSyntax(syntax: string): string {
  let cleaned = syntax.replace(/[^\x20-\x7E\n\r\t]/g, '');

  // If it's all on one line, we need to restructure it
  if (!cleaned.includes('\n') || cleaned.split('\n').length <= 2) {
    const content = cleaned.replace('timeline', '').trim();
    const words = content.split(/\s+/);

    let result = 'timeline\n    title Research Process';

    // Create simple timeline entries
    const phases = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'];
    const actions = words.slice(0, 4);

    for (let i = 0; i < Math.min(phases.length, actions.length); i++) {
      result += `\n    ${phases[i]} : ${actions[i]}`;
    }

    return result;
  }

  return cleaned;
}

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

        // Clean and validate the syntax before rendering
        let cleanedSyntax = syntax.trim();

        // If syntax doesn't start with a valid Mermaid diagram type, add flowchart
        if (!cleanedSyntax.match(/^(flowchart|graph|mindmap|timeline|gitgraph|pie|journey|gantt|classDiagram|stateDiagram|erDiagram|sequenceDiagram)/)) {
          cleanedSyntax = `flowchart TD\n${cleanedSyntax}`;
        }

        // Handle different diagram types
        if (cleanedSyntax.startsWith('flowchart')) {
          cleanedSyntax = fixFlowchartSyntax(cleanedSyntax);
        } else if (cleanedSyntax.startsWith('mindmap')) {
          cleanedSyntax = fixMindmapSyntax(cleanedSyntax);
        } else if (cleanedSyntax.startsWith('timeline')) {
          cleanedSyntax = fixTimelineSyntax(cleanedSyntax);
        }

        const { svg } = await mermaid.render("mermaid-graph", cleanedSyntax);
        setSvg(svg);
      } catch (error) {
        console.error("Failed to render mermaid diagram:", error);
        console.error("Syntax that failed:", syntax);

        // Try to render a fallback diagram
        try {
          const fallbackSyntax = `flowchart TD
    A[Research Paper] --> B[Analysis]
    B --> C[Results]
    C --> D[Conclusions]`;
          const { svg } = await mermaid.render("mermaid-graph-fallback", fallbackSyntax);
          setSvg(svg);
          setError('Original diagram had syntax errors. Showing simplified version.');
        } catch (fallbackError) {
          setError('Failed to render diagram. Please try regenerating.');
        }
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
