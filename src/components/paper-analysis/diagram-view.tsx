
import { projects } from "@/database/schema";
import { MermaidRenderer } from "@/components/ui/mermaid-renderer";

interface DiagramViewProps {
  project: typeof projects.$inferSelect;
}

export function DiagramView({ project }: DiagramViewProps) {
  return (
    <div className="p-4">
      {project.diagramSyntax ? (
        <MermaidRenderer syntax={project.diagramSyntax} />
      ) : (
        <p>No diagram available.</p>
      )}
    </div>
  );
}
