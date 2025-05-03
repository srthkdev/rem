# REM - Research Made Accessible

REM is a powerful research paper management and analysis tool that helps researchers and students organize, analyze, and extract insights from academic papers.

## Features

- **Paper Management**: Organize and manage research papers in projects
- **ArXiv Integration**: Search and import papers directly from ArXiv
- **PDF Viewer**: Built-in PDF viewer with text highlighting capabilities
- **AI Analysis**: Get AI-powered insights, summaries, and analysis of papers
- **Flashcards**: Create and manage flashcards from paper content
- **Research Analysis**: Visualize and analyze research patterns
- **Dark Mode**: Full dark mode support for comfortable reading

## Tech Stack

- [Next.js 15](https://nextjs.org) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Drizzle ORM](https://orm.drizzle.team) - Database ORM
- [PostgreSQL](https://postgresql.org) - Database
- [TailwindCSS](https://tailwindcss.com) - Styling
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [ESLint](https://eslint.org) - Code linting
- [Prettier](https://prettier.io) - Code formatting

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rem.git
cd rem
```

2. Install dependencies:
```bash
bun install
```

3. Set up your environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/rem"
```

4. Run database migrations:
```bash
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

5. Start the development server:
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
rem/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── database/         # Database schema and configuration
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and services
│   └── styles/          # Global styles
├── public/              # Static assets
└── migrations/          # Database migrations
```

## Development

- Run development server: `bun run dev`
- Build for production: `bun run build`
- Start production server: `bun run start`
- Run linter: `bun run lint`
- Format code: `bunx prettier --write .`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)
