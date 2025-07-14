
import { projects } from "@/database/schema";

interface InsightsViewProps {
  project: typeof projects.$inferSelect;
}

export function InsightsView({ project }: InsightsViewProps) {
  const codeSnippets = project.extractedCodeSnippets as { description: string, code: string }[] | null;
  const references = project.extractedReferences as { title: string, url: string }[] | null;

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Code Snippets</h3>
        {codeSnippets && codeSnippets.length > 0 ? (
          <div className="space-y-4">
            {codeSnippets.map((snippet, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{snippet.description}</p>
                <pre className="bg-gray-200 dark:bg-gray-900 p-2 rounded text-sm overflow-x-auto">
                  <code>{snippet.code}</code>
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <p>No code snippets extracted.</p>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">References</h3>
        {references && references.length > 0 ? (
          <ul className="space-y-2">
            {references.map((ref, index) => (
              <li key={index}>
                <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {ref.title}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No references extracted.</p>
        )}
      </div>
    </div>
  );
}
