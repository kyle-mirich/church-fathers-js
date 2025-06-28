This project is a Next.js application built with React, TypeScript, and Tailwind CSS. It utilizes Radix UI for accessible UI components and Prisma as an ORM for database interactions.

Here's a breakdown of the key directories and files:

*   **`app/`**: This directory contains the core application logic for Next.js.
    *   `globals.css`: Global CSS styles for the application.
    *   `layout.tsx`: The root layout component for the application.
    *   `page.tsx`: The main page component.
    *   `api/`: Contains API routes for the Next.js backend.
        *   `highlights/`, `notes/`, `reader-data/`: Specific API endpoints for managing highlights, notes, and reader data.
*   **`components/`**: Houses reusable React components.
    *   `theme-provider.tsx`: Component for managing application themes.
    *   `highlights/`, `reader/`: Components specific to highlights and the reader functionality.
    *   `ui/`: Contains UI components, likely built using Radix UI and styled with Tailwind CSS (e.g., `button.tsx`, `dialog.tsx`, `input.tsx`).
*   **`hooks/`**: Custom React hooks for encapsulating reusable logic.
    *   `use-mobile.tsx`, `use-toast.ts`: Examples of custom hooks.
*   **`lib/`**: Utility functions and configurations.
    *   `utils.ts`: General utility functions.
    *   `generated/prisma/`: Contains Prisma client and related generated files for database access.
*   **`prisma/`**: Prisma schema and migrations for database management.
    *   `migrations/`: Database migration files.
    *   `schema.prisma`: Defines the database schema and models.
*   **`public/`**: Static assets served directly by Next.js (e.g., images, fonts).
    *   `placeholder-logo.png`, `works/`: Examples of static assets.
*   **`styles/`**: Additional stylesheets.
    *   `globals.css`: Potentially more global styles or overrides.
*   **Root Files**:
    *   `package.json`: Project metadata, scripts, and dependencies.
    *   `next.config.mjs`: Next.js configuration file.
    *   `tailwind.config.ts`: Tailwind CSS configuration.
    *   `tsconfig.json`: TypeScript configuration.
    *   `pnpm-lock.yaml`: Lock file for pnpm package manager.

This structure follows common conventions for Next.js applications, separating concerns into logical directories for better organization and maintainability.