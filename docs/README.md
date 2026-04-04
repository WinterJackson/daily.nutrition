# Edwak Nutrition Developer Documentation

Welcome to the internal engineering documentation for the **Edwak Nutrition** platform. This directory contains an exhaustive, line-by-line detailed mapping of the repository's architecture, security logic, database constraints, and deployment targets.

## Documentation Index

Please consult the requisite document depending on your operational scope.

| Guide | Purpose & Scope |
| :--- | :--- |
| [**Architecture Overview**](./ARCHITECTURE.md) | Maps the Next.js App Router boundaries, Middleware execution paths, Server Actions, and overall structural design. Read this to understand how data flows across the system. |
| [**Security Map**](./SECURITY.md) | Details the Zero Open Registration model, the dual-validation JWT edge check algorithm, AES-256-GCM configurations, and API Rate Limit windows. Read this before modifying any auth or sensitive boundaries. |
| [**Database Schema**](./DATABASE.md) | Deconstructs the Prisma `schema.prisma` file, specifically the 5 core data domains: IAM, Bookings Pipeline, AI CMS engine, Inquiries CRM, and dynamic Site Settings. |
| [**Deployment & CI/CD**](./DEPLOYMENT.md) | Explicit instructions mapping Vercel Edge configurations, managing critical environmental secrets natively, and configuring the required CRON jobs for background tasks. |

## Quick Architectural Tenets

If you are contributing to this codebase, you must adhere to the following tenets:
1. **Zero Raw SQL**: All data interactions must route via Prisma ORM for explicit typing.
2. **Server Actions Required**: Refrain from creating legacy Next.js `/api/` endpoints unless necessary for external webhooks. Use restricted `@/app/actions` for all internal React mutations.
3. **No Unencrypted Keys in DB**: API keys (Resend, Cloudinary, etc.) mapped through the `SettingsClient` must run through `lib/encryption.ts` prior to PostgreSQL write operations. 
