interface CreateProjectInput {
  title: string;
  arxivId: string;
  abstract: string;
  authors: string[];
  pdfUrl: string;
  publishedDate: string;
}

interface Project {
  id: string;
  title: string;
  arxivId: string;
  abstract: string;
  authors: string[];
  pdfUrl: string;
  publishedDate: string;
  createdAt: string;
  updatedAt: string;
}

export async function createProject(
  input: CreateProjectInput,
): Promise<Project> {
  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("Failed to create project");
    }

    const project = await response.json();
    return project;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}
