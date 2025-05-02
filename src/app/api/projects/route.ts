import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

// Validation schema for project creation
const createProjectSchema = z.object({
    title: z.string(),
    arxivId: z.string(),
    abstract: z.string(),
    authors: z.array(z.string()),
    pdfUrl: z.string().url(),
    publishedDate: z.string(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // Validate request body
        const validatedData = createProjectSchema.parse(body);
        
        // In a real app, you would save this to a database
        // For now, we'll just return a mock response
        const project = {
            id: uuidv4(),
            ...validatedData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        );
    }
} 